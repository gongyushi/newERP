import React from 'react';
import { Table, Tabs, Form, Button, Modal, Select, Row, Col, Input } from 'antd';
// import { erpPost } from '../../services/ajax';
import SearchBar from '../../components/SearchBar';

require('../ListStyle.less');

const { TabPane } = Tabs;
const FormItem = Form.Item;
const { Option } = Select;
/* 把from添加天props里 */

@Form.create()
class LogisticsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [
        // {
        //   key: '1',
        //   appointNum: 'BH32-49-923-094',
        //   replenishmentNum: 'BH32-49-923-094',
        //   ProductImg: '图片',
        //   productInfo: '索尼相机',
        //   SKU: 'ABC-125',
        //   suttle: '200g/200g',
        //   volume: '10*20*30',
        //   productValue: '25.00',
        //   freight: '25.00',
        //   state: '已委派',
        //   operation: '查看物流',
        // },
        // {
        //   key: '2',
        //   appointNum: 'BH32-49-923-094',
        //   replenishmentNum: 'BH32-49-923-094',
        //   ProductImg: '图片',
        //   productInfo: '索尼相机',
        //   SKU: 'ABC-125',
        //   suttle: '200g/200g',
        //   volume: '10*20*30',
        //   productValue: '25.00',
        //   freight: '25.00',
        //   state: '已委派',
        //   operation: '查看物流',
        // },
        // {
        //   key: '3',
        //   appointNum: 'BH32-49-923-094',
        //   replenishmentNum: 'BH32-49-923-094',
        //   ProductImg: '图片',
        //   productInfo: '索尼相机',
        //   SKU: 'ABC-125',
        //   suttle: '200g/200g',
        //   volume: '10*20*30',
        //   productValue: '25.00',
        //   freight: '25.00',
        //   state: '已委派',
        //   operation: '查看物流',
        // },
        // {
        //   key: '4',
        //   appointNum: 'BH32-49-923-094',
        //   replenishmentNum: 'BH32-49-923-094',
        //   ProductImg: '图片',
        //   productInfo: '索尼相机',
        //   SKU: 'ABC-125',
        //   suttle: '200g/200g',
        //   volume: '10*20*30',
        //   productValue: '25.00',
        //   freight: '25.00',
        //   state: '已委派',
        //   operation: '查看物流',
        // },
        // {
        //   key: '5',
        //   appointNum: 'BH32-49-923-094',
        //   replenishmentNum: 'BH32-49-923-094',
        //   ProductImg: '图片',
        //   productInfo: '索尼相机',
        //   SKU: 'ABC-125',
        //   suttle: '200g/200g',
        //   volume: '10*20*30',
        //   productValue: '25.00',
        //   freight: '25.00',
        //   state: '已委派',
        //   operation: '查看物流',
        // },
        // {
        //   key: '6',
        //   appointNum: 'BH32-49-923-094',
        //   replenishmentNum: 'BH32-49-923-094',
        //   ProductImg: '图片',
        //   productInfo: '索尼相机',
        //   SKU: 'ABC-125',
        //   suttle: '200g/200g',
        //   volume: '10*20*30',
        //   productValue: '25.00',
        //   freight: '25.00',
        //   state: '已委派',
        //   operation: '查看物流',
        // },
        // {
        //   key: '7',
        //   appointNum: 'BH32-49-923-094',
        //   replenishmentNum: 'BH32-49-923-094',
        //   ProductImg: '图片',
        //   productInfo: '索尼相机',
        //   SKU: 'ABC-125',
        //   suttle: '200g/200g',
        //   volume: '10*20*30',
        //   productValue: '25.00',
        //   freight: '25.00',
        //   state: '已委派',
        //   operation: '查看物流',
        // },
      ],
      columns: [
        {
          title: '委派单号',
          dataIndex: 'appointNum',
          key: 'appointNum',
        },
        {
          title: '补货需求单号',
          dataIndex: 'replenishmentNum',
          key: 'replenishmentNum',
        },
        {
          title: '产品图片',
          dataIndex: 'ProductImg',
          key: 'ProductImg',
          render: () => (
            <img
              src={require('../../assets/2.jpg')}
              alt="商品图片"
              style={{ width: '50px', border: '1px solid #dcdcdc' }}
            />
          ),
        },
        {
          title: '产品信息',
          dataIndex: 'productInfo',
          key: 'productInfo',
        },
        {
          title: 'SKU',
          dataIndex: 'SKU',
          key: 'SKU',
        },
        {
          title: '净重/毛重',
          dataIndex: 'suttle',
          key: 'suttle',
        },
        {
          title: '体积(cm)',
          dataIndex: 'volume',
          key: 'volume',
        },
        {
          title: '货值(￥)',
          dataIndex: 'productValue',
          key: 'productValue',
        },
        {
          title: '运费(￥)',
          dataIndex: 'freight',
          key: 'freight',
        },
        {
          title: '状态',
          dataIndex: 'state',
          key: 'state',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          render: text => {
            // console.log(text, record, 'text,record');
            return <div>{text}</div>;
          },
        },
      ],
      visible: false,
    };
    this.newTabIndex = 0;
    const panes = [{ title: '物流委派', content: this.renderProInfo(), key: '1', closable: false }];
    this.state = {
      activeKey: panes[0].key,
      panes,
    };
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  showModal = () => {
    this.setState({
      visible: true,
    });
    console.log(this.state.visible);
  };
  handleOk = () => {
    // this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ visible: false });
    }, 3000);
  };
  handleCancel = () => {
    this.setState({ visible: false });
  };
  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
    this.setState({ panes, activeKey });
  };
  remove = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  };
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(err => {
      if (!err) {
        // console.log('Received values of form: ', values);
      }
    });
  };
  // 渲染页面
  // mounting = () => {
  //   const panes = [{ title: '物流委派', content: this.renderProInfo(), key: '1', closable: false }];
  //   const activeKey = panes[0].key;
  //   this.setState({
  //     activeKey,
  //     panes,
  //   });
  // };
  /**
   * 渲染表格
   * @param {Object} dataSource 表行
   * @param {Object} columns 表头
   */
  renderProInfo = () => {
    const { dataSource, columns } = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    // const  visible  = this.state.visible;
    // console.log(visible)

    return (
      <div className="proDataWrap">
        <SearchBar />
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" className="marginR" onClick={this.showModal}>
            选择物流委派
          </Button>
        </div>
        <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection} />
      </div>
    );
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <div>
        <Tabs
          hideAdd
          className="productVariants"
          onChange={this.onChange}
          activeKey={this.state.activeKey}
          type="editable-card"
          onEdit={this.onEdit}
        >
          {this.state.panes.map(pane => (
            <TabPane
              tab={pane.title}
              key={pane.key}
              closable={pane.closable}
              className="proTabs"
              style={{ marginBottom: '0px' }}
            >
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
        <Modal
          visible={this.state.visible}
          title="选择物流委派"
          onOk={this.handleOk}
          maskClosable={false}
          onCancel={this.handleCancel}
          className="chooseLogistics"
          footer={[
            <Button key="submit" type="primary" onClick={this.handleOk}>
              确定
            </Button>,
            <Button key="back" onClick={this.handleCancel}>
              取消
            </Button>,
          ]}
        >
          <Form onSubmit={this.handleSubmit}>
            <Row gutter={24} type="flex" justify="start">
              <Col span={12}>
                <FormItem {...formItemLayout} label="物流" hasFeedback>
                  {getFieldDecorator('select', {
                    rules: [{ required: true, message: 'Please select your country!' }],
                  })(
                    <Select 
                      placeholder="请选择物流" 
                      style={{ width: '172px', height: '26px' }}
                      showSearch
                      optionFilterProp='children'
                    >
                      <Option value="EMS">EMS</Option>
                      <Option value="use">U.S.A</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="寄件人">
                  {getFieldDecorator('select', {
                    rules: [{ required: false, message: 'Please select your country!' }],
                  })(<Input className="InputW172" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="联系电话">
                  {getFieldDecorator('select', {
                    rules: [{ required: false, message: 'Please select your country!' }],
                  })(<Input className="InputW172" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="寄件地址">
                  {getFieldDecorator('select', {
                    rules: [{ required: false, message: 'Please select your country!' }],
                  })(<Input className="InputW172" />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="收件人">
                  {getFieldDecorator('select', {
                    rules: [{ required: false, message: 'Please select your country!' }],
                  })(<Input className="InputW172" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="联系电话">
                  {getFieldDecorator('select', {
                    rules: [{ required: false, message: 'Please select your country!' }],
                  })(<Input className="InputW172" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="收件地址">
                  {getFieldDecorator('select', {
                    rules: [{ required: false, message: 'Please select your country!' }],
                  })(<Input className="InputW172" />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default LogisticsList;
