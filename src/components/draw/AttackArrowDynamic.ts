import {
  Color,
  Entity,
  Cartesian3,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  CallbackProperty,
  PolygonHierarchy,
  HeightReference,
  ConstantPositionProperty,
} from "cesium"
import { Geographic } from "components/coordinate"
import { Earth } from "components/Earth"
import { PolygonLayer } from "components/layers"
import { DrawType, DefaultModuleName, SubEventType } from "enum"
import { Figure, Utils, State } from "utils"
import { Draw } from "./Draw"
import { Dynamic } from "./Dynamic"

type OptionParam = {
  headHeightFactor: number
  headWidthFactor: number
  neckHeightFactor: number
  neckWidthFactor: number
  tailWidthFactor: number
  headTailFactor: number
  swallowTailFactor: number
}

const { pow, sin, PI } = window.Math

/**
 * @description 动态绘制攻击箭头
 */
export class AttackArrowDynamic extends Dynamic<PolygonLayer<Dynamic.AttackArrow>> {
  public type: string = "Attack_Arrow"
  constructor(earth: Earth) {
    super(earth, new PolygonLayer(earth))
  }

  private computeHeadPoints(t: [number, number][], o: [number, number], e: [number, number], option: OptionParam) {
    const { headHeightFactor, headTailFactor, headWidthFactor, neckWidthFactor, neckHeightFactor } = option
    let r = pow(Figure.CalcMathDistance(t), 0.99)
    let n = r * headHeightFactor
    const g = t[t.length - 1]
    r = Figure.CalcMathDistance([g, t[t.length - 2]])
    const i = Figure.CalcMathDistance([o, e])
    if (n > i * headTailFactor) {
      n = i * headTailFactor
    }
    const s = n * headWidthFactor
    const a = n * neckWidthFactor
    n = n > r ? r : n
    const l = n * neckHeightFactor
    const u = Figure.CalcThirdPoint(t[t.length - 2], g, 0, n, true)
    const c = Figure.CalcThirdPoint(t[t.length - 2], g, 0, l, true)
    const p = Figure.CalcThirdPoint(g, u, PI / 2, s, false)
    const h = Figure.CalcThirdPoint(g, u, PI / 2, s, true)
    const d = Figure.CalcThirdPoint(g, c, PI / 2, a, false)
    const f = Figure.CalcThirdPoint(g, c, PI / 2, a, true)
    return [d, p, g, h, f]
  }

  private computeBodyPoints<T extends [number, number]>(t: T[], o: T, e: T, r: number) {
    let l = 0
    const u = []
    const c = []
    const n = Figure.CalcMathDistance(t)
    const g = pow(Figure.CalcMathDistance(t), 0.99)
    const i = g * r
    const s = Figure.CalcMathDistance([o, e])
    const a = (i - s) / 2
    for (let p = 1; p < t.length - 1; p++) {
      const h = Figure.CalcMathAngle(t[p - 1], t[p], t[p + 1]) / 2
      l += Figure.CalcMathDistance([t[p - 1], t[p]])
      const d = (i / 2 - (l / n) * a) / sin(h)
      const f = Figure.CalcThirdPoint(t[p - 1], t[p], PI - h, d, true)
      const e = Figure.CalcThirdPoint(t[p - 1], t[p], h, d, false)
      u.push(f)
      c.push(e)
    }
    return u.concat(c)
  }

  private computeQBPoints(t: [number, number][]) {
    if (t.length <= 2) return t
    const o = 2
    const e: [number, number][] = []
    const r = t.length - o - 1
    e.push(t[0])
    for (let n = 0; r >= n; n++) {
      for (let g = 0; 1 >= g; g += 0.05) {
        let i = 0
        let y = 0
        for (let s = 0; o >= s; s++) {
          const a = this.getQuadricBSplineFactor(s, g)
          i += a * t[n + s][0]
          y += a * t[n + s][1]
        }
        e.push([i, y])
      }
    }
    e.push(t[t.length - 1])
    return e
  }

  private getQuadricBSplineFactor(t: number, o: number) {
    return t === 0 ? pow(o - 1, 2) / 2 : t === 1 ? (-2 * pow(o, 2) + 2 * o + 1) / 2 : t === 2 ? pow(o, 2) / 2 : 0
  }

