import axios from 'axios';
import {
  // message,
  notification,
} from 'antd';
import { setAuthority, getToken, setScreenTime, setShowBack } from '../utils/authority';
// import { setAuthority } from '../utils/authority';
import Prompt from '../components/Prompt';

const instance = axios.create({
  timeout: 30000,
  withCredentials: true,
  // headers:{
  //   'X-Token': '12233333',
  // },
});

instance.interceptors.request.use(
  config => {
    if (config.method === 'post') {
      config.headers = {
        'X-Token': localStorage.getItem('token'),
        Accept: 'application/json',
      };
    }
    return config; // 添加这一行
  },
  error => {
    return Promise.reject(error);
  }
);
// function token(){
//   instance.defaults.headers.common['X-Token'] = getToken();
// }
const { urlHeader } = global.gconfig; // frontend/src/config
const urlService = 'http://rap2api.taobao.org/app/mock/7430/comment/';
const that = this;
export function erpPost(url, data, backfun, setFun) {
  instance
    .post(urlHeader + url, data)
    .then(res => {
      if (res.data.code === 200) {
        setScreenTime(60000);
        backfun(res);
      } else if (res.data.code === 508 || res.data.code === 601) {
        // 登入超时或者还未登入
        setAuthority('guest');
        const userList = JSON.parse(localStorage.getItem('userName'));
        if(userList === null){
          this.props.history.push('/user/login');
        }else{
          setScreenTime(0);
        }
        setFun();
      } else if (url === 'person/login') {
        backfun(res);
      } else {
        const obj = res.data.data;
        const list = (
          <div>
            {obj ? Object.keys(obj).map((key) => {
              return (
                <p>{obj[key]}</p>
              )
            }) : res.data.msg}
          </div>
        )
        Prompt.error({
          content:list,
        })
        setFun();
      }
    })
    .catch(error => {
      console.log(typeof error)
    });
}
/* 多个请求处理，产生一个回调
 * @param urlArr由请求的url和参数对象 组成的数组[{url:'',data:{}},{url:'',data:{}}]
 * @param backfun请求的回调，回调的参数 是多个请求的回调组成的数组
 */

export function fileDownload(url,data,success,error){
  const ajaxFile = axios.create({
    timeout: 30000,
    withCredentials: true,
  });
  ajaxFile.interceptors.request.use(
    config => {
      if (config.method === 'post') {
        config.headers = {
          'X-Token': localStorage.getItem('token'),
          Accept: '*/*',
        };
        config.responseType = 'blob';
      }
      return config; // 添加这一行
    },
    err => {
      return Promise.reject(err);
    }
  );
  ajaxFile.post(urlHeader + url, data)
    .then(res => {
      success(res);
    })
    .catch(err => {
      error(err);
    });
}

export function erpPostAll(urlArr, backfun) {
  if (Object.prototype.toString.call(urlArr) !== '[object Array]') {
    throw new Error("urlArr isn't a Array");
  }
  const requestArr = [];
  const badRequest = [];
  for (let i = 0, len = urlArr.length; i < len; i++) {
    const item = urlArr[i];
    let url = '';
    let paramObj = {};
    if (!item.url) {
      badRequest.push({ data: item, msg: 'url is null or undefined' });
      continue;
    }
    url = urlHeader + item.url;
    paramObj = Object.assign({}, paramObj, item.data);

    requestArr.push(instance.post(url, paramObj));
  }

  axios.all(requestArr).then(res => {
    if (Object.prototype.toString.call(backfun) === '[object Function]') backfun(res);
  });
}
export function erpService(url, data, backfun) {
  instance
    .post(urlService + url, data)
    .then(res => {
      if (res.data.code === 200) {
        backfun(res);
      } else {
        notification.error({
          message: '错误',
          description: res.data.mesg,
        });
      }

    })
    .catch(error => {
      notification.error({
        message: '错误',
        description: `服务器请求错误${error}`,
      });
    });
}
export function erpGet(url, backfun) {
  instance
    .get(urlHeader + url)
    .then(res => {
      backfun(res);
    })
    .catch(error => {
      notification.error({
        message: '错误',
        description: `服务器请求错误${error}`,
      });
    });
}

export function erpPostNew(url, data) {
  return instance
    .post(urlHeader + url, data)
    .then(res => {
      if (res.data.code === 200) {
        // callback(res)
        return res.data;
      } else if (res.data.code === 508 || res.data.code === 601) {
        // 登入超时或者还未登入
        setAuthority('guest');
        setShowBack(1);
        localStorage.removeItem('token');
        this.props.history.push('/user/login');
      }
    })
    .catch(error => ({ error }));
}
