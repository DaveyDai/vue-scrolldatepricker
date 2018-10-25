<template>
  <div id="app">
    <div class="picker-date-botton" @click="showDatePicker">选择日期</div>
    <div class="data-show">{{date}}</div>
    <keep-alive>
      <component :is="filterView" :init-picker="datePickerParam" :chioce-datetime="setDatetime"></component>
    </keep-alive>
  </div>
</template>

<script>
  const DatePicker = resolve => require(['./components/date-picker/date-picker'], resolve)
  export default {
    data () {
      return {
        filterView: '', // 动态组件控制参数
        date: '',
        datePickerParam: [ // type 类型 defaultDate 首次加载默认选中值 rangeDate 日期选择范围
          { type: 0, defaultDate: '2018-10-10' }, // 日期选择（不能选今天之后的日期）
          { type: 1, defaultDate: '', rangeDate: [2000, 2018] }, // 月份选择（不能选这个月之后的月份）
          { type: 2, rangeDate: [1970, 2100] }, // 选择年份
          { type: 3, defaultDate: ['2001-05', '2001-09'] }, // 月区间选择（不能超过当前月份）
          { type: 4 }, // 日区间选择（不能超过当前日期）
          { type: 5, defaultDate: '2018-10-10', name: '日期' } // 日期选择
        ] // 日期组件参数
      }
    },
    methods: {
      showDatePicker () {
        this.filterView = DatePicker
      },
      setDatetime (val) { // 选择完成回调 关闭 返回false
        if (val) this.date = val
        this.filterView = ''
      }
    }
  }
</script>
<style lang="scss">
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
  }

  a {
    color: #42b983;
  }
  .picker-date-botton{
    border-radius: 10px;
    width: auto;
    display: inline-block;
    padding: 15px 25px;
    background: #f39c12;
    color: #FFF;
    line-height: 100%;
  }
  .picker-date-botton, .data-show{
    font-size: 36px;
    margin-top: 50px;
  }
  *{
    box-sizing: border-box;
  }
</style>
