import React from 'react';
import { Table, Tabs, Form, Button, message, Upload } from 'antd';
import { connect } from 'dva';
// import ImportFile from 'components/Importfile';
import SearchBar from '../../components/SearchBar';
import NewPutIn from './NewPutIn';
import { erpPost } from '../../services/ajax';
// import {erpPost} from '../../services/ajax';

require('../ListStyle.less');

const { TabPane } = Tabs;

/* 把from添加天props里 */

@Form.create()
class PutInStorage extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      panes: [],
      dataSource: [],
      page: {
        // defaultCurrent: 1,  // 默认的当前页数
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
        // showQuickJumper:true,
      },
      columns: [
        {
          title: '入库通知单',
          dataIndex: 'inbound_no',
          key: 'inbound_no',
          className: 'width200',
        },
        {
          title: '关联单号',
          dataIndex: 'associated_no',
          key: 'associated_no',
          className: 'width200',
        },
        {
          title: '仓库',
          dataIndex: 'wh_name',
          key: 'wh_name',
          className: 'width160',
        },
        {
          title: '预入总数',
          dataIndex: 'sum',
          key: 'sum',
          className: 'width140',
        },
        {
          title: '入库良品数',
          dataIndex: 'insto_good_num',
          key: 'insto_good_num',
          className: 'width140',
        },
        {
          title: '入库不良品数',
          dataIndex: 'insto_bad_num',
          key: 'insto_bad_num',
          className: 'width140',
        },
        {
          title: '类型',
          dataIndex: 'storage_type',
          key: 'storage_type',
          className: 'width140',
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          className: 'width140',
        },
        {
          title: '创建时间',
          dataIndex: 'created_at',
          key: 'created_at',
          className: 'width140',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          className: 'width140',
          render: (text, val) => {
            return (
              <div>
                <div
                  onClick={() => {
                    const { panes } = this.state;
                    const activeKey = `newTab${this.newTabIndex++}`;
                    panes.push({
                      title: '编辑',
                      content: (
                        <NewPutIn
                          onedit={this.storageList}
                          inboundid={val.inbound_id}
                          value={val}
                          index={activeKey}
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
                <div onClick={this.delete.bind(this, val.inbound_id)}>
                  <Button size="small" type="primary" className="buttonDel" ghost>
                    删除
                  </Button>
                </div>
                <div>
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    入库
                  </Button>
                </div>
                {/* {text} */}
              </div>
            );
          },
        },
      ],
    };
  }
  // componentWillMount() {
  //   this.mounting(); // 渲染页面
  // }
  componentDidMount() {
    this.storageList(this.state.page, this.state.orders); // 获取列表数据
    this.mounting(); // 渲染页面
  }
  componentWillReceiveProps(nextData) {
    console.log(nextData, 'nextData');
    this.setState(
      {
        dataSource: nextData.storageList,
      },
      () => {
        this.mounting(); // 渲染页面
      }
    );
  }
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.storageList(pageNumber, order);
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  // 删除
  delete = id => {
    erpPost('inbound/delete', { inbound_id: id }, res => {
      message.success(res.data.msg);
      this.storageList(this.state.page, this.state.orders);
    });
  };
  // 渲染页面
  mounting = () => {
    let { panes } = this.state;
    if (panes.length === 0) {
      panes = [{ title: '入库管理', content: this.renderProInfo(), key: '1', closable: false }];
    } else {
      panes[0].content = this.renderProInfo();
    }
    const activeKey = panes[0].key;
    this.setState({
      activeKey,
      panes,
    });
  };
  // 获取列表数据
  // storageList = () => {
  //   this.props.dispatch({
  //     type: 'getStorage/fetch',
  //     payload: {
  //       purch_no: this.state.searchKey,
  //     },
  //   });
  // };
  // 获取列表数据
  storageList = (pageNumber, orders) => {
    const can = {
      page: pageNumber,
      order: orders,
    };
    this.props.dispatch({
      type: 'getStorage/fetch',
      payload: {
        purch_no: this.state.searchKey,
      },
    });
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
  NewPutIn = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '新建入库',
      content: <NewPutIn inboundid={0} index={activeKey} />,
      key: activeKey,
    });
    this.setState({ panes, activeKey });
  };
  /**
   * 渲染表格
   * @param {Object} dataSource 表行
   * @param {Object} columns 表头
   */

  // beforeUpload = file => {
  //   console.log(file, 'file');
  // }
  handleChange = info => {
    if (info.file.response) {
      console.log(info.file.response, 'info');
    }
    // erpPost('inbound/import', { file_stu: info.file, inbound_id:'13'},res=>{
    //   console.log(res)
    // })
  };
  renderProInfo = () => {
    const { dataSource, columns, page } = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    const { urlHeader } = global.gconfig; // frontend/src/config
    // return  <Table dataSource={dataSource} columns={columns} />;
    return (
      <div className="proDataWrap">
        <SearchBar />
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" className="marginR" onClick={this.NewPutIn}>
            新增入库
          </Button>
          <Button
            type="primary"
            onClick={() => {
              window.location.href = `${global.gconfig.urlHeader}warehouse/export`;
            }}
            className="marginR"
          >
            导出
          </Button>
          <Upload
            name="file_stu"
            data={{ inbound_id: 13 }}
            // listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action={`${urlHeader}inbound/import`}
            // beforeUpload={this.beforeUpload}
            onChange={this.handleChange}
            onPreview={res => {
              console.log(res);
            }}
            success={res => {
              console.log(res);
            }}
          >
            <Button type="primary" className="marginR">
              导入
            </Button>
          </Upload>
        </div>
        <Table
          rowKey="inbound_id"
          dataSource={dataSource}
          columns={columns}
          rowSelection={rowSelection}
          onChange={this.onTableChange}
          pagination={page}
        />
      </div>
    );
  };
  render() {
    return (
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
    );
  }
}
const mapStateToProps = state => {
  return {
    storageList: state.getStorage.storagelist,
  };
};

export default connect(mapStateToProps)(PutInStorage);
