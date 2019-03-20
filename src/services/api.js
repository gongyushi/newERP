import { stringify } from 'qs';
import request from '../utils/request';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

// return request(`http://dolphierp.cn/purchase-order/index?${stringify(params)}`,{
//   method:'post',
//   crossDomain:true,
//   headers: {
//     'Content-Type': 'json',
//   },
// })
// return erpPost('purchase-order/index',{});
// return request('http://dolpherp.cn/purchase-order/index', {
//   method: 'GET',
//   body: params,
//   headers: {
//     'Content-Type': 'json',
//   },
// });
//   const result=await erptest('purchase-order/index');
//   return  result;
// }

export async function fakeAccountLogin(params) {
  return request('http://dolpherp.cn/login', {
    method: 'POST',
    body: params,
  });
}

export function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

// 登录
export function login(params) {
  return request('http://dolpherp.cn/login', {
    method: 'post',
    body: params,
  });
}
// 产品列表
export function infoList(params) {
  return request('http://dolphierp.cn/product/info/index', {
    method: 'post',
    body: params,
  });
}
export function repositoryEditor(params) {
  return request('http://rap2api.taobao.org/app/mock/9523//example/1523091634501', {
    method: 'post',
    body: params,
  });
}
