import { Camera, Cartesian3, DeveloperError, Ellipsoid, EllipsoidalOccluder, Scene, SceneMode, Viewer } from "cesium"
import { Earth } from "components/Earth"
import { Utils } from "utils"

export namespace Covering {
  export type AnchorPosition = "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT"

  export type Data<T> = {
    title: string
    content: string
    position: Cartesian3
    reference: HTMLDivElement
    tail: SVGElement
    data?: T
    callback: () => void
  }

  /**
   * @property [id] 覆盖物ID
   * @property [customize = false] 是否自定义实现
   * @property [reference] 引用实例，自定义实现时必填
   * @property [className] 实例类名，自定义实现时失效
   * @property [title] 标题，自定义实现时失效
   * @property [content] 内容，自定义实现时失效
   * @property [data] 附加数据
   * @property [anchorPosition = "TOP_LEFT"] 覆盖物锚点方位
   * @property [connectionLine = true] 连接线，拖拽禁用时连接线将始终隐藏
   * @property [closeable = true] 覆盖物是否可关闭
   * @property [follow = true] 覆盖物是否跟随锚定位置移动，拖拽禁用时将总是跟随
   * @property [lineStroke = "rgba(43, 44, 47, 0.8)"] 连接线颜色
   * @property position {@link Cartesian3} 位置
   */
  export type AddParam<T> = {
    id?: string
    customize?: boolean
    reference?: HTMLDivElement
    className?: string[]
    title?: string
    content?: string
    data?: T
    anchorPosition?: AnchorPosition
    connectionLine?: boolean
    closeable?: boolean
    follow?: boolean
    lineStroke?: string
    position: Cartesian3
  }

  export type SetParam<T> = Partial<Pick<AddParam<T>, "position" | "title" | "content" | "data">>
}

/**
 * @description 自定义覆盖物
 * @param earth {@link Earth} 地球实例
 * @example
 * ```
 * const earth = useEarth
 * const cover = new Covering(earth)
 * ```
 */
export class Covering<T = unknown> {
  private viewer: Viewer
  private scene: Scene
  private camera: Camera
  private cache: Map<string, Covering.Data<T>> = new Map()
  private draggable: boolean = false
  private destroyed: boolean = false

  constructor(earth: Earth) {
    this.viewer = earth.viewer
    this.scene = earth.scene
    this.camera = earth.camera
  }

  private createConnectionLine(param: {
    x1: number
    x2: number
    y1: number
    y2: number
    opacity: number
    stroke?: string
  }) {
    const stroke = param.stroke ?? "rgba(43, 44, 47, 0.8)"
    return `
      <line 
        id="line"
        x1="${param.x1}"
        y1="${param.y1}"
        x2="${param.x2}"
        y2="${param.y2}"
        opacity="${param.opacity}"
        stroke="${stroke}"
        stroke-width="1"
      />`
  }

