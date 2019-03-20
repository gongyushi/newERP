import React from 'react';
import { Tabs, Button, Modal, Input, Table, message, Form, Select } from 'antd';
// import ImportFile from 'components/Importfile';
import styles from './competition.less';
import ErpSearch from '../../components/erpSearch';
import OnlineDemand from './public/onlineDemand';
import { erpPost } from '../../services/ajax';

require('../ListStyle.less');

const { TabPane } = Tabs;
const { TextArea } = Input;
const FormItem = Form.Item;
const { Option } = Select;
// 渲染到页面
class DynamicRule extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      panes: [],
      visible: false,
      columns: [
        {
          title: '产品图片',
          dataIndex: 'image_urls',
          key: 'width60',
          render: text => <img src={text} alt="商品图片" style={{ width: '50px' }} />,
        },
        {
          title: '产品信息',
          dataIndex: 'prod_name',
          key: 'prod_name',
          render: (text, val) => <div style={{ height: 35 }}>{val.prod_name}</div>,
        },
        {
          title: '价格($)',
          dataIndex: 'price',
          key: 'price',
        },
        {
          title: '销量',
          dataIndex: 'sales',
          key: 'sales',
        },
        {
          title: '排名',
          dataIndex: 'rank',
          key: 'rank',
        },
        {
          title: '评分',
          dataIndex: 'score',
          key: 'score',
        },
        {
          title: '评论数',
          dataIndex: 'comment_num',
          key: 'comment_num',
        },
        {
          title: '品类',
          dataIndex: 'category',
          key: 'category',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          render: (text, Record) => (
            <div>
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const { panes } = this.state;
                  const activeKey = `newTab${this.newTabIndex++}`;
                  panes.push({
                    title: '趋势分析',
                    content: <OnlineDemand id={Record.id} asin={Record.asin} />,
                    key: activeKey,
                  });
                  this.setState({ panes, activeKey });
                }}
              >
                <Button size="small" type="primary" className="buttonBul" ghost>
                  趋势分析
                </Button>
              </div>
              <div style={{ cursor: 'pointer' }}>
                <Button size="small" type="primary" className="buttonBul" ghost>
                  文本分析
                </Button>
              </div>
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  console.log(Record.id);
                  erpPost('product/competitor/delete', { user_product_id: Record.id }, res => {
                    message.success(res.data.msg);
                    this.getCompetiList();
                  });
                }}
              >
                {/* <Button style={{width:63.8}} size='small' type="danger" ghost>删除</Button> */}
              </div>
            </div>
          ),
        },
      ],
      dataSource: [],
      page: {
        // defaultCurrent: 1,  // 默认的当前页数
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
        // showQuickJumper:true,
      },
      timeChose: {
        name: '期限',
        data: [
          {
            name: '三天(101)',
            value: '三天',
          },
          {
            name: '一周(101)',
            value: '一周',
          },
          {
            name: '一个月(101)',
            value: '一个月',
          },
        ],
      },
      companyChose: {
        name: '店铺名称',
        data: [
          {
            name: '格林德',
            value: '102',
          },
          {
            name: '数据原力',
            value: '103',
          },
        ],
      },
    };
  }

  componentWillMount() {
    this.mounting();
    // this.getCompetiList();
    this.getCompetiList(this.state.page, this.state.orders);
  }
  componentDidMount() {
    this.timer = setInterval(() => {}, 5000);
  }
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.getCompetiList(pageNumber, order);
  };
  // 产品的列表
  getCompetiList = (pageNumber, orders) => {
    // console.log(orders)
    const can = {
      page: pageNumber,
      order: orders,
    };
    erpPost('product/competitor/index', can, res => {
      this.setState({
        dataSource: res.data.data,
        orders: res.data.order,
        page: res.data.page,
      });
      this.mounting();
    });
  };
  // 渲染页面
  mounting = () => {
    let { panes } = this.state;
    if (panes.length === 0) {
      panes = [{ title: '竞品监控', content: this.compeList(), key: '1', closable: false }];
    } else {
      panes[0].content = this.compeList();
    }
    const activeKey = panes[0].key;
    this.setState({
      activeKey,
      panes,
    });
  };
  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: '趋势分析', content: 'Content of new Tab', key: activeKey });
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
  // 对话框
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  // 弹框提交
  handleOk = e => {
    console.log(e);
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        const asins = values.asin.split(';');
        const arr = [];
        asins.forEach(res => {
          arr.push(res.replace(/(^\s*)|(\s*$)/g, ''));
        });
        const can = {
          asin: arr.join(';'),
          website: values.website,
        };
        erpPost('product/competitor/add', can, res => {
          message.success(res.data.msg);
          this.setState({
            visible: false,
          });
        });
      }
    });
  };
  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  compeList = () => {
    const { dataSource, columns, page } = this.state;
    // console.log(dataSource)
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    return (
      <div className={styles.competition}>
        <ErpSearch timeChose={this.state.timeChose} companyChose={this.state.companyChose} />
        <div className={styles.comButton}>
          <Button size="small" type="primary" onClick={this.showModal}>
            添加竞品
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              window.location.href = `${global.gconfig.urlHeader}product/competitor/export`;
            }}
          >
            导出
          </Button>
          {/* <ImportFile
            style={{ height: 24 }}
            onUploading={info => {
              console.log(info, 'uploading');
            }}
            onUploaded={info => {
              console.log(info, 'uploaded');
            }}
            onUploadError={info => {
              console.log(info, 'error');
            }}
          /> */}
          <Button size="small" className="buttonDel" type="primary">
            删除
          </Button>
        </div>

        <Table
          onChange={this.onTableChange}
          pagination={page}
          rowKey="user_product_id"
          // data={dataSource}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          // rowKey="id"
          className="competition"
        />
      </div>
    );
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 24 },
    };
    return (
      <div>
        <Tabs
          onChange={this.onChange}
          activeKey={this.state.activeKey}
          type="editable-card"
          onEdit={this.onEdit}
        >
          {this.state.panes.map(pane => (
            <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
        <Modal
          title="添加商品"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          maskClosable={false}
        >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              // label="Select"
              hasFeedback
            >
              {getFieldDecorator('website', {
                rules: [{ required: true, message: '请选择!' }],
              })(
                <Select 
                  style={{ width: 200 }} 
                  placeholder="请选择!"
                  showSearch
                  optionFilterProp='children'
                >
                  <Option value="AZCM">Amazon-US</Option>
                  <Option value="AZJP">Amazon-JP</Option>
                  <Option value="AZDE">Amazon-DE</Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              // label="Nickname"
            >
              {getFieldDecorator('asin', {
                rules: [
                  {
                    required: this.state.checkNick,
                    message: '请填写asin！',
                  },
                ],
              })(
                <TextArea
                  style={{ width: '100%' }}
                  rows={4}
                  placeholder="请输入产品的Asin，多个产品以空格隔开"
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

const Competition = Form.create()(DynamicRule);
export default Competition;
