export enum EarthRadius {
  AVERAGE = 6371393,
  EQUATOR = 6378137,
  POLE = 6356725,
}

/**
 * @description uid连接符格式
 * 1. `D` 减号连接符
 * 2. `P` 加号连接符
 * 3. `N` 无连接符
 * @deprecated 已废弃，现支持自选连接符
 */
export enum UidFormat {
  D = "Decrease",
  P = "Plus",
  N = "None",
}

/**
 * @description 经纬度格式化格式
 * 1. `DMS` 度分秒(Degrees Minute Second)
 * 2. `DMSS` 度分秒简写(Degrees Minute Second Short)
 */
export enum CoorFormat {
  DMS = "DMS",
  DMSS = "DMSS",
}
