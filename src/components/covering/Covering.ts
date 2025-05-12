import { Camera, Cartesian3, Ellipsoid, EllipsoidalOccluder, Scene, Viewer } from "cesium"
import { Earth } from "../Earth"
import { Utils } from "../../utils"

export namespace Covering {
  export type AnchorPosition = "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT"

  export type Data<T> = {
    title: string
    content: string
    position: Cartesian3
    reference: HTMLDivElement
    refShell: HTMLDivElement
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
    position: Cartesian3
  }

  export type SetParam<T> = Partial<Pick<AddParam<T>, "position" | "title" | "content" | "data">>
}

/**
 * @description 自定义覆盖物
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
  constructor(earth: Earth) {
    this.viewer = earth.viewer
    this.scene = earth.scene
    this.camera = earth.camera
  }

  private createConnectionLine(param: { x1: number; x2: number; y1: number; y2: number; opacity: number }) {
    return `
      <line 
        id="line"
        x1="${param.x1}"
        y1="${param.y1}"
        x2="${param.x2}"
        y2="${param.y2}"
        opacity="${param.opacity}"
        stroke="rgba(43, 44, 47, 0.8)"
        stroke-width="1"
      />`
  }

  private createCallback({
    id,
    title,
    content,
    reference,
    refShell,
    tail,
    tailLast,
    position,
    anchorPosition,
    connectionLine,
  }: {
    id: string
    title: string
    content: string
    reference: HTMLDivElement
    refShell: HTMLDivElement
    tail: SVGSVGElement
    tailLast: { x: number; y: number }
    position: Cartesian3
    anchorPosition: Covering.AnchorPosition
    connectionLine: boolean
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
    const _offset = this.scene.canvas.getBoundingClientRect()
    const refLeft = canvasCoordinate.x + _offset.left + left
    const refTop = canvasCoordinate.y + _offset.top + top
    reference.style.left = `${refLeft}px`
    reference.style.top = `${refTop}px`
    refShell.style.left = `${refLeft}px`
    refShell.style.top = `${refTop}px`
    refShell.style.width = `${reference.clientWidth}px`
    refShell.style.height = `${reference.clientHeight}px`
    tail.style.width = `100%`
    tail.style.height = `100%`
    tail.style.position = "absolute"
    tail.style.pointerEvents = "none"
    tail.style.left = `0px`
    tail.style.top = `0px`
    tailLast.x = refLeft + reference.clientWidth / 2
    tailLast.y = refTop + reference.clientHeight / 2
    tail.innerHTML = this.createConnectionLine({
      x1: canvasCoordinate.x + _offset.left,
      y1: canvasCoordinate.y + _offset.top,
      x2: tailLast.x,
      y2: tailLast.y,
      opacity: this.draggable ? (connectionLine ? 1 : 0) : 0,
    })
    return () => {
      const ent = this.cache.get(id)
      const _position = ent?.position ?? position
      ;(reference.firstChild! as HTMLDivElement).innerHTML = ent?.title ?? title
      ;(reference.lastChild! as HTMLDivElement).innerHTML = ent?.content ?? content
      const canvasCoordinate = this.scene.cartesianToCanvasCoordinates(_position)
      const _offset = this.scene.canvas.getBoundingClientRect()
      if (!this.draggable) {
        const refLeft = canvasCoordinate.x + _offset.left + left
        const refTop = canvasCoordinate.y + _offset.top + top
        refShell.style.left = `${refLeft}px`
        refShell.style.top = `${refTop}px`
        tailLast.x = refLeft + reference.clientWidth / 2
        tailLast.y = refTop + reference.clientHeight / 2
      }
      reference.style.left = `${parseInt(refShell.style.getPropertyValue("left").slice(0, -2))}px`
      reference.style.top = `${parseInt(refShell.style.getPropertyValue("top").slice(0, -2))}px`
      tail.innerHTML = this.createConnectionLine({
        x1: canvasCoordinate.x + _offset.left,
        y1: canvasCoordinate.y + _offset.top,
        x2: tailLast.x,
        y2: tailLast.y,
        opacity: this.draggable ? (connectionLine ? 1 : 0) : 0,
      })
      const cameraOccluder = new EllipsoidalOccluder(Ellipsoid.WGS84, this.camera.position)
      if (
        canvasCoordinate.x < 0 ||
        canvasCoordinate.y < 0 ||
        canvasCoordinate.x > this.scene.canvas.clientWidth ||
        canvasCoordinate.y > this.scene.canvas.clientHeight ||
        !cameraOccluder.isPointVisible(_position)
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
    reference,
    position,
    data,
  }: Covering.AddParam<T>) {
    if (customize) {
      if (!reference) {
        throw new Error("Reference element is required when customizing.")
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
    const tail = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    const refShell = document.createElement("div")
    document.body.appendChild(refShell)
    refShell.style.position = "fixed"
    refShell.style.zIndex = "999"
    refShell.draggable = false
    refShell.style.opacity = "0"
    const tailLast = { x: 0, y: 0 }
    refShell.addEventListener("mousedown", (event: MouseEvent) => {
      if (!this.draggable) return
      let downX = event.clientX
      let downY = event.clientY
      const onShellMove = (ev: MouseEvent) => {
        const moveX = ev.clientX
        const moveY = ev.clientY
        const offsetX = moveX - downX
        const offsetY = moveY - downY
        downX = moveX
        downY = moveY
        const lastLeft = parseInt(refShell.style.getPropertyValue("left").slice(0, -2))
        const lastTop = parseInt(refShell.style.getPropertyValue("top").slice(0, -2))
        const bounding = this.scene.canvas.getBoundingClientRect()
        if (
          lastLeft + offsetX <= bounding.left ||
          lastTop + offsetY <= bounding.top ||
          lastLeft + offsetX + refShell.clientWidth >= bounding.right ||
          lastTop + offsetY + refShell.clientHeight >= bounding.bottom
        ) {
          return
        }
        tailLast.x = lastLeft + reference.clientWidth / 2
        tailLast.y = lastTop + reference.clientHeight / 2
        refShell.style.left = `${lastLeft + offsetX}px`
        refShell.style.top = `${lastTop + offsetY}px`
      }
      document.addEventListener("mousemove", onShellMove)
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", onShellMove)
      })
    })
    this.viewer.container.appendChild(reference)
    this.viewer.container.appendChild(tail)
    const callback = this.createCallback({
      id,
      title,
      content,
      reference,
      refShell,
      tail,
      tailLast,
      position,
      anchorPosition,
      connectionLine,
    })
    this.scene.preRender.addEventListener(callback)
    this.cache.set(id, { title, content, position, reference, refShell, tail, data, callback })
  }

  /**
   * @description 按ID设置覆盖物的属性
   * @param id ID
   * @param param {@link Covering.SetParam<T>} 参数
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
        document.body.removeChild(ent.refShell)
        this.viewer.container.removeChild(ent.tail)
        this.viewer.container.removeChild(ent.reference)
        this.scene.preRender.removeEventListener(ent.callback)
      }
    } else {
      this.cache.forEach((ent) => {
        document.body.removeChild(ent.refShell)
        this.viewer.container.removeChild(ent.tail)
        this.viewer.container.removeChild(ent.reference)
        this.scene.preRender.removeEventListener(ent.callback)
      })
    }
  }

  /**
   * @description 销毁
   */
  public destroy() {
    this.remove()
    this.cache.clear()
    this.cache = undefined as any
    this.viewer = undefined as any
    this.scene = undefined as any
    this.camera = undefined as any
  }
}
