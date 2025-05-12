declare module "cesium" {
  export const createMaterialPropertyDescriptor: (...args: any[]) => any
  export const createPropertyDescriptor: (...args: any[]) => any

  export interface Material {
    _uniforms: any
  }

  export class EllipsoidalOccluder {
    cameraPosition: Cartesian3
    ellipsoid: Ellipsoid
    constructor(ellipsoid: Ellipsoid, cameraPosition: Cartesian3)
    computeHorizonCullingPoint(directionToPoint: Cartesian3, positions: Cartesian3[], result: Cartesian3): Cartesian3
    computeHorizonCullingPointFromRectangle(rectangle: Rectangle, ellipsoid: Ellipsoid, result: Cartesian3): Cartesian3
    computeHorizonCullingPointFromVertices(
      directionToPoint: Cartesian3,
      vertices: number[],
      stride: number,
      center: Cartesian3,
      result: Cartesian3
    ): Cartesian3
    isPointVisible(occludee: Cartesian3): boolean
    isScaledSpacePointVisible(occludeeScaledSpacePosition: Cartesian3): boolean
  }

  export namespace defaultValue {
    export const EMPTY_OBJECT: Object
  }

  export namespace DrawCommand {
    type ConstructorOptions = {
      boundingVolume?: Property | Object
      owner?: Property | Object
      primitiveType?: Property | PrimitiveType
      vertexArray?: Property | VertexArray
      uniformMap?: Property | { [key: string]: () => any }
      modelMatrix?: Property | Matrix4
      shaderProgram?: Property | ShaderProgram
      framebuffer?: Property | Framebuffer
      renderState?: Property | RenderState
      pass?: Property | Pass
      offset?: Property | Number
      count?: Property | Number
    }
  }
  export class DrawCommand {
    constructor(options?: DrawCommand.ConstructorOptions)
    boundingVolume: Property | Object | undefined
    owner: Property | Object | undefined
    primitiveType: Property | PrimitiveType
    vertexArray: Property | VertexArray | undefined
    shaderProgram: Property | ShaderProgram | undefined
    renderState: Property | RenderState | undefined
    uniformMap: Property | any
    pass: Property | Pass | undefined
    modelMatrix: Property | Matrix4 | undefined
    offset: Property | Number | undefined
    count: Property | Number | undefined
  }

  export class ComputeCommand {
    constructor(options?: any)
  }

  export class ClearCommand {
    constructor(options?: any)
    framebuffer: any
    execute: any
  }

  export namespace VertexArray {
    type ConstructorOptions = {
      context?: Property | unknown
      attributes?: Property | unknown
      indexBuffer?: Property | unknown
    }
  }
  export class VertexArray {
    /**
     * Creates a vertex array, which defines the attributes making up a vertex, and contains an optional index buffer
     * to select vertices for rendering.  Attributes are defined using object literals as shown in Example 1 below.
     *
     * @param {Object} options Object with the following properties:
     * @param {Context} options.context The context in which the VertexArray gets created.
     * @param {Object[]} options.attributes An array of attributes.
     * @param {IndexBuffer} [options.indexBuffer] An optional index buffer.
     *
     * @exception {DeveloperError} Attribute must have a <code>vertexBuffer</code>.
     * @exception {DeveloperError} Attribute must have a <code>componentsPerAttribute</code>.
     * @exception {DeveloperError} Attribute must have a valid <code>componentDatatype</code> or not specify it.
     * @exception {DeveloperError} Attribute must have a <code>strideInBytes</code> less than or equal to 255 or not specify it.
     * @exception {DeveloperError} Index n is used by more than one attribute.
     *
     *
     * @example
     * // Example 1. Create a vertex array with vertices made up of three floating point
     * // values, e.g., a position, from a single vertex buffer.  No index buffer is used.
     * var positionBuffer = Buffer.createVertexBuffer({
     *     context : context,
     *     sizeInBytes : 12,
     *     usage : BufferUsage.STATIC_DRAW
     * });
     * var attributes = [
     *     {
     *         index                  : 0,
     *         enabled                : true,
     *         vertexBuffer           : positionBuffer,
     *         componentsPerAttribute : 3,
     *         componentDatatype      : ComponentDatatype.FLOAT,
     *         normalize              : false,
     *         offsetInBytes          : 0,
     *         strideInBytes          : 0 // tightly packed
     *         instanceDivisor        : 0 // not instanced
     *     }
     * ];
     * var va = new VertexArray({
     *     context : context,
     *     attributes : attributes
     * });
     *
     * @example
     * // Example 2. Create a vertex array with vertices from two different vertex buffers.
     * // Each vertex has a three-component position and three-component normal.
     * var positionBuffer = Buffer.createVertexBuffer({
     *     context : context,
     *     sizeInBytes : 12,
     *     usage : BufferUsage.STATIC_DRAW
     * });
     * var normalBuffer = Buffer.createVertexBuffer({
     *     context : context,
     *     sizeInBytes : 12,
     *     usage : BufferUsage.STATIC_DRAW
     * });
     * var attributes = [
     *     {
     *         index                  : 0,
     *         vertexBuffer           : positionBuffer,
     *         componentsPerAttribute : 3,
     *         componentDatatype      : ComponentDatatype.FLOAT
     *     },
     *     {
     *         index                  : 1,
     *         vertexBuffer           : normalBuffer,
     *         componentsPerAttribute : 3,
     *         componentDatatype      : ComponentDatatype.FLOAT
     *     }
     * ];
     * var va = new VertexArray({
     *     context : context,
     *     attributes : attributes
     * });
     *
     * @example
     * // Example 3. Creates the same vertex layout as Example 2 using a single
     * // vertex buffer, instead of two.
     * var buffer = Buffer.createVertexBuffer({
     *     context : context,
     *     sizeInBytes : 24,
     *     usage : BufferUsage.STATIC_DRAW
     * });
     * var attributes = [
     *     {
     *         vertexBuffer           : buffer,
     *         componentsPerAttribute : 3,
     *         componentDatatype      : ComponentDatatype.FLOAT,
     *         offsetInBytes          : 0,
     *         strideInBytes          : 24
     *     },
     *     {
     *         vertexBuffer           : buffer,
     *         componentsPerAttribute : 3,
     *         componentDatatype      : ComponentDatatype.FLOAT,
     *         normalize              : true,
     *         offsetInBytes          : 12,
     *         strideInBytes          : 24
     *     }
     * ];
     * var va = new VertexArray({
     *     context : context,
     *     attributes : attributes
     * });
     *
     * @see Buffer#createVertexBuffer
     * @see Buffer#createIndexBuffer
     * @see Context#draw
     */
    constructor(options?: VertexArray.ConstructorOptions)
    /**
     * Creates a vertex array from a geometry.  A geometry contains vertex attributes and optional index data
     * in system memory, whereas a vertex array contains vertex buffers and an optional index buffer in WebGL
     * memory for use with rendering.
     * <br /><br />
     * The <code>geometry</code> argument should use the standard layout like the geometry returned by {@link BoxGeometry}.
     * <br /><br />
     * <code>options</code> can have four properties:
     * <ul>
     *   <li><code>geometry</code>:  The source geometry containing data used to create the vertex array.</li>
     *   <li><code>attributeLocations</code>:  An object that maps geometry attribute names to vertex shader attribute locations.</li>
     *   <li><code>bufferUsage</code>:  The expected usage pattern of the vertex array's buffers.  On some WebGL implementations, this can significantly affect performance.  See {@link BufferUsage}.  Default: <code>BufferUsage.DYNAMIC_DRAW</code>.</li>
     *   <li><code>interleave</code>:  Determines if all attributes are interleaved in a single vertex buffer or if each attribute is stored in a separate vertex buffer.  Default: <code>false</code>.</li>
     * </ul>
     * <br />
     * If <code>options</code> is not specified or the <code>geometry</code> contains no data, the returned vertex array is empty.
     *
     * @param {Object} options An object defining the geometry, attribute indices, buffer usage, and vertex layout used to create the vertex array.
     *
     * @exception {RuntimeError} Each attribute list must have the same number of vertices.
     * @exception {DeveloperError} The geometry must have zero or one index lists.
     * @exception {DeveloperError} Index n is used by more than one attribute.
     *
     *
     * @example
     * // Example 1. Creates a vertex array for rendering a box.  The default dynamic draw
     * // usage is used for the created vertex and index buffer.  The attributes are not
     * // interleaved by default.
     * var geometry = new BoxGeometry();
     * var va = VertexArray.fromGeometry({
     *     context            : context,
     *     geometry           : geometry,
     *     attributeLocations : GeometryPipeline.createAttributeLocations(geometry),
     * });
     *
     * @example
     * // Example 2. Creates a vertex array with interleaved attributes in a
     * // single vertex buffer.  The vertex and index buffer have static draw usage.
     * var va = VertexArray.fromGeometry({
     *     context            : context,
     *     geometry           : geometry,
     *     attributeLocations : GeometryPipeline.createAttributeLocations(geometry),
     *     bufferUsage        : BufferUsage.STATIC_DRAW,
     *     interleave         : true
     * });
     *
     * @example
     * // Example 3.  When the caller destroys the vertex array, it also destroys the
     * // attached vertex buffer(s) and index buffer.
     * va = va.destroy();
     *
     * @see Buffer#createVertexBuffer
     * @see Buffer#createIndexBuffer
     * @see GeometryPipeline.createAttributeLocations
     * @see ShaderProgram
     */
    static fromGeometry(options: any): VertexArray
  }

  export namespace RenderState {
    type ConstructorOptions = {}
  }
  export class RenderState {
    constructor(renderState?: RenderState.ConstructorOptions)
    static fromCache(renderState: RenderState): RenderState
  }

  export class FrameState {
    constructor(context: any, creditDisplay: any, jobScheduler: any)
    context: any
    mode: SceneMode
    commandList: DrawCommand[]
    frameNumber: Number
    time: JulianDate
    passes: {
      render: boolean
      pick: boolean
      depth: boolean
      postProcess: boolean
      offscreen: boolean
    }
  }

  export class Buffer {
    /**
     * Creates a vertex buffer, which contains untyped vertex data in GPU-controlled memory.
     * <br /><br />
     * A vertex array defines the actual makeup of a vertex, e.g., positions, normals, texture coordinates,
     * etc., by interpreting the raw data in one or more vertex buffers.
     *
     * @param {Object} options An object containing the following properties:
     * @param {Context} options.context The context in which to create the buffer
     * @param {ArrayBufferView} [options.typedArray] A typed array containing the data to copy to the buffer.
     * @param {Number} [options.sizeInBytes] A <code>Number</code> defining the size of the buffer in bytes. Required if options.typedArray is not given.
     * @param {BufferUsage} options.usage Specifies the expected usage pattern of the buffer. On some GL implementations, this can significantly affect performance. See {@link BufferUsage}.
     * @returns {VertexBuffer} The vertex buffer, ready to be attached to a vertex array.
     *
     * @exception {DeveloperError} Must specify either <options.typedArray> or <options.sizeInBytes>, but not both.
     * @exception {DeveloperError} The buffer size must be greater than zero.
     * @exception {DeveloperError} Invalid <code>usage</code>.
     *
     *
     * @example
     * // Example 1. Create a dynamic vertex buffer 16 bytes in size.
     * var buffer = Buffer.createVertexBuffer({
     *     context : context,
     *     sizeInBytes : 16,
     *     usage : BufferUsage.DYNAMIC_DRAW
     * });
     *
     * @example
     * // Example 2. Create a dynamic vertex buffer from three floating-point values.
     * // The data copied to the vertex buffer is considered raw bytes until it is
     * // interpreted as vertices using a vertex array.
     * var positionBuffer = buffer.createVertexBuffer({
     *     context : context,
     *     typedArray : new Float32Array([0, 0, 0]),
     *     usage : BufferUsage.STATIC_DRAW
     * });
     *
     * @see {@link https://www.khronos.org/opengles/sdk/docs/man/xhtml/glGenBuffer.xml|glGenBuffer}
     * @see {@link https://www.khronos.org/opengles/sdk/docs/man/xhtml/glBindBuffer.xml|glBindBuffer} with <code>ARRAY_BUFFER</code>
     * @see {@link https://www.khronos.org/opengles/sdk/docs/man/xhtml/glBufferData.xml|glBufferData} with <code>ARRAY_BUFFER</code>
     */
    static createVertexBuffer(options: any): Buffer
  }

  export namespace BufferUsage {
    export function validate(bufferUsage: WebGLConstants): boolean
  }
  export enum BufferUsage {
    STREAM_DRAW = WebGLConstants.STREAM_DRAW,
    STATIC_DRAW = WebGLConstants.STATIC_DRAW,
    DYNAMIC_DRAW = WebGLConstants.DYNAMIC_DRAW,
  }

  export namespace ShaderSource {
    type ConstructorOptions = {
      sources?: string[]
      defines?: string[]
      pickColorQualifier?: string
      includeBuiltIns?: boolean
    }
  }
  export class ShaderSource {
    /**
     * An object containing various inputs that will be combined to form a final GLSL shader string.
     *
     * @param {Object} [options] Object with the following properties:
     * @param {String[]} [options.sources] An array of strings to combine containing GLSL code for the shader.
     * @param {String[]} [options.defines] An array of strings containing GLSL identifiers to <code>#define</code>.
     * @param {String} [options.pickColorQualifier] The GLSL qualifier, <code>uniform</code> or <code>in</code>, for the input <code>czm_pickColor</code>.  When defined, a pick fragment shader is generated.
     * @param {Boolean} [options.includeBuiltIns=true] If true, referenced built-in functions will be included with the combined shader.  Set to false if this shader will become a source in another shader, to avoid duplicating functions.
     *
     * @exception {DeveloperError} options.pickColorQualifier must be 'uniform' or 'in'.
     *
     * @example
     * // 1. Prepend #defines to a shader
     * var source = new Cesium.ShaderSource({
     *   defines : ['WHITE'],
     *   sources : ['void main() { \n#ifdef WHITE\n gl_FragColor = vec4(1.0); \n#else\n gl_FragColor = vec4(0.0); \n#endif\n }']
     * });
     *
     * // 2. Modify a fragment shader for picking
     * var source = new Cesium.ShaderSource({
     *   sources : ['void main() { gl_FragColor = vec4(1.0); }'],
     *   pickColorQualifier : 'uniform'
     * });
     *
     * @private
     */
    constructor(options: ShaderSource.ConstructorOptions)
  }

  export namespace ShaderProgram {
    type CacheOptions = {
      context: Context
      shaderProgram?: ShaderProgram
      vertexShaderSource?: string | ShaderSource
      fragmentShaderSource?: string | ShaderSource
      attributeLocations?: { [key: string]: any }
    }
  }
  export class ShaderProgram {
    destroy(): undefined
    static replaceCache(options: ShaderProgram.CacheOptions): ShaderProgram
    static fromCache(options: ShaderProgram.CacheOptions): ShaderProgram
  }

  export enum Pass {
    ENVIRONMENT = 0,
    COMPUTE = 1,
    GLOBE = 2,
    TERRAIN_CLASSIFICATION = 3,
    CESIUM_3D_TILE = 4,
    CESIUM_3D_TILE_CLASSIFICATION = 5,
    CESIUM_3D_TILE_CLASSIFICATION_IGNORE_SHOW = 6,
    OPAQUE = 7,
    TRANSLUCENT = 8,
    OVERLAY = 9,
    NUMBER_OF_PASSES = 10,
  }

  export class Framebuffer {
    constructor(options: any)
    getColorTexture(param: any): any
    depthTexture: any
    destroy(): undefined
  }

  export class Texture {
    constructor(options: any)
    destroy(): undefined
  }
  export class Sampler {
    constructor(options: any)
  }

  export namespace Context {
    type WebglOptions = {
      alpha: boolean
      depth: boolean
      stencil: boolean
      antialias: boolean
      premultipliedAlpha: boolean
      preserveDrawingBuffer: boolean
      failIfMajorPerformanceCaveat: boolean
    }
    type ContextOptions = {
      allowTextureFilterAnisotropic?: boolean
      requestWebgl2?: boolean
      webgl?: WebglOptions
      getWebGLStub?: (
        canvas: HTMLCanvasElement,
        options: WebglOptions
      ) => CanvasRenderingContext2D | WebGLRenderingContext
    }
  }
  export class Context {
    constructor(canvas: HTMLCanvasElement, options: Context.ContextOptions)
  }

  export class ModelInstanceCollection {}

  export class PolylinePipeline {
    static generateArc(option: { positions: Cartesian3[]; granularity: number }): number[]
  }
}

