import { createApp } from 'vue';
import {
   Button, Toast, Col, Row,
   Swipe, SwipeItem, Icon, Divider,
   Sidebar, SidebarItem, Card,
} from 'vant';
import App from './App.vue';

import 'vant/es/toast/style';
import 'vant/es/row/style';
import 'vant/es/col/style';
import 'vant/es/swipe/style';
import 'vant/es/swipe-item/style';
import 'vant/es/divider/style';
import 'vant/es/card/style';

import router from './route';

const app = createApp(App);
[
   Button, Toast, Row, Col, Icon, Swipe, SwipeItem,
   Divider, Sidebar, SidebarItem, Card,
].forEach((x) => app.use(x));
app.use(router);
app.mount('#app');
