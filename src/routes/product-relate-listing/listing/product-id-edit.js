import React from 'react';
import { Modal, Table, Button } from 'antd';
import { erpPost } from '../../../services/ajax';
import SearchBar from '../../../components/SearchBar';
import ProductModalCell from '../../../components/ProductModalCell';

class LinkProduct extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      dataSource: [],
      product_id: '',
      product_no: '',
      visible: props.visible,
      page: {
        pageSize: 7,
        total: 0,
        current: 1,
      },
    }
  }

  componentDidMount(){
    this.handleProductList();
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      visible:nextProps.visible,
    })
  }
  
  // 产品搜索
  handleSearch = (key, value) => {
    erpPost('/product/index', { key, value}, res => {
      this.setState({
        dataSource: res.data.data,
      });
    });
  }

  // 产品列表
  handleProductList = () => {
    const {page} = this.state;
    erpPost('/product/index', {page}, res => {
      this.setState({
        dataSource:res.data.data,
        page: res.data.page,
      });    
    })
  }

  // 关联产品操作
  handleLinkProduct = (product_id, product_no) => {
    this.setState({product_id,product_no});    
  }
  
  // 确定按钮
  handleSubmit = () => {
    const { handleCancelLink, listingIds, refresh } = this.props;
    const { product_id }=this.state;
    erpPost('/product/listing/product-id-edit', { product_id, listingIds }, () => {
      handleCancelLink(); 
      refresh()
    })
  }

  // 表格切换
  handleTableChange = (page) => {
    erpPost('/product/index', page, res => {
      this.setState({
        dataSource: res.data.data,
        page,
      });
    });
  }

  render() {
    const { handleCancelLink }=this.props;
    const { visible,dataSource, page, product_no } = this.state;
    const options = [
      { key:'product_no', label:'产品编号' },
      { key:'title', label:'产品名称'  },
      { key:'product_sku', label:'产品sku' },
    ]
    const columns = [
      {
        title: '产品信息',
        dataIndex: 'image_url',
        key: 'image_url',
        width: 600,
        render: (text, record) => {
          return (
            <ProductModalCell
              title={record.title}
              image_url={record.image_url}
              product_no={record.product_no}
              product_sku={record.product_sku}
              category={record.category}
              action={`#/product/detail?id=${record.id}`}
              onTurn={handleCancelLink}
            />           
          )
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 200,
        render: (text, record) => {
          return (
            <Button 
              type='primary' 
              ghost 
              size='small' 
              onClick={()=>{this.handleLinkProduct(record.id,record.product_no)}}
            >
              关联
            </Button>
          )
        },
      },
    ]
    return (
      <Modal
        onOk={this.handleSubmit}
        onCancel={handleCancelLink}
        visible={visible}
        width={800}
        maskClosable={false}
        title='关联产品'
      >
        <div style={{marginTop:-10}}>
          <div style={{marginBottom:10}}>当前关联产品ID:{product_no}</div>
          <div><SearchBar options={options} onClick={this.handleSearch} /></div>
          <Table
            onChange={this.handleTableChange}
            pagination={page}
            columns={columns}
            dataSource={dataSource}
          />
        </div>
      </Modal>
    )
  }

}
export default LinkProduct;