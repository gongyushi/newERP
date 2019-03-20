import { erpPostNew } from 'services/ajax';

export default {
  namespace: 'targetCharge',

  state: {
    pannes: [{ title: '目标管理', content: null, key: '1', closable: false }],
    activeKey: '1',
    dataSource: [
      {
        key: '1',
        group: 'A小组',
        groupman: ['张大山', '刘晓吧', '黄校'],
        station: 'Amazon-US',
        store: 'A店铺',
        prod_info1: 'Sony/索尼',
        prod_info2: '(28-70)蚂蚁摄影',
        prod_info3: 'SKU:abc123456',
        prod_info4: 'Asin:87382747',
        sellnum: 56,
        rank_yesterday: 4500,
        rank_today: 2500,
        prod_stock: 1000,
        starlevel: 5.0,
        comment: 10025,
        leavemsgrate: 0.25,
        price: 9.9,
        lastmonthtarget: 3500,
        execution: 0.7,
        suretarget_currentmonth: 4000,
        suretarget_nextmonth: 5000,
      },
      {
        key: '2',
        group: 'A小组',
        groupman: ['张大山', '刘晓吧', '黄校'],
        station: 'Amazon-US',
        store: 'A店铺',
        prod_info1: 'Sony/索尼',
        prod_info2: '(28-70)蚂蚁摄影',
        prod_info3: 'SKU:abc123456',
        prod_info4: 'Asin:87382747',
        sellnum: 56,
        rank_yesterday: 4500,
        rank_today: 2500,
        prod_stock: 1000,
        starlevel: 5.0,
        comment: 10025,
        leavemsgrate: 0.25,
        price: 9.9,
        lastmonthtarget: 3500,
        execution: 0.7,
        suretarget_currentmonth: 4000,
        suretarget_nextmonth: 5000,
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
