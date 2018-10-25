import Vue from 'vue'
import App from './App.vue'
Vue.prototype.newDate = () => {
  let time = new Date()
  let year = time.getFullYear()
  let month = time.getMonth() + 1
  let date = time.getDate()
  return `${year}-${month < 10 ? '0' + month : month}-${date < 10 ? '0' + date : date}`
}
/* 获取日期毫秒数 */
window.Date.prototype.getTimes = function () {
  return new Date(this.toLocaleDateString().replace(/[/]/g, '-').replaceDate()).getTime()
}
/* 字符串日期格式转换2017-8-6 ==> 2017-08-06 || 2017-8 ==> 2017-08 */
window.String.prototype.replaceDate = function () {
  if (Object.prototype.toString.call(this) !== '[object String]' || /^(\d{4})-(\d{2})-(\d{2})$/.test(this)) {
    return this
  }
  let strArr = this.split('-')
  for (let ii = strArr.length; ii--;) {
    if (strArr[ii].length === 1) strArr[ii] = `0${strArr[ii]}`
  }
  return strArr.join('-')
}
/* 字符串日期格式转换2017-08-06 ==> 2017-8-6 || 2017-08 ==> 2017-8 */
window.String.prototype.repBackDate = function () {
  if (Object.prototype.toString.call(this) !== '[object String]') {
    return this
  }
  let strArr = this.split('-')
  for (let ii = strArr.length; ii--;) {
    if (strArr[ii].length === 2 && strArr[ii].substring(0, 1) === '0') strArr[ii] = strArr[ii].substring(1)
  }
  return strArr.join('-')
}
/* 替换字符- */
window.String.prototype.trimType = function (reg, str) { // reg新字符 str要被替换的原字符
  return this.replace(new RegExp(str || '-', 'gm'), reg || '')
}
new Vue({
  el: '#app',
  render: h => h(App)
})
