/* =========================================================
 * 成都市 CIM 平台 · 领导驾驶舱  v2
 * 等距 3D 城市引擎 + 模块路由 + 面板 + 弹层 + 自动巡演
 * ========================================================= */
(function () {
'use strict';

var $ = function (s, r) { return (r || document).querySelector(s); };
var rnd = function (a, b) { return a + Math.random() * (b - a); };
var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
var fmt = function (n, d) { return Number(n).toLocaleString('zh-CN', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };

/* ---------- 舞台自适应 ---------- */
var stage = $('#stage');
function fit() {
  var s = Math.min(window.innerWidth / 2560, window.innerHeight / 1440);
  stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
}
window.addEventListener('resize', function () { fit(); });
fit();

/* ---------- 时钟 ---------- */
(function () {
  var el = $('#clock b'), sub = $('#clock span'), W = ['日', '一', '二', '三', '四', '五', '六'];
  setInterval(function () {
    var d = new Date();
    el.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
    sub.textContent = d.getFullYear() + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + ('0' + d.getDate()).slice(-2) + ' 星期' + W[d.getDay()];
  }, 1000);
})();

/* ---------- 模块定义 ---------- */
var NAV = [
  { id: 'overview', name: '城市总览驾驶舱', key: '1', icon: 'M3 12l9-8 9 8v8a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z' },
  { id: 'lifeline', name: '城市生命线安全', key: '2', hot: true, icon: 'M12 2C8 6 5 10 5 14a7 7 0 0014 0c0-4-3-8-7-12z' },
  { id: 'pipe', name: '地下管网与管廊', key: '3', icon: 'M4 16c2-3 5-4 8-4s6 1 8 4M4 8c2-3 5-4 8-4s6 1 8 4M4 12c2-3 5-4 8-4s6 1 8 4' },
  { id: 'safety', name: '城市安全应急', key: '4', icon: 'M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z' },
  { id: 'approval', name: '工程审批服务', key: '5', icon: 'M7 3h7l4 4v14H7zM14 3v4h4M9.5 12h5M9.5 15.5h5' },
  { id: 'checkup', name: '城市体检评估', key: '6', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
  { id: 'sponge', name: '海绵城市建设', key: '7', icon: 'M12 3c3 4.5 5 7.5 5 10a5 5 0 01-10 0c0-2.5 2-5.5 5-10z' },
  { id: 'planning', name: '规划一张图', key: '8', icon: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15' },
  { id: 'site', name: '智慧工地监管', key: '9', icon: 'M3 21h18M5 21V8l5-3v16M14 21V11l5 3v7M8 12h1M8 15h1' },
  { id: 'renewal', name: '城市更新管理', key: '0', icon: 'M4 21V10l8-6 8 6v11h-6v-6h-4v6z' }
];

var SCENES = {
  overview: { label: '城市总览', zoom: 1, badges: [
      { x: .50, y: .44, t: '天府广场 · 市中心', lv: 'lv3' },
      { x: .55, y: .41, t: '春熙路商圈', lv: 'lv3' },        /* 天府广场东侧微偏北 */
      { x: .47, y: .27, t: '火车北站枢纽', lv: 'lv3' },      /* 西北 */
      { x: .64, y: .35, t: '四川广电塔（339）', lv: 'lv3' }, /* 东北 */
      { x: .55, y: .75, t: '天府新区 · 兴隆湖', lv: 'lv3' }, /* 最南端 */
      { x: .62, y: .66, t: '高新南区 · 金融城', lv: 'lv3' }, /* 南偏东 */
      { x: .19, y: .22, t: '高新西区 · 电子科大', lv: 'lv3' } /* 西北 */],
    legend: [{ c: '#00e5ff', t: '核心商圈' }, { c: '#2f7bff', t: '交通枢纽' }, { c: '#26d9a3', t: '公园绿地' }, { c: '#ff4d6a', t: '风险点位' }] },
  lifeline: { label: '生命线监测', zoom: 1.18, badges: [
      { x: .47, y: .40, t: '城区燃气调压站 #017', lv: 'lv1', hit: { type: 'gas', name: '城区燃气调压站 #017' } },
      { x: .60, y: .46, t: '三环供水加压泵站', lv: 'lv2', hit: { type: 'water', name: '三环供水加压泵站' } },
      { x: .55, y: .60, t: '排水泵站 · 锦江', lv: 'lv3', hit: { type: 'drain', name: '排水泵站 · 锦江' } },
      { x: .38, y: .50, t: '市管桥梁监测点 A12', lv: 'lv2', hit: { type: 'bridge', name: '市管桥梁监测点 A12' } },
      { x: .68, y: .38, t: '热力交换站 #06', lv: 'lv4', hit: { type: 'heat', name: '热力交换站 #06' } }],
    legend: [{ c: '#ff4d6a', t: '一级告警' }, { c: '#ffb020', t: '二级预警' }, { c: '#2f7bff', t: '正常监测' }, { c: '#26d9a3', t: '恢复在线' }] },
  pipe: { label: '管网管廊', zoom: 1.34, badges: [
      { x: .50, y: .42, t: '一环综合管廊监控中心', lv: 'lv3', hit: { type: 'tunnel', name: '一环综合管廊监控中心' } },
      { x: .63, y: .55, t: '燃气高压管线 G-22', lv: 'lv2', hit: { type: 'gpipe', name: '燃气高压管线 G-22' } },
      { x: .41, y: .56, t: '给水主干管 W-08', lv: 'lv3', hit: { type: 'wpipe', name: '给水主干管 W-08' } },
      { x: .57, y: .68, t: '110kV 电力舱 E-03', lv: 'lv3', hit: { type: 'epipe', name: '110kV 电力舱 E-03' } }],
    legend: [{ c: '#ffb020', t: '燃气' }, { c: '#2f7bff', t: '给水' }, { c: '#26d9a3', t: '排水' }, { c: '#ff4d6a', t: '热力' }, { c: '#b07dff', t: '电力通信' }] },
  safety: { label: '应急指挥', zoom: 1.12, badges: [
      { x: .52, y: .45, t: '突发事件 · 燃气泄漏', lv: 'lv1', hit: { type: 'event', name: '突发事件 · 燃气泄漏' } },
      { x: .40, y: .42, t: '内涝积水点 · 低洼路段', lv: 'lv2', hit: { type: 'event', name: '内涝积水点 · 低洼路段' } },
      { x: .66, y: .55, t: '消防救援站 · 特勤一站', lv: 'lv4' },
      { x: .58, y: .35, t: '应急物资库 · 市级', lv: 'lv4' }],
    legend: [{ c: '#ff4d6a', t: '处置中事件' }, { c: '#ffb020', t: '关注事件' }, { c: '#26d9a3', t: '应急资源' }] },
  approval: { label: '工程审批', zoom: 1.12, badges: [
      { x: .48, y: .46, t: '在建项目 · 天府新区', lv: 'lv3', hit: { type: 'project', name: '天府新区 CIM 配套项目' } },
      { x: .62, y: .50, t: '在建项目 · 高新区', lv: 'lv3', hit: { type: 'project', name: '高新南区综合体项目' } },
      { x: .38, y: .40, t: '联合审批窗口', lv: 'lv4' }],
    legend: [{ c: '#00e5ff', t: '在办项目' }, { c: '#26d9a3', t: '已办结' }, { c: '#ffb020', t: '预警项目' }] },
  checkup: { label: '城市体检', zoom: 1.08, badges: [
      { x: .50, y: .44, t: '体检网格 · 中心城区', lv: 'lv2', hit: { type: 'grid', name: '体检网格 · 中心城区' } },
      { x: .63, y: .58, t: '问题街区 · 设施老化', lv: 'lv1', hit: { type: 'grid', name: '问题街区 · 设施老化' } }],
    legend: [{ c: '#ff4d6a', t: '问题突出' }, { c: '#ffb020', t: '需关注' }, { c: '#26d9a3', t: '状态良好' }] },
  sponge: { label: '海绵城市', zoom: 1.12, badges: [
      { x: .55, y: .48, t: '雨水花园 · 示范片区', lv: 'lv4' },
      { x: .42, y: .54, t: '易涝点监测 S-12', lv: 'lv2', hit: { type: 'sponge', name: '易涝点监测 S-12' } }],
    legend: [{ c: '#2f7bff', t: '渗滞设施' }, { c: '#26d9a3', t: '调蓄水体' }, { c: '#ffb020', t: '易涝监测' }] },
  planning: { label: '规划一张图', zoom: 1.1, badges: [
      { x: .52, y: .46, t: '多规叠加冲突区 C-07', lv: 'lv2', hit: { type: 'plan', name: '多规叠加冲突区 C-07' } },
      { x: .65, y: .42, t: '用地管控边界', lv: 'lv4' }],
    legend: [{ c: '#ffb020', t: '规划冲突' }, { c: '#2f7bff', t: '管控边界' }, { c: '#26d9a3', t: '已合规' }] },
  site: { label: '智慧工地', zoom: 1.14, badges: [
      { x: .50, y: .48, t: '智慧工地 · 塔吊监测', lv: 'lv3', hit: { type: 'site', name: '智慧工地 · 塔吊监测' } },
      { x: .62, y: .55, t: '工地扬尘超标预警', lv: 'lv2', hit: { type: 'site', name: '工地扬尘超标预警' } },
      { x: .38, y: .44, t: '实名制考勤闸机', lv: 'lv4' }],
    legend: [{ c: '#ff4d6a', t: '告警工地' }, { c: '#ffb020', t: '预警工地' }, { c: '#26d9a3', t: '合规工地' }] },
  renewal: { label: '城市更新', zoom: 1.12, badges: [
      { x: .47, y: .47, t: '老旧小区改造片区', lv: 'lv3', hit: { type: 'renewal', name: '老旧小区改造片区' } },
      { x: .64, y: .52, t: '历史街区保护更新', lv: 'lv4' }],
    legend: [{ c: '#00e5ff', t: '改造中' }, { c: '#26d9a3', t: '已完工' }, { c: '#ffb020', t: '待启动' }] }
};

/* =========================================================
 * 3D 城市引擎
 * ========================================================= */
var cv = $('#map'), ctx = cv.getContext('2d');
var MAPW = 1540, MAPH = 1232;
cv.width = MAPW * 2; cv.height = MAPH * 2; cv.style.width = MAPW + 'px'; cv.style.height = MAPH + 'px';
ctx.scale(2, 2);

var LAYERS = { building: true, road: true, pipe: true, water: true, badge: true };
var cam = { x: .5, y: .5, zoom: 1, tx: .5, ty: .5, tz: 1 };
/* 方位约定：nx 向东（屏幕右），ny 向南（屏幕下）→ 上北下南、左西右东 */
var CITY = [], ROADS = [], RIVER = [], PIPES = [], JUNCTIONS = [], TUNNEL = [], LANDMARKS = [], CITY_SORTED = [];
var hoverBuilding = null, selectedBuilding = null, mouse = { x: -1, y: -1 }, drag = null;
var t0 = Date.now();

function proj(nx, ny, elev) {
  var z = cam.zoom;
  return { x: (nx - cam.x) * 1400 * z + MAPW / 2, y: (ny - cam.y) * 1092 * z + MAPH / 2 - (elev || 0) * z };
}

/* 建城：三环 + 放射主干 + 街区路网 + 锦江 + 管网 + 地标
 * 方位：nx→东，ny→南。天府广场(0.5,0.44) 为市中心，
 * 北=.44 方向为上，南=.6 为下，西=.3 为左，东=.72 为右。 */
(function build() {
  var i, a, gx, gy;
  var CX = .5, CY = .44;

  /* ---- 1. 三环路（真实比例近似：一环/二环/三环） ---- */
  var rings = [
    { r: .085, w: 2.0, n: '一环' }, { r: .17, w: 2.4, n: '二环' }, { r: .30, w: 3.0, n: '三环' }
  ];
  rings.forEach(function (rg) {
    for (a = 0; a < Math.PI * 2; a += .014) {
      var a2 = a + .014;
      var kx = 1.0, ky = .80;
      ROADS.push({ x1: CX + Math.cos(a) * rg.r * kx, y1: CY + Math.sin(a) * rg.r * ky,
        x2: CX + Math.cos(a2) * rg.r * kx, y2: CY + Math.sin(a2) * rg.r * ky,
        w: rg.w, ring: true, n: rg.n });
    }
  });

  /* ---- 2. 放射主干道（12 条，真实放射形态） ---- */
  var radials = [
    { a: -Math.PI / 2, n: '人民北路-天府大道北' }, { a: -Math.PI / 2.5, n: '蜀都大道' },
    { a: -Math.PI / 1.5, n: '羊市街' }, { a: 0, n: '蜀都大道东' },
    { a: Math.PI / 1.5, n: '东大街-锦华路' }, { a: Math.PI / 2.5, n: '武侯祠大街' },
    { a: Math.PI / 2, n: '人民南路-天府大道' }, { a: Math.PI / 1.25, n: '益州大道' },
    { a: -Math.PI / 1.25, n: '二环路西' }, { a: -Math.PI * .78, n: '北站干道' }
  ];
  radials.forEach(function (rd) {
    var ex = Math.cos(rd.a), ey = Math.sin(rd.a);
    ROADS.push({ x1: CX - ex * .46, y1: CY - ey * .46, x2: CX + ex * .46, y2: CY + ey * .46,
      w: 1.8, radial: true, n: rd.n });
  });

  /* ---- 3. 街区路网（网格状，密度随环位变化，避开河流） ---- */
  var step = .026;
  for (gx = 0; gx <= 34; gx++) {
    for (gy = 0; gy <= 34; gy++) {
      var rx = .05 + gx * step, ry = .05 + gy * step;
      if (rx > .97 || ry > .97) continue;
      var d = Math.hypot(rx - CX, (ry - CY) / .8);
      if (d > .44) continue;
      /* 锦江主河道穿过：北偏西侧 */
      if (Math.abs((rx - .18) * .62 - (ry - .52)) < .022) continue;
      if (Math.abs((rx - .62) * .55 - (ry - .40)) < .020) continue;
      /* 横向街 */
      if (gx % 1 === 0 && Math.random() < .42) {
        var x2 = Math.min(.97, rx + step * (1 + Math.floor(Math.random() * 2)));
        ROADS.push({ x1: rx, y1: ry, x2: x2, y2: ry + rnd(-.004, .004), w: 1.1, grid: true });
      }
      /* 纵向街 */
      if (Math.random() < .42) {
        var y2 = Math.min(.97, ry + step * (1 + Math.floor(Math.random() * 2)));
        ROADS.push({ x1: rx, y1: ry, x2: rx + rnd(-.004, .004), y2: y2, w: 1.1, grid: true });
      }
    }
  }

  /* ---- 4. 锦江（府河+南河，自西北向东南穿城） ---- */
  RIVER = [
    { pts: [[.02, .30], [.16, .35], [.30, .42], [.44, .50], [.58, .56], [.72, .58], [.98, .60]], w: 20 },
    { pts: [[.30, .42], [.38, .30], [.44, .18], [.50, .06]], w: 11 }
  ];

  /* ---- 5. 建筑：按真实街区排布，形状/高度/用途分区 ---- */
  /* 用途分区（成都实际格局：中心商业、南部商务、东部住宅、北部工业/居住） */
  function zone(bx, by) {
    var d = Math.hypot(bx - CX, (by - CY) / .8);
    if (d < .10) return 'core';          // 中心商业区
    if (by < .34 && bx > .55) return 'north-east'; // 东北部
    if (by > .52 && bx < .45) return 'south-west'; // 西南部
    if (by > .50 && bx > .50) return 'south';      // 南部新城
    if (bx > .62) return 'east';         // 东部
    return 'mid';
  }

  var usedCells = {};
  for (gx = 1; gx <= 33; gx++) {
    for (gy = 1; gy <= 33; gy++) {
      var cx0 = .05 + gx * step, cy0 = .05 + gy * step;
      if (cx0 > .95 || cy0 > .95) continue;
      var dc = Math.hypot(cx0 - CX, (cy0 - CY) / .8);
      if (dc > .42) continue;
      /* 避开河道 */
      if (Math.abs((cx0 - .18) * .62 - (cy0 - .52)) < .028) continue;
      if (Math.abs((cx0 - .62) * .55 - (cy0 - .40)) < .026) continue;
      if (Math.abs((cx0 - .30) * 1.4 - (cy0 - .42)) < .024 && cy0 < .30) continue;
      if (Math.random() < .16) continue;

      /* 一街区多栋，间距规整 */
      var perCell = dc < .12 ? 2 : (dc < .24 ? 2 : 3);
      for (var b = 0; b < perCell; b++) {
        var bx = cx0 + (perCell === 2 ? (b ? .012 : -.012) : (b === 0 ? -.015 : b === 1 ? 0 : .015)) + rnd(-.003, .003);
        var by = cy0 + rnd(-.006, .006);
        if (bx < .04 || bx > .96 || by < .04 || by > .96) continue;
        if (Math.abs((bx - .18) * .62 - (by - .52)) < .022) continue;
        var key = Math.round(bx * 1000) + ':' + Math.round(by * 1000);
        if (usedCells[key]) continue;
        usedCells[key] = 1;

        var z = zone(bx, by);
        var h, shp, cl, use, wid, dep;
        if (z === 'core') {
          h = rnd(55, 138); cl = pick([.46, .48]); wid = rnd(.019, .026); dep = rnd(.026, .033);
          shp = pick(['box', 'box', 'box', 'step', 'cyl']);
          use = pick(['商业综合体', '写字楼', '酒店', '政务大厅']);
        } else if (z === 'south') {
          h = rnd(40, 118); cl = pick([.48, .50, .52]); wid = rnd(.017, .024); dep = rnd(.024, .032);
          shp = pick(['box', 'box', 'box', 'step', 'twin']);
          use = pick(['商务办公', '会展中心', '住宅', '科技园']);
        } else if (z === 'east') {
          h = rnd(18, 62); cl = pick([.44, .46, .50]); wid = rnd(.015, .022); dep = rnd(.022, .030);
          shp = pick(['box', 'box', 'box', 'box', 'slab']);
          use = pick(['住宅', '社区商业', '学校', '医院']);
        } else if (z === 'north-east') {
          h = rnd(24, 78); cl = pick([.44, .46]); wid = rnd(.016, .024); dep = rnd(.024, .032);
          shp = pick(['box', 'box', 'step', 'slab']);
          use = pick(['住宅', '物流仓储', '专业市场']);
        } else if (z === 'south-west') {
          h = rnd(12, 46); cl = pick([.42, .44]); wid = rnd(.015, .023); dep = rnd(.022, .030);
          shp = pick(['box', 'box', 'slab']);
          use = pick(['住宅', '文创园', '批发市场']);
        } else {
          h = rnd(20, 76); cl = pick([.44, .46, .48, .50]); wid = rnd(.016, .024); dep = rnd(.023, .031);
          shp = pick(['box', 'box', 'box', 'step']);
          use = pick(['办公', '住宅', '商业', '公共服务']);
        }
        /* 高度衰减：离市中心越远越低 */
        h *= (1 - Math.min(.55, dc / .42 * .55));
        h = Math.max(5, h);
        if (Math.random() < .05) h = Math.max(4, h * .55); /* 少量低矮配套 */

        CITY.push({
          bx: bx, by: by, bw: wid, bh: dep, h: h,
          a: .30 + Math.min(.42, dc * .5), shape: shp, c: cl,
          tower: Math.random() < .10, use: use,
          name: pick(['锦江区政府办公楼', '高新孵化园 5 号楼', '天府三街地铁站上盖', '市第一人民医院',
            '川大华西校区教学楼', '交子公园观景台', '天府新区规划馆', '武侯祠大街综合楼',
            '建设路商业中心', '东郊记忆创意园', '高新金融中心', '桐梓林邻里中心'])
        });
      }
    }
  }

  /* ---- 6. 地下管网：真实分压级制 + 树状/枝状拓扑 ---- */
  /* 燃气管网：高、中、低三级，自调压站沿主干道辐射 */
  var gasHigh = [];   // 高压环
  var gasMid = [];    // 中压支
  var waterMain = []; // 给水主干
  var drainNet = [];  // 排水
  var heatNet = [];   // 热力
  var powerNet = [];  // 电力沟

  function branch(arr, x1, y1, ang, len, jitter) {
    var x2 = x1 + Math.cos(ang) * len, y2 = y1 + Math.sin(ang) * len;
    arr.push({ x1: x1, y1: y1, x2: x2, y2: y2 });
    /* 中间加一个折点，模拟沿路偏移 */
    if (jitter > 0 && Math.random() < .6) {
      arr.push({ x1: x2, y1: y2, x2: x2 + Math.cos(ang + rnd(-.3, .3)) * len * .5, y2: y2 + Math.sin(ang + rnd(-.3, .3)) * len * .5 });
    }
    return [x2, y2];
  }

  /* 高压燃气管：沿三环 + 两条穿越城主干 */
  rings.forEach(function (rg, idx) {
    if (idx < 1) return;
    for (a = 0; a < Math.PI * 2; a += .03) {
      gasHigh.push({ x1: CX + Math.cos(a) * rg.r, y1: CY + Math.sin(a) * rg.r * .8,
        x2: CX + Math.cos(a + .03) * rg.r, y2: CY + Math.sin(a + .03) * rg.r * .8 });
    }
  });
  gasHigh.push({ x1: CX, y1: CY - .30, x2: CX, y2: CY + .30 });   // 南北向过江高压
  gasHigh.push({ x1: CX - .30, y1: CY, x2: CX + .30, y2: CY });   // 东西向

  /* 中压燃气管：从高压接出，向街区枝状延伸 */
  for (i = 0; i < 26; i++) {
    var sa = rnd(0, Math.PI * 2), sr = rnd(.10, .34);
    var sx = CX + Math.cos(sa) * sr, sy = CY + Math.sin(sa) * sr * .8;
    var cur = [sx, sy];
    var seg = 2 + Math.floor(Math.random() * 3);
    for (var s = 0; s < seg; s++) {
      cur = branch(gasMid, cur[0], cur[1], sa + rnd(-.7, .7), rnd(.03, .07), 1);
    }
  }

  /* 给水主干：环状 + 枝状 */
  rings.forEach(function (rg) {
    for (a = 0; a < Math.PI * 2; a += .035) {
      waterMain.push({ x1: CX + Math.cos(a) * rg.r * .94, y1: CY + Math.sin(a) * rg.r * .94 * .8,
        x2: CX + Math.cos(a + .035) * rg.r * .94, y2: CY + Math.sin(a + .035) * rg.r * .94 * .8 });
    }
  });
  for (i = 0; i < 30; i++) {
    var wa = rnd(0, Math.PI * 2), wr = rnd(.06, .32);
    cur = [CX + Math.cos(wa) * wr, CY + Math.sin(wa) * wr * .8];
    for (s = 0; s < 2 + Math.floor(Math.random() * 3); s++) cur = branch(waterMain, cur[0], cur[1], wa + rnd(-.8, .8), rnd(.025, .06), 1);
  }

  /* 排水：顺地势，向河道汇聚（枝状，末端指向锦江） */
  for (i = 0; i < 34; i++) {
    var da = rnd(0, Math.PI * 2), dr = rnd(.08, .36);
    cur = [CX + Math.cos(da) * dr, CY + Math.sin(da) * dr * .8];
    for (s = 0; s < 2 + Math.floor(Math.random() * 3); s++) {
      var tx = .40, ty = .50; /* 指向河道 */
      var ang2 = Math.atan2(ty - cur[1], tx - cur[0]) + rnd(-.9, .9);
      cur = branch(drainNet, cur[0], cur[1], ang2, rnd(.03, .075), 1);
    }
  }

  /* 热力：集中供热区，南部新城为主，环+支 */
  for (a = 0; a < Math.PI * 2; a += .05) {
    heatNet.push({ x1: CX + .16 + Math.cos(a) * .10, y1: CY + .06 + Math.sin(a) * .08,
      x2: CX + .16 + Math.cos(a + .05) * .10, y2: CY + .06 + Math.sin(a + .05) * .08 });
  }
  for (i = 0; i < 14; i++) {
    var ha = rnd(0, Math.PI * 2);
    cur = [CX + .16, CY + .06];
    for (s = 0; s < 2; s++) cur = branch(heatNet, cur[0], cur[1], ha + rnd(-.5, .5), rnd(.04, .08), 1);
  }

  /* 电力通信沟：随道路密布 */
  for (i = 0; i < 46; i++) {
    var pa = rnd(0, Math.PI * 2), pr = rnd(.05, .38);
    cur = [CX + Math.cos(pa) * pr, CY + Math.sin(pa) * pr * .8];
    for (s = 0; s < 2 + Math.floor(Math.random() * 3); s++) cur = branch(powerNet, cur[0], cur[1], pa + rnd(-1, 1), rnd(.03, .08), 1);
  }

  /* 管井（阀门井/检查井） */
  for (i = 0; i < 70; i++) {
    var ja = rnd(0, Math.PI * 2), jr = rnd(.05, .40);
    JUNCTIONS.push({ x: CX + Math.cos(ja) * jr, y: CY + Math.sin(ja) * jr * .8,
      t: pick(['阀门井', '检查井', '凝水缸', '排气阀']) });
  }

  /* 综合管廊：沿天府大道 + 一环（真实线位） */
  TUNNEL = [
    { pts: [[.50, .10], [.50, .20], [.50, .30], [.505, .40], [.51, .50], [.52, .58], [.53, .70]], w: 9 },
    { pts: [[.40, .36], [.44, .40], [.50, .44], [.56, .48], [.62, .52], [.70, .56]], w: 7 }
  ];

  PIPES = [
    { d: gasHigh, c: '#ffb020', w: 2.6, t: '燃气高压' },
    { d: gasMid, c: '#ffcf6b', w: 1.3, t: '燃气中压' },
    { d: waterMain, c: '#2f7bff', w: 1.9, t: '给水主干' },
    { d: drainNet, c: '#26d9a3', w: 1.5, t: '排水' },
    { d: heatNet, c: '#ff4d6a', w: 1.4, t: '热力' },
    { d: powerNet, c: '#b07dff', w: 1.0, t: '电力通信' }
  ];

  /* ---- 7. 地标（纯文字标注，方位按真实成都地理） ----
   * 方位：nx→东，ny→南。天府广场(0.50,0.44) 为市中心。
   * 参考真实直线距离/方位（相对天府广场）：
   *   春熙路IFS 东北1.5km · 广电塔339 东北4.5km · 火车北站 正北偏西5km
   *   天府立交 正南7km · 金融城双子塔 南偏东8.5km · 环球中心 南偏东11km
   *   电子科大(清水河校区·高新西区) 西北16km · 兴隆湖(天府新区) 正南偏东约25km */
  LANDMARKS = [
    { x: .50, y: .44, name: '天府广场' },
    { x: .55, y: .41, name: '春熙路 · IFS' },
    { x: .64, y: .35, name: '四川广电塔（339）' },
    { x: .47, y: .27, name: '火车北站枢纽' },
    { x: .52, y: .62, name: '天府立交' },
    { x: .62, y: .66, name: '金融城双子塔' },
    { x: .56, y: .70, name: '环球中心' },
    { x: .19, y: .22, name: '电子科大 · 清水河校区' },
    { x: .55, y: .75, name: '兴隆湖' }
  ];
  CITY_SORTED = CITY.slice().sort(function (a, b) { return a.by - b.by; });
})();
function pickName() {
  return pick(['锦江区政府办公楼', '高新孵化园 5 号楼', '天府三街地铁站上盖', '市第一人民医院', '川大华西校区教学楼',
    '交子公园观景台', '天府新区规划馆', '武侯祠大街综合楼', '建设路商业中心', '东郊记忆创意园']);
}

/* 等距三面体（带形状变体）：返回楼顶矩形，供拾取用 */
function isoFaces(base, top, w, d) {
  return {
    right: [[base.x, base.y], [base.x + w, base.y], [top.x + w, top.y], [top.x, top.y]],
    front: [[base.x, base.y], [base.x, base.y - d], [top.x, top.y - d], [top.x, top.y]],
    roof: [[top.x, top.y], [top.x + w, top.y], [top.x + w, top.y - d], [top.x, top.y - d]]
  };
}
function fillPoly(pts, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath(); ctx.fill();
}

function drawBox(b, hot) {
  var z = cam.zoom;
  var base = proj(b.bx, b.by, 0);
  var top = proj(b.bx, b.by, b.h * .95);
  var w = b.bw * 1400 * z, d = b.bh * 1092 * z, hp = b.h * z;
  var f, g;

  if (hot) { ctx.shadowColor = 'rgba(0,229,255,.85)'; ctx.shadowBlur = 20; }

  /* 配色：按用途给色相差异，选中统一青色高亮 */
  var cRight, cFront, cRoof;
  var al = Math.round(b.a * 255).toString(16).padStart(2, '0');
  var al2 = Math.round(b.a * .82 * 255).toString(16).padStart(2, '0');
  if (hot) {
    cRight = '#00e5ffaa'; cFront = '#00b4f080'; cRoof = '#96f8fff5';
  } else {
    var t = b.use || '办公';
    var cMid = t.indexOf('住宅') >= 0 ? '#1e54a0'
      : t.indexOf('商业') >= 0 ? '#1868be'
      : t.indexOf('工业') >= 0 || t.indexOf('仓储') >= 0 || t.indexOf('物流') >= 0 ? '#284a8c'
      : t.indexOf('公共服务') >= 0 || t.indexOf('医院') >= 0 || t.indexOf('学校') >= 0 ? '#1a60a8'
      : '#1c5cac';
    var dark = t.indexOf('住宅') >= 0 ? '#123a72'
      : t.indexOf('商业') >= 0 ? '#0f4a8c'
      : t.indexOf('工业') >= 0 || t.indexOf('仓储') >= 0 || t.indexOf('物流') >= 0 ? '#1b3466'
      : t.indexOf('公共服务') >= 0 || t.indexOf('医院') >= 0 || t.indexOf('学校') >= 0 ? '#124474'
      : '#14407e';
    cRight = cMid + al;
    cFront = dark + al2;
    cRoof = '#488cd6' + Math.round(Math.min(.9, b.a + .22) * 255).toString(16).padStart(2, '0');
  }

  var shape = b.shape || 'box';

  if (shape === 'cyl') {
    /* 圆柱体：椭圆顶 + 弧面 */
    var r = w / 2, cy = base.y, ry = d / 2;
    var gg = ctx.createLinearGradient(base.x - r, 0, base.x + r, 0);
    gg.addColorStop(0, cFront); gg.addColorStop(.45, cRight); gg.addColorStop(1, cRoof);
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.moveTo(base.x - r, cy);
    ctx.lineTo(base.x - r, top.y);
    ctx.ellipse(base.x, top.y, r, ry, 0, Math.PI, 0, true);
    ctx.lineTo(base.x + r, cy);
    ctx.ellipse(base.x, cy, r, ry, 0, 0, Math.PI, true);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = cRoof;
    ctx.beginPath(); ctx.ellipse(base.x, top.y, r, ry, 0, 0, 7); ctx.fill();
    b._s = { x: top.x - r, y: top.y - ry, w: r * 2, d: ry * 2, top: top.y, hp: hp };

  } else if (shape === 'step') {
    /* 退台高层：2-3 段递减 */
    var segs = 2 + (b.h > 70 ? 1 : 0), curB = base, curT = top, curW = w, curD = d, curH = hp;
    for (var s = 0; s < segs; s++) {
      var ratio = 1 - s * .26;
      var sw = w * ratio, sd = d * ratio;
      var sb = proj(b.bx, b.by, b.h * .95 * (s / segs)), st = proj(b.bx, b.by, b.h * .95 * ((s + 1) / segs));
      var fa = isoFaces(sb, st, sw, sd);
      fillPoly(fa.right, s === 0 ? cRight : 'rgba(20,70,140,' + (b.a * .9) + ')');
      fillPoly(fa.front, s === 0 ? cFront : 'rgba(14,54,116,' + (b.a * .9) + ')');
      fillPoly(fa.roof, s === segs - 1 ? cRoof : 'rgba(52,120,196,' + (b.a * .8) + ')');
      curT = st; curW = sw; curD = sd;
    }
    b._s = { x: curT.x, y: curT.y - curD, w: curW, d: curD, top: curT.y, hp: hp };

  } else if (shape === 'slab') {
    /* 板式住宅：长条形 */
    var lw = w * 1.7, ld = d * .62;
    var lb = proj(b.bx - b.bw * .35, b.by, 0), lt = proj(b.bx - b.bw * .35, b.by, b.h * .95);
    var fa2 = isoFaces(lb, lt, lw, ld);
    fillPoly(fa2.right, cRight); fillPoly(fa2.front, cFront); fillPoly(fa2.roof, cRoof);
    /* 顶部加一条女儿墙感 */
    ctx.strokeStyle = 'rgba(120,200,255,.35)'; ctx.lineWidth = 1;
    ctx.strokeRect(lt.x, lt.y - ld, lw, ld);
    b._s = { x: lt.x, y: lt.y - ld, w: lw, d: ld, top: lt.y, hp: hp };

  } else if (shape === 'twin') {
    /* 双塔楼：两栋并排 */
    [-1, 1].forEach(function (sd) {
      var tb = proj(b.bx + sd * b.bw * .26, b.by, 0), tt = proj(b.bx + sd * b.bw * .26, b.by, b.h * .95);
      var tw = w * .48, td = d * .92;
      var fa3 = isoFaces(tb, tt, tw, td);
      fillPoly(fa3.right, sd > 0 ? cRight : 'rgba(22,80,156,' + (b.a * .95) + ')');
      fillPoly(fa3.front, sd > 0 ? cFront : 'rgba(16,60,124,' + (b.a * .95) + ')');
      fillPoly(fa3.roof, cRoof);
    });
    b._s = { x: top.x, y: top.y - d, w: w, d: d, top: top.y, hp: hp };

  } else {
    /* 标准方盒（默认） */
    var fa0 = isoFaces(base, top, w, d);
    fillPoly(fa0.right, cRight); fillPoly(fa0.front, cFront); fillPoly(fa0.roof, cRoof);
    b._s = { x: top.x, y: top.y - d, w: w, d: d, top: top.y, hp: hp };
  }

  /* 楼顶细节：机房/天线 */
  if (z > .9) {
    var s = b._s;
    if (b.tower && shape !== 'cyl') {
      ctx.strokeStyle = 'rgba(0,229,255,.8)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(s.x + s.w / 2, s.y + s.d / 2); ctx.lineTo(s.x + s.w / 2, s.y + s.d / 2 - 16); ctx.stroke();
      ctx.fillStyle = 'rgba(255,77,106,.95)';
      ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + s.d / 2 - 18, 2.3, 0, 7); ctx.fill();
    } else if (shape !== 'cyl') {
      ctx.fillStyle = 'rgba(110,190,255,.30)';
      var rw = Math.max(2, s.w * .26), rd2 = Math.max(2, s.d * .26);
      ctx.fillRect(s.x + s.w * .36, s.y + s.d * .36, rw, rd2);
    }
  }

  /* 窗户肌理（近景才有） */
  if (z > 1.5 && shape !== 'cyl') {
    var s2 = b._s;
    ctx.fillStyle = hot ? 'rgba(255,255,255,.30)' : 'rgba(150,215,255,.16)';
    var rows = Math.max(2, Math.floor(hp / 16));
    for (var r = 0; r < rows; r++) {
      var yy = base.y - (r + .5) * hp / rows;
      var xx = base.x + w * .18, ww = w * .16;
      if (r % 2 === 0) ctx.fillRect(xx, yy - 1.5, ww, 2);
      else ctx.fillRect(base.x + w * .60, yy - 1.5, ww, 2);
    }
  }

  ctx.shadowBlur = 0;
}

/* 地标：纯文字标注（定位点 + 名称），不用特殊形状表现 */
function drawLandmark(l) {
  var p = proj(l.x, l.y, 0);
  var r = 3.2 * Math.max(.8, cam.zoom);
  ctx.save();
  /* 外圈光晕 + 定位点 */
  ctx.shadowColor = 'rgba(0,150,255,.8)'; ctx.shadowBlur = 9;
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7);
  ctx.fillStyle = 'rgba(0,229,255,.92)'; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.1, 0, 7);
  ctx.strokeStyle = 'rgba(0,229,255,.34)'; ctx.lineWidth = 1; ctx.stroke();
  /* 名称：默认常显，缩放较大时更清晰 */
  if (cam.zoom > .7) {
    var fs = cam.zoom > 1.4 ? 12 : 11;
    ctx.font = fs + 'px "Microsoft YaHei UI"';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    var tw = ctx.measureText(l.name).width;
    var ty = p.y - r * 2.6 - 7;
    ctx.fillStyle = 'rgba(4,14,32,.78)';
    ctx.fillRect(p.x - tw / 2 - 5, ty - fs, tw + 10, fs + 6);
    ctx.strokeStyle = 'rgba(0,229,255,.28)'; ctx.lineWidth = 1;
    ctx.strokeRect(p.x - tw / 2 - 5, ty - fs, tw + 10, fs + 6);
    ctx.fillStyle = 'rgba(175,220,255,.95)';
    ctx.fillText(l.name, p.x, ty - 2);
  }
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, MAPW, MAPH);
  var g = ctx.createRadialGradient(MAPW * .5, MAPH * .54, 40, MAPW * .5, MAPH * .54, MAPW * .62);
  g.addColorStop(0, 'rgba(28,88,168,.17)'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.fillRect(0, 0, MAPW, MAPH);

  if (LAYERS.building) {
    ctx.strokeStyle = 'rgba(60,130,210,.09)'; ctx.lineWidth = 1;
    for (var i = 0; i <= 16; i++) {
      var t = i / 16, p = proj(t, 0, 0), q = proj(t, 1, 0);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      var r = proj(0, t, 0), s = proj(1, t, 0);
      ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(s.x, s.y); ctx.stroke();
    }
  }
  if (LAYERS.road) {
    ctx.lineCap = 'round';
    ROADS.forEach(function (rd) {
      var a = proj(rd.x1, rd.y1, 0), b = proj(rd.x2, rd.y2, 0);
      ctx.strokeStyle = rd.w > 2 ? 'rgba(92,162,240,.3)' : 'rgba(80,150,230,.19)';
      ctx.lineWidth = rd.w * cam.zoom;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
  }
  if (LAYERS.water) {
    RIVER.forEach(function (rv) {
      var pts = rv.pts.map(function (p) { return proj(p[0], p[1], 0); });
      var path = function (off) {
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y + off);
        for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y + off);
      };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      path(0); ctx.strokeStyle = 'rgba(10,58,140,.60)'; ctx.lineWidth = rv.w * cam.zoom; ctx.stroke();
      path(0); ctx.strokeStyle = 'rgba(24,110,210,.42)'; ctx.lineWidth = rv.w * .62 * cam.zoom; ctx.stroke();
      path(0); ctx.strokeStyle = 'rgba(0,229,255,.16)'; ctx.lineWidth = rv.w * .22 * cam.zoom; ctx.stroke();
    });
  }
  /* 综合管廊：粗青线 + 舱室分隔纹 */
  if (LAYERS.pipe) {
    TUNNEL.forEach(function (tn) {
      var pts = tn.pts.map(function (p) { return proj(p[0], p[1], .55); });
      var path2 = function () {
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      path2(); ctx.strokeStyle = 'rgba(0,229,255,.20)'; ctx.lineWidth = tn.w * cam.zoom + 8; ctx.stroke();
      path2(); ctx.strokeStyle = 'rgba(0,190,235,.72)'; ctx.lineWidth = tn.w * cam.zoom; ctx.stroke();
      path2(); ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(200,250,255,.8)'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
    });
  }
  if (LAYERS.pipe) {
    PIPES.forEach(function (p) {
      ctx.strokeStyle = p.c; ctx.globalAlpha = .55; ctx.lineWidth = p.w * cam.zoom;
      ctx.lineCap = 'round';
      p.d.forEach(function (s) {
        var a = proj(s.x1, s.y1, .42), b = proj(s.x2, s.y2, .42);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      ctx.globalAlpha = 1;
    });
    /* 管井：小方块节点 */
    if (cam.zoom > .85) {
      JUNCTIONS.forEach(function (j) {
        var q = proj(j.x, j.y, .42), s2 = 2.4 * cam.zoom;
        ctx.fillStyle = 'rgba(0,229,255,.62)';
        ctx.fillRect(q.x - s2 / 2, q.y - s2 / 2, s2, s2);
      });
    }
  }

  hoverBuilding = null; var mx = mouse.x, my = mouse.y;
  if (LAYERS.building) {
    CITY_SORTED.forEach(function (b) {
      drawBox(b, b === selectedBuilding);
      if (mx >= b._s.x && mx <= b._s.x + b._s.w && my >= b._s.y && my <= b._s.top) hoverBuilding = b;
    });
    LANDMARKS.forEach(drawLandmark);
  }
  cv.style.cursor = hoverBuilding ? 'pointer' : (drag ? 'grabbing' : 'grab');

  // 扫描光带
  var sy = ((Date.now() - t0) % 5200) / 5200 * MAPH;
  var sg = ctx.createLinearGradient(0, sy - 55, 0, sy + 55);
  sg.addColorStop(0, 'transparent'); sg.addColorStop(.5, 'rgba(0,229,255,.05)'); sg.addColorStop(1, 'transparent');
  ctx.fillStyle = sg; ctx.fillRect(0, sy - 55, MAPW, 110);

  drawCompass();
  drawRoadLabels();

  cam.x += (cam.tx - cam.x) * .09; cam.y += (cam.ty - cam.y) * .09; cam.zoom += (cam.tz - cam.zoom) * .09;
  if (badgeTick++ % 3 === 0) renderBadges();
  requestAnimationFrame(render);
}
var badgeTick = 0;

/* 指北针（固定在地图左上，画在 canvas 内层） */
function drawCompass() {
  var x = MAPW - 74, y = 74, r = 30;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
  ctx.fillStyle = 'rgba(6,22,46,.86)'; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0,229,255,.5)'; ctx.lineWidth = 1.2; ctx.stroke();
  /* 外圈刻度 */
  for (var i = 0; i < 4; i++) {
    var a0 = -Math.PI / 2 + i * Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a0) * (r - 5), y + Math.sin(a0) * (r - 5));
    ctx.lineTo(x + Math.cos(a0) * (r - 12), y + Math.sin(a0) * (r - 12));
    ctx.stroke();
  }
  /* 指针：北（上）红，南（下）蓝白 */
  var na = -Math.PI / 2, sa = Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(na) * 22, y + Math.sin(na) * 22);
  ctx.lineTo(x + Math.cos(na + 2.4) * 9, y + Math.sin(na + 2.4) * 9);
  ctx.lineTo(x + Math.cos(na - 2.4) * 9, y + Math.sin(na - 2.4) * 9);
  ctx.closePath(); ctx.fillStyle = '#ff4d6a'; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(sa) * 22, y + Math.sin(sa) * 22);
  ctx.lineTo(x + Math.cos(sa + 2.4) * 9, y + Math.sin(sa + 2.4) * 9);
  ctx.lineTo(x + Math.cos(sa - 2.4) * 9, y + Math.sin(sa - 2.4) * 9);
  ctx.closePath(); ctx.fillStyle = 'rgba(150,200,240,.8)'; ctx.fill();
  ctx.font = 'bold 11px "Microsoft YaHei UI"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff8f9c'; ctx.fillText('北', x, y - r - 11);
  ctx.fillStyle = 'rgba(160,200,240,.9)'; ctx.fillText('南', x, y + r + 11);
  ctx.restore();
}

