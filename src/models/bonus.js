import { erpPostNew } from 'services/ajax';

export default {
  namespace: 'bonus',

  state: {
    pannes: [{ title: '业绩提成', content: null, key: '1', closable: false }],
    activeKey: '1',
    dataSource: [
      {
        key: '1',
        store: '店铺A',
        storecode: '001',
        responsibleman: '王大锤',
        catagory: '鞋服',
        groupmanbonus: {
          resman: '10',
          groupman: '50',
          purchaseman: '20',
          whman: '20',
        },
        target: 2000,
        finish: 3000,
        bonusratenew: 1,
        bonusrateold: 3,
        actualbonus: 10000,
        dispatchedbonus: 96050,
        resman: '王大锤',
        ceo: '张三',
        suretime: '2018-02-05 18:23:16',
      },
    ],
  },
  effects: {
    // 列表页数据
    *fetchIndexList({ payload }, { call, put }) {
      const data = yield call(async () => {}, payload);
      if (data && Array.isArray(data)) {
        data.map((item, index) => {
          item.key = index;
          item.selected = false;
          return item;
        });
      }
      yield put({
        type: 'queryIndexList',
        payload: Array.isArray(data) ? data : [],
      });
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
    // 页签切换
    pannesOnChange(state, action) {
      return {
        ...state,
        activeKey: action.payload,
      };
    },
  },
};
