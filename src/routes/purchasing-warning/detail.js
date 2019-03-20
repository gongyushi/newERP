import React from 'react';
import moment from 'moment';
import { Button, Table, Row, Col, Icon, Tabs } from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './index.less';
import EditableLine from '../../components/EditableLine';
import OutWareModal from './outWareModal';
import InWareModal from './inWareModal';
import DeleteConfirmModal from '../../components/DeleteConfirm';
import PermissionButton from '../../components/PermissionButton';
import Prompt from '../../components/Prompt';

const { Column, ColumnGroup } = Table;
const { TabPane } = Tabs;
require('../ListStyle.less');

class Detail extends React.Component {
  constructor(props){
    super(props);
    const { activeKey, params } = props;
    this.state= {
      inStoreData: [],
      outStoreData: [],
      purchaseListData: [],
      stockData: [],
      purchasePlanData: [],
      hopeMount: 0,
      planMount: 0,
      totalMount: 0,
      Edit: '',
      options: [],
      cangOptions: [],
      purchaseDetail: [],
      month: parseInt(new Date().getMonth() + 1),
      tmonth: parseInt(new Date().getMonth() + 2),
      htmonth: parseInt(new Date().getMonth() + 3),
      productLink: [],
      inoutData:{},
      showOutWare: false,
      showInWare: false,
      product_id: params.Get('id', null),
      activeKey,
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
      JSON.stringify(nextState.product_id) !== JSON.stringify(this.state.product_id)
    ){
      this.refresh();
    }
  };

  refresh = () => {
    this.handlePurchaseDetail()
    this.handlePurchaseOrder()
    this.handlePurchasePlan()
    this.handleWarehouseList()
    this.handleStoreList()
    this.handleWareLink()
  }

  // 获取详情数据(包含详情数据，库存情况，采购计划的数量统计)
  handlePurchaseDetail = () => {
    const { product_id } = this.state;
    erpPost('/purchasing-warning/detail', {product_id}, res => {
      this.setState({
        purchaseDetail: res.data.data&&res.data.data.product_base,
        stockData: res.data.data&&res.data.data.warehouse_product_info&&res.data.data.warehouse_product_info.list,
        hopeMount: res.data.data&&res.data.data.warehouse_product_info&&res.data.data.warehouse_product_info.expected_replenishment_quantity,
      });
    });
  }

  // 获取采购单列表
  handlePurchaseOrder = () => {
    const { product_id } = this.state;
    const statusStr = '0,1,2';
    erpPost('/purchase/index', {product_id, statusStr}, res => {
      this.setState({
        purchaseListData: res.data.data,
      });
    });
  }

  // 获取采购计划的数据
  handlePurchasePlan = () => {
    const { product_id } = this.state;
    erpPost('/purchase-plan/index', {product_id}, res => {
      this.setState({
        purchasePlanData: res.data.data,
        planMount: res.data.total,
        totalMount: res.data.total_quantity,
      });
    });
  }

  // 编辑调拨计划
  handleEdit = (index) => {
    this.setState({Edit:index})
  }

  handleDelete = (id) => {
    erpPost('/purchase-plan/delete', {id}, () => {
      Prompt.success();
      this.handlePurchasePlan()
    });
  }

  handleSave = (record) => {
    const {warehouse_name,name,cost,quantity,plan_arrive_at,cangOptions,options} = this.state;
    const { product_id } = this.state;
    const obj = {
      product_id,
      supplier_id: name || record.supplier_id,
      warehouse_id: warehouse_name || record.warehouse_id,
      cost: cost || record.cost,
      quantity: quantity || record.quantity,
      plan_arrive_at: moment(plan_arrive_at).format('YYYY-MM-DD') || moment(record.plan_arrive_at).format('YYYY-MM-DD'),
    }
    if(record.id){
      obj.id = record.id;
      erpPost('/purchase-plan/edit', obj, () => {
        this.setState({
          Edit:'',
        });
        Prompt.success();
        this.handlePurchasePlan()
      });
    } else {
      if(!obj.warehouse_id){
        obj.warehouse_id = cangOptions[0]&&cangOptions[0].key;
      }
      if(!obj.supplier_id){
        obj.supplier_id= options[0]&&options[0].key;
      }
      erpPost('/purchase-plan/add', obj, () => {       
        this.handlePurchasePlan()
        Prompt.success();
        this.setState({
          Edit:'',
        });
      });
    }
  }

