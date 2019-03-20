import React from 'react';
import { Button, Table, Select, Input, Form, Radio } from 'antd';
import { erpPost } from '../../../services/ajax';
import styles from './index.less';
import { getPageState, getOrderState } from '../../../utils/utils';
import PermissionButton from '../../../components/PermissionButton';
import ListingCell from '../../../components/ListingCell';
import LinkProduct from './product-id-edit';

const { Option } = Select;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

require('../../ListStyle.less');

@Form.create()
class GoodLink extends React.Component {
  constructor(props){
    super(props)
    const { activeKey, params } = props;
    this.state={
      storeData:[],
      filterType:[
        {
          name: '商品名称',
          value: 'title',
        },
        {
          name: 'SellerSku',
          value: 'seller_sku',
        },
        {
          name: 'ASIN',
          value: 'asin',
        },
      ],
      statusData: [
        {
          name: '全部',
          value: null,
        },
        {
          name: '已关联',
          value: '1',
        },
        {
          name: '未关联',
          value: '2',
        },
      ],
      activeKey,
      dataSource:[],
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        has_related: params.Get('has_related', null),
        type: params.Get('type', 'title'),
        content: params.Get('content', ''),
        store_id: params.Get('store_id', null),
      },
      visible: false,
      id: '',
      selectedRowKeys: [],
      listingIds:'',
      loading: false,
    }
  }

  componentDidMount() {
    this.refresh();
    this.handleStoreData()
  };

  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
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
      JSON.stringify(nextState.search) !== JSON.stringify(this.state.search) ||
      JSON.stringify(nextState.orders) !== JSON.stringify(this.state.orders) ||
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    ){
      this.refresh();
    }
  };

  // 获取仓库
  handleStoreData = () => {
    erpPost('/store/has-permission-store', {}, res => {
      const { data } = res.data;
      data.unshift({id:null,store_name:'全部'});
      this.setState({
        storeData:res.data.data,
      })
    })
  }

  // 在线产品的列表
  refresh = () => {
    const { search, page, orders } = this.state;
    const params={
      page,
      orders,
      type: search.type,
      content: search.content,
    };
    
    if(search.store_id&&search.store_id!==null){
      params.store_id = search.store_id;
    }
    if(search.has_related&&search.has_related!==null){
      params.has_related = search.has_related;
    }
    erpPost('/listing/index', params, res => {
      this.setState({
        dataSource: res.data.data,
        page: res.data.page,
      });
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
  
  // 复选框过滤
  handleRadioChange = (e) => {
    const { search } = this.state;
    const { value } = e.target;
    const store_id = value;   
    this.setState({
      search: {...search, store_id},
    });
  }

  // 状态下拉触发事件
  handleSelectStatus = (e) => {
    const { search } = this.state;
    const has_related = e;
    this.setState({
      search: {...search, has_related},
    });
  }
  
  // 同步按钮
  handleSyncData = () => {
    this.setState({loading:true})
    erpPost('/listing/sync-list', {}, res => {
      this.setState({
        dataSource:res.data.data,
        loading: false,
      })
      this.refresh()
    })
  }

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
  
  // 开模态框
  handleOpenModal = (id) => {
    this.setState({     
      listingIds: id,
      visible: true,
    });
  }
  
  // 选择多个时的模态框
  handleMixModal = () => {
    this.setState({     
      visible: true,
    });
  }

  // 关模态框
  handleClose = () => {
    this.setState({
      visible: false,
    });
  }

  // 选择行操作
  handleSelectChange = (selectedRowKeys,lists) => {
    const listIds=[];
    if(lists){
      lists.map(list=>{
        listIds.push(list.id)
        return listIds;
      })
    }
    const listingIds = listIds.join(',')
    this.setState({ selectedRowKeys, listingIds });
  }

  renderTable = () => {
    const { dataSource, filterType, storeData, statusData, page, selectedRowKeys, loading, search} = this.state;
    const { getFieldDecorator } = this.props.form;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
      columnWidth:50,
    };
    const columns = [
      {
        title: '商品信息',
        dataIndex: 'category',
        key:'category',
        width:400,
        render: (text, record) => {
          return (
            <ListingCell
              title={record.title}
              image_url={record.image_url}
              seller_sku={record.seller_sku}
              category={text}
              asin={record.asin}
            />
          )
        },
      },
      {
        title: '状态',
        dataIndex: 'has_related',
        key:'has_related',
        width: 120,
        render: (text, record) => {
          return (record.product_id?'已关联':'未关联')
        },
      },
      {
        title: '关联产品',
        dataIndex: 'product_no',
        key:'product_no',
        width: 120,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key:'operation',
        width: 120,
        render: (text, record) => {
          return (
            <div>              
              <div>
                <PermissionButton 
                  size="small" 
                  type="primary" 
                  className="buttonBul" 
                  ghost 
                  action="product-relate-listing/product/add" 
                  href={`#/product-relate-listing/product/add?id=${record.id}`}
                >
                  生成产品
                </PermissionButton>
              </div>
              <div>
                <PermissionButton size="small" type="primary" className="buttonBul" ghost action="product/listing/product-id-edit" onClick={()=>this.handleOpenModal(record.id)}>
                  {record&&record.state===1?'关联新产品':'关联产品'}
                </PermissionButton>
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
                {getFieldDecorator('store_id', {initialValue:search.store_id})(
                  <RadioGroup onChange={this.handleRadioChange}>
                    {
                      storeData.map(data => {
                        return (<RadioButton key={data.id} value={data.id} className={styles.radio}>{data.store_name}</RadioButton>)
                      })
                    }
                  </RadioGroup>
                )}
              </FormItem>
            </div>
            <FormItem>
              {getFieldDecorator('type', {initialValue:search.type})(
                <Select style={{width:150}}>
                  {
                    filterType.map(select2=>{
                      return (<Option key={select2.value} value={select2.value}>{select2.name}</Option>)
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
            <FormItem label='状态'>
              {getFieldDecorator('status', {initialValue:search.has_related})(
                <Select style={{width:150}} onChange={this.handleSelectStatus}>
                  {
                    statusData.map(val => {
                      return (<Option key={val.value} value={val.value}>{val.name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <Button type="primary" className={styles.button} onClick={this.handleSearch} >搜索</Button>
          </Form>
        </div>
        <div style={{marginBottom:50}}>
          <PermissionButton 
            type="primary" 
            ghost 
            loading={loading} 
            style={{float:'left',marginRight:10 }}
            action="product-relate-listing/listing/sync-index"         
            onClick={this.handleSyncData}
          >
            同步
          </PermissionButton>
          <PermissionButton 
            style={{float:'left'}}
            type="primary" 
            ghost 
            action="product/listing/product-id-edit" 
            onClick={this.handleMixModal}
          >
            关联产品
          </PermissionButton>
        </div>
        <Table
          onChange={this.handleTableChange}
          pagination={page}
          columns={columns}
          rowSelection={rowSelection}
          dataSource={dataSource}
          className='table-three-line'
        />
      </div>
    )
  }

  render() {
    const { id, visible, listingIds} = this.state;
    return (
      <div className={styles.purchase}>
        {this.renderTable()}
        {visible&&
          <LinkProduct visible={visible} id={id} handleCancelLink={this.handleClose} refresh={this.refresh} listingIds={listingIds} /> }
      </div>
    );
  }
}
export default GoodLink;
