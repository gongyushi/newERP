import { erpPostNew } from 'services/ajax';
import {
  getPurchaseIndex,
  getPurchaseEdit,
  queryGoodsList,
  commitPurchase,
  submitPurchase,
} from '../services/erp';

export default {
  namespace: 'purchaseIndex',

  state: {
    purchaseList: [],
    goodsList: [],
    newOrder: '',
  },
  effects: {
    // 列表页数据
    *fetchIndexList({ payload }, { call, put }) {
      const data = yield call(getPurchaseIndex, payload);
      yield put({
        type: 'queryIndexList',
        payload: Array.isArray(data.data) ? data.data : [],
      });
    },
    // 获取搜索结果列表
    *fetchSearchBoxList({ payload }, { call, put }) {
      const data = yield call(queryGoodsList, payload);
      yield put({
        type: 'querySearchList',
        payload: Array.isArray(data.data) ? data.data : [],
      });
    },
    // 通过id获取详情页
    *fetchPurchaseById({ payload }, { call, put }) {
      const data = yield call(getPurchaseEdit, payload);
      yield [
        put({
          type: 'editPage',
          payload: data === null ? {} : data,
        }),
        put({
          type: 'setSearchKey',
          payload: data.parrival_no === null ? data.parrival_no : '',
        }),
      ];
    },
    // 获取生成的随机单号
    *fetchNewOrder({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('purchase-order/no', payload);
      }, payload);
      yield put({
        type: 'newOrder',
        payload: data.data,
      });
    },
    // 提交
    *commintPurchase({ payload, onCompleted }, { call, put }) {
      const data = yield call(commitPurchase, payload);
      onCompleted(data);
      if (data.code === 200) {
        yield put({
          type: 'fetchIndexList',
        });
      }
    },
    // 保存
    *submitPurchase({ payload, onCompleted }, { call, put }) {
      const data = yield call(submitPurchase, payload);
      onCompleted(data);
      if (data.code === 200) {
        yield put({
          type: 'fetchIndexList',
        });
      }
    },
  },

  reducers: {
    // 列表数据
    queryIndexList(state, action) {
      return {
        ...state,
        purchaseList: action.payload,
      };
    },
    // 搜索结果的数据
    querySearchList(state, action) {
      return {
        ...state,
        goodsList: action.payload,
      };
    },
    // 获取随机生成的单号
    newOrder(state, action) {
      return {
        ...state,
        newOrder: action.payload,
      };
    },
  },
};