  private computeArrow(positions: Cartesian3[], option: OptionParam) {
    const { tailWidthFactor, swallowTailFactor } = option
    const points: [number, number][] = positions.map((p) => {
      const { longitude, latitude } = Geographic.fromCartesian(p)
      return [longitude, latitude]
    })
    let [e, r] = points
    if (Figure.CrossProduct(points[0], points[1], points[2]) < 0) {
      ;[r, e] = points
    }
    const n = [(e[0] + r[0]) / 2, (e[1] + r[1]) / 2]
    const g = [n].concat(points.slice(2)) as [number, number][]
    const i = this.computeHeadPoints(g, e, r, option)
    const s = i[0]
    const a = i[4]
    const l = Figure.CalcMathDistance([e, r])
    const u = pow(Figure.CalcMathDistance(g), 0.99)
    const c = u * tailWidthFactor * swallowTailFactor
    const swallowTailPoint = Figure.CalcThirdPoint(g[1], g[0], 0, c, true)
    const p = l / u
    const h = this.computeBodyPoints(g, s, a, p)
    const t = h.length
    const d = [e].concat(h.slice(0, t / 2))
    d.push(s)
    const f = [r].concat(h.slice(t / 2, t))
    f.push(a)
    const _d = this.computeQBPoints(d)
    const _f = this.computeQBPoints(f)
    const arr = _d.concat(i, _f.reverse(), [swallowTailPoint, _d[0]]).flat()
    return {
      control: positions,
      shape: Cartesian3.fromDegreesArray(arr),
    }
  }

  /**
   * @description 添加可编辑对象
   * @param option 新增参数以及可编辑附加数据
   */
  public add(option: PolygonLayer.AddParam<Dynamic.AttackArrow>) {
    this.layer.add(option)
  }

