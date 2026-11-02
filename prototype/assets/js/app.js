/* 宠采通 原型 · 应用框架：路由 / 布局 / 导航 / 全站页面地图 */
(function () {
  window.VIEWS = window.VIEWS || {};

  const NAVS = window.NAVS;
  const ROLE_NAME = window.ROLE_NAME;
  const ROLE_META = window.ROLE_META;

  const App = {
    role: 'retailer',
    page: 'home',
    init() {
      Store.load();
      this.parseHash();
      window.addEventListener('hashchange', () => { this.parseHash(); this.render(); });
      this.bindGlobal();
      this.render();
    },
    hasPage(role, p) {
      /* 菜单页 + 非菜单页（详情 / 结算 / 收银台等已在 VIEWS 注册的页面）都允许直接路由 */
      if (window.VIEWS && window.VIEWS[role + '/' + p]) return true;
      if (!NAVS[role]) return false;
      return NAVS[role].some(g => g.items.some(i => i.p === p));
    },
    firstPage(role) { return NAVS[role][0].items[0].p; },
    parseHash() {
      const h = (location.hash || '').replace(/^#\/?/, '');
      const seg = h.split('/').filter(Boolean);
      if (!h) { this.role = ''; this.page = 'entry'; return; }
      if (seg.length >= 2 && NAVS[seg[0]]) {
        this.role = seg[0];
        this.page = this.hasPage(this.role, seg[1]) ? seg[1] : this.firstPage(this.role);
      } else if (seg.length === 1 && NAVS[seg[0]]) {
        this.role = seg[0]; this.page = this.firstPage(this.role);
      } else { this.role = ''; this.page = 'entry'; }
    },
    go(role, page) { location.hash = '#/' + role + '/' + page; },
    /* ---------- 渲染 ---------- */
    render() {
      const root = document.getElementById('app');
      if (!root) return;
      if (!this.role) { root.innerHTML = this.entry(); window.scrollTo(0, 0); return; }
      Store.s.role = this.role;
      const me = Store.s.me[this.role] || {};
      root.innerHTML =
        this.header(me) +
        '<div class="app">' + this.sidebar() + '<div class="main" id="main">' + this.content() + '</div></div>' +
        (this.role === 'retailer' ? this.cartFab() : '');
      window.scrollTo(0, 0);
    },
    /* ---------- 侧边悬浮购物车（快捷入口） ---------- */
    cartFab() {
      return '<button class="cart-fab" data-act="openCart" title="打开购物车">' +
        '<span class="ic">🛒</span><span class="tx">购物车</span>' + this.fabBadge() + '</button>';
    },
    fabBadge() {
      const n = Store.s.cart.reduce((a, b) => a + (b.qty || 0), 0);
      return n > 0 ? '<span class="cnt">' + n + '</span>' : '';
    },
    refreshFab() {
      const f = document.querySelector('.cart-fab');
      if (!f) return;
      const n = Store.s.cart.reduce((a, b) => a + (b.qty || 0), 0);
      f.innerHTML = '<span class="ic">🛒</span><span class="tx">购物车</span>' + (n > 0 ? '<span class="cnt">' + n + '</span>' : '');
    },
    header(me) {
      const s = Store.s;
      const tabs = ['supplier', 'retailer', 'admin'].map(r =>
        '<button class="role-tab' + (this.role === r ? ' on' : '') + '" data-act="switchRole" data-role="' + r + '">' + ROLE_NAME[r] + '</button>').join('');
      const extra = this.role === 'retailer'
        ? '<button class="btn-demo" data-act="toggleCert" title="用于演示价格可见性规则">' +
        (s.retailerAuth.status === 'approved' ? '资质：已认证 ✓（点击切换为未认证）' : '资质：未认证（点击切换为已认证）') + '</button>' : '';
      return '<div class="hdr">' +
        '<div class="logo"><span class="mark">🐾</span>宠采通 <span style="font-weight:400;font-size:12px;color:#9ca3af">宠物用品采购平台</span></div>' +
        '<div class="role-tabs">' + tabs + '</div>' +
        '<div class="hdr-spacer"></div>' +
        '<div class="hdr-right">' + extra +
        '<a class="btn sm" href="#/" title="返回全站页面地图" style="margin-right:2px">🗺️ 页面地图</a>' +
        '<span class="bell">🔔<span class="dot"></span></span>' +
        '<span class="muted">Hi，' + UI.esc(me.name || '') + '</span>' +
        '<span class="avatar">' + UI.esc((me.name || 'U').slice(0, 1)) + '</span>' +
        '<button class="btn sm" data-act="resetDemo">重置数据</button>' +
        '</div></div>';
    },
    sidebar() {
      const groups = NAVS[this.role];
      const html = groups.map(g =>
        '<div class="side-grp">' + g.grp + '</div>' +
        g.items.map(it => {
          const b = it.badge ? it.badge(Store.s) : 0;
          return '<a href="#/' + this.role + '/' + it.p + '" class="' + (this.page === it.p ? 'on' : '') + '" title="点击进入：' + it.t + '">' +
            '<span class="ic">' + it.ic + '</span>' + it.t +
            (b > 0 ? '<span class="badge">' + b + '</span>' : '') + '</a>';
        }).join('')
      ).join('');
      return '<nav class="side">' + html +
        '<div class="side-grp">原型导航</div>' +
        '<a href="#/" title="返回入口页查看全部页面">🗺️ 全站页面地图</a>' +
        '</nav>';
    },
    content() {
      const key = this.role + '/' + this.page;
      const v = window.VIEWS[key];
      if (!v) return '<div class="card"><div class="card-bd">' + UI.empty('页面原型建设中：' + key) + '</div></div>';
      try { return v(); } catch (e) { console.error(e); return '<div class="card"><div class="card-bd">渲染错误：' + e.message + '</div></div>'; }
    },
    /* ---------- 全站页面地图：所有页面均可点击直达 ---------- */
    sitemap() {
      let total = 0;
      const cols = ['supplier', 'retailer', 'admin'].map(r => {
        const meta = ROLE_META[r];
        const blocks = NAVS[r].map(g => {
          const links = g.items.map(it => {
            total++;
            const exists = !!window.VIEWS[r + '/' + it.p];
            return '<a class="sm-link" href="#/' + r + '/' + it.p + '" title="' + UI.esc(it.t) + '：' + UI.esc(it.d || '') + '">' +
              '<span class="ic">' + it.ic + '</span><span>' + UI.esc(it.t) + '</span>' +
              (exists ? '<span class="ok">✓</span>' : '<span class="no">!</span>') + '</a>';
          }).join('');
          return '<div class="sm-grp"><div class="sm-cap">' + UI.esc(g.grp) + '</div><div class="sm-links">' + links + '</div></div>';
        }).join('');
        const n = NAVS[r].reduce((a, g) => a + g.items.length, 0);
        return '<div class="sm-col"><div class="sm-col-hd"><span class="e">' + meta.e + '</span>' +
          '<b>' + UI.esc(meta.name) + '</b><span class="cnt">' + n + ' 页</span></div>' +
          '<div class="sm-col-bd">' + blocks + '</div>' +
          '<a class="btn pri sm" href="#/' + r + '/' + App.firstPage(r) + '">进入' + UI.esc(meta.name) + ' →</a></div>';
      }).join('');
      return '<div class="card mt16"><div class="card-hd"><h3>🗺️ 全站页面地图</h3>' +
        '<span class="sub">共 ' + total + ' 个业务页面，每个页面均可点击直达（绿色勾表示页面已连通）</span></div>' +
        '<div class="card-bd"><div class="sm-grid">' + cols + '</div>' +
        '<p class="muted mt12">除此之外，页面内的按钮、商品卡片、订单、审核条目均可点击交互；顶栏可随时切换三方角色，右上角「页面地图」可返回本页。</p>' +
        '</div></div>';
    },
    /* ---------- 入口页 ---------- */
    entry() {
      const cards = [
        { r: 'supplier', e: '🏭', t: '供应商', d: '品牌方 / 经销商', li: ['入驻申请与资质中心', '商品品类管理与上架审核', '订单接单发货与物流回填', '售后处理与结算对账'] },
        { r: 'retailer', e: '🏪', t: '零售商', d: '宠物店 / 宠物医院 / 商超宠物专区', li: ['资质认证解锁拿货价', '搜索比价、统一拿货价与购物车', '在线支付与订单物流追踪', '退款售后与平台仲裁'] },
        { r: 'admin', e: '🛡️', t: '平台管理员', d: '运营 / 审核 / 客服 / 财务', li: ['供应商与零售商资质审核', '商品上架审核与平台自营独代', '订单、退款仲裁与结算', '物流、客服与平台维护'] }
      ];
      return '<div class="hdr">' +
        '<div class="logo"><span class="mark">🐾</span>宠采通 <span style="font-weight:400;font-size:12px;color:#9ca3af">宠物用品采购平台 · 可交互原型</span></div>' +
        '<div class="hdr-spacer"></div><div class="hdr-right"><button class="btn sm" data-act="resetDemo">重置演示数据</button></div></div>' +
        '<div class="entry">' +
        '<div class="card" style="margin-bottom:16px"><div class="card-bd">' +
        '<h2 style="font-size:18px;margin-bottom:6px">选择一个角色进入原型</h2>' +
        '<p class="muted">本原型为高保真可交互演示，三方数据实时联动：零售商下单 → 供应商接单发货 → 零售商查看物流轨迹；供应商提交商品 → 平台审核 → 上架后零售商可见可购。数据保存在浏览器本地，可随时重置。</p>' +
        '</div></div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">' +
        cards.map(c => '<div class="role-card" data-act="switchRole" data-role="' + c.r + '">' +
          '<div class="e">' + c.e + '</div><h4>' + c.t + '</h4><p>' + c.d + '</p>' +
          '<ul>' + c.li.map(x => '<li>' + x + '</li>').join('') + '</ul>' +
          '<div class="mt12"><span class="btn pri sm">进入 →</span></div></div>').join('') +
        '</div>' +
        this.sitemap() +
        '<div class="card mt16"><div class="card-bd small muted">' +
        '<b>建议体验动线：</b>① 平台端「商品上架审核」通过「佩蒂 牛皮咬胶洁齿卷」→ ② 零售商端首页可见该款宠物零食并下单支付 → ③ 供应商端「订单管理」接单发货 → ④ 零售商端「物流查询」看到轨迹 → ⑤ 零售商发起售后 → ⑥ 供应商处理 → ⑦ 平台端退款仲裁。' +
        '</div></div></div>';
    },
    /* ---------- 事件 ---------- */
    bindGlobal() {
      document.addEventListener('click', function (e) {
        const t = e.target.closest('[data-act]');
        if (!t) return;
        const a = t.getAttribute('data-act');
        if (a === 'modalOk') {
          const fn = window.__modalOk; window.__modalOk = null; UI.closeModal();
          if (fn) fn();
          return;
        }
        Act.run(a, t, e);
      });
      document.addEventListener('change', function (e) {
        const t = e.target.closest('[data-change]');
        if (!t) return;
        Act.run(t.getAttribute('data-change'), t, e);
      });
      document.addEventListener('submit', function (e) {
        const t = e.target.closest('[data-submit]');
        if (!t) return; e.preventDefault();
        Act.run(t.getAttribute('data-submit'), t, e);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { UI.closeModal(); UI.closeDrawer(); }
        if (e.key === 'Enter' && e.target && e.target.closest) {
          const t = e.target.closest('[data-enter]');
          if (t) { e.preventDefault(); Act.run(t.getAttribute('data-enter'), t, e); }
        }
      });
    }
  };

  /* 全局动作 */
  Act.register('switchRole', el => {
    const r = el.getAttribute('data-role');
    App.go(r, App.firstPage(r));
  });
  Act.register('closeModal', () => UI.closeModal());
  Act.register('closeDrawer', () => UI.closeDrawer());
  Act.register('resetDemo', () => {
    UI.confirm('重置演示数据', '将清空本地演示数据（订单、商品状态、购物车等），恢复到初始状态。', '确认重置', () => {
      Store.reset(); UI.toast('已重置为初始演示数据', 'ok'); App.render();
    });
  });
  Act.register('toggleCert', () => {
    const a = Store.s.retailerAuth;
    a.status = a.status === 'approved' ? 'pending' : 'approved';
    Store.save(); App.render();
    UI.toast(a.status === 'approved' ? '已切换为「资质认证通过」：可见拿货价' : '已切换为「未认证」：价格遮挡，不可下单');
  });
  Act.register('noop', () => { });

  window.App = App;
  window.NAVS = NAVS;
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
