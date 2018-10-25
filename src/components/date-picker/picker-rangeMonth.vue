<template>
  <div class="picker-rangeMonth">
    <div class="picker-rangeMonth-data" id="pickerRangeMonthData">
      <li v-for="(item,key) in ymData">
        <p><span>{{key}}年</span></p>
        <div class="rangeMonth-data-li"> <span v-for="ii in item" @click="datePicker(key,ii)" :class="{'active':ii.isActive,'active-now':ii.isActiveNow,'disabled':ii.isDisabled,'active-start':ii.isActiveStart,'active-end':ii.isActiveEnd,'one-active':ii.oneActive}">
	    			<em>{{ii.key}}月</em>
	    		</span> </div>
      </li>
    </div>
    <div class="rangeMonth-info">
      <span class="rangeMonth-info-dates">
        <div>开始时间：<em>{{selectDate[0]&&`${selectDate[0].split('-')[0]}年${selectDate[0].split('-')[1]}月`||''}}</em></div>
        <div>结束时间：<em>{{selectDate[1]&&`${selectDate[1].split('-')[0]}年${selectDate[1].split('-')[1]}月`||''}}</em></div>
      <!-- {{!selectDate.length && '请选择月区间' || `${selectDate[0].trimType('.')} - ${selectDate[1] && selectDate[1].trimType('.')||''}`}} -->
      </span>
      <button class="rangeMonth-info-button" :class="{'rangeMonth-info-button-active':this.selectDate.length==2}" @click="putChoiceDate">确定</button>
    </div>
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
      defaultInit: [Array, String] /* 默认选中时间 例如:['2015-4','2016-7'] 开始结束月份 */
    },
    data () {
      return {
        ymData: {}, // 显示数据集
        nowTime: new Date(`${newDate.getFullYear()}-${newDate.getMonth() + 1}`.replaceDate()).getTime(),
        defaultDate: [], // 传入默认选中值
        selectDate: [], // 当前选中值
        selDateCompare: [] // 格式化后当前选中值---方便比较
      }
    },
    created () {
      let startYear = ~~(this.rangeDate[0] || '1990') // 数据集开始时间
      let endYear = ~~(this.rangeDate[1] || newDate.getFullYear()) // 数据集结束时间
      this.selectDate = JSON.parse(JSON.stringify(this.defaultInit)) || [] // 默认选中时间
      this.selDateCompare = this.setSelectDate(this.selectDate) // 转换格式
      for (let i = startYear; i <= endYear; i++) this.ymData[i] = this.getMonths(i) // 组装数据
    },
    methods: {
      datePicker (year, item) { /* 选取月份 数据处理 更新视图 */
        // 已经禁用的时候直接return
        if (item.isDisabled) return
        // 当前已选中 或者 已经禁用的时候直接return
        // if (item.isDisabled || (this.selectDate.length === 1 && this.selDateCompare[0].getTime() === new Date(choiceTime.replaceDate()).getTime())) return
        let choiceTime = `${year}-${item.key}` // 点击选中值
        if (!this.selectDate.length) { // 当一个都没选过时
          item.oneActive = true // 把当前选项设置为选中状态
          this.ymData = Object.assign({}, this.ymData) // 更新视图
          this.selectDate.push(choiceTime) // 把选中值添加到已选数组中
        } else if (this.selectDate.length === 1) { // 当已经选了一个的时候
          // 把选中的第一个值的 选中状态取消 （因为要替换成有带半边背景的状态，覆盖的话重新选中需要再遍历一遍）
          this.ymData[this.selectDate[0].split('-')[0]][this.selectDate[0].split('-')[1] - 1].oneActive = false
          // 把选中值添加到已选数组中（跟第一个值比较一下，大的放后面）
          this.selectDate = this.selDateCompare[0].getTime() < new Date(choiceTime.replaceDate()).getTime() ? [this.selectDate[0], choiceTime] : [choiceTime, this.selectDate[0]]
          // 把已选数组的两个数据转成2维数组方便筛选
          let timeArr = this.repalceMonth([this.selectDate[0].split('-'), this.selectDate[1].split('-')])
          this.changeList(timeArr, true)
        } else if (this.selectDate.length === 2) {
          // 把已选数组的两个数据转成2维数组方便筛选
          let timeArr = this.repalceMonth([this.selectDate[0].split('-'), this.selectDate[1].split('-')])
          this.changeList(timeArr, false)
          item.oneActive = true // 把选中值的单个选中状态激活
          this.selectDate = [choiceTime]
        }
        this.selDateCompare = this.setSelectDate(this.selectDate) // 把选中的值转换成可对比的时间格式保存起来，不用每次比较都去转换一次 感觉也没多大用处!!~~
      },
      repalceMonth (arr) {
        return [[~~arr[0][0], ~~arr[0][1]], [~~arr[1][0], ~~arr[1][1]]]
      },
      getMonths (year) { /* 月份信息添加控制参数 */
        let monArr = []
        for (let i = 1; i <= 12; i++) {
          let yearm = new Date(`${year}-${i}`.replaceDate()).getTime()
          monArr.push({
            key: i,
            isActive: this.selectDate.length ? this.getDefaultDate(yearm) : false, // 选中开始结束时间后 中间的月份高亮状态 单单有一个背景的那个状态
            isActiveNow: yearm === this.nowTime, // 当前月份的状态
            isDisabled: yearm > this.nowTime, // 是否禁用的状态
            isActiveStart: this.selectDate.length === 2 && yearm === this.selDateCompare[0].getTime() && this.selDateCompare[0].getTime() !== this.selDateCompare[1].getTime(), // 开始时间选中状态有半边背景那种
            isActiveEnd: this.selectDate.length === 2 && yearm === this.selDateCompare[1].getTime() && this.selDateCompare[0].getTime() !== this.selDateCompare[1].getTime(), // 结束时间选中状态有半边背景那种
            oneActive: this.selDateCompare.length === 2 && (yearm === this.selDateCompare[0].getTime() && yearm === this.selDateCompare[1].getTime()) // 单个选中状态（开始结束背景蓝色的那种,没有半边背景的那种）
          })
        }
        return monArr
      },
      getDefaultDate (yearm) { // 判断是否在选择期间范围内
        return this.selDateCompare[0] < yearm && yearm < this.selDateCompare[1]
      },
      monthClass (item) {
        return {
          'active': item.isActive,
          'active-now': item.isActiveNow,
          'disabled': item.isDisabled,
          'active-start': item.isActiveStart,
          'active-end': item.isActiveEnd,
          'one-active': item.oneActive
        }
      },
      setSelectDate (dateList) { // 转换时间格式
        return dateList.length ? dateList.length === 1 ? [new Date(dateList[0].replaceDate())] : [new Date(dateList[0].replaceDate()), new Date(dateList[1].replaceDate())] : []
      },
      changeList (timeArr, active) { /* 筛选选择项(更新选中状态方法) */
        for (let i = timeArr[0][0]; i <= timeArr[1][0]; i++) { // 遍历选中值的区间数据
          if (timeArr[0][0] === timeArr[1][0]) { // 年份相同时遍历当前年的月份就好
            for (let ii = timeArr[0][1]; ii < timeArr[1][1] - 1; ii++) this.ymData[i][ii].isActive = active
          } else {
            if (i === timeArr[0][0]) { // 遍历选中开始年份的开始月份到12月份 添加选中状态
              for (let ii = timeArr[0][1]; ii < 12; ii++) this.ymData[i][ii].isActive = active
            } else if (i === timeArr[1][0]) { // 遍历选中结束年份的1月份到结束月份 添加选中状态
              for (let ii = 0; ii < timeArr[1][1] - 1; ii++) this.ymData[i][ii].isActive = active
            } else { // 处于选中值之间的年份通天添加选中状态
              for (let ii = 0; ii < 12; ii++) this.ymData[i][ii].isActive = active
            }
          }
        }
        if (this.selectDate[0] === this.selectDate[1]) { // 当选中两个相同月份时 只把选中的值添加单个选中状态 否则添加半边背景的选择状态
          this.ymData[timeArr[0][0]][timeArr[0][1] - 1].oneActive = this.ymData[timeArr[1][0]][timeArr[1][1] - 1].oneActive = active
        } else {
          this.ymData[timeArr[0][0]][timeArr[0][1] - 1].isActiveStart = this.ymData[timeArr[1][0]][timeArr[1][1] - 1].isActiveEnd = active
        }
        this.ymData = Object.assign({}, this.ymData) // 更新视图
      },
      putChoiceDate () { // 点击确定，如果选够2个值 回调callback
        if (this.selectDate.length === 2) this.checkPicker([this.selectDate[0].replaceDate(), this.selectDate[1].replaceDate()])
      }
    }
  }
