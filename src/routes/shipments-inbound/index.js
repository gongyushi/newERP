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
        shipment_status: params.Get('status',undefined),
      },
    }
  }
  
  componentDidMount() {
    const { page } = this.state;
    this.getStoreList({page});
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
        if(values.shipment_status === 'all'){
          values.shipment_status = undefined;
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
    erpPost('shipments-inbound/index',{page,orders,...search,...keyword},res => {
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
    const storeColumns = [
      {
        title: '配送入库编号',
        dataIndex: 'shipment_id',
        key: 'shipment_id',
        className: 'width200',
      },
      {
        title: '名称',
        dataIndex: 'shipment_name',
        key: 'shipment_name',
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
        title: '已发货(件)',
        dataIndex: 'total_quantity_shipped',
        key: 'total_quantity_shipped',
        className: 'width200',
      },
      {
        title: '已收货(件)',
        dataIndex: 'total_quantity_received',
        key: 'total_quantity_received',
        className: 'width200',
      },
      {
        title: '状态',
        dataIndex: 'shipment_status',
        key: 'shipment_status',
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
            action='shipments-inbound/detail'
            href={`#/shipments-inbound/detail?id=${record.id}`}
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
    erpPost('shipments-inbound/sync',{},() => {
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
    const { storeList, selectData, shopList, lastest_sync_at, shipment_status, search, loading, storeColumns, page } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.purchase}>
        <div className={styles.shell1}>
          <div className={styles.selectAll}>
            <Form layout='inline'>
              <div className={styles.select}>
                <FormItem label='店铺'>
                  {getFieldDecorator('store_id', {
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
                  {getFieldDecorator('shipment_status', {
                    initialValue: search.status || 'all',
                  })(
                    <RadioGroup
                      onChange={this.handleSelectChange.bind(this,'shipment_status')}
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
                  initialValue: search.value || '',
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
              action='shipments-inbound/sync'
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
    )
  }
}

export default Form.create()(ShipmentsIn);