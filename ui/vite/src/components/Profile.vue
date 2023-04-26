<script setup lang="ts">
</script>
<script>
export default {
   data() {
      return { name: localStorage.getItem('auth.name') };
   }
};
</script>

<template>
  <div>Profile</div>
  <van-swipe class="s3mple-swipe" :autoplay="3000" indicator-color="white">
    <van-swipe-item>1</van-swipe-item>
    <van-swipe-item>2</van-swipe-item>
    <van-swipe-item>3</van-swipe-item>
    <van-swipe-item>4</van-swipe-item>
  </van-swipe>

  <van-row>
    <van-col span="18" offset="1"> 你好, {{name}}！ 闪电值：100</van-col>
    <van-col span="4"><van-icon name="gem" /> 签到</van-col>
  </van-row>
</template>

<style scoped>
.s3mple-swipe .van-swipe-item {
  color: #fff;
  font-size: 20px;
  line-height: 150px;
  text-align: center;
  background-color: #39a9ed;
}

.s3mple-bottom-btn .van-icon {
  margin: 16px 0;
  font-size: 32px;
}
.s3mple-bottom-btn .van-col {
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
}
.s3mple-bottom-btn .van-col:active {
  background-color: var(--shade10);
}
.s3mple-bottom-btn .van-col span {
  display: block;
  height: 36px;
  margin: -4px 0 4px;
  padding: 0 5px;
  font-size: 12px;
  line-height: 18px;
}
</style>
