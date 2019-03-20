import React from 'react';
import { Tabs,Table, Row, Col, Icon, message } from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './ARoutStoreDetail.less';
import EditableItem from '../../components/EditableItem';
import ProductCell from '../../components/ProductCell';

require('../ListStyle.less');

const { TabPane } = Tabs;

class ARoutStoreDetail extends React.Component {
  constructor(props){
    super(props)
    this.state={
      dataDetail: {},
      dataSource: [],
      opData:[],
      columns: [{
        title:'产品信息',
        dataIndex:'category',
        key:'category',
        width: 400,
        render: (Text,val)=>{
          return (
            <ProductCell
              product_no={val.product_no}
              title={val.title}
              image_url={val.image_url}
              product_sku={val.product_sku}
            />
          )
        },
      },{
        title:'成本价(CNY)',
        dataIndex:'cost',
        key:'cost',
        width: 200,
      },{
        title:'计划出库数量(件)',
        dataIndex:'expect_qualified_count',
        key:'expect_qualified_count',
        width: 200,
      },{
        title:'出库数量(件)',
        dataIndex:'real_qualified_count',
        key:'real_qualified_count',
        width: 200,
      },{
        title:'出库时间',
        dataIndex:'plan_arrive_at',
        key:'plan_arrive_at',
        width: 200,
      }],
      opColumns: [{
        title:'操作类型',
        dataIndex:'type',
        key:'type',
        width: 200,
      },{
        title:'操作人员',
        dataIndex:'real_name',
        key:'real_name',
        width: 200,
      },{
        title:'操作时间(UTC)',
        dataIndex:'created_at',
        key:'created_at',
        width: 200,
      },{
        title:'内容',
        dataIndex:'content',
        key:'content',
        width: 300,
      }],
      oppage: {
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
      },
      id: props.warehouseId,
    }
  }

  componentDidMount(){
    const {oppage} = this.state;
    this.ongertDetail(oppage)
  }
  
  ongertDetail = (oppage) => {
    const {warehouseId} = this.props;
    const opcan = {
      page:oppage,
      id:warehouseId,
    }
    erpPost('/warehouse-receipt/outbound-detail', {id:warehouseId}, res => {
      this.setState({
        dataDetail: res.data.data,
        dataSource: res.data.data.items,
      });
    });
    erpPost('/warehouse-receipt/log-index', opcan, res => {
      this.setState({
        opData: res.data.data,
      });
    });
  }

  // 编辑备注
  onEditMark = (value) => {
    const { id } = this.state;
    const remark = value;
    erpPost('warehouse-receipt/update-remark',{id, remark},() => {
      message.success('修改成功',1);
    });
  }
  
  handleTableChange = (oppage) => {
    this.ongertDetail(oppage);
  }

  render(){
    const {columns,dataSource,opColumns,opData,dataDetail} = this.state;
    console.log('dataDetail',dataDetail)
    return(
      <div className={styles.orderDetail}>
        <div className={styles.order1}>
          <div className={styles.number}><Icon type="check-circle-o" /><span>出库单号: {dataDetail&&dataDetail.receipt_no}</span></div>
          <Row className={styles.row} >
            <Col span={6}><div style={{marginLeft:40}}>仓库：{dataDetail&&dataDetail.warehouse_name}</div></Col>
            <Col span={6}>类型：{dataDetail&&dataDetail.sub_type===10?'调拨出库':dataDetail&&dataDetail.sub_type===11?'订单出库':''}</Col>
            <Col span={6}>出库完成时间：{dataDetail&&dataDetail.happen_at}</Col>
            <Col span={6}><div style={{float:'left'}} >状态</div></Col>
          </Row>
          <Row className={styles.row} >
            <Col span={6}><div style={{marginLeft:40}}>调拨单号：<span style={{color:'#0099FF'}}>{dataDetail&&dataDetail.requisition_no}</span></div></Col>
            <Col span={6}>销售订单号：<span style={{color:'#0099FF'}}>{dataDetail&&dataDetail.purchase_no}</span></Col>
            <Col span={6}>配送出库编号: <span style={{color:'#0099FF'}}>{dataDetail&&dataDetail.shipments_outbound_id}</span></Col>
            <Col span={6}>
              <div style={{float:'left', fontSize:15, color:'black'}} >
                {dataDetail&&dataDetail.status===10?'待出库':dataDetail&&dataDetail.status===11?'已出库':''}
              </div>
            </Col>
          </Row>
          <Row className={styles.row} >
            <Col span={6}><div style={{marginLeft:40}}>计划出库数量：{dataDetail&&dataDetail.expect_count}</div></Col>
            <Col span={6}>出库数量：{dataDetail&&dataDetail.real_count}</Col>
            <Col span={6}>
              <div>
                <div style={{float:'left',marginRight:10}}>备注:</div>
                {
                  dataDetail&&dataDetail.status===10?
                  (
                    <div style={{float:'left'}}>
                      <EditableItem width='200' value={dataDetail&&dataDetail.remark}  onChange={this.onEditMark} />
                    </div>
                  )
                :
                  (
                    <div style={{float:'left'}}>{dataDetail&&dataDetail.remark}</div>
                  )
                }
              </div>
            </Col>
            <Col span={6} />
          </Row>
          <Row className={styles.row} >
            <Col span={6}><div style={{marginLeft:40}}>创建人：{dataDetail&&dataDetail.person_id}</div></Col>
            <Col span={6}>创建时间：{dataDetail&&dataDetail.created_at}</Col>
            <Col span={6}>更新时间: {dataDetail&&dataDetail.updated_at}</Col>
            <Col span={6} />
          </Row>
        </div>
        <Tabs defaultActiveKey="1">
          <TabPane tab="产品列表" key="1">
            <div className={styles.listb}>
              <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                className='table-four-line'
              /> 
            </div>
          </TabPane>
          <TabPane tab="操作日志" key="2">
            <div className={styles.listb}>
              <Table
                onChange={this.handleTableChange}
                columns={opColumns}
                dataSource={opData}
              /> 
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default ARoutStoreDetail;