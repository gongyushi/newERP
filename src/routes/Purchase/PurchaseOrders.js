import React from 'react';
import { Table, Tabs, Form, Button, message } from 'antd';
import { connect } from 'dva';
import ErpSearch from '../../components/erpSearch';
import NewPurchaseOrder from './NewPurchaseOrder';
import { erpPost } from '../../services/ajax';

require('../ListStyle.less');

const { TabPane } = Tabs;

/* 把from添加天props里 */

@Form.create()
class PurchaseOrders extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      panes: [],
      dataSource: [],
      page: {
        pageSize: 10,
        total: 0,
        current: 1,
        showSizeChanger: true,
      },
      timeChose: {
        name: '期限',
        data: [
          {
            name: '三天(101)',
            value: '三天',
          },
          {
            name: '一周(101)',
            value: '一周',
          },
          {
            name: '一个月(101)',
            value: '一个月',
          },
        ],
      },
      companyChose: {
        name: '店铺名称',
        data: [
          {
            name: '格林德',
            value: '102',
          },
          {
            name: '数据原力',
            value: '103',
          },
        ],
      },
      columns: [
        {
          title: '采购单号',
          dataIndex: 'purch_no',
          key: 'purch_no',
          className: 'width200',
        },
        {
          title: '供应商',
          dataIndex: 'sname',
          key: 'sname',
          className: 'width200',
        },
        {
          title: '采购数量',
          dataIndex: 'total',
          key: 'total',
          className: 'width100',
        },
        {
          title: '可取消数量',
          dataIndex: 'reversibility',
          key: 'reversibility',
          className: 'width100',
        },
        {
          title: '已取消数量',
          dataIndex: 'canceled',
          key: 'canceled',
          className: 'width100',
        },
        {
          title: '到货数量',
          dataIndex: 'quantityGoods',
          key: 'quantityGoods',
          className: 'width100',
        },
        {
          title: '入库总数',
          dataIndex: 'purchaseQuantity',
          key: 'purchaseQuantity',
          className: 'width100',
        },
        {
          title: '良品',
          dataIndex: 'goodGoods',
          key: 'goodGoods',
          className: 'width100',
        },
        {
          title: '不良品',
          dataIndex: 'badGoods',
          key: 'badGoods',
          className: 'width100',
        },
        {
          title: '运费(￥)',
          dataIndex: 'freight',
          key: 'freight',
          className: 'width100',
        },
        {
          title: '采购员',
          dataIndex: 'username',
          key: 'username',
          className: 'width100',
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          className: 'width100',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          className: 'width140',
          render: (text, val) => {
            return (
              <div>
                <div
                  onClick={() => {
                    console.log(val);
                    const { panes } = this.state;
                    const activeKey = `newTab${this.newTabIndex++}`;
                    panes.push({
                      title: '编辑',
                      content: (
                        <NewPurchaseOrder
                          puchaseorderid={val.purchase_order_id}
                          detailval={val}
                          index={activeKey}
                        />
                      ),
                      key: activeKey,
                    });
                    this.setState({ panes, activeKey });
                  }}
                >
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    编辑
                  </Button>
                </div>
                <div>
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    完结
                  </Button>
                </div>
                <div
                  onClick={() => {
                    erpPost(
                      'purchase-order/delete',
                      { purchase_order_id: val.purchase_order_id },
                      res => {
                        message.success(res.data.msg);
                        const dataSource = [...this.state.dataSource];
                        this.setState({
                          dataSource: dataSource.filter(
                            item => item.purchase_order_id !== val.purchase_order_id
                          ),
                        });
                        this.mounting();
                      }
                    );
                  }}
                >
                  {/* <Button size='small' type="primary" ghost>删除</Button> */}
                </div>
                {/* {text} */}
              </div>
            );
          },
        },
      ],
    };
  }
  componentWillMount() {
    this.mounting();
  }
  componentDidMount() {
    this.getList(this.state.page, this.state.orders); // 获取列表接口
  }
  componentWillReceiveProps(nextProps) {
    this.setState(
      {
        dataSource: nextProps.orderList,
      },
      () => {
        this.mounting();
      }
    );
  }
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.getList(pageNumber, order);
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
    console.log(targetKey, '关闭页签的回调');
  };
  // 获取列表接口
  // getList = () => {
  //   this.props.dispatch({
  //     type: 'purchaseOrder/fetch',
  //     payload: {
  //       purch_no: this.state.searchKey,
  //     },
  //   });
  //   // console.log(this.props.orderList, "this.props.list")
  // };
  getList = (pageNumber, orders) => {
    const can = {
      page: pageNumber,
      order: orders,
    };
    this.props.dispatch({
      type: 'purchaseOrder/fetch',
      payload: {
        purch_no: this.state.searchKey,
      },
    });
    // console.log(this.props.orderList, "this.props.list")
  };
  // 页面渲染
  mounting = () => {
    let { panes } = this.state;
    if (panes.length === 0) {
      panes = [{ title: '采购单', content: this.renderProInfo(), key: '1', closable: false }];
    } else {
      panes[0].content = this.renderProInfo();
    }
    const activeKey = panes[0].key;
    this.setState({
      activeKey,
      panes,
    });
  };
  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
    this.setState({ panes, activeKey });
  };
  remove = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(err => {
      if (!err) {
        // console.log('Received values of form: ', values);
      }
    });
  };
  AddNewPurchaseOrder = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '新增采购单',
      content: <NewPurchaseOrder getList={this.getList} puchaseorderid={0} index={activeKey} />,
      key: activeKey,
    });
    this.setState({ panes, activeKey });
  };
  /**
   * 渲染表格
   * @param {Object} dataSource 表行
   * @param {Object} columns 表头
   */
  renderProInfo = () => {
    const { columns, dataSource, page } = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };

    // return  <Table dataSource={dataSource} columns={columns} />;
    return (
      <div className="proDataWrap">
        <ErpSearch timeChose={this.state.timeChose} companyChose={this.state.companyChose} />
        <div style={{ margin: '10px 0' }}>
          <Button type="primary" className="marginR" onClick={this.AddNewPurchaseOrder}>
            新增采购单
          </Button>
          <Button type="primary" className="marginR" onClick={this.getList}>
            到货
          </Button>
          <Button type="primary" className="marginR">
            经理审核
          </Button>
          <Button type="primary" className="marginR buttonDel">
            删除
          </Button>
        </div>
        <Table
          rowKey="purchase_order_id"
          dataSource={dataSource}
          columns={columns}
          rowSelection={rowSelection}
          onChange={this.onTableChange}
          pagination={page}
        />
      </div>
    );
  };
  render() {
    return (
      <Tabs
        hideAdd
        className="productVariants"
        onChange={this.onChange}
        activeKey={this.state.activeKey}
        type="editable-card"
        onEdit={this.onEdit}
      >
        {this.state.panes.map(pane => (
          <TabPane
            tab={pane.title}
            key={pane.key}
            closable={pane.closable}
            className="proTabs"
            style={{ marginBottom: '0px' }}
          >
            {pane.content}
          </TabPane>
        ))}
      </Tabs>
    );
  }
}

const mapStateToProps = state => {
  return {
    orderList: state.purchaseOrder.orderlist,
  };
};

export default connect(mapStateToProps)(PurchaseOrders);
// export default PurchaseOrders;
