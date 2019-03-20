import React from 'react';
import { Table, Button } from 'antd';
import { getPageState, getOrderState } from '../../utils/utils';
import Prompt from '../../components/Prompt';
import { erpPost } from '../../services/ajax';
import DeleteConfirmModal from '../../components/DeleteConfirm';
import PermissionButton from '../../components/PermissionButton';
import AddComponent from './add';
import styles from './index.less';

class Index extends React.Component {
  constructor(props) {
    super(props);
    const { activeKey } = props;

    this.state = {
      loading: true,
      addComponentHidden: true,
      dataSource: [],
      activeKey,
      page: getPageState(props),
      orders: getOrderState(props),
    };
  }
  componentDidMount() {
    this.refresh();
  };
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.refresh();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };
  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextState.orders) !== JSON.stringify(this.state.orders) ||
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    ){
      this.refresh();
    }
  };
  refresh = () => {
    this.setState({ loading: true });
    const { page, orders } = this.state;
    const params={
      page,
      orders,
    };
    erpPost('supplier/index', params, res => {
      res.data.data.map((val, index) => {
        val.key = index;
        return val;
      });
      this.setState({
        dataSource: res.data.data,
        orders: res.data.order,
        page: res.data.page,
        loading: false,
      });
    });
  };
  handleShowAddModel = () => {
    this.setState({
      addComponentHidden: false,
    });
  };
  handleAddClose = () => {
    this.refresh();
    this.setState({
      addComponentHidden: true,
    });
  };
  // 删除
  handleDelete = id => {
    erpPost('supplier/delete', { id }, res => {
      Prompt.success({ content: res.data.msg });
      this.refresh();
    });
  };
  handleTableChange = (page, filters, sorte) => {
    const orders = [];
    orders.push({ field: sorte.field, order: sorte.order });
    this.setState({
      orders,
      page,
    });
  };
  renderTable = () => {
    const { dataSource, page, loading } = this.state;
    const columns = [
      {
        title: '供应商编号',
        dataIndex: 'supplier_no',
        key: 'supplier_no',
        className: 'width260',
      },
      {
        title: '供应商名称',
        dataIndex: 'name',
        key: 'name',
        className: 'width300',
      },
      {
        title: '供应商类型',
        dataIndex: 'type',
        key: 'type',
        className: 'width140',
        render:(text,val)=>(
          <div>
            {val.type === 0 ? '1688供应商' :'普通供应商'}
          </div>
        ),
      },
      {
        title: '联系人',
        dataIndex: 'contact',
        key: 'contact',
        className: 'width140',
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
        key: 'phone',
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
              <PermissionButton
                size="small"
                type="primary"
                className="buttonBul"
                style={{ marginRight: 10 }}
                ghost
                action="supplier/detail"
                href={`#/supplier/detail?id=${val.supplier_id}`}
              >
                详情
              </PermissionButton>
              <DeleteConfirmModal content='确认删除该供应商？' onOk={this.handleDelete.bind(this, val.supplier_id)}>
                <PermissionButton
                  size="small"
                  type="primary"
                  className="buttonDel"
                  ghost
                  action="supplier/delete"
                >
                  删除
                </PermissionButton>
              </DeleteConfirmModal>
            </div >
          );
        },
      },
    ];
    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        onChange={this.handleTableChange}
        pagination={page}
      />
    );
  };
  render() {
    const { addComponentHidden } = this.state;
    return (
      <div className="proDataWrap">
        <div className={styles.toolbar}>
          <Button type="primary" size="small" className="marginR" onClick={this.handleShowAddModel}>
            新增供应商
          </Button>
        </div>
        { this.renderTable() }
        {addComponentHidden === true ? ('') : (
          <AddComponent
            onClose={this.handleAddClose}
          />
        )}
      </div>
    );
  };
};
export default Index;
