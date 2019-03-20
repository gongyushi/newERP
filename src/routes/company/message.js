import React from 'react';
import { Tabs } from 'antd';
import styles from './message.less';
import MessageForm from './public/messageForm';

const { TabPane } = Tabs;

class Message extends React.Component {
  callback = key => {
    // console.log(key);
  };
  render() {
    return (
      <div className={styles.message}>
        <Tabs onChange={this.callback} type="card">
          <TabPane tab="企业信息" key="1" className={styles.messageContent}>
            <MessageForm />
          </TabPane>
          {/* <TabPane tab="Tab 2" key="2">Content of Tab Pane 2</TabPane>
              <TabPane tab="Tab 3" key="3">Content of Tab Pane 3</TabPane> */}
        </Tabs>
      </div>
    );
  }
}

export default Message;
