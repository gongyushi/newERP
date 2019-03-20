import React from 'react';
import {
  Button,
  Table,
  Select,
  Input,
  Form,
  Radio,
} from 'antd';
import styles from './common.less';
import SelfStoreModal from '../public/SelfStoreModal';
import FbaStoreModal from '../public/FbaStoreModal';
import { Urls, getPageState, getOrderState } from '../../../utils/utils';
import PermissionButton from '../../../components/PermissionButton';
import { erpPost } from '../../../services/ajax';

const { Option } = Select;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


class ARinStore extends React.Component {
  constructor(props) {
    super(props);
    const { activeKey, params } = props;
    this.state = {
      storeData: [], // 按钮组选项
      selectData1: [], // 下拉选项一
      selectData2: [], // 下拉选项二
      selectData3: [], // 状态下拉选项
      storeList: [], // 入库列表
      storeColumns: [], // 入库表头
      status: [], // 状态对照表
      selfVisible: false,
      fbaVisible: false,
      id: '', // 入库时行ID
      activeKey,
      page: getPageState(props),
      orders: getOrderState(props),
      search: {
        warehouse_id: params.Get('warehouse_id', undefined),
        key1: params.Get('key1', undefined),
        value1: params.Get('value1', undefined),
        key2: params.Get('key2', undefined),
        value2: params.Get('value2', undefined),
        status: params.Get('status', undefined),
      },
    }
  }
  
