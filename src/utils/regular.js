// 正则验证封装


export function Verification (key,value,callback) {

}

// 基础校验
export function basicsVerify(rule, value, callback) {
  const str = /^[a-zA-Z0-9_-]{3,20}$/;
  if (!str.test(value)) {
    callback('您输入的格式有误，请重新输入')
  } else {
    callback()
  }
}
// QQ验证
export function qqVerify(rule, value, callback) {
  const str = /^[1-9][0-9]{4,14}$/;
  if (!str.test(value)) {
    callback('QQ格式有误')
  } else {
    callback()
  }
}
// 手机号码验证
export function phoneVerify(rule, value, callback) {
  const str = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
  if (!str.test(value)) {
    callback('手机号码格式有误')
  } else {
    callback()
  }
}
// email校验
export function emailVerify(rule, value, callback){
  const str = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (!str.test(value)) {
    callback('邮箱格式有误')
  } else {
    callback()
  }
}
// 微信号验证
export function wechatVerify(rule, value, callback){
  const str = /^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/;
  if (value && !str.test(value)) {
    callback('微信格式有误')
  } else {
    callback()
  }
}


// 