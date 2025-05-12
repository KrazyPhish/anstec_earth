import {
  Color,
  Cartesian3,
  Entity,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  CallbackProperty,
  ArcType,
  HeightReference,
  ConstantPositionProperty,
  PolylineArrowMaterialProperty,
  PolylineDashMaterialProperty,
  PolylineGlowMaterialProperty,
  PolylineOutlineMaterialProperty,
  DeveloperError,
} from "cesium"
import { Earth } from "components/Earth"
import { PolylineLayer } from "components/layers"
import { DrawType, DefaultModuleName, SubEventType } from "enum"
import { Utils, State } from "utils"
import { Draw } from "./Draw"
import { Dynamic } from "./Dynamic"

/**
 * @description 动态绘制折线段
 */
export class PolylineDynamic extends Dynamic<PolylineLayer<Dynamic.Polyline>> {
  public type: string = "Polyline"
  constructor(earth: Earth) {
    super(earth, new PolylineLayer(earth))
  }

  private getMaterial(materialType: PolylineLayer.MaterialType, materialUniforms?: PolylineLayer.MaterialUniforms) {
    switch (materialType) {
      case "Color": {
        return materialUniforms?.color ?? Color.RED
      }
      case "PolylineArrow": {
        return new PolylineArrowMaterialProperty(materialUniforms?.color ?? Color.RED)
      }
      case "PolylineDash": {
        return new PolylineDashMaterialProperty({
          gapColor: Color.TRANSPARENT,
          dashLength: 8,
          ...materialUniforms,
        })
      }
      case "PolylineGlow": {
        return new PolylineGlowMaterialProperty({
          ...materialUniforms,
        })
      }
      case "PolylineOutline": {
        return new PolylineOutlineMaterialProperty({
          outlineColor: Color.WHITE,
          outlineWidth: 1,
          ...materialUniforms,
        })
      }
      default: {
        throw new DeveloperError("A certain material type is required.")
      }
    }
  }

  /**
   * @description 订阅绘制或编辑事件
   * @param event 事件类型
   * @param callback 回调
   */
  public subscribe(event: SubEventType, callback: (...args: any) => void): void {
    this.eventBus.on(event, callback)
  }

  /**
   * @description 取消订阅绘制或编辑事件
   * @param event 事件类型
   * @param callback 回调
   */
  public unsubscribe(event: SubEventType, callback: (...args: any) => void): void {
    this.eventBus.off(event, callback)
  }

  /**
   * @description 添加可编辑对象
   * @param option 新增参数以及可编辑附加数据
   */
  public add(option: PolylineLayer.AddParam<Dynamic.Polyline>) {
    this.layer.add(option)
  }

  /**
   * @description 动态画线段
   * @param param {@link Draw.Polyline} 画线段参数
   * @returns 线段点的坐标
   * @exception A certain material type is required.
   */
  public draw({
    id = Utils.RandomUUID(),
    module = DefaultModuleName.POLYLINE,
    width = 2,
    ground = false,
    keep = true,
    materialType = "Color",
    materialUniforms = { color: Color.RED },
    onMove,
    onEvery,
    onFinish,
  }: Draw.Polyline): Promise<Draw.PolylineReturn> {
    if (State.isOperate())
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })

    const points: Cartesian3[] = []
    let ent: Entity
    let index = -1

    const handler = super.startEvent()

    this.cacheHandler = handler

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      const point = super.getPointOnEllipsoid(endPosition)
      if (!point) return
      points.pop()
      points.push(point)
      onMove?.(point, index)
      this.eventBus.emit(SubEventType.DRAW_MOVE, {
        type: this.type,
        event: SubEventType.DRAW_MOVE,
        data: { id, index, position: point },
      })
    }, ScreenSpaceEventType.MOUSE_MOVE)

    return new Promise<Draw.PolylineReturn>((resolve, reject) => {
      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        const point = super.getPointOnEllipsoid(position)
        if (point) {
          index++
          points.push(point)
          onEvery?.(point, index)
          this.eventBus.emit(SubEventType.DRAW_CERTAIN, {
            type: this.type,
            event: SubEventType.DRAW_CERTAIN,
            data: { id, index, position: point },
          })
        } else {
          super.endEvent(handler)
          reject("Please choose a point from earth.")
        }
        if (!ent && points.length >= 2) {
          this.cacheEntity = ent = this.viewer.entities.add({
            polyline: {
              positions: new CallbackProperty(() => {
                return points
              }, false),
              material: this.getMaterial(materialType, materialUniforms),
              width,
              clampToGround: ground,
              arcType: ground ? ArcType.GEODESIC : ArcType.RHUMB,
            },
          })
        }
      }, ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(() => {
        points.pop()
        if (points.length < 2) {
          ent && this.viewer.entities.remove(ent)
          super.endEvent(handler)
          reject("Polyline needs at least two vertexes.")
        } else {
          const polyline = { id, positions: points }
          if (keep) {
            this.layer.add({
              id,
              module,
              materialType,
              materialUniforms,
              ground,
              width,
              lines: [points],
              data: {
                type: DrawType.POLYLINE,
                positions: points,
                attr: {
                  width,
                  ground,
                  module,
                  materialType,
                  materialUniforms,
                },
              },
            })
          }
          ent && this.viewer.entities.remove(ent)
          super.endEvent(handler)
          onFinish?.(points)
          this.eventBus.emit(SubEventType.DRAW_FINISH, {
            type: this.type,
            event: SubEventType.DRAW_FINISH,
            data: { ...polyline },
          })
          resolve(polyline)
        }
      }, ScreenSpaceEventType.RIGHT_CLICK)
    })
  }

  /**
   * @description 编辑
   * @param id 目标ID
   * @returns
   */
  public edit(id: string): Promise<Draw.PolylineReturn> {
    const data: Dynamic.Polyline | undefined = this.layer.getEntity(id)?.data.data
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
      polyline: {
        positions: new CallbackProperty(() => {
          return positions
        }, false),
        material: this.getMaterial(data.attr.materialType, data.attr.materialUniforms),
        width: data.attr.width,
        clampToGround: data.attr.ground,
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
        data: { id, index: currentIndex, position: _position },
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
        data: { id, position },
      })
    }, ScreenSpaceEventType.MOUSE_MOVE)

    return new Promise((resolve) => {
      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        const _position = super.getPointOnEllipsoid(position)
        const pick = this.scene.pick(position)
        if (!_position) return
        if (!pick || !tempPoints.some((entity) => entity.id === pick.id.id)) {
          super.endEvent(handler)
          this.layer.add({
            id,
            lines: [positions],
            ...data.attr,
            data: { type: data.type, positions, attr: data.attr },
          })
          ent && this.viewer.entities.remove(ent)
          tempPoints.forEach((entity) => this.viewer.entities.remove(entity))
          this.eventBus.emit(SubEventType.EDIT_FINISH, {
            type: this.type,
            event: SubEventType.EDIT_FINISH,
            data: { id, positions },
          })
          resolve({ id, positions })
        } else {
          super.setViewControl(false)
          currentIndex = Number(pick.id.id.split("_")[1])
          currentPoint = tempPoints[currentIndex]
        }
      }, ScreenSpaceEventType.LEFT_DOWN)
    })
  }
}
