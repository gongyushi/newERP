import React from 'react';
import { Table, Tabs, Form, Button, Modal, Radio, Select } from 'antd';
import { erpPost } from '../../services/ajax';
import SearchBar from '../../components/SearchBar';
import EditableItem from '../../components/EditableItem';

require('../ListStyle.less');

const { TabPane } = Tabs;
const RadioGroup = Radio.Group;
const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 6 },
};

// function handleChange(value) {
//   console.log(`selected ${value}`);
// }

@Form.create()
class demandManagement extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      panes: [],
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
          title: '补货需求单号',
          dataIndex: 'reple_demand_no',
          key: 'reple_demand_no',
          className: 'reple_demand_no',
        },
        {
          title: '产品图片',
          dataIndex: 'image_urls',
          key: 'image_urls',
          className: 'width60',
          render: text => (
            <img src={text} alt="商品图片" style={{ width: '50px', border: '1px solid #dcdcdc' }} />
          ),
        },
        {
          title: '产品信息',
          dataIndex: 'prod_name',
          key: 'prod_name',
          className: 'prod_name',
        },
        {
          title: 'SKU',
          dataIndex: 'sku',
          key: 'sku',
          className: 'sku',
        },
        {
          title: '补货量',
          dataIndex: 'purch_num',
          key: 'purch_num',
          className: 'purch_num',
        },
        {
          title: '可用库存',
          dataIndex: 'availableInventory',
          key: 'availableInventory',
          className: 'availableInventory',
        },
        {
          title: 'FBA库存',
          dataIndex: 'fba_stock',
          key: 'fba_stock',
          className: 'fba_stock',
        },
        {
          title: '状态',
          dataIndex: 'state',
          key: 'state',
          className: 'state',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          className: 'operation',
          render: () => {
            // console.log(text, val, 'text,record');
            return (
              <div>
                <div onClick={this.showSubmit}>
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    提交采购需求
                  </Button>
                </div>
                <div onClick={this.showCreate}>
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    创建调拨单号
                  </Button>
                </div>
                {/* {text} */}
              </div>
            );
          },
        },
      ],
      submitDataSource: [
        // {
        //   key: '1',
        //   submitNum: '1',
        //   sku: 'BH32-49-923-094',
        //   proName: 'sony',
        //   replenishmentNum: '200件',
        //   purchaseNum: '500件',
        // },
        // {
        //   key: '2',
        //   submitNum: '2',
        //   sku: 'BH32-49-923-094',
        //   proName: 'sony',
        //   replenishmentNum: '200件',
        //   purchaseNum: '500件',
        // },
      ],
      submitColumns: [
        {
          title: '序号',
          dataIndex: 'submitNum',
          key: 'submitNum',
        },
        {
          title: 'SKU',
          dataIndex: 'sku',
          key: 'sku',
        },
        {
          title: '产品名称',
          dataIndex: 'prod_name',
          key: 'prod_name',
        },
        {
          title: '补货量',
          dataIndex: 'replenishmentNum',
          key: 'replenishmentNum',
        },
        {
          title: '采购数量',
          dataIndex: 'purch_num',
          key: 'purch_num',
          render: (text, record) => (
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.product_id, 'separateNum')}
            />
          ),
        },
      ],
      createDataSource: [
        // {
        //   key: '1',
        //   submitNum: '1',
        //   sku: 'BH32-49-923-094',
        //   proName: 'sony',
        //   replenishmentNum: '200件',
        //   allotNum: '500件',
        // },
        // {
        //   key: '2',
        //   submitNum: '2',
        //   sku: 'BH32-49-923-094',
        //   proName: 'sony',
        //   replenishmentNum: '200件',
        //   allotNum: '500件',
        // },
      ],
      createColumns: [
        {
          title: '序号',
          dataIndex: 'submitNum',
          key: 'submitNum',
        },
        {
          title: 'SKU',
          dataIndex: 'sku',
          key: 'sku',
        },
        {
          title: '产品名称',
          dataIndex: 'prod_name',
          key: 'prod_name',
        },
        {
          title: '补货量',
          dataIndex: 'replenishmentNum',
          key: 'replenishmentNum',
        },
        {
          title: '调拨数量',
          dataIndex: 'allotNum',
          key: 'allotNum',
          render: (text, record) => (
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.product_id, 'separateNum')}
              style={{ width: '60px' }}
            />
          ),
        },
      ],
      submitPopUp: false,
      createPopUp: false,
      submitPopUpTwo: false,
      addToOrderPopUp: false,
      radioValue: 1,
      purchaseArr: [],
      PurchaseOrderList: [],
    };
  }
  componentDidMount() {
    this.demandList(this.state.page, this.state.orders);
  }
  onCellChange = (key, dataIndex) => {
    return value => {
      const submitDataSource = [...this.state.submitDataSource];
      const target = submitDataSource.find(item => item.key === key);
      if (target) {
        target[dataIndex] = value;
        this.setState({ submitDataSource });
      }
    };
  };
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onChangeRadio = e => {
    this.setState({
      radioValue: e.target.value,
    });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.demandList(pageNumber, order);
  };
  // getPurchaseOrder = () => {
  //   erpPost('purchase-order/index', {}, res => {
  //     this.setState({
  //       PurchaseOrderList: res.data.data,
  //     });
  //   });
  // };
  demandList = (pageNumber, orders) => {
    const can = {
      page: pageNumber,
      order: orders,
    };
    erpPost('purchase-order/index', can, res => {
      this.setState({
        dataSource: res.data.data,
        orders: res.data.order,
        page: res.data.page,
      });
      this.mounting();
    });
  };
  showSubmit = () => {
    this.setState({
      submitPopUp: true,
    });
  };
  showCreate = () => {
    this.setState({
      createPopUp: true,
    });
  };
  handleOkSubmit = () => {
    const arr = this.state.purchaseArr;
    console.log(this.state.submitDataSource);
    if (this.state.submitDataSource !== '') {
      this.state.submitDataSource.forEach(res => {
        console.log(res);
        const obj = {};
        obj.product_id = res.product_id;
        obj.purch_num = res.purch_num;
        console.log(obj);
        arr.push(obj);
      });
    }

    this.setState({ submitPopUp: false, createPopUp: false, submitPopUpTwo: true });
  };
  // 提交采购需求
  submitDemand = () => {
    if (this.state.radioValue === 1) {
      // erpTaoBao('demand/join', { attribute: JSON.stringify(this.state.purchaseArr) }, res => {
      //   message.success(res.data.msg);
      //   setTimeout(() => {
      //     this.setState({ submitPopUpTwo: false, addToOrderPopUp: false });
      //   }, 1000);
      // });
    } else if (this.state.radioValue === 2) {
      console.log('添加到采购单');
      this.setState({ submitPopUpTwo: false, addToOrderPopUp: true });
    }
  };
  addToOrder = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.purchase_order_id = values.purchase_order_id;
        // erpTaoBao('demand/join', values, res => {
        //   message.success(res.data.msg);
        //   this.setState({ addToOrderPopUp: false });
        // });
      }
    });
  };
  // 弹框取消
  handleCancel = () => {
    this.setState({
      submitPopUp: false,
      createPopUp: false,
      submitPopUpTwo: false,
      addToOrderPopUp: false,
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
  mounting = () => {
    let { panes } = this.state;
    if (panes.length === 0) {
      panes = [{ title: '需求管理', content: this.renderProInfo(), key: '1', closable: false }];
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
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          submitDataSource: selectedRows,
          createDataSource: selectedRows,
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    return (
      <div>
        <SearchBar />
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" className="marginR" onClick={this.showSubmit}>
            提交采购需求
          </Button>
          <Button type="primary" className="marginR" onClick={this.showCreate}>
            创建调拨单号
          </Button>
        </div>
        <Table
          className="demandManage"
          rowKey="sku"
          dataSource={dataSource}
          columns={columns}
          rowSelection={rowSelection}
          pagination={page}
          onChange={this.onTableChange}
        />
      </div>
    );
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { submitDataSource, submitColumns, createDataSource, createColumns } = this.state;
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
        {/* 提交采购需求 */}
        <Modal
          visible={this.state.submitPopUp}
          title="提交采购需求"
          onOk={this.handleOkSubmit}
          onCancel={this.handleCancel}
          maskClosable={false}
          footer={[
            <Button key="submit" type="primary" onClick={this.handleOkSubmit}>
              提交
            </Button>,
            <Button key="back" onClick={this.handleCancel}>
              取消
            </Button>,
          ]}
        >
          <Table
            rowKey="purchase_order_id"
            dataSource={submitDataSource}
            columns={submitColumns}
            pagination={false}
            style={{ marginBottom: '50px' }}
          />
        </Modal>
        {/* 提交采购需求2 */}
        <Modal
          visible={this.state.submitPopUpTwo}
          title="提交采购需求"
          onOk={this.submitDemand}
          maskClosable={false}
          onCancel={this.handleCancel}
          footer={[
            <Button key="submit" type="primary" onClick={this.submitDemand}>
              确定
            </Button>,
            <Button key="back" onClick={this.handleCancel}>
              取消
            </Button>,
          ]}
        >
          <RadioGroup onChange={this.onChangeRadio} value={this.state.radioValue}>
            <Radio value={1}>创建采购单号</Radio>
            <Radio value={2}>添加到采购单</Radio>
          </RadioGroup>
        </Modal>
        {/* 添加采购单 */}
        <Form onSubmit={this.addToOrder}>
          <Modal
            visible={this.state.addToOrderPopUp}
            title="添加采购单"
            maskClosable={false}
            onOk={this.addToOrder}
            onCancel={this.handleCancel}
            footer={[
              <Button key="submit" type="primary" onClick={this.addToOrder}>
                确定
              </Button>,
              <Button key="back" onClick={this.handleCancel}>
                取消
              </Button>,
            ]}
          >
            <FormItem {...formItemLayout} label="采购单号" hasFeedback>
              {getFieldDecorator('purchase_order_id', {
                rules: [{ required: true, message: '请选择采购单号！' }],
              })(
                <Select
                  className="input-Width200"
                  placeholder="请选择采购单号！"
                  style={{ width: '120px' }}
                  showSearch
                  optionFilterProp='children'
                >
                  {this.state.PurchaseOrderList.map(res => {
                    return (
                      <Option key={res.purchase_order_id} value={res.purchase_order_id}>
                        {res.purch_no}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Modal>
        </Form>
        {/* 创建调拨单号 */}
        <Modal
          visible={this.state.createPopUp}
          title="创建调拨单号"
          onOk={this.handleOk}
          maskClosable={false}
          onCancel={this.handleCancel}
          footer={[
            <Button key="submit" type="primary" onClick={this.handleOk}>
              提交
            </Button>,
            <Button key="back" onClick={this.handleCancel}>
              取消
            </Button>,
          ]}
        >
          <Table
            dataSource={createDataSource}
            columns={createColumns}
            pagination={false}
            style={{ marginBottom: '50px' }}
          />
        </Modal>
      </div>
    );
  }
}

export default demandManagement;
