import React from 'react';
import moment from 'moment';
import { Tabs, Button, Table, Select, Input, Form, Radio, message, Popover } from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './StoreList.less';
import StoreModal from './StoreModal';
import StoreImport from './StoreImport';
import TipsModal from '../../components/TipsModal';
import ProductCell from '../../components/ProductCell';

const { Option } = Select;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

require('../ListStyle.less');

@Form.create()
class StoreList extends React.Component {
  constructor(props){
    super(props)
    this.newTabIndex = 1;
    this.state={
      storeData:[],
      select2Data:[
        {
          name: '产品ID',
          value: 'product_no',
        },
        {
          name: '产品名称',
          value: 'title',
        },
        {
          name: 'SKU',
          value: 'product_sku',
        },
      ],
      visible: false,
      dataSource:[],   
      panes: [{
        title:'仓库清单',
        content:'',
        key: '0',
        closable: false,
      }],
      page: {
        pageSize: 10, 
        total: 0,
        current: 1,
        showSizeChanger: true,
      },
      activeKey: '0',
      productData: [],
      warehouse_product_id: '',
    }
  }
  
  componentDidMount() {
    const {page} =this.state;
    this.onSetData(page)
    this.prodListFun()
    this.getWarehouseList()
  }

  componentWillReceiveProps(nextProps){
    console.log(nextProps)
  }

  // 同步FBA
  onSynData = () => {  
    console.log('暂时未完成')
  }

  // 点击仓库过滤
  onStoreFil = (warehouse_id) => {
    const { page } = this.state;
    const value = {
      warehouse_id,
    }
    this.onSetData(page,  value);
  }

