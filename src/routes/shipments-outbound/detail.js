import React from 'react';
import { Tabs, Table, Icon, Card } from 'antd';
import { erpPost } from '../../services/ajax';
import ListingCell from '../../components/ListingCell';
import { Urls, getPageState, getOrderState } from '../../utils/utils';
// import PermissionButton from '../../components/PermissionButton';
import Prompt from '../../components/Prompt';


require('./common.less');

const { TabPane } = Tabs;

class ShipmentsOutDetail extends React.Component {
  constructor(props) {
    super(props);
    const { activeKey, params } = props;
    this.state = {
      proList: [],
      proColumns: [],
      detail: {}, // 详情所有数据字段
      shipment_status: {}, // 状态对照
      currencys: [], // 货币单位
      activeKey,
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        id: params.Get('id',undefined),
      },
    }
  }

  componentDidMount() {
    this.getCurrency();
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
    erpPost('shipments-outbound/detail', { ...search }, res => {
      this.setState({
        detail: this.handleData2({...res.data.data}),
      });
    });
  }
  getCurrency = () => {
    erpPost('index/dictionary/index',{keyword:'currency'},res => {
      this.setState({
        currencys: res.data.data.children,
      });
    });
  }
  getList = () => {
    const { search, page, orders } = this.state;
    erpPost('shipments-outbound/listing/index', { page, orders, ...search }, res => {
      this.setState({
        proList: res.data.data,
        page: res.data.page,
      });
    });
  }
  handleData = ({category_name_arr,...data}) => {
    const category = category_name_arr ? category_name_arr.map(val => val.name).join('/') : '';
    return ({category,...data});
  }
  handleData2 = ({fulfillment_order_status,cod_charge_currency_code,cod_charge_tax_currency_code,shipping_charge_currency_code,shipping_charge_tax_currency_code,...data}) => {
    const { currencys, shipment_status } = this.state;
    cod_charge_currency_code = cod_charge_currency_code ? currencys.filter(val => val.id === cod_charge_currency_code)[0].remark : '';
    cod_charge_tax_currency_code = cod_charge_tax_currency_code ? currencys.filter(val => val.id === cod_charge_currency_code)[0].remark : '';
    shipping_charge_currency_code = shipping_charge_currency_code ? currencys.filter(val => val.id === cod_charge_currency_code)[0].remark : '';
    shipping_charge_tax_currency_code = shipping_charge_tax_currency_code ? currencys.filter(val => val.id === cod_charge_currency_code)[0].remark : '';
    fulfillment_order_status = shipment_status ? shipment_status.filter(val => val.value === fulfillment_order_status)[0].name : '';
    return ({fulfillment_order_status,cod_charge_currency_code,cod_charge_tax_currency_code,shipping_charge_currency_code,shipping_charge_tax_currency_code,...data});
  }
  initColumns = () => {
    const proColumns = [
      {
        title: '编号',
        dataIndex: 'seller_fulfillment_order_item_id',
        key: 'seller_fulfillment_order_item_id',
        width: 100,
      },
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
        width: 100,
      },
      {
        title: '售价（USD）',
        dataIndex: 'per_unit_declared_value',
        key: 'per_unit_declared_value',
        width: 80,
      },
      {
        title: '货到付款金额（USD）',
        dataIndex: 'per_unit_price',
        key: 'per_unit_price',
        width: 80,
      },
      {
        title: '数量（件）',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 80,
      },
      {
        title: '买家取消（件）',
        dataIndex: 'cancelled_quantity',
        key: 'cancelled_quantity',
        width: 80,
      },
      {
        title: '无法配送（件）',
        dataIndex: 'unfulfillable_quantity',
        key: 'unfulfillable_quantity',
        width: 80,
      },
      {
        title: '预计送达日期',
        dataIndex: 'estimated_arrival_datetime',
        key: 'estimated_arrival_datetime',
        width: 80,
      },
    ];
    const shipment_status = [
      {
        name: '全部',
        value: 'all',
      },
      {
        name: '已接收',
        value: 'RECEIVED ',
      },
      {
        name: '无效 ',
        value: 'INVALID',
      },
      {
        name: '计划中',
        value: 'PLANNING',
      },
      {
        name: ' 在途',
        value: 'PROCESSING',
      },
      {
        name: '已完成',
        value: 'COMPLETE',
      },
      {
        name: '部分已配送',
        value: 'COMPLETEPARTIALLED',
      },
      {
        name: '无法配送',
        value: 'UNFULFILLABLE',
      },
      {
        name: '已取消',
        value: 'CANCELLED',
      },
    ];
    this.setState({ proColumns, shipment_status });
  }
  handleEditChange = (value) => {
    const { search } = this.state;
    const remark = value;
    erpPost('warehouse-receipt/update-remark', { ...search, remark }, () => {
      Prompt.success();
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
                配送出库编号：{detail.seller_fulfillment_order_id}
              </h2>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ width: 900, minWidth: 600, display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ marginLeft: 35 }}>
                <p>
                  店铺：
                  <span style={{ opacity: 0.9 }}>
                    {detail.store_name}
                  </span>
                </p>
                <p>
                  显示订单编号：
                  <span style={{ opacity: 0.9 }}>
                    <a>
                      {detail.displayable_order_id}
                    </a>
                  </span>
                </p>
                <p>
                  配送方式：
                  <span style={{ opacity: 0.9 }}>
                    {detail.shipping_speed_category}
                  </span>
                </p>
                <p>
                  货到付款金额：
                  <span style={{ opacity: 0.9 }}>
                    {detail.cod_charge_currency_code} {detail.cod_charge}
                  </span>
                </p>
                <p>
                  货到付款运费税费：
                  <span style={{ opacity: 0.9 }}>
                    {detail.cod_charge_tax_currency_code} {detail.cod_charge_tax}
                  </span>
                </p>
                <p>
                  创建时间：
                  <span style={{ opacity: 0.9 }}>
                    {detail.created_at}
                  </span>
                </p>
              </div>
              <div style={{ marginLeft: 100 }}>
                <p>
                  目标配送中心ID：
                  <span style={{ opacity: 0.9 }}>
                    {}
                  </span>
                </p>
                <p>
                  显示订单日期：
                  <span style={{ opacity: 0.9 }}>
                    {detail.displayable_order_datetime}
                  </span>
                </p>
                <p>
                  配送策略：
                  <span style={{ opacity: 0.9 }}>
                    {detail.fulfillment_policy}
                  </span>
                </p>
                <p>
                  货到付款税费：
                  <span style={{ opacity: 0.9 }}>
                    {detail.shipping_charge_tax_currency_code} {detail.shipping_charge_tax}
                  </span>
                </p>
                <p>
                  收货地址：
                  <span style={{ opacity: 0.9 }}>
                    {detail.shipments_address_name}
                  </span>
                </p>
                <p>
                  更新时间：
                  <span style={{ opacity: 0.9 }}>
                    {detail.updated_at}
                  </span>
                </p>
              </div>
              <div style={{ marginLeft: 100 }}>
                <p>
                  关联出库单号：
                  <span style={{ opacity: 0.9 }}>
                    {detail.receipt_no}
                  </span>
                </p>
                <p>
                  配送日期：
                  <span style={{ opacity: 0.9 }}>
                    {detail.delivery_window_start_datetime} - {detail.delivery_window_end_datetime}
                  </span>
                </p>
                <p>
                  配送中心接收订单日期：
                  <span style={{ opacity: 0.9 }}>
                    {detail.received_datetime}
                  </span>
                </p>
                <p>
                  货到付款运费：
                  <span style={{ opacity: 0.9 }}>
                    {detail.shipping_charge_currency_code} {detail.shipping_charge}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <p style={{ textAlign: 'right' }}>状态</p>
              <h2 style={{ margin: 0 }}>
                {detail.fulfillment_order_status}
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

export default ShipmentsOutDetail;