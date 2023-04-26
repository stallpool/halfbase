<script setup lang="ts">
</script>
<script lang="ts">
import router from '../route';
export default {
   data() {
      return { name: localStorage.getItem('auth.name') };
   },
   methods: {
      btnNavTo(to: string) {
         router.push(to);
      }
   }
};
</script>

<template>
  <!--
  <van-swipe class="s3mple-swipe" :autoplay="3000" indicator-color="white">
    <van-swipe-item>1</van-swipe-item>
    <van-swipe-item>2</van-swipe-item>
    <van-swipe-item>3</van-swipe-item>
    <van-swipe-item>4</van-swipe-item>
  </van-swipe>
  -->
  
  <van-row>
    <van-col span="23" offset="1"> 你好, {{name}}！</van-col>
  </van-row>

  <van-divider dashed>常用功能</van-divider>
  <van-row class="s3mple-actbar">
    <van-col span="6" @click="btnNavTo('/hr/wfh')">
      <van-icon name="map-marked"/>
      <span>工作地点</span>
    </van-col>
    <van-col span="6">
      <van-icon name="bill"/>
      <span>报销</span>
    </van-col>
    <van-col span="6">
      <van-icon name="shopping-cart"/>
      <span>采购</span>
    </van-col>
  </van-row>

  <van-divider dashed>公司部门</van-divider>
  <van-row class="s3mple-actbar">
    <van-col span="6">
      <van-icon name="smile"/>
      <span>社区</span>
    </van-col>
    <van-col span="6">
      <van-icon name="cluster"/>
      <span>产品</span>
    </van-col>
    <van-col span="6">
      <van-icon name="video"/>
      <span>市场</span>
    </van-col>
    <van-col span="6">
      <van-icon name="manager"/>
      <span>人力</span>
    </van-col>
  </van-row>
  <van-row class="s3mple-actbar">
    <van-col span="6">
      <van-icon name="underway"/>
      <span>商务</span>
    </van-col>
    <van-col span="6">
      <van-icon name="fire"/>
      <span>技术</span>
    </van-col>
  </van-row>
</template>

<style scoped>
</style>
