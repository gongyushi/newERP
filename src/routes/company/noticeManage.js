import React from 'react';
import { Table, Tabs, Button, Form, Select, Input } from 'antd';
import { erpPost } from '../../services/ajax';
import CreateNotice from './noticeEdit';
import Ellipsis from '../../components/Ellipsis';

const FormItem = Form.Item;
const { Option } = Select;

require('../ListStyle.less');
require('../tableStyle.less');

const { TabPane } = Tabs;

@Form.create()
class noticeManagement extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      page: {
        pageSize: 10, 
        total: 0, 
        current: 1,
        showSizeChanger: true,
      },
      selectData: [
        {
          value:'title',
          name:'标题',
        },
        {
          value:'real_name',
          name:'创建人',
        },
      ],
      activeKey: '0',
      selectedRows: [],
      dataSource: [],
      panes: [{ 
        title: '公告管理', 
        content: '',
        key: '0', 
        closable: false,
      }],
    };
  }
 
  componentDidMount(){
    const { page } = this.state;
    this.getNoticeList(page);
  }

  // 搜索触发事件
  onSearch = e => {
    e.preventDefault();
    const { page } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.getNoticeList(page, values);
      }
    });
  }
  
  onChange = activeKey => {
    this.setState({ activeKey });
  };
   
  onEdit = (targetKey, action) => {
    this[action](targetKey); 
  }

  onTableChange = (page) => {
    this.getNoticeList(page);
  }

  // 获取公告列表
  getNoticeList = (page, values) => {
    const can = {
      page,
      key: values&&values.key,
      value: values&&values.value,
    }
    erpPost('/message/index', can, res => {
      this.setState({
        dataSource: res.data.data,
        page:res.data.page,
      })
    });    
  }
  
  // 批量删除
  delNotices = () => {
    const { selectedRows, page } = this.state;
    const idall = [];
    if(selectedRows) {
      selectedRows.map(row =>
        {
          idall.push(row.id);
          return idall;
        }
      )     
    }
    const ids = idall.join(',');
    erpPost('/message/batch-delete', { ids }, () => {
      this.getNoticeList(page)
    });    
  };
  
  remove = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => {
      return pane.key !== targetKey;
    });
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  };
  
  renderProInfo = () => {
    const { page, selectData, dataSource } = this.state;
    const { getFieldDecorator } = this.props.form;
    const meStatus = {
      0:'上线',
      1:'离线',
    }        
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRows,
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User',
        name: record.name,
      }),
    };
    const columns= [
      {
        title: '标题',
        dataIndex: 'title',
        width: '350px',
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
        dataIndex: 'real_name',
        className: 'creater',
        key: 'real_name',
      },
      {
        title: '时间',
        dataIndex: 'updated_at',
        className: 'created_at',
        key: 'updated_at',
      },
      {
        title: '状态',
        dataIndex: 'status',
        className: 'status',
        key: 'status',
        render: (text) => {
          return meStatus[text]
        },
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
                  const { panes } = this.state;
                  const activeKey = `newTab${this.newTabIndex++}`;
                  panes.push({
                    title: '编辑公告',
                    content: (
                      <CreateNotice
                        index={activeKey}
                        remove={this.remove}
                        noticeId={val.id}
                        editable
                        activeKey={activeKey}
                        getNoticeList={this.getNoticeList}
                      />
                    ),
                    key: activeKey,
                  });
                  this.setState({ panes, activeKey });
                }}
              >
                <Button size="small" type="primary" className="buttonBul" ghost>
                  编辑
                </Button>
              </div>              
            </div>
          );
        },
      },
    ];
    return (
      <div className="proDataWrap">
        <Form layout='inline'>
          <FormItem>
            {getFieldDecorator('key',{
              initialValue: 'title',
            })(
              <Select 
                placeholder='请选择' 
                style={{width:120}}
                showSearch
                optionFilterProp='children'
              >
                {
                  selectData.map(select2=>{
                    return (<Option key={select2.value} value={select2.value}>{select2.name}</Option>)
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('value')(
              <Input style={{width:180}} />
              )
            }
          </FormItem>
          <FormItem>
            <Button type="primary" onClick={this.onSearch} >搜索</Button>
          </FormItem>
        </Form>    
        <div style={{ marginBottom: '10px' }}>
          <Button
            type="primary"
            className="marginR"
            onClick={() => {
              const { panes } = this.state;
              const activeKey = `newTab${this.newTabIndex++}`;
              panes.push({
                title: '新增公告',
                content: (
                  <CreateNotice
                    index={activeKey}
                    remove={this.remove}
                    activeKey={activeKey}
                    getNoticeList={this.getNoticeList}
                  />
                ),
                key: activeKey,
              });
              this.setState({ panes, activeKey });
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
          className="notice"
          onChange={this.onTableChange}
          pagination={page}
        />
      </div>
    );
  };
  render() {
    const { panes, activeKey } = this.state;
    panes[0].content = this.renderProInfo();
    return (
      <div>
        <Tabs
          hideAdd
          className="productVariants"
          activeKey={activeKey}
          onChange={this.onChange}
          type="editable-card"
          onEdit={this.onEdit}
        >
          {panes.map(pane => (
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
      </div>
    );
  }
}

export default noticeManagement;
