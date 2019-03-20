import React from 'react';
import { Button, Row, Col, Modal, Table, message, Input } from 'antd';
import DistributeModal from './DistributeModal';
import ProductCell from '../../../components/ProductCell';
import { erpPost } from '../../../services/ajax';

require('./common.less');

export default class FbaStoreModal extends React.Component {
  state = {
    list: [],
    columns: [],
    visible: this.props.visible,
    id: this.props.id,
    loading: false,
    modalVisible: false, // 配送入库清单模态框
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
    // this.getList();
  }
  getList = () => {
    const { id } = this.state;
    erpPost('warehouse-receipt/inbound-detail', { id }, res => {
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
        width: '560px',
        render: (value,record) => (
          <ProductCell
            product_no={record.product_no}
            image_url={record.image_url}
            title={record.title}
            product_sku={record.product_sku}
            category={record.category_name_arr}
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
        title: '计划良品数量（件）',
        dataIndex: 'expect_qualified_count',
        key: 'expect_qualified_count',
        width: 80,
      },
      {
        title: '允许次品数量（件）',
        dataIndex: 'expect_unqualified_count',
        key: 'expect_unqualified_count',
        width: 80,
      },
      {
        title: '良品数量（件）',
        dataIndex: 'real_qualified_count',
        key: 'real_qualified_count',
        width: 80,
        render: (value, record, index) => (
          <Input value={value} style={{ width: 80 }} onChange={this.handleCellChange.bind(this, 'real_qualified_count', index)} />
        ),
      },
      {
        title: '次品数量（件）',
        dataIndex: 'real_unqualified_count',
        key: 'vreal_unqualified_count',
        width: 80,
        render: (value, record, index) => (
          <Input value={value} style={{ width: 80 }} onChange={this.handleCellChange.bind(this, 'real_unqualified_count', index)} />
        ),
      },
    ];
    const type = {
      10: '调拨出库', 
      11: '订单出库', 
      20: '调拨入库', 
      21: '采购入库',
    };
    this.setState({ columns, type });
  }
  handleCellChange = (key, idx, e) => {
    const { list } = this.state;
    list[idx][key] = e.target.value;
    this.setState({ list });
  }
  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose('fbaVisible');
    }
    this.setState({
      loading: false,
    });
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
      content: '由于入库仓为FBA，请先关联配送入库编号后再进行入库操作！',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        self.handleSubmit();
      },
    });
  }
  render() {
    const { list, columns, visible, loading, modalVisible, id, detail, type } = this.state;
    return (
      <div>
        <Modal
          title='入库'
          visible={visible}
          onCancel={this.handleClose}
          centered
          maskClosable={false}
          width='1050px'
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
              保存并入库
            </Button>,
          ]}
        >
          <div>
            <Row style={{ marginBottom: 10 }}>
              <Col span='6'>
                <div>
                  <span>入库单号：</span>
                  <span>{detail.receipt_no}</span>
                </div>
                <div>
                  <span>配送入库编号</span>
                  <Button type='primary' size='small' onClick={this.handleOpenModal}>
                    关联
                  </Button>
                </div>
              </Col>
              <Col span='6'>
                <div>
                  <span>仓库：</span>
                  <span>{detail.warehouse_name}</span>
                </div>
                <div>
                  <span>采购单号：</span>
                  <span>{detail.purchase_no}</span>
                </div>
              </Col>
              <Col span='6'>
                <div>
                  <span>类型：</span>
                  <span>{type[detail.sub_type]}</span>
                </div>
                <div>
                  <span>创建时间：</span>
                  <span>{detail.created_at}</span>
                </div>
              </Col>
              <Col span='6'>
                <div>
                  <span>调拨单号：</span>
                  <span><a>{detail.requisition_no}</a></span>
                </div>
                <div>
                  <span>出库单号：</span>
                  <span><a>OUT10021</a></span>
                </div>
              </Col>
            </Row>
            <Table rowKey='id' dataSource={list} columns={columns} pagination={false} />
          </div>
        </Modal>
        {/* 配送入库清单模态框 */}
        {
          modalVisible && 
          <DistributeModal visible={modalVisible} id={id} onClose={this.handleModalClose} />
        }
      </div>
    );
  }
}