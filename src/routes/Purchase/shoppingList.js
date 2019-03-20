import React from 'react';
import { Tabs, Button, Table, Modal, message,Popconfirm} from 'antd';
import Search from './public/shoppingListSearch';
import CreatePurchaseOrder from './public/createPurchaseOrder';
import EditableRow from '../../components/EditableRow';
import { erpPost } from '../../services/ajax';
import ProductCell from '../../components/ProductCell';

const { TabPane } = Tabs;

class ShoppingList extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      panes: [{ title: '采购计划', content: '', key: '1', closable: false }],
      activeKey: '1',
      selectedRowKeys: [], // Check here to configure the default column
      deleteLoading: 0,
      deleteLoadings: false,
      loading: false,
      saveLoading: 0,
      actionEdit: true,   //  操作单个
      page: {
        pageSize: 10,
        total: 0,
        current: 1,
        showSizeChanger: true,
      },
      order: [],
      dataSource: [],
      keyword: {},  //  搜索关键词
      editRow: 0,
      splitDataSource:[],
      createDialVisible: false,     //  创建调拨单
      logisticsVisible: false,       //  拆分
    }
  }
  componentDidMount() {
    this.getPurchasePlanList(this.state.page, this.state.order, this.state.keyword);
  }
  // 单元格编辑
  onCellChange = (dataIndex, data) => {
    const dataSource = [...this.state.dataSource];
    const target = dataSource.find(item => {
      return item.id === this.state.editRow;
    });
    if (target) {
      target[dataIndex] = data;
      this.setState({ dataSource });
    }
  };
  onRef = (ref) => {
    this.child = ref
  }
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.prodListFun(pageNumber, order);
  };
  // 采购计划列表
  getPurchasePlanList = (pageNumber, orders, keyword) => {
    this.setState({
      loading: true,
    })
    const can = {
      warehouse_id: keyword.warehouse_id || '',
      supplier_id: keyword.supplier_id || '',
      key: keyword.key || '',
      value: keyword.value || '',
      page: pageNumber,
      order: orders,
    }
    erpPost('purchase-plan/index', can, res => {
      this.setState({
        loading: false,
        dataSource: res.data.data,
      })
    }, () => {
      this.setState({
        loading: false,
      })
    })
  }
  
  //  行编辑
  requisitionEdit = (e) => {
    this.setState({
      editRow: e,
      scratchData: this.state.dataSource,
      actionEdit: false,
    })
  }
  // 行编辑保存
  editSave = (e) => {
    const dataSource = [...this.state.dataSource];
    const target = dataSource.find(item => {
      return item.id === e;
    });
    if (target) {
      const can = {
        id: target.id,
        quantity: target.quantity,
        cost: target.cost,
        plan_arrive_at: target.plan_arrive_at,
      }
      this.setState({
        saveLoading: e,
      })
      erpPost("purchase-plan/edit", can, res => {
        message.success(res.data.msg)
        this.getPurchasePlanList(this.state.page, this.state.order, this.state.keyword);
        this.setState({
          editRow: 0,
          saveLoading: 0,
          actionEdit: true,   //  操作单个
        })
      }, () => {
        this.setState({
          saveLoading: 0,
        })
      })
    }

  }
  // 批量删除记录
  batchDelete = () => {
    this.setState({
      deleteLoadings: true,
    })
    erpPost('purchase-plan/batch-delete', { ids: this.state.selectedRowKeys.join(',') }, res => {
      message.success(res.data.msg)
      this.setState({
        deleteLoadings: false,
        selectedRowKeys: [],
        choseList: [],
      })
      this.getPurchasePlanList(this.state.page, this.state.order, this.state.keyword);
    }, () => {
      this.setState({
        deleteLoadings: false,
      })
    })
  }
  // 删除记录
  requisitionDelete = (a) => {
    this.setState({
      deleteLoading: a,
    })
    erpPost('purchase-plan/delete', { id: a }, res => {
      message.success(res.data.msg)
      this.setState({
        deleteLoading: 0,
        selectedRowKeys: [],
        choseList: [],
      })
      this.getPurchasePlanList(this.state.page, this.state.order, this.state.keyword);
    }, () => {
      this.setState({
        deleteLoading: 0,
      })
    })
  }
  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '采购计划', content: 'Content of new Tab', key: activeKey,
    });
    this.setState({ panes, activeKey });
  }
  // 搜索提交
  handleSubmit = (e) => {
    this.setState({
      keyword: e,
    })
    this.getPurchasePlanList(this.state.page, this.state.order, e);
  }
  // 生成采购单
  generate = (e) => {
    const can = {
      ids: e.ids&&e.ids.join(','),
      remark: e.remark || '',
    }
    erpPost('purchase-plan/purchase/generate', can, res => {
      message.success(res.data.msg)
      this.getPurchasePlanList(this.state.page, this.state.order, this.state.keyword);
      this.setState({
        createDialVisible: false,
      });
    })
  }
  // 弹框
  showModal = (e) => {
    if (e === 1) {
      if (this.state.selectedRowKeys.length > 0) {
        const can = {
          ids: this.state.selectedRowKeys.join(','),
        }
        erpPost('purchase-plan/product/select-fit', can, () => {
          this.setState({
            createDialVisible: true,
          });
        })
      } else {
        message.warning('请选择调拨计划')
      }
    }else if (e === 2) {
      this.setState({
        logisticsVisible: true,
      })
    }
  }

  handleOk = (e) => {
    if (e === 1) {
      this.child.handleSubmit()
    } else if (e === 2) {
      this.setState({
        logisticsVisible: false,
      });
    }
  }

  handleCancel = (e) => {
    if (e === 1) {
      this.setState({
        createDialVisible: false,
      });
    }else if (e === 2) {
      this.setState({
        logisticsVisible: false,
      });
    }

  }
  //  生成调拨单移除同步
  removeChild = (e) => {
    this.setState({
      selectedRowKeys: e,
    })
  }
  // 第一个页面
  renderProInfo = () => {
    const {
      loading,
      selectedRowKeys,
      dataSource,
      deleteLoading,
      saveLoading,
      createDialVisible,
      actionEdit,
      choseList,
      logisticsVisible,
      splitDataSource,
      editRow,
      // addLogisticsVisible,
      // informationVisible,
      page } = this.state;
    const destroyOnClose = true;
    const columns = [{
      title: '产品信息',
      dataIndex: 'prod_name',
      key: 'prod_name',
      width: 400,
      render: (text, record) => {        
        return (
          <ProductCell
            product_no={record.product_no}
            title={record.title}
            image_url={record.image_url}
            product_sku={record.product_sku}
            category={record.category_name_arr}
          />
        );
      },
    }, {
      title: '采购仓库',
      dataIndex: 'warehouse_name',
      width: 150,
    }, {
      title: '供应商',
      dataIndex: 'name',
      width:150,
    }, {
      title: '采购数量(件)',
      dataIndex: 'quantity',
      width: 100,
      render: (text, record) => (
        <EditableRow
          value={text}
          type='input'
          name='quantity'
          editable={editRow === record.id}
          onChange={this.onCellChange}
        />
      ),
    }, {
      title: '单价(USD)',
      dataIndex: 'cost',
      width: 100,
      render: (text, record) => (
        <EditableRow
          value={text}
          type='input'
          name='cost'
          editable={editRow === record.id}
          onChange={this.onCellChange}
        />
      ),
    }, {
      title: '计划到货时间(UTC)',
      dataIndex: 'plan_arrive_at',
      width: 150,
      render: (text, record) => (
        <EditableRow
          value={text}
          type='time'
          name='plan_arrive_at'
          editable={editRow === record.id}
          onChange={this.onCellChange}
        />
      ),
    }, {
      title: '创建时间',
      dataIndex: 'created_at',
        width: 150,
    }, {
      title: '操作',
      dataIndex: 'action',
        width: 200,
        render: (text, val) => (
          <div>
            {val.id === editRow ? (
              <span>
                <Button
                  type="primary"
                  ghost
                  style={{ marginRight: 10 }}
                  size='small'
                  onClick={() => {
                    this.setState({
                      editRow: 0,
                      dataSource: this.state.scratchData,
                      actionEdit: true,   //  操作单个
                    })
                    this.getPurchasePlanList(this.state.page, this.state.order, this.state.keyword);
                  }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  ghost
                  loading={saveLoading === val.id}
                  size='small'
                  onClick={this.editSave.bind(this, val.id)}
                >
                  保存
                </Button>
              </span>

            ) : (
                actionEdit ? (
                  <Button
                    type="primary"
                    ghost
                    size='small'
                    onClick={this.requisitionEdit.bind(this, val.id)}
                  >
                    编辑
                  </Button>
                ) : (
                  <Button type="primary" size='small' style={{ marginLeft: 10 }} disabled>编辑</Button>
                  )
              )}
            {actionEdit ? (
              <Popconfirm 
                title="确定删除？" 
                okText="Yes" 
                cancelText="No"
                onConfirm={this.requisitionDelete.bind(this, val.id)}
              >
                <Button
                  type="primary"
                  style={{ marginLeft: 10 }}
                  ghost
                  loading={deleteLoading === val.id}
                  size='small'
                >
                  删除
                </Button>
              </Popconfirm>
              
            ) : (
              <Button type="primary" size='small' style={{ marginLeft: 10 }} disabled>删除</Button>
              )}

          </div>
        ),
    }];
    const splitColumns = [{
      title: '供应商',
      dataIndex: 'upwarehouse',
    }, {
      title: '采购数量(件)',
      dataIndex: 'allocatingNumber',
    }, {
      title: '单价(USD)',
      dataIndex: 'price',
    }, {
      title: '计划到货时间(UTC)',
      dataIndex: 'expectTime',
    }, {
      title: '操作',
      dataIndex: 'action',
      render: () => (
        <div>
          <Button
            type="primary"
            ghost
            size='small'
          >
            移除
          </Button>
        </div>
      ),
    }];
    const rowSelection = {
      selectedRowKeys,
      onChange: (ids, list) => {
        console.log(list)
        this.setState({
          selectedRowKeys: ids,
          choseList: list,
        });
      },
    };
    return (
      <div>
        {/* 搜索 */}
        <div>
          <Search search={this.handleSubmit} />
        </div>
        <div style={{ marginBottom: 10,overflow:'hidden' }}>
          <div style={{float:'left'}}>
            {actionEdit ? (
              <span>
                <Button
                  type="primary"
                  size='small'
                  onClick={this.showModal.bind(this, 1)}
                >
                  生成采购单
                </Button>
                <Popconfirm 
                  title="确定删除所选的吗？" 
                  okText="Yes" 
                  cancelText="No"
                  onConfirm={this.batchDelete}
                >
                  <Button
                    type="primary"
                    size='small'
                    style={{ marginLeft: 10 }}
                    loading={this.state.deleteLoadings}
                  >
                    删除
                  </Button>
                </Popconfirm>
                
              </span>
            ) : (
              <span>
                <Button type="primary" size='small' style={{ marginLeft: 10 }} disabled>生成调拨单</Button>
                <Button type="primary" size='small' style={{ marginLeft: 10 }} disabled>删除</Button>
              </span>
              )}
          </div>
          <div style={{ float: 'right' }}>
            总价:2000000.00
          </div>
        </div>
        {/* 表格 */}
        <div>
          <Table
            onChange={this.onTableChange}
            rowKey='id'
            pagination={page}
            loading={loading}
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSource}
            className='table-four-line'
          />
        </div>
        <Modal
          title="生成采购单"
          visible={createDialVisible}
          width={900}
          maskClosable={false}
          destroyOnClose={destroyOnClose}
          onCancel={this.handleCancel.bind(this, 1)}
          footer={[
            <Button key="back" onClick={this.handleCancel.bind(this, 1)}>返回</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk.bind(this, 1)}>
              生成采购单
            </Button>,
          ]}
        >
          <CreatePurchaseOrder 
            generate={this.generate} 
            removeChild={this.removeChild}
            onShowModal={this.showModal} 
            selectedRowKeys={selectedRowKeys}
            choseList={choseList} 
            onRef={this.onRef}
          />
        </Modal>
        <Modal
          title="拆分"
          visible={logisticsVisible}
          width={800}
          maskClosable={false}
          destroyOnClose={destroyOnClose}
          onOk={this.handleOk.bind(this, 2)}
          onCancel={this.handleCancel.bind(this, 2)}
        >
          <Table
            onChange={this.onTableChange}
            rowKey='id'
            pagination={false}
            loading={loading}
            columns={splitColumns}
            dataSource={splitDataSource}
          />
        </Modal>
      </div>
    )
  }
  render() {
    const { panes } = this.state;
    panes[0].content = this.renderProInfo();
    return (
      <Tabs
        onChange={this.onChange}
        activeKey={this.state.activeKey}
        type="editable-card"
        onEdit={this.onEdit}
      >
        {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>{pane.content}</TabPane>)}
      </Tabs>
    )
  }
}

export default ShoppingList;