/* 主干道名称标注 */
var ROAD_LABELS = [
  { x: .50, y: .26, t: '人民北路', rot: -Math.PI / 2 },
  { x: .50, y: .62, t: '天府大道南段', rot: Math.PI / 2 },
  { x: .50, y: .44, t: '蜀都大道', rot: 0 },
  { x: .27, y: .44, t: '二环路西段', rot: 0 },
  { x: .73, y: .44, t: '二环路东段', rot: 0 },
  { x: .50, y: .14, t: '北三环路', rot: 0 },
  { x: .50, y: .74, t: '南三环路', rot: 0 },
  { x: .17, y: .50, t: '锦江（府河）', rot: -.22 }
];
function drawRoadLabels() {
  if (cam.zoom < .7) return;
  ctx.save();
  ctx.font = '11px "Microsoft YaHei UI"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ROAD_LABELS.forEach(function (l) {
    var p = proj(l.x, l.y, 0);
    if (p.x < 60 || p.x > MAPW - 60 || p.y < 40 || p.y > MAPH - 40) return;
    ctx.save();
    ctx.translate(p.x, p.y); if (l.rot) ctx.rotate(l.rot);
    var tw = ctx.measureText(l.t).width + 12;
    ctx.fillStyle = 'rgba(6,22,46,.72)';
    ctx.fillRect(-tw / 2, -8, tw, 16);
    ctx.fillStyle = 'rgba(170,215,255,.88)';
    ctx.fillText(l.t, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

/* 交互 */
cv.addEventListener('mousedown', function (e) { drag = { x: e.clientX, y: e.clientY, cx: cam.tx, cy: cam.ty }; cv.classList.add('dragging'); cv._m = false; });
window.addEventListener('mousemove', function (e) {
  var r = cv.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * (MAPW / r.width); mouse.y = (e.clientY - r.top) * (MAPH / r.height);
  if (drag) {
    cam.tx = Math.max(-.25, Math.min(1.25, drag.cx - (e.clientX - drag.x) / (1400 * cam.zoom)));
    cam.ty = Math.max(-.25, Math.min(1.25, drag.cy - (e.clientY - drag.y) / (1092 * cam.zoom)));
    if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) cv._m = true;
  }
});
window.addEventListener('mouseup', function () { drag = null; cv.classList.remove('dragging'); });
cv.addEventListener('click', function () {
  if (cv._m) return;
  if (hoverBuilding) { selectedBuilding = hoverBuilding; showBubble(hoverBuilding); } else { hideBubble(); }
});
cv.addEventListener('wheel', function (e) { e.preventDefault(); cam.tz = Math.max(.55, Math.min(3, cam.tz * (e.deltaY > 0 ? .9 : 1.1))); }, { passive: false });
$('#zoom-in').onclick = function () { cam.tz = Math.min(3, cam.tz * 1.25); };
$('#zoom-out').onclick = function () { cam.tz = Math.max(.55, cam.tz * .8); };
$('#reset-view').onclick = function () { cam.tx = .5; cam.ty = .5; cam.tz = 1; hideBubble(); };
['building', 'road', 'pipe', 'water', 'badge'].forEach(function (k) {
  $('#ly-' + k).onchange = function (e) { LAYERS[k] = e.target.checked; };
});

/* 建筑气泡 */
function showBubble(b) {
  var el = $('#bubble'), sr = stage.getBoundingClientRect(), ss = sr.width / 2560;
  el.style.left = (b._s.x + b._s.w / 2) * ss + 'px';
  el.style.top = (b._s.top * ss - 14) + 'px';
  var floors = Math.max(3, Math.round(b.h / 3.4));
  el.innerHTML = '<div class="bh">' + b.name + '</div><div class="bb">' +
    '建筑高度 <b>' + b.h.toFixed(1) + ' m</b> · 地上 <b>' + floors + ' 层</b><br>' +
    '建成年份 <b>' + pick([1998, 2006, 2013, 2018, 2021]) + '</b> · 用途 <b>' + pick(['办公', '商业', '住宅', '公共设施']) + '</b><br>' +
    '物联感知 <b style="color:var(--ok)">在线</b> · 网格归属 <b>' + pick(['锦江区', '武侯区', '高新区', '青羊区', '成华区']) + '</b></div>' +
    '<div class="bf"><button data-a="m">查看 BIM 详情</button><button data-a="c">关闭</button></div>';
  el.classList.add('on');
  el.querySelector('[data-a="c"]').onclick = hideBubble;
  el.querySelector('[data-a="m"]').onclick = function () { hideBubble(); Detail.show({ title: '建筑单体详情 · BIM 轻量化', html: bimDetail(b) }); };
}
function hideBubble() { $('#bubble').classList.remove('on'); }

function bimDetail(b) {
  var floors = Math.max(3, Math.round(b.h / 3.4)), rows = '';
  for (var i = 1; i <= Math.min(6, floors); i++) {
    rows += '<tr><td>F' + i + '</td><td>' + pick(['办公', '商业', '设备', '停车', '会议', '展览']) + '</td><td>' +
      (b.bw * 1400 * 4).toFixed(0) + ' m²</td><td>在线</td><td>' + pick(['烟感', '视频', '水压', '电气火灾']) + '</td></tr>';
  }
  return '<div class="d-sec">基础属性</div><div class="d-kv">' +
    kc('建筑高度', b.h.toFixed(1) + ' m', 1) + kc('地上层数', floors + ' 层') + kc('建筑面积', fmt(b.bw * 1400 * 4) + ' m²') +
    kc('结构类型', pick(['框架-剪力墙', '钢结构', '框架结构'])) + '</div>' +
    '<div class="d-sec">分层信息（BIM 构件挂接）</div><table class="d-table"><tr><th>楼层</th><th>功能</th><th>面积</th><th>物联感知</th><th>挂接系统</th></tr>' + rows + '</table>' +
    '<div class="d-note">注：以上为演示模拟数据。真实场景由 BIM 轻量化引擎渲染单体模型，并与消防、安防、能源计量等子系统联动。</div>';
}

/* 标注 & 图例 */
function renderBadges() {
  var wrap = $('#map-badges'), sc = SCENES[active];
  wrap.innerHTML = '';
  if (!LAYERS.badge || !sc) return;
  sc.badges.forEach(function (bg) {
    var p = proj(bg.x, bg.y, 0);
    var el = document.createElement('div');
    el.className = 'map-badge';
    el.style.left = p.x + 'px'; el.style.top = (p.y - 28) + 'px';
    el.innerHTML = '<span class="lv ' + bg.lv + '"></span>' + bg.t;
    if (bg.hit) el.onclick = function () { Detail.show({ title: bg.t, html: hitDetail(bg.hit) }); };
    wrap.appendChild(el);
  });
  $('#map-legend').innerHTML = sc.legend.map(function (l) { return '<span><i style="background:' + l.c + '"></i>' + l.t + '</span>'; }).join('');
  $('#map-scene').textContent = sc.label;
}

/* =========================================================
 * 面板渲染
 * ========================================================= */
function kc(k, v, hl) { return '<div class="cell"><div class="k">' + k + '</div><div class="v' + (hl ? ' hl' : '') + '">' + v + '</div></div>'; }
function sec(t) { return '<div class="d-sec">' + t + '</div>'; }
function cb(id, h) { return '<div class="chart-box" id="' + id + '" style="height:' + (h || 200) + 'px"></div>'; }
function bar(label, val, max, warn) {
  return '<div class="bar-row"><span class="bl">' + label + '</span><div class="bt"><div class="bf' + (warn ? ' w' : '') + '" style="width:' + Math.min(100, val / max * 100) + '%"></div></div><span class="bv">' + val + (max > 100 ? '' : '%') + '</span></div>';
}
function list(items) {
  return '<div class="alist">' + items.map(function (it) {
    return '<div class="row"><span class="tag ' + it.lv + '">' + it.tag + '</span><span class="nm">' + it.n + '</span><span class="st">' + it.s + '</span><span class="tm num">' + it.t + '</span></div>';
  }).join('') + '</div>';
}
function card(title, body, more) {
  return '<div class="p-card' + (more ? ' grow' : '') + '"><div class="p-head"><h3>' + title + '</h3>' + (more ? '<span class="more">' + more + '</span>' : '') + '</div><div class="p-body' + (more ? ' scroll' : '') + '">' + body + '</div></div>';
}
function kpi(items) {
  return '<div class="kpi-row">' + items.map(function (i) {
    return '<div class="kpi"><div class="v num">' + i.v + (i.u ? '<small>' + i.u + '</small>' : '') + '</div><div class="k">' + i.k + '</div><div class="t ' + (i.d > 0 ? 'up' : 'down') + '">' + (i.d > 0 ? '▲ ' : '▼ ') + Math.abs(i.d) + '% 同比</div></div>';
  }).join('') + '</div>';
}
/* 迷你进度条组（用于部门/区域排行） */
function miniBars(items) {
  return '<div class="mbars">' + items.map(function (it) {
    var pct = Math.min(100, it.v / it.max * 100);
    return '<div class="mb-row"><span class="mb-n">' + it.n + '</span>' +
      '<div class="mb-t"><div class="mb-f' + (it.warn ? ' w' : '') + '" style="width:' + pct + '%"></div></div>' +
      '<span class="mb-v num">' + it.v.toLocaleString('en-US') + '</span></div>';
  }).join('') + '</div>';
}
/* 数字翻牌格（4 列小卡） */
function numGrid(items) {
  return '<div class="ngrid">' + items.map(function (i) {
    return '<div class="ng' + (i.hl ? ' hl' : '') + '"><div class="ng-v num">' + i.v + (i.u ? '<small>' + i.u + '</small>' : '') + '</div>' +
      '<div class="ng-k">' + i.k + '</div></div>';
  }).join('') + '</div>';
}
/* 带图例的分区状态行 */
function zoneRows(items) {
  return '<div class="zrows">' + items.map(function (it) {
    return '<div class="zr"><span class="zr-n">' + it.n + '</span>' +
      '<span class="zr-b"><i class="' + it.lv + '"></i>' + it.s + '</span>' +
      '<span class="zr-v num">' + it.v + '</span></div>';
  }).join('') + '</div>';
}
function two(a, b, h) { return '<div class="d-grid2" style="gap:9px">' + cb(a, h) + cb(b, h) + '</div>'; }

/* =========================================================
 * 二级详情页组件
 * ========================================================= */
function sp(t, body, tag, cls) {
  return '<div class="sp' + (cls ? ' ' + cls : '') + '"><div class="sp-h"><h4>' + t + '</h4>' +
    (tag ? '<span class="tagx">' + tag + '</span>' : '') + '</div><div class="sp-b' + (cls && cls.indexOf('pad0') >= 0 ? ' pad0' : '') + '">' + body + '</div></div>';
}
function k4(items) {
  return '<div class="k4">' + items.map(function (i) {
    return '<div class="c' + (i.hl ? ' hl' : '') + '"><div class="k">' + i.k + '</div>' +
      '<div class="v num">' + i.v + (i.u ? '<small>' + i.u + '</small>' : '') + '</div>' +
      (i.d !== undefined ? '<div class="t ' + (i.d >= 0 ? 'up' : 'down') + '">' + (i.d >= 0 ? '▲ ' : '▼ ') + Math.abs(i.d) + '% 同比</div>' : '') +
      '</div>';
  }).join('') + '</div>';
}
function dt(cols, rows) {
  return '<table class="dt"><thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
    rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
}
function pill(t, lv) { return '<span class="pill ' + lv + '">' + t + '</span>'; }
function plist(items) {
  return '<div class="plist">' + items.map(function (i) {
    return '<div class="pr' + (i.w ? ' w' : '') + '"><span class="pn">' + i.n + '</span>' +
      '<div class="pt"><i style="width:' + Math.min(100, i.v / (i.max || 100) * 100) + '%"></i></div>' +
      '<span class="pv num">' + i.v + (i.max && i.max <= 100 ? '%' : '') + '</span></div>';
  }).join('') + '</div>';
}
function flow(items) {
  return '<div class="flow">' + items.map(function (i) {
    return '<div class="fs ' + (i.st || '') + '"><div class="dot">' + (i.st === 'ok' ? '✓' : i.st === 'run' ? '●' : '○') + '</div>' +
      '<div class="ft"><b>' + i.t + '</b>' + (i.d ? '<span>' + i.d + '</span>' : '') + '</div>' +
      '<div class="fd">' + (i.tm || '') + '</div></div>';
  }).join('') + '</div>';
}
function glist(items) {
  return '<div class="glist">' + items.map(function (i) {
    return '<div class="gi" data-k="' + (i.k || '') + '"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="' + i.icon + '"/></svg></div>' +
      '<div class="tx"><b>' + i.n + '</b><span>' + (i.s || '') + '</span></div>' +
      '<div class="vv' + (i.lv || '') + '">' + i.v + '</div></div>';
  }).join('') + '</div>';
}
function tl(items) {
  return '<div class="tl">' + items.map(function (i) {
    return '<div class="ti"><div class="tt">' + i.t + '</div><div class="tc">' + i.c + '</div></div>';
  }).join('') + '</div>';
}
function lg(items) {
  return '<div class="lg">' + items.map(function (i) { return '<span><i style="background:' + i.c + '"></i>' + i.t + '</span>'; }).join('') + '</div>';
}

var M = {
  overview: function () {
    return kpi([{ k: 'CIM 模型构件总量', v: '12,860', u: '万', d: 8.2 }, { k: '物联感知设备', v: '48.6', u: '万台', d: 12.4 },
      { k: '今日告警事件', v: '37', u: '起', d: -6.5 }, { k: '办件平均时效', v: '2.1', u: '天', d: -22 }]) +
      numGrid([
        { k: '接入部门', v: '42', u: '个', hl: 1 }, { k: '对接系统', v: '68', u: '个' },
        { k: '三维底图覆盖', v: '1,436', u: 'km²' }, { k: '今日数据交换', v: '286', u: '万条' }
      ]) +
      card('城市运行体征', two('m-ov-radar', 'm-ov-pie', 216), '体检报告') +
      card('各区运行指数（满分 100）', miniBars([
        { n: '四川天府新区', v: 93, max: 100 }, { n: '成都高新区', v: 91, max: 100 },
        { n: '锦江区', v: 88, max: 100 }, { n: '青羊区', v: 85, max: 100 },
        { n: '武侯区', v: 84, max: 100 }, { n: '成华区', v: 79, max: 100 },
        { n: '金牛区', v: 77, max: 100, warn: 1 }, { n: '龙泉驿区', v: 74, max: 100, warn: 1 }
      ]), '各区详情') +
      card('部门数据活跃度（今日）', miniBars([
        { n: '市住建局', v: 8642, max: 9000 }, { n: '市水务局', v: 6318, max: 9000 },
        { n: '市城管委', v: 5204, max: 9000 }, { n: '市交通局', v: 4876, max: 9000 },
        { n: '市生态环境局', v: 3412, max: 9000 }, { n: '市应急局', v: 2986, max: 9000 }
      ]), '部门看板') +
      card('今日重点事件', list([
        { lv: 'lv1', tag: '告警', n: '青羊区某中压燃气管道泄漏预警', s: '处置中', t: '09:42' },
        { lv: 'lv2', tag: '预警', n: '高新区 3 处工地 PM10 超标', s: '已派单', t: '10:15' },
        { lv: 'lv2', tag: '预警', n: '人民南路下穿隧道积水 12cm', s: '关注中', t: '10:26' },
        { lv: 'lv3', tag: '提醒', n: '5 个项目临近施工许可到期', s: '待办', t: '11:02' },
        { lv: 'lv3', tag: '提醒', n: '体检数据月度上报截止 3 天', s: '待办', t: '08:30' }]), '全部事件') +
      card('重点区域运行状态', zoneRows([
        { n: '春熙路商圈', s: '人流密集', lv: 'lv2', v: '18.6 万人' },
        { n: '高新南区', s: '运行平稳', lv: 'lv4', v: '46.2 万人' },
        { n: '天府新区', s: '建设活跃', lv: 'lv3', v: '32.8 万人' },
        { n: '火车北站', s: '到发正常', lv: 'lv4', v: '12.4 万人次' },
        { n: '环球中心', s: '负荷偏高', lv: 'lv2', v: '8.6 万人' }
      ]), '区域详情');
  },
  lifeline: function () {
    return kpi([{ k: '燃气用户', v: '428.6', u: '万户', d: 3.2 }, { k: '管网总长', v: '3,847', u: '公里', d: 1.8 },
      { k: '物联设备', v: '9,420', u: '台', d: 5.6 }, { k: '设备在线率', v: '99.2', u: '%', d: .4 }]) +
      card('风险评估 · 四色图', two('m-life-risk', 'm-life-trend', 232), '详情') +
      card('实时告警（按紧急度排序）', list([
        { lv: 'lv1', tag: '一级', n: '青羊区调压柜 #017 压力骤降', s: '处置中', t: '09:42' },
        { lv: 'lv2', tag: '二级', n: '武侯区第三方施工破坏预警', s: '已派单', t: '10:05' },
        { lv: 'lv2', tag: '二级', n: '成华区桥梁 A12 支座位移', s: '复核中', t: '10:18' },
        { lv: 'lv3', tag: '三级', n: '锦江排水泵站池水位偏高', s: '关注中', t: '10:33' },
        { lv: 'lv3', tag: '三级', n: '高新区供水管网夜间最小流量', s: '分析中', t: '11:01' }]));
  },
  pipe: function () {
    return kpi([{ k: '管线总长', v: '2.16', u: '万公里', d: 4.1 }, { k: '综合管廊', v: '46.8', u: '公里', d: 6.3 },
      { k: '隐患点', v: '318', u: '处', d: -8.4 }, { k: '排查覆盖率', v: '92.4', u: '%', d: 5.2 }]) +
      card('入廊管线构成', two('m-pipe-pie', 'm-pipe-bar', 232), '详情') +
      card('重点隐患清单', list([
        { lv: 'lv1', tag: '特级', n: '一环管廊燃气舱探测器报警', s: '处置中', t: '10:02' },
        { lv: 'lv2', tag: '重大', n: '三环给水管 DN1200 疑似渗漏', s: '检测中', t: '09:28' },
        { lv: 'lv2', tag: '重大', n: '电力舱 E-03 局部温度 41℃', s: '关注中', t: '08:55' },
        { lv: 'lv3', tag: '一般', n: '雨污混接点整改复核 12 处', s: '待复核', t: '昨日' }]));
  },
  safety: function () {
    return kpi([{ k: '今年事件', v: '1,286', u: '起', d: -4.2 }, { k: '平均响应', v: '4.8', u: '分钟', d: -18 },
      { k: '事件闭环率', v: '97.6', u: '%', d: 1.2 }, { k: '应急队伍', v: '326', u: '支', d: 3.6 }]) +
      card('事件态势与处置', two('m-safe-line', 'm-safe-pie', 232), '详情') +
      card('正在处置事件', list([
        { lv: 'lv1', tag: 'Ⅰ级', n: '青羊区燃气泄漏事件', s: '处置中', t: '10:24' },
        { lv: 'lv2', tag: 'Ⅱ级', n: '人民南路下穿隧道积水', s: '排水作业', t: '10:26' },
        { lv: 'lv2', tag: 'Ⅱ级', n: '高新某工地脚手架局部变形', s: '停工排查', t: '09:50' },
        { lv: 'lv3', tag: 'Ⅲ级', n: '某小区电梯困人（已获救）', s: '复核中', t: '08:12' }]));
  },
  approval: function () {
    return kpi([{ k: '在办项目', v: '1,842', u: '个', d: 6.8 }, { k: '今日办结', v: '126', u: '件', d: 9.4 },
      { k: '平均时限', v: '2.1', u: '天', d: -22 }, { k: '一次通过率', v: '93.5', u: '%', d: 2.1 }]) +
      card('审批效能分析', two('m-appr-line', 'm-appr-bar', 232), '详情') +
      card('超期预警项目', list([
        { lv: 'lv2', tag: '预警', n: '天府新区某项目施工许可变更', s: '剩余 1 天', t: '10:20' },
        { lv: 'lv2', tag: '预警', n: '高新某项目竣工验收备案', s: '剩余 2 天', t: '09:14' },
        { lv: 'lv3', tag: '提醒', n: '龙泉驿某项目绿建核查', s: '剩余 5 天', t: '08:46' }]));
  },
  checkup: function () {
    return kpi([{ k: '体检网格', v: '1,286', u: '个', d: 0 }, { k: '综合得分', v: '81.4', u: '分', d: 2.6 },
      { k: '问题指标', v: '7', u: '项', d: -2 }, { k: '整治完成率', v: '76.8', u: '%', d: 8.4 }]) +
      card('指标体系得分', cb('m-check-radar', 246), '体检报告') +
      card('突出短板', list([
        { lv: 'lv1', tag: '突出', n: '老旧小区占比偏高（41%）', s: '城市更新专项', t: '' },
        { lv: 'lv2', tag: '关注', n: '养老服务设施覆盖率 62%', s: '设施补短板', t: '' },
        { lv: 'lv2', tag: '关注', n: '路网密度 7.2 km/km²', s: '交通专项', t: '' },
        { lv: 'lv3', tag: '一般', n: '历史文化保护利用待提升', s: '名城保护', t: '' }]));
  },
  sponge: function () {
    return kpi([{ k: '达标片区', v: '38.6', u: '%', d: 6.2 }, { k: '年径流总量控制率', v: '72.4', u: '%', d: 3.1 },
      { k: '易涝点', v: '26', u: '处', d: -12 }, { k: '雨水资源化利用', v: '860', u: '万吨/年', d: 9.8 }]) +
      card('降雨响应与达标分析', two('m-sponge-line', 'm-sponge-bar', 232), '详情') +
      card('易涝点监测', list([
        { lv: 'lv2', tag: '预警', n: '人民南路下穿隧道 S-12', s: '积水 18cm', t: '10:26' },
        { lv: 'lv3', tag: '正常', n: '交子大道下穿 S-08', s: '积水 3cm', t: '10:30' },
        { lv: 'lv3', tag: '正常', n: '红星路南延线 S-21', s: '无积水', t: '10:31' }]));
  },
  planning: function () {
    return kpi([{ k: '叠加图层', v: '68', u: '类', d: 8 }, { k: '冲突图斑', v: '142', u: '个', d: -15 },
      { k: '已协调', v: '86', u: '个', d: 22 }, { k: '合规审查', v: '100', u: '%', d: 0 }]) +
      card('多规叠加分析', cb('m-plan-pie', 246), '冲突清单') +
      card('近期冲突图斑', list([
        { lv: 'lv1', tag: '待处理', n: '城总与土规重叠 C-07', s: '协调中', t: '' },
        { lv: 'lv2', tag: '关注', n: '生态红线一般管控区叠加', s: '复核中', t: '' },
        { lv: 'lv3', tag: '一般', n: '紫线建设控制地带重叠', s: '已备案', t: '' }]));
  },
  site: function () {
    return kpi([{ k: '在监工地', v: '1,286', u: '个', d: 5.4 }, { k: '在场人员', v: '8.6', u: '万人', d: 2.8 },
      { k: '今日告警', v: '46', u: '起', d: -14 }, { k: '视频在线率', v: '96.8', u: '%', d: 1.6 }]) +
      card('告警类型分布', two('m-site-pie', 'm-site-bar', 232), '详情') +
      card('告警工地', list([
        { lv: 'lv2', tag: '预警', n: '高新某项目扬尘 PM10 超标', s: '已派单', t: '10:15' },
        { lv: 'lv2', tag: '预警', n: '天府新区某项目塔吊限位', s: '复核中', t: '09:32' },
        { lv: 'lv3', tag: '一般', n: '龙泉驿某项目夜间施工噪声', s: '已告诫', t: '昨日' }]));
  },
  renewal: function () {
    return kpi([{ k: '改造小区', v: '326', u: '个', d: 12 }, { k: '涉及居民', v: '12.8', u: '万户', d: 8 },
      { k: '已完工', v: '148', u: '个', d: 18 }, { k: '投资完成', v: '68.4', u: '%', d: 9.2 }]) +
      card('片区改造进度', cb('m-renew-bar', 246), '项目库') +
      card('重点片区', list([
        { lv: 'lv3', tag: '在建', n: '玉林片区综合更新（26 个小区）', s: '进度 45%', t: '' },
        { lv: 'lv3', tag: '在建', n: '望平坊历史文化街区更新', s: '进度 72%', t: '' },
        { lv: 'lv2', tag: '预警', n: '抚琴街道加装电梯滞后', s: '进度 18%', t: '' }]));
  }
};

/* 深度分析 */
var DEEP_KPI = {
  overview: [['CIM 模型构件', '12,860 万'], ['三维底图覆盖', '1,436 km²', 1], ['部门接入', '42 个'], ['系统对接', '68 个']],
  lifeline: [['燃气高压管线', '216 公里'], ['在网压力级制', '7 级'], ['场站设施', '186 座', 1], ['物联网关', '3,860 台']],
  pipe: [['管线总长', '2.16 万公里'], ['综合管廊', '46.8 公里', 1], ['入廊管线', '5 类'], ['隐患整改率', '92.4%']],
  safety: [['应急队伍', '326 支'], ['物资库', '86 处'], ['今年事件', '1,286 起'], ['事件闭环率', '97.6%', 1]],
  approval: [['在办项目', '1,842 个'], ['平均时限', '2.1 天', 1], ['一次通过率', '93.5%'], ['即办件占比', '46.2%']],
  checkup: [['体检网格', '1,286 个'], ['综合得分', '81.4 分', 1], ['问题指标', '7 项'], ['整治完成率', '76.8%']],
  sponge: [['达标片区', '38.6%'], ['径流控制率', '72.4%', 1], ['易涝点', '26 处'], ['雨水利用', '860 万吨']],
  planning: [['叠加图层', '68 类'], ['冲突图斑', '142 个'], ['已协调', '86 个', 1], ['合规审查', '100%']],
  site: [['在监工地', '1,286 个'], ['在场人员', '8.6 万人'], ['视频在线率', '96.8%', 1], ['今日告警', '46 起']],
  renewal: [['改造小区', '326 个'], ['涉及居民', '12.8 万户'], ['已完工', '148 个', 1], ['投资完成', '68.4%']]
};
var DEEP_C = {
  overview: sec('平台核心能力') + bar('模型轻量化', 96, 100) + bar('二三维一体化', 92, 100) + bar('时空数据管理', 88, 100) + bar('服务编排治理', 90, 100),
  lifeline: sec('四色风险区统计') + cb('deep-life-pie', 240) + sec('近 30 日告警趋势') + cb('deep-life-line', 218),
  pipe: sec('各类管线长度（公里）') + cb('deep-pipe-bar', 248) + sec('管廊运行环境合格率') + cb('deep-pipe-gauge', 208),
  safety: sec('事件等级分布') + cb('deep-safe-pie', 228) + sec('平均响应时长趋势（分钟）') + cb('deep-safe-line', 218),
  approval: sec('各区平均审批时限（天）') + cb('deep-appr-bar', 248),
  checkup: sec('近三年体检综合得分') + cb('deep-check-line', 238),
  sponge: sec('径流总量控制率分区达标情况') + cb('deep-sponge-bar', 248),
  planning: sec('冲突类型分布') + cb('deep-plan-pie', 238),
  site: sec('近 7 日告警趋势') + cb('deep-site-line', 238),
  renewal: sec('改造内容投资结构（亿元）') + cb('deep-renew-pie', 238)
};
function deep(id) {
  return sec('核心指标') + '<div class="d-kv">' + (DEEP_KPI[id] || []).map(function (c) { return kc(c[0], c[1], c[2]); }).join('') + '</div>' +
    (DEEP_C[id] || '') + '<div class="d-note">注：以上为演示模拟数据，正式环境以 CIM 基础数据库实时汇聚结果为准。</div>';
}

/* 详情库 */
var HIT = {
  gas: function () {
    return sec('设施概况') + '<div class="d-kv">' + kc('供气能力', '3.2 万 Nm³/h') + kc('服务用户', '8.6 万户', 1) +
      kc('出口压力', '0.28 MPa') + kc('运行状态', '一级告警', 1) + '</div>' +
      sec('实时监测（物联网关在线 36/36）') + '<div class="d-kv">' + kc('进口压力', '1.85 MPa') + kc('温度', '18.6 ℃') +
      kc('泄漏浓度', '428 ppm', 1) + kc('在线率', '99.2%') + '</div>' +
      sec('近 7 日压力趋势') + cb('d-gas-line', 198) +
      sec('关联告警') + '<table class="d-table"><tr><th>时间</th><th>级别</th><th>内容</th><th>状态</th></tr>' +
      '<tr><td>10-16 09:12</td><td><span class="tag lv1">一级</span></td><td>调压柜后压力骤降，疑似泄漏</td><td>处置中</td></tr>' +
      '<tr><td>10-15 21:40</td><td><span class="tag lv2">二级</span></td><td>阀门井积水报警</td><td>已闭环</td></tr>' +
      '<tr><td>10-14 16:05</td><td><span class="tag lv3">三级</span></td><td>巡检到期提醒</td><td>已完成</td></tr></table>' +
      '<div class="d-note">注：演示数据。真实场景对接 SCADA 与物联网感知设备，支持一键关阀、远程处置指令下发。</div>';
  },
  water: function () {
    return sec('泵站概况') + '<div class="d-kv">' + kc('日供水能力', '42 万吨') + kc('服务人口', '86 万人', 1) +
      kc('机组数量', '6 用 2 备') + kc('水质合格率', '99.8%') + '</div>' +
      sec('机组运行负荷') + bar('1# 机组', 82, 100) + bar('2# 机组', 76, 100) + bar('3# 机组', 45, 100) + bar('备用机组', 0, 100) +
      sec('进水/出水压力 24h') + cb('d-water-line', 198);
  },
  drain: function () {
    return sec('排水泵站') + '<div class="d-kv">' + kc('汇水面积', '6.8 km²') + kc('抽排能力', '18 m³/s', 1) +
      kc('当前雨量', '12.4 mm/h') + kc('池水位', '1.8 m') + '</div>' + sec('抽排量与池水位') + cb('d-drain-line', 198);
  },
  bridge: function () {
    return sec('桥梁监测点') + '<div class="d-kv">' + kc('桥梁类型', '预应力混凝土连续梁') + kc('桥龄', '17 年') +
      kc('健康评分', '86 / 100', 1) + kc('监测项', '12 类') + '</div>' +
      sec('监测指标（相对阈值）') + bar('主梁挠度', 42, 100, 1) + bar('支座位移', 18, 100) + bar('裂缝宽度', 6, 100) + bar('振动频率', 55, 100) +
      sec('多维状态评估') + cb('d-bridge-radar', 218);
  },
  heat: function () { return sec('热力交换站') + '<div class="d-kv">' + kc('供热面积', '42 万 m²') + kc('二次网温度', '46 ℃') + kc('热负荷', '78%') + kc('运行状态', '正常') + '</div>'; },
  tunnel: function () {
    return sec('综合管廊监控中心') + '<div class="d-kv">' + kc('入廊管线', '5 类') + kc('廊段长度', '12.6 km', 1) +
      kc('在廊人员', '23 人') + kc('环境正常率', '99.4%') + '</div>' +
      sec('舱室环境') + bar('氧气含量', 98, 100) + bar('温度', 26, 60, 1) + bar('湿度', 62, 100) + bar('积水深度', 2, 60) +
      sec('入廊管线长度占比') + cb('d-tunnel-pie', 208);
  },
  gpipe: function () {
    return sec('燃气高压管线') + '<div class="d-kv">' + kc('管径', 'DN500') + kc('设计压力', '4.0 MPa', 1) +
      kc('管长', '18.4 km') + kc('巡检频次', '每日 2 次') + '</div>' + sec('防腐层检测（ACVG 分级）') + cb('d-gpipe-bar', 198);
  },
  wpipe: function () { return sec('给水主干管') + '<div class="d-kv">' + kc('管径', 'DN1200') + kc('日输水量', '38 万吨') + kc('漏损率', '8.6%') + kc('运行状态', '正常') + '</div>' + sec('24h 流量监测') + cb('d-wpipe-line', 198); },
  epipe: function () { return sec('110kV 电力舱') + '<div class="d-kv">' + kc('电压等级', '110 kV') + kc('回路数', '8 回') + kc('负载率', '72%') + kc('舱内温度', '34 ℃') + '</div>' + sec('负载率与温度趋势') + cb('d-epipe-line', 198); },
  event: function () {
    return sec('事件态势') + '<div class="d-kv">' + kc('事件等级', 'Ⅰ 级', 1) + kc('接报时间', '10-16 10:24') +
      kc('处置状态', '处置中') + kc('响应时长', '4 分 12 秒', 1) + '</div>' +
      sec('处置流程跟踪') + '<table class="d-table"><tr><th>时间</th><th>环节</th><th>责任单位</th><th>状态</th></tr>' +
      '<tr><td>10:24</td><td>物联感知自动告警</td><td>CIM 平台</td><td>已完成</td></tr>' +
      '<tr><td>10:26</td><td>值班人员核实派单</td><td>市住建局值班室</td><td>已完成</td></tr>' +
      '<tr><td>10:31</td><td>燃气公司关阀断源</td><td>市燃气集团</td><td>进行中</td></tr>' +
      '<tr><td>10:38</td><td>消防到场稀释监护</td><td>市消防救援支队</td><td>进行中</td></tr>' +
      '<tr><td>--:--</td><td>隐患复核销号</td><td>属地住建部门</td><td>待处置</td></tr></table>' +
      sec('周边应急资源') + cb('d-event-bar', 198);
  },
  project: function () {
    return sec('项目概况') + '<div class="d-kv">' + kc('总投资', '8.6 亿元') + kc('建筑面积', '22.4 万 m²') +
      kc('当前阶段', '主体施工', 1) + kc('整体进度', '68%', 1) + '</div>' +
      sec('审批环节跟踪') + bar('立项用地规划', 100, 100) + bar('工程建设许可', 100, 100) + bar('施工许可', 100, 100) + bar('竣工验收', 20, 100, 1) +
      sec('投资与形象进度') + cb('d-project-line', 198);
  },
  grid: function () {
    return sec('体检网格概况') + '<div class="d-kv">' + kc('网格面积', '2.4 km²') + kc('常住人口', '3.8 万人') +
      kc('体检得分', '78.6 / 100', 1) + kc('问题指标', '4 项', 1) + '</div>' +
      sec('短板指标') + bar('养老服务设施覆盖率', 62, 100, 1) + bar('老旧小区占比', 41, 100, 1) +
      bar('路网密度', 7.2, 12, 1) + bar('公园绿化服务半径覆盖率', 86, 100) + sec('多维评估') + cb('d-grid-radar', 218);
  },
  sponge: function () {
    return sec('易涝点监测') + '<div class="d-kv">' + kc('当前积水', '18 cm') + kc('警戒水位', '25 cm', 1) +
      kc('实时雨量', '12.4 mm/h') + kc('排水能力', '0.9 m³/s') + '</div>' + sec('降雨-积水响应') + cb('d-sponge-line', 198);
  },
  plan: function () {
    return sec('冲突图斑') + '<div class="d-kv">' + kc('图斑编号', 'C-07') + kc('冲突类型', '城总与土规重叠') +
      kc('涉及面积', '3.6 公顷', 1) + kc('处理状态', '协调中') + '</div>' +
      sec('叠加分析') + '<table class="d-table"><tr><th>规划图层</th><th>用地性质</th><th>是否冲突</th></tr>' +
      '<tr><td>城市总体规划</td><td>二类居住用地</td><td>—</td></tr>' +
      '<tr><td>土地利用规划</td><td>农林用地</td><td><span class="tag lv1">冲突</span></td></tr>' +
      '<tr><td>生态保护红线</td><td>一般管控区</td><td><span class="tag lv2">预警</span></td></tr>' +
      '<tr><td>文物保护紫线</td><td>建设控制地带</td><td>—</td></tr></table>';
  },
  site: function () {
    return sec('工地概况') + '<div class="d-kv">' + kc('在建面积', '8.4 万 m²') + kc('在场人员', '326 人') +
      kc('塔吊数量', '4 台') + kc('当前告警', '扬尘超标', 1) + '</div>' +
      sec('物联监测') + bar('PM10', 186, 300, 1) + bar('PM2.5', 96, 200) + bar('噪声', 62, 100) + bar('场内车速', 12, 30) +
      sec('视频 AI 识别记录') + cb('d-site-bar', 198);
  },
  renewal: function () {
    return sec('改造片区') + '<div class="d-kv">' + kc('涉及小区', '26 个') + kc('涉及居民', '1.2 万户') +
      kc('改造进度', '45%', 1) + kc('投资完成', '1.8 亿元') + '</div>' +
      sec('改造内容完成度') + bar('管网更新', 92, 100) + bar('道路整治', 78, 100) + bar('停车设施', 32, 100, 1) +
      bar('加装电梯', 18, 100, 1) + bar('绿化提升', 64, 100) + sec('累计完工率') + cb('d-renewal-line', 198);
  }
};
function hitDetail(h) { return (HIT[h.type] || function () { return sec('详情') + '<div class="d-note">演示数据。</div>'; })(); }

/* =========================================================
 * 二级详情页（每个模块一个专属详情页）
 * ========================================================= */
var IC = {
  bld: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01',
  pipe: 'M4 16c2-3 5-4 8-4s6 1 8 4M4 8c2-3 5-4 8-4s6 1 8 4M4 12c2-3 5-4 8-4s6 1 8 4',
  alarm: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  file: 'M7 3h7l4 4v14H7zM14 3v4h4M9.5 12h5M9.5 15.5h5',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  drop: 'M12 3c3 4.5 5 7.5 5 10a5 5 0 01-10 0c0-2.5 2-5.5 5-10z',
  map: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15',
  crane: 'M3 21h18M5 21V8l5-3v16M14 21V11l5 3v7M8 12h1M8 15h1',
  home: 'M4 21V10l8-6 8 6v11h-6v-6h-4v6z',
  tower: 'M12 2v20M8 6h8M9 10h6M10 14h4M6 22h12',
  bridge: 'M2 12h20M4 12v6M20 12v6M8 12v4M16 12v4M12 4v8',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  gas: 'M12 2C8 6 5 10 5 14a7 7 0 0014 0c0-4-3-8-7-12z',
  bolt: 'M13 2L3 14h8l-1 8 10-12h-8z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 9a3 3 0 100 6 3 3 0 000-6z',
  check: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11'
};
var SUB = {
  overview: function () {
    return { t: '城市总览 · 全域运行态势', s: 'CITY OVERVIEW · MACRO SITUATION', cls: 'cols2', h: [
      sp('核心运行指标', k4([
        { k: 'CIM 模型构件总量', v: '12,860', u: '万', d: 8.2 }, { k: '物联感知设备', v: '48.6', u: '万台', d: 12.4 },
        { k: '接入部门', v: '42', u: '个', d: 6 }, { k: '对接业务系统', v: '68', u: '个', d: 9 }
      ]), '实时'),
      sp('城市运行六维体检', cb('s-ov-radar', 300), '雷达图', 'span2'),
      sp('CIM 平台能力评估', plist([
        { n: '模型轻量化转换', v: 96 }, { n: '二三维一体化渲染', v: 92 }, { n: '时空数据管理', v: 88 },
        { n: '服务编排与治理', v: 90 }, { n: 'BIM 解析引擎', v: 84 }, { n: '视频融合接入', v: 95 }
      ]), '平台能力'),
      sp('CIM 模型构件构成', cb('s-ov-pie', 300), '构成分析', 'span2'),
      sp('分区域运行指数', plist([
        { n: '四川天府新区', v: 93 }, { n: '成都高新区', v: 91 }, { n: '锦江区', v: 88 },
        { n: '青羊区', v: 85 }, { n: '武侯区', v: 84 }, { n: '成华区', v: 79 },
        { n: '金牛区', v: 77, w: 1 }, { n: '龙泉驿区', v: 74, w: 1 }
      ]), '满分 100'),
      sp('部门数据活跃度（今日）', plist([
        { n: '市住建局', v: 8642, max: 9000 }, { n: '市水务局', v: 6318, max: 9000 },
        { n: '市城管委', v: 5204, max: 9000 }, { n: '市交通局', v: 4876, max: 9000 },
        { n: '市生态环境局', v: 3412, max: 9000 }, { n: '市应急局', v: 2986, max: 9000 }
      ]), '单位：条'),
      sp('三维底图覆盖与数据资源', dt(['资源类别', '数据规模', '更新频率', '状态'], [
        ['三维模型（Lod2）', '1,436 km²', '季度', pill('正常', 'd')],
        ['建筑单体化模型', '12.6 万栋', '月度', pill('正常', 'd')],
        ['地下管网模型', '2.16 万公里', '月度', pill('正常', 'd')],
        ['综合管廊模型', '46.8 公里', '实时', pill('正常', 'd')],
        ['城市设计建筑方案', '3,860 个', '按项目', pill('正常', 'd')],
        ['物联感知点位', '48.6 万台', '实时', pill('在线', 'd')]
      ]), '数据资源清单', 'span2'),
      sp('今日重点区域运行状态', dt(['区域', '运行状态', '实时人流', '关注等级'], [
        ['春熙路商圈', pill('人流密集', 'b'), '18.6 万人', pill('关注', 'b')],
        ['高新南区', pill('运行平稳', 'd'), '46.2 万人', pill('正常', 'd')],
        ['天府新区', pill('建设活跃', 'c'), '32.8 万人', pill('正常', 'c')],
        ['火车北站枢纽', pill('到发正常', 'd'), '12.4 万人次', pill('正常', 'd')],
        ['环球中心', pill('负荷偏高', 'b'), '8.6 万人', pill('关注', 'b')]
      ]), '区域态势'),
      sp('平台运行日志', tl([
        { t: '14:22', c: '<b>市规自局</b> 上传控规图层 v2026.10，叠加分析完成' },
        { t: '13:48', c: '<b>市水务局</b> 同步管网巡检数据 3,842 条' },
        { t: '11:30', c: '<b>市住建局</b> 更新工程项目形象进度 126 项' },
        { t: '10:05', c: '<b>市城管委</b> 接入视频监控 214 路，AI 分析服务正常' },
        { t: '09:12', c: '系统自动完成三维模型轻量化压缩（节省 34% 存储）' }
      ]), '运行审计'),
      sp('注：以上为演示模拟数据，正式环境以 CIM 基础数据库实时汇聚结果为准。', '<span class="fnote">演示环境 · 成都市城市信息模型（CIM）基础平台</span>', '', 'span2')
    ] };
  },
  lifeline: function () {
    return { t: '城市生命线安全 · 监测预警', s: 'URBAN LIFELINE · MONITORING & EARLY WARNING', cls: '', h: [
      sp('生命线工程总体指标', k4([
        { k: '燃气用户', v: '428.6', u: '万户', d: 3.2 }, { k: '管网总长', v: '3,847', u: '公里', d: 1.8 },
        { k: '物联监测设备', v: '9,420', u: '台', d: 5.6 }, { k: '设备在线率', v: '99.2', u: '%', d: .4, hl: 1 }
      ]), '实时'),
      sp('四色风险评估分布', cb('s-life-risk', 300), '四色图', 'span2'),
      sp('告警类型构成', cb('s-life-pie', 300), '构成分析'),
      sp('近 30 日告警趋势', cb('s-life-line', 300), '趋势分析', 'span2'),
      sp('燃气专项 · 设施运行', dt(['设施类型', '数量', '在线监测', '本日告警'], [
        ['门站 / 储配站', '12 座', '12 / 12', pill('0', 'd')],
        ['高中压调压站', '186 座', '184 / 186', pill('2', 'b')],
        ['中低压调压柜', '3,860 台', '3,826 / 3,860', pill('1', 'a')],
        ['燃气管网', '3,847 km', '分段监测', pill('3', 'b')]
      ]), '燃气'),
      sp('供水专项 · 设施运行', dt(['设施类型', '数量', '在线监测', '本日告警'], [
        ['自来水厂', '9 座', '9 / 9', pill('0', 'd')],
        ['供水加压泵站', '86 座', '85 / 86', pill('1', 'b')],
        ['市政给水管网', '3,820 km', '分段监测', pill('2', 'b')],
        ['二次供水设施', '2,460 处', '2,412 / 2,460', pill('3', 'c')]
      ]), '供水'),
      sp('排水与桥梁专项', dt(['设施类型', '数量', '在线监测', '本日告警'], [
        ['排水泵站', '126 座', '124 / 126', pill('1', 'b')],
        ['污水管网', '4,260 km', '液位监测', pill('2', 'c')],
        ['市管桥梁', '68 座', '68 / 68', pill('1', 'b')],
        ['隧道 / 下穿', '42 座', '41 / 42', pill('1', 'c')]
      ]), '排水桥梁'),
      sp('重点监测点位清单', dt(['点位名称', '专业', '监测项', '状态'], [
        ['青羊区调压柜 #017', '燃气', '压力 / 泄漏浓度', pill('一级告警', 'a')],
        ['三环供水加压泵站', '供水', '压力 / 流量', pill('预警', 'b')],
        ['市管桥梁 A12 监测点', '桥梁', '挠度 / 支座位移', pill('预警', 'b')],
        ['锦江排水泵站', '排水', '池水位 / 抽排量', pill('正常', 'd')],
        ['人民南路下穿隧道', '排水', '积水深度', pill('预警', 'b')],
        ['热力交换站 #06', '热力', '温度 / 热负荷', pill('正常', 'd')]
      ]), '实时监测', 'span2'),
      sp('告警处置时效', plist([
        { n: '一级告警响应', v: 4, max: 15 }, { n: '二级预警响应', v: 9, max: 30 },
        { n: '三级告警响应', v: 22, max: 60 }, { n: '平均闭环时长', v: 2.1, max: 5 }
      ]), '单位：分钟'),
      sp('注：以上为演示模拟数据，正式环境以生命线安全工程监测平台实时数据为准。', '<span class="fnote">演示环境 · 城市生命线安全工程监测预警体系</span>', '', 'span2')
    ] };
  },
  pipe: function () {
    return { t: '地下管网与综合管廊 · 运行监管', s: 'UNDERGROUND PIPELINE & UTILITY TUNNEL', cls: '', h: [
      sp('管网管廊总体指标', k4([
        { k: '管线总长', v: '2.16', u: '万公里', d: 4.1 }, { k: '综合管廊', v: '46.8', u: '公里', d: 6.3 },
        { k: '隐患点', v: '318', u: '处', d: -8.4 }, { k: '排查覆盖率', v: '92.4', u: '%', d: 5.2, hl: 1 }
      ]), '实时'),
      sp('各类管线长度构成（公里）', cb('s-pipe-bar', 300), '长度统计', 'span2'),
      sp('入廊管线占比', cb('s-pipe-pie', 300), '管廊'),
      sp('隐患类型分布', cb('s-pipe-risk', 300), '隐患分析', 'span2'),
      sp('综合管廊分区段运行', dt(['舱室', '长度(km)', '入廊管线', '环境合格率'], [
        ['一环综合管廊 · 燃气舱', '4.2', '燃气 DN500', pill('99.6%', 'd')],
        ['一环综合管廊 · 电力舱', '4.2', '110kV × 8 回', pill('99.4%', 'd')],
        ['天府大道管廊 · 综合舱', '8.4', '给水 / 通信 / 热力', pill('99.8%', 'd')],
        ['天府大道管廊 · 雨污舱', '8.4', '雨水 / 污水', pill('98.2%', 'c')],
        ['三环管廊（在建）', '12.6', '—', pill('建设中', 'b')]
      ]), '管廊运行'),
      sp('管网隐患分级清单', dt(['隐患等级', '数量', '主要类型', '整改状态'], [
        [pill('特级', 'a'), '6', '燃气舱探测器报警', pill('处置中', 'a')],
        [pill('重大', 'b'), '28', '给水管疑似渗漏', pill('检测中', 'b')],
        [pill('较大', 'c'), '96', '雨污混接', pill('整改中', 'c')],
        [pill('一般', 'd'), '188', '井盖破损 / 标识缺失', pill('待复核', 'd')]
      ]), '隐患清单'),
      sp('重点管线巡检情况', plist([
        { n: '燃气高压管线 G-22', v: 100 }, { n: '给水主干管 W-08', v: 96 },
        { n: '排水主干管 D-14', v: 88 }, { n: '110kV 电力舱 E-03', v: 92, w: 1 },
        { n: '通信管沟 T-06', v: 78, w: 1 }, { n: '热力管网 H-03', v: 94 }
      ]), '本月巡检覆盖率'),
      sp('管廊环境监测', dt(['监测项', '当前值', '阈值', '状态'], [
        ['氧气含量', '20.8 %', '≥ 19.5%', pill('正常', 'd')],
        ['温度', '26.4 ℃', '≤ 40 ℃', pill('正常', 'd')],
        ['湿度', '62 %', '≤ 85%', pill('正常', 'd')],
        ['积水深度', '1.2 cm', '≤ 5 cm', pill('正常', 'd')],
        ['甲烷浓度', '0 ppm', '≤ 40 ppm', pill('正常', 'd')],
        ['硫化氢', '0 ppm', '≤ 10 ppm', pill('正常', 'd')]
      ]), '环境监测'),
      sp('近 12 个月隐患排查趋势', cb('s-pipe-trend', 300), '趋势分析', 'span2'),
      sp('注：以上为演示模拟数据，正式环境以城市地下管网综合管理平台实时数据为准。', '<span class="fnote">演示环境 · 城市地下管网与综合管廊运行监管平台</span>', '', 'span2')
    ] };
  },
  safety: function () {
    return { t: '城市安全应急 · 指挥调度', s: 'URBAN SAFETY & EMERGENCY COMMAND', cls: '', h: [
      sp('应急管理总体指标', k4([
        { k: '今年事件', v: '1,286', u: '起', d: -4.2 }, { k: '平均响应', v: '4.8', u: '分钟', d: -18 },
        { k: '事件闭环率', v: '97.6', u: '%', d: 1.2 }, { k: '应急队伍', v: '326', u: '支', d: 3.6 }
      ]), '实时'),
      sp('事件等级分布', cb('s-safe-pie', 300), '等级分布', 'span2'),
      sp('事件类型构成', cb('s-safe-type', 300), '类型分析'),
      sp('月度事件与闭环趋势', cb('s-safe-line', 300), '趋势分析', 'span2'),
      sp('正在处置事件', dt(['事件', '等级', '接报时间', '处置状态'], [
        ['青羊区燃气泄漏事件', pill('Ⅰ级', 'a'), '10-16 10:24', pill('处置中', 'a')],
        ['人民南路下穿隧道积水', pill('Ⅱ级', 'b'), '10-16 10:26', pill('排水作业', 'b')],
        ['高新某工地脚手架变形', pill('Ⅱ级', 'b'), '10-16 09:50', pill('停工排查', 'b')],
        ['某小区电梯困人（已获救）', pill('Ⅲ级', 'c'), '10-16 08:12', pill('复核中', 'c')]
      ]), '实时事件', 'span2'),
      sp('应急资源分布', dt(['资源类型', '数量', '分布', '状态'], [
        ['消防救援站', '68 座', '各区覆盖', pill('正常', 'd')],
        ['应急物资库', '86 处', '市级 4 / 区级 82', pill('正常', 'd')],
        ['燃气抢修队伍', '42 支', '在册 1,260 人', pill('正常', 'd')],
        ['防汛排涝队伍', '58 支', '在册 1,840 人', pill('备汛', 'c')],
        ['医疗救护站点', '126 处', '120 网络', pill('正常', 'd')]
      ]), '资源台账'),
      sp('平均响应时长趋势', plist([
        { n: '1月', v: 7.2, max: 10 }, { n: '2月', v: 6.8, max: 10 }, { n: '3月', v: 6.1, max: 10 },
        { n: '4月', v: 5.6, max: 10 }, { n: '5月', v: 5.2, max: 10 }, { n: '6月', v: 4.8, max: 10 }
      ]), '单位：分钟'),
      sp('重点事件处置流程跟踪', flow([
        { t: '事件接报', d: '12345 热线转派 · 平台自动定位', tm: '10:24', st: 'ok' },
        { t: '研判分级', d: '判定为 Ⅰ 级燃气泄漏，启动应急预案', tm: '10:25', st: 'ok' },
        { t: '力量调派', d: '燃气抢修队 2 支 + 消防 1 支 + 医疗 1 支', tm: '10:26', st: 'ok' },
        { t: '现场处置', d: '关阀断源、浓度稀释、周边疏散', tm: '10:28', st: 'run' },
        { t: '恢复评估', d: '待现场浓度达标后组织恢复', tm: '待定' }
      ]), '事件全流程'),
      sp('注：以上为演示模拟数据，正式环境以城市安全运行与应急指挥平台实时数据为准。', '<span class="fnote">演示环境 · 城市安全应急指挥调度系统</span>', '', 'span2')
    ] };
  },
  approval: function () {
    return { t: '工程审批服务 · 效能监管', s: 'CONSTRUCTION APPROVAL · EFFICIENCY', cls: '', h: [
      sp('审批效能总体指标', k4([
        { k: '在办项目', v: '1,842', u: '个', d: 6.8 }, { k: '今日办结', v: '126', u: '件', d: 9.4 },
        { k: '平均时限', v: '2.1', u: '天', d: -22 }, { k: '一次通过率', v: '93.5', u: '%', d: 2.1, hl: 1 }
      ]), '实时'),
      sp('办结量与在办量趋势', cb('s-appr-line', 300), '趋势分析', 'span2'),
      sp('各区平均审批时限（天）', cb('s-appr-bar', 300), '区域对比', 'span2'),
      sp('超期预警项目', dt(['项目名称', '环节', '剩余时限', '预警状态'], [
        ['天府新区某项目施工许可变更', '施工许可变更', '1 天', pill('预警', 'b')],
        ['高新某项目竣工验收备案', '竣工验收', '2 天', pill('预警', 'b')],
        ['龙泉驿某项目绿建核查', '绿色建筑', '5 天', pill('提醒', 'c')]
      ]), '超期预警', 'span2'),
      sp('审批环节平均用时', plist([
        { n: '立项用地规划许可', v: 1.2, max: 5 }, { n: '工程建设许可', v: .8, max: 5 },
        { n: '施工许可', v: .9, max: 5 }, { n: '竣工验收备案', v: 2.4, max: 5 }
      ]), '单位：天'),
      sp('在办项目结构', dt(['项目类别', '数量', '占比', '本日新增'], [
        ['房屋建筑工程', '1,286', '69.8%', '32'],
        ['市政基础设施', '386', '21.0%', '14'],
        ['装饰装修工程', '128', '6.9%', '8'],
        ['其他', '42', '2.3%', '2']
      ]), '项目结构'),
      sp('典型项目审批流程跟踪', flow([
        { t: '立项用地规划许可', d: '已核发 · 天府新区某综合体项目', tm: '08-12', st: 'ok' },
        { t: '工程建设许可', d: '已核发 · 方案审查通过', tm: '09-03', st: 'ok' },
        { t: '施工许可', d: '已核发 · 质安监手续同步办理', tm: '09-28', st: 'ok' },
        { t: '竣工验收备案', d: '在建 · 主体施工完成 68%', tm: '预计 12 月', st: 'run' }
      ]), '项目跟踪'),
      sp('注：以上为演示模拟数据，正式环境以工程建设项目审批管理系统实时数据为准。', '<span class="fnote">演示环境 · 工程建设项目审批服务监管系统</span>', '', 'span2')
    ] };
  },
  checkup: function () {
    return { t: '城市体检评估 · 指标分析', s: 'CITY HEALTH EXAMINATION', cls: '', h: [
      sp('城市体检总体指标', k4([
        { k: '体检网格', v: '1,286', u: '个', d: 0 }, { k: '综合得分', v: '81.4', u: '分', d: 2.6 },
        { k: '问题指标', v: '7', u: '项', d: -2 }, { k: '整治完成率', v: '76.8', u: '%', d: 8.4 }
      ]), '2026 年度'),
      sp('八维指标体系得分', cb('s-check-radar', 300), '雷达图', 'span2'),
      sp('近三年综合得分', cb('s-check-line', 300), '趋势分析', 'span2'),
      sp('各维度得分明细', dt(['维度', '得分', '排名变化', '状态'], [
        ['生态宜居', '86', '↑ 2', pill('良好', 'd')],
        ['健康舒适', '82', '↑ 1', pill('良好', 'd')],
        ['安全韧性', '91', '↑ 3', pill('优秀', 'd')],
        ['交通便捷', '74', '↓ 1', pill('待提升', 'b')],
        ['风貌特色', '68', '—', pill('待提升', 'b')],
        ['整洁有序', '88', '↑ 1', pill('良好', 'd')],
        ['多元包容', '72', '↑ 2', pill('一般', 'c')],
        ['创新活力', '90', '↑ 4', pill('优秀', 'd')]
      ]), '维度明细', 'span2'),
      sp('突出短板指标', plist([
        { n: '老旧小区占比', v: 41, max: 30, w: 1 }, { n: '养老服务设施覆盖率', v: 62, max: 100, w: 1 },
        { n: '路网密度', v: 7.2, max: 12, w: 1 }, { n: '历史文化保护利用', v: 58, max: 100, w: 1 },
        { n: '公园绿化服务半径覆盖率', v: 86, max: 100 }
      ]), '短板识别'),
      sp('问题街区分布', dt(['街区', '得分', '主要问题', '责任单位'], [
        ['抚琴片区', '72.4', '设施老化 / 电梯滞后', '金牛区住建局'],
        ['双桥子片区', '74.8', '内涝风险 / 交通拥堵', '成华区住建局'],
        ['玉林片区', '78.6', '老旧管网占比高', '武侯区住建局'],
        ['猛追湾片区', '80.2', '滨河空间品质不足', '成华区公园局']
      ]), '街区排名'),
      sp('问题整治任务跟踪', flow([
        { t: '问题线索汇集', d: '网格上报 + 部门数据 + 满意度调查', tm: '已完成', st: 'ok' },
        { t: '体检报告编制', d: '形成 1,286 个网格体检档案', tm: '已完成', st: 'ok' },
        { t: '问题清单派单', d: '7 项突出问题纳入年度整治计划', tm: '已完成', st: 'ok' },
        { t: '整治任务实施', d: '整体完成率 76.8%', tm: '进行中', st: 'run' },
        { t: '年度复评', d: '2026 年 12 月组织', tm: '待启动' }
      ]), '整治流程'),
      sp('注：以上为演示模拟数据，正式环境以城市体检评估信息系统实时数据为准。', '<span class="fnote">演示环境 · 城市体检评估信息系统</span>', '', 'span2')
    ] };
  },
  sponge: function () {
    return { t: '海绵城市建设 · 达标监管', s: 'SPONGE CITY · COMPLIANCE', cls: '', h: [
      sp('海绵城市总体指标', k4([
        { k: '达标片区', v: '38.6', u: '%', d: 6.2 }, { k: '年径流总量控制率', v: '72.4', u: '%', d: 3.1 },
        { k: '易涝点', v: '26', u: '处', d: -12 }, { k: '雨水资源化利用', v: '860', u: '万吨/年', d: 9.8 }
      ]), '实时'),
      sp('降雨响应与积水分析', cb('s-sponge-line', 300), '降雨响应', 'span2'),
      sp('分区径流控制率达标情况', cb('s-sponge-bar', 300), '分区达标', 'span2'),
      sp('易涝点监测清单', dt(['易涝点', '当前积水', '警戒水位', '状态'], [
        ['人民南路下穿隧道 S-12', '18 cm', '25 cm', pill('预警', 'b')],
        ['交子大道下穿 S-08', '3 cm', '20 cm', pill('正常', 'd')],
        ['红星路南延线 S-21', '0 cm', '20 cm', pill('正常', 'd')],
        ['二环路北三段 S-05', '6 cm', '20 cm', pill('关注', 'c')]
      ]), '易涝监测'),
      sp('海绵设施建设情况', plist([
        { n: '透水铺装', v: 68 }, { n: '下沉式绿地', v: 74 }, { n: '雨水花园', v: 52 },
        { n: '植草沟', v: 61 }, { n: '调蓄水体', v: 44, w: 1 }, { n: '蓄水池', v: 38, w: 1 }
      ]), '设施覆盖率'),
      sp('径流控制率分区达标分布', dt(['达标区间', '片区数', '占比', '状态'], [
        ['≥ 85%', '42', '19.1%', pill('优秀', 'd')],
        ['75 - 85%', '86', '39.1%', pill('良好', 'd')],
        ['65 - 75%', '68', '30.9%', pill('一般', 'c')],
        ['< 65%', '24', '10.9%', pill('待提升', 'b')]
      ]), '达标分布'),
      sp('今日降雨全过程响应', tl([
        { t: '06:00', c: '降雨开始，强度 <b>0.4 mm/h</b>，管网排放正常' },
        { t: '09:00', c: '降雨增强至 <b>8.6 mm/h</b>，S-12 下穿开始积水' },
        { t: '12:00', c: '峰值 <b>12.4 mm/h</b>，积水 <b>18 cm</b>，泵站抽排 0.9 m³/s' },
        { t: '15:00', c: '降雨减弱至 <b>4.2 mm/h</b>，积水回落至 9 cm' },
        { t: '18:00', c: '降雨停止，积水消退，设施恢复' }
      ]), '过程复盘'),
      sp('注：以上为演示模拟数据，正式环境以海绵城市建设监测评估平台实时数据为准。', '<span class="fnote">演示环境 · 海绵城市建设监测评估系统</span>', '', 'span2')
    ] };
  },
  planning: function () {
    return { t: '规划一张图 · 多规叠加分析', s: 'ONE MAP · MULTI-PLAN OVERLAY', cls: '', h: [
      sp('规划一张图总体指标', k4([
        { k: '叠加图层', v: '68', u: '类', d: 8 }, { k: '冲突图斑', v: '142', u: '个', d: -15 },
        { k: '已协调', v: '86', u: '个', d: 22 }, { k: '合规审查', v: '100', u: '%', d: 0, hl: 1 }
      ]), '实时'),
      sp('多规叠加分析结果', cb('s-plan-pie', 300), '叠加分析', 'span2'),
      sp('冲突类型分布', cb('s-plan-type', 300), '冲突类型', 'span2'),
      sp('近期冲突图斑清单', dt(['图斑编号', '冲突类型', '涉及面积', '处理状态'], [
        ['C-07', '城总与土规重叠', '3.6 公顷', pill('协调中', 'b')],
        ['C-12', '生态红线一般管控区叠加', '12.4 公顷', pill('复核中', 'b')],
        ['C-18', '紫线建设控制地带重叠', '0.8 公顷', pill('已备案', 'd')],
        ['C-23', '蓝线管理范围重叠', '2.1 公顷', pill('待处理', 'c')]
      ]), '冲突清单', 'span2'),
      sp('图层资源清单', dt(['图层类别', '图层数', '数据来源', '更新状态'], [
        ['国土空间总体规划', '12', '市规自局', pill('已更新', 'd')],
        ['控制性详细规划', '24', '市规自局', pill('已更新', 'd')],
        ['土地利用规划', '8', '市规自局', pill('已更新', 'd')],
        ['生态保护红线', '4', '市生态环境局', pill('已更新', 'd')],
        ['市政设施专项', '16', '各行业主管部门', pill('更新中', 'c')],
        ['其他管控边界', '4', '多部门', pill('已更新', 'd')]
      ]), '图层清单'),
      sp('冲突协调进展', plist([
        { n: '城总 / 土规', v: 56 }, { n: '红线 / 黄线', v: 38 },
        { n: '紫线 / 蓝线', v: 30 }, { n: '已协调解决', v: 86 }
      ]), '单位：个'),
      sp('典型图斑叠加分析', dt(['规划图层', '用地性质', '是否冲突'], [
        ['国土空间总体规划', '居住用地 R2', pill('是', 'a')],
        ['土地利用总体规划', '建设用地', pill('否', 'd')],
        ['生态保护红线', '一般管控区', pill('是', 'a')],
        ['城市紫线', '建设控制地带', pill('是', 'a')],
        ['市政设施专项', '燃气管廊走廊', pill('否', 'd')]
      ]), '叠加分析'),
      sp('注：以上为演示模拟数据，正式环境以国土空间规划一张图实施监督系统实时数据为准。', '<span class="fnote">演示环境 · 国土空间规划一张图实施监督信息系统</span>', '', 'span2')
    ] };
  },
  site: function () {
    return { t: '智慧工地监管 · 物联监测', s: 'SMART CONSTRUCTION SITE · IOT', cls: '', h: [
      sp('智慧工地总体指标', k4([
        { k: '在监工地', v: '1,286', u: '个', d: 5.4 }, { k: '在场人员', v: '8.6', u: '万人', d: 2.8 },
        { k: '今日告警', v: '46', u: '起', d: -14 }, { k: '视频在线率', v: '96.8', u: '%', d: 1.6 }
      ]), '实时'),
      sp('告警类型分布', cb('s-site-pie', 300), '类型分布', 'span2'),
      sp('近 7 日告警趋势', cb('s-site-line', 300), '趋势分析', 'span2'),
      sp('告警工地清单', dt(['工地名称', '告警类型', '处置状态', '时间'], [
        ['高新某综合体项目', '扬尘 PM10 超标', pill('已派单', 'b'), '10:15'],
        ['天府新区 CIM 配套项目', '塔吊限位异常', pill('复核中', 'b'), '09:32'],
        ['龙泉驿某住宅项目', '夜间施工噪声', pill('已告诫', 'd'), '昨日'],
        ['青羊某改造项目', '未戴安全帽', pill('已整改', 'd'), '昨日']
      ]), '实时告警', 'span2'),
      sp('物联监测指标', dt(['监测项', '当前值', '阈值', '状态'], [
        ['PM10', '186 μg/m³', '≤ 300', pill('预警', 'b')],
        ['PM2.5', '96 μg/m³', '≤ 200', pill('正常', 'd')],
        ['噪声', '62 dB', '≤ 70', pill('正常', 'd')],
        ['场内车速', '12 km/h', '≤ 30', pill('正常', 'd')]
      ]), '环境监测'),
      sp('视频 AI 识别记录', dt(['识别类型', '次数', '处置情况'], [
        ['未戴安全帽', '12', '已整改 11 / 整改中 1'],
        ['吸烟', '3', '已整改 3'],
        ['区域入侵', '6', '已劝离 6'],
        ['烟火识别', '1', '误报 1'],
        ['高空作业无防护', '4', '已整改 4']
      ]), 'AI 识别'),
      sp('人员实名制管理', plist([
        { n: '项目经理在岗', v: 96 }, { n: '安全员在岗', v: 92 }, { n: '特种作业持证', v: 100 },
        { n: '三级教育完成', v: 88 }, { n: '工资专户发放', v: 94 }
      ]), '合规率'),
      sp('注：以上为演示模拟数据，正式环境以智慧工地监管平台实时数据为准。', '<span class="fnote">演示环境 · 智慧工地监管平台</span>', '', 'span2')
    ] };
  },
  renewal: function () {
    return { t: '城市更新管理 · 项目跟踪', s: 'URBAN RENEWAL · PROJECT TRACKING', cls: '', h: [
      sp('城市更新总体指标', k4([
        { k: '改造小区', v: '326', u: '个', d: 12 }, { k: '涉及居民', v: '12.8', u: '万户', d: 8 },
        { k: '已完工', v: '148', u: '个', d: 18 }, { k: '投资完成', v: '68.4', u: '%', d: 9.2 }
      ]), '实时'),
      sp('重点片区改造进度', cb('s-renew-bar', 300), '片区进度', 'span2'),
      sp('改造内容投资结构（亿元）', cb('s-renew-pie', 300), '投资结构', 'span2'),
      sp('重点片区清单', dt(['片区', '小区数', '涉及居民', '整体进度'], [
        ['玉林片区综合更新', '26 个', '1.2 万户', pill('45%', 'c')],
        ['望平坊历史文化街区', '8 个', '0.4 万户', pill('72%', 'd')],
        ['抚琴街道改造', '18 个', '0.9 万户', pill('38%', 'b')],
        ['双桥子片区', '22 个', '1.1 万户', pill('56%', 'c')],
        ['猛追湾片区', '12 个', '0.6 万户', pill('62%', 'c')]
      ]), '片区清单', 'span2'),
      sp('改造内容完成度', plist([
        { n: '管网更新', v: 92 }, { n: '道路整治', v: 78 }, { n: '停车设施', v: 32, w: 1 },
        { n: '加装电梯', v: 18, w: 1 }, { n: '绿化提升', v: 64 }, { n: '安防设施', v: 70 }
      ]), '分项进度'),
      sp('累计完工率趋势', cb('s-renew-line', 300), '趋势分析', 'span2'),
      sp('居民满意度调查', plist([
        { n: '总体满意度', v: 91 }, { n: '施工组织', v: 84 }, { n: '改造效果', v: 89 },
        { n: '意见响应', v: 86 }
      ]), '单位：%'),
      sp('玉林片区实施流程跟踪', flow([
        { t: '民意征集与方案设计', d: '入户调查 1.2 万户，形成 26 个小区一案', tm: '已完成', st: 'ok' },
        { t: '立项与资金落实', d: '总投资 8.6 亿元，中央补助 + 市级配套', tm: '已完成', st: 'ok' },
        { t: '管网更新工程', d: '完成 92%，剩余 3 个小区收尾', tm: '10 月', st: 'run' },
        { t: '道路与绿化工程', d: '完成 64%，冬季栽植窗口期施工', tm: '11 月', st: '' },
        { t: '加装电梯与停车设施', d: '电梯 18% / 停车 32%，协调推进中', tm: '12 月', st: '' }
      ]), '实施跟踪'),
      sp('注：以上为演示模拟数据，正式环境以城市更新项目管理系统实时数据为准。', '<span class="fnote">演示环境 · 城市更新项目管理系统</span>', '', 'span2')
    ] };
  }
};

/* 二级页渲染 */
var subReturn = null;
function openSub(id) {
  var f = SUB[id] || SUB.overview;
  var d = f();
  subReturn = id;
  $('#sub-title').textContent = d.t;
  $('#sub-sub').textContent = d.s;
  var nav = NAV.filter(function (n) { return n.id === id; })[0];
  $('#sub-crumb').innerHTML = '领导驾驶舱 <em>›</em> ' + (nav ? nav.name : '');
  var body = $('#sub-body');
  body.className = 'sbody' + (d.cls ? ' ' + d.cls : '');
  body.innerHTML = d.h.join('');
  body.querySelectorAll('table.dt tbody tr').forEach(function (tr) {
    tr.onclick = function () {
      var c = tr.cells[0] ? tr.cells[0].textContent.trim() : '';
      if (!c) return;
      var cols = [];
      var tb = tr.closest ? tr.closest('table.dt') : null;
      if (tb) { tb.querySelectorAll('thead th').forEach(function (th) { cols.push(th.textContent.trim()); }); }
      Detail.show({ title: c + ' · 明细', html: sec('基础信息') + '<div class="d-kv">' +
        Array.prototype.map.call(tr.cells, function (td, i) {
          return kc(cols[i] || ('字段 ' + (i + 1)), td.textContent.trim());
        }).join('') + '</div>' + sec('关联分析') + cb('s-detail-line', 200) +
        '<div class="d-note">注：以上为演示模拟数据。</div>' });
    };
  });
  $('#sub').classList.add('on');
  document.body.setAttribute('data-sub', '1');
  if (window.__chartsInit) window.__chartsInit();
}
function closeSub() {
  $('#sub').classList.remove('on');
  document.body.removeAttribute('data-sub');
  if (subReturn) { var r = subReturn; subReturn = null; switchModule(r); }
}
$('#sub-back').onclick = closeSub;


/* 弹层 */
var Detail = {
  show: function (o) { $('#d-title').textContent = o.title; $('#d-body').innerHTML = o.html; $('#detail').classList.add('on'); if (window.__chartsInit) window.__chartsInit(); },
  hide: function () { $('#detail').classList.remove('on'); }
};
$('#d-close').onclick = Detail.hide;
$('#detail .mask').onclick = Detail.hide;

/* ---------- 路由 ---------- */
var active = 'overview';
(function () {
  $('#nav-list').innerHTML = NAV.map(function (n) {
    return '<div class="nav-item' + (n.id === active ? ' active' : '') + '" data-id="' + n.id + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="' + n.icon + '"/></svg>' +
      '<span>' + n.name + '</span>' + (n.hot ? '<span class="hot"></span>' : '<span class="kbd">' + n.key + '</span>') + '</div>';
  }).join('');
  $('#nav-list').querySelectorAll('.nav-item').forEach(function (el) { el.onclick = function () { stopTour(); switchModule(el.dataset.id); }; });
})();

function switchModule(id) {
  active = id; document.body.setAttribute('data-page', id);
  document.querySelectorAll('.nav-item').forEach(function (el) { el.classList.toggle('active', el.dataset.id === id); });
  var p = $('#panel');
  p.innerHTML = M[id]();
  p.classList.remove('view-anim'); void p.offsetWidth; p.classList.add('view-anim');
  p.querySelectorAll('.more').forEach(function (el) {
    el.onclick = function () { openSub(id); };
  });
  p.querySelectorAll('.alist .row').forEach(function (row) {
    row.onclick = function () { Detail.show({ title: '事件详情 · 处置跟踪', html: hitDetail({ type: 'event' }) }); };
  });
  var sc = SCENES[id];
  if (sc) { cam.tz = sc.zoom; cam.tx = .5; cam.ty = .5; }
  renderBadges();
  if (window.__chartsInit) window.__chartsInit();
}

/* 键盘 */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if ($('#sub').classList.contains('on')) { closeSub(); return; }
    Detail.hide(); hideBubble(); return;
  }
  if ($('#sub').classList.contains('on')) return;
  var n = NAV.filter(function (x) { return x.key === e.key; })[0];
  if (n) { stopTour(); switchModule(n.id); }
});

