import React from 'react';
import { Select, Input, Button } from 'antd';
import styles from './index.less';

const { Option } = Select;
const { Search } = Input;
class ErpSearch extends React.Component {
  state = {
    selectFirst: this.props.timeChose,
    selectTow: this.props.companyChose,
  };
  componentWillMount() {
  }
  // 方法
  handleChange = value => {
    console.log(value); // { key: "lucy", label: "Lucy (101)" }
  };
  handleChangeName = value => {
    console.log(value); // { key: "lucy", label: "Lucy (101)" }
  };
  render() {
    const {hiddenFirst,hiddenSecond, hiddenThird,placeholder} = this.props;
    return (
      <div className={styles.erpSelect}>
        {hiddenFirst ? null : (
          <Select
            labelInValue
            defaultValue={{ key: this.state.selectFirst.name }}
            className={styles.accreSelect}
            onChange={this.handleChange}
            showSearch
            optionFilterProp='children'
          >
            {this.state.selectFirst.data.map(res => {
              return (
                <Option key={res.value} value={res.value}>
                  {res.name}
                </Option>
              );
            })}
          </Select>)}
        {hiddenSecond ? null : (
          <Select
            labelInValue
            defaultValue={{ key: this.state.selectTow.name }}
            className={styles.accreSelect}
            onChange={this.handleChangeName}
            showSearch
            optionFilterProp='children'
          >
            {this.state.selectTow.data.map(res => {
              return (
                <Option key={res.value} value={res.value}>
                  {res.name}
                </Option>
              );
            })}
          </Select>)}
        {hiddenThird ? null : (
          <Search
            placeholder={placeholder}
            onSearch={value => console.log(value)}
            style={{ width: 200 }}
          />)}
        <Button style={{ fontSize: '12' }} size="small" type="primary">
          搜索
        </Button>
      </div>
    );
  }
}

export default ErpSearch;
