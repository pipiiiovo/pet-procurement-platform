/* 宠采通 原型 · 通用 UI 组件 */
(function () {
  const UI = {};

  UI.money = n => (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  UI.esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const ORDER_TAG = { '待付款': 'gray', '待接单': 'orange', '备货中': 'orange', '待发货': 'orange', '已发货': 'blue', '已完成': 'green', '已签收': 'green', '已关闭': 'gray', '退款中': 'red', '已退款': 'gray' };
  const PROD_TAG = { 'draft': ['gray', '草稿'], 'pending': ['orange', '待审核'], 'onSale': ['green', '在售'], 'off': ['gray', '已下架'], 'rejected': ['red', '已驳回'] };
  const AS_TAG = { '待供应商处理': 'orange', '待买家退货': 'blue', '待卖家收货': 'blue', '待平台退款': 'orange', '退款成功': 'green', '已拒绝': 'red', '平台介入中': 'red', '仲裁完成': 'green', '已撤销': 'gray' };

  UI.tag = function (v, map) {
    const cls = (map || ORDER_TAG)[v] || 'gray';
    return '<span class="tag ' + cls + '">' + UI.esc(v) + '</span>';
  };
  UI.prodTag = function (st) {
    const t = PROD_TAG[st] || ['gray', st];
    return '<span class="tag ' + t[0] + '">' + t[1] + '</span>';
  };
  UI.asTag = v => UI.tag(v, AS_TAG);

  UI.toast = function (msg, type) {
    let w = document.querySelector('.toast-wrap');
    if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
    const d = document.createElement('div');
    d.className = 'toast ' + (type || '');
    d.textContent = msg;
    w.appendChild(d);
    setTimeout(() => { d.style.opacity = '0'; d.style.transition = '.3s'; }, 1800);
    setTimeout(() => d.remove(), 2200);
  };

  UI.modal = function (opt) {
    const m = document.createElement('div');
    m.className = 'mask';
    m.innerHTML =
      '<div class="modal' + (opt.wide ? ' wide' : '') + '">' +
      '<div class="mh"><h3>' + UI.esc(opt.title || '') + '</h3><span class="x" data-act="closeModal">✕</span></div>' +
      '<div class="mb">' + (opt.body || '') + '</div>' +
      (opt.footer === null ? '' : '<div class="mf">' + (opt.footer || '<button class="btn" data-act="closeModal">关闭</button>') + '</div>') +
      '</div>';
    m.addEventListener('click', e => { if (e.target === m) m.remove(); });
    document.body.appendChild(m);
    if (opt.onOpen) opt.onOpen(m);
    return m;
  };
  UI.closeModal = function () {
    const ms = document.querySelectorAll('.mask');
    ms.forEach(m => m.remove());
  };

  /* 侧边抽屉（购物车等） */
  UI.drawer = function (opt) {
    UI.closeDrawer();
    const d = document.createElement('div');
    d.className = 'drawer-mask';
    d.innerHTML =
      '<div class="drawer' + (opt.wide ? ' wide' : '') + '">' +
      '<div class="dh"><h3>' + UI.esc(opt.title || '') + '</h3><span class="x" data-act="closeDrawer">✕</span></div>' +
      '<div class="db">' + (opt.body || '') + '</div>' +
      (opt.footer === null ? '' : '<div class="df">' + (opt.footer || '') + '</div>') +
      '</div>';
    d.addEventListener('click', e => { if (e.target === d) UI.closeDrawer(); });
    document.body.appendChild(d);
    if (opt.onOpen) opt.onOpen(d);
    return d;
  };
  UI.closeDrawer = function () {
    document.querySelectorAll('.drawer-mask').forEach(d => d.remove());
  };
  UI.setDrawerBody = function (html) {
    const b = document.querySelector('.drawer .db');
    if (b) b.innerHTML = html;
  };

  UI.confirm = function (title, body, okText, onOk) {
    UI.modal({
      title, body: '<div style="font-size:13.5px;color:#374151">' + body + '</div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="modalOk">' + (okText || '确定') + '</button>'
    });
    window.__modalOk = onOk;
  };

  UI.timeline = function (tracks) {
    if (!tracks || !tracks.length) return '<div class="muted">暂无物流轨迹</div>';
    return '<div class="tl">' + tracks.map((t, i) =>
      '<div class="it ' + (i === tracks.length - 1 ? 'now' : 'done') + '"><div class="tt">' + UI.esc(t.n) + '</div>' +
      '<div class="tm">' + UI.esc(t.t) + '　' + UI.esc(t.l) + '</div></div>').join('') + '</div>';
  };

  UI.steps = function (arr, cur) {
    return '<div class="steps">' + arr.map((s, i) =>
      '<div class="st ' + (i < cur ? 'done' : (i === cur ? 'on' : '')) + '"><span class="no">' + (i < cur ? '✓' : (i + 1)) + '</span><span class="tx">' + s + '</span></div>' +
      (i < arr.length - 1 ? '<span class="ln"></span>' : '')).join('') + '</div>';
  };

  UI.kpis = function (list) {
    return '<div class="kpis">' + list.map(k =>
      '<div class="kpi"><div class="lb">' + k.lb + '</div><div class="vl">' + k.vl + (k.unit ? '<small> ' + k.unit + '</small>' : '') + '</div>' +
      '<div class="dt">' + (k.dt || '') + '</div></div>').join('') + '</div>';
  };

  UI.bars = function (data) {
    const max = Math.max.apply(null, data.map(d => d.v)) || 1;
    return '<div class="bars" style="margin-top:8px">' + data.map(d =>
      '<div class="b' + (d.hi ? ' hi' : '') + '" style="height:' + Math.max(4, Math.round(d.v / max * 110)) + 'px" title="' + d.v + '"><span>' + UI.esc(d.k) + '</span></div>'
    ).join('') + '</div>';
  };

  UI.empty = function (text, e) {
    return '<div class="empty"><div class="e">' + (e || '📭') + '</div><div>' + UI.esc(text) + '</div></div>';
  };

  UI.fileRow = function (name) {
    return '<div class="upl done" style="text-align:left;display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
      '<span>📄</span><span style="flex:1">' + UI.esc(name) + '</span><span class="tag green">已上传</span></div>';
  };

  window.UI = UI;
})();
