import React from 'react';
import moment from 'moment';
import { List } from 'antd';
import classNames from 'classnames';
import styles from './NoticeList.less';

export default function NoticeList({
  data = [],
  locale,
  emptyText,
  emptyImage,
  onShowModal,
  type,
}) {
  if (data.length === 0) {
    return (
      <div className={styles.notFound}>
        {emptyImage ? <img src={emptyImage} alt="not found" /> : null}
        <div>{emptyText || locale.emptyText}</div>
      </div>
    );
  }
  return (
    <div>
      <List 
        className={styles.list} 
        style={{ maxHeight: 500 }} 
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 7,
        }}
        dataSource={data}
        renderItem={(item,index) => (
          <List.Item
            onClick={onShowModal.bind(this, item, item.status === 0 ? 1 : null)}
            key={item.key || index}
          >               
            <div className={styles.txtDiv}>
              {type==='公告'?item.title:item.content}
            </div>
            <div className={styles.spaDiv}>{moment(item.updated_at).format('YYYY-MM-DD')}</div>
          </List.Item>
        )}
      />
        
    </div>
  );
}