  componentDidMount() {
    this.getStoreList();
    this.getWarehouseList();
    this.initColumns();
  }
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.getStoreList();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };
  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextState.search) !== JSON.stringify(this.state.search) ||
      JSON.stringify(nextState.orders) !== JSON.stringify(this.state.orders) ||
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    ){
      this.getStoreList();
    }
  };
  // 搜索触发事件
  onSearch = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        for (const key in values) {
          if (String(values[key]).replace(/(^\s+)|(\s+$)/, '') === '' || key === 'warehouse_id' && values[key] === 0) {
            values[key] = undefined;
            console.log(key, values[key])
          }
        }
        if (values.value1 === undefined) {
          values.key1 = undefined;
        }
        if (values.value2 === undefined) {
          values.key2 = undefined;
        }
        if(values.status === '0'){
          values.status = undefined;
        }
        this.getStoreList(values);
      }
    });
  }
  // 获取入库列表
  getStoreList = (keyword) => {
    const { page, orders, search } = this.state;
    console.log(keyword,search)
    erpPost('warehouse-receipt/inbound/index', { page, orders, ...search, ...keyword }, res => {
      this.setState({
        storeList: res.data.data,
        page: res.data.page,
      });
    });
  }
  // 获取仓库列表
  getWarehouseList = () => {
    erpPost('warehouse/index', {}, res => {
      const { data } = res.data;
      data.unshift({ warehouse_id: 0, warehouse_name: '全部' });
      this.setState({
        storeData: data,
      });
    });
  }
  initColumns = () => {
    const selectData1 = [
      {
        name: '产品ID',
        value: 'product_no',
      },
      {
        name: '产品名称',
        value: 'title',
      },
      {
        name: 'SKU',
        value: 'product_sku',
      },
    ];
    const selectData2 = [
      {
        name: '入库单号',
        value: 'receipt_no',
      },
      {
        name: '采购单号',
        value: 'purchase_no',
      },
      {
        name: '调拨单号',
        value: 'requisition_no',
      },
      {
        name: '出库单号',
        value: 'outbound_no',
      },
      {
        name: '配送入库编号',
        value: 'shipments_inbound_id',
      },
    ];
    const selectData3 = [
      {
        name: '全部',
        value: '0',
      },
      {
        name: '待入库',
        value: '20',
      },
      {
        name: '已入库',
        value: '21',
      },
    ];
    const storeColumns = [
      {
        title: '单号',
        dataIndex: 'receipt_no',
        key: 'receipt_no',
        width: 200,
      },
      {
        title: '仓库',
        dataIndex: 'warehouse_name',
        key: 'warehouse_name',
        width: 200,
      },
      {
        title: '采购单号',
        dataIndex: 'purchase_no',
        key: 'purchase_no',
        width: 200,
        render: (text) => {
          return (<span style={{ color: '#0099FF' }} >{text}</span>)
        },
      },
      {
        title: '出库单号',
        dataIndex: 'outbound_no',
        key: 'outbound_no',
        width: 200,
      },
      {
        title: '计划入库数量(件)',
        dataIndex: 'expect_count',
        key: 'expect_count',
        width: 200,
        sorter: (a, b) => a.expect_count - b.expect_count,
      },
      {
        title: '实际入库数量(件)',
        dataIndex: 'real_count',
        key: 'real_count',
        width: 200,
        sorter: (c, d) => c.real_count - d.real_count,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 200,
        render: value => this.state.status[value],
      },
      {
        title: '入库时间',
        dataIndex: 'happen_at',
        key: 'happen_at',
        width: 200,
        sorter: (e, f) => e.happen_at - f.happen_at,
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 200,
      },
      {
        title: '操作',
        dataIndex: 'text',
        key: '',
        width: 200,
        render: (text, record) => {
          return (
            <div style={{display:'flex',justifyContent:'center'}}>
              {
                record.status === 20 &&
                (
                  <PermissionButton
                    type='primary'
                    size='small'
                    ghost
                    onClick={this.handleOpenModal.bind(this,record.warehouse_type, record.id)}
                    action='warehouse-receipt/edit-inbound'
                  >
                    入库
                  </PermissionButton>
                )
              }
              <PermissionButton
                type='primary'
                size='small'
                style={{ marginLeft: 10 }}
                ghost
                action='warehouse-receipt/inbound-detail'
                href={`#/warehouse-receipt/inbound/detail?id=${record.id}`}
              >
                详情
              </PermissionButton>
            </div>
          );
        },
      },
    ];
    const status = {
      '20': '待入库',
      '21': '已入库',
      '10': '待出库',
      '11': '已出库',
    };
    this.setState({ storeColumns, selectData1, selectData2, selectData3, status });
  }

  handleTableChange = (page,filter,sorter) => {
    this.setState({
      page,
      orders: {field:sorter.field,order:sorter.order},
    });
  }
  // 开模态框
  handleOpenModal = (warehouse_type,id) => {
    const key = warehouse_type === 1 ? 'fbaVisible' :  'selfVisible';
    this.setState({
      [key]: true,
      id,
    });
  }
  // 关模态框
  handleClose = (key) => {
    this.setState({
      [key]: false,
    });
    this.onSearch(); // 同样搜索结果
  }

  handelSelectChange = (e) => {
    const { value } = e.target;
    this.getStoreList({warehouse_id: value !== 0 ? value : undefined});
  }
  render() {
    const { selfVisible, id, fbaVisible, search } = this.state;
    const { storeList, selectData1, selectData2, selectData3, storeData, storeColumns, page } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.purchase}>
        <div className={styles.shell1}>
          <div className={styles.selectAll}>
            <Form layout='inline'>
              <div className={styles.select}>
                <FormItem label='仓库'>
                  {getFieldDecorator('warehouse_id',{
                    initialValue: search.warehouse_id || '0',
                  })(
                    <RadioGroup
                      onChange={this.handelSelectChange}
                    >
                      {
                        storeData.map(data => {
                          return (<RadioButton key={data.warehouse_id} value={String(data.warehouse_id)} className={styles.radio} >{data.warehouse_name}</RadioButton>)
                        })
                      }
                    </RadioGroup>
                  )}
                </FormItem>
              </div>
              <FormItem>
                {getFieldDecorator('key1', {
                  initialValue: search.key1 || 'product_no',
                })(
                  <Select
                    style={{ width: 150 }}
                  >
                    {
                      selectData1.map(val => {
                        return (<Option key={val.value}>{val.name}</Option>)
                      })
                    }
                  </Select>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('value1',{
                  initialValue: search.value1 || '',
                })(
                  <Input style={{ width: 200, marginRight: 16 }} placeholder='请输入' />
                )
                }
              </FormItem>
              <FormItem>
                {getFieldDecorator('key2', {
                  initialValue: search.key2 || 'receipt_no',
                })(
                  <Select
                    style={{ width: 150 }}
                  >
                    {
                      selectData2.map(val => {
                        return (<Option key={val.value}>{val.name}</Option>)
                      })
                    }
                  </Select>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('value2',{
                  initialValue: search.value2 || '',
                })(
                  <Input style={{ width: 200, marginRight: 16 }} placeholder='请输入' />
                )
                }
              </FormItem>
              <FormItem label='状态'>
                {getFieldDecorator('status', {
                  initialValue: search.status || '0',
                })(
                  <Select
                    style={{ width: 150 }}
                  >
                    {
                      selectData3.map(val => {
                        return (<Option key={val.value} value={String(val.value)}>{val.name}</Option>)
                      })
                    }
                  </Select>
                )}
              </FormItem>
              <Button
                type="primary"
                style={{ position: 'relative', top: 4 }}
                onClick={this.onSearch}
                size='small'
              >
                搜索
              </Button>
            </Form>
          </div>
          <Table
            columns={storeColumns}
            dataSource={storeList}
            onChange={this.handleTableChange}
            pagination={page}
          />
          {/* 自有仓库模态框 */}
          {
            selfVisible && 
            <SelfStoreModal visible={selfVisible} id={id} onClose={this.handleClose} />
          }
          {/* FBA仓库模态框 */}
          {/* {
            fbaVisible && 
            <FbaStoreModal visible={fbaVisible} id={id} onClose={this.handleClose} />
          } */}
        </div>
      </div>
    );
  }
}

export default Form.create()(ARinStore);