  // 搜索触发事件
  onSearch = e => {
    const { page } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      const value = {
        warehouse_id: values&&values.warehouse_id,
        type: values&&values.type,
        content: values&&values.content,
      }
      if (!err) {
        this.onSetData(page, value);
      }
    });
  }

  // 获取list的数据
  onSetData = (page, value) => {
    const can = {
      page,
      warehouse_id: value&&value.warehouse_id,
      type: value&&value.type,
      content: value&&value.content,
    }
    erpPost('/warehouse-product/index', can, res => {
      message.success(res.data.msg);
      this.setState({ 
        dataSource: res.data.data,     
        page: res.data.page,      
      });
    });
  }

  // Tabs的操作
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  // 模态框操作
  onShowModal = (warehouse_product_id) =>{
    this.setState({
      visible:true,
      warehouse_product_id,
    })
  }

  onCancle = () =>{
    this.setState({visible:false})
  }

  // 导入
  onImport = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '导入仓库清单',
      content: (
        <StoreImport
          onSetData={this.onSetData}
          remove={this.remove}
          activeKey={activeKey}
        />
      ),
      key: activeKey,
    });
    this.setState({ panes, activeKey });
  }
  
  // 页码
  onTableChange = (pageNumber) => {
    this.onSetData(pageNumber);
  };

  // 获取仓库列表的数据
  getWarehouseList = () => {
    erpPost('/warehouse/index',{},res => {
      const { data } = res.data;
      const newData = [
        {
          key:'',
          value:'全部',
        },
      ];
      if(data) {
        data.map(e=>{
          const obj = { 
            key:e.warehouse_id,
            value:e.warehouse_name,
          }
          newData.push(obj)
        })
      }
      this.setState({
        storeData: newData,
      });
    });
  }

  // 产品的列表
  prodListFun = () => {
    erpPost('product/index', {}, res => {
      this.setState({
        productData: res.data.data,
      });
    });
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
    const { dataSource, select2Data, storeData, productData, page } = this.state;
    const { getFieldDecorator } = this.props.form;
    const columns = [
      {
        title: '产品信息',
        dataIndex: 'image_url',
        key: 'image_url',
        width: 300,
        render: (text, val) => {
          return (
            <ProductCell
              product_no={val.product_no}
              title={val.title}
              image_url={val.image_url}
              product_sku={val.product_sku}
              category={val.product_category}
            />
          )
        },
      },       
      {
        title: '仓库',
        dataIndex: 'warehouse',
        key:'warehouse',
        width: 70,
        render:(text)=>{
          return text.warehouse_name
        },
      },
      {
        title: '成本价(CNY)',
        dataIndex: 'cost',
        key:'cost',
        width: 80,
      },
      {
        title: <div><div>可售库存</div><div>安全库存</div></div>,
        dataIndex: 'in_stock_quantity',
        key:'in_stock_quantity',
        width: 60,
        render:(text, record) => {
          return (
            <div>
              <div>{record.in_stock_quantity || '--'}</div>
              <div>{record.safe_quantity || '0'}</div>
            </div>
          );
        },
      },
      {
        title: '采购在途',
        dataIndex: 'purchase_transfer_quantity',
        key:'purchase_transfer_quantity',
        width: 70,
        sort: (a, b)=> a.purchase_transfer_quantity - b.purchase_transfer_quantity,
      },
      {
        title: '调拨在途',
        dataIndex: 'requisition_transfer_quantity',
        key:'requisition_transfer_quantity',
        width: 70,
        sorter: (e, f) => e.requisition_transfer_quantity - f.requisition_transfer_quantity,
      },
      {
        title: '未出库数量',
        dataIndex: 'pending_outbound_quantity',
        key:'pending_outbound_quantity',
        width: 70,
        sorter: (e, f) => e.pending_outbound_quantity - f.pending_outbound_quantity,
      },
      {
        title: '预计断货时间',
        dataIndex: 'dynamic_data',
        key:'dynamic_data',
        width: 80,
        render: (text) => {
          return text&&text.predict_out_of_stock_date&&moment(text.predict_out_of_stock_date).format('YYYY-MM-DD')
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key:'operation',
        width: 80,
        render: (text, record) => {
          return (
            <div>
              <Button 
                type="primary" 
                ghost
                onClick={()=>this.onShowModal(record.warehouse_product_id )}
              >
                备货参数
              </Button>
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
              <FormItem label='仓库'>
                {getFieldDecorator('warehouse_id',{
                  initialValue:'',
                })(
                  <RadioGroup>
                    {
                      storeData.map(data=>{
                        return (<RadioButton value={data.key} className={styles.radio} onClick={()=>this.onStoreFil(data.key)}>{data.value}</RadioButton>)
                      })
                    }
                  </RadioGroup>
                )}
              </FormItem>
            </div>         
            <FormItem>
              {getFieldDecorator('type', {initialValue:'product_no'})(
                <Select className={styles.selecto}>
                  {
                    select2Data.map(select2=>{
                      return (<Option value={select2.value}>{select2.name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('content')(
                <Input  className={styles.input} placeholder='请输入内容' />
                )
              }
            </FormItem>
            <Button type="primary" className={styles.button} onClick={this.onSearch} >搜索</Button>
          </Form>
        </div>
        <div className={styles.tongbu}>
          {!productData?
            <Button type="primary" className={styles.button} onClick={this.onSynData}>同步FBA</Button>
            :
            (
              <TipsModal content='暂未有产品，请到产品页面添加'>
                <Button type="primary" className={styles.button} onClick={this.onSynData}>同步FBA</Button>
              </TipsModal>
            )
          }
          
          <Button type="primary" className={styles.button} onClick={this.onImport} style={{float:'right'}}>导入</Button>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={page}
          onChange={this.onTableChange}
          className='table-four-line'
        />
      </div>
    )
  }

  render() {
    const {panes,warehouse_product_id} = this.state;
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
          {panes.map(pane => (
            <TabPane
              tab={pane.title}
              key={pane.key}
              closable={pane.closable}
              className="proTabs"
              style={{ marginBottom: '0px' }}
            >
              {pane.content}
            </TabPane>
          ))}  
        </Tabs>  
        {this.state.visible?
          (
            <StoreModal 
              onCancel={this.onCancle}
              visible={this.state.visible}
              warehouse_product_id={warehouse_product_id}
            />
          )
          :null
        }   
      </div>
    );
  }
}

export default StoreList;