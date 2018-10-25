<template>
  <div class="picker-month" ref="pickerMonth">
    <li v-for="item in ymData">
      <p>{{item.key}}年</p>
      <div> <span v-for="ii in 12" @click="datePicker(item,ii)">
    			<em :class="{'active-now':item.month[ii-1].isActiveNow,'active':item.month[ii-1].isActive,'disabled':item.month[ii-1].isDisabled}">{{item.month[ii-1].key}}</em>
    		</span> </div>
    </li>
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
      defaultInit: [String] /* 默认值 */
    },
    data () {
      return {
        ymData: [],
        defaultDate: [],
        nowYear: newDate.getFullYear(),
        nowMonth: newDate.getMonth() + 1
      }
    },
    created () {
      let startYear = ~~(this.rangeDate[0] || '1990')
      let endYear = ~~(this.rangeDate[1] || newDate.getFullYear())
      this.defaultDate = this.defaultInit && this.defaultInit.split('-').length === 2 && this.defaultInit.split('-') || []
      for (let i = endYear; i >= startYear; i--) {
        this.ymData.push({
          key: i,
          month: this.getMonths(i)
        })
      }
    },
    methods: {
      datePicker (item, ii) {
        if (item.month[ii - 1].isDisabled) return
        if (!item.month[ii - 1].isActive) {
          for (let i = 0; i < this.ymData.length; i++) {
            if (this.ymData[i].key === Number(this.defaultDate[0])) {
              this.ymData[i].month[this.defaultDate[1] - 1].isActive = false
              break
            }
          }
          item.month[ii - 1].isActive = true
          this.defaultDate = [item.key, ii] // 保存上次选择历史
        }
        this.checkPicker(`${item.key}-${ii}`.replaceDate())
      },
      getMonths (year) { /* 月信息添加控制参数 */
        let monArr = []
        for (let i = 1; i <= 12; i++) {
          monArr.push({
            key: i,
            isActive: Number(this.defaultDate[0]) === year && Number(this.defaultDate[1]) === i,
            isActiveNow: this.nowYear === year && this.nowMonth === i,
            isDisabled: year > this.nowYear || (year === this.nowYear && i > this.nowMonth)
          })
        }
        return monArr
      }
    }
  }
</script>
<style lang="scss">
  .picker-month {
    position: relative;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    color: #272D33;
    li {
      width: 100%;
      height: 364px;
      background-color: #FFFFFF;
      border-bottom: 1px solid #e1e2e7;
      /*no*/
      p {
        width: 100%;
        height: 140px;
        line-height: 140px;
        text-align: center;
        font-size: 36px;
        color: #fd9720;
      }
      div {
        width: 100%;
        display: flex;
        display: -webkit-flex;
        margin-bottom: 24px;
        flex-wrap: wrap;
        -webkit-flex-wrap: wrap;
        span {
          flex: 1 1 16.6666%;
          font-size: 32px;
          text-align: center;
          margin-bottom: 36px;
          display: flex;
          display: -webkit-flex;
          align-items: center;
          -webkit-align-items: center;
          justify-content: center;
          -webkit-justify-content: center;
          em {
            display: flex;
            display: -webkit-flex;
            align-items: center;
            -webkit-align-items: center;
            justify-content: center;
            -webkit-justify-content: center;
            width: 72px;
            height: 72px;
            line-height: 72px;
            border-radius: 50%;
          }
          em.active {
            background-color: #f39c12;
            color: #FFFFFF;
          }
          em.active-now {
            border: 2px solid #f39c12;
            /*no*/
          }
          em.disabled {
            color: #B1B2C7;
          }
        }
      }
    }
  }
  .picker-month::-webkit-scrollbar {
    display: none;
  }
  .picker-month::-webkit-scrollbar-track {
    display: none;
  }
  .picker-month::-webkit-scrollbar-thumb {
    display: none;
  }
</style>
