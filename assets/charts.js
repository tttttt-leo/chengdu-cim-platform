/* =========================================================
 * 图表配置：颜色取自 CSS 变量，按需初始化 DOM 中已注册容器
 * ========================================================= */
(function () {
'use strict';
var charts = [];
var TXT = '#8fb0d4', INK = '#eaf4ff', ACC = '#00e5ff', ACC2 = '#2f7bff', WARN = '#ffb020', OK = '#26d9a3', DG = '#ff4d6a';
var AX = { axisLine: { lineStyle: { color: 'rgba(90,150,220,.35)' } } };
var SPLIT = { lineStyle: { color: 'rgba(90,150,220,.12)' } };

function base() {
  return {
    textStyle: { color: TXT, fontFamily: 'inherit' },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(6,22,46,.96)', borderColor: 'rgba(0,229,255,.35)',
      textStyle: { color: INK, fontSize: 12 }, axisPointer: { type: 'shadow' } },
    grid: { left: 44, right: 16, top: 24, bottom: 22 },
    legend: { textStyle: { color: TXT, fontSize: 11 }, top: 0, itemWidth: 12, itemHeight: 8 }
  };
}
function cat(x) {
  var o = base();
  o.xAxis = { type: 'category', data: x, axisLine: AX.axisLine, axisTick: { show: false }, axisLabel: { color: TXT, fontSize: 11 } };
  o.yAxis = { type: 'value', axisLabel: { color: TXT, fontSize: 11 }, splitLine: SPLIT };
  return o;
}
function line(name, data, color, area) {
  return { name: name, type: 'line', data: data, smooth: true, symbol: 'circle', symbolSize: 5,
    lineStyle: { color: color, width: 2, shadowColor: color, shadowBlur: 6 }, itemStyle: { color: color },
    areaStyle: area ? { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [{ offset: 0, color: color + '55' }, { offset: 1, color: color + '00' }] } } : null };
}
function bars(name, data, color) {
  return { name: name, type: 'bar', data: data, barMaxWidth: 14,
    itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [{ offset: 0, color: color }, { offset: 1, color: color + '30' }] }, borderRadius: [3, 3, 0, 0] } };
}
function pieT() { return { trigger: 'item', backgroundColor: 'rgba(6,22,46,.96)', borderColor: 'rgba(0,229,255,.35)', textStyle: { color: INK, fontSize: 12 } }; }
function pie(data, rose) {
  return { type: 'pie', radius: rose ? ['30%', '68%'] : ['38%', '66%'], center: ['50%', '42%'], roseType: rose ? 'radius' : false,
    itemStyle: { borderColor: '#061226', borderWidth: 2 }, label: { color: TXT, fontSize: 11 }, data: data };
}
function radar(ind, s1, s2, l2) {
  var o = base(); o.tooltip = {}; o.legend = null;
  o.radar = { indicator: ind, radius: '64%', center: ['50%', '54%'], axisName: { color: TXT, fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(90,150,220,.2)' } }, splitArea: { show: false },
    axisLine: { lineStyle: { color: 'rgba(90,150,220,.25)' } } };
  var arr = [{ value: s1, name: '本月', areaStyle: { color: 'rgba(0,229,255,.24)' }, lineStyle: { color: ACC, width: 2 }, itemStyle: { color: ACC } }];
  if (s2) arr.push({ value: s2, name: l2, areaStyle: { color: 'rgba(47,123,255,.14)' },
    lineStyle: { color: ACC2, width: 1.5, type: 'dashed' }, itemStyle: { color: ACC2 } });
  o.series = [{ type: 'radar', data: arr }];
  return o;
}
function rnd(a, b) { return a + Math.random() * (b - a); }

var REG = {
  /* ===== 总览 ===== */
  'm-ov-radar': function () {
    return radar([{ name: '市政设施', max: 100 }, { name: '交通出行', max: 100 }, { name: '生态环境', max: 100 },
      { name: '安全韧性', max: 100 }, { name: '公共服务', max: 100 }, { name: '智慧治理', max: 100 }],
      [88, 76, 82, 91, 74, 95], [84, 72, 78, 87, 70, 90], '上月');
  },
  'm-ov-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '市政路桥', value: 2860, itemStyle: { color: ACC } }, { name: '供水排水', value: 2240, itemStyle: { color: ACC2 } },
      { name: '燃气热力', value: 1860, itemStyle: { color: WARN } }, { name: '建筑单体', value: 4580, itemStyle: { color: OK } },
      { name: '其他', value: 920, itemStyle: { color: '#b07dff' } }])];
    return o;
  },

  /* ===== 生命线 ===== */
  'm-life-risk': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '红色区（高风险）', value: 3, itemStyle: { color: DG } }, { name: '橙色区（较高）', value: 3, itemStyle: { color: WARN } },
      { name: '黄色区（中风险）', value: 3, itemStyle: { color: '#ffe066' } }, { name: '蓝色区（低风险）', value: 1, itemStyle: { color: ACC2 } }], 1)];
    return o;
  },
  'm-life-trend': function () {
    var o = cat(['06时', '08时', '10时', '12时', '14时', '16时', '18时']);
    o.series = [line('燃气告警', [4, 6, 8, 5, 7, 6, 9], DG, 1), line('供水告警', [2, 3, 5, 4, 3, 5, 4], ACC, 1),
      bars('桥梁/排水', [1, 2, 3, 2, 4, 3, 5], WARN)];
    return o;
  },
  'd-gas-line': function () {
    var o = cat(['10-10', '10-11', '10-12', '10-13', '10-14', '10-15', '10-16']);
    o.series = [line('出口压力(MPa)', [.31, .30, .32, .29, .30, .28, .19], ACC, 1), line('泄漏浓度(ppm)', [12, 18, 26, 22, 35, 58, 428], DG, 1)];
    return o;
  },
  'd-water-line': function () {
    var o = cat(['00时', '04时', '08时', '12时', '16时', '20时']);
    o.series = [line('进水压力(MPa)', [.42, .44, .46, .43, .45, .44], ACC, 1), line('出水压力(MPa)', [.36, .38, .40, .37, .39, .38], ACC2, 1)];
    return o;
  },
  'd-drain-line': function () {
    var o = cat(['08时', '10时', '12时', '14时', '16时', '18时']);
    o.series = [bars('抽排量(m³/s)', [6, 12, 18, 15, 11, 8], ACC2), line('池水位(m)', [.6, 1.2, 1.8, 1.5, 1.1, .7], WARN)];
    return o;
  },
  'd-bridge-radar': function () {
    return radar([{ name: '挠度', max: 100 }, { name: '位移', max: 100 }, { name: '裂缝', max: 100 },
      { name: '振动', max: 100 }, { name: '索力', max: 100 }, { name: '锈蚀', max: 100 }], [42, 18, 6, 55, 12, 24]);
  },

  /* ===== 管网管廊 ===== */
  'm-pipe-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '给水', value: 3820, itemStyle: { color: ACC2 } }, { name: '排水', value: 4260, itemStyle: { color: OK } },
      { name: '燃气', value: 2160, itemStyle: { color: WARN } }, { name: '电力通信', value: 5480, itemStyle: { color: '#b07dff' } },
      { name: '热力', value: 680, itemStyle: { color: DG } }])];
    return o;
  },
  'm-pipe-bar': function () {
    var o = cat(['燃气', '给水', '排水', '热力', '电力', '通信']);
    o.series = [bars('隐患点数', [86, 62, 48, 22, 74, 26], DG)];
    return o;
  },
  'd-tunnel-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '电力舱', value: 5.2, itemStyle: { color: '#b07dff' } }, { name: '燃气舱', value: 2.8, itemStyle: { color: WARN } },
      { name: '综合舱', value: 3.4, itemStyle: { color: ACC } }, { name: '雨污水舱', value: 1.2, itemStyle: { color: OK } }])];
    return o;
  },
  'd-gpipe-bar': function () {
    var o = cat(['K0+000', 'K5+000', 'K10+000', 'K15+000', 'K18+400']);
    o.series = [bars('防腐层等级', [1, 2, 1, 3, 2], WARN)];
    return o;
  },
  'd-wpipe-line': function () {
    var o = cat(['00时', '04时', '08时', '12时', '16时', '20时']);
    o.series = [line('流量(万吨/h)', [1.2, 1.1, 2.1, 1.9, 2.3, 1.6], ACC, 1)];
    return o;
  },
  'd-epipe-line': function () {
    var o = cat(['00时', '04时', '08时', '12时', '16时', '20时']);
    o.series = [line('负载率(%)', [58, 56, 72, 70, 74, 66], '#b07dff', 1), line('温度(℃)', [30, 29, 34, 36, 41, 35], DG, 1)];
    return o;
  },

  /* ===== 应急 ===== */
  'm-safe-line': function () {
    var o = cat(['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月']);
    o.series = [line('事件数', [128, 106, 132, 118, 126, 142, 156, 138], ACC, 1), bars('闭环数', [122, 102, 128, 116, 124, 140, 152, 135], ACC2)];
    return o;
  },
  'm-safe-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '市政设施', value: 386, itemStyle: { color: ACC } }, { name: '房屋安全', value: 226, itemStyle: { color: WARN } },
      { name: '施工安全', value: 306, itemStyle: { color: DG } }, { name: '城市内涝', value: 186, itemStyle: { color: ACC2 } },
      { name: '其他', value: 182, itemStyle: { color: OK } }])];
    return o;
  },
  'd-event-bar': function () {
    var o = cat(['消防救援', '医疗救护', '燃气抢修', '防汛排涝', '工程抢险']);
    o.series = [bars('队伍(支)', [18, 12, 9, 14, 7], ACC2), bars('物资库(处)', [4, 3, 5, 6, 2], OK)];
    return o;
  },

  /* ===== 审批 ===== */
  'm-appr-line': function () {
    var o = cat(['5月', '6月', '7月', '8月', '9月', '10月']);
    o.series = [line('办结量', [3120, 3480, 3620, 3860, 4120, 4380], ACC, 1), line('在办量', [1420, 1520, 1620, 1710, 1780, 1842], ACC2)];
    return o;
  },
  'm-appr-bar': function () {
    var o = cat(['立项', '用地规划', '工程许可', '施工许可', '竣工验收']);
    o.series = [bars('平均用时(天)', [1.2, .8, 1.6, .9, 2.4], ACC)];
    return o;
  },
  'd-project-line': function () {
    var o = cat(['Q1', 'Q2', 'Q3', 'Q4(当前)']);
    o.series = [line('累计形象进度(%)', [18, 42, 58, 68], OK, 1), bars('投资完成(亿元)', [1.6, 3.4, 5.2, 5.8], ACC2)];
    return o;
  },

  /* ===== 体检 ===== */
  'm-check-radar': function () {
    return radar([{ name: '生态宜居', max: 100 }, { name: '健康舒适', max: 100 }, { name: '安全韧性', max: 100 },
      { name: '交通便捷', max: 100 }, { name: '风貌特色', max: 100 }, { name: '整洁有序', max: 100 },
      { name: '多元包容', max: 100 }, { name: '创新活力', max: 100 }], [86, 82, 91, 74, 68, 88, 72, 90], [82, 80, 88, 72, 66, 84, 70, 86], '2025');
  },
  'd-grid-radar': function () {
    return radar([{ name: '设施覆盖', max: 100 }, { name: '环境质量', max: 100 }, { name: '交通出行', max: 100 },
      { name: '安全管理', max: 100 }, { name: '服务配套', max: 100 }, { name: '风貌形象', max: 100 }], [62, 88, 72, 90, 58, 76]);
  },

  /* ===== 海绵 ===== */
  'm-sponge-line': function () {
    var o = cat(['00时', '03时', '06时', '09时', '12时', '15时', '18时']);
    o.series = [bars('降雨量(mm)', [0, .4, 8.6, 12.4, 4.2, 1.1, .3], ACC2), line('积水深度(cm)', [0, 2, 12, 18, 9, 3, 0], DG, 1)];
    return o;
  },
  'm-sponge-bar': function () {
    var o = cat(['高新南区', '天府新区', '锦江区', '青羊区', '成华区']);
    o.series = [bars('径流控制率(%)', [82, 78, 68, 65, 70], OK)];
    return o;
  },
  'd-sponge-line': function () {
    var o = cat(['06时', '08时', '10时', '12时', '14时', '16时']);
    o.series = [line('积水(cm)', [0, 4, 12, 18, 14, 8], WARN, 1), bars('抽排(m³/s)', [.2, .5, .9, .9, .7, .4], ACC2)];
    return o;
  },

  /* ===== 规划 ===== */
  'm-plan-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '城总/土规冲突', value: 56, itemStyle: { color: WARN } }, { name: '红线叠加', value: 38, itemStyle: { color: DG } },
      { name: '紫线叠加', value: 22, itemStyle: { color: ACC2 } }, { name: '已合规', value: 86, itemStyle: { color: OK } }])];
    return o;
  },

  /* ===== 工地 ===== */
  'm-site-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '扬尘', value: 18, itemStyle: { color: WARN } }, { name: '噪声', value: 12, itemStyle: { color: ACC2 } },
      { name: '塔吊/升降机', value: 8, itemStyle: { color: DG } }, { name: '未戴安全帽', value: 5, itemStyle: { color: '#b07dff' } },
      { name: '其他', value: 3, itemStyle: { color: OK } }])];
    return o;
  },
  'm-site-bar': function () {
    var o = cat(['周一', '周二', '周三', '周四', '周五', '周六', '周日']);
    o.series = [bars('告警数', [8, 6, 9, 7, 5, 6, 5], WARN)];
    return o;
  },
  'd-site-bar': function () {
    var o = cat(['未戴安全帽', '吸烟', '区域入侵', '烟火识别', '高空作业']);
    o.series = [bars('AI 识别(次)', [12, 3, 6, 1, 4], ACC)];
    return o;
  },

  /* ===== 更新 ===== */
  'm-renew-bar': function () {
    var o = cat(['玉林', '望平坊', '抚琴', '双桥子', '猛追湾']);
    o.series = [bars('改造进度(%)', [45, 72, 38, 56, 62], ACC2), bars('已完工小区', [6, 9, 4, 8, 7], OK)];
    return o;
  },
  'd-renewal-line': function () {
    var o = cat(['1月', '3月', '5月', '7月', '9月', '当前']);
    o.series = [line('累计完工率(%)', [6, 14, 24, 33, 41, 45], OK, 1)];
    return o;
  },

  /* ===== 深度分析 ===== */
  'deep-life-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '燃气', value: 42, itemStyle: { color: WARN } }, { name: '供水', value: 28, itemStyle: { color: ACC2 } },
      { name: '排水', value: 22, itemStyle: { color: OK } }, { name: '桥梁', value: 12, itemStyle: { color: ACC } },
      { name: '热力', value: 6, itemStyle: { color: DG } }], 1)];
    return o;
  },
  'deep-life-line': function () {
    var d = []; for (var i = 29; i >= 0; i--) { var x = new Date(Date.now() - i * 864e5); d.push((x.getMonth() + 1) + '/' + x.getDate()); }
    var o = cat(d); o.grid.left = 38;
    var a = [], b = []; for (var j = 0; j < 30; j++) { a.push(Math.round(rnd(8, 26))); b.push(Math.round(rnd(20, 60))); }
    o.series = [line('告警', a, DG, 1), line('预警', b, WARN)];
    return o;
  },
  'deep-pipe-bar': function () {
    var o = cat(['给水', '排水', '燃气', '电力', '通信', '热力', '工业']);
    o.series = [bars('长度(公里)', [3820, 4260, 2160, 3260, 2220, 680, 420], ACC)];
    return o;
  },
  'deep-pipe-gauge': function () {
    var o = base(); o.tooltip = {}; o.legend = null;
    o.series = [{ type: 'gauge', radius: '94%', center: ['50%', '60%'], startAngle: 210, endAngle: -30, min: 0, max: 100,
      progress: { show: true, width: 12, roundCap: true,
        itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: ACC2 }, { offset: 1, color: ACC }] } } },
      axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(20,50,100,.6)']] } },
      pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, anchor: { show: false },
      detail: { valueAnimation: true, offsetCenter: [0, '-8%'], fontSize: 30, color: '#fff', formatter: '{value}%' },
      title: { offsetCenter: [0, '28%'], fontSize: 12, color: TXT },
      data: [{ value: 99.4, name: '环境监测合格率' }] }];
    return o;
  },
  'deep-safe-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: 'Ⅰ级', value: 12, itemStyle: { color: DG } }, { name: 'Ⅱ级', value: 46, itemStyle: { color: WARN } },
      { name: 'Ⅲ级', value: 182, itemStyle: { color: ACC2 } }, { name: 'Ⅳ级', value: 286, itemStyle: { color: OK } }])];
    return o;
  },
  'deep-safe-line': function () {
    var o = cat(['1月', '2月', '3月', '4月', '5月', '6月']);
    o.series = [line('平均响应(分钟)', [7.2, 6.8, 6.1, 5.6, 5.2, 4.8], OK, 1)];
    return o;
  },
  'deep-appr-bar': function () {
    var o = cat(['武侯区', '高新区', '锦江区', '青羊区', '成华区', '天府新区']);
    o.series = [bars('平均时限(天)', [2.4, 1.8, 2.1, 2.6, 2.2, 1.6], ACC)];
    return o;
  },
  'deep-check-line': function () {
    var o = cat(['2022', '2023', '2024', '2025', '2026']);
    o.series = [line('综合得分', [74.2, 76.8, 78.5, 79.8, 81.4], ACC, 1)];
    return o;
  },
  'deep-sponge-bar': function () {
    var o = cat(['≥85%', '75-85%', '65-75%', '<65%']);
    o.series = [bars('片区数', [42, 86, 68, 24], ACC2)];
    return o;
  },
  'deep-plan-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '城总/土规', value: 56, itemStyle: { color: WARN } }, { name: '红线/黄线', value: 38, itemStyle: { color: DG } },
      { name: '紫线/蓝线', value: 30, itemStyle: { color: ACC2 } }, { name: '已协调', value: 86, itemStyle: { color: OK } }])];
    return o;
  },
  'deep-site-line': function () {
    var o = cat(['周一', '周二', '周三', '周四', '周五', '周六', '周日']);
    o.series = [line('告警数', [8, 6, 9, 7, 5, 6, 5], WARN, 1)];
    return o;
  },
  'deep-renew-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '管网更新', value: 8.6, itemStyle: { color: ACC2 } }, { name: '道路整治', value: 5.2, itemStyle: { color: ACC } },
      { name: '停车设施', value: 3.4, itemStyle: { color: WARN } }, { name: '加装电梯', value: 4.1, itemStyle: { color: '#b07dff' } },
      { name: '绿化提升', value: 2.3, itemStyle: { color: OK } }])];
    return o;
  },

  /* ===== 二级详情页 ===== */
  's-ov-radar': function () {
    return radar([{ name: '市政设施', max: 100 }, { name: '交通出行', max: 100 }, { name: '生态环境', max: 100 },
      { name: '安全韧性', max: 100 }, { name: '公共服务', max: 100 }, { name: '智慧治理', max: 100 }],
      [88, 76, 82, 91, 74, 95], [84, 72, 78, 87, 70, 90], '上月');
  },
  's-ov-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '市政路桥', value: 2860, itemStyle: { color: ACC } }, { name: '供水排水', value: 2240, itemStyle: { color: ACC2 } },
      { name: '燃气热力', value: 1860, itemStyle: { color: WARN } }, { name: '建筑单体', value: 4580, itemStyle: { color: OK } },
      { name: '其他', value: 920, itemStyle: { color: '#b07dff' } }])];
    return o;
  },
  's-life-risk': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '红色区（高风险）', value: 3, itemStyle: { color: DG } }, { name: '橙色区（较高）', value: 3, itemStyle: { color: WARN } },
      { name: '黄色区（中风险）', value: 3, itemStyle: { color: '#ffe066' } }, { name: '蓝色区（低风险）', value: 1, itemStyle: { color: ACC2 } }], 1)];
    return o;
  },
  's-life-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '燃气', value: 42, itemStyle: { color: WARN } }, { name: '供水', value: 28, itemStyle: { color: ACC2 } },
      { name: '排水', value: 22, itemStyle: { color: OK } }, { name: '桥梁', value: 12, itemStyle: { color: ACC } },
      { name: '热力', value: 6, itemStyle: { color: DG } }], 1)];
    return o;
  },
  's-life-line': function () {
    var d = []; for (var i = 29; i >= 0; i--) { var x = new Date(Date.now() - i * 864e5); d.push((x.getMonth() + 1) + '/' + x.getDate()); }
    var o = cat(d); o.grid.left = 38;
    var a = [], b = []; for (var j = 0; j < 30; j++) { a.push(Math.round(rnd(8, 26))); b.push(Math.round(rnd(20, 60))); }
    o.series = [line('告警', a, DG, 1), line('预警', b, WARN)];
    return o;
  },
  's-pipe-bar': function () {
    var o = cat(['给水', '排水', '燃气', '电力', '通信', '热力', '工业']);
    o.series = [bars('长度(公里)', [3820, 4260, 2160, 3260, 2220, 680, 420], ACC)];
    return o;
  },
  's-pipe-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '电力舱', value: 5.2, itemStyle: { color: '#b07dff' } }, { name: '燃气舱', value: 2.8, itemStyle: { color: WARN } },
      { name: '综合舱', value: 3.4, itemStyle: { color: ACC } }, { name: '雨污水舱', value: 1.2, itemStyle: { color: OK } }])];
    return o;
  },
  's-pipe-risk': function () {
    var o = cat(['燃气', '给水', '排水', '热力', '电力', '通信']);
    o.series = [bars('隐患点数', [86, 62, 48, 22, 74, 26], DG)];
    return o;
  },
  's-pipe-trend': function () {
    var o = cat(['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']);
    o.series = [line('排查隐患(处)', [286, 268, 312, 298, 324, 342, 318, 306, 336, 318, 296, 310], WARN, 1),
      bars('完成整改(处)', [264, 252, 296, 288, 312, 330, 308, 296, 326, 310, 288, 302], OK)];
    return o;
  },
  's-safe-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: 'Ⅰ级', value: 12, itemStyle: { color: DG } }, { name: 'Ⅱ级', value: 46, itemStyle: { color: WARN } },
      { name: 'Ⅲ级', value: 182, itemStyle: { color: ACC2 } }, { name: 'Ⅳ级', value: 286, itemStyle: { color: OK } }])];
    return o;
  },
  's-safe-type': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '市政设施', value: 386, itemStyle: { color: ACC } }, { name: '房屋安全', value: 226, itemStyle: { color: WARN } },
      { name: '施工安全', value: 306, itemStyle: { color: DG } }, { name: '城市内涝', value: 186, itemStyle: { color: ACC2 } },
      { name: '其他', value: 182, itemStyle: { color: OK } }])];
    return o;
  },
  's-safe-line': function () {
    var o = cat(['1月', '2月', '3月', '4月', '5月', '6月']);
    o.series = [line('平均响应(分钟)', [7.2, 6.8, 6.1, 5.6, 5.2, 4.8], OK, 1)];
    return o;
  },
  's-appr-line': function () {
    var o = cat(['5月', '6月', '7月', '8月', '9月', '10月']);
    o.series = [line('办结量', [3120, 3480, 3620, 3860, 4120, 4380], ACC, 1), line('在办量', [1420, 1520, 1620, 1710, 1780, 1842], ACC2)];
    return o;
  },
  's-appr-bar': function () {
    var o = cat(['武侯区', '高新区', '锦江区', '青羊区', '成华区', '天府新区']);
    o.series = [bars('平均时限(天)', [2.4, 1.8, 2.1, 2.6, 2.2, 1.6], ACC)];
    return o;
  },
  's-check-radar': function () {
    return radar([{ name: '生态宜居', max: 100 }, { name: '健康舒适', max: 100 }, { name: '安全韧性', max: 100 },
      { name: '交通便捷', max: 100 }, { name: '风貌特色', max: 100 }, { name: '整洁有序', max: 100 },
      { name: '多元包容', max: 100 }, { name: '创新活力', max: 100 }], [86, 82, 91, 74, 68, 88, 72, 90], [82, 80, 88, 72, 66, 84, 70, 86], '2025');
  },
  's-check-line': function () {
    var o = cat(['2022', '2023', '2024', '2025', '2026']);
    o.series = [line('综合得分', [74.2, 76.8, 78.5, 79.8, 81.4], ACC, 1)];
    return o;
  },
  's-sponge-line': function () {
    var o = cat(['00时', '03时', '06时', '09时', '12时', '15时', '18时']);
    o.series = [bars('降雨量(mm)', [0, .4, 8.6, 12.4, 4.2, 1.1, .3], ACC2), line('积水深度(cm)', [0, 2, 12, 18, 9, 3, 0], DG, 1)];
    return o;
  },
  's-sponge-bar': function () {
    var o = cat(['高新南区', '天府新区', '锦江区', '青羊区', '成华区']);
    o.series = [bars('径流控制率(%)', [82, 78, 68, 65, 70], OK)];
    return o;
  },
  's-plan-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '城总/土规冲突', value: 56, itemStyle: { color: WARN } }, { name: '红线叠加', value: 38, itemStyle: { color: DG } },
      { name: '紫线叠加', value: 22, itemStyle: { color: ACC2 } }, { name: '已合规', value: 86, itemStyle: { color: OK } }])];
    return o;
  },
  's-plan-type': function () {
    var o = cat(['城总/土规', '红线/黄线', '紫线/蓝线', '市政专项', '已协调']);
    o.series = [bars('图斑数', [56, 38, 30, 18, 86], ACC2)];
    return o;
  },
  's-site-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '扬尘', value: 18, itemStyle: { color: WARN } }, { name: '噪声', value: 12, itemStyle: { color: ACC2 } },
      { name: '塔吊/升降机', value: 8, itemStyle: { color: DG } }, { name: '未戴安全帽', value: 5, itemStyle: { color: '#b07dff' } },
      { name: '其他', value: 3, itemStyle: { color: OK } }])];
    return o;
  },
  's-site-line': function () {
    var o = cat(['周一', '周二', '周三', '周四', '周五', '周六', '周日']);
    o.series = [line('告警数', [8, 6, 9, 7, 5, 6, 5], WARN, 1)];
    return o;
  },
  's-renew-bar': function () {
    var o = cat(['玉林', '望平坊', '抚琴', '双桥子', '猛追湾']);
    o.series = [bars('改造进度(%)', [45, 72, 38, 56, 62], ACC2), bars('已完工小区', [6, 9, 4, 8, 7], OK)];
    return o;
  },
  's-renew-pie': function () {
    var o = base(); o.tooltip = pieT(); o.legend = { textStyle: { color: TXT, fontSize: 11 }, bottom: 0, itemWidth: 12, itemHeight: 8 };
    o.series = [pie([
      { name: '管网更新', value: 8.6, itemStyle: { color: ACC2 } }, { name: '道路整治', value: 5.2, itemStyle: { color: ACC } },
      { name: '停车设施', value: 3.4, itemStyle: { color: WARN } }, { name: '加装电梯', value: 4.1, itemStyle: { color: '#b07dff' } },
      { name: '绿化提升', value: 2.3, itemStyle: { color: OK } }])];
    return o;
  },
  's-renew-line': function () {
    var o = cat(['1月', '3月', '5月', '7月', '9月', '当前']);
    o.series = [line('累计完工率(%)', [6, 14, 24, 33, 41, 45], OK, 1)];
    return o;
  },
  's-detail-line': function () {
    var o = cat(['周一', '周二', '周三', '周四', '周五', '周六', '周日']);
    o.series = [line('监测值', [62, 68, 74, 71, 82, 88, 79], ACC, 1), line('基准值', [70, 70, 70, 70, 70, 70, 70], WARN)];
    return o;
  }
};

function initAll() {
  document.querySelectorAll('.chart-box[id]').forEach(function (el) {
    var id = el.id;
    for (var i = charts.length - 1; i >= 0; i--) {
      if (charts[i]._id === id && charts[i].getDom() !== el) { charts[i].dispose(); charts.splice(i, 1); }
    }
    if (charts.some(function (c) { return c._id === id; })) {
      charts.filter(function (c) { return c._id === id; })[0].resize();
      return;
    }
    var f = REG[id];
    if (!f) return;
    try {
      var ch = echarts.init(el, null, { renderer: 'canvas' });
      ch.setOption(f());
      ch._id = id;
      charts.push(ch);
    } catch (e) { /* 忽略单图失败 */ }
  });
}
window.addEventListener('resize', function () { charts.forEach(function (c) { c.resize(); }); });
window.__chartsInit = initAll;
requestAnimationFrame(function () { requestAnimationFrame(initAll); });
})();