  handleCancel = (record, index) => {
    const {purchasePlanData}=this.state;
    if(record.id) {
      this.setState({Edit:''})
    } else {
      purchasePlanData.splice(index,1)
      this.setState({ purchasePlanData });
    }
  }

  handleChange = (name, val) => {
    this.setState({
      [name]:val.key || val,
    })
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

  handleDeleteConfirm = () =>{
    const { purchasePlanData } = this.state;
    const idmix = [];
    if(purchasePlanData) {
      purchasePlanData.map(pruchase=>{
        idmix.push(pruchase.id)
      })
    }
    const ids = idmix.join(',')
    erpPost('/purchase-plan/batch-delete', {ids}, () => {
      Prompt.success();
      this.handlePurchasePlan()
    });
  }

  // 获取仓库列表的数据
  handleWarehouseList = () => {
    erpPost('/warehouse/index',{},res => {
      const { data } = res.data;
      const newData = [];
      if(data) {
        data.map(e=>{
          const obj = {
            key:e.warehouse_id,
            value:e.warehouse_name,
          }
          newData.push(obj)
        })
      }
      this.setState({
        cangOptions: newData,
      });
    });
  }

  // 获取供应商列表的数据
  handleStoreList = () => {
    erpPost('/supplier/index',{},res => {
      const { data } = res.data;
      const newData = [];
      if(data) {
        data.map(e=>{
          const obj = {
            key:e.supplier_id,
            value:e.name,
          }
          newData.push(obj)
        })
      }
      this.setState({
        options: newData,
      });
    });
  }

  // 获取产品相关联的仓库
  handleWareLink = () => {
    const {product_id} = this.state;
    const type = 'id';
    const content = product_id;
    erpPost('/warehouse-product/index',{type, content},res => {
      const { data } = res.data;
      this.setState({
        productLink: data,
      });
    });
  }

  rendInStore = () => {
    const {inStoreData}=this.state;
    const columns = [
      {
        title: '入库单号',
        dataIndex: 'receipt_no',
        key: 'receipt_no',
        render: (text, record)=>{
          return <span onClick={()=>this.handleShowIn(record.outbound_id)}>{text}</span>
        },
      },
      {
        title: '入库类型',
        dataIndex: 'sub_type',
        key: 'sub_type',
        render: (text) => {
          return text===20?'调拨入库':text===21?'采购入库':'';
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
      },
      {
        title: '预计断货时间',
        dataIndex: 'out_of_stock',
        key: 'out_of_stock',
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
          dataSource={inStoreData}
          columns={columns}
          pagination={false}
        />
      </div>
    )
  }

  rendOutStore = () => {
    const {outStoreData}=this.state;
    const columns = [
      {
        title: '出库单号',
        dataIndex: 'receipt_no',
        key: 'receipt_no',
        render: (text, record)=>{
          return <span onClick={()=>this.handleShowOut(record.outbound_id)}>{text}</span>
        },
      },
      {
        title: '调出仓库',
        dataIndex: 'warehouse_name',
        key: 'warehouse_name',
      },
      {
        title: '出库类型',
        dataIndex: 'sub_type',
        key: 'sub_type',
        render: (text) => {
          return text===10?'调拨出库':text===11?'订单出库':'';
        },
      },
      {
        title: '计划出库数量(件）',
        dataIndex: 'expect_qualified_count',
        key: 'expect_qualified_count',
        render: (text, record)=>{
          return <span onClick={()=>this.handleShowOut(record.id)}>{text}</span>
        },
      },
      {
        title: '计划到货时间',
        dataIndex: 'plan_arrive_at',
        key: 'plan_arrive_at',
      },
      {
        title: '预计断货时间',
        dataIndex: 'out_of_stock',
        key: 'out_of_stock',
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
          dataSource={outStoreData}
          columns={columns}
          pagination={false}
        />
      </div>
    )
  }

  // 采购单列表
  rendCaigouList = () => {
    const {purchaseListData}=this.state;
    const columns = [
      {
        title: '采购单号',
        dataIndex: 'purchase_no',
        key: 'purchase_no',
        render:(text,record)=>{
          return <a href={`#/purchase/detail?id=${record.id}`}>{text}</a>
        },
      },
      {
        title: '采购仓库',
        dataIndex: 'warehouse_name',
        key: 'warehouse_name',
      },
      {
        title: '供应商',
        dataIndex: 'supplier_name',
        key: 'supplier_name',
      },
      {
        title: '计划采购数量(件)',
        dataIndex: 'plan_quantity',
        key: 'plan_quantity',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          return text===0?'草稿':text===1?'审核中':text===2?'审核通过':'';
        },
      },
    ]
    return (
      <div>
        <Table
          dataSource={purchaseListData}
          columns={columns}
          pagination={false}
        />
      </div>
    )
  }

  rendStock = () => {
    const {stockData}=this.state;
    return (
      <Table dataSource={stockData} pagination={false} >
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
        />
        <Column
          title="未出库数量"
          dataIndex="pending_outbound_quantity"
          key="pending_outbound_quantity"
        />
        <Column
          title="安全库存"
          dataIndex="safe_quantity"
          key="safe_quantity"
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
            dataIndex="purchase_expect_quantity"
            key="purchase_expect_quantity"
          />
          <Column
            title="到货时间"
            dataIndex="purchase_expect_arrival_at"
            key="purchase_expect_arrival_at"
          />
        </ColumnGroup>
        <ColumnGroup title="采购计划">
          <Column
            title="数量"
            dataIndex="purchase_plan_quantity"
            key="purchase_plan_quantity"
          />
        </ColumnGroup>
      </Table>
    )
  }

  // 新增采购计划
  addPlan = () => {
    const {purchasePlanData, cangOptions, options }=this.state;
    const newData = purchasePlanData;
    const obj = {
      warehouse_name: cangOptions[0]&&cangOptions[0].key,
      name: options[0]&&options[0].key,
      cost: 0,
      quantity: 0,
      plan_arrive_at: moment(new Date()).format('YYYY-MM-DD'),
      editable: true,
    }
    newData.push(obj)
    this.setState({
      purchasePlanData: newData,
    })
  }

  rendCaigouPlan = () => {
    const {purchasePlanData, options, cangOptions}=this.state;
    const columns = [
      {
        title: '仓库',
        dataIndex: 'warehouse_name',
        key: 'warehouse_name',
        className: 'width200',
        render: (text, record) => {
          return (
            <EditableLine
              value={record.warehouse_name}
              type="select"
              name='warehouse_name'
              options={cangOptions}
              editable={record.editable}
              onChange={this.handleChange}
              placeholder="请选择仓库"
            />
          )
        },
      },
      {
        title: '供应商',
        dataIndex: 'name',
        key: 'name',
        className: 'width200',
        render: (text, record, index) => {
          return (
            <EditableLine
              value={record.name}
              type="select"
              name='name'
              options={options}
              editable={record.editable || (index===this.state.Edit)}
              onChange={this.handleChange}
              placeholder="请选择供应商"
            />
          )
        },
      },
      {
        title: '单价(USD)',
        dataIndex: 'cost',
        key: 'cost',
        className: 'width200',
        render: (text, record, index) => {
          return (
            <EditableLine
              value={record.cost}
              type="input"
              name='cost'
              editable={record.editable || (index===this.state.Edit)}
              onChange={this.handleChange}
            />
          )
        },
      },
      {
        title: '计划采购数量(件)',
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
        title: '计划到货日期(UTC)',
        dataIndex: 'plan_arrive_at',
        key: 'plan_arrive_at',
        className: 'width200',
        render: (text, record, index) => {
          return (
            <EditableLine
              value={record.plan_arrive_at}
              type="time"
              name='plan_arrive_at'
              editable={record.editable || (index===this.state.Edit)}
              onChange={this.handleChange}
            />
          )
        },
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
                <Button type="primary" ghost style={{width: 60}} className="buttonDel" onClick={()=>this.handleCancel(record,index)}>取消</Button>
              </div>
            )
            :
            (
              <div>
                <Button type="primary" ghost onClick={()=>this.handleEdit(index)} style={{marginRight:10}}>编辑</Button>
                <DeleteConfirmModal
                  onOk={this.handleDelete.bind(this, record.id)}
                  content='确定删除采购计划?'
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
          dataSource={purchasePlanData}
          columns={columns}
          pagination={false}
        />
      </div>
    )
  }

  // 切换面板
  callback = (key) =>{
    const { productLink, product_id } = this.state;
    if(key!=='0'){
      const warehouse_id = productLink[key-1]&&productLink[key-1].warehouse_id;
      erpPost('/purchasing-warning/product/warehouse-receipt/detail', {product_id, warehouse_id}, res => {
        const {data} = res.data;
        this.setState({
          outStoreData : data&&data.for_outbound,
          inStoreData: data&&data.for_inbound,
          inoutData: data&&data.stock_case,
        });
      });
    }
  }

  // 基本信息
  renderBasInfo = () => {
    return (
      <div style={{marginLeft:'-2px'}}>
        <div className={styles.divtt}>
          <div className={styles.tip}>采购单</div>
          <div className={styles.diaobo}>
            <div style={{marginTop:8}}><Icon type="info-circle" theme="outlined" style={{color:'#ff9900',marginRight:10, marginLeft:10}} />
              <span>以下采购单还未下单，请及时跟进</span>
            </div>
          </div>
        </div>
        <hr />
        <div style={{paddingTop:'20px'}}>{this.rendCaigouList()}</div>
        <div style={{paddingTop:'60px'}}>库存情况</div>
        <hr />
        <div style={{paddingTop:'20px'}}>{this.rendStock()}</div>
        <div style={{paddingTop:'60px'}}>
          <Row type="flex" justify="center" align="bottom">
            <Col span={6}>采购计划</Col>
            <Col span={16} style={{textAlign:'right'}}>
              <span>期待补货数量：{this.state.hopeMount}</span>
              <span style={{marginLeft:60}}>计划采购数量：{this.state.totalMount}</span>
              <span style={{marginLeft:60}}>总价：{this.state.planMount}</span>
            </Col>
            <Col span={2}>
              <DeleteConfirmModal
                onOk={this.handleDeleteConfirm}
                content='确定删除全部采购计划?'
                action='purchasing-warning/purchase-plan/delete'
              >
                <Button
                  type='primary'
                  style={{height:30, float:'right'}}
                >
                  删除全部
                </Button>
              </DeleteConfirmModal>
            </Col>
          </Row>
        </div>
        <hr />
        <div style={{paddingTop:'20px', marginBottom:140}}>
          <div>{this.rendCaigouPlan()}</div>
          <div>
            <PermissionButton
              type="primary"
              size='small'
              style={{float:'right',marginTop:10}}
              action="purchasing-warning/purchase-plan/add"
              onClick={this.addPlan}
            >
              新增
            </PermissionButton>
          </div>
        </div>
      </div>
    )
  }

  // 仓库数据
  renderStore = () => {
    const {inoutData} = this.state;
    return (
      <div style={{marginLeft:'-2px'}}>
        <div>库存情况</div>
        <hr />
        <div>
          <Row style={{marginTop:20}}>
            <Col span={8}>
              <span  style={{marginLeft:80}}>可售库存：{inoutData&&inoutData.in_stock_quantity}</span>
            </Col>
            <Col span={8}>
              在途数量：{inoutData&&inoutData.purchase_transfer_quantity}
            </Col>
            <Col span={8}>
              未出库数量：{inoutData&&inoutData.pending_outbound_quantity}
            </Col>
          </Row>
          <Row style={{marginTop:20}}>
            <Col span={8}>
              <span  style={{marginLeft:80}}>安全库存：{inoutData&&inoutData.safe_quantity}</span>
            </Col>
            <Col span={8}>
              日均销量：{inoutData&&inoutData.days_volumes_average}
            </Col>
            <Col span={8}>
              可售天数：{inoutData&&inoutData.sales_days}
            </Col>
          </Row>
        </div>
        <div style={{paddingTop:'60px'}}>在途(待入库)</div>
        <hr />
        <div style={{paddingTop:'20px'}}>{this.rendInStore()}</div>
        <div style={{paddingTop:'60px'}}>在途(待出库)</div>
        <hr />
        <div style={{paddingTop:'20px'}}>{this.rendOutStore()}</div>
      </div>
    )
  }

  render() {
    const { purchaseDetail, month, tmonth, htmonth, productLink, showOutWare, outId, showInWare, inId } = this.state;
    const oneWarn = <span>不建议采购</span>;
    const twoWarn = <span style={{color:'#ffff00'}}>建议采购</span>
    const threeWarn = <span style={{color:'#ffcc00'}}>有断货风险</span>
    const forWarn = <span style={{color:'#ff9900'}}>即将断货</span>
    return(
      <div>
        <div>
          <Row gutter={146}>
            <Col span={3}>
              <img src={purchaseDetail&&purchaseDetail.image_url} alt=" " style={{maxHeight:'110px'}} />
            </Col>
            <Col span={21}>
              <Row style={{height:'40px'}}>
                <Col span={6}><span style={{color:'#50D2F3'}}>产品ID：{purchaseDetail&&purchaseDetail.product_no}</span></Col>
                <Col span={6}>SKU：{purchaseDetail&&purchaseDetail.product_sku}</Col>
                <Col span={12}>建议类型：
                  {
                    purchaseDetail&&purchaseDetail.purchase_warning_level===3?forWarn:
                    purchaseDetail&&purchaseDetail.purchase_warning_level===2?threeWarn:
                    purchaseDetail&&purchaseDetail.purchase_warning_level===1?twoWarn:
                    purchaseDetail&&purchaseDetail.purchase_warning_level===0?oneWarn:''
                  }
                </Col>
              </Row>
              <Row style={{height:'40px'}}>
                <Col span={24}>产品名称：{purchaseDetail&&purchaseDetail.title}</Col>
              </Row>
              <Row style={{height:'40px'}}>
                <Col span={6}>预计{month}月销量：{purchaseDetail&&purchaseDetail.currentMonth}</Col>
                <Col span={6}>预计{tmonth}月销量：{purchaseDetail&&purchaseDetail.lastMonth}</Col>
                <Col span={12}>预计{htmonth}月销量：{purchaseDetail&&purchaseDetail.nextLastMonth}</Col>
              </Row>
            </Col>
          </Row>
        </div>
        <Tabs
          hideAdd
          className="productVariants"
          type="editable-card"
          onChange={this.callback}
          defaultActiveKey="0"
        >
          <TabPane
            tab='基本信息'
            key='0'
            closable={false}
            className="proTabs"
            style={{ marginBottom: '0px' }}
          >
            {this.renderBasInfo()}
          </TabPane>
          {
            productLink.map((link, index)=>{
              return (
                <TabPane
                  tab={link.warehouse&&link.warehouse.warehouse_name}
                  key={index+1}
                  className="proTabs"
                  closable={false}
                  style={{ marginBottom: '0px' }}
                >
                  {this.renderStore(link.warehouse_id)}
                </TabPane>
              )
            })
          }
        </Tabs>
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
