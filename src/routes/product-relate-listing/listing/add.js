import React from 'react';
import {
  Input,
  Form,
  Button,
  Row,
  Col,
  Cascader,
  Select,
  Icon,
  Popover,
} from 'antd';
import { erpPost } from '../../../services/ajax';
import styles from './index.less';
import ProductImag from './productImage';

const { Option } = Select;

require('../../FormStyle.less');

const FormItem = Form.Item;
const { TextArea } = Input;

@Form.create()
class CreateProduct extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: '',
      sizeUnit: [],
      weightUnit: [],
      poundUnit: [],
      showImag: false,
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
      saved: false,
      productCategories:[],
    };
  }
  componentDidMount() {
    this.handleUnitCode();
    this.refresh();
  }

  componentWillUnmount(){
    this.props.onAddRefreshKey('product-relate-listing/listing/index');
  }
  
  // 产品的列表
  refresh = () => {
    const { params } = this.props;
    const can={
      type: 'id',
      content: params.Get('id', ''),
    };
    erpPost('/listing/index', can, res => {
      const formData = Object.assign({},...res.data.data)
      this.setState({imageUrl:formData.image_url})
      this.props.form.setFieldsValue(...res.data.data);
    });
  };

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

  handleSubmitForm = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      const data = {
        product: {
          product_no:values.product_no,
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
      erpPost('/product/add', data, () => {
        this.setState({saved:true})
        if(params){
          handleRemove(activeKey)
        }
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
    const { sizeUnit, weightUnit, poundUnit, productCategories } = this.state;
    const { imageUrl } = this.state;
    return (
      <div>
        <Form onSubmit={this.handleSubmitForm} className="proDataWrap" style={{ textAlign: 'left' }}>
          <div className={styles.moduleTile}>
            <span className={styles.moduleTitleF}>基本信息</span>
          </div>
          <Row>
            <Col span={8}>
              <FormItem 
                {...formItemLayout} 
                label="产品图片" 
                extra={
                  <Button type='primary' onClick={this.handleShowImag} style={{ marginLeft:20 }}>选择</Button>
                }
              >
                {getFieldDecorator('image_url')(
                  <div>
                    {imageUrl ? (
                      <img src={imageUrl} style={{ width: 100, height: 100 }} alt="" />
                    ) : (
                      <img src='http://dolphierp.axure.cn/images/%E4%BA%A7%E5%93%81%E8%AF%A6%E6%83%85/u2763.png' style={{ width: 100, height: 100 }} alt="" />
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
                    })(<Input style={{width:200, marginRight:10}}  defaultValue="0571" />)}
                    <Popover  placement="top" content={<div>产品ID格式为：PROD后面加8个数字</div>}>
                      <Icon type="question-circle" theme="outlined" />
                    </Popover>
                  </FormItem>                
                </Col>
                <Col span={12}>
                  <FormItem {...formItemLayout} label={<span>SKU</span>}>
                    {getFieldDecorator('product_sku', {
                      rules: [{ required: true, message: '请输入产品SKU!', whitespace: true }],
                    })(<Input className="InputW200" />)}
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
                      <Cascader options={productCategories} fieldNames={{label: 'name', value:'id'}} placeholder='请选择产品分类' />                  
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={24} >
                  <FormItem {...formLayout} label='产品名称'>
                    {getFieldDecorator('title', {
                      rules: [
                        {
                          required: true, 
                          message: '请输入产品名称!', 
                          whitespace: true,
                        },
                      ],
                    })(<TextArea  TextArea autosize={{ minRows: 2, maxRows: 6 }}   rows={4} />)}
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
                    })(<Input style={{ width: '57px', marginRight: 5 }} />)
                  }
                  X
                  {getFieldDecorator('item_width', {
                    rules:[
                      {
                        pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                        message: '请输入正确的尺寸',
                      }],
                    })(<Input style={{ width: '58px', marginRight: 5, marginLeft: 5  }} />)
                  }
                  X
                  {getFieldDecorator('item_height', {
                    rules:[
                      {
                        pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                        message: '请输入正确的尺寸',
                      }],
                    })(<Input style={{ width: '57px', marginRight: 5, marginLeft: 5 }} /> )
                  }  
                  {getFieldDecorator('item_size_unit', {
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
                  })(<Input style={{ width: '115px' }} />)}
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
                  })(<Input type='number'  className="InputW200" />)}
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
                  })(<Input style={{ width: '115px' }} />)}
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
                  })(<Input size="small"  style={{ width: '115px' }} />)}
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
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                      whitespace: true,
                    },
                  ],
                })(<Input style={{ width: '115px' }} />)}
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
                      message: '请输入报关中文名称', 
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
                      message: '请输入报关英文名称', 
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
                })(<Input size="small" style={{width:110}} />)}
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
                })(<Input style={{width:210}} />)}
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
                })(<Input style={{height:26, width:115}} />)}
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
            <Col span={8}>
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
                })(<Input  style={{width:204}} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label={<span>物流包装尺寸</span>}>
                <div>
                  {getFieldDecorator('lenght', {
                    rules: [{ 
                      required: true, 
                      message: '请输入物流包装长度!',
                      whitespace: true,
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                    }],
                  })(<Input style={{ width: '57px', marginRight: 5 }} />)}
                  X
                  {getFieldDecorator('width', {
                    rules: [{ 
                      required: true, 
                      message: '请输入物流包装宽度!',
                      whitespace: true,
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                    }],
                  })(<Input style={{ width: '58px', marginRight: 5, marginLeft: 5  }} />)}
                  X
                  {getFieldDecorator('height', {
                    rules: [{ 
                      required: true, 
                      message: '请输入物流包装高度!',
                      whitespace: true,
                      pattern: new RegExp(/^\d*\.?\d+$/, "g"),
                    }],
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
                })(<Input style={{height:26,width:115}} />)}
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
                })(<Input  style={{width:210}} />)}
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
                })(<Input  style={{width:210}} />)}
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
                })(<Input  style={{width:204}} />)}
                <span style={{marginLeft:16}}>日</span>
              </FormItem>            
            </Col>
          </Row> 
          <div style={{textAlign:'center'}}>
            <Button>取消</Button>
            <Button type='primary' style={{marginLeft:'20px'}} onClick={this.handleSubmitForm} disabled={this.state.saved}>保存</Button>
          </div>   
        </Form>
        <ProductImag
          visible={this.state.showImag}
          handleAddImag={this.handleAddImag}
          handleImgCancle={this.handleImgCancle}
        />
      </div>
    );
  }
}

export default CreateProduct;
