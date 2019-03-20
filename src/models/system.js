import { erpPostNew } from '../services/ajax';

export default {
    namespace: 'system',
  
    state: {
        permissionList:[],
    },
    effects: {
      //  角色 - 列表
      *fetchPermissionList({ payload }, { call, put }) {
        const data = yield call(async () => {
          return erpPostNew('role/index', payload);
        }, payload);
        yield put({
          type: 'queryPermissionList',
          payload: data,
        });
      },
      // 全局配合-列表
      
    },
  
    reducers: {
      // 角色 - 列表数据
      queryPermissionList(state, action) {
        return {
          ...state,
          permissionList: action.payload,
        };
      },
      
    },
  };
  