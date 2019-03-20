import React from 'react';
import { Button, Row, Col, Modal, Table, message } from 'antd';
import DistributeOutModal from './DistributeOutModal';
import { erpPost } from '../../../services/ajax';
import ProductCell from '../../../components/ProductCell';

require('./common.less');

export default class FbaOutStoreModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      columns: [
        {
          title: '产品信息',
          dataIndex: 'id',
          key: 'id',
          className: 'goods-message',
          width:600,
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
          width:100,
        },
        {
          title: '计划出库数量（件）',
          dataIndex: 'expect_qualified_count',
          key: 'expect_qualified_count',
          width:100,
        },
        {
          title: '出库数量（件）',
          dataIndex: 'real_qualified_count',
          key: 'real_qualified_count',
          width:100,
        },
      ],
      visible: props.visible,
      id: props.id,
      loading: false,
      modalVisible: false, // 配送入库清单模态框
      detail: {},
    };
  }
  
  componentDidMount() {
    this.getList();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
      id: nextProps.id,
    });
    this.getList();
  }

  // 根据id获取数据
  getList = () => {
    const { id } = this.state;
    erpPost('warehouse-receipt/outbound-detail', { id }, res => {
      this.setState({
        detail: res.data.data,
        list: res.data.data.items,
      });
    });
  }

  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose('fbaVisible');
    }
    this.setState({
      loading: false,
    });
    this.props.getStoreList();
  }

  // 子组件模态框关闭使用
  handleModalClose = (key) => {
    this.setState({
      [key]: false,
    });
  }

  // 打开子组件模态框使用
  handleOpenModal = () => {
    this.setState({
      modalVisible: true,
    });
  }

  handleSubmit = () => {
    message.success('暂时无法操作，等待相关接口', 1);
    this.setState({
      loading: true,
    });
    this.handleClose();
  }

  handleConfirm = () => {
    const self = this;
    Modal.confirm({
      title: '警告',
      content: '由于出库仓为FBA，请先关联配送出库编号后再进行出库操作！',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        self.handleSubmit();
      },
    });
  }

  render() {
    const { list, columns, visible, loading, modalVisible, id, detail } = this.state;
    return (
      <div>
        <Modal
          title='出库'
          visible={visible}
          onCancel={this.handleClose}
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
              key='inStore' 
              onClick={this.handleConfirm}
              loading={loading}
            >
              保存并出库
            </Button>,
          ]}
        >
          <div style={{maxHeight:500, overflowY:'auto'}}>
            <Row style={{ marginBottom: 10 }}>
              <Col span='8'>
                <div>
                  <span>仓库：</span>
                  <span>{detail.warehouse_name}</span>
                </div>
                <div>
                  <span>配送出库编号：</span>
                  <Button type='primary' size='small' onClick={this.handleOpenModal}>
                    关联
                  </Button>
                </div>
              </Col>
              <Col span='8'>
                <div>
                  <span>类型：</span>
                  <span>{detail.sub_type&&detail.sub_type===10?'调拨出库':detail.sub_type&&detail.sub_type===11?'订单出库':''}</span>
                </div>
                <div>
                  <span>调拨单号：</span>
                  <span>{detail.requisition_no}</span>
                </div>
              </Col>
              <Col span='8'>
                <div>
                  <span>销售订单号：</span>
                  <span>{detail.purchase_no}</span>
                </div>
                <div>
                  <span>创建时间：</span>
                  <span>{detail.created_at}</span>
                </div>
              </Col>
            </Row>
            <Table dataSource={list} columns={columns} pagination={false} rowKey='id' />
          </div>
        </Modal>
        <DistributeOutModal visible={modalVisible} id={id} onClose={this.handleModalClose} />
      </div>
    );
  }
}