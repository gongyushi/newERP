import React from 'react';
import { Tooltip } from 'antd';
import moment from 'moment';

class RecentTime extends React.Component {
  static defaultProps = {
    date : moment().format('YYYY-MM-DD HH:mm:ss'),
  };
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      fullTime: '',
      shortTime: '',
    };
  };
  componentDidMount = () => {
    const { date } = this.props;
    let showDate = moment();
    if(moment(date).isValid()){
      showDate = moment(date);
    }
    const fullTime = showDate.format('YYYY-MM-DD HH:mm');
    this.setState({
      fullTime,
    });
    const diff = (new Date().getTime() - (new Date(date)).getTime()) / 1000;
    const dayDiff = Math.floor(diff / 86400);

    if(dayDiff > 8){
      this.setState({
        shortTime: fullTime,
      });
      return;
    }

    if(diff <= 60) {
      this.setState({
        shortTime: `刚刚`,
      });
      return;
    }

    if(diff < 60 * 60) { // 3600
      this.setState({
        shortTime: `${parseInt(diff/60, 10)} 分钟前`,
      });
      return;
    }

    if(diff < 24 * 60 * 60) { // 86400
      this.setState({
        shortTime: `${parseInt(diff/60/60, 10)} 小时前`,
      });
      return;
    }

    if(diff < 8 * 24 * 60 * 60) {  // 691200
      this.setState({
        shortTime: `${parseInt(diff/24/60/60, 10)} 天前`,
      });
      return;
    }

    return {
      shortTime: showDate.format('YYYY-MM-DD'),
    };
  };
  render() {
    const {fullTime, shortTime } = (this.state);
    return (
      <Tooltip placement="bottom" title={fullTime}>
        {shortTime}
      </Tooltip>
    );
  };
}

export default RecentTime;
