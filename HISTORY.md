# @anstec/earth

Earth 模块源码

src/  
├── components/ 组件构成  
│   ├── animation/ AnimationManager.ts 动画管理  
│   ├── bus/ 事件总线
│   │   ├── EventBus.ts 事件管理  
│   │   └── GlobalEvent.ts 全局事件  
│   ├── cluster/ 聚合图层  
│   │   ├── Cluster.ts 聚合类  
│   │   └── PrimitiveCluster.ts 图元聚合类  
│   ├── coordinate/ 坐标  
│   │   ├── Coordinate.ts 坐标转换  
│   │   └── Geographic.ts 地理坐标实现  
│   ├── covering/ Covering.ts 自定义覆盖物  
│   ├── draw/ 动态绘制  
│   │   ├── AttackArrowDynamic.ts 攻击箭头  
│   │   ├── BillboardDynamic.ts 广告牌  
│   │   ├── CircleDynamic.ts 圆  
│   │   ├── Draw.ts 暴露的动态绘制类  
│   │   ├── Dynamic.ts 各动态绘制抽象类  
│   │   ├── LabelDynamic.ts 标签  
│   │   ├── ModelDynamic.ts 模型  
│   │   ├── PincerArrowDynamic.ts 钳击箭头  
│   │   ├── PointDynamic.ts 点  
│   │   ├── PolygonDynamic.ts 多边形  
│   │   ├── PolylineDynamic.ts 折线段  
│   │   ├── RectangleDynamic.ts 矩形  
│   │   ├── StraightArrowDynamic.ts 直角箭头  
│   │   ├── StrokeDynamic.ts 笔触  
│   │   └── WallDynamic.ts 墙体  
│   ├── heatmap/ Heatmap.ts 热力图  
│   ├── layers/ 图层实现  
│   │   ├── BillboardLayer.ts 广告牌图层  
│   │   ├── DiffusePointLayer.ts 扩散点图层  
│   │   ├── EllipseLayer.ts 圆、椭圆图层  
│   │   ├── EllipsoidLayer.ts 椭球图层、模型包络实现  
│   │   ├── GraphicsLayer.ts Earth默认提供的图层集合  
│   │   ├── LabelLayer.ts 标签图层  
│   │   ├── Layer 基本图层抽象类  
│   │   ├── ModelLayer.ts 模型图层  
│   │   ├── ParticleLayer.ts 粒子系统  
│   │   ├── PointLayer.ts 点图层  
│   │   ├── PolygonLayer.ts 折线段图层  
│   │   ├── PolylineLayer.ts 线段图层  
│   │   ├── RectangleLayer.ts 矩形图层  
│   │   └── WallLayer.ts 墙体图层  
│   ├── material/ 材质  
│   │   ├── CustomMaterial.ts 自定义材质缓存Cache  
│   │   ├── PolylineFlowingDashMaterial.ts 自定义流动线条材质  
│   │   ├── PolylineFlowingWaveMaterial.ts 自定义波动线条材质  
│   │   └── PolylineTrailingMaterial.ts 自定义拖尾线条材质  
│   ├── measure/ Measure.ts 测量  
│   ├── menu/ ContextMenu.ts 上下文菜单  
│   ├── overlay/ EchartsOverlay.ts Echarts图表工具集成  
│   ├── radar/ Radar.ts 雷达  
│   ├── sensor/ Sensor.ts 传感器  
│   ├── weather/ Weather.ts 天气特效  
│   └── wind/ WindField.ts 风场  
├── hooks/ 钩子  
│   ├── useEarth.ts 初始化Earth / 托管Viewer  
│   ├── useNavigation.ts 初始化地图控制摇杆  
│   └── useTileImageryProvider.ts 生成Provider  
├── images/ 图片资源  
├── shaders/ 着色器  
├── style/ 样式（上下文菜单、自定义覆盖物、动态扩散点等）  
├── utils/ 其他工具  
│   ├── Camera.ts 相机工具方法  
│   ├── Figure.ts 功能算法  
│   ├── State.ts 状态（绘制、测量）管理  
│   └── Utils.ts 工具方法  
└── cesium.extend.d.ts Cesium补充导出类型  

## 打包Earth模块

```sh
npm run build
```

## 自动化生成说明文档并生成Vuepress设置

```sh
npm run doc
```

## 本地运行Vuepress在线文档

```sh
npm run doc:dev
```

## 打包文档

```sh
npm run doc:build
```

## 打包Earth模块并生成发布的.d.ts

```sh
npm run release
```
