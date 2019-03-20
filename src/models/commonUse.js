import { erpPostNew } from '../services/ajax';
import {
  setDictionary,
  setAddress,
  setRoleFun,
  setWarehouseFun,
  setStoreFun,
  setOrganizationList,
  setCache,
}from '../utils/authority';

export default {
  namespace: 'commonUse',

  state: {
    erpCacheList: [],
    dictionaryList: [],    // 字典  平台、站点
  },
  effects: {
    // 轮询接口
    *fetchCache({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('index/compare-cache-update', payload);
      }, payload);
      const localCaches = JSON.parse(localStorage.getItem('cacheUpdate'))
      if (typeof JSON.parse(localCaches) === 'object'){
        const cacheData=data.data;
        cacheData['area/lists'] = Number(cacheData['area/lists']) > Number(localCaches['area/lists'])? null : Number(localCaches['area/lists']) // 地址树
        cacheData['store/list'] = Number(cacheData['store/list']) > Number(localCaches['store/list']) ? null : Number(localCaches['store/list'])  // 店铺
        cacheData['role/index'] = Number(cacheData['role/index']) > Number(localCaches['role/index']) && Number(localCaches['role/index']) > 0 ? Number(cacheData['role/index']) : Number(localCaches['role/index'])  // 角色
        cacheData['warehouse/list'] = Number(cacheData['warehouse/list']) > Number(localCaches['warehouse/list']) ? null : Number(localCaches['warehouse/list'])  // 仓库
        cacheData['organization/index'] = Number(cacheData['organization/index']) > Number(localCaches['organization/index']) ? null: Number(localCaches['organization/index'])  // 组织架构
        cacheData['dictionary/lists'] = Number(cacheData['dictionary/lists']) > Number(localCaches['dictionary/lists'])?null: Number(localCaches['dictionary/lists']) // 字典
        cacheData['permission/list'] = Number(cacheData['permission/list']) > Number(localCaches['permission/list']) ? null: Number(localCaches['permission/list']) // 权限列表
        cacheData['person/list'] = Number(cacheData['person/list']) > Number(localCaches['person/list'])  ? null : Number(localCaches['person/list']) // 人员列表
        cacheData['person/index'] = Number(cacheData['person/index']) > Number(localCaches['person/index']) ? null : Number(localCaches['person/index'])  // 元
        setCache(JSON.stringify(cacheData))
      }else {
        setCache(JSON.stringify(data.data))
      }
      yield put({
        type: 'queryCacheUpdate',
        payload: data.data,
      });
    },
    // 字典  平台、站点
    *fetchDictionary({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('index/dictionary/lists', payload);
      }, payload);
      // onCompleted(data)
      // const obj = {
      //   timestamp: data.timestamp,
      //   data: data.data,
      // };
      // setDictionary(JSON.stringify(obj));
      yield put({
        type: 'queryDictionary',
        payload: data.data,
      });
    },
    // 地址树
    *fetchAddress({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('index/area/lists', payload);
      }, payload);
      // const obj = {
      //   timestamp: data.timestamp,
      //   data: data.data,
      // };
      // const cacheUpdate = JSON.parse(localStorage.getItem('cacheUpdate'));
      // setAddress(JSON.stringify(obj));

      // cacheUpdate['area/lists'] = data.timestamp;
      // setCache(JSON.stringify(cacheUpdate))
      yield put({
        type: 'queryAddress',
        payload: data.data,
      });
    },
    // 权限列表
    *fetchRoleFun({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('permission/index', payload);
      }, payload);
      const obj = {
        timestamp: data.timestamp,
        data: data.data,
      };
      setRoleFun(JSON.stringify(obj));
      yield put({
        type: 'queryRoleFun',
        payload: data.data,
      });
    },
    // 角色列表
    *fetchRoleListFun({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('role/index', payload);
      }, payload);
      const obj = {
        timestamp: data.timestamp,
        data: data.data,
      };
      setRoleFun(JSON.stringify(obj));
      yield put({
        type: 'queryRoleListFun',
        payload: data.data,
      });
    },
    // 仓库列表
    *fetchWarehouseFun({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('warehouse/index', payload);
      }, payload);
      const obj = {
        timestamp: data.timestamp,
        data: data.data || [],
      };
      setWarehouseFun(JSON.stringify(obj));
      yield put({
        type: 'queryWarehouseFun',
        payload: data.data,
      });
    },
    // 组织架构
    *fetchOrganization({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('organization/index', payload);
      }, payload);
      // const obj = {
      //   timestamp: data.timestamp,
      //   data: data.data,
      // };
      // setOrganizationList(JSON.stringify(obj));
      yield put({
        type: 'queryOrganization',
        payload: data.data || [],
      });
    },
    // 组织列表
    *fetchOrganizationList({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('organization/lists', payload);
      }, payload);
      // const obj = {
      //   timestamp: data.timestamp,
      //   data: data.data,
      // };
      // setOrganizationList(JSON.stringify(obj));
      yield put({
        type: 'queryOrganizationList',
        payload: data.data || [],
      });
    },
    // 店铺列表
    *fetchStoreFun({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('store/index', payload);
      }, payload);
      const obj = {
        timestamp: data.timestamp,
        data: data.data,
      };
      setStoreFun(JSON.stringify(obj));
      yield put({
        type: 'queryStoreFun',
        payload: data.data,
      });
    },
  },

  reducers: {
    // 轮询数据
    queryCacheUpdate(state, action) {
      return {
        ...state,
        erpCacheList: action.payload,
      };
    },
    // 字典数据
    queryDictionary(state, action) {
      return {
        ...state,
        dictionaryList: action.payload,
      };
    },
    // 地址树数据
    queryAddress(state, action) {
      return {
        ...state,
        addressList: action.payload,
      };
    },
    // 权限列表数据
    queryRoleFun(state, action) {
      return {
        ...state,
        roleList: action.payload,
      };
    },
    // 角色列表数据
    queryRoleListFun(state, action) {
      return {
        ...state,
        roleListList: action.payload,
      };
    },
    // 仓库列表数据
    queryWarehouseFun(state, action) {
      return {
        ...state,
        warehouseList: action.payload,
      };
    },
    // 组织架构数据
    queryOrganization(state, action) {
      return {
        ...state,
        organization: action.payload,
      };
    },
    // 组织架构列表数据
    queryOrganizationList(state, action) {
      return {
        ...state,
        organizationList: action.payload,
      };
    },
    // 店铺列表数据
    queryStoreFun(state, action) {
      return {
        ...state,
        storeList: action.payload,
      };
    },
  },
};
