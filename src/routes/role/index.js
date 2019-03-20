import React from 'react';
import { Table, Button, Input } from 'antd';
import DeleteConfirmModal from '../../components/DeleteConfirm';
import { erpPost } from '../../services/ajax';
import { Urls, getPageState, getOrderState } from '../../utils/utils';
import PermissionButton from '../../components/PermissionButton';
import Prompt from '../../components/Prompt';


class RoleManagement extends React.Component {
  constructor(props) {
    super(props);
    const { activeKey, params } = props;
    this.state = {
      activeKey,
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        keyword: params.Get('keyword',undefined),
      },
      dataSource: [],
      columns: [],
    };
  }
  componentDidMount() {
    this.getRoleList(); // 获取角色列表
    this.initColumns();
  }

  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.getRoleList();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  }

  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextState.search) !== JSON.stringify(this.state.search) ||
      JSON.stringify(nextState.orders) !== JSON.stringify(this.state.orders) ||
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    ){
      this.getRoleList();
    }
  }
  // 获取角色列表
  getRoleList = (keyword) => {
    const { search,page,orders } = this.state;
    erpPost('role/index', {page,orders,...search,...keyword}, res => {
      this.setState({
        dataSource: res.data.data.map(data => this.handleRoleData(data)),
        page: res.data.page,
      });
    });
  }
  initColumns = () => {
    const columns = [
      {
        title: '角色名称',
        dataIndex: 'role_name',
        key: 'role_name',
        width: 200,
      },
      {
        title: '权限名称',
        dataIndex: 'permission_list',
        key: 'permission_list',
        width: 500,
        render: value => <div style={{ textAlign: 'left', padding: 5 }}>{value}</div>,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 200,
        render: (text, record) => {
          return (
            <div style={{display:'flex',justifyContent:'center'}}>
              <PermissionButton 
                ghost 
                size="small" 
                type="primary" 
                style={{marginRight:10}}
                action='role/edit'
                href={`#/role/add?id=${record.id}`}
              >
                编辑
              </PermissionButton>
              <DeleteConfirmModal
                title='系统提示'
                content='确认删除？'
                okText='确 定'
                onOk={this.handleRemove.bind(this, record.id)}
                cancelText='取 消'
                onCancel={() => true}
              >
                <PermissionButton
                  type='primary'
                  ghost
                  size='small'
                  action='role/delete'
                >
                  删除
                </PermissionButton>
              </DeleteConfirmModal>
            </div>
          );
        },
      },
    ];
    this.setState({columns});
  }
  handleRemove = key => {
    erpPost('role/delete', { id: key }, () => {
      Prompt.success();
      this.getRoleList();
    });
  };
  handleRoleData = ({ permission_list, ...data }) => {
    permission_list = permission_list.split(',').join('， ');
    return ({ permission_list, ...data });
  }
  // 页码
  handleTableChange = (page,filter,sorter) => {
    this.setState({
      page,
      orders: {field: sorter.field, order: sorter.order},
    });
  };
  // 搜索
  handleSearch = () => {
    const { page, keyword } = this.state;
    const can = {
      page,
      keyword,
    };
    // value = value.replace(' ','') === '' ? undefined : value;
    erpPost('role/index', can, res => {
      this.setState({
        dataSource: res.data.data.map(data => this.handleRoleData(data)),
        page: res.data.page,
      });
    })
  };
  handleChange = (key, e) => {
    this.setState({
      [key]: e.target.value,
    });
  }

  render() {
    const { dataSource, page, columns } = this.state;
    const { tableLoading } = this.props;
    return (
      <div className="proDataWrap">
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <span>关键词：</span>
          <Input
            value={this.state.keyword}
            style={{ width: 200, marginRight: 10 }}
            onChange={this.handleChange.bind(this, 'keyword')}
          />
          <Button type='primary' size='small' onClick={this.handleSearch}>
            搜索
          </Button>
        </div>
        <div style={{ margin: '10px 0px' }}>
          <PermissionButton 
            size="small" 
            type="primary"
            action='role/add'
            href={`#/role/add?id=${0}`}
          >
            新增权限
          </PermissionButton>
        </div>
        <Table
          dataSource={dataSource}
          columns={columns}
          onChange={this.handleTableChange}
          loading={tableLoading}
          pagination={page}
          rowKey='id'
        />
      </div>
    );
  }
}

export default RoleManagement;
