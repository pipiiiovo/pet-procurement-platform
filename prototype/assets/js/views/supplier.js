/* 供应商端视图 */
(function () {
  const V = (window.VIEWS = window.VIEWS || {}), S = () => Store.s, MY = 'S01';
  const pdt = () => S().products.filter(p => p.supplierId === MY);
  const myOrders = () => S().orders.filter(o => o.supplierId === MY);
  const myRefunds = () => S().refunds.filter(r => r.supplierId === MY);

  /* ============ 工作台 ============ */
  V['supplier/dashboard'] = function () {
    const s = S(), os = myOrders(), pd = pdt();
    const waitShip = os.filter(o => ['待接单', '待发货', '备货中'].indexOf(o.status) >= 0).length;
    const onSale = pd.filter(p => p.status === 'onSale').length;
    const monthPay = os.filter(o => o.status !== '已关闭').reduce((a, b) => a + b.pay, 0);
    const refundAmt = myRefunds().reduce((a, b) => a + b.amount, 0);
    const bars = ['10-27', '10-28', '10-29', '10-30', '10-31', '11-01', '11-02'].map((k, i) =>
      ({ k, v: [18600, 22400, 19800, 31200, 27600, 24300, 16800][i], hi: i === 3 }));

    const todo = [];
    if (waitShip) todo.push({ e: '📦', t: waitShip + ' 笔订单待接单/发货', d: '48 小时内处理，超时将触发平台预警', go: 'orders' });
    const pend = pd.filter(p => p.status === 'pending').length;
    if (pend) todo.push({ e: '🔍', t: pend + ' 个商品待平台审核', d: '预计 4 小时内完成审核', go: 'audit' });
    const rej = pd.filter(p => p.status === 'rejected').length;
    if (rej) todo.push({ e: '⚠️', t: rej + ' 个商品被驳回，需修改重提', d: '查看驳回原因', go: 'audit' });
    const as = myRefunds().filter(r => r.status === '待供应商处理').length;
    if (as) todo.push({ e: '↩️', t: as + ' 笔售后待处理', d: '48 小时内响应', go: 'aftersale' });
    todo.push({ e: '🏷️', t: '宠物饲料生产许可证将于 2027-03-31 到期', d: '请提前 30 天更新证照', go: 'qualification' });

    return UI.kpis([
      { lb: '本月销售额', vl: '¥' + UI.money(monthPay), dt: '<span class="up">↑ 12.4%</span> 环比上月' },
      { lb: '待发货订单', vl: waitShip, unit: '笔', dt: '承诺 48h 内发货' },
      { lb: '在售商品', vl: onSale, unit: '个', dt: '共 ' + pd.length + ' 个商品' },
      { lb: '本月退款金额', vl: '¥' + UI.money(refundAmt), dt: '退款率 1.8%（优秀）' }
    ]) +
      '<div class="row">' +
      '<div class="card" style="flex:2;min-width:320px"><div class="card-hd"><h3>待办事项</h3><span class="tag orange">' + todo.length + '</span></div><div class="card-bd tight">' +
      todo.map(t => '<div class="ci"><div class="p">' + t.e + '</div><div class="n"><div class="t">' + t.t + '</div><div class="s">' + t.d + '</div></div>' +
        '<button class="btn sm" data-act="go" data-page="' + t.go + '">处理</button></div>').join('') +
      '</div></div>' +
      '<div class="card" style="flex:1;min-width:260px"><div class="card-hd"><h3>平台公告</h3></div><div class="card-bd">' +
      s.notices.filter(n => n.to === '供应商' || n.to === '全部').map(n =>
        '<div style="padding:8px 0;border-bottom:1px dashed #eef1f6"><div style="font-size:13px">' + UI.esc(n.title) + '</div><div class="muted small">' + n.at + '</div></div>').join('') +
      '</div></div></div>' +
      '<div class="card"><div class="card-hd"><h3>近 7 日销售额趋势</h3><span class="sub">单位：元</span></div><div class="card-bd">' +
      UI.bars(bars) + '<div class="chart-legend"><span><i class="dot-i" style="background:#2563eb"></i>日销售额</span><span class="muted">峰值 10-30（采购节预热）</span></div>' +
      '</div></div>';
  };
  Act.register('go', el => App.go(App.role, el.getAttribute('data-page')));

  /* ============ 商品管理 ============ */
  V['supplier/products'] = function () {
    const list = pdt();
    const f = window.__spFilter || { st: '', kw: '' };
    const show = list.filter(p => (!f.st || p.status === f.st) && (!f.kw || p.name.indexOf(f.kw) >= 0));
    return '<div class="page-head"><h2>商品管理</h2><span class="crumb">共 ' + list.length + ' 个商品，在售 ' + list.filter(p => p.status === 'onSale').length + ' 个</span>' +
      '<div class="right"><button class="btn pri" data-act="go" data-page="product-new">＋ 新增商品</button></div></div>' +
      '<div class="filters">' +
      '<input class="inp" placeholder="搜索商品名称/品牌" value="' + UI.esc(f.kw) + '" data-change="spKw">' +
      '<div class="seg">' + [['', '全部'], ['onSale', '在售'], ['pending', '待审核'], ['draft', '草稿'], ['off', '已下架'], ['rejected', '已驳回']].map(x =>
        '<button class="' + (f.st === x[0] ? 'on' : '') + '" data-act="spFilter" data-st="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
      '<span class="muted right">经营品类：宠物主粮、宠物零食（新增品类需申报）</span></div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr>' +
      '<th>商品</th><th class="c">类目</th><th class="r">供货价</th><th class="c">MOQ</th><th class="c">库存</th><th class="c">状态</th><th class="c">销量</th><th class="c" style="width:190px">操作</th></tr></thead><tbody>' +
      (show.length ? show.map(p =>
        '<tr><td><div style="display:flex;gap:10px;align-items:center"><span style="font-size:24px">' + p.e + '</span>' +
        '<div><div style="font-weight:500">' + UI.esc(p.name) + '</div><div class="muted small">' + UI.esc(p.brand) + ' · ' + UI.esc(p.spec) + '</div></div></div></td>' +
        '<td class="c">' + p.cat + '</td><td class="r">¥' + UI.money(p.price) + '</td>' +
        '<td class="c">' + p.moq + p.unit + '</td><td class="c">' + p.stock + '</td>' +
        '<td class="c">' + UI.prodTag(p.status) + '</td><td class="c">' + p.sales + '</td>' +
        '<td class="c">' +
        (p.status === 'draft' || p.status === 'rejected' ? '<button class="btn sm pri" data-act="spSubmit" data-id="' + p.id + '">提交审核</button> ' : '') +
        (p.status === 'onSale' ? '<button class="btn sm" data-act="spOff" data-id="' + p.id + '">下架</button> ' : '') +
        (p.status === 'off' ? '<button class="btn sm ok" data-act="spOn" data-id="' + p.id + '">上架</button> ' : '') +
        '<button class="btn sm" data-act="spEdit" data-id="' + p.id + '">编辑</button></td></tr>').join('')
        : '<tr><td colspan="8">' + UI.empty('暂无符合筛选条件的商品') + '</td></tr>') +
      '</tbody></table></div></div>';
  };
  Act.register('spFilter', el => { window.__spFilter = window.__spFilter || { st: '', kw: '' }; window.__spFilter.st = el.getAttribute('data-st'); App.render(); });
  Act.register('spKw', el => { window.__spFilter = window.__spFilter || { st: '', kw: '' }; window.__spFilter.kw = el.value; App.render(); document.querySelector('[data-change="spKw"]').focus(); });
  Act.register('spSubmit', el => {
    const p = B.product(el.getAttribute('data-id')); p.status = 'pending'; p.submitAt = U.now();
    Store.save(); UI.toast('已提交平台审核，预计 4 小时内完成', 'ok'); App.render();
  });
  Act.register('spOff', el => { B.product(el.getAttribute('data-id')).status = 'off'; Store.save(); UI.toast('商品已下架'); App.render(); });
  Act.register('spOn', el => { B.product(el.getAttribute('data-id')).status = 'onSale'; Store.save(); UI.toast('商品已上架', 'ok'); App.render(); });
  Act.register('spEdit', el => {
    const p = B.product(el.getAttribute('data-id'));
    UI.modal({
      title: '编辑商品：' + p.name,
      body: '<div class="fgrid"><div class="fld"><label>供货价（元）</label><input class="inp" id="ePrice" value="' + p.price + '"></div>' +
        '<div class="fld"><label>库存</label><input class="inp" id="eStock" value="' + p.stock + '"></div></div>' +
        '<div class="fld"><label>最小起订量 MOQ（' + p.unit + '）</label><input class="inp" id="eMoq" value="' + p.moq + '"></div>' +
        '</div><div class="note small">价格上调超过 10% 时需平台二次审核；编辑后商品需重新提交审核。</div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="spSave" data-id="' + p.id + '">保存并提交审核</button>'
    });
  });
  Act.register('spSave', el => {
    const p = B.product(el.getAttribute('data-id'));
    p.price = Number(document.getElementById('ePrice').value) || p.price;
    p.stock = Number(document.getElementById('eStock').value) || p.stock;
    p.moq = Number(document.getElementById('eMoq').value) || p.moq;
    p.status = 'pending'; p.submitAt = U.now();
    Store.save(); UI.closeModal(); UI.toast('已保存并提交平台审核', 'ok'); App.render();
  });

  /* ============ 新增商品 ============ */
  V['supplier/product-new'] = function () {
    return '<div class="page-head"><h2>新增商品</h2><span class="crumb">提交后进入平台审核，通过后自动上架</span></div>' +
      UI.steps(['填写商品信息', '平台审核', '上架销售'], 0) +
      '<div class="card"><div class="card-hd"><h3>基本信息</h3></div><div class="card-bd">' +
      '<div class="fgrid">' +
      '<div class="fld"><label>商品标题 <span class="req">*</span></label><input class="inp" id="nName" placeholder="例：皇家 成猫全价粮 2kg*6袋 整箱装"></div>' +
      '<div class="fld"><label>品牌 <span class="req">*</span></label><input class="inp" id="nBrand" placeholder="例：麦富迪"></div>' +
      '<div class="fld"><label>一级类目 <span class="req">*</span></label><select class="inp" id="nCat">' + S().categories.map(c => '<option>' + c.name + '</option>').join('') + '</select></div>' +
      '<div class="fld"><label>二级类目</label><select class="inp" id="nSub"><option>猫粮</option><option>狗粮</option><option>肉干冻干</option><option>磨牙洁齿</option><option>猫条妙鲜包</option></select></div>' +
      '<div class="fld"><label>规格</label><input class="inp" id="nSpec" placeholder="例：10kg*2袋/组"></div>' +
      '<div class="fld"><label>销售单位</label><input class="inp" id="nUnit" value="箱"></div>' +
      '<div class="fld"><label>条形码</label><input class="inp" id="nBar" placeholder="6901234567890"></div>' +
      '<div class="fld"><label>保质期</label><input class="inp" id="nShelf" value="12个月"></div>' +
      '</div>' +
      '<div class="fld"><label>商品主图（至少 3 张）</label><div style="display:flex;gap:8px">' +
      '<div class="upl" style="width:100px;height:74px;line-height:48px" data-act="fakeUpload" data-tag="主图1">＋ 主图1</div>' +
      '<div class="upl" style="width:100px;height:74px;line-height:48px" data-act="fakeUpload" data-tag="主图2">＋ 主图2</div>' +
      '<div class="upl" style="width:100px;height:74px;line-height:48px" data-act="fakeUpload" data-tag="详情图">＋ 详情图</div></div></div>' +
      '<div class="fld"><label>商品详情</label><textarea class="inp" id="nDesc" placeholder="商品卖点、适用对象、成分表、喂食建议等"></textarea></div>' +
      '</div></div>' +
      '<div class="card"><div class="card-hd"><h3>价格与库存</h3></div><div class="card-bd">' +
      '<div class="fgrid-3">' +
      '<div class="fld"><label>供货价（元）<span class="req">*</span></label><input class="inp" id="nPrice" placeholder="28.5"></div>' +
      '<div class="fld"><label>建议零售价（元）</label><input class="inp" id="nRetail" placeholder="36"></div>' +
      '<div class="fld"><label>最小起订量 MOQ</label><input class="inp" id="nMoq" value="1"></div>' +
      '<div class="fld"><label>库存数量</label><input class="inp" id="nStock" placeholder="1000"></div>' +
      '<div class="fld"><label>发货地</label><input class="inp" id="nFrom" value="浙江杭州"></div>' +
      '<div class="fld"><label>承诺发货时效</label><select class="inp" id="nShip"><option>24小时内</option><option selected>48小时内</option><option>72小时内</option></select></div>' +
      '</div>' +
      '<div class="note small">本期统一按「供货价」销售，不设数量阶梯价；建议零售价用于零售商端毛利参考。</div>' +
      '</div></div>' +
      '<div class="card"><div class="card-hd"><h3>资质与售后</h3></div><div class="card-bd">' +
      '<div class="fgrid">' +
      '<div class="fld"><label>类目所需资质</label><div style="font-size:13px;color:#374151">营业执照 ✓（已核验）　宠物饲料生产许可证 ✓（已核验）</div></div>' +
      '<div class="fld"><label>质检报告</label><div class="upl" data-act="fakeUpload" data-tag="质检报告">＋ 上传质检报告（选填）</div></div>' +
      '</div>' +
      '<div class="fld"><label>售后说明</label><textarea class="inp" id="nAs" placeholder="签收后 7 天内可申请售后，临期/受潮/破损包退换"></textarea></div>' +
      '<label class="chk"><input type="checkbox" checked> 我承诺所售商品为正品、资质齐全，遵守《平台商品质量承诺》</label>' +
      '</div></div>' +
      '<div class="card"><div class="card-bd"><button class="btn pri lg" data-act="spCreate">提交平台审核</button> ' +
      '<button class="btn lg" data-act="spCreateDraft">存为草稿</button></div></div>';
  };
  Act.register('fakeUpload', el => { el.classList.add('done'); el.textContent = '✓ ' + el.getAttribute('data-tag') + ' 已上传'; UI.toast('演示环境：文件已模拟上传'); });
  Act.register('spCreate', () => {
    const v = id => (document.getElementById(id) || {}).value || '';
    if (!v('nName')) { UI.toast('请填写商品标题', 'err'); return; }
    const price = Number(v('nPrice')) || 0;
    S().products.unshift({
      id: 'P' + Date.now(), name: v('nName'), brand: v('nBrand') || '未填写', cat: v('nCat'), sub: v('nSub'), e: '📦',
      spec: v('nSpec') || '-', unit: v('nUnit') || '件', price, retail: Number(v('nRetail')) || price * 1.3,
      moq: Number(v('nMoq')) || 1, stock: Number(v('nStock')) || 0, sales: 0, supplierId: MY, supplierName: '宠悦宠物食品（杭州）有限公司',
      owner: 'supplier', status: 'pending', shelf: v('nShelf'), from: v('nFrom'), ship: v('nShip'), rate: 0, tag: '新品', submitAt: U.now()
    });
    Store.save(); UI.toast('商品已提交，进入平台审核队列', 'ok'); App.go('supplier', 'audit');
  });
  Act.register('spCreateDraft', () => {
    const v = id => (document.getElementById(id) || {}).value || '';
    S().products.unshift({
      id: 'P' + Date.now(), name: v('nName') || '未命名商品', brand: v('nBrand') || '-', cat: v('nCat'), sub: v('nSub'), e: '📦',
      spec: v('nSpec') || '-', unit: v('nUnit') || '件', price: Number(v('nPrice')) || 0, retail: Number(v('nRetail')) || 0,
      moq: Number(v('nMoq')) || 1, stock: Number(v('nStock')) || 0, sales: 0,
      supplierId: MY, supplierName: '宠悦宠物食品（杭州）有限公司', owner: 'supplier', status: 'draft', shelf: v('nShelf'), from: v('nFrom'), ship: v('nShip'), rate: 0, tag: ''
    });
    Store.save(); UI.toast('已保存为草稿'); App.go('supplier', 'products');
  });

  /* ============ 审核进度 ============ */
  V['supplier/audit'] = function () {
    const list = pdt().filter(p => ['pending', 'rejected'].indexOf(p.status) >= 0);
    return '<div class="page-head"><h2>审核进度</h2><span class="crumb">平台审核时效：4 小时内</span></div>' +
      '<div class="note">审核要点：标题与主图合规性、类目归属、价格合理性、资质与证照匹配。被驳回的商品可修改后重新提交。</div>' +
      '<div class="card"><div class="card-hd"><h3>审核中的商品</h3></div><div class="tb-wrap"><table class="tb"><thead><tr>' +
      '<th>商品</th><th class="c">提交时间</th><th class="c">状态</th><th>审核意见</th><th class="c">操作</th></tr></thead><tbody>' +
      (list.length ? list.map(p =>
        '<tr><td><div style="display:flex;gap:10px;align-items:center"><span style="font-size:22px">' + p.e + '</span><div>' + UI.esc(p.name) + '<div class="muted small">' + p.cat + ' · ¥' + UI.money(p.price) + '</div></div></div></td>' +
        '<td class="c small">' + (p.submitAt || '-') + '</td><td class="c">' + UI.prodTag(p.status) + '</td>' +
        '<td class="small" style="color:' + (p.status === 'rejected' ? '#dc2626' : '#6b7280') + '">' + UI.esc(p.auditMsg || '审核中，请耐心等待') + '</td>' +
        '<td class="c">' + (p.status === 'rejected' ? '<button class="btn sm pri" data-act="spEdit" data-id="' + p.id + '">修改并重提</button>' : '<span class="muted small">—</span>') + '</td></tr>').join('')
        : '<tr><td colspan="5">' + UI.empty('暂无待审核或驳回的商品', '✅') + '</td></tr>') +
      '</tbody></table></div></div>';
  };

  /* ============ 订单管理 ============ */
  V['supplier/orders'] = function () {
    const os = myOrders(), f = window.__soFilter || '';
    const show = f ? os.filter(o => o.status === f) : os;
    const sts = ['', '待接单', '待发货', '已发货', '已完成', '退款中', '已关闭'];
    return '<div class="page-head"><h2>订单管理</h2><span class="crumb">共 ' + os.length + ' 笔订单</span></div>' +
      '<div class="filters"><div class="seg">' + sts.map(x =>
        '<button class="' + (f === x ? 'on' : '') + '" data-act="soFilter" data-st="' + x + '">' + (x || '全部') + '</button>').join('') + '</div>' +
      '<span class="muted right">承诺 48 小时内接单并发货，超时将触发平台预警与扣分</span></div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr>' +
      '<th>订单号</th><th>采购方</th><th>商品</th><th class="r">金额</th><th class="c">支付</th><th class="c">状态</th><th class="c">下单时间</th><th class="c">操作</th></tr></thead><tbody>' +
      (show.length ? show.map(o =>
        '<tr><td><b>' + o.no + '</b><div class="muted small">' + (o.ship ? o.ship.company + ' ' + o.ship.no : '未发货') + '</div></td>' +
        '<td>' + UI.esc(o.retailer) + '<div class="muted small">' + UI.esc(o.addr.name) + ' ' + UI.esc(o.addr.phone) + '</div></td>' +
        '<td>' + o.items.map(i => '<div class="small">' + i.e + ' ' + UI.esc(i.name.slice(0, 16)) + ' ×' + i.qty + i.unit + '</div>').join('') + '</td>' +
        '<td class="r">¥' + UI.money(o.pay) + '<div class="muted small">含运费 ' + o.freight + '</div></td>' +
        '<td class="c small">' + o.payType + '</td><td class="c">' + UI.tag(o.status) + '</td><td class="c small">' + o.createdAt + '</td>' +
        '<td class="c">' +
        (o.status === '待接单' ? '<button class="btn sm pri" data-act="soAccept" data-id="' + o.id + '">接单</button> ' : '') +
        (['待发货', '备货中', '待接单'].indexOf(o.status) >= 0 ? '<button class="btn sm warn" data-act="soShip" data-id="' + o.id + '">发货</button> ' : '') +
        '<button class="btn sm" data-act="soDetail" data-id="' + o.id + '">详情</button></td></tr>').join('')
        : '<tr><td colspan="8">' + UI.empty('暂无订单') + '</td></tr>') +
      '</tbody></table></div></div>';
  };
  Act.register('soFilter', el => { window.__soFilter = el.getAttribute('data-st'); App.render(); });
  Act.register('soAccept', el => {
    const o = B.order(el.getAttribute('data-id')); o.status = '待发货'; Store.save(); UI.toast('已接单，请尽快备货发货', 'ok'); App.render();
  });
  Act.register('soShip', el => {
    const id = el.getAttribute('data-id'), o = B.order(id);
    UI.modal({
      title: '订单发货 · ' + o.no,
      body: '<div class="fld"><label>采购方</label><div class="small">' + UI.esc(o.retailer) + '　' + UI.esc(o.addr.name) + ' ' + UI.esc(o.addr.phone) + '<br>' + UI.esc(o.addr.addr) + '</div></div>' +
        '<div class="fld"><label>发货商品</label>' + o.items.map(i => '<div class="small">' + i.e + ' ' + UI.esc(i.name) + '　×' + i.qty + i.unit + '</div>').join('') + '</div>' +
        '<div class="fgrid"><div class="fld"><label>承运商 <span class="req">*</span></label><select class="inp" id="shCo"><option>德邦物流</option><option>京东物流</option><option>中通快运</option><option>顺丰速运</option><option>平台云仓</option></select></div>' +
        '<div class="fld"><label>运单号 <span class="req">*</span></label><input class="inp" id="shNo" placeholder="DPK20261102xxxx"></div></div>' +
        '<div class="fld"><label>包裹数</label><input class="inp" id="shPkg" value="1"></div>' +
        '<div class="fld"><label>发货凭证</label><div class="upl" data-act="fakeUpload" data-tag="发货凭证">＋ 上传发货照片</div></div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="soShipOk" data-id="' + id + '">确认发货</button>'
    });
  });
  Act.register('soShipOk', el => {
    const id = el.getAttribute('data-id');
    const co = (document.getElementById('shCo') || {}).value, no = (document.getElementById('shNo') || {}).value;
    if (!no) { UI.toast('请填写运单号', 'err'); return; }
    B.shipOrder(id, co, no); UI.closeModal(); UI.toast('发货成功，物流轨迹已同步', 'ok'); App.render();
  });
  Act.register('soDetail', el => {
    const o = B.order(el.getAttribute('data-id'));
    UI.modal({
      wide: true, title: '订单详情 · ' + o.no,
      body: '<div class="row"><div style="flex:1;min-width:250px">' +
        '<div class="card"><div class="card-hd"><h3>订单信息</h3>' + UI.tag(o.status) + '</div><div class="card-bd small">' +
        '<dl class="kv"><dt>订单号</dt><dd>' + o.no + '</dd><dt>采购方</dt><dd>' + UI.esc(o.retailer) + '</dd>' +
        '<dt>收货地址</dt><dd>' + UI.esc(o.addr.addr) + '　' + UI.esc(o.addr.name) + ' ' + UI.esc(o.addr.phone) + '</dd>' +
        '<dt>支付方式</dt><dd>' + o.payType + '</dd><dt>下单时间</dt><dd>' + o.createdAt + '</dd><dt>买家备注</dt><dd>' + UI.esc(o.remark || '无') + '</dd></dl></div></div>' +
        '<div class="card"><div class="card-hd"><h3>商品明细</h3></div><div class="card-bd tight">' +
        o.items.map(i => '<div class="ci"><div class="p">' + i.e + '</div><div class="n"><div class="t">' + UI.esc(i.name) + '</div><div class="s">' + i.spec + '　¥' + UI.money(i.price) + ' × ' + i.qty + i.unit + '</div></div><div>¥' + UI.money(i.price * i.qty) + '</div></div>').join('') +
        '<div style="padding:10px 14px;text-align:right" class="small">商品金额 ¥' + UI.money(o.goods) + '　运费 ¥' + o.freight + '　<b style="color:#dc2626">实付 ¥' + UI.money(o.pay) + '</b></div>' +
        '</div></div></div>' +
        '<div style="flex:1;min-width:250px"><div class="card"><div class="card-hd"><h3>物流信息</h3></div><div class="card-bd">' +
        (o.ship ? '<div class="small mb8">' + o.ship.company + '　运单号：<b>' + o.ship.no + '</b>　发货时间：' + o.ship.at + '</div>' + UI.timeline(o.ship.tracks)
          : '<div class="muted small">尚未发货</div>') +
        '</div></div></div></div>',
      footer: '<button class="btn" data-act="closeModal">关闭</button>' +
        (['待发货', '备货中', '待接单'].indexOf(o.status) >= 0 ? '<button class="btn warn" data-act="soShip" data-id="' + o.id + '">立即发货</button>' : '')
    });
  });

  /* ============ 售后管理 ============ */
  V['supplier/aftersale'] = function () {
    const rs = myRefunds();
    return '<div class="page-head"><h2>售后管理</h2><span class="crumb">48 小时内响应，超时平台自动介入</span></div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr>' +
      '<th>售后单号</th><th>订单/商品</th><th class="c">类型</th><th class="r">退款金额</th><th>原因</th><th class="c">状态</th><th class="c">处理时限</th><th class="c">操作</th></tr></thead><tbody>' +
      (rs.length ? rs.map(r =>
        '<tr><td><b>' + r.no + '</b><div class="muted small">' + r.createdAt + '</div></td>' +
        '<td>' + r.e + ' ' + UI.esc(r.name.slice(0, 18)) + '<div class="muted small">' + r.orderNo + ' · ×' + r.qty + '</div></td>' +
        '<td class="c small">' + r.type + '</td><td class="r">¥' + UI.money(r.amount) + '</td>' +
        '<td class="small">' + UI.esc(r.reason) + '<div class="muted">凭证 ' + r.imgs + ' 张</div></td>' +
        '<td class="c">' + UI.asTag(r.status) + '</td><td class="c small">' + r.dueAt + '</td>' +
        '<td class="c">' + (r.status === '待供应商处理'
          ? '<button class="btn sm ok" data-act="asAccept" data-id="' + r.id + '">同意</button> <button class="btn sm danger" data-act="asReject" data-id="' + r.id + '">拒绝</button>'
          : '<button class="btn sm" data-act="asView" data-id="' + r.id + '">查看</button>') + '</td></tr>').join('')
        : '<tr><td colspan="8">' + UI.empty('暂无售后工单', '✅') + '</td></tr>') +
      '</tbody></table></div></div>';
  };
  Act.register('asAccept', el => {
    const r = S().refunds.find(x => x.id === el.getAttribute('data-id'));
    r.status = r.type === '仅退款' ? '待平台退款' : '待买家退货';
    Store.save(); UI.toast('已同意售后申请，等待平台/买家下一步', 'ok'); App.render();
  });
  Act.register('asReject', el => {
    const id = el.getAttribute('data-id');
    UI.modal({
      title: '拒绝售后申请',
      body: '<div class="fld"><label>拒绝原因 <span class="req">*</span></label><select class="inp" id="rjR"><option>商品已验收，无质量问题</option><option>超过售后时效（签收 7 天内）</option><option>凭证不足，无法判定责任</option><option>商品已拆封使用，影响二次销售</option></select></div>' +
        '<div class="fld"><label>说明与凭证</label><textarea class="inp" id="rjD" placeholder="请填写具体情况"></textarea></div>' +
        '<div class="upl" data-act="fakeUpload" data-tag="驳回凭证">＋ 上传凭证</div>' +
        '<div class="warn small mt12">拒绝后零售商可申请平台介入，平台将在 72 小时内仲裁。</div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn danger" data-act="asRejectOk" data-id="' + id + '">确认拒绝</button>'
    });
  });
  Act.register('asRejectOk', el => {
    const r = S().refunds.find(x => x.id === el.getAttribute('data-id'));
    r.status = '已拒绝'; Store.save(); UI.closeModal(); UI.toast('已拒绝该售后申请'); App.render();
  });
  Act.register('asView', el => {
    const r = S().refunds.find(x => x.id === el.getAttribute('data-id'));
    UI.modal({ title: '售后详情 ' + r.no, body: '<dl class="kv"><dt>关联订单</dt><dd>' + r.orderNo + '</dd><dt>商品</dt><dd>' + UI.esc(r.name) + ' ×' + r.qty + '</dd><dt>类型</dt><dd>' + r.type + '</dd><dt>金额</dt><dd>¥' + UI.money(r.amount) + '</dd><dt>原因</dt><dd>' + UI.esc(r.reason) + '</dd><dt>状态</dt><dd>' + r.status + '</dd><dt>处理时限</dt><dd>' + r.dueAt + '</dd></dl>' });
  });

  /* ============ 资质中心 ============ */
  V['supplier/qualification'] = function () {
    const a = S().supplierAuth;
    return '<div class="page-head"><h2>资质中心</h2>' + (a.status === 'approved' ? '<span class="tag green">已通过入驻审核</span>' : '<span class="tag orange">审核中</span>') + '</div>' +
      '<div class="row">' +
      '<div class="card" style="flex:1;min-width:300px"><div class="card-hd"><h3>企业信息</h3></div><div class="card-bd">' +
      '<dl class="kv"><dt>企业名称</dt><dd>宠悦宠物食品（杭州）有限公司</dd><dt>统一社会信用代码</dt><dd>91330100MA2XXXXX1A</dd>' +
      '<dt>经营品类</dt><dd>宠物主粮、宠物零食</dd><dt>联系人</dt><dd>张伟 13800001111</dd>' +
      '<dt>结算方式</dt><dd>T+7</dd><dt>店铺评分</dt><dd>4.8 分（A 级）</dd><dt>入驻时间</dt><dd>2026-04-30</dd></dl>' +
      '</div></div>' +
      '<div class="card" style="flex:1.4;min-width:340px"><div class="card-hd"><h3>证照管理</h3><span class="sub">到期前 30 天提醒</span></div><div class="card-bd">' +
      [['营业执照', '91330100MA2XXXXX1A', '2036-04-29', 'ok'], ['宠物饲料生产许可证', 'SL33010120260088', '2027-03-31', 'warn'], ['开户许可证', '3310**********8899', '长期', 'ok'], ['品牌授权书（皇家 ROYAL CANIN）', 'NX2026-0118', '2026-12-31', 'warn'], ['法人身份证', '3101**********0018', '2031-05-20', 'ok']]
        .map(x => '<div class="ci"><div class="p">📄</div><div class="n"><div class="t">' + x[0] + '</div><div class="s">' + x[1] + '　有效期至 ' + x[2] + '</div></div>' +
          '<span class="tag ' + (x[3] === 'ok' ? 'green' : 'orange') + '">' + (x[3] === 'ok' ? '有效' : '即将到期') + '</span></div>').join('') +
      '<button class="btn sm mt12" data-act="fakeUpload" data-tag="新证照">＋ 更新 / 新增证照</button>' +
      '</div></div></div>' +
      '<div class="card"><div class="card-hd"><h3>品类扩展申请</h3><span class="sub">经营品类外的商品需先申报并通过审核</span></div><div class="card-bd">' +
      '<div class="row"><select class="inp" style="max-width:220px" id="newCat"><option>猫砂清洁</option><option>宠物保健</option><option>宠物玩具</option></select>' +
      '<button class="btn" data-act="catApply">提交品类申报</button><span class="muted small">需补充对应类目资质（如兽药经营许可证）</span></div>' +
      '</div></div>' +
      '<div class="card"><div class="card-hd"><h3>入驻申请流程（供新供应商参考）</h3></div><div class="card-bd">' +
      UI.steps(['注册账号', '填写企业信息', '上传资质材料', '签署协议', '平台审核', '开通后台'], 5) +
      '<div class="muted small">审核时效 2 个工作日；驳回可修改后重新提交，次数不限。</div></div></div>';
  };
  Act.register('catApply', () => {
    const c = (document.getElementById('newCat') || {}).value;
    UI.toast('已提交「' + c + '」品类申报，等待平台审核', 'ok'); B.log('品类申报受理', c);
  });

  /* ============ 结算中心 ============ */
  V['supplier/settlement'] = function () {
    const sts = S().settlements.filter(x => x.supplierId === MY);
    const balance = sts.filter(x => x.status === '已打款').reduce((a, b) => a + b.pay, 0) * 0.12;
    return '<div class="page-head"><h2>结算中心</h2><span class="crumb">结算方式：T+7（签收后 7 天可结算）</span></div>' +
      UI.kpis([
        { lb: '可提现余额', vl: '¥' + UI.money(balance), dt: '对公账户 3310****8899' },
        { lb: '待结算金额', vl: '¥' + UI.money(sts.filter(x => x.status !== '已打款').reduce((a, b) => a + b.pay, 0)), dt: '担保交易，签收后释放' },
        { lb: '本月已结算', vl: '¥' + UI.money(176719), dt: '结算周期 10-18 ~ 10-24' },
        { lb: '平台服务费', vl: '5%', dt: '按类目费率，结算单中扣除' }
      ]) +
      '<div class="card"><div class="card-hd"><h3>结算单</h3><div class="right"><button class="btn pri sm" data-act="withdraw">申请提现</button></div></div><div class="tb-wrap"><table class="tb"><thead><tr>' +
      '<th>结算单号</th><th>结算周期</th><th class="c">订单数</th><th class="r">货款</th><th class="r">退款冲抵</th><th class="r">服务费</th><th class="r">运费补</th><th class="r">应付金额</th><th class="c">状态</th><th class="c">操作</th></tr></thead><tbody>' +
      sts.map(x => '<tr><td><b>' + x.no + '</b></td><td class="small">' + x.period + '</td><td class="c">' + x.orders + '</td>' +
        '<td class="r">¥' + UI.money(x.goods) + '</td><td class="r">¥' + UI.money(x.refund) + '</td><td class="r">¥' + UI.money(x.fee) + '</td><td class="r">¥' + UI.money(x.freight) + '</td>' +
        '<td class="r"><b>¥' + UI.money(x.pay) + '</b></td><td class="c">' + UI.tag(x.status, { '已打款': 'green', '待财务复核': 'orange', '待供应商确认': 'blue' }) + '</td>' +
        '<td class="c">' + (x.status === '待供应商确认' ? '<button class="btn sm pri" data-act="stConfirm" data-id="' + x.id + '">确认</button> ' : '') +
        '<button class="btn sm" data-act="stView" data-id="' + x.id + '">明细</button></td></tr>').join('') +
      '</tbody></table></div></div>';
  };
  Act.register('stConfirm', el => {
    const x = S().settlements.find(v => v.id === el.getAttribute('data-id'));
    x.status = '待财务复核'; Store.save(); UI.toast('已确认结算单，等待平台财务复核', 'ok'); App.render();
  });
  Act.register('stView', el => {
    const x = S().settlements.find(v => v.id === el.getAttribute('data-id'));
    UI.modal({
      title: '结算单明细 ' + x.no, wide: true,
      body: '<table class="tb"><thead><tr><th>项目</th><th class="r">金额（元）</th><th>说明</th></tr></thead><tbody>' +
        '<tr><td>订单货款</td><td class="r">' + UI.money(x.goods) + '</td><td>' + x.orders + ' 笔订单</td></tr>' +
        '<tr><td>退款冲抵</td><td class="r">' + UI.money(x.refund) + '</td><td>本期发生退款</td></tr>' +
        '<tr><td>平台服务费</td><td class="r">' + UI.money(x.fee) + '</td><td>按类目费率 5%</td></tr>' +
        '<tr><td>运费补贴</td><td class="r">' + UI.money(x.freight) + '</td><td>平台活动补贴</td></tr>' +
        '<tr><td><b>应付金额</b></td><td class="r"><b style="color:#dc2626">' + UI.money(x.pay) + '</b></td><td>' + x.status + '</td></tr>' +
        '</tbody></table>'
    });
  });
  Act.register('withdraw', () => {
    UI.modal({
      title: '申请提现',
      body: '<div class="fld"><label>提现金额（元）</label><input class="inp" id="wdAmt" value="50000"></div>' +
        '<div class="fld"><label>收款账户</label><select class="inp"><option>宠悦宠物食品（杭州）有限公司　3310**********8899　招商银行</option></select></div>' +
        '<div class="fld"><label>发票</label><label class="chk"><input type="checkbox" checked> 同步申请开具增值税专用发票</label></div>' +
        '<div class="note small">提现申请提交后由平台财务复核，1-3 个工作日到账。</div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="wdOk">提交申请</button>'
    });
  });
  Act.register('wdOk', () => { UI.closeModal(); UI.toast('提现申请已提交，等待平台财务复核', 'ok'); });

})();
