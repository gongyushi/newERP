import React from 'react';
import { Table, Tabs, Form, Button, message } from 'antd';
import { connect } from 'dva';
import NewPurchaseOrder from 'routes/Purchase/NewPurchaseOrder';
import SearchBar from '../../../components/SearchBar';
import { erpPost } from '../../../services/ajax';

require('../../ListStyle.less');

const { TabPane } = Tabs;

/* 把from添加天props里 */

@Form.create()
class OnlineTabs extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      panes: [{ title: '采购单', content: null, key: '1', closable: false }],
      selectedRows: [],
      activeKey: '1',
      dataSource: [],
      columns: [
        {
          title: '采购单号',
          dataIndex: 'purch_no',
          key: 'purch_no',
        },
        {
          title: '供应商',
          dataIndex: 'sname',
          key: 'sname',
        },
        {
          title: '采购数量',
          dataIndex: 'total',
          key: 'total',
        },
        {
          title: '可取消数量',
          dataIndex: 'reversibility',
          key: 'reversibility',
        },
        {
          title: '已取消数量',
          dataIndex: 'canceled',
          key: 'canceled',
        },
        {
          title: '到货数量',
          dataIndex: 'quantityGoods',
          key: 'quantityGoods',
        },
        {
          title: '入库总数',
          dataIndex: 'purchaseQuantity',
          key: 'purchaseQuantity',
        },
        {
          title: '良品',
          dataIndex: 'goodGoods',
          key: 'goodGoods',
        },
        {
          title: '不良品',
          dataIndex: 'badGoods',
          key: 'badGoods',
        },
        {
          title: '运费(￥)',
          dataIndex: 'freight',
          key: 'freight',
        },
        {
          title: '采购员',
          dataIndex: 'username',
          key: 'username',
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
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
                  <Button size="small" type="primary" className="buttonDel" ghost>
                    删除
                  </Button>
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
    this.getList();
  }
  shouldComponentUpdate(nextProps) {
    console.log(nextProps.orderList, 'nextProps');
    console.log(this.props.orderList !== nextProps.orderList);
    if (this.props.orderList !== nextProps.orderList) {
      return true;
    }
    return false;
  }
  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
    console.log(targetKey, '关闭页签的回调');
  };
  // 获取列表接口
  getList = () => {
    this.props.dispatch({
      type: 'purchaseOrder/fetch',
      payload: {
        purch_no: this.state.searchKey,
      },
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
  // 通过或者不通过
  passOrNopass = ispass => {
    const { selectedRows } = this.state;
    let status = 1;
    if (!ispass) {
      status = 2;
    }
    selectedRows.map(item => {
      erpPost(
        'purchase-order/manager/check',
        {
          purchase_order_id: item.purchase_order_id,
          status,
        },
        res => {
          message.success(res.data.mesg);
          this.getList();
        }
      );
      return item;
    });
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
    const { columns } = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };

    // return  <Table dataSource={dataSource} columns={columns} />;
    return (
      <div className="proDataWrap">
        <SearchBar />
        <div style={{ marginBottom: '10px' }}>
          {/* <Button type="primary" className="marginR" onClick={this.AddNewPurchaseOrder}>
            新增采购单
          </Button>
          <Button type="primary" className="marginR" onClick={this.getList}>
            到货
          </Button> */}
          <Button type="primary" className="marginR" onClick={this.passOrNopass.bind(this, true)}>
            通过
          </Button>
          <Button type="primary" className="marginR" onClick={this.passOrNopass.bind(this, false)}>
            不通过
          </Button>
        </div>
        <Table
          rowKey="purchase_order_id"
          dataSource={this.props.orderList}
          columns={columns}
          rowSelection={rowSelection}
        />
      </div>
    );
  };
  render() {
    const { activeKey, panes } = this.state;
    panes[0].content = this.renderProInfo();

    console.log(this.props.orderList, 'render');
    return (
      <Tabs
        hideAdd
        className="productVariants"
        onChange={this.onChange}
        activeKey={activeKey}
        type="editable-card"
        onEdit={this.onEdit}
      >
        {panes.map(pane => (
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

export default connect(mapStateToProps)(OnlineTabs);
// export default OnlineTabs ;
