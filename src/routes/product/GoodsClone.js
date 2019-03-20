import React from 'react';
import { Table, Button, Modal, Row, Col } from 'antd';
import { erpPost } from '../../services/ajax';
import SearchBar from '../../components/SearchBar';
import ListingCell from '../../components/ListingCell';

class GoodsClone extends React.Component {
  constructor(props){
    super(props);
    this.state={
      dataSource: [],
      orders: [],
      page: {
        pageSize: 10, 
        total: 0, 
        current: 1,
        showSizeChanger: true,
      },
      options: [
        { key:'product_no', label:'商品ID' },
        { key:'title', label:'商品名称'  },
        { key:'product_sku', label:'SellerSku' },
      ],
    }
  }

  componentDidMount(){
    this.goodListFun(this.state.page, this.state.orders);
  }
  
  // 搜索
  onSearch = (key, value) => {
    erpPost('/product/index', { key, value}, res => {
      this.setState({
        dataSource: res.data.data,
      });
    });
  }
 
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.goodListFun(pageNumber, order);
  };
 
  // 产品的列表
  goodListFun = (pageNumber, orders) => {
    const can = {
      page: pageNumber,
      order: orders,
    };
    erpPost('product/index', can, res => {
      this.setState({
        dataSource: res.data.data,
        page: res.data.page,
      });
    });
  };

  render() {
    const {dataSource}=this.state;
    const {onClone, visible,onCloseGood} = this.props;
    const columns = [
      {
        title:'商品信息',
        dataIndex:'title',
        key:'title',
        render: (text, record) => {
          return (
            <ListingCell 
              image_url={record.image_url}
              title={record.title}
              seller_sku={record.product_sku}
              category={record.category_name_arr}
              asin={record.asin}
            />
          )
        },
      },
      {
        title:'操作',
        dataIndex:'operation',
        key:'operation',
        render: (text, record) => {
          return (
            <Button size="small" type="primary"  ghost onClick={()=>onClone(record)}>
              克隆
            </Button>
          )
        },
      },
    ]
    return (
      <Modal
        visible={visible}
        onOk={onCloseGood}
        width={900}
        title='基于商品克隆'
        onCancel={onCloseGood}
        maskClosable={false}
      >
        <div>
          <div>
            <SearchBar options={this.state.options} onClick={this.onSearch} />
          </div>
          <div style={{overflow:'hidden',width:'100%'}}> 
            <Table
              onChange={this.onTableChange}
              dataSource={dataSource}
              columns={columns}
            /> 
          </div>           
        </div>
      </Modal>
    )
  }
}
export default GoodsClone;