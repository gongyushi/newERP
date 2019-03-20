import { erpPostNew } from '../services/ajax';

// 仓库-出库
// 出库列表
export async function exWarehouseList(params) {
  return erpPostNew('outbound/index', params);
}
// 出库详情
export async function getEXWarehouseDetail(params) {
  return erpPostNew('outbound/view', params);
}
// 出库保存
export async function exWarehouseSave(params) {
  if (params.type === 'edit') {
    return erpPostNew('outbound/edit', params.values);
  } else {
    return erpPostNew('outbound/add', params.values);
  }
}
// 出库提交
export async function exWarehouseSubmit(params) {
  return erpPostNew('outbound/commit', params);
}
