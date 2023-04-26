import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './components/Home.vue';
import GameRoom from './components/GameRoom.vue';
import GiftMall from './components/GiftMall.vue';
import Activity from './components/Activity.vue';
import Profile from './components/Profile.vue';
import Login from './components/Login.vue';

import Wfh from './components/hr/Wfh.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [{
     path: '/', component: Home,
  }, {
     path: '/gameroom', component: GameRoom,
  }, {
     path: '/giftmall', component: GiftMall,
  }, {
     path: '/activity', component: Activity,
  }, {
     path: '/profile', component: Profile,
  }, {
     path: '/login', component: Login,
  }, {
     path: '/hr/wfh', component: Wfh,
  }],
});
