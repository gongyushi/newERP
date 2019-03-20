import React from 'react';
import { Tabs, Button, Table, Select, Input, Form, Radio, Divider, Row, Col, Popover } from 'antd';
import { erpPost } from '../../services/ajax';
import OrderDetail from './orderListDetail';
import styles from './orderList.less';
import ListingCell from '../../components/ListingCell';

const { Option } = Select;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

require('../ListStyle.less');

@Form.create()
class OrderList extends React.Component {
  constructor(props){
    super(props)
    this.newTabIndex = 1;
    this.state={
      select1Data:[],
      select2Data:[
        {
          label:'id',
          name:'商品ID',
        },
        {
          label:'title',
          name:'商品名称',
        },
        {
          label:'seller_sku',
          name:'平台sku',
        },
        {
          label:'asin',
          name:'识别码',
        },
      ],
      dataSource:[],
      panes: [{
        title:'订单列表',
        content:'',
        key: '0',
        closable: false,
      }],
      activeKey: '0',
      page: {
        pageSize: 10,
        total: 0,
        current: 1,
        showSizeChanger: true,
      },
      StoreId: '',
    }
  }

  componentDidMount(){
    const { page } = this.state;
    this.onGetShop()
    this.onGetOrderList(page)
  }

  // 获取销售订单列表
  onGetOrderList = (page, value) => {
    const can = {
      page,
      type:value&&value.type,
      content:value&&value.content,
      store_id:value&&value.store_id,
    }
    erpPost('/order/index', can, res => {
      const { data } = res.data;
      this.setState({
        dataSource: data,
        page: res.data.page,
      })
    })
  }

  // 获取店铺
  onGetShop = () => {
    erpPost('/store/has-permission-store', {}, res => {
      const { data } = res.data;
      data.unshift({id:0,store_name:'全部'});
      this.setState({
        select1Data:res.data.data,
      })
    })
  }

   // 页码
   onTableChange = (pageNumber) => {
    this.onGetOrderList(pageNumber);
  };

  onSearch = e => {
    e.preventDefault();
    const { page, StoreId} = this.state;
    this.props.form.validateFields((err, values) => {
      const value = {
        type: values&&values.type,
        content: values&&values.content,
      }
      if(StoreId){
        value.store_id = StoreId;
      }
      if (!err) {
        this.onGetOrderList(page, value);
      }
    });
  }

  onRadioChange = (e) => {
    const { value } = e.target;
    const { page } = this.state;
    const store_id = value;
    const values = {};
    if(store_id){
      values.store_id = store_id;
    }
    this.setState({StoreId:store_id})
    this.onGetOrderList(page, values);
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

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

  renderTable1 = () => {
    const { dataSource, select2Data, select1Data, page }=this.state;
    const { getFieldDecorator} = this.props.form;
    const type = {
      0:'Amazon',
    };
    const status = {
      0:'已生成',
      1:'已付款',
      2:'部分发货',
      3:'全部发货',
      4:'订单取消',
      5:'卖家自行发货',
    }

    const columns = [
      {
        title: '订单编号',
        dataIndex: 'order_no',
        key:'order_no',
        width: 100,
      },
      {
        title: '商品信息',
        dataIndex: 'order_item',
        key:'order_item',
        width: 300,
        render: (text) => {
          return (text.map((t,idx)=>{
            return (
              <div>
                <ListingCell
                  title={t.title}
                  image_url={t.image_url}
                  seller_sku={t.seller_sku}
                  category={t.category}
                  asin={t.asin}
                />
                {idx!==text.length-1?<Divider style={{margin:5}} />:null}
              </div>
            )
          }))
        },
      },
      {
        title: '订单金额($)',
        dataIndex: 'total_amount',
        key:'total_amount',
        width: 100,
      },
      {
        title: '店铺',
        dataIndex: 'store',
        key:'store',
        width: 100,
        render: (text) => {
          return text&&text.store_name
        },
      },
      {
        title: '买家姓名',
        dataIndex: 'buyer_name',
        key:'buyer_name',
        width: 100,
      },
      {
        title: '下单时间',
        dataIndex: 'purchase_date',
        key:'purchase_date',
        width: 100,
      },
      {
        title: '订单类型',
        dataIndex: 'order_type',
        key:'order_type',
        width: 100,
      },
      {
        title: '状态',
        dataIndex: 'order_status',
        key:'order_status',
        width: 100,
        render: (text) => {
          return status[text];
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key:'operation',
        width: 100,
        render: (text, record) => {
          return (
            <div>
              <div
                onClick={() => {
                  const { panes } = this.state;
                  const activeKey = `newTab${this.newTabIndex++}`;
                  panes.push({
                    title: '订单详情',
                    content: (
                      <OrderDetail
                        index={activeKey}
                        remove={this.remove}
                        order_id={record.id}
                      />
                    ),
                    key: activeKey,
                  });
                  this.setState({ panes, activeKey });
                }}
              >
                <Button type="primary" ghost >详情</Button>
              </div>
            </div>
          );
        },
      },
    ]
    return (
      <div className={styles.shell1}>
        <div className={styles.selectAll}>
          <Form layout='inline'>
            <div className={styles.select}>
              <FormItem label='店铺'>
                {getFieldDecorator('store_id', {initialValue:0})(
                  <RadioGroup onChange={this.onRadioChange}>
                    {
                      select1Data.map(data => {
                        return (<RadioButton key={data.id} value={data.id} className={styles.radio}>{data.store_name}</RadioButton>)
                      })
                    }
                  </RadioGroup>
                )}
              </FormItem>
            </div>
            <FormItem>
              {getFieldDecorator('select2',{initialValue:'id'})(
                <Select
                  className={styles.selecto} 
                  showSearch
                  optionFilterProp='children'
                >
                  {
                    select2Data.map(select2=>{
                      return (<Option value={select2.label}>{select2.name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('input')(
                <Input  className={styles.input} placeholder='请输入' />
                )
              }
            </FormItem>
            <Button type="primary" className={styles.button} onClick={this.onSearch} >搜索</Button>
          </Form>
        </div>
        <div><Button type="primary" style={{marginBottom:14}}>同步</Button><span style={{marginLeft:20}} >最近同步时间:</span></div>
        <Table
          columns={columns}
          onChange={this.onTableChange}
          dataSource={dataSource}
          pagination={page}
          className='table-three-line'
        />
      </div>
    )
  }

  render() {
    const {panes} = this.state;
    panes[0].content= this.renderTable1();
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

export default OrderList;
