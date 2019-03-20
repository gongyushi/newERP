import React from 'react';
import { Button, Row, Col, Modal, Table, Icon } from 'antd';
import { erpPost } from '../../services/ajax';
import ListingCell from '../../components/ListingCell';

require('./common.less');

export default class OutWareModal extends React.Component {
  state = {
    list: [],
    columns: [],
    visible: this.props.visible,
    id: this.props.id,
    detail: {},
    type: {},
  };
  componentDidMount() {
    this.initColumns();
    this.getList();
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
      id: nextProps.id,
    });
    this.getList();
  }
  getList = () => {
    const { id } = this.state;
    erpPost('warehouse-receipt/outbound-detail', { id }, res => {
      this.setState({
        detail: res.data.data,
        list: res.data.data.items,
      });
    });
  }
  initColumns = () => {
    const columns = [
      {
        title: '产品信息',
        dataIndex: 'title',
        key: 'title',
        width: 400,
        render: (value,record) => (
          <ListingCell 
            image_url={record.image_url}
            title={record.title}
            seller_sku={record.product_sku}
            category={record.category}
          />
        ),
      },
      {
        title: '成本价（CNY）',
        dataIndex: 'cost',
        key: 'cost',
        width: 80,
      },
      {
        title: '出库时间',
        dataIndex: 'plan_arrive_at',
        key: 'plan_arrive_at',
        width: 80,
      },
      {
        title: '计划出库数量(件)',
        dataIndex: 'expect_qualified_count',
        key: 'expect_qualified_count',
        width: 80,
      },
      {
        title: '出库数量(件)',
        dataIndex: 'real_qualified_count',
        key: 'real_qualified_count',
        width: 80,
      },
    ];
    const type = {
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
    this.setState({ columns, type, type2 });
  }

  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render() {
    const { list, columns, visible, detail, type, type2 } = this.state;
    return (
      <div>
        <Modal
          title='出库详情'
          visible={visible}
          onCancel={this.handleClose}
          centered
          maskClosable={false}
          width='900px'
          footer={[
            <Button 
              type='primary' 
              ghost
              key='back' 
              onClick={this.handleClose}
            >
              关闭
            </Button>,
          ]}
        >
          <div>
            <div style={{marginBottom:'10px'}}>
              <span style={{fontSize:'24px', fontWeight:1000, color:'black'}}><Icon type="check-circle-o" /><span style={{marginLeft:'12px'}}>出库单号: </span></span>
              <span style={{marginLeft:'16px'}}>{detail&&detail.outbound_no}</span>
              <span style={{float:'right'}}>状态</span>
            </div>
            <Row style={{ marginBottom: 10 }}>
              <Col span='6'>
                <div style={{marginLeft:'10px'}}>
                  <span>仓库：</span>
                  <span>{detail.warehouse_name}</span>
                </div>
                <div style={{marginLeft:'10px', marginTop:'10px'}}>
                  <span>调拨单号：</span>
                  <span><a>{detail.requisition_no}</a></span>
                </div>
                <div style={{marginLeft:'10px', marginTop:'10px'}}>
                  <span>创建人：</span>
                  <span>{detail.real_name}</span>
                </div>
              </Col>
              <Col span='6'>
                <div>
                  <span>类型：</span>
                  <span>{type[detail.sub_type]}</span>
                </div>
                <div style={{marginTop:'10px'}}>
                  <span>销售订单号：</span>
                  <span><a>{detail.purchase_no}</a></span>
                </div>
                <div style={{marginTop:'10px'}}>
                  <span>创建时间：</span>
                  <span>{detail.created_at}</span>
                </div>
              </Col>
              <Col span='6'>
                <div>
                  <span>出库完成时间：</span>
                  <span>{detail.happen_at}</span>
                </div>
                <div style={{marginTop:'10px'}}>
                  <span>配送出库编号：</span>
                  <span><a>{detail.shipments_outbound_id}</a></span>
                </div>
                <div style={{marginTop:'10px'}}>
                  <span>备注：</span>
                  <span>{detail.remark}</span>
                </div>
              </Col>
              <Col span='6'>
                <span style={{float:'right', fontSize:'20px', color:'black'}}>{detail.status&&type2[detail.status]}</span>
              </Col>
            </Row>
            <Table rowKey='id' dataSource={list} columns={columns} pagination={false} />
          </div>
        </Modal>
      </div>
    );
  }
}