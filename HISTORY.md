## @anstec/earth

### 版本更新历史记录

#### Version 2.2.2
1. 新增属性 `PointLayer.labelLayer`，现在点图层也可以添加附属标签
2. 修正 `EChartsOverlay` 的构造器函数的入参
3. 废弃参数 `EChartsOverlay.ConstructionOptions.earth`
4. 修正若干类型声明错误

#### Version 2.2.1
1. 修复若干类型声明错误

#### Version 2.2.0
1. 新增积云图层类，提供积云图层展示
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
1. 新增全局事件类，提供全局鼠标事件订阅
2. 修订若干类型声明错误

#### Version 2.0.0
1. 新增动画管理器类，简化播放开发流程（entity实现，性能不如primitive）
2. 发布至npm公开版本，版本号重置为2.0.0

#### Version 1.1.7
1. 动态绘制类新增方法，订阅绘制或编辑时事件
2. 动态绘制类新增方法，取消订阅绘制或编辑时事件
3. 新增动画控件，支持随时间播放相关目标、轨迹
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
2. 动态绘制类新增方法，手动添加可编辑对象
3. 动态绘制类新增方法，订阅编辑对象结束事件
4. 动态绘制类新增方法，取消订阅编辑对象结束事件

#### Version 1.1.5
1. 新增Earth集成Echarts视图
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
3. 重构天气特效类
4. 天气特效类现由单一场景实现替换为粒子效果实现
5. 新增天气特效可以按坐标添加
6. 新增天气特效在具体范围内实现
7. 新增天气特效附加数据管理

#### Version 1.1.3
1. 新增动态画标签的功能  
2. 新增自定义覆盖物工具
3. 覆盖物可拖拽，实现信息框、信息提示
4. 覆盖物可跟随，并自定义锚点

#### Version 1.1.0  
1. 删除绝大部分导出的接口  
2. 重构接口到相对应的类的命名空间中  
3. 优化接口命名  

#### Version 1.0.17  
1. 新增svg图片转canvas工具  
2. 新增拖尾线条自定义材质  
3. 重构波动线条和流动线条两种自定义材质  
4. 修复热力图更新渲染问题，修正若干ts类型声明问题
