import React from 'react';
import { Tabs, Button, Table, Select, Input, Form, Radio, Popover, message, Row, Col } from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './saleExpect.less';
import EditableCell from '../../components/EditableCell/editableCell';
import OnlineDetail from './public/onlineDetail';
import ListingCell from '../../components/ListingCell';

const { Option } = Select;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

require('../ListStyle.less');

@Form.create()
class SaleExpect extends React.Component {
  constructor(props){
    super(props)
    this.newTabIndex = 1;
    this.state={
      select2Data:[
        {
          label:'product_id',
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
      panes:[{
        title:'销售预期',
        content:'',
        key: '0',
        closable: false,
      }],
      key:{
        content:'',
        type:'',
        store_id:'',
      },
      activeKey: '0',
      storeData: [],
      month: parseInt(new Date().getMonth() + 1),
      tmonth: parseInt(new Date().getMonth() + 2),
      htmonth: parseInt(new Date().getMonth() + 3),
      page: {
        pageSize: 10, 
        total: 0, 
        current: 1,
        showSizeChanger: true,
      },
      orders: [],
    }
  }

  componentDidMount(){
    this.onGetStore();
    this.onSaleList(this.state.page,this.state.orders,this.state.key);
  }
  
  // 获取数据
  onSaleList = (pageNumber, orders, value) => {
    const can={
      page: pageNumber,
      order: orders,
      content:value&&value.content,
      type:value&&value.type,
      store_id:value&&value.store_id,
    }
    erpPost('/listing-dynamic-data/index', can, res => {
      const mixData = res.data.data || [];
      const datas = [];
      const firstMonth = new Date().getMonth() + 1;
      const secondMonth = new Date().getMonth() + 2;
      const threeMonth = new Date().getMonth() + 3;      
      mixData.map(data=>{
        const dynamicSales = data.dynamic_sales || [];
        let first_actual_volumes = {};
        let second_actual_volumes = {};
        let three_actual_volumes = {};
        dynamicSales.map(sale=>{
          if(sale.dt_id){
            const fitTime = sale.dt_id.split('-')[1];
            switch(parseInt(fitTime)) {
              case firstMonth : 
                first_actual_volumes = sale;
                break;
              case secondMonth:
                second_actual_volumes = sale;
                break;
              case threeMonth:
                three_actual_volumes = sale;
                break;
              default: break;
            }
          }
          return sale;
        })
        const dynamicData = data.dynamic_data&&data.dynamic_data[0] || null;
        datas.push({
          id: data.id,
          image_url: data.image_url,
          seller_sku: data.seller_sku,
          title: data.title,
          days_3_volumes: dynamicData&&dynamicData.days_3_volumes,
          days_7_volumes: dynamicData&&dynamicData.days_7_volumes,
          days_15_volumes: dynamicData&&dynamicData.days_15_volumes,
          days_30_volumes: dynamicData&&dynamicData.days_30_volumes,
          months_8_actual_volumes: first_actual_volumes,
          months_9_actual_volumes: second_actual_volumes,
          months_10_actual_volumes: three_actual_volumes,
          asin: data.asin,
          category:data.category,
        })
        return datas
      })      
      this.setState({
        dataSource:datas,
        page: res.data.page,
      })
    })
  }

  // 获取仓库
  onGetStore = () => {
    erpPost('/store/has-permission-store', {}, res => {
      this.setState({
        storeData:res.data.data,
      })      
    })
  }

  // 搜索触发事件
  onSearch = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.onSaleList(this.state.page, this.state.orders,  values);
      }
    });
  }

  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.onSaleList(pageNumber, order);
  };
  
  onRadioChange = (e) => {
    const {value} = e.target;
    const store_id = value;
    this.onSaleList(this.state.page,this.state.orders,{store_id});
  }

  // 编辑月销售量
  onCellChange = (key, dataIndex) => {
    return value => {
      const dataSource = [...this.state.dataSource];
      const target = dataSource.find(item => item.key === key);
      if (target) {
        target[dataIndex] = value;       
        this.setState({ dataSource });
      }
    };
  };

  // 保存单元格编辑
  onSaveCell = (listing_dynamic_sale_id, manual_volumes) => {
    erpPost('/listing-dynamic-sales/update', {listing_dynamic_sale_id, manual_volumes}, res => {   
      message.success(res.data.msg);       
      this.onSaleList(this.state.page,this.state.orders);
    })
  }
  
  // 删除tab事件
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
    const { dataSource, select2Data, storeData, page } = this.state;
    const { getFieldDecorator } = this.props.form;
    const columns = [
      {
        title: '商品信息',
        dataIndex: 'image_url',
        key: 'image_url',
        width: 300,
        render: (text, record) => {
          console.log(record,'ddsdsf')
          return (
            <ListingCell
              title={record.title}
              image_url={record.image_url}
              seller_sku={record.seller_sku}
              category={record.category}
              asin={record.asin}
              onTurn={() => {
                const { panes } = this.state;
                const activeKey = `newTab${this.newTabIndex++}`;
                panes.push({
                  title: '商品详情',
                  content: (
                    <OnlineDetail
                      id={record.id}
                    />
                  ),
                  key: activeKey,
                });
                this.setState({ panes, activeKey });
              }}
            />            
          )
        },
      },               
      {
        title: '30日均量(件)',
        dataIndex: 'days_30_volumes',
        key:'days_30_volumes',
        width: 70,
      },
      {
        title: '15日均量(件)',
        dataIndex: 'days_15_volumes',
        key:'days_15_volumes',
        width: 70,
      },
      {
        title: '7日均量(件)',
        dataIndex: 'days_7_volumes',
        key:'days_7_volumes',
        width: 70,
      },
      {
        title: '3日均量(件)',
        dataIndex: 'days_3_volumes',
        key:'days_3_volumes',
        width: 70,
      },
      {
        title: <span>{this.state.month}月日销量(件)</span>,
        dataIndex: 'months_8_actual_volumes',
        key:'months_8_actual_volumes',
        width: 110,
        render: (text, record) => {
          return (
            <EditableCell 
              value={text&&text.manual_volumes}  
              nextValue={text&&text.auto_volumes} 
              labelName1='人工预测：' 
              labelName2='智能预测：' 
              listing_dynamic_sale_id={text&&text.id}
              onChange={this.onCellChange.bind(this, record.index, 'months_8_actual_volumes')} 
              onSave={this.onSaveCell} 
            />
          )
        },
      },
      {
        title: <span>{this.state.tmonth}月日销售量预估(件)</span>,
        dataIndex: 'months_9_actual_volumes',
        key:'months_9_actual_volumes',
        width: 110,
        render: (text, record) => {
          return (
            <EditableCell 
              value={text&&text.manual_volumes} 
              nextValue={text&&text.auto_volumes} 
              labelName1='人工预测：' 
              labelName2='智能预测：' 
              listing_dynamic_sale_id={text&&text.id}
              onChange={this.onCellChange.bind(this, record.index, 'months_9_actual_volumes')} 
              onSave={this.onSaveCell} 
            />
          )
        },          
      },
      {
        title: <span>{this.state.htmonth}月日销售量预估(件)</span>,
        dataIndex: 'months_10_actual_volumes',
        key:'months_10_actual_volumes',
        width: 110,
        render: (text, record) => {
          return (
            <EditableCell 
              value={text&&text.manual_volumes}  
              nextValue={text&&text.auto_volumes} 
              labelName1='人工预测：' 
              labelName2='智能预测：'
              listing_dynamic_sale_id={text&&text.id}
              onChange={this.onCellChange.bind(this, record.index, 'months_10_actual_volumes')}
              onSave={this.onSaveCell} 
            />
          )
        },         
      },
    ]

    return (
      <div className={styles.shell1}>
        <div className={styles.selectAll}>    
          <Form layout='inline'>
            <div className={styles.select}>
              <FormItem label='店铺'>
                {getFieldDecorator('store_id')(
                  <RadioGroup onChange={this.onRadioChange}>
                    {
                      storeData&&storeData.map(data=>{
                        return (<RadioButton value={data.id} className={styles.radio}>{data.store_name}</RadioButton>)
                      })
                    }
                  </RadioGroup>
                )}
              </FormItem>
            </div>
            <FormItem>
              {getFieldDecorator('type',{initialValue:select2Data[0].label})(
                <Select
                  className={styles.selecto} 
                  showSearch
                  optionFilterProp='children'
                >
                  {
                    select2Data.map(data=>{
                      return (<Option value={data.label}>{data.name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('content')(
                <Input  className={styles.input} />
                )
              }
            </FormItem>
            <Button type="primary" className={styles.button} onClick={this.onSearch} >搜索</Button>
          </Form>
        </div>
        <Table
          onChange={this.onTableChange}
          pagination={page}
          columns={columns}
          dataSource={dataSource}
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

export default SaleExpect;