import React from 'react';
import { Tree, Table, Button, Modal, Row, Col } from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './product.less';
import SearchBar from '../../components/SearchBar';
import ProductCell from '../../components/ProductCell';

const { TreeNode } = Tree;

class ProductClone extends React.Component {
  constructor(props){
    super(props);
    this.state={
      dataSource: [],
      category_id:'',
      productType: [],    
      options: [
        { key:'product_no', label:'产品ID' },
        { key:'title', label:'产品名称'  },
        { key:'product_sku', label:'SKU' },
      ],
      page: {
        pageSize: 6, 
        total: 0, 
        current: 1,
      },
    }
  }

  componentDidMount(){
    const { page } = this.state;
    this.getProductType();
    this.prodListFun(page);
  }
  
  // 搜索
  onSearch = (key, value) => {
    const { category_id } =this.state;
    erpPost('/product/index', { key, value, category_id}, res => {
      this.setState({
        dataSource: res.data.data,
      });
    });
  }

  // 组织架构-选择 树形控件
  onSelect = async (selectedKeys, pro) => {
    event.preventDefault();
    const category_id = pro.selectedNodes[0]&&pro.selectedNodes[0].props.dataRef.id;
    await this.setState({
      category_id,
    });
    erpPost('/product/index', {category_id}, res => {
      this.setState({
        dataSource: res.data.data,
      });
    });
  };

  // 页码
  onTableChange = (pageNumber) => {
    this.prodListFun(pageNumber);
  };

  // 获取产品分类
  getProductType = () => {
    erpPost('/product/product-category/index', {}, res => {
      this.setState({productType:res.data.data})
    }); 
  }
 
  // 产品的列表
  prodListFun = (page) => {  
    const can ={
      page,
    }
    erpPost('product/index', can, res => {
      this.setState({
        dataSource: res.data.data,
        page:res.data.page,
      });
    });
  };
 
  renderTreeNodes = data => {
    return data && data.map((item) => {
      return (
        <TreeNode
          style={{ position: 'relative' }}
          title={
            <span>
              {
                item.products
                ? `${item.name}  ( ${item.products} )`
                : `${item.name}`
              }
            </span>
          }
          key={item.id}
          dataRef={item}
        >
          {item.children ? this.renderTreeNodes(item.children) : null}
        </TreeNode>
      );
    });
  };

  render() {
    const {dataSource}=this.state;
    const {onClone, visible, onClosePro, onCancle} = this.props;
    const columns = [
      {
        title: '产品信息',
        dataIndex: 'image_url',
        key: 'image_url',
        width: 450,
        render: (text, record) => {
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
        title:'操作',
        dataIndex:'operation',
        key:'operation',
        width: 160,
        render: (text, record) => {
          return (
            <Button size="small" type="primary"  ghost onClick={()=>onClone(record.id)}>
              克隆
            </Button>
          )
        },
      },
    ]
    return (
      <Modal
        visible={visible}
        onOk={onClosePro}
        width={1040}
        title='基于产品克隆'
        onCancel={onCancle}
        maskClosable={false}
      >
        <div>
          <div>
            <SearchBar options={this.state.options} onClick={this.onSearch} />
          </div>
          <div style={{overflow:'hidden',width:'100%'}}> 
            <Row>
              <Col span={7}>
                <div className={styles.box}>
                  <p>产品分类</p>
                  <div style={{ height: 500, overflow: 'auto' }}>
                    <Tree
                      defaultExpandAll
                      style={{ marginTop: 50 }}
                      onSelect={this.onSelect}
                    >
                      {this.renderTreeNodes(this.state.productType)}
                    </Tree>
                  </div>
                </div>   
              </Col>
              <Col span={17}>     
                <div style={{marginLeft:20}}>
                  <Table
                    dataSource={dataSource}
                    columns={columns}
                    onChange={this.onTableChange}
                    pagination={this.state.page}
                  /> 
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
    )
  }

}
export default ProductClone;