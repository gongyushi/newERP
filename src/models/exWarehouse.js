import {
  exWarehouseList,
  // getEXWarehouseDetail,
  // exWarehouseSave,
  // exWarehouseSubmit,
} from '../services/apil';

export default {
  namespace: 'exWarehouseIndex',
  state: {
    exWarehouseListData: [],
  },
  effects: {
    *fetchEXList({ payload }, { call, put }) {
      const data = yield call(exWarehouseList, payload);
      yield put({
        type: 'queryIndexList',
        payload: Array.isArray(data.data) ? data.data : [],
      });
    },
  },
  reducers: {
    // 列表数据
    queryIndexList(state, action) {
      return {
        ...state,
        exWarehouseListData: action.payload,
      };
    },
  },
};
