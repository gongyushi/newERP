import React from 'react';
import { Button, Tabs, Table, message, Select, Input, Form, Radio } from 'antd';
import moment from 'moment';
import AllocationDetail from './public/AllocationDetail';
import { erpPost } from '../../services/ajax';

require('./public/common.less');

const { TabPane } = Tabs;
const { Option } = Select;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class AllocationList extends React.Component {
  state = {
    panes: [],
    activeKey: '0',
    newTabIndex: 0,
    columns: [],
    lists: [],
    storeList: [], // 仓库列表
    status: [],
    page: {
      pageSize: 10,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
    loading: false,
    outbound_warehouse_id: null,
    inbound_warehouse_id: null,
  };
  componentDidMount() {
    this.initColumns();
    this.getOrderList({});
    this.getStoreList();
  }

  // 入仓库过滤
  onWareHouseId =  (e) => {
    const inbound_warehouse_id = e.target.value;
    const { outbound_warehouse_id } = this.state;
    const values = {};
    if(outbound_warehouse_id && outbound_warehouse_id !== '0') {
      values.outbound_warehouse_id = outbound_warehouse_id;
    }else{
      values.outbound_warehouse_id = undefined;
    }
    if(inbound_warehouse_id && inbound_warehouse_id !== '0') {
      values.inbound_warehouse_id = inbound_warehouse_id;
    }else{
      values.inbound_warehouse_id = undefined;
    }
    this.setState({
      outbound_warehouse_id,
    });
    this.getOrderList(values)
  }
  
     
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
    const { page } = this.state;
    erpPost('requisition/index', { page, ...keyword }, res => {
      this.setState({
        page: res.data.page,
        lists: res.data.data,
      });
    });
  }
  handleSelectChange = (key, value) => {
    this.setState({
      [key]: value,
    });
  }

  // 出仓库过滤
  outWareHouseId =  (e) => {
    const outbound_warehouse_id = e.target.value;
    const { inbound_warehouse_id } = this.state;
    const values = {};
    if(outbound_warehouse_id && outbound_warehouse_id !== '0') {
      values.outbound_warehouse_id = outbound_warehouse_id;
    }else{
      values.outbound_warehouse_id = undefined;
    }
    if(inbound_warehouse_id && inbound_warehouse_id !== '0') {
      values.inbound_warehouse_id = inbound_warehouse_id;
    }else{
      values.inbound_warehouse_id = undefined;
    }
    this.setState({
      inbound_warehouse_id,      
    });
    this.getOrderList(values)
  }

  // 初始化采购首页
  initIndexPage = () => {
    const { columns, lists, page, loading, storeList, status } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form layout='inline'>
          <div>
            {
              storeList.length !== 0 && (
                <FormItem label='调入仓库' className='button-radio'>
                  {
                    getFieldDecorator('inbound_warehouse_id',{
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
              storeList.length !== 0 && (
                <FormItem label='调出仓库' className='button-radio'>
                  {
                    getFieldDecorator('outbound_warehouse_id',{
                      initialValue: '0',
                    })(
                      <RadioGroup onChange={this.outWareHouseId}>
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
          <FormItem label='调拨单号'>
            {
              getFieldDecorator('requisition_no')(
                <Input style={{ width: 200 }} />
              )
            }
          </FormItem>
          <FormItem label='状态'>
            {
              getFieldDecorator('status')(
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
          <a onClick={this.handleDetail.bind(this, record.requisition_id)}>
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
              onClick={this.handleDetail.bind(this, record.requisition_id)}
              style={{ borderColor: '#6F9EEF', color: '#6F9EEF' }}
            >
              详情
            </Button>
          </div>
        )),
      },
    ];

    this.setState({ columns, status });
  }
  // 表格事件
  handleTableChange = (page) => {
    this.handleSearch({page});
  }
  // 搜索
  handleSearch = ({page}) => {
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
        if(!page){
          page = this.state.page;
        }
        this.getOrderList({page,...values});
      }
    });
  }
  // 详情页
  handleDetail = (id) => {
    // console.log(id);
    const { panes } = this.state;
    let { newTabIndex, activeKey } = this.state;
    // console.log(newTabIndex);
    activeKey = `newTab${newTabIndex++}`;
    panes.push({
      title: '调拨单详情',
      key: activeKey,
      content: (
        <AllocationDetail requisition_id={id} />
      ),
    });
    this.setState({ panes, newTabIndex, activeKey });
  }
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
  handleChange = activeKey => {
    this.setState({ activeKey });
  };
  handleEdit = async (targetKey, action) => {
    this[action](targetKey);
  };
  render() {
    const { panes, activeKey } = this.state;
    panes[0] = {
      title: '调拨单',
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

export default Form.create()(AllocationList);