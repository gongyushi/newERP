import React from 'react';
import { Form, Button, Tree, Row, Col, Modal, Upload, message, Icon, Input, Table, Spin } from 'antd';
import { Urls, getPageState, getOrderState } from '../../utils/utils';
import { erpPost } from '../../services/ajax';
import SearchBar from '../../components/SearchBar';
import ProductImport from './ProductImport'
import styles from './product.less';
import DeleteConfirmModal from '../../components/DeleteConfirm';
import ProductCell from '../../components/ProductCell';
import PermissionButton from '../../components/PermissionButton';

const { TreeNode } = Tree;
const FormItem = Form.Item;

require('../ListStyle.less');

@Form.create()
class ProductList extends React.Component {
  constructor(props) {
    super(props);
    const { activeKey, params } = props;

    this.state = {
      dataSource: [],
      productType: [],
      options: [
        { key:'product_no',label:'产品ID' },
        { key:'title',label:'产品名称'  },
        { key:'product_sku',label:'SKU' },
      ],
      showLeft: false,
      visible: false,
      parent_id: '',
      editable: false,
      proTypeKey: '',
      productId:'',
      loading: true,
      initialize: null,
      isProduct: false,
      showImport: false,
      path: '',
      ext: '',
      activeKey,
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        category_id: params.Get('category_id', ''),
        key: params.Get('key', ''),
        value: params.Get('value', ''),
      },
    };
  };

  componentDidMount() {
    this.refresh();
    this.handleProductType();
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

  // 删除产品
  handleDeleteProduct = (id) => {
    erpPost('/product/delete', {id}, res => {
      this.refresh();
      message.success(res.data.msg);
    });
  }

  // 组织架构-选择 树形控件
  handleSelectProType = async (selectedKeys, pro) => {
    if(event){
      event.preventDefault();
    }
    const { search } = this.state;

    this.setState({
      proTypeKey: Number(selectedKeys),
      search: {...search, category_id: pro.selectedNodes[0]&&pro.selectedNodes[0].props.dataRef.id},
    });
  };

  // 导入模态框
  handleShowProImport = () => {
    this.setState({
      isProduct:true,
      showImport:true,
    })
  };

  handleShowGoodImport = () => {
    this.setState({
      isProduct:false,
      showImport:true,
    })
  }
  
  handleCloseImport = () => {
    this.setState({
      showImport:false,
      isProduct:false,
    })
  };
  
  // 第一次登陆时的页面调用的方法
  handleShowLeft = () => {
    this.setState({showLeft: true})
  };

  handleCloseLeft = () => {
    this.setState({showLeft: false})
  };

  handleSbumitLeft = () => {
    erpPost('/product/create-list', {}, res => {
      this.refresh();
      this.setState({showLeft: false})
      message.success(res.data.msg)
    });
  };

  // 搜索
  handleSearch = (key, value) => {
    const { search } = this.state;
    this.setState({
      search: {...search, key, value},
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

  // 新增产品分类
  handleAddProType = (id, name) => {
    this.setState({
      visible: true,
      parent_id: Number(id),
      editable: false,
    });
    const data = {
      parent_name: name,
      name:'',
    };
    this.props.form.setFieldsValue(data)
  };

  // 编辑产品分类
  handleEditProType = (parent_id, name, id) => {
    this.setState({
      visible: true,
      parent_id: Number(parent_id),
      productId: Number(id),
      editable: true,
    });
    const data = {
      name,
    }
    this.props.form.setFieldsValue(data)
  };

  // 新增产品分类
  handleSaveProType = () => {
    const {parent_id} = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      const data = parent_id!==0?{
        parent_id,
        name:values.name,
      }:{
        name:values.name,
      }
      erpPost('/product/product-category/add', data, () => {
        this.handleProductType()
        this.setState({visible: false})
      });
    })
  };

  // 保存编辑的产品分类
  handleSaveEditProType = () => {
    const {productId, parent_id} = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      const data = {
        product_category_id: productId,
        parent_id,
        name:values.name,
      }
      erpPost('/product/product-category/edit', data, () => {
        this.handleProductType()
        this.refresh()
        this.setState({visible: false})
      });
    })
  };

  // 保存Excel
  handleSaveExcel = () => {
    const { path, ext }=this.state;
    erpPost('/product/import-product-listing', {path,ext}, () => {
      this.refresh();
    })
  };

  // 获取产品分类
  handleProductType = () => {
    erpPost('/product/product-category/index', {}, res => {
      this.setState({productType:res.data.data})
    });
  };

  // 关闭modal
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  // 产品分类删除
  handleShowConfirm = (item, handleProductType) => {
    Modal.confirm({
      title: '确定删除产品分类？',
      content: '',
      onOk() {
        erpPost('/product/product-category/delete', { product_category_id: item.id }, res => {
          handleProductType()
          message.success(res.data.msg);
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  // 产品的列表
  refresh = () => {
    const { search, page, orders } = this.state;
    let { initialize } = this.state;
    const params={
      page,
      orders,
      category_id: search.category_id,
      key: search.key,
      value: search.value,
    };
    erpPost('product/index', params, res => {
      if(res.data.page.total <= 0 && initialize === null){
        initialize = true;
      }else{
        initialize = false;
      }
      this.setState({
        dataSource: res.data.data,
        page: res.data.page,
        loading: false,
        initialize,
      });
    });
  };

  // 侧边树
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
          icon={
            Number(item.id) === this.state.proTypeKey ? (
              <div>
                {
                  item.products || item.children?
                  null:
                  (
                    <Icon
                      type='close'
                      style={{
                        position: 'absolute',
                        right: 25,
                        top: 10,
                        fontSize: 18,
                        borderRadius: '50%',
                        color:'red',
                        fontWeight:1000,
                      }}
                      onClick={()=>this.handleShowConfirm(item, this.handleProductType)}
                    />
                  )
                }
                {
                  !item.id?
                null:
                  (
                    <Icon
                      type="form"
                      style={{ position: 'absolute', right: 48, top: 10, color:'#2292DD', fontSize: 18}}
                      onClick={this.handleEditProType.bind(
                        this,
                        item.parent_id,
                        item.name,
                        item.id
                      )}
                    />
                  )
                }
                <Icon
                  type="plus"
                  onClick={this.handleAddProType.bind(
                    this,
                    item.id,
                    item.name
                  )}
                  style={{ position: 'absolute', right: 70, top: 10, color:'#2292DD', fontSize: 18, fontWeight:1000  }}
                />
              </div>)
            :null
          }
        >
          {item.children ? this.renderTreeNodes(item.children) : null}
        </TreeNode>
      );
    });
  };

  // 第一次登陆的页面
  renderNullInfo = () => {
    const { urlHeader } = global.gconfig;
    return (
      <div className={styles.nullInfo}>
        <p>当前没有设置任何商品，请选择一种方式来生成？</p>
        <div className={styles.maxInfo}>
          <Row>
            <Col span={11}>
              <div className={styles.nullLeft}>
                <p className={styles.leftPstyle}>根据SKU自动生成产品：</p>
                <p>如果多个商品在不同店铺使用相同的SKU，则可以使用SKU自动生成。</p>
                <Button  type="primary" className={styles.buttonPlace} onClick={this.handleShowLeft}>
                  选择
                </Button>
              </div>
            </Col>
            <Col span={1}>
              <div className={styles.nullMiddle} />
            </Col>
            <Col span={12}>
              <div className={styles.nullRight}>
                <p className={styles.rightPstyle}>根据自定义关联关系生成产品：</p>
                <p>如果产品和商品之间有设置对应的关系，上传关联关系文件，系统将根据文件自动生成。</p>
                <div className={styles.buttonTwoPlace} >
                  上传文件：
                  <Upload
                    name='file_stu'
                    action={`${urlHeader}/product/listing/upload-file'`}
                    headers={{
                      'X-Token': localStorage.getItem('token'),
                      Accept: 'application/json',
                    }}
                    onChange={info=>
                      {
                        if (info.file.status !== 'uploading') {
                          console.log(info.file, info.fileList);
                        }
                        if (info.file.status === 'done') {
                          message.success(`${info.file.name} 文件上传成功`);
                          this.setState({
                            path:info.file.response.data.path,
                            ext:info.file.response.data.ext,
                          })
                        } else if (info.file.status === 'error') {
                          message.error(`${info.file.name} 文件上传失败`);
                        }
                      }
                    }
                  >
                    <Button icon="upload" size='large'>上传文件</Button>
                  </Upload>
                </div>
                <Button type="primary" className={styles.buttonThrPlace} onClick={this.handleSaveExcel} >生成</Button>
                <Button type="primary" className={styles.buttonOnePlace}>
                  <a href="/user/test/xxxx.txt" download="模板.xlsx">模板下载</a>
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    )
  };

  // 有数据时的渲染页面
  renderProInfo = () => {
    const { dataSource, page } = this.state;
    console.log('ssfs',this.state.search.value)
    const columns = [
      {
        title: '产品信息',
        dataIndex: 'image_url',
        key: 'image_url',
        width: 400,
        render: (text, record) => {
          const category = [];
          category.push(record);
          return (
            <ProductCell
              product_no={record.product_no}
              title={record.title}
              image_url={record.image_url}
              product_sku={record.product_sku}
              category={category}
            />
          )
        },
      },
      {
        title: '吊牌价(￥)',
        dataIndex: 'regular_price',
        key: 'regular_price',
        width: 200,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 200,
        render: (text, record) => {
          return (
            <div>
              <PermissionButton size="small" type="primary" className="buttonBul" ghost action="product/listing/detail" href={`#/product/detail?id=${record.id}`}>
                详情
              </PermissionButton>
              <div>
                <DeleteConfirmModal
                  onOk={this.handleDeleteProduct.bind(this, record.id)}
                  content='确定删除产品?'
                >
                  <Button
                    size="small"
                    className="buttonBul"
                    style={{ width: 60 }}
                    type="primary"
                    ghost
                  >
                    删除
                  </Button>
                </DeleteConfirmModal>
              </div>
              <div>
                <PermissionButton 
                  size="small"
                  type="primary" 
                  ghost
                  className="buttonBul"
                  action="purchase/purchase-orders" 
                  href={`#/purchase/purchase-orders?product_id=${record.id}`}
                >
                  采购单
                </PermissionButton>
              </div>
            </div>
          );
        },
      },
    ];
    return (
      <div>
        <div className={styles.searchBar}>
          <SearchBar options={this.state.options} onClick={this.handleSearch} defaultKey={this.state.search.key} defaultValue={this.state.search.value} />
        </div>
        <div style={{marginLeft:20, marginBottom: 55}}>
          <PermissionButton  type="primary" style={{height:31, float:'left'}}  action="product/add" href='#/product/add'>新增产品</PermissionButton>
          <Button type='primary' onClick={this.handleShowGoodImport} style={{marginLeft:10,height:31, float:'left'}}>商品关联导入</Button>
          {/* <Button type='primary' onClick={this.handleShowProImport} style={{marginLeft:10}}>产品信息导入</Button> */}
        </div>
        <div className={styles.prodContent}>
          <div className={styles.prodLeft}>
            <div className={styles.prodLeftBox}>
              <p className={styles.prodLeftTitle}>产品分类</p>
              <div style={{ height: 546, overflow: 'auto' }}>
                {
                  this.state.productType && (
                    <Tree
                      showIcon
                      defaultExpandAll
                      style={{ marginTop: 50 }}
                      onSelect={this.handleSelectProType}
                      defaultSelectedKeys={this.state.search.category_id}
                    >
                      {this.renderTreeNodes(this.state.productType)}
                    </Tree>
                  )
                }
              </div>
            </div>
          </div>
          <div className={styles.prodRight}>
            <Table
              onChange={this.handleTableChange}
              dataSource={dataSource}
              rowKey="id"
              columns={columns}
              pagination={page}
              className='table-four-line'
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { loading, initialize, page, showImport, isProduct, showLeft }=this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <div className={styles.product}>
        {loading ? <div className={styles.example} ><Spin className={styles.spa} /></div> : initialize ? this.renderNullInfo() : this.renderProInfo()}
        <Modal
          visible={showLeft}
          title="请确认"
          onCancel={this.handleCloseLeft}
          footer={[
            <Button key="back" onClick={this.handleCloseLeft}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleSbumitLeft}>
            确定
            </Button>,
          ]}
        >
          <p>是否根据SKU自动生成产品</p>
        </Modal>

        <Modal
          visible={this.state.visible}
          title="请确认"
          onCancel={this.handleCancel}
          onOk={this.state.editable ? this.handleSaveEditProType : this.handleSaveProType}
        >
          <Form>
            {!this.state.editable?
              (
                <FormItem {...formItemLayout} label={<span>父级分类</span>}>
                  {getFieldDecorator('parent_name', {
                    rules: [{ required: false, message: '请输入父级名称!' }],
                  })(<Input className="InputW200" disabled />)}
                </FormItem>
              )
            :null
            }
            <FormItem {...formItemLayout} label={<span>分类名称</span>}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入分类名称!' }],
              })(<Input className="InputW200" />)}
            </FormItem>
          </Form>
        </Modal>
        <ProductImport
          refreshProductList={this.refresh}
          page={page}
          visible={showImport}
          isProduct={isProduct}
          onCancle={this.handleCloseImport}
        />
      </div>
    );
  }
}

export default ProductList;
