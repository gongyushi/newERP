import { isUrl } from '../utils/utils';

function formatter(data, parentPath = '/', parentAuthority) {
  return data=== null ? [] : data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}
export const getMenuData = () => formatter(JSON.parse(localStorage.getItem('menuList')));
// 根据当前 path 获取当前path 对应的 siderMenu
export const getSiderMenu = (path) => {
  const menuars = localStorage.getItem('menuList') ? JSON.parse(localStorage.getItem('menuList')) : [];
  const currentMenu = getMenuByPath(menuars, path);
  const parentMenus = getParentMenus(menuars, currentMenu).reverse();
  const topMenu = (parentMenus.length <= 0) ? currentMenu : parentMenus.slice(0,1)[0];
  return {
    'currentMenu': currentMenu,
    'parentMenus': parentMenus,
    'topMenu': topMenu,
  };
};
// 递归根据 path 获取 menu
export const getMenuByPath = (items, path) => {
  if(toString.call(items) === '[object Array]'){
    for(let i=0; i<items.length; i++){
      if(items[i].path === path){
        return items[i];
      }
      const result = getMenuByPath(items[i].items, path);
      if(result !== false) {
        return result;
      }
    }
  }
  return false;
}
// 递归根据 id 获取 menu
function getMenuById(items, id){
  if(toString.call(items) === '[object Array]'){
    for(let i=0; i<items.length; i++){
      if(items[i].id === id){
        return items[i];
      }
      const result = getMenuById(items[i].items, id);
      if(result !== false) {
        return result;
      }
    }
  }
  return false;
}
// 递归根据 menu 获取 parent menu 数组
function getParentMenus(items, menu){
  const menus = [];
  const parent = getMenuById(items, menu.parent_id);
  if(parent !== false) {
    menus.push(parent);
    return menus.concat(getParentMenus(items, parent));
  }
  return menus;
}


