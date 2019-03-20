import React from 'react';
import { Table, Input, Select } from 'antd';

const { Option } = Select;
// 右边栏
class OrganRight extends React.Component {
  state = {
    data: [
      {
        key: '1',
        edit: false,
        name: '小李',
        coding: 32,
        phone: '15960563833',
        email: '1107850422@qq.com',
        position: '前端',
        time: '2016-4-10',
        skill: '中级',
      },
      {
        key: '2',
        edit: false,
        name: '小会',
        coding: 32,
        phone: '15960563833',
        email: '1107850422@qq.com',
        position: '后端',
        time: '2016-4-10',
        skill: '高级',
      },
      {
        key: '3',
        edit: false,
        name: '李小浩',
        coding: 32,
        phone: '15960563833',
        email: '1107850422@qq.com',
        position: 'UI',
        time: '2016-4-10',
        skill: '中级',
      },
    ],
    columns: [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        render: text => <a href="#">{text}</a>,
      },
      {
        title: '员工编码',
        dataIndex: 'coding',
        key: 'coding',
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
        key: 'phone',
        render: (text, record) => {
          return record.edit ? <Input value={text} /> : text;
        },
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        render: (text, record) => {
          return record.edit ? <Input value={text} /> : text;
        },
      },
      {
        title: '职位',
        dataIndex: 'position',
        key: 'position',
        render: (text, record) => {
          return record.edit ? <Input value={text} /> : text;
        },
      },
      {
        title: '入职时间',
        dataIndex: 'time',
        key: 'time',
      },
      {
        title: '技能级别',
        dataIndex: 'skill',
        key: 'skill',
        render: (text, record) => {
          return record.edit ? (
            <Select 
              labelInValue 
              defaultValue={{ key: text }} 
              style={{ width: 120 }}
              showSearch
              optionFilterProp='children'
            >
              <Option value="jack">Jack (100)</Option>
              <Option value="lucy">Lucy (101)</Option>
            </Select>
          ) : (
            <div>text</div>
          );
        },
      },
      {
        title: '操作',
        key: 'action',
        render: () => {
          return (
            <span>
              <span>删除</span>
              {/* <Divider type="verticalssss" />
                  <a href="#">Delete</a>
                  <Divider type="vertical" />
                  <a href="#" className="ant-dropdown-link">
                      More actions <Icon type="down" />
                  </a> */}
            </span>
          );
        },
      },
    ],
  };
  componentWillReceiveProps(nextprops) {
    console.log(nextprops);
    this.setState({});
  }
  render() {
    return (
      <div>
        <Table columns={this.state.columns} dataSource={this.state.data} />
      </div>
    );
  }
}

export default OrganRight;
