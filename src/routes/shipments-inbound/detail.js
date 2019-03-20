import React from 'react';
import { Tabs, Table, Icon, message, Card } from 'antd';
import ListingCell from '../../components/ListingCell'
import { erpPost } from '../../services/ajax';
import Prompt from '../../components/Prompt';
import { Urls, getPageState, getOrderState } from '../../utils/utils';

require('./common.less');

const { TabPane } = Tabs;

class ShipmentsInDetail extends React.Component {
  constructor(props) {
    super(props);
    const { activeKey, params } = props;
    console.log('props33',props)
    this.state = {
      proList: [],
      proColumns: [],
      detail: {}, // 详情所有数据字段
      shipment_status: {}, // 状态对照
      activeKey,
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        id: params.Get('id',undefined),
      },
    }
  }

  componentDidMount() {
    this.getList();
    this.getDetail();
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
      this.getDetail();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };
  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextState.search) !== JSON.stringify(this.state.search) ||
      JSON.stringify(nextState.orders) !== JSON.stringify(this.state.orders) ||
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    ){
      this.getList();
      this.getDetail();
    }
  };
  getDetail = () => {
    const { search } = this.state;
    erpPost('shipments-inbound/detail', { ...search }, res => {
      this.setState({
        detail: this.handleData2({...res.data.data}),
      });
    });
  }
  
  getList = () => {
    const { search, page, orders } = this.state;
    let { detail } = this.state;
    erpPost('shipments-inbound/listing/index', { page, orders, ...search }, res => {
      const { receivedCount, sendedCount} = res.data;
      detail = { ...detail, receivedCount, sendedCount};
      this.setState({
        proList: res.data.data,
        page: res.data.page,
        detail,
      });
    });
  }
  handleData = ({category_name_arr,...data}) => {
    const category = category_name_arr ? category_name_arr.map(val => val.name).join('/') : '';
    return ({category,...data});
  }
  handleData2 =({shipment_status,...data}) => {
    shipment_status = shipment_status ? this.state.shipment_status.filter(val => val.value === shipment_status)[0].name : '';
    return({shipment_status,...data});
  }
  initColumns = () => {
    const proColumns = [
      {
        title: '商品信息',
        dataIndex: 'title',
        key: 'title',
        width: 400,
        render: (value,record) => (
          <ListingCell 
            image_url={record.image_url}
            title={record.title}
            seller_sku={record.seller_sku}
            category={record.category_name_arr}
            asin={record.asin}
          />
        ),
      },
      {
        title: '产品ID',
        dataIndex: 'listing_id',
        key: 'listing_id',
        width: 80,
      },
      {
        title: '已发货（件）',
        dataIndex: 'quantity_shipped',
        key: 'quantity_shipped',
        width: 80,
      },
      {
        title: '装箱数量（件）',
        dataIndex: 'quantity_in_case',
        key: 'quantity_in_case',
        width: 80,
      },
      {
        title: '已到货（件）',
        dataIndex: 'quantity_received',
        key: 'quantity_received',
        width: 80,
      },
    ];

    const shipment_status = [
      {
        name: '全部',
        value: 'all',
      },
      {
        name: '处理中',
        value: 'WORKING',
      },
      {
        name: '已取件',
        value: 'SHIPPED',
      },
      {
        name: '配送中',
        value: 'IN_TRANSIT',
      },
      {
        name: '已达运营中心',
        value: 'DELIVERED',
      },
      {
        name: '运营中心已登记',
        value: 'CHECKED_IN',
      },
      {
        name: '部分已达运营中心',
        value: 'RECEIVING',
      },
      {
        name: '已完成',
        value: 'CLOSED',
      },
      {
        name: '已取消',
        value: 'CANCELLED',
      },
      {
        name: '已删除',
        value: 'DELETED',
      },
      {
        name: '货件出错',
        value: 'ERROR',
      },
    ];
    this.setState({ proColumns, shipment_status });
  }
  handleEditChange = (value) => {
    const { search } = this.state;
    const remark = value;
    erpPost('warehouse-receipt/update-remark', { ...search, remark }, () => {
      message.success('修改成功', 1);
      this.getLogList();
    });
  }
  handleTableChange = (page,filter,sorter) => {
    this.setState({
      page,
      orders: {field: sorter.field, order: sorter.order},
    });
  }
  render() {
    const { proColumns, proList, detail, page } = this.state;
    return (
      <div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Icon type='check-circle' style={{ fontSize: 24, color: '#6F9EEF', marginRight: 10 }} />
              <h2 style={{ margin: 0 }}>
                配送入库编号：{detail.shipment_id}
              </h2>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ width: 900, minWidth: 600, display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ marginLeft: 35 }}>
                <p>
                  名称：
                  <span style={{ opacity: 0.9 }}>
                    {detail.shipment_name}
                  </span>
                </p>
                <p>
                  关联入库单号：
                  <span style={{ opacity: 0.9 }}>
                    <a>
                      {detail.receipt_no}
                    </a>
                  </span>
                </p>
                <p>
                  已发货（件）：
                  <span style={{ opacity: 0.9 }}>
                    <a>
                      {detail.sendedCount}
                    </a>
                  </span>
                </p>
                <p>
                  发货地址：
                  <span style={{ opacity: 0.9 }}>
                    {detail.shipments_address_name}
                  </span>
                </p>
              </div>
              <div style={{ marginLeft: 100 }}>
                <p>
                  店铺：
                  <span style={{ opacity: 0.9 }}>
                    {detail.store_name}
                  </span>
                </p>
                <p>
                  包组类型：
                  <span style={{ opacity: 0.9 }}>
                    {
                      detail.are_cases_required && detail.are_cases_required === 'true' ?
                        (
                          '并箱装运'
                        ) : (
                          '混装商品'
                        )
                    }
                  </span>
                </p>
                <p>
                  已到货(件)：
                  <span style={{ opacity: 0.9 }}>
                    {detail.receivedCount}
                  </span>
                </p>
              </div>
              <div style={{ marginLeft: 100 }}>
                <p>
                  目标配送中心ID：
                  <span style={{ opacity: 0.9 }}>
                    {detail.destination_fulfillment_center_id}
                  </span>
                </p>
                <p>
                  标签类型：
                  <span style={{ opacity: 0.9 }}>
                    {detail.label_prep_type}
                  </span>
                </p>
                <p>
                  创建时间：
                  <span style={{ opacity: 0.9 }}>
                    {detail.created_at}
                  </span>
                </p>
                <p>
                  更新时间：
                  <span style={{ opacity: 0.9 }}>
                    {detail.updated_at}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <p style={{ textAlign: 'right' }}>状态</p>
              <h2 style={{ margin: 0 }}>
                {detail.shipment_status}
              </h2>
            </div>
          </div>
        </div>
        <Tabs defaultActiveKey="1">
          <TabPane tab="详情" key="1">
            <div className='cardHeadStyle'>
              <Card bordered={false}>
                <Table
                  columns={proColumns}
                  dataSource={proList}
                  rowKey='id'
                  pagination={page}
                  onChange={this.handleTableChange}
                />
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default ShipmentsInDetail;