import React from 'react';
import { Button, Row, Col, Modal, Table, message, Input } from 'antd';
import ProductCell from '../../../components/ProductCell';
import { erpPost } from '../../../services/ajax';

require('./common.less');

export default class SelfStoreModal extends React.Component {
  state = {
    list: [],
    columns: [],
    visible: this.props.visible,
    id: this.props.id,
    loading1: false,
    loading2: false,
    detail: {},
    type: {}, // 类型对照
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
        width: 400,
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
  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose('selfVisible');
    }
    this.setState({
      loading1: false,
      loading2: false,
    });
  }
  handleCellChange = (key, idx, e) => {
    const { list } = this.state;
    list[idx][key] = e.target.value;
    this.setState({ list });
  }
  handleListData = ({ id, product_id, real_unqualified_count, real_qualified_count, ...data }) => {
    return ({ id, product_id, real_unqualified_count, real_qualified_count });
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
    erpPost('warehouse-receipt/update-inbound', data, () => {
      message.success('保存成功', 2);
      this.handleClose();
    }, () => {
      message.error('保存失败', 2);
      this.setState({
        loading1: false,
      });
    });
  }
  // 保存草稿并入库
  handleSubmit = () => {
    message.success('入库成功', 2);
    this.setState({
      loading2: true,
    });
    const { list, id } = this.state;
    const data = {
      id,
      items: list.map(val => this.handleListData({ ...val })),
    };
    erpPost('warehouse-receipt/inbound',data, () => {
      message.success('保存并入库成功', 2);
      this.handleClose();
    }, () => {
      message.error('保存失败', 2);
      this.setState({
        loading2: false,
      });
    });
  }
  render() {
    const { list, columns, visible, loading1, loading2, detail, type } = this.state;
    return (
      <Modal
        title='入库'
        visible={visible}
        onCancel={this.handleClose}
        maskClosable={false}
        // onOk={this.onOk}
        centered
        width='1000px'
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
                <span>出库单号：</span>
                <span><a>OUT10021</a></span>
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
            </Col>
          </Row>
          <Table rowKey='id' dataSource={list} columns={columns} pagination={false} />
        </div>
      </Modal>
    );
  }
}