declare module "cesium/Source/Core/PolylinePipeline" {
  import { PolylinePipeline } from "cesium"
  export default PolylinePipeline
}

declare module "cesium/Source/Renderer/DrawCommand" {
  import { DrawCommand } from "cesium"
  export default DrawCommand
}

declare module "cesium/Source/Renderer/VertexArray" {
  import { VertexArray } from "cesium"
  export default VertexArray
}

declare module "cesium/Source/Renderer/RenderState" {
  import { RenderState } from "cesium"
  export default RenderState
}

declare module "cesium/Source/Scene/FrameState" {
  import { FrameState } from "cesium"
  export default FrameState
}

declare module "cesium/Source/Renderer/Buffer" {
  import { Buffer } from "cesium"
  export default Buffer
}

declare module "cesium/Source/Renderer/BufferUsage" {
  import { BufferUsage } from "cesium"
  export default BufferUsage
}

declare module "cesuim/Source/Renderer/ShaderSource" {
  import { ShaderSource } from "cesium"
  export default ShaderSource
}

declare module "cesuim/Source/Renderer/ShaderProgram" {
  import { ShaderProgram } from "cesium"
  export default ShaderProgram
}

declare module "cesuim/Source/Renderer/Pass" {
  import { Pass } from "cesium"
  export default Pass
}

declare module "cesium/Source/Renderer/Framebuffer" {
  import { Framebuffer } from "cesium"
  export default Framebuffer
}

declare module "cesium/Source/Renderer/Texture" {
  import { Texture } from "cesium"
  export default Texture
}

declare module "cesium/Source/Renderer/Sampler" {
  import { Sampler } from "cesium"
  export default Sampler
}

declare module "cesium/Source/Renderer/Context" {
  import { Context } from "cesium"
  export default Context
}

declare module "cesium/Source/Scene/ModelInstanceCollection" {
  import { ModelInstanceCollection } from "cesium"
  export default ModelInstanceCollection
}
