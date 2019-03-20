import React from 'react';
import { Button, Table } from 'antd';
import { getPageState, getOrderState } from '../../utils/utils';
import { erpPost } from '../../services/ajax';
import PermissionButton from '../../components/PermissionButton';
import AddComponent from './add';
import EditComponent from './edit';
import EditAuthorizeComponent from './editAuthorize';
import styles from './index.less';

class Index extends React.Component {
  constructor(props) {
    super(props);
    const { activeKey } = props;

    this.state = {
      loading: true,
      addComponentHidden: true,
      editComponentHidden: true,
      editAuthorizeComponentHidden: true,
      detail: {},
      marketplaceList: [],
      orgList: [],
      warehouseList: [],
      dataSource: [],
      activeKey,
      page: getPageState(props),
      orders: getOrderState(props),
    };
    this.initOrgList();
    this.initWarehouseList();
    this.initMarketplaceList();
  };
  componentDidMount() {
    this.refresh();
  };
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      console.log('componentWillReceiveProps')
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
  initOrgList = () => {
    erpPost('organization/lists', {}, res => {
      this.setState({
        orgList: res.data.data,
      })
    });
  };
  initWarehouseList = () => {
    erpPost('warehouse/list', {}, res => {
      this.setState({
        warehouseList: res.data.data,
      })
    });
  };
  initMarketplaceList = () => {
    erpPost('index/dictionary/lists', { keyword:'marketplace'}, res=>{
      this.setState({
        marketplaceList:res.data.data.children,
      });
    });
  };
  refresh = () => {
    this.setState({ loading: true });
    const { page, orders } = this.state;
    const params={
      page,
      orders,
    };
    erpPost('store/list', params, res => {
      const list = res.data.data;
      let sellerId = '';
      let count = 1;
      for (let i = list.length - 1; i >= 0; i--) {
        if (sellerId !== list[i].seller_id && list[i - 1]&& list[i].seller_id === list[i - 1].seller_id) {
          list[i].number=0;
          count++;
          sellerId = list[i].seller_id;
        }else
        if (sellerId !== list[i].seller_id && list[i - 1] && list[i].seller_id !== list[i - 1].seller_id){
          list[i].number = 1;
          count=1
        }else
        if (sellerId === list[i].seller_id && list[i - 1] && list[i].seller_id === list[i - 1].seller_id) {
          list[i].number = 0;
          count++;
        }else
        if (sellerId === list[i].seller_id && list[i - 1] && sellerId !== list[i - 1].seller_id || sellerId === list[i].seller_id && !list[i - 1]) {
          list[i].number = count;
          count=1;
        }
      }

      this.setState({
        dataSource: list,
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
  handleShowEditModel = (val) => {
    this.setState({
      editComponentHidden: false,
      detail: val,
    });
  };
  handleEditClose = () => {
    this.refresh();
    this.setState({
      editComponentHidden: true,
    });
  };
  handleShowEditAuthorizeModel = (val) => {
    const secret = JSON.parse(val.secret);
    const detail = {
      seller_id: val.seller_id,
      access_key: secret.access_key,
      secret_key: secret.secret_key,
      mws_token: secret.mws_token,
    };
    this.setState({
      editAuthorizeComponentHidden: false,
      detail,
    });
  };
  handleEditAuthorizeClose = () => {
    this.refresh();
    this.setState({
      editAuthorizeComponentHidden: true,
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
        title: 'Seller  ID',
        dataIndex: 'seller_id',
        key: 'seller_id',
        width:120,
        render: (value, val) => {
          const obj = {
            children: value,
            props: {},
          };
          obj.props.rowSpan = val.number;
          return obj;
        },
      },
      {
        title: '编号',
        dataIndex: 'store_no',
        key: 'store_no',
        width: 120,
      },
      {
        title: '店铺名称',
        dataIndex: 'store_name',
        key: 'store_name',
        width: 200,
      },
      {
        title: '站点',
        dataIndex: 'marketplace',
        key: 'marketplace',
        width: 120,
        render: (key, val) => {
          return (
            <div>
              {val.marketplace_info?val.marketplace_info.remark:null}
            </div>
          )
        },
      },
      {
        title: '平台',
        dataIndex: 'platform',
        key: 'platform',
        width: 120,
        render: (key, val) => {
          return (
            <div>
              {val.platform_info?val.platform_info.remark:null}
            </div>
          )
        },
      },
      {
        title: '语言',
        dataIndex: 'language_code',
        key: 'language_code',
        width: 120,
        render:(key,val)=>{
          return (
            <div>
              {val.language_code?val.language_code.remark:null}
            </div>
          )
        },
      },
      {
        title: '货币单位',
        dataIndex: 'currency_code',
        key: 'currency_code',
        width: 120,
        render: (key, val) => {
          return (
            <div>
              {val.currency_code.remark}
            </div>
          )
        },
      },
      {
        title: '所属组织',
        dataIndex: 'organization',
        key: 'organization',
        width: 150,
        render: (key, val) => {
          return (
            <div>
              {val.organization?val.organization.org_name:null}
            </div>
          )
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (text, val) => (
          <div>
            {val.enable === 0 ? '启用' : '禁用'}
          </div >
        ),
      },
      {
        title: '操作',
        colSpan: 2,
        key: 'action',
        width: 100,
        render: (text, val) => (
          <div>
            <PermissionButton
              size="small"
              type="primary"
              className="buttonBul"
              style={{ marginRight: 10 }}
              ghost
              action="store/edit"
              onClick={this.handleShowEditModel.bind(this, val)}
            >
              编辑
            </PermissionButton>
          </div>
        ),
      },
      {
        title: '操作',
        colSpan: 0,
        key: 'action2',
        width: 100,
        render: (value, val) => {
          const obj = {
            children: (
              <PermissionButton
                size='small'
                type="primary"
                ghost
                action="store/edit-authorize"
                onClick={this.handleShowEditAuthorizeModel.bind(this, val)}
              >
                更新授权
              </PermissionButton>
            ),
            props: {},
          };
          obj.props.rowSpan = val.number;
          return obj;
        },

      },
    ];
    return (
      <Table
        rowKey="store_id"
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        onChange={this.handleTableChange}
        pagination={page}
      />
    );
  };
  render() {
    const {
      addComponentHidden,
      editComponentHidden,
      editAuthorizeComponentHidden,
      marketplaceList,
      orgList,
      warehouseList,
      detail,
    } = this.state;

    return (
      <div className={styles.auditList}>
        <div className={styles.auditFun}>
          <PermissionButton
            type="primary"
            action="store/add"
            onClick={this.handleShowAddModel}
          >
            新增店铺
          </PermissionButton>
        </div>
        { this.renderTable() }
        {addComponentHidden === true ? ('') : (
          <AddComponent
            marketplaceList={marketplaceList}
            orgList={orgList}
            onClose={this.handleAddClose}
          />
        )}
        {editComponentHidden === true ? ('') : (
          <EditComponent
            warehouseList={warehouseList}
            orgList={orgList}
            onClose={this.handleEditClose}
            detail={detail}
          />
        )}
        {editAuthorizeComponentHidden === true ? ('') : (
          <EditAuthorizeComponent
            warehouseList={warehouseList}
            orgList={orgList}
            onClose={this.handleEditAuthorizeClose}
            detail={detail}
          />
        )}
      </div>
    );
  }
};

export default Index;
