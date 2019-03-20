import { getStorageList } from '../services/erp';

export default {
  namespace: 'getStorage',

  state: {
    storagelist: [],
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const data = yield call(getStorageList, payload);
      yield put({
        type: 'storageList',
        payload: data.data,
      });
    },
  },

  reducers: {
    storageList(state, action) {
      return {
        ...state,
        storagelist: action.payload,
      };
    },
  },
};
