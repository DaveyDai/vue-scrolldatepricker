<template>
  <div class="picker-date">
    <div class="picker-rangeDate-data" ref="pickerRangeDateData">
      <li v-for="(item,key) in ymdData">
        <p class="title-ym">{{getListTitle(key)}}</p>
        <p class="title-week"> <span v-for="wee in weekList">{{wee}}</span> </p>
        <div class="pick-date-list"> <span v-for="ii in item" @click="datePicker(key,ii)" :class="dataClass(ii)">
            <em>{{ii&&ii.key||''}}</em>
          </span> </div>
      </li>
    </div>
    <div class="rangeMonth-info"> <span class="rangeMonth-info-dates" :class="{'falseDate':!selectDate.length}">{{selectDateStr}}</span> <button class="rangeMonth-info-button" :class="{'rangeMonth-info-button-active':this.selectDate.length==2}" @click="putChoiceDate">确定</button> </div>
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
      rangeDate: { /* 显示日期范围 --具体月份 */
        type: Array,
        default: ['1990-1', newDate.getFullYear()]
      },
      defaultInit: [Array] /* 默认选中时间范围 例如:['2017-8-8', '2017-10-09'] */
    },
    data () {
      return {
        ymdData: {},
        weekList: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        defaultDate: '',
        nowTime: newDate.getTimes(), // 本日时间戳
        selectDate: [], // 当前选中值
        selDateCompare: [] // 格式化后当前选中值---方便比较
      }
    },
    created () {
      let rangeDate01 = this.rangeDate[0].split('-')
      let rangeDate02 = this.rangeDate[1].split('-')
      let rangDate = [[~~rangeDate01[0], ~~rangeDate01[1]], [~~rangeDate02[0], ~~rangeDate02[1]]]
      this.selectDate = this.defaultInit.length === 2 ? [this.defaultInit[0], this.defaultInit[1]] : [] // 外部调用传入的默认选中值赋值到当前选中值，比如直接关闭时回调此参数
      this.selDateCompare = this.setSelectDate(this.selectDate) // 转换格式
      this.initData(rangDate)
    },
    mounted () {},
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
          } else if (i === rangDate[0][0]) {
            // 当年份输出循环到起始年时，循环输出起始年的起始月到起始年12月的集合
            for (let ii = rangDate[0][1]; ii <= 12; ii++) {
              let dateThis = `${i}-${ii}`
              this.ymdData[dateThis] = this.getDates(i, ii)
            }
          } else if (i === rangDate[1][0]) {
            // 当年份输出从截止年开始循环时，循环输出截止年的截止月到截止年1月的集合
            for (let ii = 1; ii <= rangDate[1][1]; ii++) {
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
        // console.log('this.ymdData: ', this.ymdData)
      },
      datePicker (yymm, item) { /* 选中日期处理 */
        if (!item.key || item.isDisabled) return
        let choiceTime = `${yymm}-${item.key}` // 点击选中值
        if (!this.selectDate.length) { // 当一个都没选过时
          item.oneActive = true // 把当前选项设置为选中状态
          this.ymdData = Object.assign({}, this.ymdData) // 更新视图
          this.selectDate.push(choiceTime) // 把选中值添加到已选数组中
        } else if (this.selectDate.length === 1) { // 当已经选了一个的时候
          // 把选中的第一个值的 选中状态取消 （因为要替换成有带半边背景的状态，覆盖的话重新选中需要再遍历一遍）
          let tmpDate = this.selectDate[0].split('-')
          let week = new Date(`${tmpDate[0]}-${tmpDate[1]}-1`.replaceDate()).getDay()
          this.ymdData[tmpDate[0] + '-' + tmpDate[1]][Number(tmpDate[2]) + Number(week) - 1].oneActive = false
          // 把选中值添加到已选数组中（跟第一个值比较一下，大的放后面）
          this.selectDate = this.selDateCompare[0].getTime() < new Date(choiceTime.replaceDate()).getTime() ? [this.selectDate[0], choiceTime] : [choiceTime, this.selectDate[0]]
          // 把已选数组的两个数据转成2维数组方便筛选
          let timeArr = this.repalceRangeDate([this.selectDate[0].split('-'), this.selectDate[1].split('-')])
          this.updateData(timeArr, true)
          // this.changeList(timeArr, true)
        } else if (this.selectDate.length === 2) {
          // debugger
          item.oneActive = true // 把选中值的单个选中状态激活
          // 把已选数组的两个数据转成2维数组方便筛选
          let timeArr = this.repalceRangeDate([this.selectDate[0].split('-'), this.selectDate[1].split('-')])
          this.updateData(timeArr, false)
          // this.changeList(timeArr, false)
          this.selectDate = [choiceTime]
        }
        this.selDateCompare = this.setSelectDate(this.selectDate) // 把选中的值转换成可对比的时间格式保存起来，不用每次比较都去转换一次
      },
      getDates (yy, mm) { /* 加工日数据(添加控制参数) */
        let monArr = []
        let week = new Date(`${yy}-${mm}-1`.replaceDate()).getDay()
        let days = new Date(yy, mm, 0).getDate()
        let thisTimeStart = new Date(`${yy}-${mm}-${1}`.replaceDate()).getTime() // 当月1号 毫秒比较值
        let thisTimeEnd = new Date(`${yy}-${mm}-${days}`.replaceDate()).getTime() // 当月结束日 毫秒比较值
        for (let i = 0, day = 1; i < (week + days > 35 ? 42 : 35); i++) {
          let thisTime = new Date(`${yy}-${mm}-${day}`.replaceDate()).getTime()
          if (i < week && this.getDefaultDate(thisTimeStart)) { // 没有数据的格子的添加背景色
            monArr[i] = { key: '', isActive: true }
          } else if (i >= week && i < week + days) {
            monArr[i] = {
              key: day,
              isActive: this.selectDate.length ? this.getDefaultDate(thisTime) : false, // 选中开始结束时间后 中间的月份高亮状态 单单有一个背景的那个状态
              isActiveNow: thisTime === this.nowTime, // 当前日的状态
              isDisabled: thisTime > this.nowTime, // 是否禁用的状态
              isActiveStart: this.selectDate.length === 2 && thisTime === this.selDateCompare[0].getTime(), // 开始时间选中状态有半边背景那种
              isActiveEnd: this.selectDate.length === 2 && thisTime === this.selDateCompare[1].getTime(), // 结束时间选中状态有半边背景那种
              oneActive: false // 单个选中状态（开始结束背景蓝色的那种,没有半边背景的那种,因为区间选择初始传入默认值是没有单个的）
            }
            day++
          } else if (i >= week + days && this.getDefaultDate(thisTimeEnd)) { // 没有数据的格子的添加背景色
            monArr[i] = { key: '', isActive: true }
          } else {
            monArr[i] = { key: '', isActive: false }
          }
        }
        return monArr
      },
      setSelectDate (dateList) { // 转换时间格式
        return dateList.length ? dateList.length === 1 ? [new Date(dateList[0].replaceDate())] : [new Date(dateList[0].replaceDate()), new Date(dateList[1].replaceDate())] : []
      },
      getDefaultDate (yearm) { // 判断是否在选择期间范围内
        return this.selDateCompare[0] < yearm && yearm < this.selDateCompare[1]
      },
      getListTitle (key) {
        let thisKey = key.split('-')
        return `${thisKey[0]}年${thisKey[1]}月`
      },
      repalceRangeDate (arr) {
        return [[~~arr[0][0], ~~arr[0][1], ~~arr[0][2]], [~~arr[1][0], ~~arr[1][1], ~~arr[1][2]]]
      },
      getMonthCompare (monthItem, selMonth) { // 判断当前月份是否在选中月份中
        let month = new Date(monthItem.replaceDate()).getTime()
        return selMonth[0] <= month && month <= selMonth[1]
      },
      dataClass (item) {
        return item ? {
          'active-now': item.isActiveNow,
          'active': item.isActive,
          'disabled': item.isDisabled,
          'active-start': item.isActiveStart,
          'active-end': item.isActiveEnd,
          'one-active': item.oneActive
        } : {}
      },
      updateData (timeArr, active) { /* 筛选选择项(更新选中状态方法) */
        let startMonth = `${timeArr[0][0]}-${timeArr[0][1]}` // 选择值开始日期所在月份（等于数据集的index值）
        let endMonth = `${timeArr[1][0]}-${timeArr[1][1]}` // 选择值结束日期所在月份（等于数据集的index值）
        // 开始和结束月份转换成比较单位
        let selMonth = [new Date(startMonth.replaceDate()).getTime(), new Date(endMonth.replaceDate()).getTime()]
        let startWeek = new Date(`${startMonth}-1`.replaceDate()).getDay() // 开始日期所在月份1号是星期几
        if (startMonth === endMonth) { // 开始日期所在月份等于结束日期所在月份时
          for (let i = startWeek + timeArr[0][2], monLength = startWeek + timeArr[1][2] - 1; i < monLength; i++) {
            this.ymdData[startMonth][i].isActive = active
          }
        } else { // 选中的日期不在同一个月份
          for (let monthItem in this.ymdData) { // 根据index值遍历找出选选择的月份
            // 只有当前item在选择日期范围内才进入日循环
            if (this.ymdData.hasOwnProperty(monthItem) && this.getMonthCompare(monthItem, selMonth)) {
              let week = new Date(`${monthItem}-1`.replaceDate()).getDay() // 当前月份1号是星期几
              if (startMonth === monthItem) { // 开始日期所在月份
                for (let i = week + timeArr[0][2]; i < this.ymdData[monthItem].length; i++) {
                  this.ymdData[monthItem][i].isActive = active
                }
              } else if (endMonth === monthItem) { // 结束日期所在月份
                for (let i = 0, monLength = week + timeArr[1][2] - 1; i < monLength; i++) {
                  this.ymdData[monthItem][i].isActive = active
                }
              } else { // 其他中间月份
                this.ymdData[monthItem].forEach((item) => {
                  item.isActive = active
                })
              }
            }
          }
        }
        if (this.selectDate[0] === this.selectDate[1]) { // 当选中两个相同日期时 只把选中的值添加单个选中状态 否则添加半边背景的选择状态
          this.ymdData[startMonth][timeArr[0][2] + startWeek - 1].oneActive = active
        } else {
          let week = new Date(`${timeArr[1][0]}-${timeArr[1][1]}-1`.replaceDate()).getDay()
          this.ymdData[startMonth][timeArr[0][2] + startWeek - 1].isActiveStart = this.ymdData[endMonth][timeArr[1][2] + week - 1].isActiveEnd = active
        }
        this.ymData = Object.assign({}, this.ymData) // 更新视图
      },
      changeList (timeArr, active) { /* 筛选选择项(更新选中状态方法) */
        for (let i = timeArr[0][0]; i <= timeArr[1][0]; i++) { // 遍历选中值的区间数据,循环年
          if (timeArr[0][0] === timeArr[1][0]) {  // 起始年份等于截止年份，遍历起始月份到截止月份，更新选中状态
            for (let ii = timeArr[0][1]; ii <= timeArr[1][1]; ii++) {
              let week = new Date(`${i}-${ii}-1`.replaceDate()).getDay()
              console.log(`${i}-${ii}月是星期: `, week)
              // debugger
              if (timeArr[0][1] === timeArr[1][1]) {
                // 若起始月等于截止月，则遍历起始日到截止日
                for (let iii = timeArr[0][2] + 1; iii < timeArr[1][2]; iii++) {
                  this.ymdData[`${i}-${ii}`][iii + week - 1].isActive = active
                }
              } else if (ii === timeArr[0][1]) {
                // 若遍历月等于起始月，遍历起始日到月最大日数
                let maxDate = new Date(i, ii, 0).getDate()
                console.log(`${i}年${ii}月最大天数`, maxDate)
                console.log('this.ymdData: ', this.ymdData)
                for (let k = timeArr[0][2] + 1; k <= maxDate; k++) {
                  console.log('k: ', k)
                  this.ymdData[`${i}-${ii}`][k + week - 1].isActive = active
                }
                this.fillBackSpace(i, ii, week, maxDate)
              } else if (ii === timeArr[1][1]) {
                // 若遍历月等于截止月，遍历1日到截止日
                for (let iii = 1; iii < timeArr[1][2]; iii++) {
                  this.ymdData[`${i}-${ii}`][iii + week - 1].isActive = active
                }
              } else {
                // 其余月份，遍历1日到月最大日
                let maxDate = new Date(i, ii, 0).getDate()
                console.log(`${i}年${ii}月最大天数`, maxDate)
                for (let k = 1; k <= maxDate; k++) {
                  let week = new Date(`${i}-${ii}-1`.replaceDate()).getDay()
                  console.log(`${i}-${ii}-${k}`, this.ymdData[`${i}-${ii}`][k - 1])
                  this.ymdData[`${i}-${ii}`][k + week - 1].isActive = active
                }
              }
            }
          } else if (i === timeArr[0][0]) {
            // 若遍历年等于起始年时，遍历起始月12月
            for (let ii = timeArr[0][1] + 1; ii <= 12; ii++) {
              let week = new Date(`${i}-${ii}-1`.replaceDate()).getDay()
              if (ii === timeArr[0][1]) {
                // 若遍历月等于起始月，遍历起始日到月最大日
                let maxDate = new Date(i, ii, 0).getDate()
                console.log(`${i}年${ii}月最大天数`, maxDate)
                for (let iii = timeArr[0][2] + 1; iii <= maxDate; iii++) {
                  this.ymdData[`${i}-${ii}`][iii + week - 1].isActive = active
                }
              } else {
                // 其余月份，遍历1日到月最大日
                let maxDate = new Date(i, ii, 0).getDate()
                console.log(`${i}年${ii}月最大天数`, maxDate)
                for (let iii = 1; iii <= maxDate; iii++) {
                  this.ymdData[`${i}-${ii}`][iii + week - 1].isActive = active
                }
              }
            }
          } else if (i === timeArr[1][0]) {
            // 若遍历年等于截止年，遍历1月到截止月
            for (let ii = 1; ii < timeArr[1][1]; ii++) {
              let week = new Date(`${i}-${ii}-1`.replaceDate()).getDay()
              if (ii === timeArr[1][1]) {
                // 若遍历月等于截止月，遍历1日到截止日
                for (let iii = 1; iii < timeArr[1][2]; i++) {
                  this.ymdData[`${i}-${ii}`][iii + week - 1].isActive = active
                }
              } else {
                // 其余月份，遍历1日到月最大日
                let maxDate = new Date(i, ii, 0).getDate()
                console.log(`${i}年${ii}月最大天数`, maxDate)
                for (let iii = 1; iii <= maxDate; iii++) {
                  this.ymdData[`${i}-${ii}`][iii + week - 1].isActive = active
                }
              }
            }
          } else {
            // 其余年，遍历1月到12月
            for (let ii = 1; ii <= 12; ii++) {
              let week = new Date(`${i}-${ii}-1`.replaceDate()).getDay()
              // 遍历1日到月最大日
              let maxDate = new Date(i, ii, 0).getDate()
              console.log(`${i}年${ii}月最大天数`, maxDate)
              for (let iii = 1; iii <= maxDate; iii++) {
                this.ymdData[`${i}-${ii}`][iii + week - 1].isActive = active
              }
            }
          }
        }
        if (this.selectDate[0] === this.selectDate[1]) { // 当选中两个相同月份时 只把选中的值添加单个选中状态 否则添加半边背景的选择状态
          let week = new Date(`${timeArr[0][0]}-${timeArr[0][1]}-1`.replaceDate()).getDay()
          this.ymdData[`${timeArr[0][0]}-${timeArr[0][1]}`][timeArr[0][2] + week - 1].oneActive = active
        } else {
          let week = new Date(`${timeArr[0][0]}-${timeArr[0][1]}-1`.replaceDate()).getDay()
          let week2 = new Date(`${timeArr[1][0]}-${timeArr[1][1]}-1`.replaceDate()).getDay()
          this.ymdData[`${timeArr[0][0]}-${timeArr[0][1]}`][timeArr[0][2] + week - 1].isActiveStart = this.ymdData[`${timeArr[1][0]}-${timeArr[1][1]}`][timeArr[1][2] + week2 - 1].isActiveEnd = active
        }
        this.ymdData = Object.assign({}, this.ymdData) // 更新视图
      },
      fillBackSpace (i, ii, week, endDay) {
        // 填充月末空格，参数依次为yyyy-m，该月初空格占位个数，该月最大天数
        // let maxDateWeek = new Date(i, ii, endDay).getDay()
        // let spaceNum = 6 - Number(maxDateWeek)
        // for (let j = 0; j < spaceNum; j++) {
        //   this.ymdData[`${i}-${ii}`][iii + week - 1].isActive = active
        //   [j]
        // }
        // this.ymdData[`${i}-${ii}`][k + week - 1].isActive = active
      },
      putChoiceDate () { // 点击确定，如果选够2个值 回调callback
        if (this.selectDate.length === 2) this.checkPicker([this.selectDate[0].replaceDate(), this.selectDate[1].replaceDate()])
      }
    },
    computed: {
      selectDateStr () {
        return !this.selectDate.length && '请选择日区间' || `${this.selectDate[0].trimType('.')} - ${this.selectDate[1] && this.selectDate[1].trimType('.') || ''}`
      }
    }
  }
