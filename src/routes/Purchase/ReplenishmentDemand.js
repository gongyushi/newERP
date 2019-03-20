import React from 'react';
import { Table, Tabs, Form, Button, Modal, Select } from 'antd';
import SearchBar from '../../components/SearchBar';
import NewPurchaseOrder from './NewPurchaseOrder';

require('../ListStyle.less');

const { TabPane } = Tabs;
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 7 },
};

function handleChange(value) {
  console.log(`selected ${value}`);
}
/* 把from添加天props里 */

@Form.create()
class ReplenishmentDemand extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      dataSource: [
        {
          key: '1',
          replenishmentOrder: 'BH20594',
          productImg: '图片',
          productName: '产品名称',
          SKU: 'ABC-358',
          ReplenishmentQuantity: '200件',
          availableStock: '20件',
          FBAWarehouse: '50件',
          operation: '新增采购单 添加采购单',
        },
        {
          key: '2',
          replenishmentOrder: 'BH20594',
          productImg: '图片',
          productName: '产品名称',
          SKU: 'ABC-358',
          ReplenishmentQuantity: '200件',
          availableStock: '20件',
          FBAWarehouse: '50件',
          operation: '新增采购单 添加采购单',
        },
        {
          key: '3',
          replenishmentOrder: 'BH20594',
          productImg: '图片',
          productName: '产品名称',
          SKU: 'ABC-358',
          ReplenishmentQuantity: '200件',
          availableStock: '20件',
          FBAWarehouse: '50件',
          operation: '新增采购单 添加采购单',
        },
        {
          key: '4',
          replenishmentOrder: 'BH20594',
          productImg: '图片',
          productName: '产品名称',
          SKU: 'ABC-358',
          ReplenishmentQuantity: '200件',
          availableStock: '20件',
          FBAWarehouse: '50件',
          operation: '新增采购单 添加采购单',
        },
        {
          key: '5',
          replenishmentOrder: 'BH20594',
          productImg: '图片',
          productName: '产品名称',
          SKU: 'ABC-358',
          ReplenishmentQuantity: '200件',
          availableStock: '20件',
          FBAWarehouse: '50件',
          operation: '新增采购单 添加采购单',
        },
      ],
      columns: [
        {
          title: '补货需求单号',
          dataIndex: 'replenishmentOrder',
          key: 'replenishmentOrder',
        },
        {
          title: '产品图片',
          dataIndex: 'productImg',
          key: 'productImg',
        },
        {
          title: '产品名称',
          dataIndex: 'productName',
          key: 'productName',
        },
        {
          title: 'SKU',
          dataIndex: 'SKU',
          key: 'SKU',
        },
        {
          title: '补货量',
          dataIndex: 'ReplenishmentQuantity',
          key: 'ReplenishmentQuantity',
        },
        {
          title: '可用库存',
          dataIndex: 'availableStock',
          key: 'availableStock',
        },
        {
          title: 'FBA库存',
          dataIndex: 'FBAWarehouse',
          key: 'FBAWarehouse',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          render: text => {
            // console.log(text, record, 'text,record');
            return (
              <div>
                <div
                  onClick={() => {
                    const { panes } = this.state;
                    const activeKey = `newTab${this.newTabIndex++}`;
                    panes.push({
                      title: '编辑',
                      content: <NewPurchaseOrder index={activeKey} />,
                      key: activeKey,
                    });
                    this.setState({ panes, activeKey });
                  }}
                >
                  新增采购单
                </div>
                <div>添加采购单</div>
              </div>
            );
          },
        },
      ],
      visible: false,
    };
    const panes = [
      { title: '补货需求列表', content: this.renderProInfo(), key: '1', closable: false },
    ];
    this.state = {
      activeKey: panes[0].key,
      panes,
    };
  }
  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
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
  showModal = () => {
    console.log(this.state.visible);
    this.setState({
      visible: true,
    });
    console.log(this.state.visible);
  };
  handleOk = e => {
    console.log(e);
    console.log(this.state.visible);
    this.setState({
      visible: false,
    });
    console.log(this.state.visible);
  };
  handleCancel = e => {
    console.log(e);
    console.log(this.state.visible);
    this.setState({
      visible: false,
    });
    console.log(this.state.visible);
  };
  AddNewPurchaseOrder = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '新增采购单',
      content: <NewPurchaseOrder index={activeKey} />,
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
    const { dataSource, columns, visible } = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
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
          <Button type="primary" className="marginR" onClick={this.AddNewPurchaseOrder}>
            新增采购单
          </Button>
          <Button type="primary" className="marginR" onClick={this.showModal}>
            添加采购单
          </Button>
          {/* 弹框 */}
          <Modal
            visible={visible}
            title="添加采购单"
            onOk={this.handleOk}
            maskClosable={false}
            onCancel={this.handleCancel}
          >
            <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
              <FormItem {...formItemLayout} label="采购单号">
                <Select
                  defaultValue="lucy"
                  style={{ width: '200px', marginRight: '15px' }}
                  onChange={handleChange}
                >
                  <Option value="jack">5756756756</Option>
                  <Option value="lucy">765756734574</Option>
                  <Option value="disabled">7678878</Option>
                  <Option value="Yiminghe">7575675675</Option>
                </Select>
              </FormItem>
            </Form>
          </Modal>
        </div>
        <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection} />
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
export default ReplenishmentDemand;
