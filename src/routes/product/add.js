import React from 'react';
import {
  Input,
  Form,
  Button,
  message,
  Row,
  Col,
  Cascader,
  Select,
  Popover,
  Icon,
} from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './product.less';
import ProductClone from './ProductClone';
import GoodsClone from './GoodsClone';
import ProductImag from './ProductImag';

const { Option } = Select;

require('../FormStyle.less');

const FormItem = Form.Item;
const { TextArea } = Input;

@Form.create()
class NewProduct extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl:'',
      sizeUnit: [],
      weightUnit: [],
      poundUnit: [],
      showPro: false,
      showGood: false,
      showImag: false,
      productCategories:[],
      dangerType: [
        {
          value: '0',
          label:'非危险品',
        },{
          value: '1',
          label:'内置电池',
        },{
          value: '2',
          label:'纯电池',
        },{
          value: '3',
          label:'液体',
        },{
          value: '4',
          label:'粉末',
        },
      ],
      formData: {},
      profix: 'PROD',
    };
  }
  componentDidMount() {
    this.handleGetUnitCode();
    this.handleFliex()
  }
  
  componentWillUnmount(){
    this.props.onAddRefreshKey('product/index');
  }
  
  // 获取字段字典的单位
  handleGetUnitCode = () => {
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
  
  // 基于产品克隆
  handleClone = (item) => {
    erpPost('/product/detail', { product_id: item }, res => {
      if(res.data.data.product_logistics&&res.data.data.product_logistics.package_quantity){
        res.data.data.product_logistics.wuliu_package_quantity = res.data.data.product_logistics&&res.data.data.product_logistics.package_quantity;
      }
      res.data.data.base.category_id = res.data.data.base&&res.data.data.base.category_arr || [];
      if(res.data.data.product_logistics&&res.data.data.product_logistics.package_quantity){
        delete res.data.data.product_logistics.package_quantity;
      }
      const formData = Object.assign({}, res.data.data.base, res.data.data.price, res.data.data.supplierParams, res.data.data.product_logistics);
      this.setState({
        imageUrl:formData.image_url,
        formData,
      })
      this.props.form.setFieldsValue(formData);
    });
  }
  
  // 显示产品模态框
  handleShowPro = () => {
    this.setState({showPro: true})
  }

  handleClosePro = () => {
    this.setState({showPro: false})
  }
  
  // 全局配置获取列表（获取前缀）
  handleFliex = () => {
    erpPost('config/index', {}, res => {
        const { data } = res.data;
        this.setState({
          profix: data&&data.oddRule&&data.oddRule[0]&&data.oddRule[0].prefix,
        })
      }
    )
  }

  handleCancle = () => {
    const {formData} = this.state;
    const newData = formData;
    for(const x in newData) {
      if(x!=='cost_currency_code'){
        newData[x] = '';
      }      
    }
    this.setState({
      imageUrl:'',
    })
    this.props.form.setFieldsValue(newData);
    this.setState({showPro: false})
  }

  // 显示商品模态框
  handleShowGood = () => {
    this.setState({showGood: true})
  }
  
  handleCloseGood = () => {
    this.setState({showGood: false})
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
  handleImgCancle = () => {
    this.setState({
      showImag: false,
    })
  }
  
  handleDelete = () => {
    this.setState({
      imageUrl: '',
    })
  }

  handleSubmitForm = e => {
    const { profix } = this.state;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      const data = {
        product: {
          product_no:profix+values.product_no,
          product_sku:values.product_sku,
          category_id:values.category_id&&values.category_id[values.category_id.length-1],
          title:values.title,
          image_url: this.state.imageUrl,
          regular_price:Number(values.regular_price) || null,
          regular_price_currency_code:values.regular_price_currency_code,
          cost:Number(values.cost),
          cost_currency_code:values.cost_currency_code,
          item_size_unit: values.item_size_unit,
          item_height: Number(values.item_height) || null,

          item_length: Number(values.item_length) || null,
          item_width: Number(values.item_width) || null,
          item_weight_unit: values.item_weight_unit,
          item_weight: Number(values.item_weight),
          package_size_unit: values.package_size_unit,
          package_height: Number(values.package_height) || null,

          package_length: Number(values.package_length) || null,
          package_width: Number(values.package_width) || null,
          package_weight_unit: values.package_weight_unit,
          package_weight: Number(values.package_weight) || null,
          package_quantity: Number(values.package_quantity) || null,
          production_time: Number(values.production_time) || null,
          quality_time: Number(values.quality_time) || null,
          documentary_prompt: Number(values.documentary_prompt) || null,
        },
        logistics: {
          size_unit:values.size_unit,
          height: Number(values.height),
          lenght: Number(values.lenght),
          width: Number(values.width),
          weight_unit:values.weight_unit,
          weight: Number(values.weight),
          weight_error: Number(values.weight_error),
          package_quantity: Number(values.wuliu_package_quantity),
          customs_cn_title:values.customs_cn_title,
          custorms_en_title:values.custorms_en_title,
          custorms_weight:Number(values.custorms_weight),
          custorms_weight_unit:values.custorms_weight_unit,
          custorms_amount:Number(values.custorms_amount),
          custorms_amount_currency_code:values.custorms_amount_currency_code,
          danger_type:values.danger_type,
          import_hscode:values.import_hscode,
          export_hscode:values.export_hscode,
        },
      }
      const { handleRemove, activeKey, params } = this.props;
      erpPost('/product/add', data, res => {
        if(params){
          handleRemove(activeKey)
        }
        message.success(res.data.msg);
      });
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
    const formLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    
    const { sizeUnit, weightUnit, poundUnit, profix, productCategories } = this.state;
    const { imageUrl } = this.state;
    return (
      <div>
        <Form onSubmit={this.handleSubmitForm} className="proDataWrap" style={{ textAlign: 'left' }}>
          <div className={styles.moduleTile}>
            <span className={styles.moduleTitleF}>基本信息</span>
            {/* <Button type="primary" style={{float:'right',marginLeft:'10px'}} onClick={this.handleShowGood}>基于商品克隆</Button> */}
            <Button type="primary" style={{float:'right'}} onClick={this.handleShowPro}>基于产品克隆</Button>
          </div>
          <Row>
            <Col span={8}>
              <FormItem 
                {...formItemLayout} 
                label="产品图片" 
                extra={
                  imageUrl?(<Button  type='primary' onClick={this.handleDelete} style={{marginLeft:20, backgroundColor:'red', borderColor:'red'}}>删除</Button>)
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
                    })(<span><span>{profix}</span><Input style={{width:157, marginRight:10,marginLeft:10}} /></span>)}
                    <Popover  placement="top" content={<div>产品ID格式为：PROD后面加8个数字</div>}>
                      <Icon type="question-circle" theme="outlined" />
                    </Popover>
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...formItemLayout} label={<span>SKU</span>}>
                    {getFieldDecorator('product_sku', {
                      rules: [{ required: true, message: '请输入产品SKU!', whitespace: true }],
                    })(<Input className="InputW200"  />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <FormItem {...formLayout} label='产品分类'>
                    {getFieldDecorator('category_id', {
                      rules: [
                        { 
                          required: true, 
                          message: '请选择产品分类!',
                        },
                      ],
                    })(
                      <Cascader options={productCategories} fieldNames={{label: 'name', value:'id'}}  placeholder='请选择产品分类' />                  
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <FormItem {...formLayout} label='产品名称'>
                    {getFieldDecorator('title', {
                      rules: [
                        {
                          required: true, 
                          message: '请输入产品名称!', 
                          whitespace: true,
                        },
                      ],
                    })(<TextArea  autosize={{ minRows: 2, maxRows: 6 }} />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>产品尺寸</span>}>
                <div>
                  {getFieldDecorator('item_length', {
                    rules:[
                      {
                        pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                        message: '请输入正确的尺寸',
                      }],
                    })(<Input style={{ width: '57px', marginRight: 5 }} />)}
                  X
                  {getFieldDecorator('item_width', {
                    rules:[
                      {
                        pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                        message: '请输入正确的尺寸',
                      }],
                    })(<Input style={{ width: '58px', marginRight: 5, marginLeft: 5  }} />)}
                  X
                  {getFieldDecorator('item_height', {
                    rules:[
                      {
                        pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                        message: '请输入正确的尺寸',
                      }],
                    })(<Input style={{ width: '57px', marginRight: 5, marginLeft: 5 }} /> )}  
                  {getFieldDecorator('item_size_unit', {
                    rules: [{ required: true, message: '请选择单位!' }],
                    initialValue: 151,
                  })(
                    <Select 
                      style={{ width: '90px', marginRight: 5, marginLeft: 5 }} 
                      showSearch
                      optionFilterProp='children'
                    >
                      {
                        sizeUnit.map(size=>{
                          return (<Option value={size.id} key={size.id}>{size.remark}</Option>)
                        })
                      }
                    </Select>
                  )}                                   
                </div>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>产品重量</span>} >
                {getFieldDecorator('item_weight', {
                  rules:[
                    {
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                      message: '请输入正确的重量',
                    }],
                  })(<Input style={{ width: '110px' }} />)}
                {getFieldDecorator('item_weight_unit', {
                  initialValue: 162,
                })(
                  <Select 
                    style={{ width: '90px', marginRight: 5, marginLeft: 5 }} 
                    showSearch
                    optionFilterProp='children'
                  >
                    {
                      weightUnit.map(size=>{
                        return (<Option value={size.id} key={size.id}>{size.remark}</Option>)
                      })
                    }
                  </Select>
                )} 
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>包装数量</span>}>
                {getFieldDecorator('package_quantity', {
                  rules:[
                    {
                      pattern: new RegExp(/^\d+$/, "g"),
                      message: '请输入正确的包装数量',
                    }],
                  })(<Input className="InputW200" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>包装尺寸</span>}>
                <div>
                  {getFieldDecorator('package_length', {
                    rules:[
                      {
                        pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                        message: '请输入正确的包装尺寸',
                      }],
                    })(<Input style={{ width: '57px', marginRight: 5 }} />)}
                  X
                  {getFieldDecorator('package_width', {
                    rules:[
                      {
                        pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                        message: '请输入正确的包装尺寸',
                      }],
                    })(<Input style={{ width: '58px', marginRight: 5, marginLeft: 5  }} />)}
                  X
                  {getFieldDecorator('package_height', {
                    rules:[
                      {
                        pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                        message: '请输入正确的包装尺寸',
                      }],
                    })(<Input style={{ width: '57px', marginRight: 5, marginLeft: 5 }} /> )}                 
                  {getFieldDecorator('package_size_unit', {
                    rules: [{ message: '请选择单位!' }],
                    initialValue: 151,
                  })(
                    <Select 
                      style={{ width: '90px', marginRight: 5, marginLeft: 5 }} 
                      showSearch
                      optionFilterProp='children'
                    >
                      {
                        sizeUnit.map(size=>{
                          return (<Option value={size.id} key={size.id}>{size.remark}</Option>)
                        })
                      }
                    </Select>
                  )} 
                </div>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>包装重量</span>}>
                {getFieldDecorator('package_weight', {
                  rules:[
                    {
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                      message: '请输入正确的包装重量',
                    }],
                  })(<Input style={{ width: '110px' }} />)}
                {getFieldDecorator('package_weight_unit', {
                  initialValue: 162,
                })(
                  <Select 
                    style={{ width: '90px', marginRight: 5, marginLeft: 5 }} 
                    showSearch
                    optionFilterProp='children'
                  >
                    {
                      weightUnit.map(size=>{
                        return (<Option value={size.id} key={size.id}>{size.remark}</Option>)
                      })
                    }
                  </Select>
                )} 
              </FormItem>
            </Col>
            <Col span={8} />
          </Row>
          <div className={styles.moduleTile}>
            <span className={styles.moduleTitleF}>成本价与定价</span>
          </div>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>吊牌价</span>}>
                {getFieldDecorator('regular_price', {
                  rules:[
                    {
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                      message: '请输入正确的吊牌价',
                    }],
                  })(<Input size="small" style={{ width: '116px' }} />)}
                {getFieldDecorator('regular_price_currency_code', {
                  rules: [{  message: '请选择单位!', whitespace: true}],
                  initialValue: 123,
                  })(
                    <Select 
                      size='large' 
                      style={{ width: '90px', marginLeft: 5 }} 
                      showSearch
                      optionFilterProp='children'
                    >
                      {
                        poundUnit.map(size=>{
                          return (<Option value={size.id} key={size.id}>{size.remark}</Option>)
                        })
                      }
                    </Select>
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
                      whitespace: true,
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                    },
                  ],
                })(<Input style={{ width: '116px' }} />)}
                {getFieldDecorator('cost_currency_code', {
                  initialValue: 133,
                  })(
                    <Select 
                      size='large' 
                      style={{ width: '90px', marginLeft: 5 }} 
                      disabled='true' 
                      showSearch
                      optionFilterProp='children'
                    >
                      {
                        poundUnit.map(size=>{
                          return (<Option value={size.id} key={size.id}>{size.remark}</Option>)
                        })
                      }
                    </Select>
                  )
                } 
              </FormItem>
            </Col>
            <Col span={8} />
          </Row>         
          <div className={styles.moduleTile}>
            <span className={styles.moduleTitleF}>物流与包装</span>
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
                })(<Input style={{width:210}} />)}
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
                })(<Input style={{width:210}} />)}
              </FormItem>    
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>报关金额</span>}>
                {getFieldDecorator('custorms_amount', {
                  rules: [
                    { 
                      required: true, 
                      message: '请输入报关金额!',
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                      whitespace: true,
                    },
                  ],
                })(<Input size="small"  style={{width:110}} />)}
                {getFieldDecorator('custorms_amount_currency_code', {
                  rules: [{ required: true }],
                  initialValue: 133,
                  })(
                    <Select 
                      style={{ width: '90px',  marginLeft: 5 }} 
                      showSearch
                      optionFilterProp='children'
                    >
                      {
                        poundUnit.map(size=>{
                          return (<Option value={size.id} key={size.id} >{size.remark}</Option>)
                        })
                      }
                    </Select>
                  )
                } 
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>报关进口编码</span>}>
                {getFieldDecorator('import_hscode', {
                  rules: [
                    { 
                      required: true, 
                      message: '请输入报关进口编编码!',
                      whitespace: true,
                    },
                  ],
                })(<Input style={{width:210}}  />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>报关出口编码</span>}>
                {getFieldDecorator('export_hscode', {
                  rules: [
                    { 
                      required: true, 
                      message: '请输入报关出口编码!', 
                      whitespace: true,
                    },
                  ],
                })(<Input style={{width:210}} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>危险运输品</span>}>
                {getFieldDecorator('danger_type', {
                  rules: [
                    { 
                      required: true, 
                      message: '请输入危险运输品!',
                    },
                  ],
                })(
                  <Select 
                    style={{width:204}} 
                    showSearch
                    optionFilterProp='children'
                  >
                    {
                      this.state.dangerType.map(size=>{
                        return (<Option value={size.value} key={size.value} >{size.label}</Option>)
                      })
                    }
                  </Select>
              )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>报关重量</span>}>
                {getFieldDecorator('custorms_weight', {
                  rules: [
                    { 
                      required: true, 
                      message: '请输入报关重量!',
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                      whitespace: true, 
                    },
                  ],
                })(<Input style={{height:26, width:'116px'}} />)}
                {getFieldDecorator('custorms_weight_unit', {
                  rules: [{ required: true, message: '请输入单位!' }],
                  initialValue: 162,
                  })(
                    <Select 
                      style={{ width: '90px', marginLeft: 5 }} 
                      showSearch
                      optionFilterProp='children'
                    >
                      {
                        weightUnit.map(size=>{
                          return (<Option value={size.id} key={size.id}>{size.remark}</Option>)
                        })
                      }
                    </Select>
                  )
                } 
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>物流包装产品数量</span>}>
                {getFieldDecorator('wuliu_package_quantity', {
                  rules: [{ 
                    required: true, 
                    message: '请输入物流包装数量!',
                    pattern: new RegExp(/^\d+$/, "g"),
                  },
                ],
                })(<Input  style={{width:210}} />)}
              </FormItem>
            </Col>
            <Col span={8} >
              <FormItem {...formItemLayout} label={<span>物流允许称重误差</span>}>
                {getFieldDecorator('weight_error', {
                  rules: [
                    { 
                      required: true, 
                      message: '请输入物流允许称重误差!', 
                      whitespace: true,
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                    },
                  ],
                })(<Input style={{width:204}} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>物流包装尺寸</span>}>
                <div>
                  {getFieldDecorator('lenght', {
                    rules: [{ required: true, message: '请输入物流包装长度!',whitespace: true, pattern: new RegExp(/^\d*\.?\d+$/, "g")}],
                  })(<Input style={{ width: '57px', marginRight: 5 }} />)}
                  X
                  {getFieldDecorator('width', {
                    rules: [{ required: true, message: '请输入物流包装宽度!',whitespace: true, pattern: new RegExp(/^\d*\.?\d+$/, "g") }],
                  })(<Input style={{ width: '58px', marginRight: 5, marginLeft: 5  }} />)}
                  X
                  {getFieldDecorator('height', {
                    rules: [{ required: true, message: '请输入物流包装高度!',whitespace: true, pattern: new RegExp(/^\d*\.?\d+$/, "g") }],
                  })(<Input style={{ width: '57px', marginRight: 5, marginLeft: 5 }} /> )}                 
                  {getFieldDecorator('size_unit', {
                    rules: [{ required: true, message: '请选择单位!' }],
                    initialValue: 151,
                  })(
                    <Select 
                      style={{ width: '90px', marginRight: 5, marginLeft: 5 }} 
                      showSearch
                      optionFilterProp='children'
                    >
                      {
                        sizeUnit.map(size=>{
                          return (<Option value={size.id} key={size.id}>{size.remark}</Option>)
                        })
                      }
                    </Select>
                  )} 
                </div>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>物流包装重量</span>}>
                {getFieldDecorator('weight', {
                  rules: [
                    { 
                      required: true, 
                      message: '请输入物流包装重量!', 
                      whitespace: true,
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                    },
                  ],
                })(<Input style={{height:26,width:116}} />)}
                {getFieldDecorator('weight_unit', {
                  rules: [{ required: true, message: '请选择单位!' }],
                  initialValue: 162,
                  })(
                    <Select 
                      style={{ width: '90px', marginLeft: 5 }} 
                      showSearch
                      optionFilterProp='children'
                    >
                      {
                        weightUnit.map(size=>{
                          return (<Option value={size.id} key={size.id}>{size.remark}</Option>)
                        })
                      }
                    </Select>
                  )
                } 
              </FormItem>
            </Col>
            <Col span={8} />
          </Row>
          <div className={styles.moduleTile}>
            <span className={styles.moduleTitleF}>采购参数</span>
          </div>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>生产时间</span>}>
                {getFieldDecorator('production_time',{
                  rules:[
                    {
                      pattern: new RegExp(/^\d+$/, "g"),
                      message: '请输入正确的生产时间',
                    },
                  ],
                })(<Input style={{width:210}} />)}
                <span style={{marginLeft:16}}>日</span>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>质检提示时间</span>}>
                {getFieldDecorator('quality_time',{
                  rules:[
                    {
                      pattern: new RegExp(/^\d+$/, "g"),
                      message: '请输入正确的质检提示时间',
                    },
                  ],
                })(<Input style={{width:210}} />)}
                <span style={{marginLeft:16}}>日</span>
              </FormItem>             
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>跟单提示时间</span>}>
                {getFieldDecorator('documentary_prompt',{
                  rules:[
                    {
                      pattern: new RegExp(/^\d+$/, "g"),
                      message: '请输入正确的跟单提示时间',
                    },
                  ],
                })(<Input style={{width:204}} />)}
                <span style={{marginLeft:16}}>日</span>
              </FormItem>            
            </Col>
          </Row>          
          <div style={{textAlign:'center'}}>
            <Button>取消</Button>
            <Button type='primary' style={{marginLeft:'20px'}} onClick={this.handleSubmitForm}>保存</Button>
          </div>   
        </Form>
        <ProductClone
          visible={this.state.showPro}
          onClosePro={this.handleClosePro}
          onCancle={this.handleCancle}
          onClone={this.handleClone}
        />
        <GoodsClone
          visible={this.state.showGood}
          onCloseGood={this.handleCloseGood}
          onClone={this.handleClone}
        />
        <ProductImag
          visible={this.state.showImag}
          onAddImag={this.handleAddImag}
          onImgCancle={this.handleImgCancle}
        />
      </div>
    );
  }
}

export default NewProduct;
