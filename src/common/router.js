import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getMenuData, getMenuByPath } from './menu';
import { FilterSlash } from '../utils/utils';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus&&menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    // 首页
    '/home': {
      component: dynamicWrapper(app, [], () => import('../routes/home/home')),
    },
    // 资料管理
    '/product/index': {
      component: dynamicWrapper(app, [], () => import('../routes/product/index')),
    },
    '/product/add': {
      component: dynamicWrapper(app, [], () => import('../routes/product/add')),
    },
    '/product/detail': {
      component: dynamicWrapper(app, [], () => import('../routes/product/detail')),
    },
    '/product-relate-listing/listing/index': {
      component: dynamicWrapper(app, [], () => import('../routes/product-relate-listing/listing/index')),
    },

    '/product-relate-listing/product/add': {
      component: dynamicWrapper(app, [], () => import('../routes/product-relate-listing/listing/add')),
    },

    // 营销
    '/marketing/competition': {
      component: dynamicWrapper(app, [], () => import('../routes/marketing/competition')),
    },
    '/listing/index': {
      component: dynamicWrapper(app, [], () => import('../routes/marketing/onlineProducts')),
    },
    '/listing-dynamic-data/index': {
      component: dynamicWrapper(app, [], () => import('../routes/listing-dynamic-data/index')),
    },
    // '/marketing/targetCharge': {
    //   component: dynamicWrapper(app, [], () => import('../routes/marketing/targetCharge')),
    // },
    '/commission/index': {
      component: dynamicWrapper(app, [], () => import('../routes/marketing/bonus')),
    },
    // 订单
    '/order/index': {
      component: dynamicWrapper(app, [], () => import('../routes/marketing/orderList')),
    },
    // 物流
    '/logistics/logistics-appoint': {
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    '/logistics/demand-management': {
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    '/logistics/logistics/logistics-appoint': {
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    '/logistics/committed': {
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    '/logistics/urgent': {
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    '/logistics/direct': {
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    // '/logistics/logistics-appoint': {
    //   component: dynamicWrapper(app, [], () => import('../routes/Logistics/index')),
    // },
    // '/logistics/demand-management': {
    //   component: dynamicWrapper(app, [], () => import('../routes/Logistics/demandManagement')),
    // },
    // '/logistics/warehouse-allotting': {
    //   component: dynamicWrapper(app, [], () => import('../routes/Logistics/warehouseAllotting')),
    // },
    // 采购
    '/supplier/index': {
      component: dynamicWrapper(app, [], () => import('../routes/supplier/index')),
    },
    '/supplier/detail': {
      component: dynamicWrapper(app, [], () => import('../routes/supplier/detail')),
    },
    '/requisition-plan/index': {   // 调拨计划
      component: dynamicWrapper(app, [], () => import('../routes/Purchase/appropriationPlan')),
    },
    '/requisition-warning/index': {   // 调拨预警
      component: dynamicWrapper(app, [], () => import('../routes/requisition-warning/index')),
    },
    '/requisition-warning/detail': {   // 调拨预警
      component: dynamicWrapper(app, [], () => import('../routes/requisition-warning/detail')),
    },
    '/purchasing-warning/index': {   // 采购预警
      component: dynamicWrapper(app, [], () => import('../routes/purchasing-warning/index')),
    },
    '/purchasing-warning/detail': {   // 采购预警详情
      component: dynamicWrapper(app, [], () => import('../routes/purchasing-warning/detail')),
    },
    '/purchase-plan/index': {   // 采购计划
      component: dynamicWrapper(app, [], () => import('../routes/Purchase/shoppingList')),
    },
    '/purchase/replenishment-demand': {
      component: dynamicWrapper(app, [], () => import('../routes/Purchase/ReplenishmentDemand')),
    },
    '/purchase/index': { // 采购单
      component: dynamicWrapper(app, [], () => import('../routes/purchase1/index')),
    },
    '/purchase/detail': { // 采购单详情
      component: dynamicWrapper(app, [], () => import('../routes/purchase1/detail')),
    },
    '/purchase-batch/detail-base': { // 批次
      component: dynamicWrapper(app, [], () => import('../routes/purchase-batch/detail-base')),
    },
    '/purchase/detail': { // 采购单详情
      component: dynamicWrapper(app, [], () => import('../routes/Purchase/public/PurchaseDetail')),
    },
    '/purchase/purchase-AOG': {
      component: dynamicWrapper(app, ['purchaseIndex'], () =>
        import('../routes/Purchase/PurchaseAOG')
      ),
    },
    '/requisition/index': {      // 调拨单
      component: dynamicWrapper(app, [], () =>import('../routes/requisition/index')),
    },
    '/requisition/detail': {      // 调拨单详情
      component: dynamicWrapper(app, [], () =>import('../routes/requisition/detail')),
    },
    // 仓库
    '/warehouse-product/index': {
      component: dynamicWrapper(app, [], () => import('../routes/Warehouse/StoreList')),
    },
    // '/warehouse/put-in-storage': {
    //   component: dynamicWrapper(app, [], () => import('../routes/Warehouse/ARinStore')),
    // },

    '/warehouse-receipt/inbound/index': {
      component: dynamicWrapper(app, [], () => import('../routes/warehouse-receipt/inbound/index')),
    },
    '/warehouse-receipt/inbound/detail': {
      component: dynamicWrapper(app, [], () => import('../routes/warehouse-receipt/inbound/detail')),
    },

    '/warehouse/EX-warehouse': {
      component: dynamicWrapper(app, [], () => import('../routes/Warehouse/ARoutStore')),
    },

    '/shipments-outbound/index': { // 亚马逊配送出库
      component: dynamicWrapper(app, [], () => import('../routes/shipments-outbound/index')),
    },
    '/shipments-outbound/detail': { // 亚马逊配送出库详情
      component: dynamicWrapper(app, [], () => import('../routes/shipments-outbound/detail')),
    },

    '/shipments-inbound/index': { // 配送入库
      component: dynamicWrapper(app, [], () => import('../routes/shipments-inbound/index')),
    },
    '/shipments-inbound/detail': { // 配送入库详情
      component: dynamicWrapper(app, [], () => import('../routes/shipments-inbound/detail')),
    },

    // 客服
    '/service/monitoring': {
      name: '差评监控',
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    '/service/process': {
      name: '差评处理',
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    '/service/answer': {
      name: '网店问答',
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    '/service/portrayal': {
      name: '客户画像',
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    // '/service/monitoring': {
    //   name: '差评监控',
    //   component: dynamicWrapper(app, [], () => import('../routes/service/monitoring')),
    // },
    // '/service/process': {
    //   name: '差评处理',
    //   component: dynamicWrapper(app, [], () => import('../routes/service/process')),
    // },
    // '/service/answer': {
    //   name: '网店问答',
    //   component: dynamicWrapper(app, [], () => import('../routes/service/answer')),
    // },
    // '/service/portrayal': {
    //   name: '客户画像',
    //   component: dynamicWrapper(app, [], () => import('../routes/service/portrayal')),
    // },
    // 财务
    '/finance/apauditor': {
      component: dynamicWrapper(app, [], () => import('../routes/finance/apauditor')),
    },
    // 数据
    '/data/purchase': {
      name: '采购数据',
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    '/data/logistics': {
      name: '物流数据',
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    '/data/market': {
      name: '销售数据',
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    '/data/finance': {
      name: '财务数据',
      component: dynamicWrapper(app, [], () => import('../routes/data/unDevelop')),
    },
    // '/data/purchase': {
    //   name: '采购数据',
    //   component: dynamicWrapper(app, [], () => import('../routes/data/purchase')),
    // },
    // '/data/logistics': {
    //   name: '物流数据',
    //   component: dynamicWrapper(app, [], () => import('../routes/data/logistics')),
    // },
    // '/data/market': {
    //   name: '销售数据',
    //   component: dynamicWrapper(app, [], () => import('../routes/data/market')),
    // },
    // '/data/finance': {
    //   name: '财务数据',
    //   component: dynamicWrapper(app, [], () => import('../routes/data/finance')),
    // },
    // 企业
    '/enterprise/view': {
      name: '企业信息',
      component: dynamicWrapper(app, [], () => import('../routes/company/message')),
    },
    '/organization/index': {
      name: '组织架构',
      component: dynamicWrapper(app, [], () => import('../routes/company/organization')),
    },
    '/store/index': {
      component: dynamicWrapper(app, [], () => import('../routes/store/index')),
    },
    '/warehouse/index': {
      name: '仓库设置',
      component: dynamicWrapper(app, [], () => import('../routes/warehouse1/index')),
    },
    '/company/audit': {
      name: '经理审核',
      component: dynamicWrapper(app, [], () => import('../routes/company/audit')),
    },
    '/message/index': {
      name: '公告管理',
      component: dynamicWrapper(app, ['noticesCharge'], () => import('../routes/company/noticeManage')),
    },
    // 系统
    '/config/index': {
      name: '全局配置',
      component: dynamicWrapper(app, [], () => import('../routes/config/index')),
    },
    '/role/index': {
      name: '权限管理',
      component: dynamicWrapper(app, [], () => import('../routes/role/index')),
    },
    '/role/add': {
      component: dynamicWrapper(app, [], () => import('../routes/role/add')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () =>
        import('../routes/Exception/triggerException')
      ),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    // 登录页面
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    '/user/register': {
      component: dynamicWrapper(app, [], () => import('../routes/User/Register')),
    },
    '/user/register-result': {
      component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
    },
  };
  // Get name from ./menu.js or just set it in the router data.
  let menuData = getFlatMenuData(getMenuData());
  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    // 弃用以前的方法， 直接使用远程给定的菜单数据生成路由信息
    menuData = localStorage.getItem('menuList') ? JSON.parse(localStorage.getItem('menuList')) : [];
    menuItem = getMenuByPath(menuData, FilterSlash(path));
    // 如果是顶级菜单，则路由改为顶级菜单下的第一个子菜单
    menuItem = (
      menuItem.parent_id ===0 &&
      toString.call(menuItem.items) === '[object Array]' &&
      menuItem.items.length > 0
    ) ? menuItem.items[0] : menuItem;
    router = {
      ...router,
      name: router.name || menuItem.text,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