/* ---------- 自动巡演 ---------- */
var tour = null, tourIdx = 0, tourStart = 0;
function startTour() {
  if (tour) return;
  $('#playBtn').classList.add('on');
  $('#playIcon').innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  tourStart = Date.now();
  (function step() {
    var D = 14000;
    switchModule(NAV[tourIdx].id);
    tour = setTimeout(function () {
      tourIdx = (tourIdx + 1) % NAV.length;
      tourStart = Date.now();
      step();
    }, D);
    (function ring() {
      if (!tour) return;
      var p = Math.min(100, (Date.now() - tourStart) / 14000 * 100);
      $('#playBtn').querySelector('.ring').style.setProperty('--p', p + '%');
      requestAnimationFrame(ring);
    })();
  })();
}
function stopTour() {
  if (!tour) return;
  clearTimeout(tour); tour = null; tourIdx = 0;
  $('#playBtn').classList.remove('on');
  $('#playIcon').innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}
$('#playBtn').onclick = function () { tour ? stopTour() : startTour(); };

/* ---------- 滚动预警 ---------- */
(function () {
  var items = ['青羊区 <em>调压柜 #017</em> 压力骤降，一级告警，燃气公司已现场处置',
    '武侯区 <em>第三方施工破坏预警</em>，已自动派单至管网运维单位',
    '人民南路下穿隧道 <em>积水 18cm</em>，排水泵站满负荷运行',
    '高新区 <em>3 处工地</em> PM10 超标，已责令洒水降尘',
    '一环综合管廊燃气舱 <em>探测器报警</em>，廊内 3 名人员已安全撤离',
    '市管桥梁 <em>A12 支座位移</em> 超阈值，已临时限行并安排检测'];
  var h = items.join('<span style="color:#2f5c8c"> ┃ </span>');
  $('#ticker-move').innerHTML = h + '<span style="color:#2f5c8c"> ┃ </span>' + h;
})();

/* ---------- 启动 ---------- */
switchModule('overview');
render();
window.__app = { switch: switchModule, Detail: Detail, active: function () { return active; } };
})();
