import moment from 'moment';
import React from 'react';
import { Button, Table, Row, Col, Icon } from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './index.less';
import EditableLine from '../../components/EditableLine';
import OutWareModal from './outWareModal';
import InWareModal from './inWareModal';
import DeleteConfirmModal from '../../components/DeleteConfirm';

const { Column, ColumnGroup } = Table;
require('../ListStyle.less');

class Detail extends React.Component {
  constructor(props){
    super(props);
    const { activeKey, params } = props;
    this.state= {
      inStoreData: [],
      outStoreData: [],
      alloListData: [],
      stockData: [],
      alloPlanData: [],
      planMount: 0,
      totalMount: 0,
      Edit: '',
      options: [],
      showOutWare: false,
      showInWare: false,
      allocationDetail: {},
      type: {
        10: '调拨出库', 
        11: '订单出库', 
        20: '调拨入库', 
        21: '采购入库',
      },
      activeKey,
      product_id: params.Get('product_id', null),
      inbound_warehouse_id: params.Get('inbound_warehouse_id', null),
      product_dynamic_data_id: params.Get('product_dynamic_data_id', null),
      product_no: params.Get('product_no', null),
      warehouseId: params.Get('warehouseId', null),
    }
  }
   
  componentDidMount() {
    this.refresh();
  };

  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.refresh();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };
  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextState.product_dynamic_data_id) !== JSON.stringify(this.state.product_dynamic_data_id)
    ){
      this.refresh();
    }
  };

  // 获取详情数据
  handleAllocationDetail = () => {
    const { product_dynamic_data_id } = this.state;
    erpPost('/requisition-warning/detail', {product_dynamic_data_id}, res => {
      this.setState({ 
        allocationDetail: res.data.data,
      });
    });
    erpPost('/requisition-warning/stock-info', {product_dynamic_data_id}, res => {
      this.setState({ 
        stockData: res.data.data,
      });
    });
    
  }
  
  // 获取调拨计划的数据
  handleAllocationPlan = () => {
    const { inbound_warehouse_id, product_no } = this.state;
    const can = {
      inbound_warehouse_id,
      key:'product_no',
      value:product_no,
    }
    erpPost('/requisition-plan/index', can, res => {
      const {data}=res.data;
      let totalMount = 0;
      data.map(t=>{
        totalMount += t.quantity;
      })
      this.setState({ 
        alloPlanData: res.data.data,
        totalMount,
      });
    });
  }
  
  // 获取调拨单数据
  handleAllocationList = () => {
    const { product_dynamic_data_id } = this.state;
    erpPost('/requisition-warning/requisition-list', {product_dynamic_data_id}, res => {
      this.setState({ 
        alloListData: res.data.data,
        planMount:res.data.requisition_un_ship_number,
      });
    });
  }

  // 待出库
  handleInStore = () => {
    const { product_dynamic_data_id } = this.state;
    const type = 10;
    erpPost('/requisition-warning/receipt-list', {product_dynamic_data_id,type}, res => {
      this.setState({ 
        outStoreData: res.data.data,
      });
    });
  }

  // 待入库
  handleOutStore = () => {
    const { product_dynamic_data_id } = this.state;
    const type = 20;
    erpPost('/requisition-warning/receipt-list', {product_dynamic_data_id,type}, res => {
      this.setState({ 
        inStoreData: res.data.data,
      });
    });
  }

  // 出库单模态框
  handleShowOut = (id) => {
    this.setState({
      showOutWare: true,
      outId:id,
    })
  }

  handleCloseOut = () => {
    this.setState({
      showOutWare: false,
    })
  }
  
  // 入库单模态框
  handleShowIn = (id) => {
    this.setState({
      showInWare: true,
      inId:id,
    })
  }

  handleCloseIn = () => {
    this.setState({
      showInWare: false,
    })
  }

  // 编辑调拨计划
  handleEdit = (index) => {
    this.setState({Edit:index})
  }
  
  // 删除调拨计划
  handleDelete = (id) => { 
    erpPost('/requisition-plan/delete', {id}, () => {
      this.handleAllocationPlan()
    });
  }
  
  // 批量删除调拨计划
  handleDeleteConfirm = () =>{
    const { alloPlanData } = this.state;
    const idmix = [];
    if(alloPlanData) {
      alloPlanData.map(caigou=>{
        idmix.push(caigou.id)
      })
    }
    const ids = idmix.join(',')  
    erpPost('/requisition-plan/batch-delete', {ids}, () => {  
      this.handleAllocationPlan()
    });     
  }
  
  // 编辑新增调拨计划
  handleSave = (record) => {
    const { outbound_warehouse_name, quantity, plan_arrive_at, options } = this.state;
    const { inbound_warehouse_id, product_id } = this.state;
    const obj = {
      inbound_warehouse_id,
      product_id,
      outbound_warehouse_id: outbound_warehouse_name&&outbound_warehouse_name.props.value || record.outbound_warehouse_id,
      quantity: quantity || record.quantity,
      plan_arrive_at: moment(plan_arrive_at).format('YYYY-MM-DD') || moment(record.plan_arrive_at).format('YYYY-MM-DD'),
    }
    if(record.id){
      obj.id = record.id;
      erpPost('/requisition-plan/edit', obj, () => {
        this.setState({ 
          Edit:'',
        });
        this.handleAllocationPlan()
      });
    } else {
      if(!obj.outbound_warehouse_id){
        obj.outbound_warehouse_id = options[0]&&options[0].key;
      }
      erpPost('/requisition-plan/add', obj, () => {
        this.setState({ 
          Edit:'',
        });
        this.handleAllocationPlan()
      });
    }
  } 

  handleCancel = (record, index) => {
    const {alloPlanData}=this.state;
    if(record.id) {
      this.setState({Edit:''})
    } else {
      alloPlanData.splice(index,1)
      this.setState({ alloPlanData });
    }
  }

  handleChange = (name, val) => {
    this.setState({
      [name]:val,
    })
  }
  
  // 获取仓库列表的数据
  handleWarehouseList = () => {
    const { warehouseId} = this.state;
    erpPost('/warehouse/index',{},res => {
      const { data } = res.data;
      const newData = [];
      if(data) {
        data.map(e=>{
          if(e.warehouse_id!==warehouseId){
            const obj = { 
              key:e.warehouse_id,
              value:e.warehouse_name,
            }
            newData.push(obj)
          }          
        })
      }
      this.setState({
        options: newData,
      });
    });
  }
  
  refresh() {
    this.handleAllocationDetail()
    this.handleInStore()
    this.handleOutStore()
    this.handleAllocationPlan()
    this.handleWarehouseList()
    this.handleAllocationList()
  } 
 
  // 入库单列表
  rendInStore = () => {
    const {inStoreData,type}=this.state;
    const columns = [
      {
        title: '入库单号',
        dataIndex: 'receipt_no',
        key: 'receipt_no',
        render: (text, record) => {
          return (
            <span onClick={() => this.handleShowIn(record.warehouse_receipt_id)}>{text}</span>
          )
        },
      },
      {
        title: '入库类型',
        dataIndex: 'sub_type',
        key: 'sub_type',
        render:(text)=>{
          return (type[text])
        },
      },
      {
        title: '出库单号',
        dataIndex: 'outbound_no',
        key: 'outbound_no',
      },
      {
        title: '计划入库数量(件）',
        dataIndex: 'expect_qualified_count',
        key: 'expect_qualified_count',
      },
      {
        title: '计划到货时间',
        dataIndex: 'plan_arrive_at',
        key: 'plan_arrive_at',
        render: (text)=>{
          return text&&moment(text).format('YYYY-MM-DD')
        },
      },
      {
        title: '计划断货时间',
        dataIndex: 'out_of_stock_date',
        key: 'out_of_stock_date',
        render: (text)=>{
          return text&&moment(text).format('YYYY-MM-DD')
        },
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
      },
    ]
    return (
      <div>
        <Table
          pagination={false}
          dataSource={inStoreData}
          columns={columns}
        />
      </div>
    )
  }
  
  // 出库单列表
  rendOutStore = () => {
    const {outStoreData,type}=this.state;
    const columns = [
      {
        title: '出库单号',
        dataIndex: 'receipt_no',
        key: 'receipt_no',
        render: (text, record) => {
          return (
            <span onClick={()=>this.handleShowOut(record.warehouse_receipt_id)}>{text}</span>
          )
        },
      },
      {
        title: '调出仓库',
        dataIndex: 'warehouse',
        key: 'warehouse',
        render:(text)=>{
          return text.warehouse_name
        },
      },
      {
        title: '出库类型',
        dataIndex: 'sub_type',
        key: 'sub_type',
        render:(text)=>{
          return (type[text])
        },
      },
      {
        title: '计划出库数量(件）',
        dataIndex: 'expect_qualified_count',
        key: 'expect_qualified_count',
      },
      {
        title: '计划到货时间',
        dataIndex: 'plan_arrive_at',
        key: 'plan_arrive_at',
      },
      {
        title: '计划断货时间',
        dataIndex: 'out_of_stock_date',
        key: 'out_of_stock_date',        
        render: (text)=>{
          return text&&moment(text).format('YYYY-MM-DD')
        },
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
      },
    ]
    return (
      <div>
        <Table
          pagination={false}
          dataSource={outStoreData}
          columns={columns}
        />
      </div>
    )
  }
  
  // 调拨单列表
  rendAlloList = () => {
    const {alloListData}=this.state;
    const columns = [
      {
        title: '调拨单号',
        dataIndex: 'requisition_no',
        key: 'requisition_no',
        render:(text,record)=>{
          return <a  href={`#/requisition/index?id=${record.requisition_id}`}>{text}</a>
        },
      },
      {
        title: '调出仓库',
        dataIndex: 'outbound_warehouse',
        key: 'outbound_warehouse',
        render:(text)=>{
          return text.warehouse_name
        },
      },    
      {
        title: '计划调拨数量(件)',
        dataIndex: 'plan_quantity',
        key: 'plan_quantity',
      },
      {
        title: '在途数量(件)',
        dataIndex: 'transfer_quantity',
        key: 'transfer_quantity',
      },
      {
        title: '已入库数量(件)',
        dataIndex: 'instore',
        key: 'instore',
        render: (text, record) =>{
          return record.outbound_quantity - record.transfer_quantity
        },
      },
      {
        title: '未发货数量(件)',
        dataIndex: 'store',
        key: 'store',
        render: (text, record) =>{
          return record.plan_quantity - record.outbound_quantity
        },
      },
      {
        title: '期待到货时间(UTC)',
        dataIndex: 'plan_arrive_at',
        key: 'plan_arrive_at',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
      },
    ]
    return (
      <div>
        <Table
          pagination={false}
          dataSource={alloListData}
          columns={columns}
        />
      </div>
    )
  }
  
  // 库存情况列表
  rendStock = () => {
    const {stockData}=this.state;
    return (
      <Table dataSource={stockData} pagination={false}>
        <Column
          title="仓库"
          dataIndex="warehouse_name"
          key="warehouse_name"
        />
        <Column
          title="可售库存"
          dataIndex="in_stock_quantity"
          key="in_stock_quantity"
        />
        <Column
          title="在途数量"
          dataIndex="purchase_transfer_quantity"
          key="purchase_transfer_quantity"
          render={(text, record) => (
            <span>
              {record.purchase_transfer_quantity+record.requisition_transfer_quantity}
            </span>
          )}
        />
        <Column
          title="未出库数量"
          dataIndex="pending_outbound_quantity"
          key="pending_outbound_quantity"
        />
        <Column
          title="安全库存"
          dataIndex="requisition_safe_quantity"
          key="requisition_safe_quantity"
        />
        <Column
          title="日均销量"
          dataIndex="days_volumes_average"
          key="days_volumes_average"
        />
        <Column
          title="可售天数"
          dataIndex="sales_days"
          key="sales_days"
        />
        <ColumnGroup title="智能建议">
          <Column
            title="数量"
            dataIndex="requisition_expect_quantity"
            key="requisition_expect_quantity"
          />
          <Column
            title="到货时间"
            dataIndex="requisition_expect_arrival_at"
            key="requisition_expect_arrival_at"
            render={(text) => (
              <span>
                {moment(text).format('YYYY-MM-DD')}
              </span>
            )}
          />
        </ColumnGroup>
        <ColumnGroup title="调拨计划">
          <Column
            title="数量"
            dataIndex="plan_num"
            key="plan_num"
          />
        </ColumnGroup>
      </Table>
    )
  }

  // 新增调拨计划
  addPlan = () => {
    const {alloPlanData,options}=this.state;
    const newData = alloPlanData;
    const obj = {
      outbound_warehouse_name: options[0]&&options[0].key,
      quantity: 0,
      plan_arrive_at: moment(new Date()).format('YYYY-MM-DD'),  
      editable: true,
    }
    newData.push(obj)
    this.setState({
      alloPlanData: newData,
    })
  }
  
  // 调拨计划列表
  rendAlloPlan = () => {
    const {alloPlanData,options}=this.state;
    const columns = [
      {
        title: '调出仓库',
        dataIndex: 'outbound_warehouse_name',
        key: 'outbound_warehouse_name',
        className: 'width200',
        render: (text, record) => {
          return (
            <EditableLine 
              value={record.outbound_warehouse_name}
              type="select"
              name='outbound_warehouse_name'
              options={options}
              editable={record.editable}
              onChange={this.handleChange}
              placeholder="请选择仓库"
            />
          )
        },
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        key: 'quantity',
        className: 'width200',
        render: (text, record, index) => {
          return (
            <EditableLine 
              value={record.quantity}
              type="input"
              name='quantity'
              editable={record.editable || (index===this.state.Edit)}
              onChange={this.handleChange}
            />
          )
        },
      },
      {
        title: '到货时间',
        dataIndex: 'plan_arrive_at',
        key: 'plan_arrive_at',
        className: 'width200',
        type: 'time',
        render: (text, record, index) => {
          return (
            <EditableLine 
              value={record.plan_arrive_at&&moment(record.plan_arrive_at).format('YYYY-MM-DD')}
              type="time"
              name='plan_arrive_at'
              editable={record.editable || (index===this.state.Edit)}
              onChange={this.handleChange}
            />
          )
        },
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        className: 'width200',
      },
      {
        title: '更新时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        className: 'width200',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        className: 'width200',
        render: (text, record, index) => {
          return (
            this.state.Edit===index || record.editable?
            (
              <div>
                <Button type="primary" ghost onClick={()=>this.handleSave(record)} style={{marginRight:10}}>保存</Button>
                <Button type="primary" ghost style={{ width: 60 }} className="buttonDel" onClick={()=>this.handleCancel(record,index)}>取消</Button>
              </div>
            )
            :
            (
              <div>
                <Button type="primary" ghost onClick={()=>this.handleEdit(index)} style={{marginRight:10}}>编辑</Button>
                <DeleteConfirmModal 
                  onOk={this.handleDelete.bind(this, record.id)}
                  content='确定删除调拨计划?'
                >  
                  <Button
                    size="small"
                    className="buttonDel"
                    style={{ width: 60 }}
                    type="primary"
                    ghost
                  >
                    删除
                  </Button>
                </DeleteConfirmModal>
              </div>
            )          
          )
        },
      },
    ]
    return (
      <div>
        <Table
          dataSource={alloPlanData}
          columns={columns}
          pagination={false}
        />
      </div>
    )
  }

  render() {
    const {showOutWare, outId, showInWare, inId, allocationDetail } = this.state;
    const oneWarn = <span>不建议调拨</span>
    const twoWarn = <span style={{color:'#ffff00'}}>建议调拨</span>
    const threeWarn = <span style={{color:'#ffcc00'}}>有断货风险</span>
    const forWarn = <span style={{color:'#ff9900'}}>即将断货</span>
    return(
      <div>
        <div>  
          <Row gutter={146}>
            <Col span={3}>
              <img src={allocationDetail&&allocationDetail.product&&allocationDetail.product.image_url} alt=" " style={{height:'140px'}} />
            </Col>
            <Col span={21}>
              <Row style={{height:'40px'}}>
                <Col span={6}><a>产品ID：{allocationDetail&&allocationDetail.product&&allocationDetail.product.product_no}</a></Col>
                <Col span={6}>补货仓库：{allocationDetail&&allocationDetail.warehouse&&allocationDetail.warehouse.warehouse_name}</Col>
                <Col span={12}>建议类型：
                  {
                    allocationDetail&&allocationDetail.requisition_warning_level===3?forWarn:
                    allocationDetail&&allocationDetail.requisition_warning_level===2?threeWarn:
                    allocationDetail&&allocationDetail.requisition_warning_level===1?twoWarn:
                    allocationDetail&&allocationDetail.requisition_warning_level===0?oneWarn:''
                  }
                </Col>
              </Row>
              <Row style={{height:'40px'}}>
                <Col span={6}>SKU：{allocationDetail&&allocationDetail.product&&allocationDetail.product.product_sku}</Col>
                <Col span={18}>产品名称：{allocationDetail&&allocationDetail.product&&allocationDetail.product.title}</Col>
              </Row>
              <Row style={{height:'40px'}}>
                <Col span={6}>可售库存：{allocationDetail&&allocationDetail.stock_num}</Col>
                <Col span={6}>在途数量：{allocationDetail&&allocationDetail.transfer_num}</Col>
                <Col span={12}>未出库数量：{allocationDetail&&allocationDetail.un_ship_num}</Col>
              </Row>
              <Row style={{height:'40px'}}>
                <Col span={6}>安全库存：{allocationDetail&&allocationDetail.requisition_safe_quantity}</Col>
                <Col span={6}>日均销量：{allocationDetail&&allocationDetail.days_volumes_average}</Col>
                <Col span={12}>预计可售天数：{allocationDetail&&allocationDetail.sales_days}</Col>
              </Row>
            </Col>
          </Row>
        </div>
        <div style={{paddingTop:'60px'}}>在途(待入库)</div>
        <hr />
        <div style={{paddingTop:'20px'}}>{this.rendInStore()}</div>
        <div style={{paddingTop:'60px'}}>在途(待出库)</div>
        <hr />
        <div style={{paddingTop:'20px'}}>{this.rendOutStore()}</div>
        <div className={styles.divtt}>
          <div className={styles.tip}>调拨单</div>
          <div className={styles.diaobo}>
            <div style={{marginTop:10}}><Icon type="info-circle" theme="outlined" style={{color:'#ff9900',marginRight:10, marginLeft:10}} />
              <span>以下调拨单还生未成出库单，请及时跟进</span>
            </div>
          </div>
        </div>
        <hr />
        <div style={{paddingTop:'20px'}}>{this.rendAlloList()}</div>
        <div style={{paddingTop:'60px'}}>库存情况</div>
        <hr />
        <div style={{paddingTop:'20px'}}>{this.rendStock()}</div>
        <div style={{paddingTop:'60px'}}>
          <Row type="flex" justify="center" align="bottom">
            <Col span={15}>调拨计划</Col>
            <Col span={7}>
              <span>期待补货数量：{allocationDetail.requisition_expect_quantity}</span>
              <span style={{marginLeft:60}}>调拨未发货数量：{this.state.planMount}</span>
              <span style={{marginLeft:60}}>计划调拨数量：{this.state.totalMount}</span>
            </Col>
            <Col span={2}>     
              <DeleteConfirmModal 
                onOk={this.handleDeleteConfirm}
                content='确定清空全部调拨计划?'
              >  
                <Button
                  type='primary'
                  style={{height:36, float:'right'}}
                >
                  删除全部
                </Button>
              </DeleteConfirmModal>          
            </Col>
          </Row>
        </div>
        <hr />
        <div style={{paddingTop:'20px', marginBottom:140}}>
          <div>{this.rendAlloPlan()}</div>
          <div style={{position:'relative'}}>
            <Button  type='primary' onClick={this.addPlan}  style={{position:'absolute', right:10, top:12}}>新增</Button>
          </div>
        </div>
        {
          showOutWare?<OutWareModal visible={showOutWare} onClose={this.handleCloseOut} id={outId} />:null
        }       
        {
          showInWare?<InWareModal visible={showInWare} onClose={this.handleCloseIn} id={inId} />:null
        }
      </div>
    )    
  }
}
export default Detail;