<script lang="ts">
const constants: any = {
   DAY_HEADER: [
      'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT',
   ],
   PICK_COLOR: {
      o: 'var(--kd-5)', p: 'var(--primary)', h: 'var(--pro)', x: 'white'
   },
   PICK_TEXT: {
      o: 'OOF', p: 'PTO', h: 'WFH', x: '---'
   }
};
const env: any = {
   user: {},
   mode: 'd', // d/day, w/week, m/month
   modeColor: { d: 'var(--primary)', w: 'white', m: 'white', },
   pick: 'x', // h/wfh, o/oof, p/pto, v/holidays, x/work
   pickColor: { x: 'var(--primary)', o: 'white', p: 'white', h: 'white', },
   baseDate: new Date(),
   targetYear: 0,
   targetMonth: 0,
   daySpan: 21,
   dayHeader: [],
   dayTable: [],
   daySelected: null,
   dayStat: [],
};
const cache: any = {};
const api: any = {
   cacheCurrent: async () => {
      (<any>window).s3mpleMask.show();
      const cur = env.baseDate;
      let am1 = new Date(cur);
      let ap1 = new Date(cur);
      ap1.setDate(31);
      ap1 = api.shiftDate(ap1, 1);
      am1.setDate(1);
      am1 = api.shiftDate(am1, -1);
      const km1 = `${am1.getFullYear()}-${am1.getMonth()+1}`;
      const k = `${cur.getFullYear()}-${cur.getMonth()+1}`;
      const kp1 = `${ap1.getFullYear()}-${ap1.getMonth()+1}`;
      try {
         cache[k] = await api.restful.get(cur.getFullYear(), cur.getMonth()+1);
         cache[km1] = await api.restful.get(am1.getFullYear(), am1.getMonth()+1);
         cache[kp1] = await api.restful.get(ap1.getFullYear(), ap1.getMonth()+1);
         (<any>window).s3mpleMask.hide();
      } catch (err) {
      }
   },
   restful: {
      get: (year: any, month: any) => new Promise((r: any, e: any) => {
         fetch(`${(<any>window).s3mpleBase}/api/department/hr/wfh/${year}/${month}`, {
            headers: { 'ex-auth': `${env.user.id}:${env.user.token}` }
         }).then((res: any) => {
            res.json().then(r, e);
         }, e);
      }),
      set: (st: any, year: any, month: any, day: any) => new Promise((r: any, e: any) => {
         fetch(`${(<any>window).s3mpleBase}/api/department/hr/wfh/${st}/${year}/${month}/${day}/am`, {
            method: 'POST',
            headers: { 'ex-auth': `${env.user.id}:${env.user.token}` }
         }).then(r, e);
      }),
   }, // restful
   shiftDate: (cur: any, day: any) => {
      return new Date(cur.getTime() + day * 1000 * 3600 * 24);
   },
   setConfig: (key: any, val: any) => {
      if (!key) {
         localStorage.setItem('config.hr.wfh', '');
         return;
      }
      const config = api.getConfig();
      if (val) config[key] = val; else delete config[key];
      localStorage.setItem('config.hr.wfh', JSON.stringify(config));
   },
   getConfig: (key: any) => {
      try {
         const config = JSON.parse(localStorage.getItem('config.hr.wfh') || '{}');
         if (!key) return config;
         return config[key];
      } catch (err) {
         // reset config
         api.setConfig();
      }
   },
   _makeWeek: (cur: any) => {
      const week = [];
      const day = cur.getDay();
      for (let i = 0; i < day; i++) {
         const t = api.shiftDate(cur, i-day);
         week.push({ y: t.getFullYear(), m: t.getMonth()+1, d: t.getDate() });
      }
      for (let j = day; j < 7; j++) {
         const t = api.shiftDate(cur, j-day);
         week.push({ y: t.getFullYear(), m: t.getMonth()+1, d: t.getDate() });
      }
      return week;
   },
   getInfo: (item: any) => {
      const ymk = `${item.y}-${item.m}`;
      const dk = `${item.d}am`;
      const tbl = cache[ymk];
      if (!tbl) return [];
      return tbl[dk] || [];
   },
   attachInfo: (self: any) => {
      if (!self.dayTable) return;
      self.dayTable.forEach((tbl: any) => {
         tbl.forEach((item: any) => {
            const info = api.getInfo(item).filter(
               (item: any) => item.id === env.user.id || item.st === 'v'
            )[0];
            if (info) item.st = `s3mple-info-${info.st}`; else item.st = 's3mple-info-x';
         });
      });
   },
   makeDayTable: (self: any, cur: any) => {
      self.daySpan = 21;
      self.dayHeader = [{ val: constants.DAY_HEADER[cur.getDay()] }];
      self.dayTable = [[{ y: cur.getFullYear(), m: cur.getMonth()+1, d: cur.getDate() }]];
   },
   makeWeekTable: (self: any, cur: any) => {
      self.daySpan = 3;
      self.dayHeader = constants.DAY_HEADER.map((x: any) => ({ val: x }));
      const week = api._makeWeek(cur);
      self.dayTable = [week];
   },
   makeMonthTable: (self: any, cur: any) => {
      self.daySpan = 3;
      self.dayHeader = constants.DAY_HEADER.map((x: any) => ({ val: x }));
      const day1 = new Date(cur.getTime());
      day1.setDate(1);
      const targetM = cur.getMonth();
      self.dayTable = [];
      let week, i = day1;
      do {
         week = api._makeWeek(i);
         self.dayTable.push(week);
         const item0 = week[0];
         i = api.shiftDate(new Date(`${item0.y}-${item0.m}-${item0.d}`), 7);
      } while(i.getMonth() === targetM);
   },
   methods: {
      selectDay: async (self: any, item: any) => {
         if (self.daySelected === item) {
            self.daySelected = null;
            self.dayStat = [];
         } else {
            self.daySelected = item;
            const ymk = `${item.y}-${item.m}`;
            const tbl = cache[ymk];
            const dk = `${item.d}am`;
            const day = tbl[dk] || [];
            self.dayStat = [];
            day.forEach((item: any) => {
               if (item.st === 'x') return;
               self.dayStat.push({
                  name: item.username,
                  pick: constants.PICK_TEXT[item.st]
               });
            });
         }
      },
      goCurrent: async (self: any) => {
         (<any>window).s3mpleMask.show();
         await api.cacheCurrent();
         const cur = self.baseDate;
         self.targetMonth = cur.getMonth() + 1;
         self.targetYear = cur.getFullYear();
         switch (self.mode) {
         case 'd': api.makeDayTable(self, cur); break;
         case 'w': api.makeWeekTable(self, cur); break;
         case 'm': api.makeMonthTable(self, cur); break;
         }
         api.attachInfo(self);
         (<any>window).s3mpleMask.hide();
      },
      goToday: (self: any) => {
         self.baseDate = new Date();
         api.methods.goCurrent(self);
      },
      goNext: (self: any) => {
         let cur = env.baseDate;
         switch (self.mode) {
         case 'd':
            cur = api.shiftDate(env.baseDate, 1);
            break;
         case 'w':
            cur = api.shiftDate(env.baseDate, 7)
            break;
         case 'm':
            cur = new Date(env.baseDate.getTime());
            cur.setMonth(cur.getMonth() + 1);
            if (cur.getFullYear() === env.baseDate.getFullYear() && cur.getMonth() > env.baseDate.getMonth() + 1) {
               cur.setDate(1);
               cur = api.shiftDate(cur, -1);
            }
            break;
         }
         self.baseDate = cur;
         api.methods.goCurrent(self);
      },
      goPrev: (self: any) => {
         let cur = env.baseDate;
         switch (self.mode) {
         case 'd':
            cur = api.shiftDate(env.baseDate, -1);
            break;
         case 'w':
            cur = api.shiftDate(env.baseDate, -7);
            break;
         case 'm':
            cur = new Date(env.baseDate.getTime());
            cur.setMonth(cur.getMonth() - 1);
            if (cur.getFullYear() === env.baseDate.getFullYear() && cur.getMonth() > env.baseDate.getMonth() - 1) {
               cur.setDate(1);
               cur = api.shiftDate(cur, -1);
            }
            break;
         }
         const current = new Date();
         if (cur.getTime() < current.getTime()) cur = current;
         self.baseDate = cur;
         api.methods.goCurrent(self);
      },
      setMode: (self: any, mode: any) => {
         Object.keys(self.modeColor).forEach((name: any) => { self.modeColor[name] = 'white'; });
         api.setConfig('mode', mode);
         self.mode = mode;
         self.modeColor[mode] = 'var(--primary)';
         api.methods.goCurrent(self);
      },
      setSt: (self: any, st: any) => {
         Object.keys(self.pickColor).forEach((name: any) => { self.pickColor[name] = 'white'; });
         if (self.pick === st) st = 'x';
         self.pick = st;
         api.setConfig('pick', st);
         self.pickColor[st] = constants.PICK_COLOR[st];
      },
      toggleDay: async (self: any, item: any) => {
         if (self.pick === 'x') {
            api.methods.selectDay(self, item);
            return;
         }
         (<any>window).s3mpleMask.show();
         let st = self.pick;
         if (`s3mple-info-${self.pick}` === item.st) st = 'x';
         await api.restful.set(st, item.y, item.m, item.d);
         const info = api.getInfo(item);
         const target = info.filter((item: any) => item.id === env.user.id)[0];
         if (target) {
            target.st = st;
         } else {
            info.push({ id: env.user.id, username: env.user.name, st });
         }
         item.st = `s3mple-info-${st}`;
         (<any>window).s3mpleMask.hide();
      },
   },
};

