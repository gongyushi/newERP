import React from 'react';
import {
  Icon,
  Table,
} from 'antd';
import { erpPost } from '../../../services/ajax';
import ListingCell from '../../../components/ListingCell';

require ('../common.less');

export default class StoreContent extends React.Component{
  state = {
    outColumns: [],
    inColumns: [],
    list: [],
    detail: {},
    type1:{}, // 出库入库类型
    type2: {}, // 状态对照
  };
  componentDidMount (){
    this.initColumns();
    this.getList();
  }
  getList = () => {
    // 根据type获取出库或者入库列表数据
    const { type, id} = this.props;
    if(type === 'out'){
      erpPost('warehouse-receipt/outbound/detail',{id},res => {
        this.setState({
          detail: res.data.data,
          list: res.data.data.items,
        });
      });
    }else{
      erpPost('warehouse-receipt/inbound/detail',{id},res => {
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
        width: 400,
        render: (value, record) => {
          return (
            <ListingCell
              product_no={record.product_no}
              title={record.title}
              image_url={record.image_url}
              product_sku={record.product_sku}
              category={record.category_list}
            />
          )
        },
      },
      {
        title: '成本价（CNY）',
        dataIndex: 'cost',
        key: 'cost',
        width: 80,
      },
      {
        title: '计划出库数量（件）',
        dataIndex: 'expect_qualified_count',
        key: 'expect_qualified_count',
        width: 80,
      },
      {
        title: '出库数量（件）',
        dataIndex: 'real_qualified_count',
        key: 'real_qualified_count',
        width: 80,
      },
    ];
    const inColumns = [
      {
        title: '商品信息',
        dataIndex: 'title',
        key: 'title',
        width: 400,
        render: (value, record) => {
          return (
            <ListingCell
              product_no={record.product_no}
              title={record.title}
              image_url={record.image_url}
              product_sku={record.product_sku}
              category={record.category_list}
            />
          )
        },
      },
      {
        title: '成本价（CNY）',
        dataIndex: 'cost',
        key: 'cost',
        width: 80,
      },
      {
        title: '计划良品数量（件）',
        dataIndex: 'expect_qualified_count',
        key: 'expect_qualified_count',
        width: 80,
      },
      {
        title: '计划次品数量（件）',
        dataIndex: 'expect_unqualified_count',
        key: 'expect_unqualified_count',
        width: 80,
      },
      {
        title: '良品数量（件）',
        dataIndex: 'real_qualified_count',
        key: 'real_qualified_count',
        width: 80,
      },
      {
        title: '次品数量（件）',
        dataIndex: 'real_unqualified_count',
        key: 'real_unqualified_count',
        width: 80,
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
    const {list, outColumns, inColumns, detail, type1, type2} = this.state;
    const { type } = this.props;
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
            <div style={{width:700,display:'flex',justifyContent:'flex-start'}}>
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