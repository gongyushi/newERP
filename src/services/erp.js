import { erpPostNew } from '../services/ajax';

// 采购-采购单接口
// 采购列表
export async function purchaseOrderList(params) {
  return erpPostNew('purchase-order/index', params);
}

// 采购模块
export async function queryGoodsList(params) {
  return erpPostNew('purchase-order/index', params, res => {
    return res.data.data;
  });
}

// 采购到货列表
export async function getPurchaseIndex(params) {
  return erpPostNew('purchase-arrival/index', params, res => {
    return res.data.data;
  });
}

// 采购到货编辑
export async function getPurchaseEdit(params) {
  return erpPostNew('purchase-arrival/view', params, res => {
    return res.data.data;
  });
}

// 仓库-入库管理
export async function getStorageList(params) {
  // 表格
  return erpPostNew('inbound/index', params, res => {
    return res.data.data;
  });
}

// 采购到货提交
export async function commitPurchase(params) {
  return erpPostNew('purchase-arrival/commit', params, res => {
    return res.data;
  });
}

// 采购到货保存
export async function submitPurchase(params) {
  if (params.type === 'edit') {
    return erpPostNew('purchase-arrival/edit', params.values, res => {
      return res.data;
    });
  } else {
    return erpPostNew('purchase-arrival/add', params.values, res => {
      return res.data;
    });
  }
}
