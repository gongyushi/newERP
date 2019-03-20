import React from 'react';
import { Table, Select, Input, Form, Radio, Button } from 'antd';
import { erpPost } from '../../services/ajax';
import ProductCell from '../../components/ProductCell';
import PermissionButton from '../../components/PermissionButton';
import { getPageState, getOrderState } from '../../utils/utils';
import styles from './index.less';

const { Option } = Select;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

require('../ListStyle.less');

@Form.create()
class Index extends React.Component {
  constructor(props) {
    super(props);
    const { activeKey, params } = props;
    this.state = {
      warehouseData:[],
      typeData:[
        {
          id:'product_no', 
          label:'产品ID',
        },
        {
          id:'title', 
          label:'产品名称',
        },
        {
          id: 'product_id', 
          label:'SKU',
        },
      ],
      dataSource:[],
      activeKey,
      month: parseInt(new Date().getMonth() + 1),
      tmonth: parseInt(new Date().getMonth() + 2),
      htmonth: parseInt(new Date().getMonth() + 3),
      warnLevel: [
        {
          id: null,
          label: '全部',
        },
        {
          id: '0',
          label: '不建议采购',
        },
        {
          id: '3',
          label: '即将断货',
        },
        {
          id: '2',
          label: '有断货风险',
        },
        {
          id: '1',
          label: '建议采购',
        },
      ],
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        warning_level: params.Get('warning_level', null),
        key: params.Get('key', 'product_no'),
        value: params.Get('value', ''),
        warehouse_id: params.Get('warehouse_id', null),
      },
    };
  }

  componentDidMount() {
    this.refresh();
    this.handleWarehouse();
  };

  componentWillReceiveProps(nextProps,nextState){
    if(
      JSON.stringify(nextState.search) !== JSON.stringify(this.state.search) ||
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
  
  
  // 获取仓库
  handleWarehouse = () => {
    erpPost('/warehouse/index', {}, res => {
      const { data } = res.data;
      data.unshift({warehouse_id:0,warehouse_name:'全部'});
      this.setState({
        warehouseData:res.data.data,
      })
    })
  }

  // 获取采购预警列表
  refresh = () => {
    const { search, page, orders } = this.state;
    console.log('search',search)
    const params={
      page,
      orders,
      key: search.key,
      value: search.value,
    };
    
    if(search.warning_level&&search.warning_level!==null){
      params.warning_level = search.warning_level;
    }
    if(search.warehouse_id&&search.warehouse_id!==0){
      params.warehouse_id = search.warehouse_id;
    }
    console.log('search33',params)
    erpPost('/purchasing-warning/index', params, res => {
      this.setState({
        dataSource: res.data.data,
        page: res.data.page,
      });
    });
  };

  // 状态下拉触发事件
  handleWarnlevel = (e) => {
    const { search } = this.state;
    const warning_level = e;
    console.log('warning_level',warning_level)
    this.setState({
      search: {...search, warning_level},
    });
  }

  // 仓库过滤
  handleWarehouseFilter = (e) => {
    const { search } = this.state;
    const { value } = e.target;
    const warehouse_id = value;   
    this.setState({
      search: {...search, warehouse_id},
    });
  }

   // 搜索
   handleSearch = (e) => {
    const { search } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('values',values)
      if (!err) {
        this.setState({
          search: {...search, key: values.key, value: values.value},
        });
      }
    });
  };

  // 页码
  handleTableChange = (page, filters, sorte) => {
    const orders = [];
    orders.push({ field: sorte.field, order: sorte.order });
    this.setState({
      orders,
      page,
    });
  };
  
  renderInfo = () => {
    const { dataSource, warehouseData, typeData, page, warnLevel, search }=this.state;
    const { getFieldDecorator } = this.props.form;
    const oneWarn = <span>不建议采购</span>;
    const twoWarn = <span style={{color:'#41CEF1'}}>建议采购</span>
    const threeWarn = <span style={{color:'#E4A84E'}}>有断货风险</span>
    const forWarn = <span style={{color:'#FF3333'}}>即将断货</span>
    const columns = [
      {
        title: '产品信息',
        dataIndex: 'title',
        key:'title',
        width: '600px',
        render: (text, record)=>{
          return (
            <ProductCell
              product_no={record.product_no}
              title={record.title}
              image_url={record.image_url}
              product_sku={record.product_sku}
              category={record.category_name_arr}
            />
          )
        },
      },    
      {
        title: <span>预计{this.state.month}月销量</span>,
        dataIndex: 'currentMonth',
        key:'currentMonth',
        className: 'width200',
      },
      {
        title: <span>预计{this.state.tmonth}月销量</span>,
        dataIndex: 'lastMonth',
        key:'lastMonth',
        className: 'width200',
      },
      {
        title: <span>预计{this.state.htmonth}月销量</span>,
        dataIndex: 'nextLastMonth',
        key:'nextLastMonth',
        className: 'width200',
      },
      {
        title: '建议类型',
        dataIndex: 'purchase_warning_level',
        key:'purchase_warning_level',
        width: 80,
        render: (text) =>{
          return (
            <div>
              {text===3?forWarn:text===2?threeWarn:text===1?twoWarn:text===0?oneWarn:'--'}
            </div>
          )
        },
      },
      {
        title: '计划采购数量',
        dataIndex: 'plan_quantity',
        key:'plan_quantity',
        className: 'width200',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key:'operation',
        width: 80,
        render: (text, record) => {
          return (       
            <PermissionButton 
              size="small" 
              type="primary" 
              className="buttonBul" 
              ghost 
              action='purchasing-warning/detail' 
              href={`#/purchasing-warning/detail?id=${record.id}`}
            >
              详情
            </PermissionButton>
          );
        },
      },
    ]
    return (
      <div className={styles.shell1}>
        <Form layout="inline">
          <div className={styles.selectAll}>
            <FormItem label='仓库：'>
              {getFieldDecorator('warehouse_id', {
                initialValue:Number(search.warehouse_id),
              })(
                <RadioGroup className={styles.radio} onChange={this.handleWarehouseFilter} >
                  {
                    warehouseData.map(select1=>{
                      return (<RadioButton value={select1.warehouse_id}>{select1.warehouse_name}</RadioButton>)
                    })
                  }
                </RadioGroup>
              )}
            </FormItem>
          </div> 
          <div className={styles.selectAll}>
            <FormItem label='建议类型：'>
              {getFieldDecorator('warning_level', {
                initialValue:search.warning_level,
              })(
                <Select style={{width:140}} onChange={this.handleWarnlevel}>
                  {
                    warnLevel.map(warn=>{
                      return (<Option value={warn.id}>{warn.label}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('key',{initialValue:search.key})(
                <Select style={{width:140, marginLeft:20}} placeholder='请选择'>
                  {
                    typeData.map(select2=>{
                      return (<Option value={select2.id}>{select2.label}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('value',{initialValue:search.value})(
                <Input  className={styles.input} placeholder='请输入' />
                )
              }
            </FormItem>           
            <Button type="primary" style={{marginTop:5}} onClick={this.handleSearch} >搜索</Button>
          </div>
        </Form>
        <Table
          columns={columns}
          dataSource={dataSource}
          onChange={this.handleTableChange}
          pagination={page}
          className='table-four-line'
        />
      </div>
    )
  }

  render() {
    return (
      this.renderInfo()
    );
  }
}

export default Index;