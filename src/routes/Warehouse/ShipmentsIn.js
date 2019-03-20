import React from 'react';
import {
  Tabs,
  Button,
  Table,
  Select,
  Input,
  Form,
  Radio,
  message,
} from 'antd';
import styles from './ARinStore.less';
import { erpPost } from '../../services/ajax';
import ShipmentsInDetail from './ShipmentsInDetail';

const { Option } = Select;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class ShipmentsIn extends React.Component {
  constructor(props) {
    super(props)
    this.newTabIndex = 1;
    this.state = {
      shopList: [], // 按钮组选项-店铺
      shipment_status: [], // 按钮组选项-状态
      selectData: [], // 下拉选项
      storeList: [], // 配送入库列表
      loading: false,
      panes: [{
        title: '配送入库',
        content: '',
        key: '0',
        closable: false,
      }],
      activeKey: '0',
      page: {
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
      },
    }
  }
  
  componentDidMount() {
    const { page } = this.state;
    this.getStoreList({page});
    this.getShopList();
    this.initColumns();
  }
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

  // 删除tab事件
  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  getStoreList = (keyword) => {
    const { page } = this.state;
    erpPost('shipments-inbound/index',{page,...keyword},res => {
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
          <Button
            type='primary'
            size='small'
            style={{ marginLeft: 10 }}
            ghost
            onClick={this.addNewTab.bind(this, record.id)}
          >
            详情
          </Button>
        ),
      },
    ];
    this.setState({ storeColumns, selectData, shipment_status });
  }
  handleTableChange = (page) => {
    this.onSearch(page);
  }
  remove = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => {
      return pane.key !== targetKey;
    });
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  };
  addNewTab = (id) => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '配送入库详情',
      content: (
        <ShipmentsInDetail
          index={activeKey}
          remove={this.remove}
          shipment_id={id}
        />
      ),
      key: activeKey,
    });
    this.setState({ panes, activeKey });
  }
  handleSync = () => {
    this.setState({
      loading: true,
    });
    erpPost('shipments-inbound/sync',{},() => {
      setTimeout(() => {
        message.success('同步成功',2);
        this.setState({
          loading: false,
        });
        this.onSearch();
      },2000);
    },() => {
      message.error('同步失败，请再次尝试',2);
      this.setState({
        loading: false,
      });
    });
  }
  // 初始化首页
  initialIndex = () => {
    const { storeList, selectData, shopList, lastest_sync_at, shipment_status, loading, storeColumns, page } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.shell1}>
        <div className={styles.selectAll}>
          <Form layout='inline'>
            <div className={styles.select}>
              <FormItem label='店铺'>
                {getFieldDecorator('store_id', {initialValue:0})(
                  <RadioGroup>
                    {
                      shopList.map(data => {
                        return (<RadioButton key={data.store_id} value={data.store_id} className={styles.radio} >{data.store_name}</RadioButton>)
                      })
                    }
                  </RadioGroup>
                )}
              </FormItem>
            </div>
            <div className={styles.select}>
              <FormItem label='状态'>
                {getFieldDecorator('shipment_status', {initialValue:'all'})(
                  <RadioGroup>
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
                initialValue: 'amazon_listing_id',
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
              {getFieldDecorator('value')(
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
        <Button type='primary' size='small' loading={loading} onClick={this.handleSync} style={{margin:5}}>
          同步
        </Button>
        <span>
          {
            lastest_sync_at && `最近同步时间：${lastest_sync_at}`
          }
        </span>
        <Table
          columns={storeColumns}
          dataSource={storeList}
          rowKey='id'
          onChange={this.handleTableChange}
          pagination={page}
        />
      </div>
    )
  }
  render() {
    const { panes } = this.state;
    panes[0].content = this.initialIndex();
    return (
      <div className={styles.purchase}>
        <Tabs
          hideAdd
          className="productVariants"
          type="editable-card"
          activeKey={this.state.activeKey}
          onChange={this.onChange}
          onEdit={this.onEdit}
        >
          {this.state.panes.map(pane => (
            <TabPane
              tab={pane.title}
              key={pane.key}
              closable={pane.closable}
            >
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
      </div>
    );
  }
}

export default Form.create()(ShipmentsIn);