</script>
<style lang="scss">
  .picker-date {
    position: relative;
    height: 100%;
    width: 100%;
    // overflow-y: auto;
    // overflow-x: hidden;
    color: #272D33;
    overflow: hidden;
    .picker-rangeDate-data {
      height: calc(100% - 100px);
      overflow-y: auto;
      overflow-x: hidden;
      li {
        width: 100%;
        background-color: #FFFFFF;
        border-bottom: 1px solid #e1e2e7;/*no*/
        margin-bottom: 26px;
        .title-ym {
          width: 100%;
          height: 104px;
          line-height: 104px;
          text-align: center;
          font-size: 36px;
          color: #FD9720;
          border-bottom: 1px solid #e1e2e7;/*no*/
        }
        .title-week {
          width: 100%;
          height: 60px;
          display: flex;
          display: -webkit-flex;
          margin-bottom: 10px;
          span {
            flex: 1 1 14.2857%;
            font-size: 28px;
            color: #888999;
            display: flex;
            display: -webkit-flex;
            align-items: center;
            -webkit-align-items: center;
            justify-content: center;
            -webkit-justify-content: center;
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
            position: relative;
            flex: 1 1 14.2857%;
            // height: 88px;
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
            // em.active {
            //   background-color: #f39c12;
            //   color: #FFFFFF;
            // }
            // em.active-now {
            //   border: 2px solid #f39c12;/* no */
            // }
            // em.disabled {
            //   color: #B1B2C7;
            // }
          }
          span.active-now {
            background-color: #FFF;
            em {
              border: 2px solid #f39c12;
              /*no*/
            }
          }
          // span.active-start, span.active-end {
          //   background-color: #fff;
          // }
          span.active-start em, span.active-end em {
            background-color: #f39c12;
            color: #FFFFFF;
            z-index: 999;
          }
          span.active-start:after, span.active-end:after {
            display: block;
            position: absolute;
            top: 0;
            content: "";
            width: 50%;
            height: 72px;
            z-index: 100;
            background: #f1e6d5;
          }
          span.active-start:after {
            right: 0;
          }
          span.active-end:after {
            left: 0;
          }
          span.active {
            background-color: #f1e6d5;
          }
          span.one-active {
            em {
              background-color: #f39c12;
              color: #FFFFFF;
            }
          }
          span.disabled {
            em {
              color: #B1B2C7;
            }
          }
        }
      }
    }
    .rangeMonth-info {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100px;
      line-height: 96px;
      margin-top: 26px;
      background-color: #FFFFFF;
      border-top: 1px solid #e1e2e7;
      /*no*/
      display: flex;
      display: -webkit-flex;
      .rangeMonth-info-dates {
        display: inline-block;
        text-align: center;
        width: 474px;
        height: 100px;
        font-size: 36px;
        color: #FD9720;
      }
      .falseDate {
        color: #B1B2C7;
      }
      button {
        display: inline-block;
        width: 276px;
        height: 100px;
        font-size: 36px;
        color: #FFF;
        border: 0;
      }
      button.rangeMonth-info-button {
        background-color: #f9ce89;
      }
      button.rangeMonth-info-button-active {
        background-color: #f39c12;
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
