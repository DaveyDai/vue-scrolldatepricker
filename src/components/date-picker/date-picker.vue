<template>
  <transition name="component-fade" v-on:before-enter="beforeEnter" v-on:enter="enter" v-on:after-enter="enter" v-on:leave="enter" v-on:after-leave="enter">
    <div class="date-picker">
      <div class="date-picker-title">
        <span class="close-picker" @click="chioceDatetime(false)">取消</span>
        <span class="picker-title-name">日期</span>
      </div>
      <div class="chick-date-picker" v-if="this.pickerTitle.length > 1">
        <li v-for="(item, index) in pickerTitle" @click="pickerDate(item,index)"> <span :class="{active:item.isActive}">{{item.name}}</span> </li>
      </div>
      <div class="picker-content" :class="{'has-tab':this.pickerTitle.length>1,'no-tab':this.pickerTitle.length==1}">
        <keep-alive>
          <component :is="currentView" :defaultInit="defaultValue" :checkPicker="chioceDatetime" :rangeDate="rangeDate"></component>
        </keep-alive>
      </div>
    </div>
  </transition>
</template>
<script>
  import PickerYear from './picker-year'
  import PickerMonth from './picker-month'
  import PickerDate from './picker-date'
  import PickerTime from './picker-time'
  import RangeMonth from './picker-rangeMonth'
  import PickerRangeDate from './picker-rangeDate'
  let nowDate = ''
  export default {
    props: {
      chioceDatetime: { /* callback函数 */
        type: Function,
        required: true,
        default: function () {
          return
        }
      },
      initPicker: { /* 初始化筛选器参数 */
        validator (val) {
          return Object.prototype.toString.call(val) === '[object Array]' /* props传参数校验 */
        }
      }
    },
    data () {
      return {
        currentView: '',
        defaultValue: '',
        rangeDate: [],
        pickerTitle: []
      }
    },
    created () {
      nowDate = new Date()
      this.pickerTitle = []
      this.initPickerPage()
    },
    methods: {
      initPickerPage () {
        /* 防止传入参数异常 异常直接callback */
        try {
          /* 根据传入参数选取数组第一个元素为默认组件 */
          this.defaultValue = this.initPicker[0].defaultDate || ((this.initPicker[0].type === 3 || this.initPicker[0].type === 4) && [] || '')
          if (Object.prototype.toString.call(this.defaultValue) === '[object String]') this.defaultValue = this.defaultValue.repBackDate()
          this.rangeDate = this.initPicker[0].rangeDate || (this.initPicker[0].type === 0 || this.initPicker[0].type === 4 || this.initPicker[0].type === 5) && ['2016-1', `${nowDate.getFullYear() + 1}-${nowDate.getMonth() + 1}`] || ['2000', nowDate.getFullYear() + 5] // 区间范围传值
          for (let i = 0; i < this.initPicker.length; i++) {
            this.pickerTitle.push({
              key: this.initPicker[i].type,
              name: this.initPicker[i].name || (this.initPicker[i].type === 0 && '按日' || this.initPicker[i].type === 1 && '按月' || this.initPicker[i].type === 2 && '按年' || this.initPicker[i].type === 3 && '月区间' || this.initPicker[i].type === 4 && '日区间'),
              isActive: i === 0
            })
          }
          this.currentView = this.initPicker[0].type === 0 && PickerDate || this.initPicker[0].type === 1 && PickerMonth || this.initPicker[0].type === 2 && PickerYear || this.initPicker[0].type === 3 && RangeMonth || this.initPicker[0].type === 4 && PickerRangeDate || this.initPicker[0].type === 5 && PickerTime || ''
        } catch (e) {
          console.error('时间筛选器入参异常~')
          this.chioceDatetime(false)
        }
      },
      pickerDate (item,index) { /* 根据选择显示不同筛选器 */
        for (let i = this.pickerTitle.length; i--;) {
          if (this.pickerTitle[i].key === item.key) {
            this.rangeDate = this.initPicker[i].rangeDate || (this.initPicker[i].type === 0 || this.initPicker[i].type === 4 || this.initPicker[i].type === 5) && ['2014-1', `${nowDate.getFullYear() + 1}-${nowDate.getMonth() + 1}`] || ['2000', nowDate.getFullYear() + 5]
          }
          this.pickerTitle[i].isActive = this.pickerTitle[i].key === item.key
        }
        this.defaultValue = this.initPicker[index].defaultDate ? this.initPicker[index].defaultDate : item.key === 3 || item.key === 4 ? [] : ''
        this.currentView = item.key === 0 && PickerDate || item.key === 1 && PickerMonth || item.key === 2 && PickerYear || item.key === 3 && RangeMonth || item.key === 4 && PickerRangeDate || item.key === 5 && PickerTime || ''
      },
      beforeEnter (el) {
        el.style.transitionDuration = '.3s'
      },
      enter (el, done) {}
      // afterEnter (el) {},
      // leave (el, done) {},
      // afterLeave (el) {}
    }
  }
</script>
<style lang="scss">
  .date-picker {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f2f2f7;
    -webkit-overflow-scrolling: touch;
    z-index: 199;
    .picker-content {
      box-sizing: border-box;
    }
    .has-tab {
      height: calc(100% - 176px)!important;
    }
    .no-tab {
      height: calc(100% - 88px)!important;
    }
    .date-picker-title {
      position: relative;
      height: 88px;
      line-height: 88px;
      width: 100%;
      background: linear-gradient(to bottom, #f39c12, #f9ce89);
      // border-bottom: 1px solid #f0f0f0;/*px*/
      text-align: center;
      display: flex;
      display: -webkit-flex;
      align-items: center;
      -webkit-align-items: center;
      justify-content: center;
      -webkit-justify-content: center;
      span.close-picker {
        position: absolute;
        right: 10px;
        font-size: 28px;
        padding: 0 20px;
        color: #fff;
      }
      span.picker-title-name {
        font-size: 34px;
        color: #fff;
      }
    }
    .chick-date-picker {
      position: relative;
      height: 88px;
      line-height: 88px;
      width: 100%;
      background-color: #f9ce89;
      display: inline;
      white-space: nowrap;
      overflow-x: scroll;
      float: left;
      overflow-y: hidden;
      li {
        width: 25%;
        display: inline-block;
        font-size: 28px;
        color: #666;
        text-align: center;
        span {
          display: inline-block;
          height: 80px;
          padding: 0 14px;
        }
        span.active {
          color: #FFF;
          border-bottom: 4px solid #FFF;
        }
      }
    }
  }
  .component-fade-enter-active, .component-fade-leave-active {
    transition-duration: .3s;
  }
  .component-fade-enter, .component-fade-leave-to{
    transform: translate3d(0, 100%, 0);
  }
</style>
