import React from 'react';
import {
  Input,
  Form,
  Button,
  Table,
  message,
  Row,
  Col,
  InputNumber,
  Cascader,
  Popover,
  Icon,
} from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './product.less';
import ProductImag from './ProductImag';
import ListingCell from '../../components/ListingCell';
import { Urls } from '../../utils/utils';
import SelectFilter from '../../components/SelectFilter';

const { TextArea } = Input;

require('../FormStyle.less');

const FormItem = Form.Item;

@Form.create()
class RegistrationForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      supDataSource: [],
      supcolumns: [
        {
          title: '供应商名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '联系人',
          dataIndex: 'contacts',
          key: 'contacts',
        },
        {
          title: '联系电话',
          dataIndex: 'phone',
          key: 'phone',
        },
        {
          title: 'QQ',
          dataIndex: 'qq',
          key: 'qq',
        },
        {
          title: '发货地址',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: '成本价（CNY）',
          dataIndex: 'cost',
          key: 'cost',
        },
      ],
      custormId: '',
      imageUrl:'',
      sizeUnit: [],
      weightUnit: [],
      poundUnit: [],
      productCategories:[],
      infoEdit: false,
      costEdit: false,
      packEdit: false,
      prodEdit: false,
      formData: [],
      showImag: false,
      dangerType: [
        {
          id: '0',
          remark:'非危险品',
        },{
          id: '1',
          remark:'内置电池',
        },{
          id: '2',
          remark:'纯电池',
        },{
          id: '3',
          remark:'液体',
        },{
          id: '4',
          remark:'粉末',
        },
      ],
      cate_arr:'',
      danger:'',
    };
  }
  componentDidMount() {
    this.handleUnitCode();
    this.handleProductDetail();
  }
  componentWillUnmount(){
    this.props.onAddRefreshKey('product/index');
  }

  // 获取字段字典的单位
  handleUnitCode = () => {
    erpPost('/index/dictionary/lists', {keyword :'SizeCode'}, res => {
      this.setState({sizeUnit:res.data.data.children})
    })
    erpPost('/index/dictionary/lists', {keyword :'currency'}, res => {
      this.setState({poundUnit:res.data.data.children})
    })
    erpPost('/index/dictionary/lists', {keyword :'WeightCode'}, res => {
      this.setState({weightUnit:res.data.data.children})
    })
    // 获取产品分类
    erpPost('/product/product-category/index', {}, res => {
      this.setState({productCategories:res.data.data[0]&&res.data.data[0].children || [] })
    });
  }

  // 基础信息编辑
  handleClickInfo = () =>{
    this.setState({
      infoEdit:true,
    })
  }

  handleEditInfo = () => {
    const { params }=this.props;
    const proData = this.props.form.getFieldsValue([
      'item_length',
      'item_width',
      'item_height',
      'package_length',
      'package_width',
      'package_height',
      'product_sku',
      'product_no',
      'title',
      'item_weight',
      'package_weight',
      'category_arr',
      'regular_price',
      'package_quantity',
      'item_size_unit',
      'package_size_unit',
      'package_weight_unit',
      'item_weight_unit',
    ])
    proData.category_id = proData.category_arr&&proData.category_arr[proData.category_arr.length-1];
    proData.item_size_unit = Number(proData.item_size_unit);
    proData.package_size_unit = Number(proData.package_size_unit);
    proData.package_weight_unit = Number(proData.package_weight_unit);
    proData.item_weight_unit = Number(proData.item_weight_unit);
    proData.image_url=this.state.imageUrl;
    delete proData.category_arr;
    const data = Object.assign({}, proData, { id: params.Get('id', 0) })
    erpPost('/product/update', data, res => {
      message.success(res.data.msg);
      this.handleProductDetail()
      this.setState({
        infoEdit:false,
      })
    })
  }

  handleCancelInfo = () => {
    this.setState({
      infoEdit:false,
    })
  }
  // 成本与定价编辑
  handleClickCost = () => {
    this.setState({
      costEdit:true,
    })
  }

  handleEditCost = () => {
    const proData = this.props.form.getFieldsValue([
      'regular_price',
      'cost',
      'regular_price_currency_code',
      'cost_currency_code',
    ])
    const { params } = this.props;
    const data = Object.assign({}, proData, { id: params.Get('id', 0) })
    erpPost('/product/update', data, res => {
      this.handleProductDetail()
      this.setState({
        costEdit:false,
      })
      message.success(res.data.msg);
    })
  }

  handleCancelCost = () => {
    this.setState({
      costEdit:false,
    })
  }
  // 物流与包装编辑
  handleClickPackage = () => {
    this.setState({
      packEdit:true,
    })
  }

  handleEditPackage = () => {
    const { params } = this.props;
    const proData = this.props.form.getFieldsValue([
      'customs_cn_title',
      'import_hscode',
      'custorms_weight',
      'lenght',
      'width',
      'height',
      'item_package_quantity',
      'custorms_en_title',
      'export_hscode',
      'weight',
      'custorms_amount',
      'danger_type',
      'weight_error',
      'size_unit',
      'weight_unit',
      'custorms_weight_unit',
      'custorms_amount_currency_code',
    ])
    proData.id = this.state.custormId ? this.state.custormId : 1;
    proData.product_id = params.Get('id', 0);
    proData.package_quantity = proData.item_package_quantity;
    proData.size_unit = Number(proData.size_unit);
    proData.weight_unit = Number(proData.weight_unit);
    proData.custorms_weight_unit = Number(proData.custorms_weight_unit);
    proData.custorms_amount_currency_code = Number(proData.custorms_amount_currency_code);
    delete proData.item_package_quantity;
    const data = Object.assign({}, proData)
    erpPost('/product/logistics/update', data, () => {
      this.handleProductDetail();
      this.setState({
        packEdit:false,
      })
    })
  }

  handleCancelPackage = () => {
    this.setState({
      packEdit:false,
    })
  }

  // 采购参数编辑
  handleClickProduct = () => {
    this.setState({
      prodEdit:true,
    })
  }

  handleEditProduct = () => {
    const { params } = this.props;
    const proData = this.props.form.getFieldsValue([
      'production_time',
      'quality_time',
      'documentary_prompt',
    ])
    const data = Object.assign({}, proData, { id: params.Get('id', 0) })
    erpPost('/product/update', data, res => {
      this.handleProductDetail();
      this.setState({
        prodEdit:false,
      })
      message.success(res.data.msg);
    })
  }

  handleCancelProduct = () => {
    this.setState({
      prodEdit:false,
    })
  }

  // 过滤出数据对应的remark
  handleFilter = (data,key) => {
    const keyData = this.state.formData[key];
    const newData = data.filter(item=>item.id===keyData);
    const label = newData[0]&&newData[0].remark;
    return label;
  }

   // 新增图片
   handleShowImag = () => {
    this.setState({
      showImag: true,
    })
  }
  handleAddImag = (img) =>{
    this.setState({
      imageUrl: img,
      showImag: false,
    })
  }
  handleCloseImag = () => {
    this.setState({
      showImag: false,
    })
  }

  handleDelete = () => {
    this.setState({
      imageUrl: '',
    })
  }

  // 处理编辑数据
  handleDealData = (category, dangers) => {
    const cates = [];
    const { dangerType } = this.state;
    let dangerLbale;
    if(category&&category!==null) {
      category.map(cate=>{
        cates.push(cate.name)
      })
    }
    const newDanger = dangers&&dangers.danger_type&&dangerType&&dangerType.filter(val=>val.id===dangers.danger_type.toString());
    if(newDanger&&newDanger!==null) {
      dangerLbale = newDanger[0]&&newDanger[0].remark;
    }
    this.setState({
      cate_arr:cates.join('/'),
      danger:dangerLbale,
    })

  };

  // 获取产品详情
  handleProductDetail = () => {
    const category_arr = [];
    const { params } = this.props;
    erpPost('/product/detail', { product_id: params.Get('id', 0) }, res => {
      if(res.data.data.product_logistics&&res.data.data.product_logistics.package_quantity&&res.data.data.product_logistics.package_quantity!==null){
        res.data.data.product_logistics.item_package_quantity = res.data.data.product_logistics.package_quantity;
        delete res.data.data.product_logistics.package_quantity;
      }
      this.handleDealData(res.data.data.base.category_arr, res.data.data.product_logistics)
      this.setState({
        dataSource:res.data.data.listings,
        supDataSource:res.data.data.product_suppliers,
        custormId:res.data.data.product_logistics&&res.data.data.product_logistics.id,
        imageUrl:res.data.data.base.image_url,
      })
      if(res.data.data.base&&res.data.data.base.category_arr&&res.data.data.base.category_arr!==null) {
        res.data.data.base.category_arr.map(res=>category_arr.push(res.id))
      }
      res.data.data.base.category_arr = category_arr;
      const formDatas = Object.assign({}, res.data.data.base, res.data.data.price, res.data.data.supplierParams, res.data.data.product_logistics)
      formDatas.danger_type=formDatas.danger_type&&formDatas.danger_type.toString();
      this.setState({formData:formDatas});
      this.props.form.setFieldsValue(formDatas);
    });
  };

  handleSubmitForm = e => {
    e.preventDefault();
    const { params } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.id = params.Get('id', 0);
        erpPost('product/info/edit', values, res => {
          message.success(res.data.msg);
        });
      }
    });
  };

  render() {
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
    const formLayout1 = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const columns= [
      {
        title: '商品信息',
        dataIndex: 'title',
        render: (text, record) => {
          return (
            <ListingCell
              title={record.title}
              image_url={record.image_url}
              seller_sku={record.seller_sku}
              category={record.category}
              asin={record.asin}
            />
          )
        },
      },
      {
        title: 'ASIN',
        dataIndex: 'asin',
        sorter: (a, b) => a.asin - b.asin,
      },
      {
        title: '状态',
        dataIndex: 'status',
        sorter: (a, b) => a.status - b.status,
        render: (text, record) => {
          if(record && record.status===0){
            return '在售';
          } else if(record && record.status===1){
            return '未同步';
          } else if(record && record.status===2){
            return '已下架';
          }
        },
      },
      {
        title: '同步日期',
        dataIndex: 'sync_at',
        sorter: (a, b) => a.sync_at - b.sync_at,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: () => {
          return (
            <Button  size="small" type="primary" className="buttonBul" ghost>删除</Button>
          );
        },
      },
    ];
    const { dataSource, supcolumns, supDataSource, sizeUnit, weightUnit, poundUnit, productCategories } = this.state;
    const { imageUrl, infoEdit, costEdit, packEdit, prodEdit, formData } = this.state;

    return (
      <div>
        <Form onSubmit={this.handleSubmitForm} className="proDataWrap" style={{ textAlign: 'left' }}>
          <div className={styles.moduleTile}>
            <span className={styles.moduleTitleF}>基本信息</span>
            {!infoEdit?<Button type="primary" style={{float:'right'}} onClick={this.handleClickInfo}>编辑</Button>
            : (
              <span style={{float:'right'}}>
                <Button onClick={this.handleCancelInfo} style={{height:'28px'}}>取消</Button>
                <Button type="primary"  onClick={this.handleEditInfo} style={{marginLeft:14}}>保存</Button>
              </span>
              )
            }
          </div>
          <Row>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label="产品图片"
                extra={
                  !infoEdit?null:imageUrl?(<Button  type='primary' onClick={this.handleDelete} style={{marginLeft:20, backgroundColor:'red', borderColor:'red'}}>删除</Button>)
                  :
                  (<Button type='primary' onClick={this.handleShowImag} style={{marginLeft:20}}>添加</Button>)
                }
              >
                {getFieldDecorator('image_url')(
                  <div>
                    {imageUrl ? (
                      <img src={imageUrl} style={{ width: 100, height: 100 }} alt="" />
                    ) : (
                      <svg viewBox="100 100 800 800"  width="100" height="100">
                        <path fill="#81d4fa" d="M832 128H192c-35.2 0-64 28.8-64 64v640c0 35.2 28.8 64 64 64h640c35.2 0 64-28.8 64-64V192c0-35.2-28.8-64-64-64zM717.6 525.8C703.1 626.4 616.6 704 512 704c-104.5 0-191.1-77.6-205.6-178.2-19.8-5.9-34.4-24.1-34.4-45.8 0-26.5 21.5-48 48-48s48 21.5 48 48c0 20-12.2 37-29.5 44.3C352.1 607.9 424.6 672 512 672s159.9-64.1 173.5-147.7C668.2 517 656 500 656 480c0-26.5 21.5-48 48-48s48 21.5 48 48c0 21.7-14.6 39.9-34.4 45.8zM848 240c0 17.6-14.4 32-32 32H208c-17.6 0-32-14.4-32-32v-32c0-17.6 14.4-32 32-32h608c17.6 0 32 14.4 32 32v32z" />
                      </svg>
                    )}
                  </div>
                )}
              </FormItem>
            </Col>
            <Col span={16}>
              <Row>
                <Col span={12}>
                  <FormItem {...formItemLayout} label={<span>产品ID</span>}>
                    {getFieldDecorator('product_no', {
                      rules: [{ required: true, message: '请输入产品ID!', whitespace: true }],
                    })(infoEdit?<Input  style={{width:210, marginRight:10}} />:<span>{formData.product_no}</span>)}
                    {infoEdit?(
                      <Popover  placement="top" content={<div>产品ID格式为：PROD后面加8个数字</div>}>
                        <Icon type="question-circle" theme="outlined" />
                      </Popover>):null}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...formItemLayout} label={<span>SKU</span>}>
                    {getFieldDecorator('product_sku', {
                      rules: [{ required: true, message: '请输入产品SKU!', whitespace: true }],
                    })(infoEdit?<Input  style={{width:204}} />:<span>{formData.product_sku}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <FormItem {...formLayout1} label={<span>产品分类</span>}>
                    {getFieldDecorator('category_arr', {
                      rules: [
                        {
                          required: true,
                          message: '请选择分类!',
                        },
                      ],
                    })(
                      infoEdit?
                      (
                        <Cascader options={productCategories} fieldNames={{label: 'name', value:'id'}} placeholder='请选择分类' />
                      ):(
                        <span>{this.state.cate_arr}</span>
                      )
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <FormItem {...formLayout1} label={<span>产品名称</span>}>
                    {getFieldDecorator('title', {
                      rules: [
                        {
                          required: true,
                          message: '请输入产品名称!',
                          whitespace: true,
                        },
                      ],
                    })(infoEdit?<TextArea TextArea autosize={{ minRows: 2, maxRows: 6 }} />:<span>{formData.title}</span>)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>产品尺寸(长X宽X高)</span>}>
                <div>
                  {getFieldDecorator('item_length', {
                    rules: [{ required: false, message: '请输入产品长度!', whitespace: true }],
                  })(infoEdit?<Input style={{ width: '57px', marginRight: 5 }} />:<span>{formData.item_length}</span>)}
                  {formData.item_width||infoEdit?'X':''}
                  {getFieldDecorator('item_width', {
                    rules: [{ required: false, message: '请输入产品宽度!', whitespace: true }],
                  })(infoEdit?<Input style={{ width: '58px', marginRight: 5, marginLeft: 5  }} />:<span>{formData.item_width}</span>)}
                  {formData.item_height||infoEdit?'X':''}
                  {getFieldDecorator('item_height', {
                    rules: [{ required: false, message: '请输入产品高度!', whitespace: true }],
                  })(infoEdit?<Input style={{ width: '58px', marginRight: 5, marginLeft: 5 }} />:<span>{formData.item_height}</span> )}
                  {getFieldDecorator('item_size_unit', {
                    rules: [{ required: true, message: '请选择单位!' }],
                  })(
                    infoEdit?
                      ( 
                        SelectFilter({style:{ width: '90px', marginRight: 5, marginLeft: 5 }, options:sizeUnit})
                      ):<span style={{marginLeft:5}}>{this.handleFilter(sizeUnit,'item_size_unit')}</span>
                  )}
                </div>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>产品重量</span>} >
                {getFieldDecorator('item_weight', {
                  rules: [
                    {
                      required: false,
                      message: '请输入产品重量!',
                      whitespace: true,
                    },
                  ],
                })(infoEdit?<Input style={{ width: '115px' }} />:<span>{formData.item_weight}</span>)}
                {getFieldDecorator('item_weight_unit', {
                  rules: [{ required: false, message: '请输入单位!' }],
                })(
                  infoEdit?
                  (  
                    SelectFilter({style:{ width: '90px', marginRight: 5, marginLeft: 5 },options:weightUnit})                    
                  ):<span style={{marginLeft:5}}>{this.handleFilter(weightUnit,'item_weight_unit')}</span>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>包装数量</span>}>
                {getFieldDecorator('package_quantity', {
                  rules: [
                    {
                      required: false,
                      message: '请输入包装数量!',
                    },
                  ],
                })(infoEdit?<Input type='number' style={{width:204}} />:<span>{formData.package_quantity}</span>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>包装尺寸(长X宽X高)</span>}>
                <div>
                  {getFieldDecorator('package_length', {
                    rules: [{ required: false, message: '请输入包装长度!', whitespace: true }],
                  })(infoEdit?<Input style={{ width: '57px', marginRight: 5 }} />:<span>{formData.package_length}</span>)}
                  {formData.package_width||infoEdit?'X':''}
                  {getFieldDecorator('package_width', {
                    rules: [{ required: false, message: '请输入包装宽度!', whitespace: true }],
                  })(infoEdit?<Input style={{ width: '58px', marginRight: 5, marginLeft: 5  }} />:<span>{formData.package_width}</span>)}
                  {formData.package_height||infoEdit?'X':''}
                  {getFieldDecorator('package_height', {
                    rules: [{ required: false, message: '请输入包装高度!', whitespace: true }],
                  })(infoEdit?<Input style={{ width: '57px', marginRight: 5, marginLeft: 5 }} />:<span>{formData.package_length}</span>)}
                  {getFieldDecorator('package_size_unit', {
                    rules: [{ required: false, message: '请输入单位!' }],
                  })(
                    infoEdit?
                    ( 
                      SelectFilter({style:{ width: '90px', marginRight: 5, marginLeft: 5 },options:sizeUnit})
                    ):<span style={{marginLeft:5}}>{this.handleFilter(sizeUnit,'package_size_unit')}</span>
                  )}
                </div>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>包装重量</span>}>
                {getFieldDecorator('package_weight', {
                  rules: [
                    {
                      required: false,
                      message: '请输入包装重量!',
                      whitespace: true,
                    },
                  ],
                })(infoEdit?<Input style={{ width: '115px' }} />:<span>{formData.package_weight}</span>)}
                {getFieldDecorator('package_weight_unit', {
                  rules: [{ required: false, message: '请输入单位!' }],
                })(
                  infoEdit?
                  (
                    SelectFilter({style:{ width: '90px', marginRight: 5, marginLeft: 5 },options:weightUnit})
                  ):<span style={{marginLeft:5}}>{this.handleFilter(weightUnit,'package_weight_unit')}</span>
                )}
              </FormItem>
            </Col>
            <Col span={8} />
          </Row>
          <div className={styles.moduleTile}>
            <span className={styles.moduleTitleF}>成本价与定价</span>
            {!costEdit?<Button type="primary" style={{float:'right'}} onClick={this.handleClickCost}>编辑</Button>
            : (
              <span style={{float:'right'}}>
                <Button onClick={this.handleCancelCost} style={{height:'28px'}}>取消</Button>
                <Button type="primary"  onClick={this.handleEditCost} style={{marginLeft:14}}>保存</Button>
              </span>
              )
            }
          </div>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>吊牌价</span>}>
                {getFieldDecorator('regular_price', {
                  rules: [
                    {
                      required: false,
                      message: '请输入产品吊牌价!',
                    },
                  ],
                })(costEdit?<InputNumber step={0.01} size="small" style={{ width: '115px' }} />:<span>{formData.regular_price}</span>)}
                {getFieldDecorator('regular_price_currency_code', {
                  rules: [{ required: false, message: '请输入单位!' }],
                  })(
                    costEdit?
                    ( 
                      SelectFilter({style:{ width: '90px', marginRight: 5, marginLeft: 5 },options:poundUnit})
                    ):<span style={{marginLeft:5}}>{this.handleFilter(poundUnit,'regular_price_currency_code')}</span>
                  )
                }
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>成本价</span>}>
                {getFieldDecorator('cost', {
                  rules: [
                    {
                      required: true,
                      message: '请输入成本价!',
                    },
                  ],
                })(costEdit?<InputNumber step={0.01} size="small" style={{ width: '115px' }} />:<span>{formData.cost}</span> )}
                {getFieldDecorator('cost_currency_code', {
                  rules: [{  message: '请选择单位!', whitespace: true}],
                  })(
                    costEdit?
                    (
                      SelectFilter({style:{ width: '90px', marginRight: 5, marginLeft: 5 },options:poundUnit, disabled:true})
                    ):<span style={{marginLeft:5}}>{this.handleFilter(poundUnit,'cost_currency_code')}</span>
                  )
                }
              </FormItem>
            </Col>
            <Col span={8} />
          </Row>
          <div className={styles.moduleTile}>
            <span className={styles.moduleTitleF}>物流与包装</span>
            {!packEdit?<Button type="primary" style={{float:'right'}} onClick={this.handleClickPackage}>编辑</Button>
            : (
              <span style={{float:'right'}}>
                <Button onClick={this.handleCancelPackage} style={{height:'28px'}}>取消</Button>
                <Button type="primary"  onClick={this.handleEditPackage} style={{marginLeft:14}}>保存</Button>
              </span>
              )
            }
          </div>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>报关中文名称</span>}>
                {getFieldDecorator('customs_cn_title', {
                  rules: [
                    {
                      required: true,
                      message: '请输入报关中文名称!',
                      whitespace: true,
                    },
                  ],
                })(packEdit?<Input style={{width:210}} />:<span>{formData.customs_cn_title}</span>)}
              </FormItem>
              <FormItem {...formItemLayout} label={<span>报关进口编码</span>}>
                {getFieldDecorator('import_hscode', {
                  rules: [
                    {
                      required: true,
                      message: '请输入报关进口编编码!',
                      whitespace: true,
                    },
                  ],
                })(packEdit?<Input style={{width:210}} />:<span>{formData.import_hscode}</span>)}
              </FormItem>
              <FormItem {...formItemLayout} label={<span>报关重量</span>}>
                {getFieldDecorator('custorms_weight', {
                  rules: [
                    {
                      required: true,
                      message: '请输入报关报关重量!',
                      whitespace: true,
                    },
                  ],
                })(packEdit?<Input style={{height:26,width:115}} />:<span>{formData.custorms_weight}</span>)}
                {getFieldDecorator('custorms_weight_unit', {
                  rules: [{ required: true, message: '请输入单位!' }],
                  })(
                    packEdit?
                    ( 
                      SelectFilter({style:{ width: '90px', marginRight: 5, marginLeft: 5 },options:weightUnit})
                    ):<span style={{marginLeft:5}}>{this.handleFilter(weightUnit,'custorms_weight_unit')}</span>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label={<span>物流包装尺寸(长X宽X高)</span>}>
                <div>
                  {getFieldDecorator('lenght', {
                    rules: [{ required: true, message: '请输入物流包装长度!', whitespace: true }],
                  })(packEdit?<Input style={{ width: '57px', marginRight: 5 }} />:<span>{formData.lenght}</span>)}
                  {formData.width||packEdit?'X':''}
                  {getFieldDecorator('width', {
                    rules: [{ required: true, message: '请输入物流包装宽度!', whitespace: true }],
                  })(packEdit?<Input style={{ width: '58px', marginRight: 5, marginLeft: 5  }} />:<span>{formData.width}</span>)}
                  {formData.height||packEdit?'X':''}
                  {getFieldDecorator('height', {
                    rules: [{ required: true, message: '请输入物流包装高度!', whitespace: true }],
                  })(packEdit?<Input style={{ width: '58px', marginRight: 5, marginLeft: 5 }} />:<span>{formData.height}</span> )}
                  {getFieldDecorator('size_unit', {
                    rules: [{ required: true, message: '请输入单位!' }],
                  })(
                    packEdit?
                    ( 
                      SelectFilter({style:{ width: '90px', marginRight: 5, marginLeft: 5 },options:sizeUnit})
                    ):<span style={{marginLeft:5}}>{this.handleFilter(sizeUnit,'size_unit')}</span>
                  )}
                </div>
              </FormItem>
              <FormItem {...formItemLayout} label={<span>物流包装产品数量</span>}>
                {getFieldDecorator('item_package_quantity', {
                  rules: [{
                    required: true,
                    message: '请输入物流包装数量!',
                  },
                ],
                })(packEdit?<Input style={{width:210}} />:<span>{formData.item_package_quantity}</span>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>报关英文名称</span>}>
                {getFieldDecorator('custorms_en_title', {
                  rules: [
                    {
                      required: true,
                      message: '请输入报关英文名称!',
                      whitespace: true,
                    },
                  ],
                })(packEdit?<Input  style={{width:210}} />:<span>{formData.custorms_en_title}</span>)}
              </FormItem>
              <FormItem {...formItemLayout} label={<span>报关出口编码</span>}>
                {getFieldDecorator('export_hscode', {
                  rules: [
                    {
                      required: true,
                      message: '请输入报关出口编码!',
                      whitespace: true,
                    },
                  ],
                })(packEdit?<Input style={{width:210}} />:<span>{formData.export_hscode}</span>)}
              </FormItem>
              <FormItem {...formItemLayout} label={<span>物流包装重量</span>}>
                {getFieldDecorator('weight', {
                  rules: [
                    {
                      required: true,
                      message: '请输入物流包装重量!',
                      whitespace: true,
                    },
                  ],
                })(packEdit?<Input style={{height:26,width:115}} />:<span>{formData.weight}</span>)}
                {getFieldDecorator('weight_unit', {
                  rules: [{ required: true, message: '请输入单位!' }],
                  })(
                    packEdit?
                    (
                      SelectFilter({style:{ width: '90px', marginRight: 5, marginLeft: 5 },options:weightUnit})
                    ):<span style={{marginLeft:5}}>{this.handleFilter(weightUnit,'weight_unit')}</span>
                  )
                }
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>报关金额</span>}>
                {getFieldDecorator('custorms_amount', {
                  rules: [
                    {
                      required: true,
                      message: '请输入报关金额!',
                    },
                  ],
                })(packEdit?<InputNumber size="small" />:<span>{formData.custorms_amount}</span>)}
                {getFieldDecorator('custorms_amount_currency_code')(
                    packEdit?
                    ( 
                      SelectFilter({style:{ width: '105px', marginLeft: 5 },options:poundUnit})
                    ):<span style={{marginLeft:5}}>{this.handleFilter(poundUnit,'custorms_amount_currency_code')}</span>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label={<span>危险运输品</span>}>
                {getFieldDecorator('danger_type', {
                  rules: [
                    {
                      required: true,
                      message: '请输入危险运输品!',
                    },
                  ],
                })(
                  packEdit?
                  ( 
                    SelectFilter({style:{ width: '200px' },options:this.state.dangerType})
                  ):(
                    <span>
                      {
                        this.state.danger
                      }
                    </span>
                  )
              )}
              </FormItem>
              <FormItem {...formItemLayout} label={<span>物流允许称重误差</span>}>
                {getFieldDecorator('weight_error', {
                  rules: [
                    {
                      required: true,
                      message: '请输入物流允许称重误差!',
                    },
                  ],
                })(packEdit?<Input style={{width:204}} />:<span>{formData.weight_error}</span>)}
              </FormItem>
            </Col>
          </Row>
          <div className={styles.moduleTile}>
            <span className={styles.moduleTitleF}>采购参数</span>
            {!prodEdit?<Button type="primary" style={{float:'right'}} onClick={this.handleClickProduct}>编辑</Button>
            : (
              <span style={{float:'right'}}>
                <Button onClick={this.handleCancelProduct} style={{height:'28px'}}>取消</Button>
                <Button type="primary"  onClick={this.handleEditProduct} style={{marginLeft:14}}>保存</Button>
              </span>
              )
            }
          </div>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>生产时间</span>}>
                {getFieldDecorator('production_time')(prodEdit?<InputNumber size='small' style={{width:210}} />:<span>{formData.production_time}</span>)}
                <span style={{marginLeft:16}}>{formData.production_time? '日' : ''}</span>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>质检提示时间</span>}>
                {getFieldDecorator('quality_time')(prodEdit?<InputNumber size='small' style={{width:210}} />:<span>{formData.quality_time}</span>)}
                <span style={{marginLeft:16}}>{formData.quality_time? '日' : ''}</span>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>跟单提示时间</span>}>
                {getFieldDecorator('documentary_prompt')(prodEdit?<InputNumber size='small' style={{width:210}} />:<span>{formData.documentary_prompt}</span>)}
                <span style={{marginLeft:16}}>{formData.documentary_prompt? '日' : ''}</span>
              </FormItem>
            </Col>
          </Row>
          <div className={styles.moduleTile}>
            <span className={styles.moduleTitleF}>关联 Listing</span>
          </div>
          <div style={{ margin: '10px auto' }}>
            <Table bordered dataSource={dataSource} columns={columns} />
          </div>
          <div className={styles.moduleTile}>
            <span className={styles.moduleTitleF}>供应商</span>
          </div>
          <div style={{  margin: '20px auto' }}>
            <Table bordered dataSource={supDataSource} columns={supcolumns} />
          </div>
        </Form>
        <ProductImag
          visible={this.state.showImag}
          onAddImag={this.handleAddImag}
          onImgCancle={this.handleCloseImag}
        />
      </div>
    );
  }
}

export default RegistrationForm;
