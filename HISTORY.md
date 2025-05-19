## @anstec/earth

### 版本更新历史记录

#### Version 2.3.1
1. `Covering.AddParam` 新增参数 `follow` 用于设置覆盖物是否跟随锚定点
2. 若干工具类新增 `isDestroyed` 方法以获取销毁状态：  
  `AnimationManager`、`Cluster`、`ContextMenu`、`Covering`、`Draw`、`Dynamic`、`EChartsOverlay`、  
  `Earth`、`GlobalEvent`、`GraphicsLayer`、`Layer`、`Measure`、`Radar`、`Sensor`、`Weather`
3. 修复 `Covering` 覆盖物元素在移动时超出Canvas边界的问题

#### Version 2.3.0
1. 新增 `Queue` 类和 `Stack` 类，用于模拟队列和栈的管理工具
2. `PolylineLayer.AddParam` 新增参数 `loop` 用于配置首尾相连的折线
3. `PolylineDynamic` 类同步，即可绘制首尾相连的折线
4. `AnimationManager` 类新增方法 `show` 和 `hide` 控制动画显示和隐藏
5. `DiffusePointLayer` 类新增方法 `show` 和 `hide` 控制扩散点图层对象显示和隐藏
6. `GlobalEvent` 全局事件类新增事件类型，仅支持对象触发的 `HOVER` 事件
7. 废弃属性 `GraphicsLayer.allowDestroy` 现不再限制该默认图层的销毁操作
8. 废弃方法 `GraphicsLayer.forceDestroy` 改用 `GraphicsLayer.destroy`
9. 修复调用 `useEarthRecycle` 导致Vue页面崩溃的问题
10. `Covering` 类新增参数中新增 `closeable` 属性，以给覆盖物增加可关闭吊牌的按钮
11. `Covering` 覆盖物自定义连接线颜色

#### Version 2.2.5
1. `Geographic` 类新增静态方法 `fromRadiansArray` 和 `fromRadiansArrayHeights` 用于批量弧度坐标转换
2. `EChartsOverlay` 新增方法 `destroy` 用于替代原 `dispose` 方法以保持方法命名统一
3. 修复 `Covering` 覆盖物移除未清理键值对缓存的问题

#### Version 2.2.4
1. `Covering` 类新增方法 `has`用于判断是否有具体条目
2. 修复 `Covering` 覆盖物元素自定义时错误更新内容的问题
3. 修复 `Covering` 覆盖物元素自定义时元素定位错误的问题

#### Version 2.2.3
1. 修复 `Covering` 类在拉伸视图、缩放视图下错位、无法拖拽的若干问题
2.  `Covering` 覆盖物定位方式从 `fixed` 切换至 `absolute`，如还有错位问题请将地球的父对象定位方式改为 `relative`
3. `2D` 地图模式下加载覆盖物出现位置错误请等待地球视图加载完成后再加载（由 `Cesium` 二维坐标转换缺陷引起）

#### Version 2.2.2
1. 新增属性 `PointLayer.labelLayer`，现在点图层也可以添加附属标签
2. 修正 `EChartsOverlay` 的构造器函数的入参
3. 废弃参数 `EChartsOverlay.ConstructionOptions.earth`
4. 修正若干类型声明错误

#### Version 2.2.1
1. 修复若干类型声明错误

#### Version 2.2.0
1. 新增 `CloudLayer` 积云图层类，提供积云图层展示
2. 类 `Geographic` 新增若干方法
3. 类 `Coordinate` 新增若干方法
4. 修正若干类型声明错误
5. 废弃属性 `GraphicsLayer.wall`
6. 废弃方法 `Polyline.addFlowingDash`
7. 废弃方法 `Polyline.addFlowingWave`
8. 废弃方法 `Earth.useDraw`，现通过属性 `Earth.drawTool` 访问
9. 废弃方法 `Earth.useDefaultLayers`，现属性 `Earth.layers` 访问
10. 废弃方法 `Earth.useMeasure`，现通过属性 `Earth.measure` 访问
11. 废弃方法 `Earth.useContextMenu`，现通过属性 `Earth.contextMenu` 访问

#### Version 2.1.0
1. 新增 `GlobalEvent` 全局事件类，提供全局鼠标事件订阅
2. 修订若干类型声明错误

#### Version 2.0.0
1. 新增 `AnimationManager` 动画管理器类，简化播放开发流程
2. 发布至npm公开版本，版本号重置为2.0.0

#### Version 1.1.7
1. `Draw` 类新增方法 `subscribe`，订阅绘制或编辑时事件
2. `Draw` 类新增方法 `unsubscribe`，取消订阅绘制或编辑时事件
3. 删除方法 `Draw.subscribeEdit` 和 `Draw.unsubscribeEdit`
4. 废弃枚举 `EditEventType` 改用 `SubEventType` 
5. 热力图初始化参数中废弃接口 `useEntitiesIfAvailable`
6. 模型参数中废弃接口 `timestamp`
7. 模型运动参数中废弃接口 `projection`
8. 多边形参数中废弃接口 `outlineColor` 和 `outlineWidth` 改用 `outline`
9. 各图形参数废弃接口 `color` 改用 `materialType` 及 `materialUniforms`
10. 波动线条废弃接口 `measure` 改用 `length`
11. 地球实例废弃方法 `setViewer` 和 `setOption`

#### Version 1.1.6
1. 重构多边形的轮廓线实现，支持多种自定义材质类型
2. `Draw` 类新增方法 `addFeature`，手动添加可编辑对象
3. `Draw` 类新增方法 `subscribeEdit`，订阅编辑对象结束事件
4. `Draw` 类新增方法 `unsubscribeEdit`，取消订阅编辑对象结束事件

#### Version 1.1.5
1. 新增类 `EChartsOverlay` 集成Echarts视图
2. EchartsGL坐标同步Cesium渲染
3. 重构模型运动逻辑为单模型运动
4. 现模型运动支持模拟非直线运动
5. 模型包络不在随模型运动自动更新，更改为手动
6. 相机工具中新增层级与高度相互关系获取
7. 修复在没有地形数据的情况下三角测量失效的问题
8. 扩散点图层类新增修改位置及附加数据方法

#### Version 1.1.4
1. 修复热力图在隐藏的情况下依然会重复刷新渲染的问题
2. 新增扩散点图层（扩散特效）
3. 重构 `Weather` 天气特效类
4. 天气特效类现由单一场景实现替换为粒子效果实现
5. 新增天气特效可以按坐标添加
6. 新增天气特效在具体范围内实现
7. 新增天气特效附加数据管理

#### Version 1.1.3
1. 新增动态画标签的功能
2. 新增 `Covering` 自定义覆盖物类
3. 覆盖物可拖拽，实现信息框、信息提示
4. 覆盖物可跟随，并自定义锚点

#### Version 1.1.0  
1. 删除绝大部分导出的接口
2. 重构接口到相对应的类的命名空间中
3. 优化接口命名

#### Version 1.0.17  
1. 新增 `Utils.ConvertSvg2Canvas` svg图片转canvas方法
2. 新增 `PolylineTrailingMaterial` 拖尾线条自定义材质
3. 重构 `PolylineFlowingWave` 波动线条和 `PolylineFlowingDash` 流动线条两种自定义材质
4. 修复热力图更新渲染问题，修正若干ts类型声明问题
