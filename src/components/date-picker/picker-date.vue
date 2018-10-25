<template>
  <div class="picker-date">
    <p class="title-week"> <span v-for="wee in weekList">{{wee}}</span> </p>
    <div class="data-list" ref="pickerDate">
      <li v-for="(item,key) in ymdData" :id="'picker-' + key">
        <p class="title-ym"><span>{{getListTitle(key)}}</span></p>
        <div class="pick-date-list"> <span v-for="ii in item" @click="datePicker(key,ii)">
            <em :class="dataClass(ii)">{{ii&&ii.key||''}}</em>
          </span> </div>
      </li>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      checkPicker: { /* callback回调函数 */
        type: Function,
        default: function () {
          return
        }
      },
      rangeDate: { /* 显示日期范围 --具体月份 */
        type: Array,
        default: ['1990-1', new Date().getFullYear() + '-' + (new Date().getMonth() + 1)]
      },
      defaultInit: [String] /* 显示默认选中值 例如:'2017-8-8' */
    },
    data () {
      return {
        ymdData: {},
        weekList: ['日', '一', '二', '三', '四', '五', '六'],
        defaultDate: '',
        dateTime: this.newDate(),
        nowTime: new Date(this.newDate()).getTime()
      }
    },
    created () {
      this.defaultDate = this.defaultInit || ''
      let rangeDate01 = this.rangeDate[0].split('-')
      let rangeDate02 = this.rangeDate[1].split('-')
      let rangDate = [[~~rangeDate01[0], ~~rangeDate01[1]], [~~rangeDate02[0], ~~rangeDate02[1]]]
      this.initData(rangDate)
    },
    activated () {
      this.$nextTick(() => {
        this.setScorll()
      })
    },
    methods: {
      initData (rangDate) { /* 初始化日期选择面板 */
        // 循环年
        for (let i = rangDate[0][0]; i <= rangDate[1][0]; i++) {
          if (rangDate[0][0] === rangDate[1][0]) {
            // 当起始年等于截止年时，循环输出截止月到起始月集合
            for (let ii = rangDate[0][1]; ii <= rangDate[1][1]; ii++) {
              let dateThis = `${i}-${ii}`
              this.ymdData[dateThis] = this.getDates(i, ii)
            }
            break
          } else if (i === rangDate[1][0]) {
            // 当年份输出从截止年开始循环时，循环输出截止年的截止月到截止年1月的集合
            for (let ii = 1; ii <= rangDate[1][1]; ii++) {
              let dateThis = `${i}-${ii}`
              this.ymdData[dateThis] = this.getDates(i, ii)
            }
          } else if (i === rangDate[0][0]) {
            // 当年份输出循环到起始年时，循环输出起始年的起始月到起始年12月的集合
            for (let ii = rangDate[0][1]; ii <= 12; ii++) {
              let dateThis = `${i}-${ii}`
              this.ymdData[dateThis] = this.getDates(i, ii)
            }
          } else {
            // 当年份输出循环为起始年和截止年之间的年份时，循环输出该年份1月到12月的集合
            for (let ii = 1; ii <= 12; ii++) {
              let dateThis = `${i}-${ii}`
              this.ymdData[dateThis] = this.getDates(i, ii)
            }
          }
        }
        this.ymdData = Object.assign({}, this.ymdData)
      },
      datePicker (yymm, item) { /* 选中日期处理 */
        if (!item || item.isDisabled) return
        if (!item.isActive) {
          if (this.defaultDate) { // 防止没有传默认值进来
            let defaultArr = this.defaultDate.split('-')
            let yymmKey = `${defaultArr[0]}-${defaultArr[1]}`
            let positionDate = ~~new Date(`${yymmKey}-01`.replaceDate()).getDay() + ~~defaultArr[2] - 1
            this.ymdData[yymmKey][positionDate].isActive = false
          }
          item.isActive = true
          this.defaultDate = `${yymm}-${item.key}` // 保存上次选择历史
          this.ymdData = Object.assign({}, this.ymdData)
        }
        this.checkPicker(this.defaultDate.replaceDate())
      },
      getDates (yy, mm) { /* 加工日数据(添加控制参数) */
        let monArr = []
        let week = new Date(`${yy}-${mm}-1`.replaceDate()).getDay()
        let days = new Date(yy, mm, 0).getDate()
        let defaultTime = new Date(this.defaultDate.replaceDate()).getTime()
        for (let i = week, day = 1; i < (week + days > 35 ? 42 : 35); i++) {
          if (i < week + days) {
            let thisTime = new Date(`${yy}-${mm}-${day}`.replaceDate()).getTime()
            monArr[i] = {
              key: day,
              isActive: this.defaultDate && defaultTime === thisTime, // 选中状态
              isActiveNow: thisTime === this.nowTime, // 今天的选中状态
              isDisabled: thisTime > this.nowTime // 禁用状态
            }
            day++
          } else {
            monArr[i] = ''
          }
        }
        return monArr
      },
      setScorll () {
        let dateId = `picker-${this.defaultDate.split('-')[0]}-${this.defaultDate.split('-')[1]}`
        let scrollEle = document.getElementById(dateId)
        let scrollHeight = scrollEle ? scrollEle.offsetTop - 130 : this.$refs.pickerDate.scrollHeight
        if (this.$refs.pickerDate) this.$refs.pickerDate.scrollTop = scrollHeight
      },
      getListTitle (key) {
        let thisKey = key.split('-')
        return `${thisKey[0]}年${thisKey[1]}月`
      },
      dataClass (item) {
        return item ? {
          'active-now': item.isActiveNow,
          'active': item.isActive,
          'disabled': item.isDisabled
        } : {}
      }
    }
  }
</script>
<style lang="scss">
  .picker-date {
    position: relative;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    .title-week {
      width: 100%;
      height: 80px;
      display: flex;
      display: -webkit-flex;
      background: linear-gradient(to bottom, #f39c12, #f9ce89);
      color: #fff;
      span {
        flex: 1 1 14.2857%;
        font-size: 24px;
        display: flex;
        display: -webkit-flex;
        align-items: center;
        -webkit-align-items: center;
        justify-content: center;
        -webkit-justify-content: center;
      }
    }
    .data-list{
      height: calc(100% - 80px);
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      li {
        width: 100%;
        background-color: #FFFFFF;
        border-bottom: 1px solid #e3e6e8;/*no*/
        // margin-bottom: 26px;
        .title-ym {
          width: 100%;
          height: 130px;
          // line-height: 104px;
          font-weight: 600;
          padding-right: 45px; 
          padding-top: 70px;
          text-align: right;
          font-size: 40px;
          color: #f39c12;
          span{
            font-weight: 550;
            display: inline-block;
            padding-bottom: 10px;
            border-bottom: 1px solid #f39c12;/*no*/
          }
        }
        .pick-date-list {
          width: 100%;
          margin-bottom: 32px;
          display: flex;
          display: -webkit-flex;
          flex-wrap: wrap;
          -webkit-flex-wrap: wrap;
          span {
            flex: 1 1 14.2857%;
            height: 88px;
            font-size: 30px;
            color: #333;
            text-align: center;
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
              border: 2px solid #f39c12;/* no */
            }
            em.disabled {
              color: #B1B2C7;
            }
          }
        }
      }
    }
  }
  .picker-date::-webkit-scrollbar {
    display: none;
  }
  .picker-date::-webkit-scrollbar-track {
    display: none;
  }
  .picker-date::-webkit-scrollbar-thumb {
    display: none;
  }
</style>
