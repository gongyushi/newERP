import React from 'react';
import { Tabs, Button, Table, Select, Input, Form, Radio } from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './ARoutStore.less';
import ARoutStoreDetail from './ARoutStoreDetail';
import SelfOutStoreModal from './public/SelfOutStoreModal';
import FbaOutStoreModal from './public/FbaOutStoreModal';

const { Option } = Select;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
require('../ListStyle.less');

@Form.create()
class ARoutStore extends React.Component {
  constructor(props){
    super(props)
    this.newTabIndex = 1;
    this.state={
      storeData:[],
      select1Data:[
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
      ],
      select2Data: [
        {
          name: '出库单号',
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
          name: '配送出库编号',
          value: 'shipments_outbound_id',
        },
      ],
      select3Data: [
        {
          name: '全部',
          value: 0,
        },
        {
          name: '待出库',
          value: 10,
        },
        {
          name: '已出库',
          value: 11,
        },
      ],
      dataSource:[],
      panes:[{
        title:'出库管理',
        content:'',
        key: '0',
        closable: false,
      }],
      activeKey: '0',
      page: {
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
      },
      selfVisible: false,
      fbaVisible: false,
      id: '', 
      warehouse_id: 0,
      status: 0,
    }
  }
  
  componentDidMount(){
    this.getStoreList();
    this.getWarehouseList();
  }

  // 搜索触发事件
  onSearch = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
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

  // 复选框过滤
  onRadioChange = (e) => {
    const {status}=this.state;
    const {value} = e.target;
    const warehouse_id = value;
    this.setState({warehouse_id})
    this.getStoreList({warehouse_id,status});
  }

  // 状态下拉触发事件
  onSelectChange = (e) => {
    const {warehouse_id}=this.state;
    const status = e;
    this.setState({status})
    this.getStoreList({warehouse_id,status});
  }

  // 获取出库列表
  getStoreList = (value) => {
    const { page } = this.state;
    const can = {
      page,
      key1:value&&value.key1,
      value1:value&&value.value1,
      key2:value&&value.key2,
      value2:value&&value.value2,
    }
    if(value&&value.warehouse_id&&value.warehouse_id!==0){
      can.warehouse_id = value.warehouse_id; 
    }   
    if(value&&value.status&&value.status!==0){
      can.status = value.status; 
    }       
    erpPost('warehouse-receipt/outbound-index', can, res => {
      this.setState({
        dataSource: res.data.data,
        page: res.data.page,
      });
    });
  }

  // 获取仓库列表
  getWarehouseList = () => {
    erpPost('warehouse/index',{},res => {
      const { data } = res.data;
      data.unshift({warehouse_id:0,warehouse_name:'全部'});
      this.setState({
        storeData: data,
      });
    });
  }

  handleTableChange = (page) => {
    erpPost('warehouse-receipt/outbound-index', page, res => {
      this.setState({
        dataSource: res.data.data,
        page,
      });
    });
  }

