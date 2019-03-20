// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
  return localStorage.getItem('antd-pro-authority') || 'guest';
}

export function setAuthority(authority) {
  return localStorage.setItem('antd-pro-authority', authority);
}

// 存储权限列表值
export function setMenuList(token) {
  return localStorage.setItem('menuList', token);
}
// 储存功能权限列表
export function setActionList(actionList) {
    return localStorage.setItem('actionList', actionList);
}
// 取功能权限列表
export function getActionList() {
    return localStorage.getItem('actionList');
}
// 存储token值
export function setToken(token) {
  return localStorage.setItem('token', token);
}
// 取token值
export function getToken() {
  return localStorage.getItem('token');
}
// 存储锁屏时间
export function setScreenTime(token) {
  return localStorage.setItem('screenTime', token);
}
// 存储userName
export function setUserName(user) {
    return localStorage.setItem('userName', user);
}
// 存储userName
export function getUserName() {
    return localStorage.getItem('userName');
}
// 存储锁屏按钮
export function setShowBack(user) {
  return localStorage.setItem('showBack', user);
}
// 存储轮询时间
export function setCache(value) {
  return localStorage.setItem('cacheUpdate', value);
}
// 常用-存储字典
export function setDictionary(value) {
  return localStorage.setItem('dictionary', value);
}
// 常用-地址树
export function setAddress(value) {
  return localStorage.setItem('address', value);
}
// 常用-角色列表
export function setRoleFun(value) {
  return localStorage.setItem('roleList', value);
}
// 常用-仓库列表
export function setWarehouseFun(value) {
  return localStorage.setItem('warehouseList', value);
}
// 常用-店铺列表
export function setStoreFun(value) {
  return localStorage.setItem('storeList', value);
}
// 常用-组织架构
export function setOrganizationList(value) {
  return localStorage.setItem('organizationList', value);
}

// 存储 TabPanels
export function setTabPanels(panels) {
    return localStorage.setItem('TabPanels', panels);
}
// 取得 TabPanels
export function getTabPanels() {
    return localStorage.getItem('TabPanels');
}