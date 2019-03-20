import React from 'react';
import {
  Tabs,
  Button,
  Table,
  Select,
  Input,
  Form,
  Radio,
  Dropdown,
  Menu,
} from 'antd';
import styles from './ARinStore.less';
import ARinStoreDetail from './ARinStoreDetail';
import SelfStoreModal from './public/SelfStoreModal';
import FbaStoreModal from './public/FbaStoreModal';
import { erpPost } from '../../services/ajax';

const { Option } = Select;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const MenuItem = Menu.Item;

require('../ListStyle.less');
require('./ARinStore.less');

class ARinStore extends React.Component {
  constructor(props) {
    super(props)
    this.newTabIndex = 1;
    this.state = {
      storeData: [], // 按钮组选项
      selectData1: [], // 下拉选项一
      selectData2: [], // 下拉选项二
      selectData3: [], // 状态下拉选项
      storeList: [], // 入库列表
      storeColumns: [], // 入库表头
      status: [], // 状态对照表
      panes: [{
        title: '入库管理',
        content: '',
        key: '0',
        closable: false,
      }],
      activeKey: '0',
      selfVisible: false,
      fbaVisible: false,
      id: '', // 入库时行ID
      page: {
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
      },
    }
  }
  
  componentDidMount() {
    this.getStoreList({});
    this.getWarehouseList();
    this.initColumns();
  }
  // 搜索触发事件
  onSearch = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        for (const key in values) {
          if (String(values[key]).replace(/(^\s+)|(\s+$)/, '') === '' || key === 'warehouse_id' && values[key] === 0) {
            values[key] = undefined;
            console.log(key, values[key])
          }
        }
        if (values.value1 === undefined) {
          values.key1 = undefined;
        }
        if (values.value2 === undefined) {
          values.key2 = undefined;
        }
        if(values.status === '0'){
          values.status = undefined;
        }
        this.getStoreList(values);
      }
    });
  }

  // 删除tab事件
  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  // 获取入库列表
  getStoreList = (keyword) => {
    const { page } = this.state;
    erpPost('warehouse-receipt/inbound-index', { page, ...keyword }, res => {
      this.setState({
        storeList: res.data.data,
        page: res.data.page,
      });
    });
  }
  // 获取仓库列表
  getWarehouseList = () => {
    erpPost('warehouse/index', {}, res => {
      const { data } = res.data;
      data.unshift({ warehouse_id: 0, warehouse_name: '全部' });
      this.setState({
        storeData: data,
      });
    });
  }
  initColumns = () => {
    const selectData1 = [
      {
        name: '产品ID',
        value: 'product_no',
      },
      {
        name: '产品名称',
        value: 'title',
      },
      {
        name: 'SKU',
        value: 'product_sku',
      },
    ];
    const selectData2 = [
      {
        name: '入库单号',
        value: 'receipt_no',
      },
      {
        name: '采购单号',
        value: 'purchase_no',
      },
      {
        name: '调拨单号',
        value: 'requisition_no',
      },
      {
        name: '出库单号',
        value: 'outbound_no',
      },
      {
        name: '配送入库编号',
        value: 'shipments_inbound_id',
      },
    ];
    const selectData3 = [
      {
        name: '全部',
        value: '0',
      },
      {
        name: '待入库',
        value: '20',
      },
      {
        name: '已入库',
        value: '21',
      },
    ];
    const storeColumns = [
      {
        title: '单号',
        dataIndex: 'receipt_no',
        key: 'receipt_no',
        width: 200,
      },
      {
        title: '仓库',
        dataIndex: 'warehouse_name',
        key: 'warehouse_name',
        width: 200,
      },
      {
        title: '采购单号',
        dataIndex: 'purchase_no',
        key: 'purchase_no',
        width: 200,
        render: (text) => {
          return (<span style={{ color: '#0099FF' }} >{text}</span>)
        },
      },
      {
        title: '出库单号',
        dataIndex: 'outbound_no',
        key: 'outbound_no',
        width: 200,
      },
      {
        title: '计划入库数量(件)',
        dataIndex: 'expect_count',
        key: 'expect_count',
        width: 200,
        sorter: (a, b) => a.expect_count - b.expect_count,
      },
      {
        title: '实际入库数量(件)',
        dataIndex: 'real_count',
        key: 'real_count',
        width: 200,
        sorter: (c, d) => c.real_count - d.real_count,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 200,
        render: value => this.state.status[value],
      },
      {
        title: '入库时间',
        dataIndex: 'happen_at',
        key: 'happen_at',
        width: 200,
        sorter: (e, f) => e.happen_at - f.happen_at,
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 200,
      },
      {
        title: '操作',
        dataIndex: 'text',
        key: '',
        width: 200,
        render: (text, record) => {
          return (
            <div>
              {
                record.status === 20 &&
                (
                  <Button type="primary" size='small' ghost onClick={this.handleOpenModal.bind(this,record.warehouse_type, record.id)}>
                    入库
                  </Button>
                )
              }
              <Button
                type='primary'
                size='small'
                style={{ marginLeft: 10 }}
                ghost
                onClick={this.addNewTab.bind(this, record.id)}
              >
                详情
              </Button>
            </div>
          );
        },
      },
    ];
    const status = {
      '20': '待入库',
      '21': '已入库',
      '10': '待出库',
      '11': '已出库',
    };
    this.setState({ storeColumns, selectData1, selectData2, selectData3, status });
  }

  handleTableChange = (page) => {
    this.getStoreList({page})
  }
  
  remove = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => {
      return pane.key !== targetKey;
    });
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  };
  addNewTab = (id) => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '入库单详情',
      content: (
        <ARinStoreDetail
          index={activeKey}
          remove={this.remove}
          productInfoId={id}
        />
      ),
      key: activeKey,
    });
    this.setState({ panes, activeKey });
  }
  // 开模态框
  handleOpenModal = (warehouse_type,id) => {
    const key = warehouse_type === 1 ? 'fbaVisible' :  'selfVisible';
    this.setState({
      [key]: true,
      id,
    });
  }
  // 关模态框
  handleClose = (key) => {
    this.setState({
      [key]: false,
    });
    this.onSearch(); // 同样搜索结果
  }

  // 初始化首页
  renderTable1 = () => {
    const { storeList, selectData1, selectData2, selectData3, storeData, storeColumns, page } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.shell1}>
        <div className={styles.selectAll}>
          <Form layout='inline'>
            <div className={styles.select}>
              <FormItem label='仓库'>
                {getFieldDecorator('warehouse_id',{initialValue:0})(
                  <RadioGroup>
                    {
                      storeData.map(data => {
                        return (<RadioButton key={data.warehouse_id} value={data.warehouse_id} className={styles.radio} >{data.warehouse_name}</RadioButton>)
                      })
                    }
                  </RadioGroup>
                )}
              </FormItem>
            </div>
            <FormItem>
              {getFieldDecorator('key1', {
                initialValue: 'product_no',
              })(
                <Select
                  style={{ width: 150 }}
                >
                  {
                    selectData1.map(val => {
                      return (<Option key={val.value}>{val.name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('value1')(
                <Input style={{ width: 200, marginRight: 16 }} placeholder='请输入' />
              )
              }
            </FormItem>
            <FormItem>
              {getFieldDecorator('key2', {
                initialValue: 'receipt_no',
              })(
                <Select
                  style={{ width: 150 }}
                >
                  {
                    selectData2.map(val => {
                      return (<Option key={val.value}>{val.name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('value2')(
                <Input style={{ width: 200, marginRight: 16 }} placeholder='请输入' />
              )
              }
            </FormItem>
            <FormItem label='状态'>
              {getFieldDecorator('status', {
                initialValue: '0',
              })(
                <Select
                  style={{ width: 150 }}
                >
                  {
                    selectData3.map(val => {
                      return (<Option key={val.value}>{val.name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <Button
              type="primary"
              style={{ position: 'relative', top: 4 }}
              onClick={this.onSearch}
              size='small'
            >
              搜索
            </Button>
          </Form>
        </div>
        <Table
          columns={storeColumns}
          dataSource={storeList}
          onChange={this.handleTableChange}
          pagination={page}
        />
      </div>
    )
  }


  render() {
    const { panes, selfVisible, id, fbaVisible } = this.state;
    panes[0].content = this.renderTable1();
    return (
      <div className={styles.purchase}>
        <Tabs
          hideAdd
          className="productVariants"
          type="editable-card"
          activeKey={this.state.activeKey}
          onChange={this.onChange}
          onEdit={this.onEdit}
        >
          {this.state.panes.map(pane => (
            <TabPane
              tab={pane.title}
              key={pane.key}
              closable={pane.closable}
            >
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
        {/* 自有仓库模态框 */}
        {
          selfVisible && 
          <SelfStoreModal visible={selfVisible} id={id} onClose={this.handleClose} />
        }
        {/* FBA仓库模态框 */}
        {/* {
          fbaVisible && 
          <FbaStoreModal visible={fbaVisible} id={id} onClose={this.handleClose} />
        } */}
      </div>
    );
  }
}

export default Form.create()(ARinStore);