import React from 'react';
import { Button, Table, Input, Select, Form, Radio } from 'antd';
import moment from 'moment';
import { erpPost } from '../../services/ajax';
import { Urls, getPageState, getOrderState } from '../../utils/utils';
import PermissionButton from '../../components/PermissionButton';


require('./common.less');

const { Option } = Select;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class OrderList extends React.Component {
  constructor(props){
    super(props);
    const { activeKey, params } = props;
    this.state = {
      columns: [],
      lists: [],
      activeKey,
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        warehouse_id: params.Get('warehouse_id', undefined),
        supplier_id: params.Get('supplier_id', undefined),
        statusStr: params.Get('status', undefined),
        key: params.Get('key', undefined),
        value: params.Get('value', undefined),
      },
      loading: false,
      type: [], // 搜索关键关键字类型
      status: [], // 状态列表
      storeList: [], // 仓库列表
      supplierList: [], // 供应商列表
      warehouse_id: null,
      supplier_id: null,
    };
  }
  componentDidMount() {
    this.initColumns();
    this.getOrderList();
    this.getStoreList();
    this.getSupplierList();
  }
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.getOrderList();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };
  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextState.search) !== JSON.stringify(this.state.search) ||
      JSON.stringify(nextState.orders) !== JSON.stringify(this.state.orders) ||
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    ){
      this.getOrderList();
    }
  };
  
  // 获取数据
  getOrderList = (keyword) => {
    // 获取采购单列表
    const { page, orders, search  } = this.state;
    erpPost('purchase/index',{ page, orders, ...search, ...keyword },res => {
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
  // 初始化表头
  initColumns = () => {
    const columns = [
      {
        title: '采购单号',
        dataIndex: 'purchase_no',
        key: 'purchase_no',
        width: 200,
        render: (value,record) => (
          <a style={{ cursor: 'pointer' }} href={`#/purchase/detail?id=${record.id}`}>
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
        render:val => val || '--',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 200,
        render: ((value, record) => (
          <div>
            <PermissionButton
              size='small'
              type='primary'
              ghost
              action='purchase/detail'
              href={`#/purchase/detail?id=${record.id}`}
            >
              详情
            </PermissionButton>
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
  handleTableChange = (page,filter,sorter) => {
    this.setState({
      page,
      orders: {field:sorter.field,order:sorter.order},
    });
  }
  // 搜索
  handleSearch = () => {
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
        this.getOrderList(values);
      }
    });
  }
  handleSelectChange = (key, e) => {
    let { value } = e.target;
    const { warehouse_id, supplier_id } = this.state;
    value = value === '0' ? undefined : value;
    this.setState({
      [key]: value,
    });
    this.getOrderList({warehouse_id, supplier_id, [key]: value});
  }
  render() {
    const { columns, lists, page, loading, storeList, supplierList, status, type, search } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className='purchase'>
        <Form layout='inline'>
          <div>
            {
              storeList.length !== 0 && (
                <FormItem label='采购仓库' className='button-radio'>
                  {
                    getFieldDecorator('warehouse_id',{
                      initialValue: search.warehouse_id || '0',
                    })(
                      <RadioGroup onChange={this.handleSelectChange.bind(this,'warehouse_id')}>
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
                      initialValue: search.supplier_id || '0',
                    })(
                      <RadioGroup onChange={this.handleSelectChange.bind(this,'supplier_id')}>
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
                initialValue: search.key || 'product_no',
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
              getFieldDecorator('value',{
                initialValue: search.value || '',
              })(
                <Input style={{width: 200}} />
              )
            }
          </FormItem>
          <FormItem label='状态'>
            {
              getFieldDecorator('statusStr',{
                initialValue: search.statusStr instanceof Array ? search.statusStr : search.statusStr ? new Array(search.statusStr) : [] ,
              })(
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
}

export default Form.create()(OrderList);