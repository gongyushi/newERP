import React from 'react';
import { Button, Tabs, Table, message, Input, Select, Form, Radio } from 'antd';
import moment from 'moment';
import PurchaseDetail from './public/PurchaseDetail';
import { erpPost } from '../../services/ajax';


require('./public/common.less');

const { TabPane } = Tabs;
const { Option } = Select;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class OrderList extends React.Component {
  state = {
    panes: [],
    activeKey: '0',
    newTabIndex: 0,
    columns: [],
    lists: [],
    page: {
      pageSize: 10,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
    loading: false,
    type: [], // 搜索关键关键字类型
    status: [], // 状态列表
    storeList: [], // 仓库列表
    supplierList: [], // 供应商列表
    warehouse_id: null,
    supplier_id: null,
  };
  componentDidMount() {
    this.initColumns();
    this.getOrderList();
    this.getStoreList();
    this.getSupplierList();
  }
  
  // 仓库过滤
  onWareHouseId =  (e) => {
    const warehouse_id = e.target.value;
    const { supplier_id } = this.state;
    const values = {};
    if(supplier_id && supplier_id !== '0') {
      values.supplier_id = supplier_id;
    }else{
      values.supplier_id = undefined;
    }
    if(warehouse_id && warehouse_id !== '0') {
      values.warehouse_id = warehouse_id;
    }else{
      values.warehouse_id = undefined;
    }
    this.setState({
      warehouse_id,
    });
    this.getOrderList(values);
  }
  
  // 获取数据
  getOrderList = (keyword) => {
    // 获取采购单列表
    const { page } = this.state;
    erpPost('purchase/index',{page,...keyword},res => {
      this.setState({
        lists: res.data.data,
        page: res.data.page,
      });
    });
  }
  
  // 获取仓库列表
  getStoreList = () => {
    erpPost('warehouse/index', {}, res => {
      const storeList = res.data.data;
      storeList.unshift({ warehouse_name: '全部', warehouse_id: '0' });
      this.setState({
        storeList,
      });
    });
  }
  // 获取供应商列表
  getSupplierList = () => {
    erpPost('supplier/index',{},res => {
      const supplierList = res.data.data;
      supplierList.unshift({ name: '全部', supplier_id: '0' });
      this.setState({
        supplierList,
      });
    });
  }
  // 供应商过滤
  outSupplierId =  (e) => {
    const supplier_id = e.target.value;
    const { warehouse_id } = this.state;
    const values = {};
    if(supplier_id && supplier_id !== '0') {
      values.supplier_id = supplier_id;
    }else{
      values.supplier_id = undefined;
    }
    if(warehouse_id && warehouse_id !== '0') {
      values.warehouse_id = warehouse_id;
    }else{
      values.warehouse_id = undefined;
    }
    this.setState({
      supplier_id,      
    });
    this.getOrderList(values)
  }
  // 初始化采购首页
  initIndexPage = () => {
    const { columns, lists, page, loading, storeList, supplierList, status, type } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form layout='inline'>
          <div>
            {
              storeList.length !== 0 && (
                <FormItem label='采购仓库' className='button-radio'>
                  {
                    getFieldDecorator('warehouse_id',{
                      initialValue: '0',
                    })(
                      <RadioGroup onChange={this.onWareHouseId}>
                        {
                          storeList.map(list =>
                            <RadioButton className='radio' key={list.warehouse_id} value={list.warehouse_id}>{list.warehouse_name}</RadioButton>
                          )
                        }
                      </RadioGroup>
                    )
                  }
                </FormItem>
              )
            }
          </div>
          <div>
            {
              supplierList.length !== 0 && (
                <FormItem label='供应商' className='button-radio'>
                  {
                    getFieldDecorator('supplier_id',{
                      initialValue: '0',
                    })(
                      <RadioGroup onChange={this.outSupplierId}>
                        {
                          supplierList.map(list =>
                            <RadioButton className='radio' key={list.supplier_id} value={list.supplier_id}>{list.name}</RadioButton>
                          )
                        }
                      </RadioGroup>
                    )
                  }
                </FormItem>
              )
            }
          </div>
          <FormItem>
            {
              getFieldDecorator('key', {
                initialValue: 'product_no',
              })(
                <Select style={{ width: 120 }}>
                  {
                    type.map(list =>
                      <Option key={list.value} >{list.name}</Option>
                    )
                  }
                </Select>
              )
            }
          </FormItem>
          <FormItem>
            {
              getFieldDecorator('value')(
                <Input style={{width: 200}} />
              )
            }
          </FormItem>
          <FormItem label='状态'>
            {
              getFieldDecorator('statusStr')(
                <Select
                  style={{ width: 250, margin: '5px' }}
                  placeholder='请选择状态'
                  mode='multiple'
                  tokenSeparators={[',']}
                  maxTagCount={2}
                  maxTagPlaceholder='...'
                >
                  {
                    status.map(val =>
                      <Option key={val.value} >{val.name}</Option>
                    )
                  }
                </Select>
              )
            }
          </FormItem>
          <Button type='primary' onClick={this.handleSearch}>
            搜索
          </Button>
        </Form>
        <div>
          <Table
            columns={columns}
            rowKey='id'
            dataSource={lists}
            pagination={page}
            loading={loading}
            onChange={this.handleTableChange}
          />
        </div>
      </div>
    );
  }
  // 初始化表头
  initColumns = () => {
    const columns = [
      {
        title: '采购单号',
        dataIndex: 'purchase_no',
        key: 'purchase_no',
        width: 200,
        render: (value,record) => (
          <a style={{ cursor: 'pointer' }} onClick={this.handleDetail.bind(this, record.id)}>
            {value}
          </a>
        ),
      },
      {
        title: '采购仓库',
        dataIndex: 'warehouse_name',
        key: 'warehouse_name',
        width: 200,
      },
      {
        title: '供应商',
        dataIndex: 'supplier_name',
        key: 'supplier_name',
        width: 200,
      },
      {
        title: '总额',
        dataIndex: 'amount',
        key: 'amount',
        width: 200,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 200,
        sorter: (a,b) => a.status - b.status,
        render: value => status[value].name,
      },
      {
        title: '创建人',
        dataIndex: 'real_name',
        key: 'real_name',
        width: 200,
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 200,
        sorter: (a,b) => moment(a.created_at) - moment(b.created_at),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 200,
        render: ((value, record) => (
          <div>
            <Button
              size='small'
              onClick={this.handleDetail.bind(this, record.id)}
              style={{ borderColor: '#6F9EEF', color: '#6F9EEF' }}
            >
              详情
            </Button>
          </div>
        )),
      },
    ];
    const status = [
      {
        value: 0,
        name: '草稿',
      },
      {
        value: 1,
        name: '审核中',
      },
      {
        value: 2,
        name: '审核通过',
      },
      {
        value: 3,
        name: '已下单',
      },
      {
        value: 4,
        name: '执行中',
      },
      {
        value: 5,
        name: '已完结',
      },
      {
        value: 6,
        name: '已废弃',
      },
      {
        value: 7,
        name: '被驳回',
      },
    ];
    const type = [
      // {
      //   name: '全部',
      //   value: 'all',
      // },
      {
        name: '产品ID',
        value: 'product_no',
      },
      {
        name: '产品名称',
        value: 'title',
      },
      {
        name: '产品SKU',
        value: 'product_sku',
      },
    ];
    this.setState({ columns, status, type });
  }
  // 表格事件
  handleTableChange = (page) => {
    this.handleSearch(page);
  }
  // 搜索
  handleSearch = (page) => {
    this.props.form.validateFields((err,values) => {
      if(!err){
        if(values.statusStr){
          values.statusStr = values.statusStr.join(',');
        }
        if(values.key === 'all'){
          values.key = undefined;
          values.value = undefined;
        }
        if(values.warehouse_id === '0'){
          values.warehouse_id = undefined;
        }
        if(values.supplier_id === '0'){
          values.supplier_id = undefined;
        }
        if(!page){
          page = this.state.page;
        }
        this.getOrderList({page,...values});
      }
    });
  }
  handleInputChange = (key, e) => {
    this.setState({
      [key]: e.target.value,
    });
  }
  handleSelectChange = (key, value) => {
    this.setState({
      [key]: value,
    });
  }
  // 子元素添加Tab元素
  handleAddPane = (title, component) => {
    const { panes } = this.state;
    let { newTabIndex, activeKey } = this.state;
    activeKey = `newTab${newTabIndex++}`;
    panes.push({
      title,
      key: activeKey,
      content: component,
    });
    this.setState({ panes, newTabIndex, activeKey });
  }
  // 详情页
  handleDetail = (id) => {
    // console.log(id);
    const { panes } = this.state;
    let { newTabIndex, activeKey } = this.state;
    // console.log(newTabIndex);
    activeKey = `newTab${newTabIndex++}`;
    panes.push({
      title: '采购单详情',
      key: activeKey,
      content: (
        <PurchaseDetail onAddPane={this.handleAddPane} purchase_id={id} />
      ),
    });
    this.setState({ panes, newTabIndex, activeKey });
  }
  // tab删除
  remove = (targetKey) => {
    let { activeKey, panes } = this.state;
    let lastIndex;
    panes.forEach((pane, idx) => {
      if (pane.key === targetKey) {
        lastIndex = idx - 1;
      }
    });
    panes = panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  }
  // tab切换
  handleChange = activeKey => {
    this.setState({ activeKey });
  };
  handleEdit = async (targetKey, action) => {
    this[action](targetKey);
  };
  render() {
    const { panes, activeKey } = this.state;
    panes[0] = {
      title: '采购单',
      content: this.initIndexPage(),
      key: '0',
      closable: false,
    };
    // console.log(this.state);
    return (
      <div className='purchase'>
        <Tabs
          hideAdd
          onChange={this.handleChange}
          activeKey={activeKey}
          type='editable-card'
          onEdit={this.handleEdit}
          tabBarStyle={{ margin: 0 }}
        >
          {
            panes.map(pane => (
              <TabPane
                tab={pane.title}
                key={pane.key}
                closable={pane.closable}
              >
                {pane.content}
              </TabPane>
            ))
          }
        </Tabs>
      </div>

    );
  }
}

export default Form.create()(OrderList);