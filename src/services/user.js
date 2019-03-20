import request from '../utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/currentUser');
}

// export async function setInterFun(a) {
//   let time = 5;
//   if (a === 1 && time>0){
//     setInterval(() => {
//       time = time-1;
//     }, 1000)
//   }else{
//     return false;
//   }
  
 
  
// }
