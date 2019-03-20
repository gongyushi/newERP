import { erpPostNew } from 'services/ajax';

export default {
  namespace: 'noticesCharge',

  state: {
    pannes: [{ title: '公告管理', content: null, key: '1', closable: false }],
    activeKey: '1',
    dataSource: [],
    noticesList: [],
  },
  effects: {
    // 列表页数据
    *fetchIndexList({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('post/index', {});
      }, payload);

      yield put({
        type: 'queryIndexList',
        payload: data.data,
      });

      // put({
      //   type: 'queryIndexList',
      //   payload: data,
      //   // payload: Array.isArray(data) ? data : [],
      // });
      // if (data && Array.isArray(data)) {
      //   data.map((item, index) => {
      //     item.key = index;
      //     return item;
      //   });
      // }
    },
    // 公告添加
    *addNotice({ payload, onCompleted }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('post/add', payload, res => {
          return res.data;
        });
      }, payload);
      onCompleted(data);
      if (data.code === 200) {
        yield put({
          type: 'fetchIndexList',
        });
      }
    },
    // 删除记录
    *deleteNotice({ payload, onCompleted }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('post/delete', { post_id: payload }, res => {
          return res.data;
        });
      }, payload);
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
        noticesList: action.payload,
      };
    },
  },
};
