import React from 'react';
import { Form, Row, Col, Input, Button } from 'antd';
import styles from './index.less';

require('./index.less');

const FormItem = Form.Item;

class AdvancedSearchForm extends React.Component {
  state = {
    basicData: [
      {
        key: 1,
        name: '平台',
        placeholder: '平台',
      },
      {
        key: 2,
        name: '站点',
        placeholder: '站点',
      },
      {
        key: 3,
        name: '店铺名称',
        placeholder: '店铺名称',
      },
      {
        key: 4,
        name: '店铺类型',
        placeholder: '店铺类型',
      },
      {
        key: 5,
        name: '所属公司',
        placeholder: '所属公司',
      },
    ],
    accreditData: [
      {
        key: 6,
        name: 'AWS Access Key ID',
        placeholder: 'AWS Access Key ID',
      },
      {
        key: 7,
        name: 'Mws token ID',
        placeholder: 'Mws token ID',
      },
      {
        key: 8,
        name: 'Seller ID',
        placeholder: 'Seller ID',
      },
      {
        key: 9,
        name: 'Secrect Key',
        placeholder: 'Secrect Key',
      },
    ],
  };

  // To generate mock Form.Item
  getFields(data) {
    // const count = this.state.expand ? 10 : 6;
    const { getFieldDecorator } = this.props.form;
    const children = [];
    data.map((item, index) => {
      children.push(
        <Col span={12} key={item.key} style={{ display: index < data.length ? 'block' : 'none' }}>
          <FormItem label={`${item.name}`}>
            {getFieldDecorator(`field-${item.key}`, {
              rules: [
                {
                  required: true,
                  message: 'Input something!',
                },
              ],
            })(<Input placeholder={item.placeholder} />)}
          </FormItem>
        </Col>
      );
      return children;
    });
    return children;
  }
  handleSearch = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
    });
  };

  handleReset = () => {
    this.props.form.resetFields();
  };

  render() {
    return (
      <Form className={styles.formList} onSubmit={this.handleSearch}>
        <p className={styles.title}>店铺基本信息</p>
        <div className={styles.content}>
          <Row gutter={24}>{this.getFields(this.state.basicData)}</Row>
        </div>
        <p className={styles.title}>授权信息</p>
        <div className={styles.content}>
          <Row gutter={24}>{this.getFields(this.state.accreditData)}</Row>
        </div>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit">
              Search
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
              Clear
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default AdvancedSearchForm;
