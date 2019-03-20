import { purchaseOrderList } from '../services/erp';

export default {
  namespace: 'purchaseOrder',

  state: {
    orderlist: [],
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const data = yield call(purchaseOrderList, payload);
      yield put({
        type: 'queryList',
        payload: data.data,
      });
    },
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        orderlist: action.payload,
      };
    },
  },
};
