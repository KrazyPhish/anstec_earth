import { BufferUsage, ClearCommand, Color, Pass, VertexArray } from "cesium"
import { ParticlesComputing } from "./ParticlesComputing"
import { ParticlesRendering } from "./ParticlesRendering"
import { WindField } from "./WindField"

export class WindParticleSystem {
  public context: any
  public data: WindField.Data
  public params: WindField.Param
  public viewerParameters: WindField.ViewerParam
  public particlesComputing: ParticlesComputing
  public particlesRendering: ParticlesRendering
  constructor(context: any, data: WindField.Data, params: WindField.Param, viewerParameters: WindField.ViewerParam) {
    this.context = context
    this.data = data
    this.params = params
    this.viewerParameters = viewerParameters
    this.particlesComputing = new ParticlesComputing(context, data, params, viewerParameters)
    this.particlesRendering = new ParticlesRendering(context, data, params, viewerParameters, this.particlesComputing)
  }

  canvasResize(context: any) {
    this.particlesComputing.destroyParticlesTextures()
    if (this.particlesComputing.windTextures) {
      Object.keys(this.particlesComputing.windTextures).forEach((key: string) => {
        this.particlesComputing.windTextures?.[key].destroy()
      })
    }
    if (this.particlesRendering.framebuffers) {
      Object.keys(this.particlesRendering.framebuffers).forEach((key) => {
        this.particlesRendering.framebuffers?.[key].destroy()
      })
    }
    this.context = context
    this.particlesComputing = new ParticlesComputing(this.context, this.data, this.params, this.viewerParameters)
    this.particlesRendering = new ParticlesRendering(
      this.context,
      this.data,
      this.params,
      this.viewerParameters,
      this.particlesComputing
    )
  }

  clearFramebuffers() {
    const clearCommand = new ClearCommand({
      color: new Color(0.0, 0.0, 0.0, 0.0),
      depth: 1.0,
      framebuffer: undefined,
      pass: Pass.OPAQUE,
    })
    if (this.particlesRendering.framebuffers) {
      Object.keys(this.particlesRendering.framebuffers).forEach((key) => {
        clearCommand.framebuffer = this.particlesRendering.framebuffers?.[key]
        clearCommand.execute(this.context)
      })
    }
  }

  refreshParticles(maxParticlesChanged: boolean) {
    this.clearFramebuffers()
    this.particlesComputing.destroyParticlesTextures()
    this.particlesComputing.createParticlesTextures(this.context, this.params, this.viewerParameters)
    if (maxParticlesChanged) {
      const geometry = this.particlesRendering.createSegmentsGeometry(this.params)
      if (this.particlesRendering.primitives) {
        this.particlesRendering.primitives.segments.geometry = geometry
        const vertexArray = VertexArray.fromGeometry({
          context: this.context,
          geometry: geometry,
          attributeLocations: this.particlesRendering.primitives.segments.attributeLocations,
          bufferUsage: BufferUsage.STATIC_DRAW,
        })
        this.particlesRendering.primitives.segments.commandToExecute.vertexArray = vertexArray
      }
    }
  }

  applyUserInput(data: WindField.Param) {
    let maxParticlesChanged = false
    if (this.params.maxParticles != data.maxParticles) {
      maxParticlesChanged = true
    }

    Object.keys(data).forEach((key: string) => {
      //@ts-ignore
      this.params[key] = data[key]
    })
    this.refreshParticles(maxParticlesChanged)
  }

  applyViewerParameters(viewerParameters: WindField.ViewerParam) {
    Object.keys(viewerParameters).forEach((key) => {
      //@ts-ignore
      this.viewerParameters[key] = viewerParameters[key]
    })
    this.refreshParticles(false)
  }
}
