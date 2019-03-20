import React from 'react';
import { Button, Row, Col, Modal, Table, message, Input } from 'antd';
import { erpPost } from '../../../services/ajax';
import ProductCell from '../../../components/ProductCell';

require('./common.less');

export default class SelfOutStoreModal extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      columns: [
        {
          title: '产品信息',
          dataIndex: 'id',
          key: 'id',
          width: '560px',
          render: (value, record) => (
            <ProductCell
              product_no={record.product_no}
              image_url={record.image_url}
              title={record.title}
              product_sku={record.product_sku}
            />
          ),
        },
        {
          title: '成本价（CNY）',
          dataIndex: 'cost',
          key: 'cost',
          width: '70px',
        },
        {
          title: '计划出库数量（件）',
          dataIndex: 'expect_qualified_count',
          key: 'expect_qualified_count',
          width: '70px',
        },
        {
          title: '出库数量(件)',
          dataIndex: 'real_qualified_count',
          key: 'real_qualified_count',
          width: '80px',
          render: (value, record, index) => (
            <Input value={value} style={{ width: 70 }} onChange={this.handleCellChange.bind(this, 'real_qualified_count', index)} />
          ),
        },
      ],
      visible: props.visible,
      id: props.id,
      loading1: false,
      loading2: false,
      detail: {},
    }
  };

  componentDidMount(){
    this.getList();
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      visible: nextProps.visible,
      id: nextProps.id,
    });
    this.getList();
  }

  getList = () => {
    const { id } = this.state;
    erpPost('/warehouse-receipt/outbound-detail', { id }, res => {
      this.setState({
        detail: res.data.data,
        list: res.data.data.items,
      });
    });
  }

  handleClose = () => {
    if(this.props.onClose){
      this.props.onClose('selfVisible');
    }
    this.setState({
      loading1: false,
      loading2: false,
    });
    this.props.getStoreList()
  }

  handleCellChange = (key, idx, e) => {
    const { list } = this.state;
    list[idx][key] = e.target.value;
    this.setState({ list });
  }

  handleListData = ({ id, product_id, expect_qualified_count, real_qualified_count, ...data }) => {
    return ({ id, product_id, expect_qualified_count, real_qualified_count });
  }

  // 保存草稿
  handleSaveDraft = () => {
    this.setState({
      loading1: true,
    });
    const { list, id } = this.state;
    const data = {
      id,
      items: list.map(val => this.handleListData({ ...val })),
    };
    erpPost('/warehouse-receipt/update-outbound', data, () => {
      message.success('保存成功', 2);
      this.handleClose();
    }, () => {
      message.error('保存失败', 2);
      this.setState({
        loading1: false,
      });
    });
  }

  // 保存草稿并出库
  handleSubmit = () => {
    this.setState({
      loading2: true,
    });
    const { list, id } = this.state;
    const data = {
      id,
      items: list.map(val => this.handleListData({ ...val })),
    };
    erpPost('/warehouse-receipt/outbound',data, () => {
      message.success('保存并出库成功', 2);
      this.handleClose();
    }, () => {
      message.error('保存失败', 2);
      this.setState({
        loading2: false,
      });
    });
  }

  render(){
    const { list, columns, visible, loading1, loading2, detail} = this.state;
    return(
      <Modal
        title='出库'
        visible={visible}
        onCancel={this.handleClose}
        maskClosable={false}
        centered
        width='900px'
        footer={[
          <Button 
            type='primary' 
            ghost
            key='back' 
            onClick={this.handleClose}
          >
            返回
          </Button>,
          <Button
            type='primary' 
            key='draft'  
            onClick={this.handleSaveDraft}
            loading={loading1}
          >
            保存草稿
          </Button>,
          <Button 
            type='primary' 
            key='inStore' 
            onClick={this.handleSubmit}
            loading={loading2}
          >
            保存并出库
          </Button>,
        ]}
      >
        <div>
          <Row style={{marginBottom:10}}>
            <Col span='8'>
              <div>
                <span>出库单号：</span>
                <span>{detail.receipt_no}</span>
              </div>
              <div>
                <span>调拨单号：</span>
                <span>{detail.requisition_no}</span>
              </div>
            </Col>
            <Col span='8'>
              <div>
                <span>仓库：</span>
                <span>{detail.warehouse_name}</span>
              </div>
              <div>
                <span>创建时间：</span>
                <span>{detail.created_at}</span>
              </div>
            </Col>
            <Col span='8'>
              <div>
                <span>类型：</span>
                <span>{detail.sub_type&&detail.sub_type===10?'调拨出库':detail.sub_type&&detail.sub_type===11?'订单出库':''}</span>
              </div>              
            </Col>            
          </Row>
          <Table rowKey='id' dataSource={list} columns={columns} pagination={false} />
        </div>
      </Modal>
    );
  }
}