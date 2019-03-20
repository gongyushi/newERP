import React from 'react';
import {
  Table,
  Tabs,
  // Form,
  Button,
  // Popconfirm,
  message,
  Modal,
} from 'antd';
import EditableItem from '../../components/EditableItem';
import { erpPost } from '../../services/ajax';
import SearchBar from '../../components/SearchBar';
import OrderDetail from './orderDetail';
// import RegistrationForm from './registrationForm';

require('../ListStyle.less');

const { TabPane } = Tabs;

class OrderList extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 1;
    this.state = {
      panes: [],
      loading: false,
      visible: false,
      orderItemId: [],
      dataSource: [],
      page: {
        // defaultCurrent: 1,  // 默认的当前页数
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
        // showQuickJumper:true,
      },
      columns: [
        {
          title: '订单号',
          dataIndex: 'order_no',
          key: 'order_no',
          className: 'order_no',
        },
        {
          title: '产品图片',
          dataIndex: 'image_urls',
          key: 'image_urls',
          className: 'image_urls',
          render: text => (
            <img src={text} alt="商品图片" style={{ width: '50px', border: '1px solid #dcdcdc' }} />
          ),
        },
        {
          title: '产品信息',
          dataIndex: 'prod_name',
          key: 'prod_name',
          className: 'prod_name',
          render: text => <div style={{ height: 35, overflow: 'hidden' }}>{text}</div>,
        },
        {
          title: '订单金额',
          dataIndex: 'im_price_amount',
          key: 'im_price_amount',
          className: 'im_price_amount',
        },
        {
          title: '店铺',
          dataIndex: 'sto_name',
          key: 'sto_name',
          className: 'sto_name',
        },
        {
          title: '收件人',
          dataIndex: 'user_name',
          key: 'user_name',
          className: 'user_name',
        },
        {
          title: '下单时间',
          dataIndex: 'purch_date',
          key: 'purch_date',
          className: 'purch_date',
        },
        {
          title: '物流方式',
          dataIndex: 'logistics',
          key: 'logistics',
          className: 'logistics',
        },
        {
          title: '订单类型',
          dataIndex: 'type',
          key: 'type',
          className: 'type',
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          className: 'status',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          className: 'operation',
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
                      content: <OrderDetail orderitemid={val.order_item_id} />,
                      key: activeKey,
                    });
                    this.setState({ panes, activeKey });
                  }}
                >
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    查看详情
                  </Button>
                </div>
                <div>
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    发货
                  </Button>
                </div>
                <div>
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    打单
                  </Button>
                </div>
              </div>
            );
          },
        },
      ],
      separateDataSource: [],
      itemDemerge: [], //  订单拆分组合
      separateColumns: [
        {
          title: '订单号',
          dataIndex: 'order_no',
          key: 'order_no',
        },
        {
          title: '产品图片',
          dataIndex: 'image_urls',
          key: 'image_urls',
          render: text => (
            <img src={text} alt="商品图片" style={{ width: '50px', border: '1px solid #dcdcdc' }} />
          ),
        },
        {
          title: '产品信息',
          dataIndex: 'prod_name',
          key: 'prod_name',
          render: (text, val) => (
            <div>
              <div>{val.sku}</div>
              <div>dsadas</div>
            </div>
          ),
        },
        {
          title: '数量',
          dataIndex: 'item_num',
          key: 'item_num',
        },
        {
          title: '拆单数量',
          dataIndex: 'separateNum',
          key: 'separateNum',
          render: (text, record) => (
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.order_item_id, 'separateNum')}
            />
          ),
        },
      ],
    };
    // const panes = [{ title: '资料管理', content: this.renderProInfo(), key: '0', closable: false }];
    // this.state = {
    //   activeKey: panes[0].key,
    //   panes,
    // };
  }
  componentDidMount() {
    this.manageList(this.state.page, this.state.orders); // 获取订单列表
    this.mounting();
  }
  // 改变表格中的值
  onCellChange = (key, dataIndex, data) => {
    console.log(key, 'key');
    console.log(data, 'data');
    console.log(dataIndex, 'dataIndex');
    // return (value) => {
    // console.log(value)
    const separateDataSource = [...this.state.separateDataSource];
    const target = separateDataSource.find(item => {
      return item.order_item_id === key;
    });
    if (target) {
      target[dataIndex] = data;
      console.log(separateDataSource);
      const arr = [];
      separateDataSource.forEach(res => {
        console.log(res);
        const obj = {};
        obj.order_item_id = res.order_item_id;
        obj.item_num = res.separateNum;
        arr.push(obj);
      });
      this.setState({ itemDemerge: arr });
    }
    console.log(this.state.itemDemerge);
    // };
  };
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.manageList(pageNumber, order);
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  // 列表
  manageList = (pageNumber, orders) => {
    // console.log(orders)
    const can = {
      page: pageNumber,
      order: orders,
    };
    erpPost('order/item/index', can, res => {
      this.setState({
        dataSource: res.data.data,
        orders: res.data.order,
        page: res.data.page,
      });
      this.mounting();
    });
  };
  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: '添加商品', content: <OrderDetail />, key: activeKey });
    this.setState({ panes, activeKey });
  };

  remove = targetKey => {
    console.log(targetKey);
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => {
      console.log(targetKey, pane.key, 'targetKey,pane.key');
      return pane.key !== targetKey;
    });
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
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleOk = () => {
    erpPost('order/item/demerge', { attribute: JSON.stringify(this.state.itemDemerge) }, res => {
      message.success(res.data.msg);
      this.setState({ loading: true });
      setTimeout(() => {
        this.setState({ loading: false, visible: false });
      }, 1000);
    });
    // this.setState({ loading: true });
    // setTimeout(() => {
    //   this.setState({ loading: false, visible: false });
    // }, 3000);
  };
  handleCancel = () => {
    this.setState({ visible: false });
  };
  // 渲染页面
  mounting = () => {
    let { panes } = this.state;
    if (panes.length === 0) {
      panes = [{ title: '订单管理', content: this.renderProInfo(), key: '0', closable: false }];
    } else {
      panes[0].content = this.renderProInfo();
    }
    const activeKey = panes[0].key;
    this.setState({
      activeKey,
      panes,
    });
  };
  /**
   * 渲染表格
   * @param {Object} dataSource 表行
   * @param {Object} columns 表头
   */
  renderProInfo = () => {
    const { dataSource, columns, page } = this.state;
    dataSource.map((res, index) => {
      res.key = index;
      return res;
    });
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          orderItemId: selectedRowKeys,
          separateDataSource: selectedRows,
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    return (
      <div className="proDataWrap">
        <SearchBar />
        <div style={{ marginBottom: '10px' }}>
          <Button
            type="primary"
            className="marginR"
            onClick={() => {
              erpPost('order/syn', {}, res => {
                message.success(res.data.msg);
              });
            }}
          >
            同步订单
          </Button>
          <Button
            type="primary"
            className="marginR"
            onClick={() => {
              console.log(this.state.orderItemId.join(';'));
              if (this.state.orderItemId.length < 2) {
                message.warning('请选择勾选两个以上订单');
              } else {
                erpPost(
                  'order/item/merge',
                  { order_item_ids: this.state.orderItemId.join(';') },
                  res => {
                    message.success(res.data.msg);
                  }
                );
              }
            }}
          >
            合并
          </Button>
          <Button type="primary" className="marginR" onClick={this.showModal}>
            拆单
          </Button>
          <Button type="primary" className="marginR">
            自动合并订单
          </Button>
        </div>
        <Table
          rowKey="order_item_id"
          className="management"
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
    const { visible, loading, separateColumns, separateDataSource } = this.state;
    // console.log(separateDataSource);
    return (
      <div>
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
        <Modal
          visible={visible}
          title="拆单"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          maskClosable={false}
          footer={[
            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
              确定
            </Button>,
            <Button key="back" onClick={this.handleCancel}>
              取消
            </Button>,
          ]}
        >
          <Table
            rowKey="order_item_id"
            dataSource={separateDataSource}
            columns={separateColumns}
            pagination={false}
          />
        </Modal>
      </div>
    );
  }
}

export default OrderList;