  private createCallback({
    id,
    reference,
    lineStroke,
    tail,
    tailLast,
    position,
    anchorPosition,
    connectionLine,
    follow,
  }: {
    id: string
    reference: HTMLDivElement
    tail: SVGSVGElement
    tailLast: { x: number; y: number }
    lineStroke: string
    position: Cartesian3
    anchorPosition: Covering.AnchorPosition
    connectionLine: boolean
    follow: boolean
  }) {
    let left: number = 0
    let top: number = 0
    if (anchorPosition === "BOTTOM_LEFT") {
      left = 0
      top = -reference.clientHeight
    } else if (anchorPosition === "BOTTOM_RIGHT") {
      left = -reference.clientWidth
      top = -reference.clientHeight
    } else if (anchorPosition === "TOP_LEFT") {
      left = 0
      top = 0
    } else if (anchorPosition === "TOP_RIGHT") {
      left = -reference.clientWidth
      top = 0
    }
    const canvasCoordinate = this.scene.cartesianToCanvasCoordinates(position)
    const refLeft = canvasCoordinate.x + left
    const refTop = canvasCoordinate.y + top
    tail.style.width = `${this.scene.canvas.width}px`
    tail.style.height = `${this.scene.canvas.height}px`
    tail.style.position = "absolute"
    tail.style.pointerEvents = "none"
    tail.style.left = `0px`
    tail.style.top = `0px`
    tailLast.x = refLeft + reference.clientWidth / 2
    tailLast.y = refTop + reference.clientHeight / 2
    tail.innerHTML = this.createConnectionLine({
      x1: canvasCoordinate.x,
      y1: canvasCoordinate.y,
      x2: tailLast.x,
      y2: tailLast.y,
      opacity: this.draggable ? (connectionLine ? 1 : 0) : 0,
      stroke: lineStroke,
    })
    let initialize = true
    const lastPosition = { x: canvasCoordinate.x, y: canvasCoordinate.y }
    return () => {
      let _position: Cartesian3
      if (initialize) {
        _position = position
      } else {
        const ent = this.cache.get(id)
        _position = ent!.position
      }
      const canvasCoordinate = this.scene.cartesianToCanvasCoordinates(_position)
      const moveX = canvasCoordinate.x - lastPosition.x
      const moveY = canvasCoordinate.y - lastPosition.y
      lastPosition.x = canvasCoordinate.x
      lastPosition.y = canvasCoordinate.y
      if (!this.draggable) {
        const refLeft = canvasCoordinate.x + left
        const refTop = canvasCoordinate.y + top
        tailLast.x = refLeft + reference.clientWidth / 2
        tailLast.y = refTop + reference.clientHeight / 2
        reference.style.left = `${refLeft}px`
        reference.style.top = `${refTop}px`
      } else if (follow) {
        let refLeft = parseFloat(reference.style.getPropertyValue("left").slice(0, -2)) + moveX
        let refTop = parseFloat(reference.style.getPropertyValue("top").slice(0, -2)) + moveY
        if (refLeft < 0) {
          refLeft = 0
        } else if (refLeft > this.scene.canvas.width - reference.clientWidth) {
          refLeft = this.scene.canvas.width - reference.clientWidth
        }
        if (refTop < 0) {
          refTop = 0
        } else if (refTop > this.scene.canvas.height - reference.clientHeight) {
          refTop = this.scene.canvas.height - reference.clientHeight
        }
        tailLast.x = refLeft + reference.clientWidth / 2
        tailLast.y = refTop + reference.clientHeight / 2
        reference.style.left = `${refLeft}px`
        reference.style.top = `${refTop}px`
      }
      if (initialize) {
        reference.style.left = `${refLeft}px`
        reference.style.top = `${refTop}px`
        initialize = false
      }
      tail.innerHTML = this.createConnectionLine({
        x1: canvasCoordinate.x,
        y1: canvasCoordinate.y,
        x2: tailLast.x,
        y2: tailLast.y,
        opacity: this.draggable ? (connectionLine ? 1 : 0) : 0,
        stroke: lineStroke,
      })
      const cameraOccluder = new EllipsoidalOccluder(Ellipsoid.WGS84, this.camera.position)
      if (
        canvasCoordinate.x < 0 ||
        canvasCoordinate.y < 0 ||
        canvasCoordinate.x > this.scene.canvas.clientWidth ||
        canvasCoordinate.y > this.scene.canvas.clientHeight ||
        (this.scene.mode === SceneMode.SCENE3D && !cameraOccluder.isPointVisible(_position))
      ) {
        reference.style.display = "none"
        tail.style.opacity = "0"
      } else {
        reference.style.display = "flex"
        tail.style.opacity = connectionLine ? "1" : "0"
      }
    }
  }

  /**
   * @description 设置覆盖物是否可拖拽
   * @param value 是否启用可拖拽
   */
  public setDraggable(value: boolean) {
    this.draggable = value
  }

