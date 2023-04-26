<script setup lang="ts">
import { Toast } from 'vant';
</script>
<script lang="ts">
import router from './route';
export default {
  methods: {
    bottomBtnNavTo(to: string) {
       router.push(to);
    }
  }
}
</script>

<template>
<div class="body flex-col">
<div><img class="logo" src="./assets/logo.png"/></div>
<div class="flex scrollable">
  <router-view></router-view>
</div>
<div>
  <van-row class="s3mple-actbar">
     <van-col span="4" @click="bottomBtnNavTo('/')">
       <van-icon name="wap-home"/>
       <span>首页</span>
     </van-col>
     <van-col span="5" @click="bottomBtnNavTo('/zgameroom')">
       <van-icon name="friends"/>
       <span>开黑组队</span>
     </van-col>
     <van-col span="5" @click="bottomBtnNavTo('/zgiftmall')">
       <van-icon name="point-gift"/>
       <span>闪电商城</span>
     </van-col>
     <van-col span="5" @click="bottomBtnNavTo('/zactivity')">
       <van-icon name="todo-list"/>
       <span>活动赛事</span>
     </van-col>
     <van-col span="5" @click="bottomBtnNavTo('/zprofile')">
       <van-icon name="setting"/>
       <span>个人中心</span>
     </van-col>
  </van-row>
</div>
</div>
</template>

<style>
@import './assets/base.css';

#app {
   width: 100%;
   height: 100%;
   overflow: hidden;
}

.s3mple-swipe .van-swipe-item {
  color: #fff;
  font-size: 20px;
  line-height: 150px;
  text-align: center;
  background-color: #39a9ed;
}
</style>
