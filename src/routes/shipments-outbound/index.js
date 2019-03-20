import React from 'react';
import {
  Button,
  Table,
  Select,
  Input,
  Form,
  Radio,
} from 'antd';
import styles from './common.less';
import { erpPost } from '../../services/ajax';
import { Urls, getPageState, getOrderState } from '../../utils/utils';
import PermissionButton from '../../components/PermissionButton';
import Prompt from '../../components/Prompt';

const { Option } = Select;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class ShipmentsIn extends React.Component {
  constructor(props) {
    super(props);
    const { activeKey, params } = props;
    this.state = {
      shopList: [], // 按钮组选项-店铺
      shipment_status: [], // 按钮组选项-状态
      selectData: [], // 下拉选项
      storeList: [], // 配送入库列表
      loading: false,
      activeKey,
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        store_id: params.Get('store_id',undefined),
        key: params.Get('key', undefined),
        value: params.Get('value', undefined),
        fulfillment_order_status: params.Get('status',undefined),
      },
    }
  }
  
  componentDidMount() {
    this.getStoreList();
    this.getShopList();
    this.initColumns();
  }
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.getStoreList();
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
      this.getStoreList();
    }
  };
  // 搜索触发事件
  onSearch = (page) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        for (const key in values) {
          if (String(values[key]).replace(/(^\s+)|(\s+$)/, '') === '' || key === 'store_id' && values[key] === 0) {
            values[key] = undefined;
            console.log(key, values[key])
          }
        }
        if (values.value === undefined) {
          values.key = undefined;
        }
        if(values.fulfillment_order_status === 'all'){
          values.fulfillment_order_status = undefined;
        }
        if(values.store_id === 0){
          values.store_id = undefined;
        }
        this.getStoreList({page,...values});
      }
    });
  }

  getStoreList = (keyword) => {
    const { page, orders, search } = this.state;
    erpPost('shipments-outbound/index',{page,orders,...search,...keyword},res => {
      this.setState({
        storeList: res.data.data,
        page: res.data.page,
        lastest_sync_at: res.data.lastest_sync_at,
      });
    });
  }
  getShopList = () => {
    erpPost('store/index',{},res => {
      const shopList = res.data.data;
      shopList.unshift({store_name:'全部',store_id:0});
      this.setState({
        shopList,
      });
    });
  }
  initColumns = () => {
    const selectData = [
      {
        name: '商品ID',
        value: 'amazon_listing_id',
      },
      {
        name: '标题',
        value: 'title',
      },
      {
        name: '平台sku',
        value: 'seller_sku',
      },
      {
        name: '识别码',
        value: 'asin',
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
    const storeColumns = [
      {
        title: '配送出库编号',
        dataIndex: 'seller_fulfillment_order_id',
        key: 'seller_fulfillment_order_id',
        className: 'width200',
      },
      {
        title: '店铺',
        dataIndex: 'store_name',
        key: 'store_name',
        className: 'width200',
      },
      {
        title: '目标配送中心',
        dataIndex: 'destination_fulfillment_center_id',
        key: 'destination_fulfillment_center_id',
        className: 'width200',
      },
      {
        title: '显示订单编号',
        dataIndex: 'displayable_order_id',
        key: 'displayable_order_id',
        className: 'width200',
      },
      {
        title: '配送方式',
        dataIndex: 'shipping_speed_category',
        key: 'shipping_speed_category',
        className: 'width200',
      },
      {
        title: '数量（件）',
        dataIndex: 'total_quantity',
        key: 'total_quantity',
        className: 'width200',
      },
      {
        title: '接收订单日期',
        dataIndex: 'received_datetime',
        key: 'received_datetime',
        className: 'width200',
      },
      {
        title: '状态',
        dataIndex: 'fulfillment_order_status',
        key: 'fulfillment_order_status',
        className: 'width200',
        render: value => {
          const status = this.state.shipment_status;
          const tmp = status.filter(data => data.value === value);
          if(tmp[0]){
            return tmp[0].name;
          }else{
            return '';
          }
        },
      },
      {
        title: '更新时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        className: 'width200',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        className: 'width200',
        render: (text, record) => (
          <PermissionButton
            type='primary'
            size='small'
            style={{ marginLeft: 10 }}
            ghost
            action='shipments-outbound/detail'
            href={`#/shipments-outbound/detail?id=${record.id}`}
          >
            详情
          </PermissionButton>
        ),
      },
    ];
    this.setState({ storeColumns, selectData, shipment_status });
  }
  handleTableChange = (page,filter,sorter) => {
    this.setState({
      page,
      orders: {field: sorter.field,order: sorter.order},
    });
  }
  handleSync = () => {
    this.setState({
      loading: true,
    });
    erpPost('shipments-outbound/sync',{},() => {
      setTimeout(() => {
        Prompt.success();
        this.setState({
          loading: false,
        });
        this.onSearch();
      },2000);
    },() => {
      this.setState({
        loading: false,
      });
    });
  }
  handleSelectChange = (key,e) => {
    const { value } = e.target;
    console.log(value)
    this.getStoreList({
      [key]: (value !== 0 && value !== 'all') ? value : undefined,
    });
  }
  render() {
    const { storeList, selectData, shopList, lastest_sync_at, search, shipment_status, loading, storeColumns, page } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.purchase}>
        <div className={styles.shell1}>
          <div className={styles.selectAll}>
            <Form layout='inline'>
              <div className={styles.select}>
                <FormItem label='店铺'>
                  {getFieldDecorator('store_id',{
                    initialValue: search.store_id || '0',
                  })(
                    <RadioGroup
                      onChange={this.handleSelectChange.bind(this,'store_id')}
                    >
                      {
                        shopList.map(data => {
                          return (<RadioButton key={data.store_id} value={String(data.store_id)} className={styles.radio} >{data.store_name}</RadioButton>)
                        })
                      }
                    </RadioGroup>
                  )}
                </FormItem>
              </div>
              <div className={styles.select}>
                <FormItem label='状态'>
                  {getFieldDecorator('fulfillment_order_status',{
                    initialValue: search.status || 'all',
                  })(
                    <RadioGroup
                      onChange={this.handleSelectChange.bind(this,'fulfillment_order_status')}
                    >
                      {
                        shipment_status.map(data => {
                          return (<RadioButton key={data.value} value={data.value} className={styles.radio} >{data.name}</RadioButton>)
                        })
                      }
                    </RadioGroup>
                  )}
                </FormItem>
              </div>
              <FormItem>
                {getFieldDecorator('key', {
                  initialValue: search.key || 'amazon_listing_id',
                })(
                  <Select
                    style={{ width: 150 }}
                  >
                    {
                      selectData.map(val => {
                        return (<Option key={val.value}>{val.name}</Option>)
                      })
                    }
                  </Select>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('value',{
                  initialValue: search.val || '',
                })(
                  <Input style={{ width: 200, marginRight: 16 }} placeholder='请输入' />
                )
                }
              </FormItem>
              <Button
                type="primary"
                style={{ position: 'relative', top: 4 }}
                onClick={this.onSearch}
                size='small'
              >
                搜索
              </Button>
            </Form>
          </div>
          <div style={{display:'flex',justifyContent:'flex-start',alignItems:'center'}}>
            <PermissionButton 
              type='primary' 
              size='small' 
              loading={loading} 
              onClick={this.handleSync} 
              style={{margin:5}}
              action='shipments-outbound/sync'
            >
              同步
            </PermissionButton>
            <span>
              {
                lastest_sync_at && `最近同步时间：${lastest_sync_at}`
              }
            </span>
          </div>
          <Table
            columns={storeColumns}
            dataSource={storeList}
            rowKey='id'
            onChange={this.handleTableChange}
            pagination={page}
          />
        </div>
      </div>
    );
  }
}

export default Form.create()(ShipmentsIn);