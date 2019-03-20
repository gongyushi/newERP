import React from 'react';
// import { Select } from 'antd';

// const { Option } = Select;
class Action extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      id: this.props.id,
    };
  }

  render() {
    let namevalue = '';
    this.state.data.map(val => {
      if (Number(val.key) === Number(this.state.id)) {
        namevalue = val;
      }
      return val;
    });
    return <div>{namevalue.value}</div>;
  }
}

export default Action;
