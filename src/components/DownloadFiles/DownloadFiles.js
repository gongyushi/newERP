import { fileDownload } from '../../services/ajax';

export default function downloadFiles (url,data,successFun,errorFun) {
  fileDownload(url,data,res => {
    const urls = res.data;
    const reader = new FileReader();
    reader.readAsDataURL(urls);
    reader.onload = (e) => {
      const a = document.createElement('a');
      a.download = JSON.parse(res.config.data).path;
      a.href = e.target.result;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    return successFun();
  },err => {
    return errorFun(err);
  });
}