  /**
   * @description 动态画攻击箭头
   * @param param {@link Draw.AttackArrow} 画箭头参数
   * @returns 攻击发起点和沿途选点的坐标
   */
  public draw({
    id = Utils.RandomUUID(),
    module = DefaultModuleName.ATTACK_ARROW,
    headHeightFactor = 0.18,
    headWidthFactor = 0.3,
    neckHeightFactor = 0.85,
    neckWidthFactor = 0.15,
    tailWidthFactor = 0.1,
    headTailFactor = 0.8,
    swallowTailFactor = 1,
    color = Color.YELLOW.withAlpha(0.5),
    outlineColor = Color.YELLOW,
    outlineWidth = 1,
    keep = true,
    ground = false,
    onEvery,
    onFinish,
  }: Draw.AttackArrow): Promise<Draw.AttackArrowReturn> {
    if (State.isOperate())
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })

    let ent: Entity
    let lastPoint: Cartesian3
    const option = {
      headHeightFactor,
      headWidthFactor,
      neckHeightFactor,
      neckWidthFactor,
      tailWidthFactor,
      headTailFactor,
      swallowTailFactor,
    }
    const points: Cartesian3[] = []
    const handler = super.startEvent()

    this.cacheHandler = handler

    handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
      const point = super.getPointOnEllipsoid(position)
      if (!point) return
      points.push(point)
      onEvery?.(point, points.length - 1)
      this.eventBus.emit(SubEventType.DRAW_CERTAIN, {
        type: this.type,
        event: SubEventType.DRAW_CERTAIN,
        data: { id, index: points.length - 1, position: point }
      })
    }, ScreenSpaceEventType.LEFT_CLICK)

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      const point = super.getPointOnEllipsoid(endPosition)
      if (!point || points.length < 2) return
      lastPoint = point
      if (points.length > 2) points.pop()
      points.push(point)
      if (!ent) {
        this.cacheEntity = ent = this.viewer.entities.add({
          polygon: {
            hierarchy: new CallbackProperty(() => {
              return new PolygonHierarchy(this.computeArrow(points, option).shape)
            }, false),
            material: color,
            outline: true,
            outlineColor,
            outlineWidth,
            heightReference: ground ? HeightReference.CLAMP_TO_GROUND : HeightReference.NONE,
          },
        })
      }
      this.eventBus.emit(SubEventType.DRAW_MOVE, {
        type: this.type,
        event: SubEventType.DRAW_MOVE,
        data: { id, position: point }
      })
    }, ScreenSpaceEventType.MOUSE_MOVE)

    return new Promise<Draw.AttackArrowReturn>((resolve, reject) => {
      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        const point = super.getPointOnEllipsoid(position) ?? lastPoint
        points.pop()
        points.push(point)
        if (points.length <= 2) {
          reject("Attck arrow needs at least three points.")
          super.endEvent(handler)
          this.viewer.entities.remove(ent)
          return
        }
        const { shape, control } = this.computeArrow(points, option)
        if (keep) {
          this.layer.add({
            id,
            module,
            color,
            ground,
            outline: {
              width: outlineWidth,
              materialType: "Color",
              materialUniforms: { color: outlineColor },
            },
            usePointHeight: ground ? false : true,
            positions: shape,
            data: {
              type: DrawType.ATTACK_ARROW,
              positions: control,
              attr: {
                module,
                color,
                ground,
                outlineColor,
                outlineWidth,
                ...option,
              },
            },
          })
        }
        super.endEvent(handler)
        this.viewer.entities.remove(ent)
        onFinish?.(points)
        this.eventBus.emit(SubEventType.DRAW_FINISH, {
          type: this.type,
          event: SubEventType.DRAW_FINISH,
          data: { id, positions: points }
        })
        resolve({ id, positions: points })
      }, ScreenSpaceEventType.RIGHT_CLICK)
    })
  }

  /**
   * @description 编辑
   * @param id 目标ID
   * @returns
   */
  public edit(id: string): Promise<Draw.AttackArrowReturn> {
    const data: Dynamic.AttackArrow | undefined = this.layer.getEntity(id)?.data.data
    if (!data) {
      return new Promise((_, reject) => reject(`Object ${id} does not exist.`))
    } else if (State.isOperate()) {
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })
    }

    const handler = super.startEvent()
    const tempPoints: Entity[] = []
    const positions: Cartesian3[] = [...data.positions]
    const option = {
      headHeightFactor: data.attr.headHeightFactor,
      neckHeightFactor: data.attr.neckHeightFactor,
      headTailFactor: data.attr.headTailFactor,
      swallowTailFactor: data.attr.swallowTailFactor,
      tailWidthFactor: data.attr.tailWidthFactor,
      neckWidthFactor: data.attr.neckWidthFactor,
      headWidthFactor: data.attr.headWidthFactor,
    }
    let ent: Entity
    let currentPoint: Entity | undefined
    let currentIndex: number
    let lastPos: Cartesian3

    data.positions.forEach((value, index) => {
      tempPoints.push(
        this.viewer.entities.add({
          id: `ModifyPoint_${index}`,
          position: value,
          point: {
            pixelSize: 10,
            color: Color.LIGHTBLUE,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        })
      )
    })

    ent = this.viewer.entities.add({
      polygon: {
        hierarchy: new CallbackProperty(() => {
          const polygon = this.computeArrow(positions, option).shape
          return new PolygonHierarchy(polygon)
        }, false),
        material: data.attr.color,
        outline: true,
        outlineColor: data.attr.outlineColor,
        outlineWidth: data.attr.outlineWidth,
        heightReference: data.attr.ground ? HeightReference.CLAMP_TO_GROUND : HeightReference.NONE,
      },
    })
    this.layer.remove(id)

    handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!currentPoint) return
      const _position = super.getPointOnEllipsoid(position) ?? lastPos
      ;(currentPoint.position as ConstantPositionProperty).setValue(_position)
      positions.splice(currentIndex, 1, _position)
      currentPoint = undefined
      this.eventBus.emit(SubEventType.EDIT_CERTAIN, {
        type: this.type,
        event: SubEventType.EDIT_CERTAIN,
        data: { id, index: currentIndex, position: _position }
      })
    }, ScreenSpaceEventType.LEFT_UP)

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      const position = super.getPointOnEllipsoid(endPosition)
      if (!position || !currentPoint) return
      ;(currentPoint.position as ConstantPositionProperty).setValue(position)
      positions.splice(currentIndex, 1, position)
      lastPos = position
      this.eventBus.emit(SubEventType.EDIT_MOVE, {
        type: this.type,
        event: SubEventType.EDIT_MOVE,
        data: { id, index: currentIndex, position }
      })
    }, ScreenSpaceEventType.MOUSE_MOVE)

    return new Promise((resolve) => {
      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        const _position = super.getPointOnEllipsoid(position)
        const pick = this.scene.pick(position)
        if (!_position) return
        if (!pick || !tempPoints.some((entity) => entity.id === pick.id.id)) {
          super.endEvent(handler)
          const { control, shape } = this.computeArrow(positions, option)
          this.layer.add({
            id,
            positions: shape,
            color: data.attr.color,
            module: data.attr.module,
            ground: data.attr.ground,
            usePointHeight: data.attr.ground ? false : true,
            outline: {
              width: data.attr.outlineWidth,
              materialType: "Color",
              materialUniforms: { color: data.attr.outlineColor },
            },
            data: { type: data.type, positions: control, attr: data.attr },
          })
          ent && this.viewer.entities.remove(ent)
          tempPoints.forEach((entity) => this.viewer.entities.remove(entity))
          this.eventBus.emit(SubEventType.EDIT_FINISH, {
            type: this.type,
            event: SubEventType.EDIT_FINISH,
            data: { id, positions }
          })
          resolve({ id, positions })
        } else {
          super.setViewControl(false)
          currentIndex = pick.id.id.split("_")[1]
          currentPoint = tempPoints[currentIndex]
        }
      }, ScreenSpaceEventType.LEFT_DOWN)
    })
  }
}
