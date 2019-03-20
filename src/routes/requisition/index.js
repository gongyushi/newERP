import React from 'react';
import { Button, Table, Select, Input, Form, Radio } from 'antd';
import moment from 'moment';
import { erpPost } from '../../services/ajax';
import { Urls, getPageState, getOrderState } from '../../utils/utils';
import PermissionButton from '../../components/PermissionButton';

require('./common.less');

const { Option } = Select;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class AllocationList extends React.Component {
  constructor(props){
    super(props);
    const { activeKey, params } = props;
    this.state = {
      columns: [],
      lists: [],
      storeList: [], // 仓库列表
      status: [],
      activeKey,
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        outbound_warehouse_id: params.Get('outbound_warehouse_id', undefined),
        inbound_warehouse_id: params.Get('inbound_warehouse_id', undefined),
        status: params.Get('status', undefined),
        requisition_no: params.Get('requisition_no', undefined),
      },
      loading: false,
      outbound_warehouse_id: null,
      inbound_warehouse_id: null,
    };
  }
  
  componentDidMount() {
    this.initColumns();
    this.getOrderList({});
    this.getStoreList();
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
  
  getStoreList = () => {
    erpPost('warehouse/index', {}, res => {
      const storeList = res.data.data;
      storeList.unshift({warehouse_name:'全部',warehouse_id:'0'});
      this.setState({
        storeList,
      });
    });
  }
  // 获取数据
  getOrderList = (keyword) => {
    const { page, orders, search  } = this.state;
    erpPost('requisition/index', { page, orders, ...search, ...keyword }, res => {
      this.setState({
        page: res.data.page,
        lists: res.data.data,
      });
    });
  }
  handleSelectChange = (key, e) => {
    let { value } = e.target;
    const { inbound_warehouse_id, outbound_warehouse_id } = this.state;
    value = value === '0' ? undefined : value;
    this.setState({
      [key]: value,
    });
    this.getOrderList({inbound_warehouse_id, outbound_warehouse_id, [key]: value});
  }

  // 初始化表头
  initColumns = () => {
    const status = [
      {
        value: 0,
        name: '创建',
      },
      {
        value: 1,
        name: '部分在途',
      },
      {
        value: 2,
        name: '全部在途',
      },
      {
        value: 3,
        name: '完结',
      },
      {
        value: 4,
        name: '废弃',
      },
    ];
    const columns = [
      {
        title: '调拨单号',
        dataIndex: 'requisition_no',
        key: 'requisition_no',
        width: 200,
        render: (value, record) => (
          <a href={`#/requisition/detail?id=${record.requisition_id}`}>
            {value}
          </a>
        ),
      },
      {
        title: '调入仓库',
        dataIndex: 'inbound_warehouse',
        key: 'inbound_warehouse',
        width: 200,
        render: value => value ? value.warehouse_name : '--',
      },
      {
        title: '调出仓库',
        dataIndex: 'outbound_warehouse',
        key: 'outbound_warehouse',
        width: 200,
        render: value => value ? value.warehouse_name : '--',
      },
      {
        title: '计划调拨数量（件）',
        dataIndex: 'plan_quantity',
        key: 'plan_quantity',
        width: 200,
        render: value => value || 0,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 200,
        sorter: (a,b) => a.status - b.status,
        render: value => value ? status[value].name : '--',
      },
      {
        title: '创建人',
        dataIndex: 'person',
        key: 'person',
        width: 200,
        render: value => value ? value.real_name : '--',
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
              action='requisition/detail'
              href={`#/requisition/detail?id=${record.requisition_id}`}
            >
              详情
            </PermissionButton>
          </div>
        )),
      },
    ];

    this.setState({ columns, status });
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
        if(values.status){
          values.status = values.status.join(',');
        }
        if(values.outbound_warehouse_id === '0'){
          values.outbound_warehouse_id = undefined;
        }
        if(values.inbound_warehouse_id === '0'){
          values.inbound_warehouse_id = undefined;
        }
        this.getOrderList(values);
      }
    });
  }
  render() {
    const { columns, lists, page, loading, storeList, status, search } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className='purchase'>
        <Form layout='inline'>
          <div>
            {
              storeList.length !== 0 && (
                <FormItem label='调入仓库' className='button-radio'>
                  {
                    getFieldDecorator('inbound_warehouse_id',{
                      initialValue: search.inbound_warehouse_id || '0',
                    })(
                      <RadioGroup onChange={this.handleSelectChange.bind(this,'inbound_warehouse_id')}>
                        {
                          storeList.map(list =>
                            <RadioButton className='radio' key={list.warehouse_id} value={String(list.warehouse_id)}>{list.warehouse_name}</RadioButton>
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
              storeList.length !== 0 && (
                <FormItem label='调出仓库' className='button-radio'>
                  {
                    getFieldDecorator('outbound_warehouse_id',{
                      initialValue: search.outbound_warehouse_id || '0',
                    })(
                      <RadioGroup onChange={this.handleSelectChange.bind(this,'outbound_warehouse_id')}>
                        {
                          storeList.map(list =>
                            <RadioButton className='radio' key={list.warehouse_id} value={String(list.warehouse_id)}>{list.warehouse_name}</RadioButton>
                          )
                        }
                      </RadioGroup>
                    )
                  }
                </FormItem>
              )
            }
          </div>
          <FormItem label='调拨单号'>
            {
              getFieldDecorator('requisition_no',{
                initialValue: search.requisition_no || '',
              })(
                <Input style={{ width: 200 }} />
              )
            }
          </FormItem>
          <FormItem label='状态'>
            {
              getFieldDecorator('status',{
                initialValue: search.status instanceof Array ? search.status : search.status ? new Array(search.status) : [] ,
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
                      <Option key={val.value} value={String(val.value)} >{val.name}</Option>
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
            rowKey='requisition_id'
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

export default Form.create()(AllocationList);