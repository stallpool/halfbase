<script lang="ts">
import { ref } from 'vue';
import { Toast } from 'vant';
export default {
   setup() {
     const active = ref(0);
     const onChange = (index: any) => { Toast(`Label ${index+1}`); };
     return { active, onChange, };
   },
   data() {
      return { name: localStorage.getItem('auth.name') };
   }
};
</script>

<template>
<div class="body flex-col">
  <div>GiftMall</div>
  <div>
  <van-swipe class="s3mple-swipe" :autoplay="3000" indicator-color="white">
    <van-swipe-item>1</van-swipe-item>
    <van-swipe-item>2</van-swipe-item>
    <van-swipe-item>3</van-swipe-item>
    <van-swipe-item>4</van-swipe-item>
  </van-swipe>
  </div>
  <div>
  <van-row>
    <van-col span="18" offset="1"> 你好, {{name}}！ 闪电值：100</van-col>
    <van-col span="4"><van-icon name="gem" /> 签到</van-col>
  </van-row>
  </div>
  <div class="flex flex-fix"><div class="body flex-row">
     <div clss="scrollable">
     <van-sidebar v-model="active" @change="onChange">
       <van-sidebar-item title="0 - 200" />
       <van-sidebar-item title="200 - 5k" />
       <van-sidebar-item title="5k - 50k" />
     </van-sidebar>
     </div>
     <div class="flex scrollable">
        <van-card
          num="1"
          price="50000.00"
          desc="英雄联盟 500点券"
          title="英雄联盟 500点券"
          thumb="xxx">
          <template #tags>
            <van-tag plain type="danger">点券</van-tag>
          </template>
          <template #footer>
            <van-button size="mini">兑换</van-button>
          </template>
        </van-card>

        <van-card
          num="1"
          price="150000.00"
          desc="英雄联盟 1500点券"
          title="英雄联盟 1500点券"
          thumb="xxx">
          <template #tags>
            <van-tag plain type="danger">点券</van-tag>
          </template>
          <template #footer>
            <van-button size="mini">兑换</van-button>
          </template>
        </van-card>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello</div>
        <div>hello1</div>
     </div>
  </div></div>
</div>
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