export default {
   data() {
      env.user.id = localStorage.getItem('auth.user');
      env.user.name = localStorage.getItem('auth.name');
      env.user.token = localStorage.getItem('auth.token');
      const config = api.getConfig();
      api.methods.setMode(env, config.mode || 'd');
      api.methods.setSt(env, config.pick || 'h');
      env.targetMonth = env.baseDate.getMonth() + 1;
      env.targetYear = env.baseDate.getFullYear();
      return { env };
   },
   async created() {
      await api.methods.goCurrent((<any>this).env);
   },
   methods: api.methods,
};
</script>

<template>
  <div>&nbsp;<van-icon name="map-marked"/>&nbsp;<span>{{env.user.name}} 的工作地点</span></div>
  <div class="s3mple-actbar"><van-row>
  <van-col span="4" @click="setSt(env, 'h')">
    <van-icon name="wap-home" :color="env.pickColor.h" />
    <span>在家办公</span>
  </van-col>
  <van-col span="4" @click="setSt(env, 'o')">
    <van-icon name="map-marked" :color="env.pickColor.o" />
    <span>外出办公</span>
  </van-col>
  <van-col span="4" @click="setSt(env, 'p')">
    <van-icon name="share" :color="env.pickColor.p" />
    <span>休假去咯</span>
  </van-col>
  <van-col span="4" @click="setMode(env, 'd')">
    <van-icon name="enlarge" :color="env.modeColor.d" />
    <span>日</span>
  </van-col>
  <van-col span="4" @click="setMode(env, 'w')">
    <van-icon name="enlarge" :color="env.modeColor.w" />
    <span>周</span>
  </van-col>
  <van-col span="4" @click="setMode(env, 'm')">
    <van-icon name="enlarge" :color="env.modeColor.m" />
    <span>月</span>
  </van-col>
  </van-row></div>

  <div class="day-block"><van-row>
  <van-col span="3" offset="1" @click="goPrev(env)">◀</van-col>
  <van-col span="3" offset="1" @click="goNext(env)">▶</van-col>
  <van-col span="9" offset="1">{{env.targetYear}}-{{env.targetMonth}}</van-col>
  <van-col span="3" offset="1" @click="goToday(env)">今天◢</van-col>
  </van-row></div>

  <div class="day-block"><van-row>
    <van-col span="1" :style="{border: 'none'}"></van-col>
    <van-col v-for="(h, i) in env.dayHeader" :span="env.daySpan" :key="h.val">
      {{h.val}}
    </van-col>
  </van-row></div>

  <div class="day-block">
  <van-row v-for="(r, i) in env.dayTable" :key="i">
    <van-col span="1" :style="{border: 'none'}"></van-col>
    <van-col v-for="(item, j) in r" :span="env.daySpan" :key="j" :class="item.st" @click="toggleDay(env, item)">
      <span :class="{'day-inactive': env.targetMonth !== item.m}">{{item.d}}</span>
    </van-col>
  </van-row>
  </div>

  <div v-if="env.daySelected" class="day-stat">
     <div>{{env.daySelected.y}}-{{env.daySelected.m}}-{{env.daySelected.d}}</div>
     <div v-for="item in env.dayStat" :key="item.name">{{item.pick}}: {{item.name}}</div>
     <div v-if="!env.dayStat.length">(Common working day!)</div>
  </div>
</template>

<style scoped>
.day-inactive {
  color: #555;
}
.day-stat {
  margin-top: 10px;
  margin-left: 15px;
}
.day-block {
  margin-top: 5px;
}
.day-block .van-col {
  padding: 1px;
  border: 1px solid white;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
}
</style>
