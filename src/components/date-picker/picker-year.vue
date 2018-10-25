<template>
  <div class="picker-year">
    <li v-for="item in dateYear" @click="datePicker(item)" :class="{active:item.isActive}">{{item.key}}年</li>
  </div>
</template>
<script>
  let newDate = new Date()
  export default {
    props: {
      checkPicker: { /* callback回调函数 */
        type: Function,
        default: function () {
          return
        }
      },
      rangeDate: { /* 时间选择范围 */
        type: Array,
        default: ['1990', newDate.getFullYear()]
      },
      defaultInit: [String, Number] /* 默认值 */
    },
    data () {
      return {
        dateYear: []
      }
    },
    created () {
      let startYear = ~~(this.rangeDate[0] || '1990')
      let endYear = ~~(this.rangeDate[1] || newDate.getFullYear())
      for (let i = endYear; i >= startYear; i--) {
        this.dateYear.push({
          key: i,
          isActive: Number(this.defaultInit) === i
        })
      }
    },
    methods: {
      datePicker (val) {
        if (!val.isActive) {
          for (let i = this.dateYear.length; i--;) this.dateYear[i].isActive = false
          val.isActive = true
        }
        this.checkPicker(val.key)
      }
    }
  }
</script>
<style lang="scss">
  .picker-year {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: auto;
    font-size: 36px;
    color: #272D33;
    li {
      width: 100%;
      height: 102px;
      line-height: 102px;
      background-color: #FFFFFF;
      border-bottom: 1px solid #e1e2e7;
      /*no*/
      text-align: center;
    }
    li.active {
      color: #f39c12;
    }
  }
  .picker-year::-webkit-scrollbar {
    display: none;
  }
  .picker-year::-webkit-scrollbar-track {
    display: none;
  }
  .picker-year::-webkit-scrollbar-thumb {
    display: none;
  }
</style>
