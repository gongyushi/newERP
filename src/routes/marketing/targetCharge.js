import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Tabs, Button, Input, Table, Progress, Select } from 'antd';
import ErpSearch from 'components/erpSearch';
import styles from './tablepage.less';

require('../ListStyle.less');

const { Option } = Select;
function handleChange(value) {
  console.log(`selected ${value}`);
}
function onShowSizeChange(current, pageSize) {
  console.log(current, pageSize);
}
// 渲染到页面上
function TargetCharge({ pannes, activeKey, dispatch, dataSource }) {
  const { TabPane } = Tabs;
  const pageIndex = () => {
    // const { dataSource, columns}=this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    const timeChose = {
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
    };
    const companyChose = {
      name: '成员',
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
    };
    const columns = [
      {
        title: '产品信息',
        dataIndex: 'prod_info',
        key: 'prod_info',
        render: (val, record) => (
          <div>
            <p>{record.prod_info1}</p>
            <p>{record.prod_info2}</p>
            <p>{record.prod_info3}</p>
            <p>{record.prod_info4}</p>
          </div>
        ),
      },
      {
        title: '站点',
        dataIndex: 'station',
        key: 'station',
        children: [
          {
            title: '店铺',
            dataIndex: 'store',
            key: 'store',
            render: (text, record) => {
              return (
                <div>
                  <p>{record.station}</p>
                  <p>{record.store}</p>
                </div>
              );
            },
          },
        ],
      },
      {
        title: '月均销量',
        dataIndex: 'sellnum',
        Key: 'sellnum',
        render: (text, record) => <p>{`${record.sellnum}件`}</p>,
      },
      {
        title: '排名',
        dataIndex: 'rank',
        key: 'rank',
        render: (text, record) => {
          const dvalue = record.rank_today - record.rank_yesterday;
          const icon = dvalue > 0 ? '↓' : '↑';
          return (
            <div>
              <p>今日:{record.rank_today}</p>
              <p>昨日:{record.rank_yesterday}</p>
              <p>
                <span
                  style={{ color: 'red', fontSize: '15px', fontWeight: 'blod', marginRight: '2px' }}
                >
                  {icon}
                </span>
                {Math.abs(dvalue)}
              </p>
            </div>
          );
        },
      },
      {
        title: '库存',
        dataIndex: 'prod_stock',
        key: 'prod_stock',
        render: (text, record) => <p>{record.prod_stock}件</p>,
      },
      {
        title: '星级',
        dataIndex: 'startlevel',
        key: 'starlevel',
        children: [
          {
            title: '总评',
            dataIndex: 'comment',
            key: 'comment',
            children: [
              {
                title: '留评率',
                dataIndex: 'leavemsgrate',
                key: 'leavemsgrate',
                render: (text, record) => (
                  <div>
                    <p>星级:{record.starlevel}</p>
                    <p>总评:{record.comment}条</p>
                    <p>留评率:{record.leavemsgrate * 100}%</p>
                  </div>
                ),
              },
            ],
          },
        ],
      },
      {
        title: '价格(￥)',
        dataIndex: 'price',
        Key: 'price',
      },
      {
        title: '销售人员',
        dataIndex: 'groupman',
        key: 'groupman',
        render: (text, record) => {
          // const {groupman}=record;
          return (
            <Select defaultValue="A" style={{ width: 88 }} onChange={handleChange}>
              <Option value="A">张三</Option>
              <Option value="B">李四</Option>
              <Option value="C">王五</Option>
            </Select>
            // <div>
            //   <p>总数:{groupman.length}</p>
            //   {groupman.map((item)=>{
            //     return(
            //       <p key={item}>{item}</p>
            //     )
            //   })}
            // </div>
          );
        },
      },
      {
        title: '目标设立',
        dataIndex: 'suretarget',
        key: 'suretarget',
        width: '15%',
        render: (text, record) => {
          return (
            <div>
              <p key="current">
                本月目标{' '}
                <Input
                  key="current"
                  defaultValue={record.suretarget_currentmonth}
                  style={{ width: '50%' }}
                />
              </p>
              <p key="next">
                下月目标{' '}
                <Input
                  key="next"
                  defaultValue={record.suretarget_nextmonth}
                  style={{ width: '50%' }}
                />
              </p>
            </div>
          );
        },
      },
      {
        title: '上月目标',
        dataIndex: 'lastmonthtarget',
        key: 'lastmonthtarget',
        children: [
          {
            title: '完成情况',
            dataIndex: 'execution',
            key: 'execution',
            render: (text, record) => (
              <div>
                <p>上月目标：{record.lastmonthtarget}件</p>
                <p>完成情况：{record.lastmonthtarget}件</p>
                <Progress percent={record.execution * 100} size="small" />
              </div>
            ),
          },
        ],
      },
      // {
      //   title: '组',
      //   dataIndex: 'group',
      //   key:'group',
      // },
    ];
    return (
      <div className={styles.toolbar}>
        <ErpSearch timeChose={timeChose} companyChose={companyChose} />
        <div className={styles.toolButton}>
          <Button type="primary">保存</Button>
          <Button type="primary">导出</Button>
          <Button type="primary">导入</Button>
        </div>
        <Table
          bordered
          className="management"
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          onShowSizeChange={onShowSizeChange}
          defaultCurrent={3}
          total={500}
        />
      </div>
    );
  };
  pannes[0].content = pageIndex();
  function onChange(Key) {
    dispatch({
      type: 'pannesOnChange',
      payload: Key,
    });
  }
  function onEdit() {}
  return (
    <div>
      <Tabs onChange={onChange} activeKey={activeKey} type="editable-card" onEdit={onEdit}>
        {pannes.map(pane => (
          <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
            {pane.content}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
}

TargetCharge.propTypes = {
  pannes: PropTypes.array.isRequired,
  activeKey: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  dataSource: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return {
    pannes: state.targetCharge.pannes,
    activeKey: state.targetCharge.activeKey,
    dataSource: state.targetCharge.dataSource,
  };
}

export default connect(mapStateToProps)(TargetCharge);
