import React from 'react';
import { Button, Table, Select, Input, Form, Radio, Popconfirm } from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './index.less';
import ProductCell from '../../components/ProductCell';
import { getPageState, getOrderState } from '../../utils/utils';
import PermissionButton from '../../components/PermissionButton';

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
      warehouse:[],
      dataSource: [],
      WarehouseId: null,
      WarnLevel: null,
      saleValue: null,
      saleLabel: null,
      SelectDate: [
        {
          value:null,
          label:'全部',
        },
        {
          value:7,
          label: '7天内',
        },
        {
          value:30,
          label: '30天内',
        },
      ],
      warnLevel: [
        {
          id: null,
          label: '全部',
        },
        {
          id: 0,
          label: '不建议调拨',
        },
        {
          id: 3,
          label: '即将断货',
        },
        {
          id: 2,
          label: '有断货风险',
        },
        {
          id: 1,
          label: '建议调拨',
        },
      ],    
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        warning_level: params.Get('warning_level', null),
        type: params.Get('type', 'product_no'),
        content: params.Get('content', ''),
        warehouse_id: params.Get('warehouse_id', null),
      },
      activeKey,
    }
  }
  
  componentDidMount() {
    this.refresh();
    this.handleWarehouseList();
  };

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

  // 搜索
  handleSearch = (e) => {
    const { search } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          search: {...search, type: values.type, content: values.content},
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
  
   // 仓库过滤
  handleWarehouseFilter = (e) => {
    const { value } = e.target;
    const warehouse_id = value;   
    this.refresh({warehouse_id});
    this.setState({WarehouseId:warehouse_id})
  }

   // 状态下拉触发事件
  handleWarnlevel = (e) => {
    const warning_level = e;
    this.refresh({warning_level});
    this.setState({WarnLevel:warning_level})
  }
  
  // 可预售天数过滤
  handleSaleDay = (sales_days) => {
    const {page, WarehouseId, WarnLevel} = this.state;
    const can = {
      page,
    };
    if(WarehouseId&&WarehouseId!==null) {
      can.warehouse_id = WarehouseId;
    }
    if(WarnLevel&&WarnLevel!==null) {
      can.requisition_warning_level = WarnLevel;
    }
    if(sales_days&&sales_days!==null) {
      can.sales_days = sales_days;
    }
    erpPost('/requisition-warning/index', can, res => {
      this.setState({
        dataSource: res.data.data,
        page: res.data.page,    
      });
    });
  }
  
  // 自定义预计可售天数
  handleConfirm = () => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const saleDay = getFieldValue('sales_day');
    this.setState({
      saleValue: saleDay,
      saleLabel: `${saleDay} 天内`,
    });
    setFieldsValue({sales_days:saleDay})
    this.handleSaleDay(saleDay)
  }

  // 获取仓库列表的数据
  handleWarehouseList = () => {
    erpPost('/warehouse/index', {}, res => {
      const { data } = res.data;
      const newData = [
        {
          key: null,
          value: '全部',
        },
      ];
      if(data) {
        data.map(e=>{
          const obj = { 
            key: e.warehouse_id,
            value: e.warehouse_name,
          }
          newData.push(obj)
        })
      }
      this.setState({
        warehouse: newData,
      });
    });
  }
  
  // 获取采购预警列表
  refresh = (value) => {
    const { search, page, orders } = this.state;
    console.log('value',value)
    const params={
      page,
      orders,
      type: search.type,
      content: search.content,
    };
    
    if(value&&value.warning_level&&value.warning_level!==null){
      params.warning_level = value.warning_level;
    }
    if(value&&value.warehouse_id&&value.warehouse_id!==0){
      console.log('value333',value.warehouse_id)
      params.warehouse_id = value.warehouse_id;
    }
    console.log('params',params)
    erpPost('/requisition-warning/index', params, res => {
      this.setState({
        dataSource: res.data.data,
        page: res.data.page,
      });
    });
  };

  // 有数据时的渲染页面
  renderInfo = () => {
    const { dataSource, warehouse, page, typeData, warnLevel, SelectDate, saleLabel, saleValue } = this.state;
    const { getFieldDecorator } = this.props.form;
    const oneWarn = <span>不建议调拨</span>;
    const twoWarn = <span style={{color:'#41CEF1'}}>建议调拨</span>
    const threeWarn = <span style={{color:'#E4A84E'}}>有断货风险</span>
    const forWarn = <span style={{color:'#FF3333'}}>即将断货</span>
    const columns = [     
      {
        title: '产品信息',
        dataIndex: 'image_url',
        key: 'image_url',
        width: 700,
        render: (text,record)=>{
          return (
            <ProductCell
              product_no={record.product_no}
              title={record.title}
              image_url={record.image_url}
              product_sku={record.product_sku}
              category={record.category}
            />
          )
        },
      },
      {
        title: '补货仓库',
        dataIndex: 'warehouse_name',
        key: 'warehouse_name',
        className: 'width200',
      },
      {
        title: '日均销量(件)',
        dataIndex: 'days_volumes_average',
        key: 'days_volumes_average',
        className: 'width200',    
      },
      {
        title: '预计可售天数',
        dataIndex: 'sales_days',
        key: 'sales_days',
        className: 'width200',
      },
      {
        title: '可售库存',
        dataIndex: 'stock_num',
        key: 'stock_num',
        className: 'width200',
      },  
      {
        title: '建议类型',
        dataIndex: 'requisition_warning_level',
        key: 'requisition_warning_level',
        className: 'width200',
        render: (text) =>{
          return (
            <div>
              {text===3?forWarn:text===2?threeWarn:text===1?twoWarn:text===0?oneWarn:''}
            </div>
          )
        },
      },  
      {
        title: '建议补货数量',
        dataIndex: 'requisition_expect_quantity',
        key: 'requisition_expect_quantity',
        className: 'width200',
      },
      {
        title: '计划调拨数量',
        dataIndex: 'plan_num',
        key: 'plan_num',
        className: 'width200',
      }, 
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        className: 'width200',
        render: (text, record) => {
          return (       
            <PermissionButton 
              size="small" 
              type="primary" 
              className="buttonBul" 
              ghost 
              action='requisition-warning/detail' 
              href={
                `#/requisition-warning/detail?product_id=${record.product_id}&product_dynamic_data_id=${record.product_dynamic_data_id}&inbound_warehouse_id=${record.warehouse_id}&warehouseId=${record.warehouse_id}&product_no=${record.product_no}
              `}
            >
              详情
            </PermissionButton>
          );
        },
      },
    ];

    return (
      <div className={styles.allocation}>
        <Form layout="inline">
          <div className={styles.selectAll}>               
            <FormItem label='补货仓库：'>
              {getFieldDecorator('warehouse_id', {
                initialValue:warehouse[0]&&warehouse[0].key,
              })(
                <RadioGroup className={styles.radio}  onChange={this.handleWarehouseFilter}>
                  {warehouse&&warehouse.map(ware=>{
                    return <RadioButton value={ware.key} >{ware.value}</RadioButton>
                  })}
                </RadioGroup>
              )}
            </FormItem>
          </div> 
          <div className={styles.shell}>
            <FormItem label='建议类型：'>
              {getFieldDecorator('requisition_warning_level', {
                initialValue:warnLevel[0]&&warnLevel[0].id,
              })(
                <Select className={styles.select} onChange={this.handleWarnlevel}>
                  {
                    warnLevel.map(warn=>{
                      return (<Option value={warn.id}>{warn.label}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>         
            <FormItem>
              {getFieldDecorator('type',{initialValue:typeData[0].id})(
                <Select className={styles.select} placeholder='请选择' style={{marginLeft:30}}>
                  {
                    typeData.map(select2=>{
                      return (<Option value={select2.id}>{select2.label}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('content')(
                <Input  className={styles.input} placeholder='请输入' />
                )
              }
            </FormItem>
            <FormItem>
              预计可售天数：
              {getFieldDecorator('sales_days',{
                initialValue: null,
              })(
                <RadioGroup className={styles.radioq}>
                  {
                    SelectDate.map(data=>{
                      return (<RadioButton value={data.value} onClick={()=>this.handleSaleDay(data.value)}>{data.label}</RadioButton>)
                    })
                  }
                  <RadioButton value={saleValue} onClick={()=>this.handleSaleDay(saleValue)} >                     
                    <Popconfirm 
                      placement="leftBottom"  
                      title={
                        <div>
                          <div style={{marginBottom:16}} >请输入自定义时间</div>
                          <FormItem>
                            {getFieldDecorator('sales_day')(<Input style={{width:180,marginRight:10}} />)}
                            天内
                          </FormItem>                  
                        </div>
                      } 
                      icon=""
                      okText='确认'
                      cancelText='取消'
                      onConfirm={this.handleConfirm}
                    >
                      {saleLabel||<a>自定义</a>}
                    </Popconfirm>
                             
                  </RadioButton>
                </RadioGroup> )
              }  
            </FormItem>

            <Button type="primary" className={styles.button1} onClick={this.handleSearch} >搜索</Button>
          </div> 
        </Form>  
        <div>          
          <Table
            columns={columns}
            dataSource={dataSource}
            onChange={this.handleTableChange}
            pagination={page}
            className='table-four-line'
          /> 
        </div>              
      </div>
    );
  };

  render() {
    return this.renderInfo();
  }
}

export default Index;
