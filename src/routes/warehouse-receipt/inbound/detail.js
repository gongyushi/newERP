import React from 'react';
import { Tabs,Table, Icon } from 'antd';
import { erpPost } from '../../../services/ajax';
import EditableItem from '../../../components/EditableItem';
import ProductCell from '../../../components/ProductCell';
import { Urls, getPageState, getOrderState } from '../../../utils/utils';
import Prompt from '../../../components/Prompt';

const { TabPane } = Tabs;

class ARinStoreDetail extends React.Component {
  constructor(props){
    super(props);
    const { activeKey, params } = props;
    this.state = {
      proList: [],
      opeList: [],
      opeColumns:[],
      proColumns: [],
      detail: {}, // 详情所有数据字段
      type1: {}, // sub_type类型对照
      type2: {}, // status类型对照
      activeKey,
      page1: getPageState(props),
      orders1: getOrderState(props),
      page2: getPageState(props),
      orders2: getOrderState(props),
      search: {
        id: params.Get('id',undefined),
      },
    }
  }

  componentDidMount(){
    this.getList();
    this.getLogList();
    this.initColumns();
  }
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.getList();
      this.getLogList();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };
  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextState.search) !== JSON.stringify(this.state.search) ||
      JSON.stringify(nextState.orders1) !== JSON.stringify(this.state.orders1) ||
      nextState.page1.current !== this.state.page1.current ||
      nextState.page1.pageSize !== this.state.page1.pageSize ||
      JSON.stringify(nextState.orders2) !== JSON.stringify(this.state.orders2) ||
      nextState.page2.current !== this.state.page2.current ||
      nextState.page2.pageSize !== this.state.page2.pageSize
    ){
      this.getList();
      this.getLogList();
    }
  };
  getList = () => {
    const { page1, orders1, search } = this.state;
    erpPost('warehouse-receipt/inbound/detail',{page:page1,orders: orders1, ...search},res => {
      this.setState({
        detail: res.data.data,
        proList: res.data.data.items,
        page1: res.data.page,
      });
    });
  }
  getLogList = () => {
    const { page2, orders2, search } = this.state;
    erpPost('warehouse-receipt/log/index',{page:page2, orders: orders2, ...search},res => {
      this.setState({
        opeList: res.data.data,
        page2: res.data.page,
      });
    });
  }
  initColumns = () => {
    const proColumns = [
      {
        title: '产品信息',
        dataIndex: 'title',
        key: 'title',
        width: 400,
        render: (value, val) => {
          return (
            <ProductCell
              product_no={val.product_no}
              title={val.title}
              image_url={val.image_url}
              product_sku={val.product_sku}
            />
          )
        },
      },
      {
        title: '成本价（CNY）',
        dataIndex: 'cost',
        key: 'cost',
        width: 200,
      },
      {
        title: '计划良品数量（件）',
        dataIndex: 'expect_qualified_count',
        key: 'expect_qualified_count',
        width: 200,
      },
      {
        title: '计划次品数量（件）',
        dataIndex: 'expect_unqualified_count',
        key: 'expect_unqualified_count',
        width: 200,
      },
      {
        title: '良品数量（件）',
        dataIndex: 'real_qualified_count',
        key: 'real_qualified_count',
        width: 200,
      },
      {
        title: '次品数量（件）',
        dataIndex: 'real_unqualified_count',
        key: 'real_unqualified_count',
        width: 200,
      },
    ];
    const opeColumns = [
      {
        title: '操作类型',
        dataIndex: 'type',
        key: 'type',
        width: 200,
      },
      {
        title: '操作人员',
        dataIndex: 'real_name',
        key: 'real_name',
        width: 200,
      },
      {
        title: '操作时间（UTC）',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 200,
      },
      {
        title: '内容',
        dataIndex: 'content',
        key: 'content',
        width: 300,
      },
    ];
    const type1 = {
      10: '调拨出库', 
      11: '订单出库', 
      20: '调拨入库', 
      21: '采购入库',
    };
    const type2 = {
      10: '待出库',
      11: '已出库',
      20: '待入库',
      21: '已入库',
    };
    this.setState({ proColumns, opeColumns, type1, type2 });
  }
  handleEditChange = (value) => {
    const { search } = this.state;
    const remark = value;
    erpPost('warehouse-receipt/update-remark',{...search, remark},() => {
      Prompt.success();
      this.getLogList();
    });
  }
  handleTableChange = (key,page) => {
    this.setState({
      [key]: page,
    });
    if(key === 'page1'){
      this.getList();
    }else{
      this.getLogList();
    }
  }
  render(){
    const {proColumns,proList,opeColumns,opeList, detail, type1, type2, page1, page2} = this.state;
    return(
      <div>
        <div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div style={{display:'flex',justifyContent:'flex-start',alignItems:'center'}}>
              <Icon type='check-circle' style={{fontSize:24,color:'#6F9EEF',marginRight:10}} />
              <h2 style={{margin:0}}>
                入库单号：{detail.receipt_no}
              </h2>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:10}}>
            <div style={{width:900,minWidth:600,display:'flex',justifyContent:'flex-start'}}>
              <div style={{marginLeft:35}}>
                <p>
                  仓库：
                  <span style={{opacity:0.9}}>
                    {detail.warehouse_name}
                  </span>
                </p>
                <p>
                  调拨单号：
                  <span style={{opacity:0.9}}>
                    <a>
                      {detail.requisition_no}
                    </a>
                  </span>
                </p>
                <p>
                  采购单号：
                  <span style={{opacity:0.9}}>
                    <a>
                      {detail.purchase_no}
                    </a>
                  </span>
                </p>
                <p>
                  创建人：
                  <span style={{opacity:0.9}}>
                    {detail.real_name}
                  </span>
                </p>
                <div style={{display:'flex',justifyContent:'flex-start'}}>
                  <span>备注：</span>
                  <span style={{opacity:0.9}}>
                    <EditableItem width='150' value={detail.remark} onChange={this.handleEditChange} />
                  </span>
                </div>
              </div>
              <div style={{marginLeft:100}}>
                <p>
                  类型：
                  <span style={{opacity:0.9}}>
                    {type1[detail.sub_type]}
                  </span>
                </p>
                <p>
                  出库单号：
                  <span style={{opacity:0.9}}>
                    <a>
                      {detail.outbound_no}
                    </a>
                  </span>
                </p>
                <p>
                  计划入库数量(件)：
                  <span style={{opacity:0.9}}>
                    {detail.expect_count}
                  </span>
                </p>
                <p>
                  创建时间：
                  <span style={{opacity:0.9}}>
                    {detail.created_at}
                  </span>
                </p>
              </div>
              <div style={{marginLeft:100}}>
                <p>
                  入库完成时间：
                  <span style={{opacity:0.9}}>
                    {
                      detail.status === 21 ? detail.updated_at : '---'
                    }
                  </span>
                </p>
                {
                  detail.is_fba && 
                  (
                    <p>
                      配送入库编号：
                      <span style={{opacity:0.9}}>
                        <a>
                          {detail.shipments_inbound_id}
                        </a>
                      </span>
                    </p>
                  )
                }
                {/* <p>
                  计划入库数量(件)：
                  <span style={{opacity:0.9}}>
                    415
                  </span>
                </p> */}
                <p>
                  更新时间：
                  <span style={{opacity:0.9}}>
                    {detail.updated_at}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <p style={{textAlign:'right'}}>状态</p>
              <h2 style={{margin:0}}>
                {type2[detail.status]}
              </h2>
            </div>
          </div>
        </div>
        <Tabs defaultActiveKey="1">
          <TabPane tab="产品列表" key="1">
            <div style={{marginTop:20}}>
              <Table
                columns={proColumns}
                dataSource={proList}
                rowKey='id'
                pagination={page1}
                className='table-four-line'
              /> 
            </div>
          </TabPane>
          <TabPane tab="操作日志" key="2">
            <div style={{marginTop:20}}>
              <Table
                columns={opeColumns}
                dataSource={opeList}
                rowKey='id'
                pagination={page2}
              /> 
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default ARinStoreDetail;