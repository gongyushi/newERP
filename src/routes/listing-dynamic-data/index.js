import React from 'react';
import { Button, Table, Select, Input, Form, Radio } from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './index.less';
import EditableCell from '../../components/EditableCell/editableCell';
// import OnlineDetail from './public/onlineDetail';
import ListingCell from '../../components/ListingCell';
import { getPageState, getOrderState } from '../../utils/utils';
import PermissionButton from '../../components/PermissionButton';

const { Option } = Select;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

require('../ListStyle.less');

@Form.create()
class Index extends React.Component {
  constructor(props){
    super(props)
    const { activeKey, params } = props;
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
      key:{
        content:'',
        type:'',
        store_id:'',
      },
      activeKey,
      storeData: [],
      month: parseInt(new Date().getMonth() + 1),
      tmonth: parseInt(new Date().getMonth() + 2),
      htmonth: parseInt(new Date().getMonth() + 3),
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        store_id: params.Get('store_id', null),
        type: params.Get('type', 'product_id'),
        content: params.Get('content', ''),
      },
    }
  }

  componentDidMount(){
    this.handleGetStore();
    this.refresh(this.state.page,this.state.orders,this.state.key);
  }
  
  componentWillReceiveProps(nextProps,nextState){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1 ||
      JSON.stringify(nextState.orders) !== JSON.stringify(this.state.orders) ||
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    )
    {
      // 切换页签， 重载数据
      this.refresh();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };

  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextState.orders) !== JSON.stringify(this.state.orders) ||
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    ){
      this.refresh();
    }
  };

  // 获取数据
  refresh = (pageNumber, orders, value) => {
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
  handleGetStore = () => {
    erpPost('/store/has-permission-store', {}, res => {
      this.setState({
        storeData:res.data.data,
      })      
    })
  }

  // 搜索触发事件
  handleSearch = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.refresh(this.state.page, this.state.orders,  values);
      }
    });
  }

  // 页码
  handleTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.refresh(pageNumber, order);
  };
  
  handleRadioChange = (e) => {
    const {value} = e.target;
    const store_id = value;
    this.refresh(this.state.page,this.state.orders,{store_id});
  }

  // 编辑月销售量
  handleCellChange = (key, dataIndex) => {
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
  handleSaveCell = (listing_dynamic_sale_id, manual_volumes) => {
    erpPost('/listing-dynamic-sales/update', {listing_dynamic_sale_id, manual_volumes}, () => {   
      this.refresh(this.state.page,this.state.orders);
    })
  }

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
              onChange={this.handleCellChange.bind(this, record.index, 'months_8_actual_volumes')} 
              onSave={this.handleSaveCell} 
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
              onChange={this.handleCellChange.bind(this, record.index, 'months_9_actual_volumes')} 
              onSave={this.handleSaveCell} 
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
              onChange={this.handleCellChange.bind(this, record.index, 'months_10_actual_volumes')}
              onSave={this.handleSaveCell} 
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
                  <RadioGroup onChange={this.handleRadioChange}>
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
            <Button type="primary" className={styles.button} onClick={this.handleSearch} >搜索</Button>
          </Form>
        </div>
        <Table
          onChange={this.handleTableChange}
          pagination={page}
          columns={columns}
          dataSource={dataSource}
          className='table-three-line'
        />
      </div>
    )
  }

  render() {
    return (
      this.renderTable1()
    );
  }
}

export default Index;