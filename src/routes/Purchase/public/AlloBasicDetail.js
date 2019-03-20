import React from 'react';
import {
  Card,
  Steps,
  Table,
} from 'antd';
import { erpPost } from '../../../services/ajax';
import ProductCell from '../../../components/ProductCell';

const { Step } = Steps;

export default class AlloBasicDetail extends React.Component {
  state = {
    proColumns: [], // 产品列表
    proList: [],
    id: this.props.requisition_id,
    page: {
      pageSize: 10,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
  };
  componentDidMount() {
    const { page } = this.state;
    this.initColumns();
    this.getList({ page });
  }
  // 获取数据列表
  getList = (page) => {
    const { id } = this.state;
    erpPost('requisition/product-list', { requisition_id: id, ...page }, res => {
      this.setState({
        proList: res.data.data.map(val => this.handleData({ ...val })),
      });
    });
  }
  handleData = ({ product, outbound_quantity, transfer_quantity, ...data }) => {
    const inbound_quantity = outbound_quantity - transfer_quantity;
    return ({ ...product, inbound_quantity, transfer_quantity, ...data });
  }
  // 初始化表头
  initColumns = () => {
    const proColumns = [
      {
        title: '产品信息',
        dataIndex: 'product',
        key: 'product',
        width: 400,
        render: (value, record) => {
          return (
            <ProductCell
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
        title: '成本价',
        dataIndex: 'cost',
        key: 'cost',
        width: 100,
      },
      {
        title: '计划到货日期（UTC）',
        dataIndex: 'plan_arrive_at',
        key: 'plan_arrive_at',
        width: 100,
      },
      {
        title: '计划调拨数量（件）',
        dataIndex: 'plan_quantity',
        key: 'plan_quantity',
        width: 100,
      },
      {
        title: '在途数量（件）',
        dataIndex: 'transfer_quantity',
        key: 'transfer_quantity',
        width: 100,
      },
      {
        title: '已入库数量（件）',
        dataIndex: 'inbound_quantity',
        key: 'inbound_quantity',
        width: 100,
      },
    ];
    this.setState({ proColumns });
  }
  handleTableChange = (page) => {
    this.getList({ page });
  }
  render() {
    const { proColumns, proList, page } = this.state;
    const { schedule } = this.props.detail;
    return (
      <div className='purchase'>
        {/* 处理进度 */}
        <div className='cardHeadStyle'>
          <Card title='处理进度' bordered={false}>
            {
              schedule.discard_time ? (
                <Steps progressDot current={2} className='step'>
                  <Step title='创建' description={schedule.created_at} />
                  <Step title='废弃' description={schedule.discard_time} />
                </Steps>
              ) : (
                <Steps progressDot current={this.props.detail.status} className='step'>
                  <Step title='创建' description={schedule.created_at} />
                  <Step title='部分发货' description={schedule.lasted_ship_time} />
                  <Step title='全部发货' description={schedule.all_ship_time} />
                  <Step title='完成' description={schedule.end_time} />
                </Steps>
              )
            }
          </Card>
        </div>
        {/* 产品列表 */}
        <div className='cardHeadStyle'>
          <Card title='产品列表' bordered={false}>
            <Table columns={proColumns} className='table-four-line' dataSource={proList} pagination={page} rowKey='id' onChange={this.handleTableChange} />
          </Card>
        </div>
      </div>
    );
  }
}