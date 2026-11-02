/* 平台管理端视图 */
(function () {
  const V = (window.VIEWS = window.VIEWS || {}), S = () => Store.s;
  const pendingProducts = () => S().products.filter(p => p.status === 'pending');

  /* ============ 数据大盘 ============ */
  V['admin/dashboard'] = function () {
    const s = S();
    const gmv = s.orders.filter(o => o.status !== '已关闭').reduce((a, b) => a + b.pay, 0);
    const selfGmv = s.orders.filter(o => o.supplierId === 'PLATFORM').reduce((a, b) => a + b.pay, 0);
    const pending = pendingProducts().length + s.audits.supplier.filter(a => a.status === 'pending').length + s.audits.retailer.filter(a => a.status === 'pending').length;
    const bars = ['10-27', '10-28', '10-29', '10-30', '10-31', '11-01', '11-02'].map((k, i) => ({ k, v: [86, 104, 92, 148, 132, 116, 78][i], hi: i === 3 }));
    return '<div class="page-head"><h2>数据大盘</h2><span class="crumb">数据截至 2026-11-02 10:00</span></div>' +
      UI.kpis([
        { lb: '平台 GMV（本月）', vl: '¥' + UI.money(gmv * 42), dt: '<span class="up">↑ 18.6%</span> 环比' },
        { lb: '活跃零售商', vl: '1,286', unit: '家', dt: '新增 96 家（本周）' },
        { lb: '在售商品', vl: s.products.filter(p => p.status === 'onSale').length, unit: '个', dt: '自营 ' + s.products.filter(p => p.isSelf && p.status === 'onSale').length + ' 个' },
        { lb: '待审核事项', vl: pending, unit: '项', dt: '<span style="color:#d97706">需及时处理</span>' }
      ]) +
      '<div class="row">' +
      '<div class="card" style="flex:1.6;min-width:340px"><div class="card-hd"><h3>近 7 日 GMV（万元）</h3></div><div class="card-bd">' + UI.bars(bars) + '<div class="chart-legend"><span><i class="dot-i" style="background:#2563eb"></i>GMV</span></div></div></div>' +
      '<div class="card" style="flex:1;min-width:280px"><div class="card-hd"><h3>今日待办</h3></div><div class="card-bd tight">' +
      [['🔍', '商品上架审核', pendingProducts().length + ' 个待审', 'audit-product'],
       ['🏭', '供应商入驻审核', s.audits.supplier.filter(a => a.status === 'pending').length + ' 家待审', 'audit-supplier'],
       ['🏪', '零售商资质审核', s.audits.retailer.filter(a => a.status === 'pending').length + ' 家待审', 'audit-retailer'],
       ['↩️', '退款仲裁', s.refunds.filter(r => ['待平台退款', '平台介入中'].indexOf(r.status) >= 0).length + ' 笔', 'refunds'],
       ['💰', '结算复核', s.settlements.filter(x => x.status === '待财务复核').length + ' 张', 'settle']]
        .map(t => '<div class="ci"><div class="p">' + t[0] + '</div><div class="n"><div class="t">' + t[1] + '</div><div class="s">' + t[2] + '</div></div>' +
          '<button class="btn sm" data-act="go" data-page="' + t[3] + '">处理</button></div>').join('') +
      '</div></div></div>' +
      '<div class="row">' +
      '<div class="card" style="flex:1;min-width:300px"><div class="card-hd"><h3>经营结构</h3></div><div class="card-bd">' +
      '<div class="small mb8">自营独代 GMV 占比　<b>' + Math.round(selfGmv / (gmv || 1) * 100) + '%</b></div>' +
      '<div style="height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden"><div style="width:' + Math.round(selfGmv / (gmv || 1) * 100) + '%;height:10px;background:#2563eb"></div></div>' +
      '<div class="small mt12 mb8">自营毛利贡献　<b>32%</b></div>' +
      '<div style="height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden"><div style="width:32%;height:10px;background:#f97316"></div></div>' +
      '<div class="muted small mt12">品类 GMV TOP：宠物主粮 38%　猫砂清洁 22%　宠物零食 16%　宠物保健 12%</div>' +
      '</div></div>' +
      '<div class="card" style="flex:1;min-width:300px"><div class="card-hd"><h3>风险预警</h3></div><div class="card-bd tight">' +
      [['⚠️', '2 家供应商 48 小时发货率低于 90%', '履约考核'], ['⚠️', '1 个商品价格 24h 内上涨 18%', '价格监控'], ['🚚', '3 笔物流轨迹超 48 小时未更新', '物流异常'], ['↩️', '1 笔售后已进入平台介入超时倒计时', '退款仲裁']]
        .map(t => '<div class="ci"><div class="p">' + t[0] + '</div><div class="n"><div class="t">' + t[1] + '</div><div class="s">' + t[2] + '</div></div><button class="btn sm">查看</button></div>').join('') +
      '</div></div></div>';
  };

  /* ============ 供应商入驻审核 ============ */
  V['admin/audit-supplier'] = function () {
    const list = S().audits.supplier.filter(a => a.status === 'pending');
    return '<div class="page-head"><h2>供应商入驻审核</h2><span class="crumb">SLA：2 个工作日</span></div>' +
      '<div class="note">审核要点：营业执照真实性（工商核验）、类目资质匹配、经营异常与风险信息、品牌授权链完整性。</div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr><th>企业</th><th>经营品类</th><th class="c">注册资本</th><th>联系人</th><th class="c">材料</th><th>风控提示</th><th class="c">提交时间</th><th class="c" style="width:180px">操作</th></tr></thead><tbody>' +
      (list.length ? list.map(a => '<tr><td><b>' + UI.esc(a.name) + '</b><div class="muted small">' + a.code + '</div></td>' +
        '<td>' + UI.esc(a.cat) + '</td><td class="c">' + a.capital + '</td><td>' + UI.esc(a.contact) + '<div class="muted small">' + a.phone + '</div></td>' +
        '<td class="c">' + a.files + ' 份</td><td>' + (a.risk === '正常' ? '<span class="tag green">正常</span>' : '<span class="tag red">' + UI.esc(a.risk) + '</span>') + '</td>' +
        '<td class="c small">' + a.submitAt + '</td>' +
        '<td class="c"><button class="btn sm" data-act="supAuditDetail" data-id="' + a.id + '">审核</button></td></tr>').join('')
        : '<tr><td colspan="8">' + UI.empty('暂无待审核的入驻申请', '✅') + '</td></tr>') +
      '</tbody></table></div></div>' +
      '<div class="card"><div class="card-hd"><h3>已通过的供应商</h3></div><div class="tb-wrap"><table class="tb"><thead><tr><th>企业</th><th>经营品类</th><th class="c">等级</th><th class="c">评分</th><th class="c">结算</th><th class="r">累计销售额</th><th class="c">状态</th></tr></thead><tbody>' +
      S().suppliers.map(x => '<tr><td>' + UI.esc(x.name) + '</td><td>' + UI.esc(x.cat) + '</td><td class="c">' + x.level + '</td><td class="c">' + x.rate + '</td><td class="c">' + x.settle + '</td><td class="r">¥' + UI.money(x.sales) + '</td><td class="c"><span class="tag green">合作中</span></td></tr>').join('') +
      '</tbody></table></div></div>';
  };
  Act.register('supAuditDetail', el => {
    const a = S().audits.supplier.find(x => x.id === el.getAttribute('data-id'));
    UI.modal({
      wide: true, title: '入驻审核 · ' + a.name,
      body: '<div class="row"><div style="flex:1"><div class="card"><div class="card-hd"><h3>企业信息</h3></div><div class="card-bd small">' +
        '<dl class="kv"><dt>企业名称</dt><dd>' + UI.esc(a.name) + '</dd><dt>信用代码</dt><dd>' + a.code + '</dd><dt>注册资本</dt><dd>' + a.capital + '</dd>' +
        '<dt>经营品类</dt><dd>' + UI.esc(a.cat) + '</dd><dt>联系人</dt><dd>' + UI.esc(a.contact) + ' ' + a.phone + '</dd><dt>提交时间</dt><dd>' + a.submitAt + '</dd></dl></div></div>' +
        '<div class="card"><div class="card-hd"><h3>工商核验 / 风控</h3></div><div class="card-bd small">' +
        '<div class="mb8">工商登记状态：<span class="tag green">存续（已核验）</span></div>' +
        '<div class="mb8">经营异常：' + (a.risk === '正常' ? '<span class="tag green">无</span>' : '<span class="tag red">存在记录</span>') + '</div>' +
        '<div class="mb8">法人关联风险：<span class="tag green">无</span></div>' +
        '<div>历史平台合作：<span class="tag gray">首次入驻</span></div></div></div></div>' +
        '<div style="flex:1"><div class="card"><div class="card-hd"><h3>资质材料（' + a.files + ' 份）</h3></div><div class="card-bd">' +
        ['营业执照', '宠物饲料生产许可证', '兽药经营许可证（保健类）', '开户许可证', '品牌授权书', '产品质检报告'].slice(0, a.files).map(f =>
          '<div class="ci"><div class="p">📄</div><div class="n"><div class="t">' + f + '</div><div class="s">点击查看大图 · 带水印</div></div><span class="tag green">已核验</span></div>').join('') +
        '</div></div></div></div>' +
        '<div class="fld mt12"><label>审核意见</label><textarea class="inp" id="auMsg" placeholder="通过可不填；驳回需填写原因（将同步给供应商）"></textarea></div>',
      footer: '<button class="btn" data-act="closeModal">稍后处理</button>' +
        '<button class="btn danger" data-act="supReject" data-id="' + a.id + '">驳回</button>' +
        '<button class="btn ok" data-act="supPass" data-id="' + a.id + '">审核通过</button>'
    });
  });
  Act.register('supPass', el => {
    const id = el.getAttribute('data-id'), s = S();
    const a = s.audits.supplier.find(x => x.id === id);
    s.suppliers.push({ id: 'S' + (s.suppliers.length + 10), name: a.name, code: a.code, cat: a.cat, contact: a.contact, phone: a.phone, level: 'B', rate: 0, settle: 'T+7', status: 'approved', createdAt: U.now(), sales: 0 });
    s.audits.supplier = s.audits.supplier.filter(x => x.id !== id);
    B.log('供应商入驻审核通过', a.name);
    UI.closeModal(); UI.toast('已通过：' + a.name + '，账号已开通', 'ok'); App.render();
  });
  Act.register('supReject', el => {
    const id = el.getAttribute('data-id'), s = S();
    const a = s.audits.supplier.find(x => x.id === id);
    s.audits.supplier = s.audits.supplier.filter(x => x.id !== id);
    B.log('供应商入驻驳回', a.name + '（' + ((document.getElementById('auMsg') || {}).value || '材料不符') + '）');
    UI.closeModal(); UI.toast('已驳回：' + a.name); App.render();
  });

  /* ============ 零售商资质审核 ============ */
  V['admin/audit-retailer'] = function () {
    const list = S().audits.retailer.filter(a => a.status === 'pending');
    return '<div class="page-head"><h2>零售商资质审核</h2><span class="crumb">通过后解锁拿货价与下单权限</span></div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr><th>门店/主体</th><th class="c">类型</th><th>证件号</th><th>地址</th><th>联系人</th><th class="c">材料</th><th class="c">提交时间</th><th class="c" style="width:170px">操作</th></tr></thead><tbody>' +
      (list.length ? list.map(a => '<tr><td><b>' + UI.esc(a.name) + '</b></td><td class="c small">' + a.type + '</td><td class="small">' + a.code + '</td>' +
        '<td class="small">' + UI.esc(a.addr) + '</td><td>' + UI.esc(a.contact) + '<div class="muted small">' + a.phone + '</div></td>' +
        '<td class="c">' + a.files + ' 份</td><td class="c small">' + a.submitAt + '</td>' +
        '<td class="c"><button class="btn sm ok" data-act="retPass" data-id="' + a.id + '">通过</button> <button class="btn sm danger" data-act="retReject" data-id="' + a.id + '">驳回</button></td></tr>').join('')
        : '<tr><td colspan="8">' + UI.empty('暂无待审核的资质申请', '✅') + '</td></tr>') +
      '</tbody></table></div></div>' +
      '<div class="card"><div class="card-bd"><button class="btn pri" data-act="retBatchPass">批量通过当前全部申请</button>' +
      '<span class="muted small" style="margin-left:10px">审核要点：营业执照/身份证真实性、门店照片与地址一致性</span></div></div>';
  };
  Act.register('retPass', el => {
    const s = S(), a = s.audits.retailer.find(x => x.id === el.getAttribute('data-id'));
    s.audits.retailer = s.audits.retailer.filter(x => x.id !== a.id);
    if (a.name === s.retailerAuth.name) s.retailerAuth.status = 'approved';
    Store.save();
    B.log('零售商资质审核通过', a.name);
    UI.toast('已通过：' + a.name + (a.name === s.retailerAuth.name ? '（演示账号已解锁拿货价）' : ''), 'ok');
    App.render();
  });
  Act.register('retReject', el => {
    const s = S(), a = s.audits.retailer.find(x => x.id === el.getAttribute('data-id'));
    s.audits.retailer = s.audits.retailer.filter(x => x.id !== a.id);
    B.log('零售商资质驳回', a.name); UI.toast('已驳回：' + a.name); App.render();
  });
  Act.register('retBatchPass', () => {
    const s = S(); const n = s.audits.retailer.length;
    s.audits.retailer.forEach(a => {
      B.log('零售商资质审核通过', a.name);
      if (a.name === s.retailerAuth.name) s.retailerAuth.status = 'approved';
    });
    s.audits.retailer = []; Store.save(); UI.toast('已批量通过 ' + n + ' 家资质申请', 'ok'); App.render();
  });

  /* ============ 商品上架审核 ============ */
  V['admin/audit-product'] = function () {
    const list = pendingProducts();
    return '<div class="page-head"><h2>商品上架审核</h2><span class="crumb">SLA：4 小时</span></div>' +
      '<div class="note">审核要点：标题与主图合规（无水印/极限词）、类目归属正确、价格合理（对比指导价与历史价）、资质与类目匹配。</div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr><th>商品</th><th class="c">类目</th><th class="r">供货价</th><th class="r">建议零售价</th><th class="c">MOQ</th><th>供应商</th><th class="c">提交时间</th><th class="c" style="width:190px">操作</th></tr></thead><tbody>' +
      (list.length ? list.map(p => {
        const up = p.retail ? Math.round((p.retail - p.price) / p.retail * 100) : 0;
        return '<tr><td><div style="display:flex;gap:10px;align-items:center"><span style="font-size:24px">' + p.e + '</span><div>' + UI.esc(p.name) + '<div class="muted small">' + UI.esc(p.spec) + '</div></div></div></td>' +
          '<td class="c">' + p.cat + '</td><td class="r">¥' + UI.money(p.price) + '</td><td class="r">¥' + UI.money(p.retail) + '</td>' +
          '<td class="c">' + p.moq + p.unit + '</td><td class="small">' + UI.esc(p.supplierName) + '</td><td class="c small">' + (p.submitAt || '-') + '</td>' +
          '<td class="c"><button class="btn sm" data-act="pDetail" data-id="' + p.id + '">查看</button> ' +
          '<button class="btn sm ok" data-act="pPass" data-id="' + p.id + '">通过</button> ' +
          '<button class="btn sm danger" data-act="pReject" data-id="' + p.id + '">驳回</button></td></tr>';
      }).join('') : '<tr><td colspan="8">' + UI.empty('暂无待审核商品', '✅') + '</td></tr>') +
      '</tbody></table></div></div>';
  };
  Act.register('pPass', el => {
    const p = B.product(el.getAttribute('data-id')); p.status = 'onSale'; p.auditMsg = '';
    B.log('商品审核通过', p.name); UI.toast('已上架：' + p.name.slice(0, 12) + '…', 'ok'); App.render();
  });
  Act.register('pReject', el => {
    const id = el.getAttribute('data-id');
    UI.modal({
      title: '驳回商品',
      body: '<div class="fld"><label>驳回原因 <span class="req">*</span></label><select class="inp" id="pjR">' +
        '<option>商品主图含水印或不符合规范</option><option>缺少类目所需资质/质检报告</option><option>类目归属错误</option><option>价格异常（高于建议零售价或涨幅过大）</option><option>标题含极限词/违规宣传</option></select></div>' +
        '<div class="fld"><label>补充说明</label><textarea class="inp" id="pjD" placeholder="将同步展示给供应商"></textarea></div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn danger" data-act="pRejectOk" data-id="' + id + '">确认驳回</button>'
    });
  });
  Act.register('pRejectOk', el => {
    const p = B.product(el.getAttribute('data-id'));
    p.status = 'rejected'; p.auditMsg = (document.getElementById('pjR') || {}).value + ((document.getElementById('pjD') || {}).value ? '：' + document.getElementById('pjD').value : '');
    B.log('商品审核驳回', p.name); UI.closeModal(); UI.toast('已驳回该商品'); App.render();
  });
  Act.register('pDetail', el => {
    const p = B.product(el.getAttribute('data-id'));
    UI.modal({
      wide: true, title: '商品审核 · ' + p.name,
      body: '<div class="row"><div style="width:220px"><div class="detail-pic" style="height:200px;font-size:80px">' + p.e + '</div></div>' +
        '<div style="flex:1"><dl class="kv">' +
        '<dt>商品标题</dt><dd>' + UI.esc(p.name) + '</dd><dt>品牌</dt><dd>' + UI.esc(p.brand) + '</dd><dt>类目</dt><dd>' + p.cat + ' / ' + (p.sub || '-') + '</dd>' +
        '<dt>规格</dt><dd>' + UI.esc(p.spec) + '</dd><dt>供货价</dt><dd>¥' + UI.money(p.price) + '</dd><dt>建议零售价</dt><dd>¥' + UI.money(p.retail) + '</dd>' +
        '<dt>MOQ / 库存</dt><dd>' + p.moq + p.unit + ' / ' + p.stock + '</dd><dt>发货地</dt><dd>' + p.from + '</dd><dt>时效</dt><dd>' + p.ship + '</dd>' +
        '<dt>供应商</dt><dd>' + UI.esc(p.supplierName) + '</dd><dt>成本价</dt><dd><span class="tag red">仅自营商品可见</span></dd>' +
        '</dl>' +
        '<div class="note small">系统校验：价格合理性 ✓　类目资质 ✓　标题敏感词 ✓　图片合规 ✓</div></div></div>',
      footer: '<button class="btn" data-act="closeModal">关闭</button><button class="btn danger" data-act="pReject" data-id="' + p.id + '">驳回</button><button class="btn ok" data-act="pPass" data-id="' + p.id + '">通过上架</button>'
    });
  });

  /* ============ 商品管理（全平台） ============ */
  V['admin/products'] = function () {
    const f = window.__apFilter || { st: '', kw: '' };
    const ps = S().products.filter(p => (!f.st || p.status === f.st) && (!f.kw || p.name.indexOf(f.kw) >= 0));
    return '<div class="page-head"><h2>商品管理</h2><span class="crumb">全平台 ' + S().products.length + ' 个商品</span></div>' +
      '<div class="filters"><input class="inp" placeholder="搜索商品名称" value="' + UI.esc(f.kw) + '" data-change="apKw">' +
      '<div class="seg">' + [['', '全部'], ['onSale', '在售'], ['pending', '待审'], ['off', '下架'], ['rejected', '驳回']].map(x =>
        '<button class="' + (f.st === x[0] ? 'on' : '') + '" data-act="apFilter" data-st="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
      '<span class="right muted">平台可强制下架违规商品、校正价格与库存</span></div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr><th>商品</th><th class="c">来源</th><th class="c">类目</th><th class="r">供货价</th><th class="c">库存</th><th class="c">销量</th><th class="c">状态</th><th class="c">操作</th></tr></thead><tbody>' +
      ps.map(p => '<tr><td><div style="display:flex;gap:10px;align-items:center"><span style="font-size:22px">' + p.e + '</span><div>' + UI.esc(p.name) + '<div class="muted small">' + UI.esc(p.brand) + '</div></div></div></td>' +
        '<td class="c">' + (p.isSelf ? '<span class="tag self">自营独代</span>' : '<span class="tag gray">供应商</span>') + '</td>' +
        '<td class="c">' + p.cat + '</td><td class="r">¥' + UI.money(p.price) + '</td><td class="c">' + p.stock + '</td><td class="c">' + p.sales + '</td>' +
        '<td class="c">' + UI.prodTag(p.status) + '</td>' +
        '<td class="c">' + (p.status === 'onSale' ? '<button class="btn sm danger" data-act="apOff" data-id="' + p.id + '">强制下架</button> ' : '<button class="btn sm ok" data-act="apOn" data-id="' + p.id + '">上架</button> ') +
        '<button class="btn sm" data-act="pDetail" data-id="' + p.id + '">详情</button></td></tr>').join('') +
      '</tbody></table></div></div>';
  };
  Act.register('apFilter', el => { window.__apFilter = window.__apFilter || { st: '', kw: '' }; window.__apFilter.st = el.getAttribute('data-st'); App.render(); });
  Act.register('apKw', el => { window.__apFilter = window.__apFilter || { st: '', kw: '' }; window.__apFilter.kw = el.value; App.render(); });
  Act.register('apOff', el => { const p = B.product(el.getAttribute('data-id')); p.status = 'off'; B.log('平台强制下架', p.name); UI.toast('已强制下架'); App.render(); });
  Act.register('apOn', el => { const p = B.product(el.getAttribute('data-id')); p.status = 'onSale'; B.log('平台商品上架', p.name); UI.toast('已上架', 'ok'); App.render(); });

  /* ============ 独代商品 ============ */
  V['admin/self'] = function () {
    const ps = S().products.filter(p => p.isSelf);
    return '<div class="page-head"><h2>平台自营独代商品</h2><span class="crumb">买断 / 独家代理经营，成本价仅财务与超管可见</span>' +
      '<div class="right"><button class="btn pri" data-act="selfNew">＋ 上传独代商品</button></div></div>' +
      UI.kpis([
        { lb: '自营 SKU', vl: ps.length, unit: '个', dt: '在售 ' + ps.filter(p => p.status === 'onSale').length + ' 个' },
        { lb: '自营 GMV（月）', vl: '¥' + UI.money(386000), dt: '<span class="up">↑ 24%</span>' },
        { lb: '平均毛利率', vl: '32.4%', dt: '目标 ≥ 30%' },
        { lb: '云仓库存周转', vl: '11.2', unit: '天', dt: '健康' }
      ]) +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr><th>商品</th><th class="c">类目</th><th class="r">成本价</th><th class="r">售价</th><th class="r">毛利率</th><th class="c">库存</th><th class="c">销量</th><th class="c">状态</th><th class="c">操作</th></tr></thead><tbody>' +
      ps.map(p => {
        const gm = p.cost ? Math.round((p.price - p.cost) / p.price * 100) : 0;
        return '<tr><td><div style="display:flex;gap:10px;align-items:center"><span style="font-size:22px">' + p.e + '</span><div>' + UI.esc(p.name) + '<div class="muted small">' + UI.esc(p.spec) + '</div></div></div></td>' +
          '<td class="c">' + p.cat + '</td><td class="r muted">¥' + UI.money(p.cost) + '</td><td class="r">¥' + UI.money(p.price) + '</td>' +
          '<td class="r"><b style="color:' + (gm >= 30 ? '#16a34a' : '#d97706') + '">' + gm + '%</b></td><td class="c">' + p.stock + '</td><td class="c">' + p.sales + '</td>' +
          '<td class="c">' + UI.prodTag(p.status) + '</td>' +
          '<td class="c"><button class="btn sm" data-act="selfEdit" data-id="' + p.id + '">编辑</button> ' +
          (p.status === 'onSale' ? '<button class="btn sm danger" data-act="apOff" data-id="' + p.id + '">下架</button>' : '<button class="btn sm ok" data-act="apOn" data-id="' + p.id + '">上架</button>') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +
      '<div class="card"><div class="card-hd"><h3>独代商品经营说明</h3></div><div class="card-bd small">' +
      '<ul style="margin:0;padding-left:18px"><li>独代商品由平台自行上传、定价与发货，供应商端不可见成本价与代工方信息。</li>' +
      '<li>售价调整实时计算毛利率，低于 25% 需超管审批。</li>' +
      '<li>库存由平台云仓管理，支持采购入库与调拨；发货走平台物流网关，24 小时内出库。</li>' +
      '<li>独代商品同样对零售商可见可购，并在前台标记「👑 平台自营」。</li></ul></div></div>';
  };
  Act.register('selfNew', () => {
    UI.modal({
      wide: true, title: '上传平台自营独代商品',
      body: '<div class="fgrid">' +
        '<div class="fld"><label>商品标题 <span class="req">*</span></label><input class="inp" id="sfName" placeholder="宠仓优选 xx 冻干猫粮 2kg*6袋"></div>' +
        '<div class="fld"><label>品牌</label><input class="inp" id="sfBrand" value="宠仓优选"></div>' +
        '<div class="fld"><label>类目</label><select class="inp" id="sfCat">' + S().categories.map(c => '<option>' + c.name + '</option>').join('') + '</select></div>' +
        '<div class="fld"><label>规格</label><input class="inp" id="sfSpec" placeholder="5kg/袋"></div>' +
        '<div class="fld"><label>成本价（元） <span class="req">*</span></label><input class="inp" id="sfCost" placeholder="13.6"></div>' +
        '<div class="fld"><label>售价（元） <span class="req">*</span></label><input class="inp" id="sfPrice" placeholder="19.9" data-change="calcGm"></div>' +
        '<div class="fld"><label>建议零售价</label><input class="inp" id="sfRetail" placeholder="26"></div>' +
        '<div class="fld"><label>MOQ</label><input class="inp" id="sfMoq" value="1"></div>' +
        '<div class="fld"><label>入库数量</label><input class="inp" id="sfStock" placeholder="10000"></div>' +
        '<div class="fld"><label>发货仓</label><select class="inp"><option>平台云仓·杭州</option><option>平台云仓·嘉兴</option><option>平台云仓·广州</option></select></div>' +
        '</div>' +
        '<div class="fld"><label>独代协议编号</label><input class="inp" id="sfAgree" placeholder="DD-2026-0188"></div>' +
        '<div class="fld"><label>代工供应商（内部可见，前端不展示）</label><input class="inp" id="sfOem" placeholder="xx 食品有限公司"></div>' +
        '<div class="fld"><label>商品主图</label><div style="display:flex;gap:8px">' +
        '<div class="upl" style="width:100px;height:70px;line-height:44px" data-act="fakeUpload" data-tag="主图1">＋ 主图1</div>' +
        '<div class="upl" style="width:100px;height:70px;line-height:44px" data-act="fakeUpload" data-tag="主图2">＋ 主图2</div>' +
        '<div class="upl" style="width:100px;height:70px;line-height:44px" data-act="fakeUpload" data-tag="详情图">＋ 详情图</div></div></div>' +
        '<div id="gmBox" class="note small">输入成本价与售价后将自动计算毛利率。</div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="selfSave">提交并上架</button>'
    });
  });
  Act.register('calcGm', () => {
    const c = Number((document.getElementById('sfCost') || {}).value), p = Number((document.getElementById('sfPrice') || {}).value);
    const box = document.getElementById('gmBox');
    if (box && c && p) {
      const gm = Math.round((p - c) / p * 100);
      box.innerHTML = '测算毛利率：<b style="color:' + (gm >= 30 ? '#16a34a' : '#d97706') + '">' + gm + '%</b>　单件毛利 ¥' + UI.money(p - c) +
        (gm < 25 ? '　<span class="tag red">低于 25%，需超管审批</span>' : '');
    }
  });
  Act.register('selfSave', () => {
    const v = id => (document.getElementById(id) || {}).value || '';
    if (!v('sfName') || !v('sfPrice')) { UI.toast('请填写商品标题与售价', 'err'); return; }
    const price = Number(v('sfPrice')), cost = Number(v('sfCost')) || price * 0.7;
    S().products.unshift({
      id: 'D' + Date.now(), name: v('sfName'), brand: v('sfBrand') || '宠仓优选', cat: v('sfCat'), e: '👑',
      spec: v('sfSpec') || '-', unit: '箱', price, cost, retail: Number(v('sfRetail')) || price * 1.3,
      moq: Number(v('sfMoq')) || 1, stock: Number(v('sfStock')) || 0, sales: 0,
      supplierId: 'PLATFORM', supplierName: '宠采通平台自营', owner: 'platform', status: 'onSale',
      shelf: '12个月', from: '平台云仓·杭州', ship: '24小时内', rate: 5, tag: '自营新品', isSelf: 1
    });
    B.log('上传自营独代商品', v('sfName'));
    UI.closeModal(); UI.toast('独代商品已上架，零售商端立即可见', 'ok'); App.render();
  });
  Act.register('selfEdit', el => {
    const p = B.product(el.getAttribute('data-id'));
    UI.modal({
      title: '编辑独代商品 · ' + p.name.slice(0, 14),
      body: '<div class="fgrid"><div class="fld"><label>售价（元）</label><input class="inp" id="edP" value="' + p.price + '" data-change="calcGm2"></div>' +
        '<div class="fld"><label>成本价（元）</label><input class="inp" id="edC" value="' + (p.cost || 0) + '" data-change="calcGm2"></div>' +
        '<div class="fld"><label>库存</label><input class="inp" id="edS" value="' + p.stock + '"></div>' +
        '<div class="fld"><label>MOQ</label><input class="inp" id="edM" value="' + p.moq + '"></div></div>' +
        '<div id="gmBox2" class="note small">当前毛利率 ' + (p.cost ? Math.round((p.price - p.cost) / p.price * 100) : 0) + '%</div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="selfEditOk" data-id="' + p.id + '">保存</button>'
    });
  });
  Act.register('calcGm2', () => {
    const c = Number((document.getElementById('edC') || {}).value), p = Number((document.getElementById('edP') || {}).value), box = document.getElementById('gmBox2');
    if (box && c && p) box.innerHTML = '测算毛利率：<b>' + Math.round((p - c) / p * 100) + '%</b>　单件毛利 ¥' + UI.money(p - c);
  });
  Act.register('selfEditOk', el => {
    const p = B.product(el.getAttribute('data-id'));
    p.price = Number((document.getElementById('edP') || {}).value) || p.price;
    p.cost = Number((document.getElementById('edC') || {}).value) || p.cost;
    p.stock = Number((document.getElementById('edS') || {}).value) || p.stock;
    p.moq = Number((document.getElementById('edM') || {}).value) || p.moq;
    B.log('修改自营商品价格', p.name); UI.closeModal(); UI.toast('已保存', 'ok'); App.render();
  });

  /* ============ 类目管理 ============ */
  V['admin/category'] = function () {
    return '<div class="page-head"><h2>类目管理</h2><span class="crumb">三级类目与资质要求配置</span></div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr><th style="width:60px">图标</th><th>一级类目</th><th>二级类目</th><th>类目资质要求</th><th class="c">商品数</th><th class="c">操作</th></tr></thead><tbody>' +
      S().categories.map(c => '<tr><td class="c" style="font-size:20px">' + c.e + '</td><td><b>' + c.name + '</b></td>' +
        '<td class="small">' + c.subs.join('、') + '</td>' +
        '<td class="small">' + (['宠物主粮', '宠物零食', '宠物保健'].indexOf(c.name) >= 0 ? '<span class="tag orange">营业执照 + 宠物饲料生产许可证</span>' : '<span class="tag gray">营业执照</span>') + '</td>' +
        '<td class="c">' + S().products.filter(p => p.cat === c.name).length + '</td>' +
        '<td class="c"><button class="btn sm" data-act="noop">编辑</button></td></tr>').join('') +
      '</tbody></table></div></div>';
  };

  /* ============ 订单管理 ============ */
  V['admin/orders'] = function () {
    const os = S().orders, f = window.__aoFilter || '';
    const show = f ? os.filter(o => o.status === f) : os;
    return '<div class="page-head"><h2>订单管理</h2><span class="crumb">全平台 ' + os.length + ' 笔</span></div>' +
      '<div class="filters"><div class="seg">' + ['', '待付款', '待接单', '待发货', '已发货', '已完成', '退款中'].map(x =>
        '<button class="' + (f === x ? 'on' : '') + '" data-act="aoFilter" data-st="' + x + '">' + (x || '全部') + '</button>').join('') + '</div>' +
      '<span class="right muted">异常订单（超时未发货/物流异常）可在此强制处理</span></div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr><th>订单号</th><th>零售商</th><th>供应商</th><th class="r">金额</th><th class="c">支付</th><th class="c">状态</th><th class="c">下单时间</th><th class="c">操作</th></tr></thead><tbody>' +
      show.map(o => '<tr><td><b>' + o.no + '</b></td><td>' + UI.esc(o.retailer) + '</td>' +
        '<td>' + (o.supplierId === 'PLATFORM' ? '<span class="tag self">自营</span>' : UI.esc(o.supplierName)) + '</td>' +
        '<td class="r">¥' + UI.money(o.pay) + '</td><td class="c small">' + (o.payType || '-') + '</td><td class="c">' + UI.tag(o.status) + '</td><td class="c small">' + o.createdAt + '</td>' +
        '<td class="c"><button class="btn sm" data-act="rOrderDetail" data-id="' + o.id + '">详情</button> ' +
        (['待付款', '待接单', '待发货'].indexOf(o.status) >= 0 ? '<button class="btn sm danger" data-act="adForceRefund" data-id="' + o.id + '">强制退款</button>' : '') + '</td></tr>').join('') +
      '</tbody></table></div></div>';
  };
  Act.register('aoFilter', el => { window.__aoFilter = el.getAttribute('data-st'); App.render(); });
  Act.register('adForceRefund', el => {
    const o = B.order(el.getAttribute('data-id'));
    UI.confirm('强制退款', '将强制关闭订单 <b>' + o.no + '</b> 并向零售商全额退款 ¥' + UI.money(o.pay) + '，责任方记为供应商。', '确认强制退款', () => {
      o.status = '已退款'; B.log('平台强制退款', o.no); UI.toast('已强制退款', 'ok'); App.render();
    });
  });

  /* ============ 退款管理 ============ */
  V['admin/refunds'] = function () {
    const rs = S().refunds;
    return '<div class="page-head"><h2>退款管理</h2><span class="crumb">平台介入仲裁，72 小时内完结</span></div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr><th>售后单号</th><th>订单</th><th>商品</th><th class="c">类型</th><th class="r">金额</th><th>原因</th><th class="c">状态</th><th class="c" style="width:180px">操作</th></tr></thead><tbody>' +
      (rs.length ? rs.map(r => '<tr><td><b>' + r.no + '</b><div class="muted small">' + r.createdAt + '</div></td>' +
        '<td class="small">' + r.orderNo + '<div class="muted">' + UI.esc(r.retailer) + '</div></td>' +
        '<td class="small">' + r.e + ' ' + UI.esc(r.name.slice(0, 14)) + '…<div class="muted">' + UI.esc(r.supplierName) + '</div></td>' +
        '<td class="c small">' + r.type + '</td><td class="r">¥' + UI.money(r.amount) + '</td>' +
        '<td class="small">' + UI.esc(r.reason) + '</td><td class="c">' + UI.asTag(r.status) + '</td>' +
        '<td class="c">' + (r.status === '待平台退款' ? '<button class="btn sm ok" data-act="rfOk" data-id="' + r.id + '">执行退款</button> ' : '') +
        (r.status === '平台介入中' ? '<button class="btn sm warn" data-act="rfArbit" data-id="' + r.id + '">仲裁</button> ' : '') +
        '<button class="btn sm" data-act="asView" data-id="' + r.id + '">详情</button></td></tr>').join('')
        : '<tr><td colspan="8">' + UI.empty('暂无退款工单') + '</td></tr>') +
      '</tbody></table></div></div>' +
      '<div class="card"><div class="card-hd"><h3>退款流程</h3></div><div class="card-bd">' +
      UI.steps(['零售商发起', '供应商处理（48h）', '平台审核/仲裁（72h）', '执行退款', '原路退回 + 结算冲抵'], 2) +
      '<div class="muted small">退款资金来源：担保账户（未结算货款）→ 平台垫付 → 结算单冲抵。责任方判定将影响供应商评分与扣分。</div></div></div>';
  };
  Act.register('rfOk', el => {
    const r = S().refunds.find(x => x.id === el.getAttribute('data-id'));
    r.status = '退款成功'; const o = B.order(r.orderId); if (o) o.status = '已退款';
    B.log('执行退款', r.no + ' ¥' + r.amount); UI.toast('退款已执行，资金原路退回', 'ok'); App.render();
  });
  Act.register('rfArbit', el => {
    const id = el.getAttribute('data-id');
    UI.modal({
      title: '平台介入仲裁',
      body: '<div class="warn small mb8">仲裁依据：商品凭证、聊天记录、物流轨迹、类目售后政策。</div>' +
        '<div class="fld"><label>责任方判定 <span class="req">*</span></label><select class="inp" id="arbWho">' +
        '<option>供应商（商品质量/临期问题）</option><option>物流（运输破损/温控异常）</option><option>平台（自营商品问题）</option><option>零售商（无理由/超期）</option></select></div>' +
        '<div class="fld"><label>处理方式</label><select class="inp" id="arbHow"><option>全额退款（不退货）</option><option>退货退款</option><option>部分退款</option><option>驳回售后申请</option></select></div>' +
        '<div class="fld"><label>退款金额（元）</label><input class="inp" id="arbAmt"></div>' +
        '<div class="fld"><label>仲裁说明</label><textarea class="inp" id="arbMsg" placeholder="将同步给买卖双方"></textarea></div>' +
        '<div class="fld"><label>附加处罚</label><label class="chk"><input type="checkbox"> 供应商扣 2 分（履约违规）</label></div>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="arbOk" data-id="' + id + '">提交仲裁结果</button>'
    });
  });
  Act.register('arbOk', el => {
    const r = S().refunds.find(x => x.id === el.getAttribute('data-id'));
    const how = (document.getElementById('arbHow') || {}).value;
    r.status = how === '驳回售后申请' ? '仲裁完成' : '退款成功';
    const amt = Number((document.getElementById('arbAmt') || {}).value); if (amt) r.amount = amt;
    if (r.status === '退款成功') { const o = B.order(r.orderId); if (o) o.status = '已退款'; }
    B.log('平台仲裁', r.no + ' → ' + (document.getElementById('arbWho') || {}).value);
    UI.closeModal(); UI.toast('仲裁结果已提交并通知双方', 'ok'); App.render();
  });

  /* ============ 财务管理 ============ */
  V['admin/finance'] = function () {
    const pays = S().orders.filter(o => o.payAt);
    return '<div class="page-head"><h2>财务管理</h2><span class="crumb">担保交易：确认收货后结算给供应商</span></div>' +
      UI.kpis([
        { lb: '平台账户余额', vl: '¥' + UI.money(1284600), dt: '含担保货款 ¥864,200' },
        { lb: '今日收款', vl: '¥' + UI.money(128600), dt: '86 笔' },
        { lb: '今日退款', vl: '¥' + UI.money(3260), dt: '4 笔' },
        { lb: '平台服务费收入', vl: '¥' + UI.money(48200), dt: '本月累计' }
      ]) +
      '<div class="card"><div class="card-hd"><h3>支付流水</h3></div><div class="tb-wrap"><table class="tb"><thead><tr><th>交易单号</th><th>订单号</th><th class="c">渠道</th><th class="r">金额</th><th class="r">货款</th><th class="r">服务费</th><th class="r">运费</th><th class="c">时间</th><th class="c">状态</th></tr></thead><tbody>' +
      pays.map(o => {
        const fee = Math.round(o.goods * 0.05 * 100) / 100;
        return '<tr><td class="small">PAY' + o.no.slice(2) + '</td><td class="small">' + o.no + '</td><td class="c small">' + (o.payType || '-') + '</td>' +
          '<td class="r">¥' + UI.money(o.pay) + '</td><td class="r">¥' + UI.money(o.goods) + '</td><td class="r">¥' + UI.money(fee) + '</td><td class="r">¥' + UI.money(o.freight) + '</td>' +
          '<td class="c small">' + o.payAt + '</td><td class="c"><span class="tag green">已分账</span></td></tr>';
      }).join('') + '</tbody></table></div></div>';
  };

  /* ============ 结算管理 ============ */
  V['admin/settle'] = function () {
    const sts = S().settlements;
    return '<div class="page-head"><h2>结算管理</h2><span class="crumb">制单与复核分离，需双人确认</span></div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr><th>结算单号</th><th>供应商</th><th>周期</th><th class="r">应付</th><th class="c">状态</th><th class="c">打款时间</th><th class="c">操作</th></tr></thead><tbody>' +
      sts.map(x => '<tr><td><b>' + x.no + '</b></td><td>' + UI.esc(x.supplierName) + '</td><td class="small">' + x.period + '</td>' +
        '<td class="r">¥' + UI.money(x.pay) + '</td><td class="c">' + UI.tag(x.status, { '已打款': 'green', '待财务复核': 'orange', '待供应商确认': 'blue' }) + '</td>' +
        '<td class="c small">' + (x.at || '-') + '</td>' +
        '<td class="c">' + (x.status === '待财务复核' ? '<button class="btn sm pri" data-act="stPay" data-id="' + x.id + '">复核并打款</button> ' : '') +
        '<button class="btn sm" data-act="stView" data-id="' + x.id + '">明细</button></td></tr>').join('') +
      '</tbody></table></div></div>' +
      '<div class="card"><div class="card-hd"><h3>提现审核</h3></div><div class="card-bd">' +
      '<div class="muted small">当前无待审核的提现申请。</div></div></div>';
  };
  Act.register('stPay', el => {
    const x = S().settlements.find(v => v.id === el.getAttribute('data-id'));
    x.status = '已打款'; x.at = U.now(); B.log('结算单复核打款', x.no + ' ¥' + x.pay);
    UI.toast('已复核并完成打款', 'ok'); App.render();
  });

  /* ============ 物流管理 ============ */
  V['admin/logistics'] = function () {
    const os = S().orders.filter(o => o.ship);
    return '<div class="page-head"><h2>物流管理</h2><span class="crumb">承运商、轨迹与异常预警</span></div>' +
      '<div class="row"><div class="card" style="flex:1;min-width:280px"><div class="card-hd"><h3>承运商配置</h3></div><div class="card-bd tight">' +
      [['德邦物流', '大件快运 · 时效 2-3 天', 'green'], ['京东物流', '仓配一体 · 次日达', 'green'], ['中通快运', '经济快运 · 3-4 天', 'green'], ['顺丰速运', '保健专送 · 48 小时', 'orange']]
        .map(c => '<div class="ci"><div class="p">🚚</div><div class="n"><div class="t">' + c[0] + '</div><div class="s">' + c[1] + '</div></div><span class="tag ' + c[2] + '">合作中</span></div>').join('') +
      '</div></div>' +
      '<div class="card" style="flex:1;min-width:280px"><div class="card-hd"><h3>时效达成率</h3></div><div class="card-bd">' +
      UI.bars([{ k: '24h', v: 62, hi: true }, { k: '48h', v: 88 }, { k: '72h', v: 96 }, { k: '>72h', v: 100 }]) +
      '<div class="chart-legend"><span>48 小时发货率 <b>95.2%</b>（考核目标 ≥ 95%）</span></div></div></div></div>' +
      '<div class="card"><div class="card-hd"><h3>在途运单</h3></div><div class="tb-wrap"><table class="tb"><thead><tr><th>运单号</th><th>承运商</th><th>订单号</th><th>最新节点</th><th class="c">更新时间</th><th class="c">状态</th><th class="c">操作</th></tr></thead><tbody>' +
      os.map(o => '<tr><td class="small"><b>' + o.ship.no + '</b></td><td>' + o.ship.company + '</td><td class="small">' + o.no + '</td>' +
        '<td class="small">' + o.ship.tracks[o.ship.tracks.length - 1].n + '</td><td class="c small">' + o.ship.tracks[o.ship.tracks.length - 1].t + '</td>' +
        '<td class="c"><span class="tag blue">在途</span></td><td class="c"><button class="btn sm" data-act="lgView" data-id="' + o.id + '">轨迹</button></td></tr>').join('') +
      '</tbody></table></div></div>' +
      '<div class="card"><div class="card-hd"><h3>异常预警</h3></div><div class="card-bd tight">' +
      '<div class="ci"><div class="p">⚠️</div><div class="n"><div class="t">ZTO778899001 派送超 48 小时未更新</div><div class="s">订单 YC2610270005（退款中）· 已通知承运商加急</div></div><span class="tag red">滞留</span></div>' +
      '<div class="ci"><div class="p">⚠️</div><div class="n"><div class="t">保健类订单 YC2611010003 待接单超 24 小时</div><div class="s">康宠动物保健（上海）有限公司 · 已发送预警</div></div><span class="tag orange">超时预警</span></div>' +
      '</div></div>';
  };
  Act.register('lgView', el => {
    const o = B.order(el.getAttribute('data-id'));
    UI.modal({ title: '物流轨迹 · ' + o.ship.no, body: '<div class="small mb8">' + o.ship.company + '　' + o.no + '</div>' + UI.timeline(o.ship.tracks) });
  });

  /* ============ 客服工单 ============ */
  V['admin/tickets'] = function () {
    const ts = S().tickets;
    return '<div class="page-head"><h2>客服工单</h2><span class="crumb">SLA：2 小时首响，72 小时完结</span></div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr><th>工单号</th><th class="c">类型</th><th>来源</th><th>标题</th><th class="c">优先级</th><th class="c">处理人</th><th class="c">状态</th><th class="c">操作</th></tr></thead><tbody>' +
      ts.map(t => '<tr><td><b>' + t.no + '</b><div class="muted small">' + t.at + '</div></td><td class="c small">' + t.type + '</td>' +
        '<td class="small">' + UI.esc(t.from) + '<div class="muted">' + (t.orderNo || '无关联订单') + '</div></td>' +
        '<td class="small">' + UI.esc(t.title) + '</td>' +
        '<td class="c">' + UI.tag(t.level, { '高': 'red', '中': 'orange', '低': 'gray' }) + '</td>' +
        '<td class="c small">' + (t.owner || '未分配') + '</td><td class="c">' + UI.tag(t.status, { '待处理': 'orange', '处理中': 'blue', '已完结': 'green' }) + '</td>' +
        '<td class="c"><button class="btn sm" data-act="tkView" data-id="' + t.id + '">处理</button></td></tr>').join('') +
      '</tbody></table></div></div>';
  };
  Act.register('tkView', el => {
    const t = S().tickets.find(x => x.id === el.getAttribute('data-id'));
    UI.modal({
      wide: true, title: '工单处理 · ' + t.no,
      body: '<div class="small mb8">' + UI.esc(t.from) + '　类型：' + t.type + '　关联订单：' + (t.orderNo || '-') + '</div>' +
        '<div class="chat" style="height:260px"><div class="msgs" id="tkMsgs">' +
        t.msgs.map(m => '<div class="msg ' + (m.me ? 'me' : 'them') + '">' + UI.esc(m.t) + '<div class="tm">' + m.at + '</div></div>').join('') +
        '</div><div class="ipt"><input class="inp" id="tkIn" placeholder="输入回复内容"><button class="btn pri" data-act="tkSend" data-id="' + t.id + '">回复</button></div></div>' +
        '<div class="row mt12"><select class="inp" style="max-width:180px" id="tkSt"><option>处理中</option><option>已完结</option></select>' +
        '<button class="btn" data-act="tkAssign" data-id="' + t.id + '">转派给客服 · 小云</button></div>',
      footer: '<button class="btn" data-act="closeModal">关闭</button><button class="btn pri" data-act="tkSave" data-id="' + t.id + '">保存并通知</button>'
    });
  });
  Act.register('tkSend', el => {
    const t = S().tickets.find(x => x.id === el.getAttribute('data-id'));
    const i = document.getElementById('tkIn'); if (!i.value.trim()) return;
    t.msgs.push({ me: true, t: i.value, at: U.now() }); Store.save();
    document.getElementById('tkMsgs').insertAdjacentHTML('beforeend', '<div class="msg me">' + UI.esc(i.value) + '<div class="tm">' + U.now() + '</div></div>');
    i.value = '';
  });
  Act.register('tkAssign', el => {
    const t = S().tickets.find(x => x.id === el.getAttribute('data-id'));
    t.owner = '客服 · 小云'; t.status = '处理中'; Store.save(); B.log('工单转派', t.no + ' → 小云'); UI.toast('已转派给客服 · 小云', 'ok'); App.render();
  });
  Act.register('tkSave', el => {
    const t = S().tickets.find(x => x.id === el.getAttribute('data-id'));
    t.status = (document.getElementById('tkSt') || {}).value || t.status;
    Store.save(); UI.closeModal(); UI.toast('工单已更新并通知用户', 'ok'); App.render();
  });

  /* ============ 内容运营 ============ */
  V['admin/content'] = function () {
    return '<div class="page-head"><h2>内容运营</h2><span class="crumb">Banner / 公告 / 规则</span></div>' +
      '<div class="card"><div class="card-hd"><h3>首页 Banner</h3><div class="right"><button class="btn pri sm" data-act="noop">＋ 新增 Banner</button></div></div><div class="tb-wrap"><table class="tb"><thead><tr><th>标题</th><th>副标题</th><th class="c">投放对象</th><th class="c">上下线时间</th><th class="c">状态</th><th class="c">操作</th></tr></thead><tbody>' +
      S().banners.map(b => '<tr><td>' + UI.esc(b.t) + '</td><td class="small muted">' + UI.esc(b.s) + '</td><td class="c">全部零售商</td><td class="c small">2026-10-25 ~ 2026-11-15</td><td class="c"><span class="tag green">投放中</span></td><td class="c"><button class="btn sm" data-act="noop">编辑</button></td></tr>').join('') +
      '</tbody></table></div></div>' +
      '<div class="card"><div class="card-hd"><h3>平台公告</h3><div class="right"><button class="btn pri sm" data-act="noticeNew">＋ 发布公告</button></div></div><div class="tb-wrap"><table class="tb"><thead><tr><th>公告标题</th><th class="c">接收方</th><th class="c">发布时间</th><th class="c">操作</th></tr></thead><tbody>' +
      S().notices.map(n => '<tr><td>' + UI.esc(n.title) + '</td><td class="c">' + n.to + '</td><td class="c small">' + n.at + '</td><td class="c"><button class="btn sm" data-act="noop">编辑</button></td></tr>').join('') +
      '</tbody></table></div></div>' +
      '<div class="card"><div class="card-hd"><h3>规则与协议版本</h3></div><div class="card-bd small">' +
      '<div class="mb8">《平台服务协议》 v3.2（2026-09-01 生效）</div>' +
      '<div class="mb8">《商品质量承诺》 v2.0（2026-06-15 生效）</div>' +
      '<div class="mb8">《售后与退款规则》 v4.1（2026-10-01 生效）</div>' +
      '<div>《违规处罚规则》 v1.8（2026-08-20 生效）</div></div></div>';
  };
  Act.register('noticeNew', () => {
    UI.modal({
      title: '发布公告',
      body: '<div class="fld"><label>公告标题</label><input class="inp" id="ntT"></div>' +
        '<div class="fld"><label>接收方</label><select class="inp" id="ntTo"><option>零售商</option><option>供应商</option><option>全部</option></select></div>' +
        '<div class="fld"><label>内容</label><textarea class="inp" id="ntC"></textarea></div>' +
        '<label class="chk"><input type="checkbox" checked> 同时推送站内信与短信</label>',
      footer: '<button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-act="noticeOk">发布</button>'
    });
  });
  Act.register('noticeOk', () => {
    const t = (document.getElementById('ntT') || {}).value;
    if (!t) { UI.toast('请填写公告标题', 'err'); return; }
    S().notices.unshift({ id: 'N' + Date.now(), title: t, at: U.now(), to: (document.getElementById('ntTo') || {}).value });
    B.log('发布平台公告', t); UI.closeModal(); UI.toast('公告已发布', 'ok'); App.render();
  });

  /* ============ 账号权限 ============ */
  V['admin/account'] = function () {
    return '<div class="page-head"><h2>账号与权限</h2><span class="crumb">RBAC 角色授权，操作留痕</span></div>' +
      '<div class="card"><div class="card-hd"><h3>内部角色</h3><div class="right"><button class="btn pri sm" data-act="noop">＋ 新建角色</button></div></div><div class="tb-wrap"><table class="tb"><thead><tr><th>角色</th><th>权限范围</th><th class="c">人数</th><th class="c">数据范围</th><th class="c">操作</th></tr></thead><tbody>' +
      [['超级管理员', '全部功能，含成本价与资金操作', 2, '全平台'], ['审核专员', '入驻审核、资质审核、商品审核', 6, '按类目'], ['品类运营', '商品治理、独代经营、活动配置', 5, '按类目/区域'], ['客服', '工单处理、IM 会话、售后协助', 8, '全平台'], ['财务', '结算、提现复核、发票、对账', 3, '全平台（资金）'], ['仓储物流', '云仓库存、发货、物流异常', 4, '按仓库']]
        .map(r => '<tr><td><b>' + r[0] + '</b></td><td class="small">' + r[1] + '</td><td class="c">' + r[2] + '</td><td class="c small">' + r[3] + '</td><td class="c"><button class="btn sm" data-act="noop">配置</button></td></tr>').join('') +
      '</tbody></table></div></div>' +
      '<div class="card"><div class="card-hd"><h3>账号列表</h3></div><div class="tb-wrap"><table class="tb"><thead><tr><th>姓名</th><th class="c">角色</th><th>登录账号</th><th class="c">双因子</th><th class="c">最近登录</th><th class="c">状态</th><th class="c">操作</th></tr></thead><tbody>' +
      [['林薇', '品类运营', 'linwei', '2026-11-02 09:41'], ['何以', '审核专员', 'heyi', '2026-11-02 09:12'], ['周舟', '财务', 'zhouzhou', '2026-11-01 18:22'], ['小云', '客服', 'xiaoyun', '2026-11-02 08:55']]
        .map(a => '<tr><td>' + a[0] + '</td><td class="c">' + a[1] + '</td><td class="small">' + a[2] + '@yuncaitong.com</td><td class="c"><span class="tag green">已开启</span></td><td class="c small">' + a[3] + '</td><td class="c"><span class="tag green">启用</span></td><td class="c"><button class="btn sm" data-act="noop">停用</button></td></tr>').join('') +
      '</tbody></table></div></div>';
  };

  /* ============ 操作日志 ============ */
  V['admin/logs'] = function () {
    return '<div class="page-head"><h2>操作日志</h2><span class="crumb">关键操作留痕，保留 ≥ 3 年</span></div>' +
      '<div class="card"><div class="tb-wrap"><table class="tb"><thead><tr><th class="c">时间</th><th>操作人</th><th class="c">角色</th><th>操作</th><th>对象</th><th class="c">IP</th></tr></thead><tbody>' +
      S().logs.map(l => '<tr><td class="c small">' + l.at + '</td><td>' + UI.esc(l.who) + '</td><td class="c small">' + l.role + '</td><td>' + UI.esc(l.act) + '</td><td class="small">' + UI.esc(l.obj) + '</td><td class="c small">' + l.ip + '</td></tr>').join('') +
      '</tbody></table></div></div>' +
      '<div class="card"><div class="card-bd"><button class="btn" data-act="noop">导出日志（CSV）</button><span class="muted small" style="margin-left:10px">仅超管可导出，导出行为同样记录留痕</span></div></div>';
  };
})();
