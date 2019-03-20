import { erpPostNew } from '../services/ajax';

export default {
  namespace: 'company',
  state: {

  },
  effects: {
    // 组织架构-组织架构图
    *fetchOrganList({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('organization/index', payload);
      }, payload);
      yield put({
        type: 'queryOrganList',
        payload: data.data,
      });
    },
    // 组织架构-员工列表
    *fetchPersonList({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('organization/person/index', payload);
      }, payload);
      yield put({
        type: 'queryPersonList',
        payload: data,
      });
    },
    // 组织架构-人员详情
    *fetchPersonDetail({ payload }, { call, put }){
      const data = yield call(async () => {
        return erpPostNew('organization/person/detail', payload);
      }, payload);
      yield put({
        type: 'queryPersonDetail',
        payload: data.data,
      });
    },
    // 店铺授权-列表
    *fetchAccreditList({ payload, onCompleted }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('store/index', payload);
      }, payload);
      onCompleted(data);
      yield put({
        type: 'queryAccreditList',
        payload: data,
      });
    },
  },

  reducers: {
    // 组织架构-组织架构图数据
    queryOrganList(state, action) {
      return {
        ...state,
        organList: action.payload,
      };
    },
    // 组织架构-员工列表数据
    queryPersonList(state, action) {
      return {
        ...state,
        personList: action.payload,
      };
    },
    // 组织架构-员工详情数据
    queryPersonDetail(state, action) {
      return {
        ...state,
        personDetail: action.payload,
      };
    },
    // 店铺授权-列表
    queryAccreditList(state, action) {
      return {
        ...state,
        accreditList: action.payload,
      };
    },
  },
};
