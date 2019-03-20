import React from 'react';
import moment from 'moment';
import { Tabs, Button, Table, Modal, message,Popconfirm } from 'antd';
import Search from './public/AppropriationPlanSearch';
import PlanCreateDial from './public/planCreateDial';
import PlanInformation from './public/planInformation';
import PlanAddLogistics from './public/planAddLogistics';
import PlanLogistics from './public/planLogistics';
import { erpPost } from '../../services/ajax';
import EditableRow from '../../components/EditableRow';
import ProductCell from '../../components/ProductCell';

const { TabPane } = Tabs;


class AppropriationPlan extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      panes: [{ title: '调拨计划', content: '', key: '1', closable: false }],
      activeKey: '1',
      selectedRowKeys: [], // 选中的单号
      choseList: [],   //  选中的列表
      loading: false,
      deleteLoading: 0,
      deleteLoadings: false,
      saveLoading: 0,
      actionEdit:true,   //  操作单个
      editRow: 0,
      order: [],
      page: {
        pageSize: 10,
        total: 0,
        current: 1,
        showSizeChanger: true,
      },
      keyword: {},  //  搜索关键词
      dataSource: [],
      scratchData:[], // 暂存数据
      createDialVisible: false,     //  创建调拨单
      logisticsVisible: false,       //  选择物流
      addLogisticsVisible: false,    //   新增物流
      informationVisible: false,     // 物流信息
    }
  }
  componentDidMount() {
    this.getRequisitionplanList(this.state.page, this.state.order, this.state.keyword);
  }
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.prodListFun(pageNumber, order);
  };
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

  // 调拨计划列表
  getRequisitionplanList = (pageNumber, orders, keyword) => {
    this.setState({
      loading: true,
    })
    const can = {
      inbound_warehouse_id: keyword.inbound_warehouse_id || '',
      outbound_warehouse_id: keyword.outbound_warehouse_id || '',
      key: keyword.key || '',
      value: keyword.value || '',
      page: pageNumber,
      order: orders,
    }
    erpPost('requisition-plan/index', can, res => {
      this.setState({
        loading: false,
        dataSource: res.data.data,
        scratchData: res.data.data,
      })
    }, () => {
      this.setState({
        loading: false,
      })
    })
  }
  // 删除记录
  requisitionDelete = (a) => {
    this.setState({
      deleteLoading: a,
    })
    erpPost('requisition-plan/delete', { id: a }, res => {
      message.success(res.data.msg)
      this.setState({
        deleteLoading: 0,
        selectedRowKeys: [],
        choseList: [],
      })
      this.getRequisitionplanList(this.state.page, this.state.order, this.state.keyword);
    }, () => {
      this.setState({
        deleteLoading: 0,
      })
    })
  }
  //  行编辑
  requisitionEdit = (e) => {
    this.setState({
      editRow: e,
      scratchData: this.state.dataSource,
      actionEdit:false,
    })  
  }
  // 行编辑保存
  editSave = (e) => {
    const dataSource = [...this.state.dataSource];
    const target = dataSource.find(item => {
      return item.id === e;
    });
    if (target) {
      const can={
        id: target.id,
        quantity: target.quantity,
        plan_arrive_at: target.plan_arrive_at,
      }
      this.setState({
        saveLoading:e,
      })
      erpPost("requisition-plan/edit",can,res=>{
        message.success(res.data.msg)
        this.getRequisitionplanList(this.state.page, this.state.order, this.state.keyword);
        this.setState({
          editRow: 0,
          saveLoading:0,
          actionEdit: true,   //  操作单个
        })
      },()=>{
        this.setState({
          saveLoading:0,
        })
      })
    }
    
  }
  // 批量删除记录
  batchDelete = () => {
    this.setState({
      deleteLoadings: true,
    })
    erpPost('requisition-plan/batch-delete', { ids: this.state.selectedRowKeys.join(',') }, res => {
      message.success(res.data.msg)
      this.setState({
        deleteLoadings: false,
        selectedRowKeys: [],
        choseList: [],
      })
      this.getRequisitionplanList(this.state.page, this.state.order, this.state.keyword);
    }, () => {
      this.setState({
        deleteLoadings: false,
      })
    })
  }
  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '调拨计划', content: 'Content of new Tab', key: activeKey,
    });
    this.setState({ panes, activeKey });
  }
  // 搜索提交
  handleSubmit = (e) => {
    console.log('e',e)
    this.setState({
      keyword: e,
    })
    this.getRequisitionplanList(this.state.page, this.state.order, e);
  }
  // 生成调拨单
  generate=(e)=>{
    const can={
      ids:e.ids.join(','),
      remark: e.remark || '',
    }
    erpPost('requisition-plan/requisition/generate',can,res=>{
      message.success(res.data.msg)
      this.getRequisitionplanList(this.state.page, this.state.order, this.state.keyword);
      this.setState({
        createDialVisible: false,
      });
    })
  }
  // 弹框
  showModal = (e) => {
    if (e === 1) {
      if (this.state.selectedRowKeys.length > 0) {
        const can ={
          ids: this.state.selectedRowKeys.join(','),
        }
        erpPost('requisition-plan/product/select-fit', can,()=>{
          this.setState({
            createDialVisible: true,
          });
        })
      } else {
        message.warning('请选择调拨计划')
      }
    } else if (e === 2) {
      this.setState({
        logisticsVisible: true,
      });
    } else if (e === 3) {
      this.setState({
        addLogisticsVisible: true,
      });
    } else if (e === 4) {
      this.setState({
        informationVisible: true,
      });
    }

  }

  handleOk = (e) => {
    if (e === 1) {
      this.child.handleSubmit()
    } else if (e === 2) {
      this.setState({
        logisticsVisible: false,
      });
    } else if (e === 3) {
      this.setState({
        addLogisticsVisible: false,
      });
    } else if (e === 4) {
      this.setState({
        informationVisible: false,
      });
    }
  }

  handleCancel = (e) => {
    if (e === 1) {
      this.setState({
        createDialVisible: false,
      });
    } else if (e === 2) {
      this.setState({
        logisticsVisible: false,
      });
    } else if (e === 3) {
      this.setState({
        addLogisticsVisible: false,
      });
    } else if (e === 4) {
      this.setState({
        informationVisible: false,
      });
    }
  }
  //  生成调拨单移除同步
  removeChild=(e)=>{
    this.setState({
      selectedRowKeys:e,
    })
  }
  // 第一个页面
  renderProInfo = () => {
    const {
      loading,
      deleteLoading,
      saveLoading,
      selectedRowKeys,
      choseList,
      dataSource,
      createDialVisible,
      editRow,
      actionEdit,
      logisticsVisible,
      addLogisticsVisible,
      informationVisible,
      page } = this.state;
    const destroyOnClose = true;
    const columns = [
      {
        title: '产品信息',
        dataIndex: 'prod_name',
        key: 'prod_name',
        width: 550,
        render: (text, val) => {
          return (
            <ProductCell
              product_no={val.product_no}
              title={val.title}
              image_url={val.image_url}
              product_sku={val.product_sku}
              category={val.category_name_arr}
            />
          );
        },

      }, {
        title: '成本价($)',
        dataIndex: 'cost',
        width: 100,
      }, {
        title: '调入仓库',
        dataIndex: 'inbound_warehouse_name',
        width:120,
      }, {
        title: '调出仓库',
        dataIndex: 'outbound_warehouse_name',
        width: 120,
      }, {
        title: '计划调拨数量(件)',
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
        title: '计划到货时间(UTC)',
        dataIndex: 'plan_arrive_at',
        width: 120,
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
        width: 120,
        render: (text)=> {
          return text&&moment(text).format('YYYY-MM-DD')
        },
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
                    this.getRequisitionplanList(this.state.page, this.state.order, this.state.keyword);
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
              actionEdit?(
                <Button
                  type="primary"
                  ghost
                  size='small'
                  onClick={this.requisitionEdit.bind(this, val.id)}
                >
                  编辑
                </Button>
              ):(
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
            ):(
              <Button type="primary" size='small' style={{ marginLeft: 10 }} disabled>删除</Button>
            )}
            
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
        <div style={{ marginBottom: 10 }}>
          {actionEdit?(
            <span>
              <Button
                type="primary"
                size='small'
                onClick={this.showModal.bind(this, 1)}
              >
                生成调拨单
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
              </Popconfirm>,
              
            </span>
          ):(
            <span>
              <Button type="primary" size='small' style={{ marginLeft: 10 }} disabled>生成调拨单</Button>
              <Button type="primary" size='small' style={{ marginLeft: 10 }} disabled>删除</Button>
            </span>
          )}
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
          title="生成调拨单"
          visible={createDialVisible}
          width={800}
          maskClosable={false}
          destroyOnClose={destroyOnClose}
          onCancel={this.handleCancel.bind(this, 1)}
          footer={[
            <Button key="back" onClick={this.handleCancel.bind(this, 1)}>返回</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk.bind(this, 1)}>
              生成调拨单
            </Button>,
          ]}
        >
          <PlanCreateDial 
            generate={this.generate} 
            onShowModal={this.showModal} 
            selectedRowKeys={selectedRowKeys}
            removeChild={this.removeChild}
            choseList={choseList} 
            onRef={this.onRef}
          />
        </Modal>
        <Modal
          title="选择物流"
          width={800}
          centered
          maskClosable={false}
          visible={logisticsVisible}
          destroyOnClose={destroyOnClose}
          onOk={this.handleOk.bind(this, 2)}
          onCancel={this.handleCancel.bind(this, 2)}
        >
          <PlanLogistics onShowModal={this.showModal} />
        </Modal>
        <Modal
          title="新增物流"
          width={400}
          maskClosable={false}
          visible={addLogisticsVisible}
          destroyOnClose={destroyOnClose}
          onOk={this.handleOk.bind(this, 3)}
          onCancel={this.handleCancel.bind(this, 3)}
        >
          <PlanAddLogistics onShowModal={this.showModal} />
        </Modal>
        <Modal
          title="物流信息"
          width={400}
          maskClosable={false}
          visible={informationVisible}
          destroyOnClose={destroyOnClose}
          onOk={this.handleOk.bind(this, 4)}
          onCancel={this.handleCancel.bind(this, 4)}
        >
          <PlanInformation onShowModal={this.showModal} />
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
export default AppropriationPlan;