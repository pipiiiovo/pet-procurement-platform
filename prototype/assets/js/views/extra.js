/* 宠采通 原型 · 购物车 / 客服中心（供应商 & 零售商） */
(function () {
  const V = (window.VIEWS = window.VIEWS || {});
  const S = () => Store.s;
  const go = (r, p) => { location.hash = '#/' + r + '/' + p; };
  const esc = UI.esc;

  const head = (role, title, sub, right) =>
    '<div class="page-head"><h2>' + title + '</h2>' +
    '<span class="crumb">宠采通 / ' + (window.ROLE_NAME[role] || '') + ' / ' + esc(sub || title) + '</span>' +
    '<span class="right">' + (right || '') + '<a class="btn sm" href="#/">🗺️ 页面地图</a></span></div>';

  /* ==================== 零售商 · 购物车 ==================== */
  V['retailer/cart'] = function () {
    const s = S(), cart = s.cart;
    if (!cart.length) {
      return head('retailer', '购物车', '购物车') +
        '<div class="card"><div class="card-bd">' + UI.empty('购物车还是空的，去挑点货吧', '🛒') +
        '<div class="mt12" style="text-align:center">' +
        '<a class="btn pri" href="#/retailer/list">去商品列表逛逛 →</a> ' +
        '<a class="btn" href="#/retailer/orders">查看历史订单</a></div></div></div>';
    }
    const groups = {};
    let goods = 0;
    cart.forEach(c => {
      const p = B.product(c.pid); if (!p) return;
      const k = p.owner === 'platform' ? 'PLATFORM' : p.supplierId;
      (groups[k] = groups[k] || []).push({ p, c });
    });
    const blocks = Object.keys(groups).map(k => {
      const list = groups[k];
      const name = k === 'PLATFORM' ? '👑 宠采通平台自营' : esc((s.suppliers.find(x => x.id === k) || {}).name || '');
      let sub = 0;
      const rows = list.map(({ p, c }) => {
        const price = B.tierPrice(p, c.qty);
        const amt = Math.round(price * c.qty * 100) / 100; sub += amt;
        return '<tr>' +
          '<td><div style="display:flex;align-items:center;gap:10px"><span style="font-size:26px">' + p.e + '</span>' +
          '<div><a href="#/retailer/detail" data-act="cartOpen" data-id="' + p.id + '" style="font-weight:600">' + esc(p.name) + '</a>' +
          '<div class="muted">' + esc(p.spec) + ' · ' + UI.money(price) + ' / ' + esc(p.unit) + '</div></div></div></td>' +
          '<td class="c"><div class="qty"><button class="btn sm" data-act="cartMinus" data-id="' + p.id + '">−</button>' +
          '<input class="inp" style="width:64px;text-align:center" value="' + c.qty + '" data-change="cartQty" data-id="' + p.id + '">' +
          '<button class="btn sm" data-act="cartPlus" data-id="' + p.id + '">+</button></div></td>' +
          '<td class="c"><b>¥ ' + UI.money(amt) + '</b></td>' +
          '<td class="c"><button class="btn sm danger" data-act="cartDel" data-id="' + p.id + '">删除</button></td></tr>';
      }).join('');
      goods += sub;
      const gap = Math.max(0, 1000 - sub);
      return '<div class="card"><div class="card-hd"><h3>' + name + '</h3>' +
        '<span class="sub">' + list.length + ' 种商品</span><span class="right">' +
        (gap > 0 ? '<span class="tag orange">再凑 ¥ ' + UI.money(gap) + ' 免运费</span>' : '<span class="tag green">已免运费</span>') +
        '</span></div>' +
        '<div class="card-bd" style="padding:0"><table class="tbl"><thead><tr><th>商品</th><th style="width:170px" class="c">数量</th><th style="width:120px" class="c">小计</th><th style="width:80px" class="c">操作</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div></div>';
    }).join('');
    const freight = goods >= 1000 ? 0 : 20;
    return head('retailer', '购物车', '购物车',
      '<button class="btn sm" data-act="cartClear">清空购物车</button> <a class="btn sm" href="#/retailer/list">继续选购</a> ') +
      blocks +
      '<div class="card"><div class="card-bd"><div class="row" style="justify-content:flex-end;align-items:center;gap:24px">' +
      '<div class="small muted">商品金额 <b style="color:var(--t1)">¥ ' + UI.money(goods) + '</b>　运费 <b style="color:var(--t1)">¥ ' + UI.money(freight) + '</b></div>' +
      '<div style="font-size:15px">应付：<b style="color:var(--err);font-size:21px">¥ ' + UI.money(goods + freight) + '</b></div>' +
      '<button class="btn pri" data-act="cartCheckout">去结算 →</button></div>' +
      '<div class="muted mt8">下单时按供应商自动拆单；阶梯价按本行数量实时匹配，改数量会重新计算。</div></div></div>';
  };

  Act.register('cartMinus', el => { const c = S().cart.find(x => x.pid === el.getAttribute('data-id')); if (!c) return; B.cartSet(c.pid, c.qty - 1); App.render(); });
  Act.register('cartPlus', el => { const c = S().cart.find(x => x.pid === el.getAttribute('data-id')); if (!c) return; B.cartSet(c.pid, c.qty + 1); App.render(); });
  Act.register('cartQty', el => { B.cartSet(el.getAttribute('data-id'), Number(el.value) || 1); App.render(); });
  Act.register('cartDel', el => { B.cartSet(el.getAttribute('data-id'), 0); UI.toast('已移出购物车'); App.render(); });
  Act.register('cartClear', () => UI.confirm('清空购物车', '确定要清空购物车中的全部商品吗？', '确认清空', () => { B.cartClear(); App.render(); UI.toast('购物车已清空'); }));
  Act.register('cartOpen', el => { window.__pid = el.getAttribute('data-id'); window.__qty = null; go('retailer', 'detail'); });

  /* ==================== 客服中心（供应商 / 零售商共用） ==================== */
  const FAQ = [
    '如何查询订单物流？', '拿货价为什么看不到？', '怎么申请退款？', '资质审核要多久？', '结算单什么时候打款？'
  ];
  const botReply = q => {
    if (q.indexOf('物流') >= 0) return '您可以在「物流查询」页输入订单号或运单号查看完整轨迹；若轨迹超过 48 小时未更新，可点击「物流异常上报」生成工单，我们会联系承运商核实。';
    if (q.indexOf('拿货价') >= 0 || q.indexOf('资质') >= 0) return '拿货价仅对资质审核通过的零售商可见。请在「资质认证」页提交门店营业执照等资料，平台审核通过（通常 1 个工作日）后自动解锁。';
    if (q.indexOf('退款') >= 0) return '签收后 7 天内可在「我的订单 → 订单详情」发起退款 / 退货退款，上传凭证后供应商 48 小时内处理；逾期未处理可在售后进度中申请平台介入仲裁。';
    if (q.indexOf('结算') >= 0 || q.indexOf('打款') >= 0) return '货款结算周期为 T+7，财务复核后 1 个工作日内打款，可在「结算中心」查看结算单明细与到账状态。';
    return '您好，已收到您的问题。为保障处理时效，建议点击右上角「提交工单」并关联订单号，客服将在 2 小时内响应；如需人工服务可点击「转人工」。';
  };
  const defaultMsgs = role => ([
    { me: false, t: role === 'supplier' ? '您好，这里是宠采通供应商服务台。商品审核、订单履约、结算对账问题都可以问我。' : '您好，这里是宠采通采购服务台。商品比价、下单支付、物流与售后问题都可以问我。', at: '09:12' },
    { me: true, t: '我想咨询一下商品上架审核的时效。', at: '09:14' },
    { me: false, t: '商品提交后平台会在 1 个工作日内完成资质与价格合规审核，通过后自动上架；若被驳回会附具体原因，修改后可重新提交。', at: '09:14' }
  ]);

  function serviceView(role) {
    const s = S();
    s.chat = s.chat || {};
    s.chat[role] = s.chat[role] || defaultMsgs(role);
    const cur = window.__svCur || 'platform';
    const convs = [
      { id: 'platform', e: '🎧', n: '平台客服 · 小云', d: '在线 · 通常 1 分钟内回复' },
      { id: 'order', e: '📦', n: '订单咨询专线', d: '订单 / 支付 / 发票' },
      { id: 'after', e: '↩️', n: '售后专员 · 阿泽', d: '退款 / 退货 / 仲裁' }
    ];
    const msgs = s.chat[role].map(m =>
      '<div class="msg ' + (m.me ? 'me' : 'them') + '">' + esc(m.t) + '<div class="tm">' + esc(m.at || '') + '</div></div>').join('');
    const faqBtns = FAQ.map(q => '<button class="btn sm" data-act="svFaq" data-q="' + esc(q) + '">' + esc(q) + '</button>').join('');
    return head(role, '客服中心', '客服中心',
      '<button class="btn sm" data-act="svTransfer">转人工</button> <button class="btn pri sm" data-act="svTicket">提交工单</button> ') +
      '<div class="row" style="align-items:stretch;flex-wrap:nowrap">' +
      '<div class="card" style="width:250px;flex:0 0 250px;margin:0"><div class="card-hd"><h3>会话</h3></div><div class="card-bd" style="padding:8px">' +
      convs.map(c => '<div class="sv-conv' + (cur === c.id ? ' on' : '') + '" data-act="svPick" data-id="' + c.id + '">' +
        '<span class="e">' + c.e + '</span><div><b>' + esc(c.n) + '</b><div class="muted">' + esc(c.d) + '</div></div></div>').join('') +
      '<div class="mt12 small muted">会话记录可回溯，工单与订单自动关联；平台端「客服工单」统一受理。</div>' +
      '</div></div>' +
      '<div class="card" style="flex:1;min-width:0;margin:0"><div class="card-hd"><h3>' + esc((convs.find(c => c.id === cur) || convs[0]).n) + '</h3>' +
      '<span class="sub">机器人 + 人工转接</span><span class="right"><a class="btn sm" href="#/' + role + '/' + (role === 'retailer' ? 'orders' : 'orders') + '">查看订单</a></span></div>' +
      '<div class="card-bd" style="padding:0"><div class="chat"><div class="msgs">' + msgs + '</div>' +
      '<div class="ipt"><input class="inp" id="svInput" placeholder="输入您的问题，回车发送…" data-enter="svSend"><button class="btn pri" data-act="svSend">发送</button></div></div></div>' +
      '<div class="card-bd tight"><div class="small muted mb8">常见问题（点击直接发送）：</div><div class="row" style="gap:6px">' + faqBtns + '</div></div>' +
      '</div></div>' +
      '<div class="card mt16"><div class="card-hd"><h3>工单与自助服务</h3></div><div class="card-bd">' +
      '<div class="row" style="gap:10px">' +
      '<a class="btn" href="#/' + role + '/' + (role === 'retailer' ? 'logistics' : 'orders') + '">🚚 物流 / 订单查询</a>' +
      '<a class="btn" href="#/' + role + '/' + (role === 'retailer' ? 'orders' : 'aftersale') + '">↩️ 售后进度</a>' +
      '<a class="btn" href="#/' + role + '/' + (role === 'retailer' ? 'cert' : 'qualification') + '">🏷️ 资质相关</a>' +
      '<button class="btn pri" data-act="svTicket">＋ 提交工单</button>' +
      '</div><div class="muted mt8">当前平台待处理工单：' + s.tickets.filter(t => t.status !== '已完结').length + ' 条（可在平台管理端「客服工单」查看）</div>' +
      '</div></div>';
  }

  V['retailer/service'] = () => serviceView('retailer');
  V['supplier/service'] = () => serviceView('supplier');

  function pushMsg(role, text, me) {
    const s = S(); s.chat = s.chat || {}; s.chat[role] = s.chat[role] || defaultMsgs(role);
    const d = new Date(), p = n => String(n).padStart(2, '0');
    const at = p(d.getHours()) + ':' + p(d.getMinutes());
    s.chat[role].push({ me: !!me, t: text, at });
  }
  function send(role, q) {
    q = String(q || '').trim(); if (!q) return;
    pushMsg(role, q, true);
    pushMsg(role, botReply(q), false);
    Store.save(); App.render();
  }
  Act.register('svSend', () => send(S().role, (document.getElementById('svInput') || {}).value));
  Act.register('svFaq', el => send(S().role, el.getAttribute('data-q')));
  Act.register('svPick', el => { window.__svCur = el.getAttribute('data-id'); App.render(); });
  Act.register('svTransfer', () => {
    const role = S().role; pushMsg(role, '正在为您转接人工客服，当前排队 1 人，预计 1 分钟内接入…', false);
    Store.save(); App.render(); UI.toast('已转接人工客服', 'ok');
  });
  Act.register('svTicket', () => {
    const s = S(), role = s.role;
    const opts = (role === 'retailer' ? s.orders.filter(o => o.retailerId === 'R01') : s.orders.filter(o => o.supplierId === 'S01'))
      .slice(0, 8).map(o => '<option value="' + esc(o.no) + '">' + esc(o.no) + '</option>').join('');
    UI.modal({
      title: '提交客服工单', wide: true,
      body: '<div class="fld"><label>问题类型</label><select class="inp" id="tkType"><option>订单咨询</option><option>物流查询</option><option>售后投诉</option><option>资质与审核</option><option>结算与发票</option></select></div>' +
        '<div class="fld"><label>关联订单</label><select class="inp" id="tkOrder"><option value="">不关联</option>' + opts + '</select></div>' +
        '<div class="fld"><label>问题标题 <span class="req">*</span></label><input class="inp" id="tkTitle" placeholder="一句话描述遇到的问题"></div>' +
        '<div class="fld"><label>详细说明</label><textarea class="inp" id="tkDesc" rows="3" placeholder="补充订单号、时间、现象等信息"></textarea></div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="svTicketOk">提交工单</button>'
    });
  });
  Act.register('svTicketOk', () => {
    const s = S(), role = s.role;
    const title = (document.getElementById('tkTitle') || {}).value || '';
    if (!title.trim()) { UI.toast('请填写问题标题', 'err'); return; }
    const type = (document.getElementById('tkType') || {}).value || '订单咨询';
    const orderNo = (document.getElementById('tkOrder') || {}).value || '';
    const desc = (document.getElementById('tkDesc') || {}).value || '';
    B.addTicket({
      type, title: title.trim(), orderNo,
      from: (role === 'retailer' ? '零售商 · ' : '供应商 · ') + (s.me[role] || {}).name,
      level: '中', msgs: [{ me: false, t: desc || title.trim(), at: U.now() }]
    });
    UI.closeModal(); UI.toast('工单已提交，平台端「客服工单」可见', 'ok'); App.render();
  });
})();
