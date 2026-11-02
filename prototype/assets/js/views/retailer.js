/* 零售商端视图（零售采购） */
(function () {
  const V = (window.VIEWS = window.VIEWS || {}), S = () => Store.s;
  const certified = () => S().retailerAuth.status === 'approved';
  const onSale = () => S().products.filter(p => p.status === 'onSale');
  const myOrders = () => S().orders.filter(o => o.retailerId === 'R01');
  const myRefunds = () => S().refunds.filter(r => r.retailer === S().retailerAuth.name);
  const LF = () => (window.__lf = window.__lf || { kw: '', cat: '', sort: '', self: false, brand: '', min: '', max: '', stock: false, page: 1, view: 'grid' });

  const card = p => {
    const lock = !certified();
    return '<div class="prod" data-act="rOpen" data-id="' + p.id + '">' +
      '<div class="pic">' + p.e + (p.isSelf ? '<span class="tag self" style="position:absolute;top:8px;left:8px">👑 平台自营</span>' : '') +
      (p.tag && !p.isSelf ? '<span class="tag orange" style="position:absolute;top:8px;left:8px">' + p.tag + '</span>' : '') + '</div>' +
      '<div class="bd"><div class="nm">' + UI.esc(p.name) + '</div>' +
      (lock ? '<div class="price-lock">🔒 资质认证后可见拿货价</div>'
        : '<div class="pr"><small>¥</small>' + UI.money(B.tierPrice(p, p.moq)) + '<small> /' + p.unit + '</small>' +
        (p.tiers.length > 1 ? '<span class="tag orange" style="margin-left:6px">' + p.tiers.length + ' 档阶梯</span>' : '') + '</div>' +
        '<div class="meta"><span>已售 ' + p.sales + '</span><span>MOQ ' + p.moq + p.unit + '</span><span>库存 ' + p.stock + '</span></div>' +
        '<div class="mt8"><button class="btn sm pri blk" data-act="rQuickAdd" data-id="' + p.id + '">加入购物车</button></div>') +
      '<div class="sup">' + (p.isSelf ? '宠采通平台自营 · ' + p.ship : UI.esc(p.supplierName)) + '</div>' +
      '</div>' + (lock ? '<div class="lock"><div>🔒</div><div>认证后可见价格<br>并可下单采购</div></div>' : '') + '</div>';
  };

  /* ============ 首页 ============ */
  V['retailer/home'] = function () {
    const s = S(), ps = onSale();
    const selfs = ps.filter(p => p.isSelf);
    const hot = ps.slice().sort((a, b) => b.sales - a.sales).slice(0, 4);
    const kw = LF().kw;
    return (certified() ? '' : '<div class="note" style="display:flex;align-items:center;gap:10px">🔒 当前为<b>未认证</b>状态：拿货价已隐藏、无法下单。' +
      '<button class="btn sm pri" data-act="go" data-page="cert">立即认证</button>' +
      '<span class="muted">（右上角「资质：未认证」按钮可切换演示状态）</span></div>') +
      '<div class="hero"><h3>' + s.banners[0].t + '</h3><p>' + s.banners[0].s + '　|　' + s.banners[1].t + '　|　' + s.banners[2].t + '</p>' +
      '<div class="search"><input class="inp" id="homeKw" placeholder="搜索宠物粮 / 猫砂 / 零食 / 品牌 / 条形码" value="' + UI.esc(kw) + '">' +
      '<button class="btn" data-act="homeSearch">搜索</button></div></div>' +
      '<div class="card"><div class="card-bd"><div class="cats">' +
      s.categories.map(c => '<div class="cat" data-act="rCat" data-cat="' + c.name + '"><span class="e">' + c.e + '</span>' + c.name + '</div>').join('') +
      '</div></div></div>' +
      '<div class="floor-hd"><h3>👑 平台自营独代专区</h3><span class="muted">买断直营 · 24 小时极速发货 · 一件也批发</span><span class="more right" data-act="rCat" data-cat="自营">查看全部 →</span></div>' +
      '<div class="prods">' + selfs.map(card).join('') + '</div>' +
      '<div class="floor-hd"><h3>🔥 热销榜</h3><span class="muted">近 7 日门店采购量排序</span><span class="more right" data-act="go" data-page="list">查看更多 →</span></div>' +
      '<div class="prods">' + hot.map(card).join('') + '</div>' +
      '<div class="floor-hd"><h3>🆕 新品上架</h3><span class="muted">平台审核通过后即刻可见</span></div>' +
      '<div class="prods">' + ps.filter(p => p.tag === '新品').concat(ps.filter(p => !p.tag)).slice(0, 4).map(card).join('') + '</div>' +
      '<div class="card mt16"><div class="card-bd small muted">💡 <b>演示提示：</b>点击商品查看详情与阶梯价 → 加入购物车（或使用右侧悬浮购物车按钮查看）→ 去结算 → 模拟支付；随后切换到<b>供应商端</b>可看到该订单并发货，回到本端「物流查询」即可看到轨迹。</div></div>';
  };
  Act.register('homeSearch', () => { LF().kw = (document.getElementById('homeKw') || {}).value || ''; LF().page = 1; App.go('retailer', 'list'); });
  Act.register('rCat', el => {
    const f = LF(); f.cat = el.getAttribute('data-cat'); f.page = 1;
    App.go('retailer', 'list');
  });
  Act.register('rOpen', el => { window.__pid = el.getAttribute('data-id'); window.__qty = null; App.go('retailer', 'detail'); });
  Act.register('rQuickAdd', el => {
    const id = el.getAttribute('data-id'), p = B.product(id);
    if (!p) return;
    B.cartAdd(id, p.moq); App.refreshFab();
    UI.toast('已加入购物车：' + p.name.slice(0, 10) + '… ×' + p.moq + p.unit, 'ok');
  });
  Act.register('go', el => App.go(App.role, el.getAttribute('data-page')));

  /* ============ 商品列表 ============ */
  V['retailer/list'] = function () {
    const f = LF();
    let ps = onSale();
    if (f.cat === '自营') ps = ps.filter(p => p.isSelf);
    else if (f.cat) ps = ps.filter(p => p.cat === f.cat);
    if (f.brand) ps = ps.filter(p => p.brand === f.brand);
    if (f.kw) ps = ps.filter(p => (p.name + p.brand + p.spec + p.cat).indexOf(f.kw) >= 0);
    if (f.min) ps = ps.filter(p => p.price >= Number(f.min));
    if (f.max) ps = ps.filter(p => p.price <= Number(f.max));
    if (f.stock) ps = ps.filter(p => p.stock > 0);
    if (f.sort === 'price') ps = ps.slice().sort((a, b) => a.price - b.price);
    else if (f.sort === 'priceDesc') ps = ps.slice().sort((a, b) => b.price - a.price);
    else if (f.sort === 'sales') ps = ps.slice().sort((a, b) => b.sales - a.sales);
    else if (f.sort === 'new') ps = ps.slice().sort((a, b) => (b.tag === '新品' ? 1 : 0) - (a.tag === '新品' ? 1 : 0));

    const per = 12, total = ps.length, pages = Math.max(1, Math.ceil(total / per));
    if (f.page > pages) f.page = pages;
    const page = ps.slice((f.page - 1) * per, f.page * per);
    const brands = Array.from(new Set(onSale().map(p => p.brand)));

    const grid = '<div class="prods">' + page.map(card).join('') + '</div>';
    const table = '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr>' +
      '<th>商品</th><th class="c">品牌</th><th class="c">规格</th><th class="r">阶梯价</th><th class="c">MOQ</th><th class="c">库存</th><th class="c">销量</th><th class="c">供应商</th><th class="c">操作</th></tr></thead><tbody>' +
      (page.length ? page.map(p => '<tr><td><div style="display:flex;gap:10px;align-items:center"><span style="font-size:22px">' + p.e + '</span>' +
        '<div><div style="font-weight:500;cursor:pointer" data-act="rOpen" data-id="' + p.id + '">' + (p.isSelf ? '<span class="tag self">自营</span> ' : '') + UI.esc(p.name) + '</div>' +
        '<div class="muted small">' + p.cat + ' / ' + (p.sub || '-') + '</div></div></div></td>' +
        '<td class="c small">' + UI.esc(p.brand) + '</td><td class="c small">' + UI.esc(p.spec) + '</td>' +
        '<td class="r">' + (certified() ? '¥' + UI.money(B.tierPrice(p, p.moq)) + (p.tiers.length > 1 ? ' <span class="tag blue">' + p.tiers.length + ' 档</span>' : '') : '<span class="muted">🔒 认证后可见</span>') + '</td>' +
        '<td class="c">' + p.moq + p.unit + '</td><td class="c">' + p.stock + '</td><td class="c">' + p.sales + '</td>' +
        '<td class="c small">' + (p.isSelf ? '宠采通平台自营' : UI.esc(p.supplierName.slice(0, 10)) + '…') + '</td>' +
        '<td class="c"><button class="btn sm pri" data-act="rQuickAdd" data-id="' + p.id + '">加购</button> <button class="btn sm" data-act="rOpen" data-id="' + p.id + '">详情</button></td></tr>').join('')
        : '<tr><td colspan="9">' + UI.empty('没有符合条件的商品，试试放宽筛选') + '</td></tr>') +
      '</tbody></table></div></div>';

    return '<div class="page-head"><h2>商品列表</h2><span class="crumb">共 ' + total + ' 件商品' +
      (f.cat ? '　类目：' + f.cat : '') + (f.kw ? '　关键词：' + UI.esc(f.kw) : '') + '　第 ' + f.page + '/' + pages + ' 页</span></div>' +
      '<div class="filters">' +
      '<input class="inp" id="listKw" placeholder="搜索商品名 / 品牌 / 规格" value="' + UI.esc(f.kw) + '" data-change="listKwEnter"><button class="btn" data-act="listSearch">搜索</button>' +
      '<select class="inp" data-change="rBrand"><option value="">全部品牌</option>' + brands.map(b => '<option' + (f.brand === b ? ' selected' : '') + '>' + UI.esc(b) + '</option>').join('') + '</select>' +
      '<span class="small muted">价格</span><input class="inp" style="width:80px" placeholder="最低" value="' + UI.esc(f.min) + '" data-change="rMin">' +
      '<span class="small muted">-</span><input class="inp" style="width:80px" placeholder="最高" value="' + UI.esc(f.max) + '" data-change="rMax">' +
      '<select class="inp" data-change="rSort"><option value="">综合排序</option>' +
      '<option value="price"' + (f.sort === 'price' ? ' selected' : '') + '>价格从低到高</option>' +
      '<option value="priceDesc"' + (f.sort === 'priceDesc' ? ' selected' : '') + '>价格从高到低</option>' +
      '<option value="sales"' + (f.sort === 'sales' ? ' selected' : '') + '>销量优先</option>' +
      '<option value="new"' + (f.sort === 'new' ? ' selected' : '') + '>新品优先</option></select>' +
      '<label class="chk"><input type="checkbox" ' + (f.self ? 'checked' : '') + ' data-change="rSelfOnly">仅看平台自营</label>' +
      '<label class="chk"><input type="checkbox" ' + (f.stock ? 'checked' : '') + ' data-change="rStockOnly">仅看有货</label>' +
      '<div class="right"><div class="seg">' +
      '<button class="' + (f.view === 'grid' ? 'on' : '') + '" data-act="rView" data-v="grid">网格</button>' +
      '<button class="' + (f.view === 'list' ? 'on' : '') + '" data-act="rView" data-v="list">列表</button></div> ' +
      '<button class="btn sm" data-act="rReset">重置筛选</button></div>' +
      '</div>' +
      '<div class="card mb8" style="padding:10px 14px"><div class="small muted">类目：' +
      ['全部', '自营'].concat(S().categories.map(c => c.name)).map(c =>
        '<span class="tag ' + ((f.cat === c || (!f.cat && c === '全部')) ? 'blue' : 'gray') + '" style="cursor:pointer;margin-right:6px" data-act="rCat" data-cat="' + (c === '全部' ? '' : c) + '">' + c + '</span>').join('') +
      '</div></div>' +
      (total ? (f.view === 'list' ? table : grid) +
        (pages > 1 ? '<div class="pager">' +
          '<button class="btn sm" data-act="rPage" data-p="' + (f.page - 1) + '"' + (f.page <= 1 ? ' disabled' : '') + '>上一页</button>' +
          Array.from({ length: pages }, (_, i) => '<button class="btn sm' + (f.page === i + 1 ? ' pri' : '') + '" data-act="rPage" data-p="' + (i + 1) + '">' + (i + 1) + '</button>').join('') +
          '<button class="btn sm" data-act="rPage" data-p="' + (f.page + 1) + '"' + (f.page >= pages ? ' disabled' : '') + '>下一页</button></div>' : '')
        : '<div class="card">' + UI.empty('没有找到相关商品，试试放宽筛选条件', '🔍') + '</div>');
  };
  Act.register('listSearch', () => { LF().kw = (document.getElementById('listKw') || {}).value || ''; LF().page = 1; App.render(); });
  Act.register('listKwEnter', el => { LF().kw = el.value || ''; LF().page = 1; App.render(); });
  Act.register('rSort', el => { LF().sort = el.value; App.render(); });
  Act.register('rBrand', el => { LF().brand = el.value; LF().page = 1; App.render(); });
  Act.register('rMin', el => { LF().min = el.value; LF().page = 1; App.render(); });
  Act.register('rMax', el => { LF().max = el.value; LF().page = 1; App.render(); });
  Act.register('rSelfOnly', el => { LF().self = el.checked; LF().page = 1; App.render(); });
  Act.register('rStockOnly', el => { LF().stock = el.checked; LF().page = 1; App.render(); });
  Act.register('rView', el => { LF().view = el.getAttribute('data-v'); App.render(); });
  Act.register('rPage', el => {
    const f = LF(); const p = Number(el.getAttribute('data-p'));
    if (!p || p < 1 || el.disabled) return;
    f.page = p; App.render(); window.scrollTo(0, 0);
  });
  Act.register('rReset', () => { window.__lf = { kw: '', cat: '', sort: '', self: false, brand: '', min: '', max: '', stock: false, page: 1, view: 'grid' }; App.render(); });

  /* ============ 商品详情 ============ */
  V['retailer/detail'] = function () {
    const p = B.product(window.__pid); if (!p) return '<div class="card"><div class="card-bd">' + UI.empty('商品不存在') + '</div></div>';
    const qty = window.__qty || p.moq;
    const price = B.tierPrice(p, qty);
    const lock = !certified();
    const next = p.tiers.find(t => t.min > qty);
    return '<div class="page-head"><span class="crumb"><a href="#/retailer/home">首页</a> / <a href="#/retailer/list">' + p.cat + '</a> / ' + UI.esc(p.name.slice(0, 12)) + '…</span></div>' +
      '<div class="row">' +
      '<div style="width:320px;flex:0 0 320px"><div class="detail-pic">' + p.e + '</div>' +
      '<div class="card mt12"><div class="card-bd small">' +
      '<div class="mb8"><b>供应商</b>：' + (p.isSelf ? '宠采通平台自营（独家代理）' : UI.esc(p.supplierName)) + '</div>' +
      '<div class="mb8"><b>发货地</b>：' + p.from + '　<b>发货时效</b>：' + p.ship + '</div>' +
      '<div class="mb8"><b>服务</b>：7 天无理由售后 · 破损包退 · 错发包换</div>' +
      '<div><b>店铺评分</b>：' + (p.rate || '—') + ' 分</div>' +
      '</div></div></div>' +
      '<div style="flex:1;min-width:340px">' +
      '<div class="card"><div class="card-bd">' +
      '<h3 style="font-size:17px;line-height:1.5">' + (p.isSelf ? '<span class="tag self">👑 平台自营</span> ' : '') + UI.esc(p.name) + '</h3>' +
      '<div class="muted small mt8">品牌：' + UI.esc(p.brand) + '　规格：' + UI.esc(p.spec) + '　已售：' + p.sales + '</div>' +
      (lock ? '<div class="price-lock mt12">🔒 该商品拿货价需完成资质认证后可见<button class="btn sm pri" style="margin-left:10px" data-act="go" data-page="cert">去认证</button></div>'
        : '<div class="dt-price mt12"><div><span class="v">¥' + UI.money(price) + '</span><span class="muted"> /' + p.unit + '</span>' +
        '<span class="muted" style="margin-left:12px;text-decoration:line-through">零售价 ¥' + UI.money(p.retail) + '</span>' +
        '<div class="small" style="color:#15803d">毛利率约 ' + Math.round((p.retail - price) / p.retail * 100) + '%（按建议零售价测算）</div></div>' +
        '<table class="tb tier-tb mt8" style="max-width:460px"><thead><tr><th>采购量</th><th>单价</th></tr></thead><tbody>' +
        p.tiers.map(t => '<tr class="' + (qty >= t.min && (!t.max || qty <= t.max) ? 'hit' : '') + '"><td>' + t.min + (t.max ? ' ~ ' + t.max : ' 以上') + ' ' + p.unit + '</td><td>¥' + UI.money(t.p) + '</td></tr>').join('') +
        '</tbody></table>' +
        (next ? '<div class="small" style="color:#c2410c">再买 ' + (next.min - qty) + ' ' + p.unit + ' 可享 ¥' + UI.money(next.p) + '/' + p.unit + '，立省 ¥' + UI.money((price - next.p) * next.min) + '</div>' : '') +
        '</div>') +
      '<div class="mt12"><span class="muted small">规格</span><div class="sku-pick mt8">' +
      '<span class="sku on">' + UI.esc(p.spec) + '</span></div></div>' +
      '<div class="mt12 row" style="align-items:center"><span class="muted small">采购量</span>' +
      '<div class="stepper"><button data-act="rMinus">−</button><input id="dQty" value="' + qty + '" data-change="rQty"><button data-act="rPlus">＋</button></div>' +
      '<span class="muted small">起订 ' + p.moq + p.unit + '　库存 ' + p.stock + p.unit + '</span></div>' +
      '<div class="mt16">' +
      (lock ? '<button class="btn lg" disabled>加入购物车（需先认证）</button> <button class="btn warn lg" disabled>立即下单</button>'
        : '<button class="btn lg" data-act="rAddCart" data-id="' + p.id + '">加入购物车</button> ' +
        '<button class="btn warn lg" data-act="rBuyNow" data-id="' + p.id + '">立即下单</button>' +
        '<span class="muted" style="margin-left:10px">小计：<b style="color:#dc2626;font-size:18px">¥' + UI.money(price * qty) + '</b></span>') +
      '</div></div></div>' +
      '<div class="card mt12"><div class="card-hd"><h3>商品详情</h3></div><div class="card-bd small">' +
      '<dl class="kv"><dt>保质期</dt><dd>' + UI.esc(p.shelf) + '</dd><dt>箱规</dt><dd>' + UI.esc(p.spec) + '</dd>' +
      '<dt>适用对象</dt><dd>犬猫通用（详见包装说明）</dd>' +
      '<dt>贮存条件</dt><dd>置于阴凉干燥处、避免阳光直射；开封后请密封保存并尽快用完</dd>' +
      '<dt>售后政策</dt><dd>签收后 7 天内可申请售后，临期、破损、错发包退换</dd></dl>' +
      '</div></div>' +
      '</div></div>';
  };
  Act.register('rMinus', () => { const i = document.getElementById('dQty'); if (i && Number(i.value) > 1) { i.value = Number(i.value) - 1; window.__qty = Number(i.value); } App.render(); });
  Act.register('rPlus', () => { const i = document.getElementById('dQty'); if (i) { i.value = Number(i.value) + 1; window.__qty = Number(i.value); } App.render(); });
  Act.register('rQty', el => { window.__qty = Number(el.value) || 1; App.render(); });
  Act.register('rAddCart', el => {
    const id = el.getAttribute('data-id');
    const qty = Number((document.getElementById('dQty') || {}).value) || 1;
    B.cartAdd(id, qty); App.refreshFab();
    UI.drawer({
      title: '已加入购物车',
      body: cartHtml(),
      footer: '<button class="btn" data-act="closeDrawer">继续逛逛</button><button class="btn warn" data-act="cartCheckout">去结算</button>'
    });
  });
  Act.register('rBuyNow', el => {
    const id = el.getAttribute('data-id');
    const qty = Number((document.getElementById('dQty') || {}).value) || 1;
    B.cartAdd(id, qty); App.refreshFab(); App.go('retailer', 'checkout');
  });

  /* ============ 购物车（侧边悬浮抽屉） ============ */
  function cartHtml() {
    const c = S().cart;
    if (!c.length) return '<div class="card-bd">' + UI.empty('购物车是空的，去逛逛吧', '🛒') + '</div>';
    const groups = {};
    c.forEach(x => { const p = B.product(x.pid); if (!p) return; const k = p.supplierId; (groups[k] = groups[k] || []).push({ p, qty: x.qty }); });
    let total = 0, saved = 0;
    const html = Object.keys(groups).map(k => {
      const g = groups[k];
      let sum = 0;
      const rows = g.map(it => {
        const price = B.tierPrice(it.p, it.qty);
        sum += price * it.qty; saved += (it.p.price - price) * it.qty;
        return '<div class="ci"><div class="p">' + it.p.e + '</div><div class="n"><div class="t">' + UI.esc(it.p.name) + '</div>' +
          '<div class="s">' + it.p.spec + '　¥' + UI.money(price) + '/' + it.p.unit + '</div></div>' +
          '<div class="stepper"><button data-act="cMinus" data-id="' + it.p.id + '">−</button><input value="' + it.qty + '" data-change="cQty" data-id="' + it.p.id + '"><button data-act="cPlus" data-id="' + it.p.id + '">＋</button></div>' +
          '<div style="width:84px;text-align:right;color:#dc2626;font-weight:600">¥' + UI.money(price * it.qty) + '</div>' +
          '<button class="btn sm" data-act="cDel" data-id="' + it.p.id + '">删除</button></div>';
      }).join('');
      total += sum;
      const name = k === 'PLATFORM' ? '👑 宠采通平台自营' : UI.esc((S().suppliers.find(x => x.id === k) || {}).name || '');
      const freeShip = sum >= 1000;
      return '<div class="card cart-grp"><div class="gh">' + name + (freeShip ? '<span class="tag green">已免运费</span>' : '<span class="tag orange">差 ¥' + UI.money(1000 - sum) + ' 免运费</span>') +
        '<span class="right muted">小计 ¥' + UI.money(sum) + '</span></div>' + rows + '</div>';
    }).join('');
    return html +
      '<div class="card"><div class="card-bd">' +
      '<div class="between"><span class="muted">合计（不含运费）：</span><span style="color:#dc2626;font-size:20px;font-weight:800">¥' + UI.money(total) + '</span></div>' +
      (saved > 0 ? '<div class="small" style="color:#15803d">阶梯价已为你节省 ¥' + UI.money(saved) + '</div>' : '') +
      '<div class="small muted mt8">结算时按供应商自动拆单，单店满 ¥1,000 免运费</div>' +
      '</div></div>';
  }
  function refreshCart() {
    UI.setDrawerBody(cartHtml());
    App.refreshFab();
  }
  Act.register('openCart', () => {
    UI.drawer({
      title: '购物车',
      body: cartHtml(),
      footer: '<button class="btn" data-act="cClear">清空</button>' +
        '<button class="btn" data-act="closeDrawer">关闭</button>' +
        '<button class="btn warn" data-act="cartCheckout">去结算</button>'
    });
  });
  Act.register('cartCheckout', () => {
    if (!S().cart.length) { UI.toast('购物车是空的', 'err'); return; }
    if (!certified()) { UI.closeDrawer(); UI.toast('请先完成资质认证', 'err'); App.go('retailer', 'cert'); return; }
    UI.closeDrawer(); App.go('retailer', 'checkout');
  });
  Act.register('cMinus', el => { const id = el.getAttribute('data-id'); const c = S().cart.find(x => x.pid === id); B.cartSet(id, (c ? c.qty : 1) - 1); refreshCart(); });
  Act.register('cPlus', el => { const id = el.getAttribute('data-id'); const c = S().cart.find(x => x.pid === id); B.cartSet(id, (c ? c.qty : 0) + 1); refreshCart(); });
  Act.register('cQty', el => { B.cartSet(el.getAttribute('data-id'), Number(el.value) || 1); refreshCart(); });
  Act.register('cDel', el => { B.cartSet(el.getAttribute('data-id'), 0); UI.toast('已移出购物车'); refreshCart(); });
  Act.register('cClear', () => { B.cartClear(); refreshCart(); });

  /* ============ 确认订单 ============ */
  V['retailer/checkout'] = function () {
    const s = S(), c = s.cart;
    if (!c.length) return '<div class="page-head"><h2>确认订单</h2></div><div class="card">' + UI.empty('请先添加商品到购物车', '🛒') + '</div>';
    if (!certified()) return '<div class="page-head"><h2>确认订单</h2></div><div class="card"><div class="card-bd">' + UI.empty('资质未认证，无法下单') + '<div style="text-align:center"><button class="btn pri" data-act="go" data-page="cert">去认证</button></div></div></div>';
    const groups = {};
    c.forEach(x => { const p = B.product(x.pid); if (!p) return; const k = p.supplierId; (groups[k] = groups[k] || []).push({ p, qty: x.qty }); });
    let total = 0, freight = 0;
    const html = Object.keys(groups).map(k => {
      let sum = 0;
      const rows = groups[k].map(it => {
        const price = B.tierPrice(it.p, it.qty); sum += price * it.qty;
        return '<div class="ci"><div class="p">' + it.p.e + '</div><div class="n"><div class="t">' + UI.esc(it.p.name) + '</div><div class="s">' + it.p.spec + '</div></div>' +
          '<div class="muted small">¥' + UI.money(price) + ' × ' + it.qty + it.p.unit + '</div></div>';
      }).join('');
      const fr = sum >= 1000 ? 0 : 20; freight += fr; total += sum;
      const name = k === 'PLATFORM' ? '👑 宠采通平台自营' : UI.esc((s.suppliers.find(x => x.id === k) || {}).name || '');
      return '<div class="card cart-grp"><div class="gh">' + name + '<span class="tag blue">' + (k === 'PLATFORM' ? '24 小时发货' : '48 小时发货') + '</span>' +
        '<span class="right muted">运费 ¥' + fr + '　小计 ¥' + UI.money(sum + fr) + '</span></div>' + rows +
        '<div style="padding:10px 14px" class="small"><label>买家备注</label><input class="inp" placeholder="如：请工作日送达 / 需开发票" data-checkout-remark="' + k + '"></div></div>';
    }).join('');
    return '<div class="page-head"><h2>确认订单</h2><span class="crumb">按供应商拆单结算</span></div>' +
      html +
      '<div class="card"><div class="card-hd"><h3>收货地址</h3><div class="right"><button class="btn sm" data-act="go" data-page="cert">管理地址</button></div></div><div class="card-bd">' +
      s.addresses.map(a => '<label class="chk" style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;border:1px solid ' + (a.def ? '#2563eb' : '#e5e7eb') + ';border-radius:8px;padding:10px;background:' + (a.def ? '#eff6ff' : '#fff') + '">' +
        '<input type="radio" name="addr" value="' + a.id + '" ' + (a.def ? 'checked' : '') + ' data-change="ckAddr">' +
        '<span><b>' + UI.esc(a.name) + '</b> ' + UI.esc(a.phone) + '<div class="small muted">' + UI.esc(a.addr) + '</div></span></label>').join('') +
      '</div></div>' +
      '<div class="card"><div class="card-hd"><h3>支付方式</h3><span class="sub">支付超时 30 分钟将自动关闭订单</span></div><div class="card-bd">' +
      '<div class="pay-methods">' +
      [['💚', '微信支付', '推荐，扫码即时到账'], ['💙', '支付宝', '支持花呗与余额'], ['🏦', '对公转账', '需上传打款凭证'], ['💳', '银行卡', '储蓄卡/信用卡']]
        .map((m, i) => '<div class="pm' + (i === 0 ? ' on' : '') + '" data-act="ckPay" data-pay="' + m[1] + '"><span class="e">' + m[0] + '</span><div><div class="t">' + m[1] + '</div><div class="d">' + m[2] + '</div></div></div>').join('') +
      '</div></div></div>' +
      '<div class="card"><div class="card-bd between">' +
      '<div><span class="muted">应付总额：</span><span style="color:#dc2626;font-size:24px;font-weight:800">¥' + UI.money(total + freight) + '</span>' +
      '<div class="small muted">商品 ¥' + UI.money(total) + '　运费 ¥' + freight + '</div></div>' +
      '<button class="btn warn lg" data-act="submitOrder">提交订单并支付</button></div></div>';
  };
  Act.register('ckAddr', el => { S().addresses.forEach(a => a.def = a.id === el.value ? 1 : 0); Store.save(); App.render(); });
  Act.register('ckPay', el => {
    document.querySelectorAll('.pm').forEach(x => x.classList.remove('on'));
    el.classList.add('on'); window.__payType = el.getAttribute('data-pay');
  });
  Act.register('submitOrder', () => {
    const s = S();
    const addr = s.addresses.find(a => a.def) || s.addresses[0];
    const pay = window.__payType || '微信支付';
    const remarks = {};
    document.querySelectorAll('[data-checkout-remark]').forEach(i => remarks[i.getAttribute('data-checkout-remark')] = i.value);
    const created = B.placeOrder(addr.id, pay, remarks[Object.keys(remarks)[0]] || '');
    Store.save(); App.refreshFab();
    App.go('retailer', 'orders');
    setTimeout(() => {
      Act.run('openPay', created[0].id);
      if (created.length > 1) UI.toast('订单已按供应商拆分为 ' + created.length + ' 单，请在订单列表逐单完成支付');
    }, 60);
  });

  /* ============ 收银台 ============ */
  Act.register('openPay', el => {
    const id = typeof el === 'string' ? el : el.getAttribute('data-id');
    const o = B.order(id); if (!o) return;
    UI.modal({
      title: '收银台',
      body: '<div style="text-align:center;padding:6px 0 14px"><div class="muted small">订单号 ' + o.no + '</div>' +
        '<div style="font-size:30px;font-weight:800;color:#dc2626">¥' + UI.money(o.pay) + '</div>' +
        '<div class="muted small">支付方式：' + o.payType + '　请在 30 分钟内完成支付</div></div>' +
        '<div class="pay-methods">' +
        [['💚', '微信支付', '扫码支付'], ['💙', '支付宝', '账户余额 ¥12,800'], ['🏦', '对公转账', '需上传凭证']]
          .map((m, i) => '<div class="pm' + (i === 0 ? ' on' : '') + '" data-act="ckPay2" data-pay="' + m[1] + '"><span class="e">' + m[0] + '</span><div><div class="t">' + m[1] + '</div><div class="d">' + m[2] + '</div></div></div>').join('') +
        '</div>' +
        '<div class="note small mt12">演示环境：点击「确认支付」将模拟支付成功，订单进入待接单/待发货状态，并同步到供应商后台。</div>',
      footer: '<button class="btn" data-act="closeModal">稍后支付</button><button class="btn pri" data-act="payOk" data-id="' + o.id + '">确认支付 ¥' + UI.money(o.pay) + '</button>'
    });
  });
  Act.register('ckPay2', el => { document.querySelectorAll('.pm').forEach(x => x.classList.remove('on')); el.classList.add('on'); window.__payType2 = el.getAttribute('data-pay'); });
  Act.register('payOk', el => {
    const id = el.getAttribute('data-id');
    B.payOrder(id, window.__payType2 || window.__payType || '微信支付');
    UI.closeModal();
    UI.modal({
      title: '支付成功', body: '<div style="text-align:center;padding:14px 0"><div style="font-size:44px">✅</div>' +
        '<div style="font-size:16px;font-weight:700;margin-top:6px">支付成功，等待商家发货</div>' +
        '<div class="muted small mt8">订单已进入供应商后台，可在「物流查询」中跟踪配送进度</div></div>',
      footer: '<button class="btn" data-act="closeModal">继续采购</button><button class="btn pri" data-act="goOrders">查看订单</button>'
    });
    App.render();
  });
  Act.register('goOrders', () => { UI.closeModal(); App.go('retailer', 'orders'); });

  /* ============ 我的订单 ============ */
  const O_STS = ['', '待付款', '待接单', '待发货', '已发货', '已完成', '退款中', '已关闭'];
  V['retailer/orders'] = function () {
    const os = myOrders(), f = window.__roFilter || '', kw = window.__roKw || '', range = window.__roRange || '';
    let list = os;
    if (f) list = list.filter(o => o.status === f);
    if (kw) list = list.filter(o => o.no.indexOf(kw) >= 0 || o.items.some(i => i.name.indexOf(kw) >= 0));
    if (range === '7') list = list.filter(o => o.createdAt >= U.day(-7));
    else if (range === '30') list = list.filter(o => o.createdAt >= U.day(-30));
    const cnt = st => st ? os.filter(o => o.status === st).length : os.length;
    return '<div class="page-head"><h2>我的订单</h2><span class="crumb">共 ' + os.length + ' 笔，当前筛选 ' + list.length + ' 笔</span></div>' +
      '<div class="filters">' +
      '<div class="seg">' + O_STS.map(x => '<button class="' + (f === x ? 'on' : '') + '" data-act="roFilter" data-st="' + x + '">' + (x || '全部') + '(' + cnt(x) + ')</button>').join('') + '</div>' +
      '<input class="inp" id="roKw" placeholder="搜索订单号 / 商品名" value="' + UI.esc(kw) + '"><button class="btn" data-act="roSearch">搜索</button>' +
      '<select class="inp" data-change="roRange"><option value="">全部时间</option><option value="7"' + (range === '7' ? ' selected' : '') + '>近 7 天</option><option value="30"' + (range === '30' ? ' selected' : '') + '>近 30 天</option></select>' +
      (f || kw || range ? '<button class="btn sm" data-act="roReset">清空筛选</button>' : '') +
      '</div>' +
      (list.length ? list.map((o, idx) =>
        '<div class="card"><div class="gh card-hd"><span class="tag ' + (o.supplierId === 'PLATFORM' ? 'self' : 'gray') + '">' + (o.supplierId === 'PLATFORM' ? '👑 平台自营' : '供应商直发') + '</span>' +
        '<b>' + o.no + '</b><span class="muted small">' + o.createdAt + '</span><span class="right">' + UI.tag(o.status) + '</span></div>' +
        '<div class="card-bd tight">' + o.items.map(i =>
          '<div class="ci"><div class="p">' + i.e + '</div><div class="n"><div class="t">' + UI.esc(i.name) + '</div><div class="s">' + i.spec + '</div></div>' +
          '<div class="muted small">¥' + UI.money(i.price) + ' ×' + i.qty + i.unit + '</div></div>').join('') +
        '<div class="between" style="padding:10px 14px;border-top:1px solid #f1f3f7">' +
        '<div class="small muted">共 ' + o.items.reduce((a, b) => a + b.qty, 0) + ' 件　实付 <b style="color:#dc2626;font-size:16px">¥' + UI.money(o.pay) + '</b>　' + o.payType +
        (o.ship ? '　' + o.ship.company + ' ' + o.ship.no : '') + '</div>' +
        '<div>' +
        (o.status === '待付款' ? '<button class="btn sm warn" data-act="openPay" data-id="' + o.id + '">立即支付</button> ' : '') +
        (o.status === '待付款' ? '<button class="btn sm" data-act="rCancel" data-id="' + o.id + '">取消订单</button> ' : '') +
        (o.ship ? '<button class="btn sm" data-act="rToLogistics" data-id="' + o.id + '">查看物流</button> ' : '') +
        (o.status === '已发货' ? '<button class="btn sm pri" data-act="rReceive" data-id="' + o.id + '">确认收货</button> ' : '') +
        (['已发货', '已完成'].indexOf(o.status) >= 0 ? '<button class="btn sm" data-act="rAfterSale" data-id="' + o.id + '">申请售后</button> ' : '') +
        (['已完成', '已关闭'].indexOf(o.status) >= 0 ? '<button class="btn sm" data-act="rBuyAgain" data-id="' + o.id + '">再来一单</button> ' : '') +
        (['已完成', '已关闭'].indexOf(o.status) >= 0 ? '<button class="btn sm danger" data-act="rOrderDel" data-id="' + o.id + '">删除</button> ' : '') +
        '<button class="btn sm" data-act="rOrderDetail" data-id="' + o.id + '">订单详情</button>' +
        '</div></div></div></div>').join('')
        : '<div class="card">' + UI.empty('暂无符合条件的订单', '🧾') + '</div>');
  };
  Act.register('roFilter', el => { window.__roFilter = el.getAttribute('data-st'); App.render(); });
  Act.register('roSearch', () => { window.__roKw = (document.getElementById('roKw') || {}).value || ''; App.render(); });
  Act.register('roRange', el => { window.__roRange = el.value; App.render(); });
  Act.register('roReset', () => { window.__roFilter = ''; window.__roKw = ''; window.__roRange = ''; App.render(); });
  Act.register('rToLogistics', el => { window.__lgId = el.getAttribute('data-id'); App.go('retailer', 'logistics'); });
  Act.register('rCancel', el => {
    const id = el.getAttribute('data-id'), o = B.order(id);
    UI.confirm('取消订单', '取消后订单将关闭，已支付的金额将原路退回。确定取消订单 <b>' + o.no + '</b> 吗？', '确认取消', () => {
      B.closeOrder(id); UI.toast('订单已取消'); App.render();
    });
  });
  Act.register('rOrderDel', el => {
    const id = el.getAttribute('data-id'), o = B.order(id);
    UI.confirm('删除订单', '删除后订单不再显示在列表中（仅可删除已完成/已关闭订单）。', '确认删除', () => {
      S().orders = S().orders.filter(x => x.id !== id); Store.save(); UI.toast('订单已删除'); App.render();
    });
  });
  Act.register('rBuyAgain', el => {
    const o = B.order(el.getAttribute('data-id'));
    o.items.forEach(i => { const p = B.product(i.pid); if (p && p.status === 'onSale') B.cartAdd(i.pid, Math.max(i.qty, p.moq)); });
    App.refreshFab();
    UI.drawer({
      title: '已加入购物车', body: cartHtml(),
      footer: '<button class="btn" data-act="closeDrawer">继续逛逛</button><button class="btn warn" data-act="cartCheckout">去结算</button>'
    });
  });
  Act.register('rReceive', el => {
    const id = el.getAttribute('data-id');
    UI.confirm('确认收货', '确认后订单完成，供应商将在 T+7 后收到结算款。请确认已收到商品并验收无误。', '确认收货', () => {
      B.receiveOrder(id); UI.toast('已确认收货，交易完成', 'ok'); App.render();
    });
  });
  Act.register('rOrderDetail', el => {
    const o = B.order(el.getAttribute('data-id'));
    UI.modal({
      wide: true, title: '订单详情 · ' + o.no,
      body: '<div class="row"><div style="flex:1.3;min-width:280px">' +
        '<div class="small mb8">收货信息：' + UI.esc(o.addr.name) + ' ' + UI.esc(o.addr.phone) + '　' + UI.esc(o.addr.addr) + '</div>' +
        '<div class="small mb8">供应商：' + UI.esc(o.supplierName) + '　下单时间：' + o.createdAt + '　备注：' + UI.esc(o.remark || '无') + '</div>' +
        o.items.map(i => '<div class="ci" style="border:1px solid #eef1f6;border-radius:8px;margin-bottom:8px"><div class="p">' + i.e + '</div>' +
          '<div class="n"><div class="t">' + UI.esc(i.name) + '</div><div class="s">' + i.spec + '　¥' + UI.money(i.price) + ' × ' + i.qty + i.unit + '</div></div>' +
          '<div style="color:#dc2626;font-weight:600">¥' + UI.money(i.price * i.qty) + '</div></div>').join('') +
        '<div class="small" style="text-align:right">商品 ¥' + UI.money(o.goods) + '　运费 ¥' + o.freight + '　优惠 -¥' + o.discount + '　<b>实付 ¥' + UI.money(o.pay) + '</b></div>' +
        (function () {
          const ref = refundOfOrder(o);
          return ref ? '<div class="note small mt8">本单售后：<b>' + ref.no + '</b>　' + UI.asTag(ref.status) +
            '　退款 ¥' + UI.money(ref.amount) + '<button class="btn sm" style="margin-left:8px" data-act="rAsView" data-id="' + ref.id + '">查看售后进度</button></div>' : '';
        })() +
        '</div><div style="flex:1;min-width:250px">' +
        '<div class="small mb8">' + (o.ship ? '<b>' + o.ship.company + '</b>　运单号：' + o.ship.no : '尚未发货') + '</div>' +
        UI.timeline(o.ship ? o.ship.tracks : []) + '</div></div>',
      footer: '<button class="btn" data-act="closeModal">关闭</button>' +
        (o.status === '待付款' ? '<button class="btn warn" data-act="openPay" data-id="' + o.id + '">立即支付</button>' : '') +
        (o.status === '已发货' ? '<button class="btn pri" data-act="rReceive" data-id="' + o.id + '">确认收货</button>' : '') +
        (['已发货', '已完成'].indexOf(o.status) >= 0 ? '<button class="btn danger" data-act="rAfterSale" data-id="' + o.id + '">申请售后</button>' : '')
    });
  });
  Act.register('rAfterSale', el => {
    const o = B.order(el.getAttribute('data-id'));
    UI.modal({
      title: '申请售后 · ' + o.no,
      body: '<div class="fld"><label>选择商品</label><select class="inp" id="afItem" data-change="afCalc">' +
        o.items.map((i, n) => '<option value="' + n + '">' + UI.esc(i.name) + '（×' + i.qty + i.unit + '）</option>').join('') + '</select></div>' +
        '<div class="fld"><label>售后类型</label><select class="inp" id="afType"><option>退货退款</option><option>仅退款</option><option>换货</option></select></div>' +
        '<div class="fgrid"><div class="fld"><label>退款数量</label><input class="inp" id="afQty" value="' + o.items[0].qty + '" data-change="afCalc"></div>' +
        '<div class="fld"><label>退款金额（元）</label><input class="inp" id="afAmt" value="' + Math.round(o.items[0].price * o.items[0].qty * 100) / 100 + '"></div></div>' +
        '<div class="fld"><label>原因 <span class="req">*</span></label><select class="inp" id="afReason"><option>到货临期（保质期不足）</option><option>外包装破损 / 商品受潮结块</option><option>错发 / 少发</option><option>商品质量问题（胀袋/异味）</option><option>保健/处方类商品运输异常</option><option>不想要了</option></select></div>' +
        '<div class="fld"><label>问题描述</label><textarea class="inp" id="afDesc" placeholder="请描述具体情况"></textarea></div>' +
        '<div class="fld"><label>凭证图片</label><div class="upl" data-act="fakeUpload" data-tag="售后凭证">＋ 上传照片（最多 5 张）</div></div>' +
        '<div class="note small">提交后供应商需在 48 小时内处理，超时可申请平台介入。</div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="afSubmit" data-id="' + o.id + '">提交申请</button>'
    });
  });
  Act.register('afCalc', () => {
    const o = B.order((document.querySelector('[data-act="afSubmit"]') || {}).getAttribute('data-id'));
    if (!o) return;
    const n = Number((document.getElementById('afItem') || {}).value) || 0, it = o.items[n] || o.items[0];
    const q = Number((document.getElementById('afQty') || {}).value);
    const amt = document.getElementById('afAmt');
    if (amt && q > 0) amt.value = Math.round(it.price * Math.min(q, it.qty) * 100) / 100;
  });
  Act.register('afSubmit', el => {
    const o = B.order(el.getAttribute('data-id'));
    const n = Number((document.getElementById('afItem') || {}).value) || 0;
    const it = o.items[n];
    const r = B.addRefund({
      orderNo: o.no, orderId: o.id, retailer: o.retailer, supplierId: o.supplierId, supplierName: o.supplierName,
      pid: it.pid, name: it.name, e: it.e, qty: Number((document.getElementById('afQty') || {}).value) || it.qty,
      amount: Number((document.getElementById('afAmt') || {}).value) || it.price * it.qty,
      type: (document.getElementById('afType') || {}).value, reason: (document.getElementById('afReason') || {}).value, imgs: 2
    });
    UI.closeModal();
    UI.toast('售后申请已提交：' + r.no + '，进度可在「我的订单 → 订单详情」查看', 'ok');
    App.go('retailer', 'orders');
    App.render();
    setTimeout(() => Act.run('rAsView', { getAttribute: () => r.id }), 120);
  });

  /* ============ 物流查询 ============ */
  V['retailer/logistics'] = function () {
    const os = myOrders().filter(o => o.ship).sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    const cur = window.__lgId || (os[0] ? os[0].id : '');
    const o = os.find(x => x.id === cur);
    const last = o ? o.ship.tracks[o.ship.tracks.length - 1] : null;
    return '<div class="page-head"><h2>物流查询</h2><span class="crumb">已发货订单 ' + os.length + ' 笔</span></div>' +
      '<div class="card"><div class="card-bd"><div class="row" style="align-items:center">' +
      '<input class="inp" style="max-width:300px" id="lgNo" placeholder="输入订单号或运单号查询"><button class="btn" data-act="lgSearch">查询</button>' +
      '<span class="muted small">支持订单号（YC…）与运单号（DPK/JD/ZTO…）</span></div></div></div>' +
      '<div class="row">' +
      '<div class="card" style="flex:0 0 300px;min-width:260px"><div class="card-hd"><h3>在途订单</h3></div><div class="card-bd tight">' +
      (os.length ? os.map(x => '<div class="ci" style="cursor:pointer;background:' + (x.id === cur ? '#eff6ff' : '#fff') + '" data-act="lgPick" data-id="' + x.id + '">' +
        '<div class="p">🚚</div><div class="n"><div class="t small">' + x.no + '</div><div class="s">' + x.ship.company + ' ' + x.ship.no + '</div></div>' +
        UI.tag(x.status) + '</div>').join('') : '<div class="card-bd">' + UI.empty('暂无在途订单，下单发货后可在此查询', '📦') + '</div>') +
      '</div></div>' +
      '<div class="card" style="flex:1;min-width:340px"><div class="card-hd"><h3>物流轨迹</h3>' +
      (o ? '<div class="right"><button class="btn sm" data-act="lgRefresh" data-id="' + o.id + '">🔄 刷新轨迹</button></div>' : '') + '</div>' +
      '<div class="card-bd">' + (o ?
        '<div class="lg-head">' +
        '<div class="lg-item"><div class="k">承运商</div><div class="v">' + o.ship.company + '</div></div>' +
        '<div class="lg-item"><div class="k">运单号</div><div class="v">' + o.ship.no + ' <button class="btn sm" data-act="lgCopy" data-no="' + o.ship.no + '">复制</button></div></div>' +
        '<div class="lg-item"><div class="k">发货时间</div><div class="v">' + o.ship.at + '</div></div>' +
        '<div class="lg-item"><div class="k">当前状态</div><div class="v">' + UI.tag(o.status) + '　' + UI.esc(last ? last.n : '') + '</div></div>' +
        '</div>' +
        '<div class="small muted mb8">收货地址：' + UI.esc(o.addr.name) + ' ' + UI.esc(o.addr.phone) + '　' + UI.esc(o.addr.addr) + '</div>' +
        '<div class="small muted mb8">包裹商品：' + o.items.map(i => i.e + ' ' + UI.esc(i.name.slice(0, 12)) + '… ×' + i.qty + i.unit).join('　') + '</div>' +
        UI.timeline(o.ship.tracks) +
        '<div class="row mt12">' +
        '<button class="btn sm" data-act="rOrderDetail" data-id="' + o.id + '">订单详情</button>' +
        '<button class="btn sm" data-act="lgCarrier" data-id="' + o.id + '">联系承运商</button>' +
        '<button class="btn sm danger" data-act="lgAbnormal" data-id="' + o.id + '">物流异常上报</button>' +
        (o.status === '已发货' ? '<button class="btn sm pri" data-act="rReceive" data-id="' + o.id + '">确认收货</button>' : '') +
        '</div>'
        : UI.empty('请选择一个订单查看物流轨迹')) +
      '</div></div></div>';
  };
  Act.register('lgPick', el => { window.__lgId = el.getAttribute('data-id'); App.render(); });
  Act.register('lgSearch', () => {
    const v = ((document.getElementById('lgNo') || {}).value || '').trim();
    if (!v) { UI.toast('请输入订单号或运单号', 'err'); return; }
    const o = myOrders().find(x => x.no === v || (x.ship && x.ship.no === v));
    if (o && o.ship) { window.__lgId = o.id; App.render(); UI.toast('已查询到物流信息', 'ok'); }
    else UI.toast('未查询到该单号的物流信息', 'err');
  });
  Act.register('lgRefresh', el => {
    const id = el.getAttribute('data-id');
    B.refreshTrack(id); App.render(); UI.toast('已向承运商同步最新节点', 'ok');
  });
  Act.register('lgCopy', el => {
    const no = el.getAttribute('data-no');
    try { navigator.clipboard.writeText(no); } catch (e) { }
    UI.toast('运单号已复制：' + no, 'ok');
  });
  Act.register('lgCarrier', el => {
    const o = B.order(el.getAttribute('data-id'));
    UI.modal({
      title: '联系承运商 · ' + o.ship.company,
      body: '<dl class="kv"><dt>运单号</dt><dd>' + o.ship.no + '</dd><dt>客服电话</dt><dd>95353（' + o.ship.company + '）</dd>' +
        '<dt>服务时间</dt><dd>08:00 - 20:00</dd><dt>订单号</dt><dd>' + o.no + '</dd></dl>' +
        '<div class="note small">演示环境：实际将唤起在线客服或电话拨号。如需平台协助可点击「物流异常上报」。</div>',
      footer: '<button class="btn" data-act="closeModal">关闭</button><button class="btn pri" data-act="lgAbnormal" data-id="' + o.id + '">转为异常上报</button>'
    });
  });
  Act.register('lgAbnormal', el => {
    const id = el.getAttribute('data-id'), o = B.order(id);
    UI.modal({
      title: '物流异常上报',
      body: '<div class="fld"><label>异常类型 <span class="req">*</span></label><select class="inp" id="abT">' +
        '<option>轨迹长时间未更新</option><option>派送超时 / 滞留</option><option>包裹破损</option><option>少件 / 错件</option><option>地址无法送达</option></select></div>' +
        '<div class="fld"><label>补充说明</label><textarea class="inp" id="abD" placeholder="请描述异常情况，便于平台与承运商核实"></textarea></div>' +
        '<div class="fld"><label>凭证</label><div class="upl" data-act="fakeUpload" data-tag="异常凭证">＋ 上传照片</div></div>' +
        '<div class="note small">提交后平台将在 2 小时内响应，并同步至客服工单。</div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="abOk" data-id="' + id + '">提交上报</button>'
    });
    window.__abOrder = o.no;
  });
  Act.register('abOk', el => {
    const t = (document.getElementById('abT') || {}).value, d = (document.getElementById('abD') || {}).value;
    B.addTicket({
      type: '物流咨询', from: '零售商 · ' + S().retailerAuth.name,
      orderNo: (B.order(el.getAttribute('data-id')) || {}).no || '', title: '物流异常：' + t,
      level: '中', msgs: [{ me: false, t: d || t, at: U.now() }]
    });
    UI.closeModal(); UI.toast('异常已上报，平台将在 2 小时内响应', 'ok'); App.render();
  });

  /* ============ 售后申请与进度（入口收敛在「我的订单」） ============ */
  function refundOfOrder(o) {
    const rs = S().refunds.filter(r => r.orderNo === o.no);
    return rs.length ? rs[rs.length - 1] : null;
  }
  Act.register('rAsView', el => {
    const r = S().refunds.find(x => x.id === el.getAttribute('data-id'));
    if (!r) { UI.toast('未找到该售后单', 'err'); return; }
    const canUrge = r.status === '待供应商处理';
    const canReturn = r.status === '待买家退货';
    const canIntervene = ['已拒绝', '待供应商处理', '待卖家收货'].indexOf(r.status) >= 0;
    const canCancel = ['待供应商处理', '待买家退货'].indexOf(r.status) >= 0;
    UI.modal({
      title: '售后进度 · ' + r.no,
      body: '<dl class="kv"><dt>关联订单</dt><dd>' + r.orderNo + '</dd><dt>商品</dt><dd>' + r.e + ' ' + UI.esc(r.name) + ' ×' + r.qty + '</dd>' +
        '<dt>类型</dt><dd>' + r.type + '</dd><dt>退款金额</dt><dd>¥' + UI.money(r.amount) + '</dd><dt>原因</dt><dd>' + UI.esc(r.reason) + '</dd>' +
        '<dt>当前状态</dt><dd>' + UI.asTag(r.status) + '</dd><dt>处理时限</dt><dd>' + r.dueAt + '</dd>' +
        (r.urged ? '<dt>催办记录</dt><dd>已催办 ' + r.urged + ' 次</dd>' : '') +
        (r.return ? '<dt>退货物流</dt><dd>' + r.return.company + ' ' + r.return.no + '</dd>' : '') + '</dl>' +
        '<div class="card-hd" style="padding-left:0"><h3>处理进度</h3></div>' +
        (r.logs && r.logs.length ? UI.timeline(r.logs.map(l => ({ n: l.n, t: l.t, l: l.by }))) : '<div class="muted small">暂无进度记录</div>') +
        '<div class="note small">售后时效：签收后 7 天内可申请；供应商 48 小时内响应，超时可申请平台介入（平台 72 小时内仲裁）。</div>',
      footer: '<button class="btn" data-act="closeModal">关闭</button>' +
        (canUrge ? '<button class="btn" data-act="asUrge" data-id="' + r.id + '">催办</button>' : '') +
        (canReturn ? '<button class="btn pri" data-act="asReturnShip" data-id="' + r.id + '">填写退货物流</button>' : '') +
        (canIntervene ? '<button class="btn warn" data-act="asIntervene" data-id="' + r.id + '">申请平台介入</button>' : '') +
        (canCancel ? '<button class="btn danger" data-act="asCancel" data-id="' + r.id + '">撤销售后</button>' : '')
    });
  });
  Act.register('asUrge', el => {
    B.urgeRefund(el.getAttribute('data-id'));
    UI.closeModal(); UI.toast('已提醒供应商尽快处理', 'ok'); App.render();
  });
  Act.register('asCancel', el => {
    const id = el.getAttribute('data-id');
    UI.confirm('撤销售后申请', '撤销后该售后单关闭，如需继续请重新发起申请。', '确认撤销', () => {
      B.cancelRefund(id); UI.closeModal(); UI.toast('售后申请已撤销'); App.render();
    });
  });
  Act.register('asReturnShip', el => {
    const id = el.getAttribute('data-id');
    UI.modal({
      title: '填写退货物流',
      body: '<div class="warn small mb8">请在 7 天内寄回商品并填写物流单号，逾期售后单将自动关闭。</div>' +
        '<div class="fgrid"><div class="fld"><label>承运商 <span class="req">*</span></label><select class="inp" id="rsCo"><option>德邦物流</option><option>京东物流</option><option>中通快运</option><option>顺丰速运</option></select></div>' +
        '<div class="fld"><label>运单号 <span class="req">*</span></label><input class="inp" id="rsNo" placeholder="DPK20261102xxxx"></div></div>' +
        '<div class="fld"><label>寄回说明</label><textarea class="inp" id="rsD" placeholder="如：原包装寄回，含赠品"></textarea></div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="rsOk" data-id="' + id + '">提交</button>'
    });
  });
  Act.register('rsOk', el => {
    const no = (document.getElementById('rsNo') || {}).value;
    if (!no) { UI.toast('请填写退货运单号', 'err'); return; }
    B.returnShip(el.getAttribute('data-id'), (document.getElementById('rsCo') || {}).value, no);
    UI.closeModal(); UI.toast('退货物流已提交，等待供应商签收', 'ok'); App.render();
  });
  Act.register('asIntervene', el => {
    const r = S().refunds.find(x => x.id === el.getAttribute('data-id'));
    r.status = '平台介入中';
    (r.logs = r.logs || []).push({ t: U.now(), n: '零售商申请平台介入', by: '系统' });
    Store.save();
    S().tickets.unshift({
      id: 'T' + Date.now(), no: 'TK' + String(Date.now()).slice(-8), type: '售后投诉',
      from: '零售商 · ' + S().retailerAuth.name, orderNo: r.orderNo, title: '申请平台介入：' + r.reason,
      level: '高', status: '待处理', owner: '', at: U.now(),
      msgs: [{ me: false, t: '供应商未处理/拒绝了我的售后申请，申请平台介入。', at: U.now() }]
    });
    Store.save(); UI.closeModal(); UI.toast('已提交平台介入，工单已生成，平台将在 72 小时内仲裁', 'ok'); App.render();
  });

  /* ============ 资质认证 ============ */
  function certDef() {
    const a = S().retailerAuth;
    return Object.assign({
      name: a.name, type: '企业', code: '91310100MA2GGGG1X',
      addr: '上海市闵行区建国路 128 号 1 层', contact: '王建国', phone: '13900001234',
      storeType: '宠物店', area: '80㎡', years: '3 年'
    }, a.type ? a : {});
  }
  V['retailer/cert'] = function () {
    const a = S().retailerAuth, ok = a.status === 'approved';
    const editing = window.__certEdit || !ok;
    const d = certDef();
    const form =
      '<div class="card"><div class="card-hd"><h3>' + (ok ? '变更认证资料' : '提交门店资质') + '</h3>' +
      (ok ? '<div class="right"><button class="btn sm" data-act="certCancel">取消变更</button></div>' : '') + '</div><div class="card-bd">' +
      '<div class="fgrid">' +
      '<div class="fld"><label>门店/主体名称 <span class="req">*</span></label><input class="inp" id="cName" value="' + UI.esc(d.name) + '"></div>' +
      '<div class="fld"><label>主体类型</label><select class="inp" id="cType"><option' + (d.type === '企业' ? ' selected' : '') + '>企业</option><option' + (d.type === '个体工商户' ? ' selected' : '') + '>个体工商户</option></select></div>' +
      '<div class="fld"><label>统一社会信用代码 / 身份证号 <span class="req">*</span></label><input class="inp" id="cCode" value="' + UI.esc(d.code) + '"></div>' +
      '<div class="fld"><label>门店类型</label><select class="inp" id="cStore"><option>宠物店</option><option>宠物医院</option><option>商超宠物专区</option><option>线上电商</option></select></div>' +
      '<div class="fld"><label>门店地址 <span class="req">*</span></label><input class="inp" id="cAddr" value="' + UI.esc(d.addr) + '"></div>' +
      '<div class="fld"><label>营业面积 / 经营年限</label><input class="inp" id="cArea" value="' + UI.esc(d.area) + ' / ' + UI.esc(d.years) + '"></div>' +
      '<div class="fld"><label>联系人 <span class="req">*</span></label><input class="inp" id="cContact" value="' + UI.esc(d.contact) + '"></div>' +
      '<div class="fld"><label>联系电话 <span class="req">*</span></label><input class="inp" id="cPhone" value="' + UI.esc(d.phone) + '"></div>' +
      '</div>' +
      '<div class="fld"><label>资质材料 <span class="req">*</span></label><div class="row">' +
      '<div class="upl" style="flex:1" data-act="fakeUpload" data-tag="营业执照">＋ 营业执照</div>' +
      '<div class="upl" style="flex:1" data-act="fakeUpload" data-tag="门头照片">＋ 门店门头照片</div>' +
      '<div class="upl" style="flex:1" data-act="fakeUpload" data-tag="店内陈列">＋ 店内陈列照片</div>' +
      '<div class="upl" style="flex:1" data-act="fakeUpload" data-tag="法人身份证">＋ 法人身份证</div></div>' +
      '<div class="small muted mt8">宠物医院需额外上传《动物诊疗许可证》；经营范围含兽药需上传《兽药经营许可证》。</div></div>' +
      '<label class="chk"><input type="checkbox" checked> 我承诺所提交材料真实有效，遵守《平台零售商入驻协议》</label>' +
      '<div class="mt12"><button class="btn pri" data-act="certSubmit">' + (ok ? '提交变更并重新审核' : '提交认证申请') + '</button></div>' +
      '</div></div>';

    const info =
      '<div class="card"><div class="card-hd"><h3>认证信息</h3><div class="right">' +
      '<button class="btn sm" data-act="certEdit">变更资料 / 重新认证</button></div></div><div class="card-bd">' +
      '<dl class="kv"><dt>主体名称</dt><dd>' + UI.esc(a.name) + '</dd><dt>主体类型</dt><dd>' + UI.esc(d.type) + '</dd>' +
      '<dt>统一社会信用代码</dt><dd>' + UI.esc(d.code) + '</dd><dt>门店类型</dt><dd>' + UI.esc(d.storeType) + '</dd>' +
      '<dt>门店地址</dt><dd>' + UI.esc(d.addr) + '</dd><dt>联系人</dt><dd>' + UI.esc(d.contact) + ' ' + UI.esc(d.phone) + '</dd>' +
      '</dl>' +
      '<div class="note small">认证通过后可查看拿货价、下单采购、申请售后与开票。</div>' +
      '</div></div>';

    const pendingCard = '<div class="card"><div class="card-bd">' +
      '<div class="between"><div><b>资质审核中</b><div class="small muted">平台将在 2 小时内完成审核，审核期间无法查看拿货价与下单。</div></div>' +
      UI.tag('审核中', { '审核中': 'orange' }) + '</div>' +
      '<div class="mt12">' + UI.timeline([{ n: '提交认证材料', t: U.now(), l: '零售商' }, { n: '平台初审（工商/地址核验）', t: '待处理', l: '审核专员' }, { n: '审核通过，解锁拿货价', t: '待处理', l: '系统' }]) + '</div>' +
      '</div></div>';

    return '<div class="page-head"><h2>资质认证</h2>' + (ok ? '<span class="tag green">已认证</span>' : '<span class="tag orange">待审核</span>') + '</div>' +
      UI.steps(['注册账号', '提交门店资质', '平台审核', '解锁拿货价与下单'], ok ? 3 : 1) +
      (ok ? (editing ? form : info) : pendingCard + form) +
      '<div class="card"><div class="card-hd"><h3>收货地址管理</h3><div class="right"><button class="btn pri sm" data-act="addrNew">＋ 新增地址</button></div></div><div class="card-bd">' +
      S().addresses.map(a2 => '<div class="ci"><div class="p">📍</div><div class="n"><div class="t">' + UI.esc(a2.name) + ' ' + UI.esc(a2.phone) + (a2.def ? ' <span class="tag blue">默认</span>' : '') + '</div>' +
        '<div class="s">' + UI.esc(a2.addr) + '</div></div>' +
        '<button class="btn sm" data-act="setDef" data-id="' + a2.id + '">设为默认</button> ' +
        '<button class="btn sm" data-act="addrEdit" data-id="' + a2.id + '">编辑</button> ' +
        '<button class="btn sm danger" data-act="addrDel" data-id="' + a2.id + '">删除</button></div>').join('') +
      '</div></div>';
  };
  Act.register('certEdit', () => { window.__certEdit = true; App.render(); });
  Act.register('certCancel', () => { window.__certEdit = false; App.render(); });
  Act.register('certSubmit', () => {
    const v = id => (document.getElementById(id) || {}).value || '';
    if (!v('cName') || !v('cCode') || !v('cAddr') || !v('cContact') || !v('cPhone')) { UI.toast('请填写必填项（名称/证件号/地址/联系人/电话）', 'err'); return; }
    const area = (v('cArea') || '').split('/');
    B.submitCert({
      name: v('cName'), type: v('cType'), code: v('cCode'), addr: v('cAddr'),
      contact: v('cContact'), phone: v('cPhone'), storeType: v('cStore'),
      area: (area[0] || '').trim(), years: (area[1] || '').trim()
    });
    window.__certEdit = false;
    UI.toast('资质已提交，进入平台审核队列（可在平台端「零售商资质审核」处理）', 'ok');
    App.render();
  });
  Act.register('setDef', el => { B.addrDefault(el.getAttribute('data-id')); App.render(); });
  Act.register('addrNew', () => addrModal(null));
  Act.register('addrEdit', el => addrModal(el.getAttribute('data-id')));
  function addrModal(id) {
    const a = id ? S().addresses.find(x => x.id === id) : { name: '', phone: '', addr: '', def: 0 };
    UI.modal({
      title: id ? '编辑收货地址' : '新增收货地址',
      body: '<div class="fgrid"><div class="fld"><label>收货人 <span class="req">*</span></label><input class="inp" id="aName" value="' + UI.esc(a.name) + '"></div>' +
        '<div class="fld"><label>手机号 <span class="req">*</span></label><input class="inp" id="aPhone" value="' + UI.esc(a.phone) + '"></div></div>' +
        '<div class="fld"><label>详细地址 <span class="req">*</span></label><input class="inp" id="aAddr" value="' + UI.esc(a.addr) + '" placeholder="省 / 市 / 区 / 街道门牌"></div>' +
        '<label class="chk"><input type="checkbox" id="aDef"' + (a.def ? ' checked' : '') + '> 设为默认收货地址</label>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="addrSave" data-id="' + (id || '') + '">保存</button>'
    });
  }
  Act.register('addrSave', el => {
    const v = i => (document.getElementById(i) || {}).value || '';
    if (!v('aName') || !v('aPhone') || !v('aAddr')) { UI.toast('请填写完整收货信息', 'err'); return; }
    const data = { name: v('aName'), phone: v('aPhone'), addr: v('aAddr'), def: document.getElementById('aDef').checked ? 1 : 0 };
    const id = el.getAttribute('data-id');
    if (id) { B.addrUpdate(id, data); if (data.def) B.addrDefault(id); }
    else { B.addrAdd(data); if (data.def) B.addrDefault(S().addresses[S().addresses.length - 1].id); }
    UI.closeModal(); UI.toast('收货地址已保存', 'ok'); App.render();
  });
  Act.register('addrDel', el => {
    const id = el.getAttribute('data-id');
    if (S().addresses.length <= 1) { UI.toast('至少保留一个收货地址', 'err'); return; }
    UI.confirm('删除地址', '删除后不可恢复，确定删除该收货地址吗？', '确认删除', () => {
      B.addrDel(id); UI.toast('地址已删除'); App.render();
    });
  });
  Act.register('fakeUpload', el => { el.classList.add('done'); el.textContent = '✓ ' + el.getAttribute('data-tag') + ' 已上传'; UI.toast('演示环境：文件已模拟上传'); });
})();