</script>
<style lang="scss">
  .picker-rangeMonth {
    position: relative;
    height: 100%;
    width: 100%;
    color: #272D33;
    overflow: hidden;
    .picker-rangeMonth-data {
      height: calc(100% - 100px);
      overflow-y: auto;
      overflow-x: hidden;
      li {
        width: 100%;
        height: 400px;
        background-color: #FFFFFF;
        border-top: 1px solid #666; /*px*/
        p {
          width: 100%;
          height: 130px;
          font-size: 40px;
          color: #f39c12;
          padding-top: 10px; 
          padding-right: 58px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          span{
            display: inline-block;
            line-height: 60px;
            // font-weight: bold;
            border-bottom: 1px solid #f39c12; /*px*/
          }
        }
        .rangeMonth-data-li {
          width: 100%;
          display: flex;
          display: -webkit-flex;
          margin-bottom: 24px;
          flex-wrap: wrap;
          -webkit-flex-wrap: wrap;
          span {
            position: relative;
            flex: 1 1 16.6666%;
            font-size: 30px;
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
              width: 80px;
              height: 80px;
              border-radius: 50%;
              // font-weight: bold;
              color: #333333;
            }
          }
          span.active-now {
            background-color: #FFF;
            em {
              border: 2px solid #f39c12;
              /*no*/
            }
          }
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
            height: 80px;
            z-index: 100;
            background: #f1f5f7;
          }
          span.active-start:after {
            right: 0;
          }
          span.active-end:after {
            left: 0;
          }
          span.active {
            background-color: #f1f5f7;
          }
          span.one-active {
            em {
              background-color: #f39c12;
              color: #FFFFFF;
            }
          }
          span.disabled {
            em {
              color: #999999;
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
      height: 128px;
      background-color: #FFFFFF;
      border-top: 1px solid #e1e2e7;
      /*no*/
      display: flex;
      display: -webkit-flex;
      .rangeMonth-info-dates {
        background-color: #f1f5f8;
        display: inline-block;
        text-align: left;
        width: 490px;
        height: 128px;
        color: #333;
        padding: 17px 0 17px 39px;
        div{
          line-height: 45px;
          font-size: 30px;
          em{
            color: #f39c12;
          }
        }
      }
      .falseDate {
        color: #B1B2C7;
      }
      button {
        display: inline-block;
        width: 260px;
        height: 128px;
        font-size: 40px;
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
  .picker-rangeMonth-data::-webkit-scrollbar {
    display: none;
  }
  .picker-rangeMonth-data::-webkit-scrollbar-track {
    display: none;
  }
  .picker-rangeMonth-data::-webkit-scrollbar-thumb {
    display: none;
  }
</style>