  addNewTab = (id) => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '出库单详情',
      content: (
        <ARoutStoreDetail
          index={activeKey}
          remove={this.remove}
          warehouseId={id}
        />
      ),
      key: activeKey,
    });
    this.setState({ panes, activeKey });
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
  
   // 开模态框
   handleOpenModal = (warehouse_type,id) => {
    const key = warehouse_type === 1 ? 'fbaVisible' : warehouse_type===0 ? 'selfVisible' : '';
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
  }

  renderTable1 = () => {
    const { dataSource, select1Data, storeData, select2Data, select3Data, page} = this.state;
    const { getFieldDecorator } = this.props.form;
    const columns = [
      {
        title: '出库单号',
        dataIndex: 'receipt_no',
        key:'receipt_no',
        className: 'width200',
      },
      {
        title: '仓库',
        dataIndex: 'warehouse_name',
        key:'warehouse_name',
        className: 'width200',
      },
      {
        title: '调拨单号',
        dataIndex: 'requisition_no',
        key:'requisition_no',
        className: 'width200',
        render: (text) => {
          return (<span style={{color:'#0099FF'}} >{text}</span>)
        },
      },
      {
        title: '销售订单号',
        dataIndex: 'purchase_no',
        key:'purchase_no',
        className: 'width200',
      },
      {
        title: '计划出库数量(件)',
        dataIndex: 'expect_count',
        key:'expect_count',
        className: 'width200',
        sorter: (a, b) => a.expect_count - b.expect_count,
      },
      {
        title: '实际出库数量(件)',
        dataIndex: 'real_count',
        key:'real_count',
        className: 'width200',
        sorter: (c, d) => c.real_count - d.real_count,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key:'status',
        className: 'width200',
        sorter: (e, f) => e.status - f.status,
        render: (text) => {
          return (text===10?'待出库':text===11?'已出库':null)
        },
      },
      {
        title: '出库完成时间',
        dataIndex: 'happen_at',
        key:'happen_at',
        className: 'width200',
        sorter: (e, f) => e.happen_at - f.happen_at,
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key:'created_at',
        className: 'width200',
      },
      {
        title: '操作',
        dataIndex: 'text',
        key:'',
        className: 'width200',
        render: (text, record) => {
          return (
            <div>
              {
                record.status === 10 && 
                (
                  <Button 
                    type="primary" 
                    size='small' 
                    ghost 
                    onClick={this.handleOpenModal.bind(this,record.warehouse_type, record.id)}
                  >
                    出库
                  </Button>
                )
              }
              <Button 
                type='primary' 
                size='small' 
                style={{marginLeft:10}} 
                ghost 
                onClick={this.addNewTab.bind(this,record.id)}
              >
                详情
              </Button>
            </div>
          );          
        },
      },    
    ]

    return (
      <div className={styles.shell1}>
        <div className={styles.selectAll}>    
          <Form layout='inline'>
            <div className={styles.select}>
              <FormItem label='仓库'>
                {getFieldDecorator('warehouse_id', {initialValue:0})(
                  <RadioGroup onChange={this.onRadioChange}>
                    {
                      storeData.map(data => {
                        return (<RadioButton key={data.warehouse_id} value={data.warehouse_id} className={styles.radio}>{data.warehouse_name}</RadioButton>)
                      })
                    }
                  </RadioGroup>
                )}
              </FormItem>
            </div>
            <FormItem>
              {getFieldDecorator('key1', {initialValue:select1Data[0].value})(
                <Select className={styles.selecto}>
                  {
                    select1Data.map(select2=>{
                      return (<Option key={select2.value} value={select2.value}>{select2.name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('value1')(
                <Input  className={styles.input} />
                )
              }
            </FormItem>
            <FormItem>
              {getFieldDecorator('key2', {initialValue:select2Data[0].value})(
                <Select className={styles.selecto}>
                  {
                    select2Data.map(select2=>{
                      return (<Option value={select2.value}>{select2.name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('value2')(
                <Input  className={styles.input} />
                )
              }
            </FormItem>
            <FormItem label='状态'>
              {getFieldDecorator('status', {initialValue:0})(
                <Select style={{width:150}} onChange={this.onSelectChange}>
                  {
                    select3Data.map(val => {
                      return (<Option key={val.value} value={val.value}>{val.name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <Button type="primary" className={styles.button} onClick={this.onSearch} >搜索</Button>
          </Form> 
        </div>
        <Table
          onChange={this.handleTableChange}
          pagination={page}
          columns={columns}
          dataSource={dataSource}
        />
      </div>
    )
  }

  render() {
    const {panes,selfVisible, id, fbaVisible} = this.state;
    panes[0].content= this.renderTable1();
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
        {selfVisible&&<SelfOutStoreModal visible={selfVisible} id={id} onClose={this.handleClose} getStoreList={this.getStoreList} />}
        {/* {fbaVisible&&<FbaOutStoreModal visible={fbaVisible} id={id} onClose={this.handleClose} getStoreList={this.getStoreList} /> }    */}
      </div>
    );
  }
}

export default ARoutStore;