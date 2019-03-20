import React from 'react';
import { Tooltip } from 'antd';

class TimeCel extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      // date:this.props.date,
    };
  }

  timeData = time => {
    const date =
      typeof time === 'number' ? new Date(time) : new Date((time || '').replace(/-/g, '/'));
    // console.log(date)
    const diff = (new Date().getTime() - date.getTime()) / 1000;
    const dayDiff = Math.floor(diff / 86400);

    const isValidDate =
      Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());

    if (!isValidDate) {
      console.error('not a valid date');
      return time;
    }

    const today = new Date(date);
    const year = today.getFullYear();
    const month = `0 + ${today.getMonth() + 1}`.slice(-2);
    const day = `0 + ${today.getDate()}`.slice(-2);
    const hour = `0 + ${today.getHours()}`.slice(-2);
    const minute = `0 + ${today.getMinutes()}`.slice(-2);
    if (isNaN(dayDiff) || dayDiff < 0 || dayDiff >= 31) {
      return {
        singleTime: `${year} -${month}-${day}`,
        allTime: `${year}-${month}-${day} ${hour}:${minute}`,
      };
    }

    return (
      (dayDiff === 0 && {
        // singleTime: diff < 86400 && '今天',
        singleTime: `${year}-${month}-${day}`,
        allTime: diff < 86400 && `${year}-${month}-${day} ${hour}:${minute}`,
      }) || {
        // singleTime: dayDiff < 2 ? '昨天' : `${year}-${month}-${day}`,
        singleTime: `${year}-${month}-${day}`,
        allTime: `${year}-${month}-${day} ${hour}:${minute}`,
      }
    );
    // dayDiff < 3 && '前天' + `${hour}:${minute}` ||
    // dayDiff < 31 && `${month}-${day} ${hour}:${minute}`
  };
  render() {
    const time = (this.props.date && this.timeData(this.props.date)) || '';
    return (
      <Tooltip placement="bottom" title={time.allTime}>
        {time.singleTime}
      </Tooltip>
      // <div>
      //   {time.singleTime}
      // </div>
    );
  }
}

export default TimeCel;
