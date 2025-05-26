import {
  Cartesian3,
  Color,
  ConstantPositionProperty,
  Entity,
  HeightReference,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from "cesium"
import { Earth } from "components/Earth"
import { ModelLayer } from "components/layers"
import { DrawType, DefaultModuleName, SubEventType } from "enum"
import { Utils, State } from "utils"
import { Draw } from "./Draw"
import { Dynamic } from "./Dynamic"

export class ModelDynamic extends Dynamic<ModelLayer<Dynamic.Model>> {
  public type: string = "Model"
  constructor(earth: Earth) {
    super(earth, new ModelLayer(earth))
  }

  /**
   * @description 添加可编辑对象
   * @param option 新增参数以及可编辑附加数据
   */
  public add(option: ModelLayer.AddParam<Dynamic.Model>) {
    this.layer.add(option)
  }

  /**
   * @description 动态画模型
   * @param param {@link Draw.Model} 画模型参数
   * @returns 点的坐标
   */
  public draw({
    id = Utils.RandomUUID(),
    module = DefaultModuleName.MODEL,
    url,
    scale = 1,
    silhouetteColor = Color.LIGHTYELLOW,
    silhouetteSize = 1,
    minimumPixelSize = 24,
    limit = 1,
    keep = true,
    onEvery,
    onFinish,
  }: Draw.Model): Promise<Draw.ModelReturn[]> {
    if (State.isOperate())
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })

    const models: Draw.ModelReturn[] = []

    return new Promise<Draw.ModelReturn[]>((resolve) => {
      let index = -1
      const handler = super.startEvent()

      this.cacheHandler = handler

      const finish = () => {
        super.endEvent(handler)
        if (!keep) {
          models.forEach(({ id }: Draw.PointReturn) => {
            this.layer.remove(id)
          })
        }
        onFinish?.(models.map((v) => v.position))
        this.eventBus.emit(SubEventType.DRAW_FINISH, {
          type: this.type,
          event: SubEventType.DRAW_FINISH,
          data: { models },
        })
        resolve(models)
      }

      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        index++
        const cartesian = super.getPointOnEllipsoid(position)
        if (!cartesian) return
        const _id = `${id}_${index}`
        const model = { id: _id, position: cartesian }
        models.push(model)
        this.layer.add({
          id: _id,
          module,
          url,
          scale,
          silhouetteColor,
          silhouetteSize,
          minimumPixelSize,
          hightReference: HeightReference.CLAMP_TO_GROUND,
          position: cartesian,
          data: {
            type: DrawType.MODEL,
            positions: [cartesian],
            attr: {
              module,
              url,
              scale,
              silhouetteColor,
              silhouetteSize,
              minimumPixelSize,
            },
          },
        })
        onEvery?.(cartesian, index)
        this.eventBus.emit(SubEventType.DRAW_CERTAIN, {
          type: this.type,
          event: SubEventType.DRAW_CERTAIN,
          data: { ...model },
        })
        if (limit !== 0 && index >= limit - 1) {
          finish()
        }
      }, ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(finish, ScreenSpaceEventType.RIGHT_CLICK)
    })
  }

  /**
   * @description 编辑
   * @param id 目标ID
   * @returns
   */
  public edit(id: string): Promise<Draw.ModelReturn> {
    const data: Dynamic.Model | undefined = this.layer.getEntity(id)?.data.data
    if (!data) {
      return new Promise((_, reject) => reject(`Object ${id} does not exist.`))
    } else if (State.isOperate()) {
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })
    }
    const handler = super.startEvent()
    const point = data.positions[0]
    let ent: Entity
    let currentPoint: Entity | undefined
    let lastPos: Cartesian3 = point.clone()

    ent = this.viewer.entities.add({
      position: point,
      // model: { ...data.attr, heightReference: HeightReference.CLAMP_TO_GROUND },
      point: {
        color: Color.RED,
        pixelSize: 10,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
    this.layer.remove(id)

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      if (!currentPoint) return
      const position = super.getPointOnEllipsoid(endPosition)
      if (position) {
        ;(ent.position as ConstantPositionProperty).setValue(position)
        lastPos = position
        this.eventBus.emit(SubEventType.EDIT_MOVE, {
          type: this.type,
          event: SubEventType.EDIT_MOVE,
          data: { id, position },
        })
      }
    }, ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(() => {
      currentPoint = undefined
    }, ScreenSpaceEventType.LEFT_UP)

    return new Promise((resolve) => {
      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        const pick = this.scene.pick(position)
        if (!pick || pick.id.id !== ent.id) {
          super.endEvent(handler)
          this.layer.add({
            id,
            position: lastPos,
            ...data.attr,
            data: {
              type: data.type,
              positions: [lastPos],
              attr: data.attr,
            },
          })
          ent && this.viewer.entities.remove(ent)
          this.eventBus.emit(SubEventType.EDIT_FINISH, {
            type: this.type,
            event: SubEventType.EDIT_FINISH,
            data: { id, position: lastPos },
          })
          resolve({ id, position: lastPos })
        } else {
          super.setViewControl(false)
          currentPoint = ent
          this.eventBus.emit(SubEventType.EDIT_CERTAIN, {
            type: this.type,
            event: SubEventType.EDIT_CERTAIN,
            data: { id, position: lastPos },
          })
        }
      }, ScreenSpaceEventType.LEFT_DOWN)
    })
  }
}