  /**
   * @description 新增覆盖物
   * @param param {@link Covering.AddParam} 参数
   * @exception Reference element is required when customizing.
   * @example
   * ```
   * const earth = useEarth
   * const cover = new Covering(earth)
   *
   * //custom
   * cover.add({
   *  customize: true,
   *  reference: customDivElement,
   * })
   *
   * //default
   * cover.add({
   *  customize: false,
   *  className = ["default-covering"],
   *  title = "Title",
   *  content = "Content",
   * })
   * ```
   */
  public add({
    id = Utils.RandomUUID(),
    customize = false,
    className = [],
    title = "",
    content = "",
    anchorPosition = "TOP_LEFT",
    connectionLine = true,
    closeable = true,
    follow = true,
    lineStroke = "rgba(43, 44, 47, 0.8)",
    reference,
    position,
    data,
  }: Covering.AddParam<T>) {
    //TODO reference can also accept type of html string
    if (customize) {
      if (!reference) {
        throw new DeveloperError("Reference element is required when customizing.")
      }
    } else {
      className.push("covering-container")
      reference = document.createElement("div")
      const titleDiv = document.createElement("div")
      const contentDiv = document.createElement("div")
      reference.classList.add(...className)
      titleDiv.classList.add("covering-title")
      contentDiv.classList.add("covering-content")
      titleDiv.innerHTML = title
      contentDiv.innerHTML = content
      reference.appendChild(titleDiv)
      reference.appendChild(contentDiv)
    }
    if (closeable) {
      const close = document.createElement("div")
      reference.appendChild(close)
      close.classList.add("covering-btn")
      close.innerHTML = "X"
      close.addEventListener("click", () => {
        this.remove(id)
      })
    }
    const tail = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    this.viewer.container.appendChild(reference)
    this.viewer.container.appendChild(tail)
    reference.style.position = "absolute"
    reference.draggable = false
    const tailLast = { x: 0, y: 0 }
    reference.addEventListener("mousedown", (event: MouseEvent) => {
      if (!this.draggable) return
      let downX = event.clientX
      let downY = event.clientY
      const onReferenceMove = (ev: MouseEvent) => {
        const moveX = ev.clientX
        const moveY = ev.clientY
        const offsetX = moveX - downX
        const offsetY = moveY - downY
        downX = moveX
        downY = moveY
        const lastLeft = parseFloat(reference.style.getPropertyValue("left").slice(0, -2))
        const lastTop = parseFloat(reference.style.getPropertyValue("top").slice(0, -2))
        if (
          lastLeft + offsetX <= 0 ||
          lastTop + offsetY <= 0 ||
          lastLeft + offsetX + reference.clientWidth >= this.scene.canvas.width ||
          lastTop + offsetY + reference.clientHeight >= this.scene.canvas.height
        ) {
          return
        }
        tailLast.x = lastLeft + reference.clientWidth / 2
        tailLast.y = lastTop + reference.clientHeight / 2
        reference.style.left = `${lastLeft + offsetX}px`
        reference.style.top = `${lastTop + offsetY}px`
      }
      document.addEventListener("mousemove", onReferenceMove)
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", onReferenceMove)
      })
    })
    const callback = this.createCallback({
      id,
      reference,
      lineStroke,
      tail,
      tailLast,
      position,
      anchorPosition,
      connectionLine,
      follow,
    })
    this.scene.preRender.addEventListener(callback)
    this.cache.set(id, { title, content, position, reference, tail, data, callback })
  }

  /**
   * @description 按ID设置覆盖物的属性
   * @param id ID
   * @param param {@link Covering.SetParam} 参数
   * @returns
   */
  public set(id: string, { position, title, content, data }: Covering.SetParam<T>) {
    const cover = this.cache.get(id)
    if (!cover) return
    if (position) cover.position = position
    if (title) cover.title = title
    if (content) cover.content = content
    if (data) {
      if (cover.data instanceof Object) {
        Object.assign(cover.data, data)
      } else {
        cover.data = data
      }
    }
  }

  /**
   * @description 按ID查看覆盖物是否存在
   * @param id ID
   * @returns 是否存在覆盖物
   */
  public has(id: string) {
    return this.cache.has(id)
  }

  /**
   * @description 获取附加数据
   * @param id ID
   */
  public getData(id: string): T | undefined {
    return this.cache.get(id)?.data
  }

  /**
   * @description 移除所有覆盖物
   */
  public remove(): void
  /**
   * @description 按ID移除覆盖物
   * @param id ID
   */
  public remove(id: string): void
  public remove(id?: string) {
    if (id) {
      const ent = this.cache.get(id)
      if (ent) {
        this.viewer.container.removeChild(ent.tail)
        this.viewer.container.removeChild(ent.reference)
        this.scene.preRender.removeEventListener(ent.callback)
        this.cache.delete(id)
      }
    } else {
      this.cache.forEach((ent) => {
        this.viewer.container.removeChild(ent.tail)
        this.viewer.container.removeChild(ent.reference)
        this.scene.preRender.removeEventListener(ent.callback)
      })
      this.cache.clear()
    }
  }

  /**
   * @description 获取销毁状态
   */
  public isDestroyed(): boolean {
    return this.destroyed
  }

  /**
   * @description 销毁
   */
  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.remove()
    this.cache.clear()
    this.viewer = undefined as any
    this.scene = undefined as any
    this.camera = undefined as any
  }
}
