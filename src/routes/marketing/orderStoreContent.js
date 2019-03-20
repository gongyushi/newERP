import React from 'react';
import {
  Button,
  Icon,
  Table,
  Tooltip,
} from 'antd';
import { erpPost } from '../../services/ajax';

require ('./common.less');

export default class OrderStoreContent extends React.Component{
  state = {
    type: this.props.type,
    outColumns: [],
    inColumns: [],
    list: [],
    id: this.props.id,
    detail: {},
    type1:{}, 
    type2: {},
  };
  componentDidMount (){
    this.initColumns();
    this.getList();
  }
  componentWillReceiveProps(next){
    this.setState({
      id: next.id,
      type: next.type,
    });
    this.getList();
  }

  getList = () => {
    const { type, id} = this.state;
    if(type === 'out'){
      erpPost('warehouse-receipt/outbound-detail',{id},res => {
        this.setState({
          detail: res.data.data,
          list: res.data.data.items,
        });
      });
    }else{
      erpPost('warehouse-receipt/inbound-detail',{id},res => {
        this.setState({
          detail: res.data.data,
          list: res.data.data.items,
        });
      });
    }
  }
  initColumns = () => {
    const outColumns = [
      {
        title: '商品信息',
        dataIndex: 'title',
        key: 'title',
        className: 'goods-message',
        render: (value, record) => (
          <div className='purchase'>
            <Tooltip
              placement='top'
              title={(
                <div style={{ width: 300, fontSize: 12 }}>
                  <p>产品ID：{record.product_id}</p>
                  <p>产品SKU：{record.product_sku}</p>
                  <p>产品名称：{record.title}</p>
                  <p>分类：{record.category}</p>
                </div>
              )}
            >
              <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src={record.image_url} alt='' style={{width:30,height:30}} />
                <div>
                  <p><a>{value}</a></p>
                  <p style={{ opacity: 0.6 }}>{record.category}</p>
                </div>
              </div>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '成本价（CNY）',
        dataIndex: 'cost',
        key: 'cost',
      },
      {
        title: '计划出库数量（件）',
        dataIndex: 'expect_qualified_count',
        key: 'expect_qualified_count',
      },
      {
        title: '出库数量（件）',
        dataIndex: 'real_qualified_count',
        key: 'real_qualified_count',
      },
    ];
    const inColumns = [
      {
        title: '商品信息',
        dataIndex: 'title',
        key: 'title',
        className: 'goods-message',
        render: (value, record) => (
          <div className='purchase'>
            <Tooltip
              placement='top'
              title={(
                <div style={{ width: 300, fontSize: 12 }}>
                  <p>产品ID：{record.product_id}</p>
                  <p>产品SKU：{record.product_sku}</p>
                  <p>产品名称：{record.title}</p>
                  <p>分类：{record.category}</p>
                </div>
              )}
            >
              <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src={record.image_url} alt='' style={{width:30,height:30}} />
                <div>
                  <p><a>{value}</a></p>
                  <p style={{ opacity: 0.6 }}>{record.category}</p>
                </div>
              </div>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '成本价（CNY）',
        dataIndex: 'cost',
        key: 'cost',
      },
      {
        title: '计划良品数量（件）',
        dataIndex: 'expect_qualified_count',
        key: 'expect_qualified_count',
      },
      {
        title: '计划次品数量（件）',
        dataIndex: 'expect_unqualified_count',
        key: 'expect_unqualified_count',
      },
      {
        title: '良品数量（件）',
        dataIndex: 'real_qualified_count',
        key: 'real_qualified_count',
      },
      {
        title: '次品数量（件）',
        dataIndex: 'real_unqualified_count',
        key: 'real_unqualified_count',
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
    this.setState({outColumns, inColumns, type1, type2});
  }
  render(){
    const {list, outColumns, inColumns, type, detail, type1, type2} = this.state;
    return(
      <div className='purchase'>
        <div>
          <div style={{display:'flex',justifyContent:'flex-start',alignItems:'center'}}>
            <Icon type='check-circle' style={{fontSize:24,color:'#6F9EEF',marginRight:10}} />
            <h2 style={{margin:0}}>
              {
                type === 'out' ? ('出库单号:') : ('入库单号:')
              }
              {detail.receipt_no}
            </h2>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:10}}>
            <div style={{width:600,display:'flex',justifyContent:'flex-start'}}>
              <div style={{marginLeft:35}}>
                <p>
                  仓库：
                  <span style={{opacity:0.9}}>
                    {detail.warehouse_name}
                  </span>
                </p>
                <p>
                  关联采购单：
                  <a style={{opacity:0.9}}>
                    {detail.purchase_no}
                  </a>
                </p>
                <p>
                  备注：
                  <span>
                    {detail.remark}
                  </span>
                </p>
              </div>
              <div style={{marginLeft:50}}>
                <p>
                  类型：
                  <span style={{opacity:0.9}}>
                    {type1[detail.sub_type]}
                  </span>
                </p>
                {
                  type === 'out' ? 
                  (
                    <p>
                      关联入库单：
                      <a style={{opacity:0.9}}>
                        {detail.inbound_no}
                      </a>
                    </p>
                  ) : (
                    <p>
                      关联出库单：
                      <a style={{opacity:0.9}}>
                        {detail.outbound_no}
                      </a>
                    </p>
                  )
                }
                <p>
                  创建人：
                  <span style={{opacity:0.9}}>
                    {detail.real_name}
                  </span>
                </p>
              </div>
              <div style={{marginLeft:50}}>
                {
                  type === 'out' ? 
                  (
                    <p>
                      出库完成时间：
                      <span style={{opacity:0.9}}>
                        {
                          detail.status === 11 ? detail.updated_at : '---'
                        }
                      </span>
                    </p>
                  ) : (
                    <p>
                      入库完成时间：
                      <span style={{opacity:0.9}}>
                        {
                          detail.status === 21 ? detail.updated_at : '---'
                        }
                      </span>
                    </p>
                  )
                }
                {
                  type === 'out' ?
                  (
                    <p>
                      配送出库编号：
                      <span style={{opacity:0.9}}>
                        {detail.shipments_outbound_id}
                      </span>
                    </p>
                  ) : (
                    detail.is_fba && 
                    (
                      <p>
                         配送入库编号：
                        <span style={{opacity:0.9}}>
                          {detail.shipments_inbound_id}
                        </span>
                      </p>
                    )
                  )
                }
                <p>
                  创建时间：
                  <span style={{opacity:0.9}}>
                    {detail.created_at}
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
          <div className='table'>
            <Table columns={type === 'out' ? outColumns : inColumns} dataSource={list} pagination={false} rowKey='id' />
          </div>
        </div>
      </div>
    );
  }
}