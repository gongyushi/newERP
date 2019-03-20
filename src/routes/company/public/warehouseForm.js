import React from 'react';
import { Form, Input, Cascader, Select, Button, message } from 'antd';
import { erpPost } from '../../../services/ajax';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

class RegistrationForm extends React.Component {
  state = {
    // confirmDirty: false,
    residences: [
      {
        value: 'zhejiang122',
        label: 'Zhejiang',
        children: [
          {
            value: 'hangzhou',
            label: 'Hangzhou',
            children: [
              {
                value: 'xihu',
                label: 'West Lake',
              },
            ],
          },
        ],
      },
      {
        value: 'jiangsu',
        label: 'Jiangsu',
        children: [
          {
            value: 'nanjing',
            label: 'Nanjing',
            children: [
              {
                value: 'zhonghuamen',
                label: 'Zhong Hua Men',
              },
            ],
          },
        ],
      },
    ],
  };
  componentWillMount() {}
  componentDidMount() {}
  componentWillReceiveProps(val) {
  }
  // 保存提交
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        erpPost('warehouse/add', values, res => {
          message.success(res.data.msg);
        });
      }
    });
  };
  // handleConfirmBlur = e => {
  //   const { value } = e.target;
  //   this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  // };
  // compareToFirstPassword = (rule, value, callback) => {
  //   const { form } = this.props;
  //   if (value && value !== form.getFieldValue('password')) {
  //     callback('Two passwords that you enter is inconsistent!');
  //   } else {
  //     callback();
  //   }
  // };
  // validateToNextPassword = (rule, value, callback) => {
  //   const { form } = this.props;
  //   if (value && this.state.confirmDirty) {
  //     form.validateFields(['confirm'], { force: true });
  //   }
  //   callback();
  // };
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
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
    const prefixSelector = getFieldDecorator('prefix', {
      initialValue: '86',
    })(
      <Select 
        style={{ width: 70 }}
        showSearch
        optionFilterProp='children'
      >
        <Option value="86">+86</Option>
        <Option value="87">+87</Option>
      </Select>
    );

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label="仓库名称">
          {getFieldDecorator('wh_name', {
            rules: [
              {
                required: true,
                message: '请输入仓库名称!',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="负责人">
          {getFieldDecorator('person', {
            rules: [
              {
                required: true,
                message: '请输入所属负责人!',
              },
              {
                validator: this.validateToNextPassword,
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="联系电话">
          {getFieldDecorator('phone', {
            rules: [{ required: true, message: '请输入联系电话!' }],
          })(<Input addonBefore={prefixSelector} style={{ width: '100%' }} />)}
        </FormItem>
        <FormItem {...formItemLayout} label="所在地区">
          {getFieldDecorator('residence', {
            initialValue: ['zhejiang', 'hangzhou', 'xihu'],
            rules: [{ type: 'array', required: true, message: '请选择所在地区！' }],
          })(<Cascader options={this.state.residences} />)}
        </FormItem>
        <FormItem {...formItemLayout} label="地址">
          {getFieldDecorator('address', {
            rules: [
              {
                required: true,
                message: '请输入地址!',
              },
              {
                validator: this.validateToNextPassword,
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="备注">
          {getFieldDecorator('remark', {
            rules: [
              {
                required: true,
                message: '请填写备注!',
              },
              {
                validator: this.validateToNextPassword,
              },
            ],
          })(<TextArea placeholder="请填写备注!" autosize={{ minRows: 2, maxRows: 6 }} />)}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            确定
          </Button>
        </FormItem>
      </Form>
    );
  }
}
const WarehouseForm = Form.create()(RegistrationForm);

export default WarehouseForm;
