import { erpPostNew } from '../services/ajax';

export default {
  namespace: 'erpHome',

  state: {
    homeTodoData: [],
    notificationList:[],
  },
  effects: {
    
    //  首页 - 待办事项列表
    *fetchHomeTodoList({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('todolisting/index', payload);
      }, payload);
      yield put({
        type: 'queryHomeTodoList',
        payload: data.data,
      });
    },
    // 通知列表
    *fetchNotificationList({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('message/index', payload);
      }, payload);
      yield put({
        type: 'queryNotificationList',
        payload: data.data,
      });
    },
    // 更新待办事项状态
    *fetchUpdateTodo({ payload }, { call, put }) {
      const data = yield call(async () => {
        return erpPostNew('todolisting/update', payload);
      }, payload);
      yield put({
        type: 'queryUpdateTodo',
        payload: data.data,
      });
    },
  },

  reducers: {
    // 通知列表
    queryNotificationList(state, action) {
      return {
        ...state,
        notificationList: action.payload,
      };
    },
    // 待办事项列表数据
    queryHomeTodoList(state, action) {
      return {
        ...state,
        homeTodoData: action.payload,
      };
    },
    
  },
};
