import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Table, Tabs, Form, Button, Modal, Input, message } from 'antd';
import Ellipsis from 'components/Ellipsis';
import { erpPostAll } from 'services/ajax';
import SearchBar from '../../components/SearchBar';

require('../ListStyle.less');
require('../tableStyle.less');

const { TabPane } = Tabs;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 6 },
};

@Form.create()
class noticeManagement extends React.Component {
  // 类型检查
  static propTypes = {
    dataSource: PropTypes.array.isRequired,
    activeKey: PropTypes.string.isRequired,
    pannes: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      //   page: {
      //     // defaultCurrent: 1,  // 默认的当前页数
      //     pageSize: 10,  // 每页显示条数
      //     total: 0,  // 总页数
      //     current: 1, // 当前页数
      //     showSizeChanger: true,
      //     // showQuickJumper:true,
      // },
      columns: [
        {
          title: '标题',
          dataIndex: 'title',
          className: 'title',
          key: 'title',
        },
        {
          title: '内容',
          dataIndex: 'content',
          className: 'content',
          key: 'content',
          width: 650,
          render: text => {
            return (
              <Ellipsis lines={2} style={{ maxWidth: '600px', textAlign: 'left' }}>
                {text}
              </Ellipsis>
            );
          },
        },
        {
          title: '创建人',
          dataIndex: 'creater',
          className: 'creater',
          key: 'creater',
        },
        {
          title: '时间',
          dataIndex: 'created_at',
          className: 'created_at',
          key: 'created_at',
        },
        {
          title: '状态',
          dataIndex: 'status',
          className: 'status',
          key: 'status',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          className: 'operation',
          key: 'operation',
          render: (text, val) => {
            return (
              <div>
                <div
                  onClick={() => {
                    this.editPopUP(val.post_id);
                  }}
                >
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    查看
                  </Button>
                </div>
                <div
                  onClick={() => {
                    this.delRow(val.post_id);
                  }}
                >
                  <Button size="small" type="primary" className="buttonDel" ghost>
                    删除
                  </Button>
                </div>
              </div>
            );
          },
        },
      ],
      // 新增详情页是否显示
      newNotice: false,
      // 是否为编辑状态
      editor: false,
      selectedRows: [],
    };
  }
  componentWillMount() {
    // this.addNotice(this.state.page,this.state.orders);
    this.props.dispatch({
      type: 'noticesCharge/fetchIndexList',
    });
  }
  onCellChange = (key, dataIndex) => {
    return value => {
      const submitDataSource = [...this.state.submitDataSource];
      const target = submitDataSource.find(item => item.key === key);
      if (target) {
        target[dataIndex] = value;
        this.setState({ submitDataSource });
      }
    };
  };
  // 获取公告管理列表
  
  // 显示弹框
  editPopUP = id => {
    const { setFieldsValue } = this.props.form;
    const { dataSource } = this.props;
    const data = dataSource.filter(item => item.post_id === id);
    setFieldsValue({
      title: data[0].title,
      content: data[0].content,
    });
    this.setState({
      newNotice: true,
      editor: true,
    });
  };
  // // 新增公告
  addNotice = e => {
    e.preventDefault();
    console.log(123)
    if (!this.state.editor) {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          this.props.dispatch({
            type: 'noticesCharge/addNotice',
            payload: values,
            onCompleted: res => {
              if (res.code === 200) {
                message.success(res.mesg);
              } else {
                message.error(res.mesg);
              }
            },
          });
        }
      });
    }
    this.setState({
      newNotice: false,
    });
  };

  // 删除单条记录
  delRow = id => {
    this.props.dispatch({
      type: 'noticesCharge/deleteNotice',
      payload: id,
      onCompleted: res => {
        if (res.code === 200) {
          message.success(res.mesg);
        } else {
          message.error(res.mesg);
        }
      },
    });
  };
  // 批量删除
  delNotices = () => {
    const { selectedRows } = this.state;
    const urlArr = [];
    selectedRows.map(item => {
      urlArr.push({
        url: 'post/delete',
        data: {
          post_id: item.post_id,
        },
      });
      return item;
    });

    erpPostAll(urlArr, () => {
      this.setState({
        selectedRows: [],
      });
      this.props.dispatch({
        type: 'noticesCharge/fetchIndexList',
      });
    });
  };
  // 弹框取消
  handleCancel = () => {
    this.setState({ newNotice: false });
  };
  /**
   * 渲染表格
   * @param {Object} dataSource 表行
   * @param {Object} columns 表头
   */
  renderProInfo = () => {
    const { columns } = this.state;
    const { dataSource, tableLoading } = this.props;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRows,
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    return (
      <div className="proDataWrap">
        <SearchBar />
        <div style={{ marginBottom: '10px' }}>
          <Button
            type="primary"
            className="marginR"
            onClick={() => {
              this.props.form.resetFields();
              this.setState({ newNotice: true, editor: false });
            }}
          >
            新增公告
          </Button>
          <Button type="primary" className="marginR" onClick={this.delNotices}>
            删除
          </Button>
        </div>
        <Table
          rowKey="post_id"
          dataSource={dataSource}
          columns={columns}
          rowSelection={rowSelection}
          loading={tableLoading}
          className="notice"
          // onChange={this.onTableChange}
          // pagination={page}
        />
      </div>
    );
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { pannes, activeKey } = this.props;
    const { editor } = this.state;
    pannes[0].content = this.renderProInfo();
    return (
      <div>
        <Tabs
          hideAdd
          className="productVariants"
          activeKey={activeKey}
          type="editable-card"
          onEdit={(targetKey, action) => {
            this[action](targetKey);
          }}
        >
          {pannes.map(pane => (
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
        {/* 新增公告 */}
        <Modal
          visible={this.state.newNotice}
          title={editor ? '查看公告' : '新增公告'}
          onOk={this.addNotice}
          onCancel={this.handleCancel}
          maskClosable={false}
          footer={[
            <Button key="submit" type="primary" onClick={this.addNotice}>
              确定
            </Button>,
            <Button key="back" onClick={this.handleCancel}>
              取消
            </Button>,
          ]}
        >
          <Form onSubmit={this.addNotice}>
            <FormItem {...formItemLayout} label="标题" hasFeedback>
              {getFieldDecorator('title', {
                rules: [{ required: true, message: '请输入标题！' }],
                initialValue: '',
              })(<Input className="InputW330" disabled={editor} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="内容" hasFeedback>
              {getFieldDecorator('content', {
                rules: [{ required: true, message: '请输入内容！' }],
                initialValue: '',
              })(
                <textarea
                  style={{
                    width: '330px',
                    height: '164px',
                    borderColor: '#DEDEDE',
                    borderRadius: '5px',
                  }}
                  disabled={editor}
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    dataSource: state.noticesCharge.noticesList,
    pannes: state.noticesCharge.pannes,
    activeKey: state.noticesCharge.activeKey,
    tableLoading: state.loading.effects['noticesCharge/fetchIndexList'],
  };
};
export default connect(mapStateToProps)(noticeManagement);
