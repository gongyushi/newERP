import React from 'react';
import { connect } from 'dva';
import {
  Table,
  Icon,
  Card,
  Row,
  Col,
  Pagination,
} from 'antd';
// import styles from './home.less';
import SettingGuide from './settingGuide';
import { erpPost } from '../../services/ajax';
import ProductCell from '../../components/ProductCell';
import userImg from '../../assets/user.png';
import welcomeImg from '../../assets/welcome.png';

require('./home.less');
// const { Option } = Select;

class Home extends React.Component {
  state = {
    settingVisible: false, // 设置向导是否显示
    purchaseList: [], // 待审核采购单列表
    allocationList: [], // 待出库调拨单列表
    purWarnList: [], // 采购预警列表
    alloWarnList: [], // 调拨预警列表
    outboundList: [], // 待出库的出库单列表
    inboundList: [], // 待入库的入库单列表
    purchaseColumns: [], // 待审核采购单表头
    allocationColumns: [], // 待出库调拨单表头
    purWarnColumns: [], // 采购预警表头
    alloWarnColumns: [], // 调拨预警表头
    outboundColumns: [], // 待出库的出库单表头
    inboundColumns: [], // 待入库的入库单表头
    isHasValues: false, // 判断是否所有列表有值
    handleValue: {}, // 处理事务数量
    page1: {
      pageSize: 8,
      total: 0,
      current: 1,
    },
    page2: {
      pageSize: 8,
      total: 0,
      current: 1,
    },
    page3: {
      pageSize: 4,
      total: 0,
      current: 1,
    },
    page4: {
      pageSize: 4,
      total: 0,
      current: 1,
    },
    page5: {
      pageSize: 8,
      total: 0,
      current: 1,
    },
    page6: {
      pageSize: 8,
      total: 0,
      current: 1,
    },
    user: JSON.parse(localStorage.getItem('userName')),
    activeKey: this.props.activeKey,
  };
  componentDidMount() {
    const { page1, page2, page3, page4, page5, page6 } = this.state;
    if(!this.judgeInitStep()){
      this.getPurList(page1);
      this.getAlloList(page2);
      this.getPurWarnList(page3);
      this.getAlloWarnList(page4);
      this.getOutboundList(page5);
      this.getInboundList(page6);
      this.getHandleData();
      this.initCloumns();
    }
  }
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      const { page1, page2, page3, page4, page5, page6 } = this.state;
      this.getPurList(page1);
      this.getAlloList(page2);
      this.getPurWarnList(page3);
      this.getAlloWarnList(page4);
      this.getOutboundList(page5);
      this.getInboundList(page6);
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };
  getHandleData = () => {
    erpPost('todolisting/person-todo-count',{},res => {
      this.setState({
        handleValue: res.data.data,
      });
    });
  }
  getPurList = (page) => {
    erpPost('purchase/index',{statusStr:0,page},res => {
      const { isHasValues } = this.state;
      this.setState({
        purchaseList: res.data.data,
        page1: res.data.page,
        isHasValues: isHasValues || res.data.data.length !== 0,
      });
    });
  }
  getAlloList = (page) => {
    erpPost('requisition/index',{status:0,page},res => {
      const { isHasValues } = this.state;
      this.setState({
        allocationList: res.data.data,
        page2: res.data.page,
        isHasValues: isHasValues || res.data.data.length !== 0,
      });
    });
  }
  getPurWarnList = (page) => {
    erpPost('purchasing-warning/index',{page},res => {
      const { isHasValues } = this.state;
      this.setState({
        purWarnList: res.data.data,
        page3: res.data.page,
        isHasValues: isHasValues || res.data.data.length !== 0,
      });
    });
  }
  getAlloWarnList = (page) => {
    erpPost('requisition-warning/index',{page}, res => {
      const { isHasValues } = this.state;
      this.setState({
        alloWarnList: res.data.data,
        page4: res.data.page,
        isHasValues: isHasValues || res.data.data.length !== 0,
      });
    });
  }
  getOutboundList = (page) => {
    erpPost('warehouse-receipt/outbound-index', {status: 10, page}, res => {
      const { isHasValues } = this.state;
      this.setState({
        outboundList: res.data.data,
        page5: res.data.page,
        isHasValues: isHasValues || res.data.data.length !== 0,
      });
    });
  }
  getInboundList = (page) => {
    erpPost('warehouse-receipt/inbound-index', { page, status: 20 }, res => {
      const { isHasValues } = this.state;
      this.setState({
        inboundList: res.data.data,
        page6: res.data.page,
        isHasValues: isHasValues || res.data.data.length !== 0,
      });
    });
  }
  judgeInitStep = () => {
    const { user } = this.state;
    if( user.superadmin === 1 && user.init_step < 4){
      this.setState({
        settingVisible: true,
      });
      return true;
    }else{
      return false;
    }
  }
  // 关闭设置向导
  hideSetting() {
    this.setState({ settingVisible: false });
  }
  initCloumns = () => {
    const purchaseColumns = [
      {
        title: '采购单号',
        dataIndex: 'purchase_no',
        key: 'purchase_no',
        width: 200,
        render: (value,record) => (
          <a href={`#/purchase/detail?id=${record.id}`} >
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
        title: '采购数量（件）',
        dataIndex: 'amount',
        key: 'amount',
        width: 200,
        render: value => value || 0,
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 200,
        render: value => value || '--',
      },
    ];
    const allocationColumns = [
      {
        title: '调拨单号',
        dataIndex: 'requisition_no',
        key: 'requisition_no',
        width: 200,
        render: (value, record) => (
          <a href={`#/requisition/detail?id=${record.id}`} >
            {value}
          </a>
        ),
      },
      {
        title: '调入仓库',
        dataIndex: 'inbound_warehouse',
        key: 'inbound_warehouse',
        width: 200,
        render: value => value.warehouse_name,
      },
      {
        title: '调出仓库',
        width: 200,
        dataIndex: 'outbound_warehouse',
        key: 'outbound_warehouse',
        render: value => value.warehouse_name,
      },
      {
        title: '计划调拨数量（件）',
        dataIndex: 'plan_quantity',
        key: 'plan_quantity',
        width: 200,
        render: value => value || 0,
      },
    ];
    const purWarnColumns = [
      {
        title: '产品信息',
        dataIndex: 'product',
        key: 'product',
        width: 400,
        render: (value,record) => (
          <ProductCell 
            image_url={record.image_url}
            product_no={record.product_no}
            title={record.title}
            product_sku={record.product_sku}
            category={record.category_name_arr}
          />
        ),
      },
      {
        title: '建议类型',
        dataIndex: 'purchase_warning_level',
        key:'purchase_warning_level',
        width: 150,
        render: (text) =>{
          if(!text){
            return '--';
          }
          let value;
          switch(text){
            case 1:
              value = <span>不建议采购</span>;
              break;
            case 2:
              value = <span style={{color:'#41CEF1'}}>建议采购</span>;
              break;
            case 3:
              value = <span style={{color:'#E4A84E'}}>有断货风险</span>;
              break;
            case 4:
              value = <span style={{color:'#FF3333'}}>即将断货</span>;
              break;
            default: ;
          }
          return value;
        },
      },
      {
        title: '计划采购数量',
        dataIndex: 'plan_quantity',
        key:'plan_quantity',
        width: 150,
      },
    ];
    const alloWarnColumns = [
      {
        title: '产品信息',
        dataIndex: 'product',
        key: 'product',
        width: 400,
        render: (value,record) => (
          <ProductCell 
            image_url={record.image_url}
            title={record.title}
            product_no={record.product_no}
            product_sku={record.product_sku}
            category={record.category}
          />
        ),
      },
      {
        title: '补货仓库',
        dataIndex: 'warehouse_name',
        key: 'warehouse_name',
        width: 100,
      },
      {
        title: '预计可售天数',
        dataIndex: 'sales_days',
        key: 'sales_days',
        width: 100,
      },
      {
        title: '建议类型',
        dataIndex: 'requisition_warning_level',
        key: 'requisition_warning_level',
        width: 100,
        render: (text) =>{
          let value;
          if(!text){
            return '--';
          }
          switch(text){
            case 1:
              value = <span>不建议调拨</span>;
              break;
            case 2:
              value = <span style={{color:'#41CEF1'}}>建议调拨</span>;
              break;
            case 3:
              value = <span style={{color:'#E4A84E'}}>有断货风险</span>;
              break;
            case 4:
              value = <span style={{color:'#FF3333'}}>即将断货</span>;
              break;
            default: ;
          }
          return value;
        },
      },  
    ];
    const outboundColumns = [
      {
        title: '出库单号',
        dataIndex: 'receipt_no',
        key:'receipt_no',
        width: 200,
        render: (value, record) => (
          <a 
            // href={`#/warehouse-receipt/outbound/detail?id=${record.id}`} 
          >
            {value}
          </a>
        ),
      },
      {
        title: '仓库',
        dataIndex: 'warehouse_name',
        key:'warehouse_name',
        width: 200,
      },
      {
        title: '计划出库数量(件)',
        dataIndex: 'expect_count',
        key:'expect_count',
        width: 200,
        render: value => value || 0,
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key:'created_at',
        width: 200,
        render: value => value || '--',
      },
    ];
    const inboundColumns = [
      {
        title: '入库单号',
        dataIndex: 'receipt_no',
        key: 'receipt_no',
        width: 200,
        render: (value, record) => (
          <a 
            // href={`#/warehouse-receipt/inbound/detail?id=${record.id}`} 
          >
            {value}
          </a>
        ),
      },
      {
        title: '仓库',
        dataIndex: 'warehouse_name',
        key: 'warehouse_name',
        width: 200,
      },
      {
        title: '计划入库数量(件)',
        dataIndex: 'expect_count',
        key: 'expect_count',
        width: 200,
        render: value => value || 0,
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 200,
        render: value => value || '--',
      },
    ];
    this.setState({purchaseColumns, allocationColumns, purWarnColumns, alloWarnColumns, outboundColumns, inboundColumns});
  }
  handleTableChange = (fun,key,current) => {
    this.state[key].current = current;
    fun(this.state[key]);
  }
  render() {
    const { settingVisible, purchaseList, purchaseColumns, allocationList, allocationColumns, handleValue,
      purWarnColumns, purWarnList, alloWarnList, alloWarnColumns, outboundList, outboundColumns,
      inboundList, inboundColumns, page1 ,page2, page3, page4, page5, page6, isHasValues, user} = this.state;
    return (
      <div >
        {
          settingVisible ? (
            <SettingGuide onClose={this.hideSetting.bind(this)} current={user.init_step} />
          ) : (
            <div>
              <Row style={{display:'flex',alignItems:'center',minWidth:960,marginTop:20,marginBottom:10}}>
                <Col offset='1' span='10' style={{display:'flex',alignItems:'center'}}>
                  {/* <Icon type='user' style={{fontSize:60}} /> */}
                  <img src={userImg} style={{width:60,height:60}} alt='' />
                  <h2 style={{marginLeft:10,marginBottom:0}}>
                    欢迎你，{user.real_name}，祝你开心每一天！
                  </h2>
                </Col>
                <Col offset='1' span='10' style={{display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
                  <div style={{marginRight:20,textAlign:'center'}}>
                    <p style={{opacity:0.6}}>
                      待处理事务
                    </p>
                    <p style={{fontSize:20,fontWeight:'bold',marginBottom:'0em'}}>
                      {handleValue.unprocessed || '0'}
                    </p>
                  </div>
                  <div style={{marginRight:20,textAlign:'center'}}>
                    <p style={{opacity:0.6}}>
                      累计处理事务
                    </p>
                    <p style={{fontSize:20,fontWeight:'bold',marginBottom:'0em'}}>
                      {handleValue.processed || '0'}
                    </p>
                  </div>
                </Col>
              </Row>
              <div className='home'>
                {
                  isHasValues ? (
                    <Row style={{minWidth:960}}>
                      {
                        purchaseList.length !== 0 && (
                        <Col offset='1' span='10' style={{marginBottom:10,marginTop:10}}>
                          <div className='cardHeadStyle'>
                            <Card
                              title={(
                                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                                  <span>待审核的采购单</span>
                                  <a 
                                    href={`#/purchase/index?status=${0}`}
                                    className='more'
                                  >
                                    更多&gt;&gt;
                                  </a>
                                </div>
                              )}
                              bordered={false}
                              className='card-height'
                            >
                              <div className='overflow-table'>
                                <Table 
                                  dataSource={purchaseList} 
                                  columns={purchaseColumns} 
                                  pagination={false} 
                                  rowKey='id'
                                  className='table-one-line'
                                />
                                <Pagination className='page' {...page1} onChange={this.handleTableChange.bind(this,this.getPurList,'page1')} />
                              </div>
                            </Card>
                          </div>
                        </Col>
                        )
                      }
                      {
                        allocationList.length !== 0 && (
                        <Col offset='1' span='10' style={{marginBottom:10,marginTop:10}}>
                          <div className='cardHeadStyle'>
                            <Card
                              title={(
                                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                                  <span>待出库的调拨单</span>
                                  <a 
                                    href={`#/requisition/index?status=${0}`}
                                    className='more'
                                  >
                                    更多&gt;&gt;
                                  </a>
                                </div>
                              )}
                              bordered={false}
                              className='card-height'
                            >
                              <div className='overflow-table'>
                                <Table 
                                  dataSource={allocationList} 
                                  columns={allocationColumns} 
                                  pagination={false} 
                                  rowKey='id'
                                  className='table-one-line'
                                />
                                <Pagination className='page' {...page2} onChange={this.handleTableChange.bind(this,this.getAlloList,'page2')} />
                              </div>
                            </Card>
                          </div>
                        </Col>
                        )
                      }
                      {
                        purWarnList.length !== 0 && (
                        <Col offset='1' span='10' style={{marginBottom:10,marginTop:10}}>
                          <div className='cardHeadStyle'>
                            <Card
                              title={(
                                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                                  <span>采购预警</span>
                                  <a 
                                    href='#/purchasing-warning/index'
                                    className='more'
                                  >
                                    更多&gt;&gt;
                                  </a>
                                </div>
                              )}
                              bordered={false}
                              className='card-height'
                            >
                              <div className='overflow-table'>
                                <Table 
                                  dataSource={purWarnList} 
                                  columns={purWarnColumns} 
                                  pagination={false} 
                                  rowKey='id'
                                  className='table-three-line'
                                />
                                <Pagination className='page' {...page3} onChange={this.handleTableChange.bind(this,this.getPurWarnList,'page3')} />
                              </div>
                            </Card>
                          </div>
                        </Col>
                        )
                      }
                      {
                        alloWarnList.length !== 0 && (
                        <Col offset='1' span='10' style={{marginBottom:10,marginTop:10}}>
                          <div className='cardHeadStyle'>
                            <Card
                              title={(
                                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                                  <span>调拨预警</span>
                                  <a 
                                    href='#/requisition-warning/index'
                                    className='more'
                                  >
                                    更多&gt;&gt;
                                  </a>
                                </div>
                              )}
                              bordered={false}
                              className='card-height'
                            >
                              <div className='overflow-table'>
                                <Table 
                                  dataSource={alloWarnList} 
                                  columns={alloWarnColumns} 
                                  pagination={false} 
                                  rowKey='id'
                                  className='table-three-line'
                                />
                                <Pagination className='page' {...page4} onChange={this.handleTableChange.bind(this,this.getAlloWarnList,'page4')} />
                              </div>
                            </Card>
                          </div>
                        </Col>
                        )
                      }
                      {
                        outboundList.length !== 0 && (
                        <Col offset='1' span='10' style={{marginBottom:10,marginTop:10}}>
                          <div className='cardHeadStyle'>
                            <Card
                              title={(
                                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                                  <span>待出库的出库单</span>
                                  <a 
                                    href='#/warehouse-receipt/outbound/index'
                                    className='more'
                                  >
                                    更多&gt;&gt;
                                  </a>
                                </div>
                              )}
                              bordered={false}
                              className='card-height'
                            >
                              <div className='overflow-table'>
                                <Table 
                                  dataSource={outboundList} 
                                  columns={outboundColumns} 
                                  pagination={false}
                                  rowKey='id'
                                  className='table-one-line'
                                />
                                <Pagination className='page' {...page5} onChange={this.handleTableChange.bind(this,this.getOutboundList,'page5')} />
                              </div>
                            </Card>
                          </div>
                        </Col>
                        )
                      }
                      {
                        inboundList.length !== 0 && (
                        <Col offset='1' span='10' style={{marginBottom:10,marginTop:10}}>
                          <div className='cardHeadStyle'>
                            <Card
                              title={(
                                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                                  <span>待入库的入库单</span>
                                  <a 
                                    href='#?warehouse-receipt/inbound/index'
                                    className='more'
                                  >
                                    更多&gt;&gt;
                                  </a>
                                </div>
                              )}
                              bordered={false}
                              className='card-height'
                            >
                              <div className='overflow-table'>
                                <Table 
                                  dataSource={inboundList} 
                                  columns={inboundColumns} 
                                  pagination={false} 
                                  rowKey='id'
                                  className='table-one-line'
                                />
                                <Pagination className='page' {...page6} onChange={this.handleTableChange.bind(this,this.getInboundList,'page6')} />
                              </div>
                            </Card>
                          </div>
                        </Col>
                        )
                      }
                    </Row>
                  ) : (
                    <Row>
                      <Col offset='1' span='21'>
                        <div className='welcome'>
                          {/* <div>
                            <h1>欢迎使用</h1>
                            <h1>DATA FORCE跨境电商ERP</h1>
                          </div> */}
                          <div>
                            <img src={welcomeImg} alt="" />
                            <h3 style={{fontSize:'1.5em'}}>请联系管理员开通权限...</h3>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  )
                }
              </div>
            </div>
          )
        }
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    // homeTodoData: state.erpHome.homeTodoData,
    IndexLoading: state.loading.effects['erpHome/fetchHomeTodoList'],
  };
};
export default connect(mapStateToProps)(Home);