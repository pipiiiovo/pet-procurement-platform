/* 宠采通 原型 · 状态管理（localStorage 持久化 + 动作注册表） */
(function () {
  const KEY = 'yct_prototype_v3_pet';

  const Store = {
    state: null,
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) { this.state = JSON.parse(raw); return; }
      } catch (e) { }
      this.state = JSON.parse(JSON.stringify(window.SEED));
      this.save();
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (e) { } },
    reset() { this.state = JSON.parse(JSON.stringify(window.SEED)); this.save(); },
    get s() { return this.state; }
  };

  /* ---------- 工具 ---------- */
  const pad = n => String(n).padStart(2, '0');
  const now = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const money = n => (Math.round(n * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const dayOffset = (d, off) => { const x = new Date(d.getTime() + off * 86400000); return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()) + ' ' + pad(x.getHours()) + ':' + pad(x.getMinutes()); };

  /* ---------- 动作注册表 ---------- */
  const Act = {
    map: {},
    register(name, fn) { this.map[name] = fn; },
    run(name, el, ev) {
      const fn = this.map[name];
      if (!fn) { console.warn('未注册动作:' + name); return; }
      fn(el, ev);
    }
  };

  /* ---------- 业务方法 ---------- */
  const B = {
    product(pid) { return Store.s.products.find(p => p.id === pid); },
    order(id) { return Store.s.orders.find(o => o.id === id); },
    /* 阶梯价 */
    tierPrice(p, qty) {
      const ts = p.tiers || [{ min: 1, p: p.price }];
      for (const t of ts) { if (qty >= t.min && (!t.max || qty <= t.max)) return t.p; }
      return ts[ts.length - 1].p;
    },
    cartAdd(pid, qty) {
      const s = Store.s, p = B.product(pid); if (!p) return;
      const ex = s.cart.find(c => c.pid === pid);
      if (ex) ex.qty += qty; else s.cart.push({ pid, qty });
      Store.save();
    },
    cartSet(pid, qty) {
      const s = Store.s, c = s.cart.find(x => x.pid === pid);
      if (!c) return;
      if (qty <= 0) s.cart = s.cart.filter(x => x.pid !== pid); else c.qty = qty;
      Store.save();
    },
    cartClear(ids) {
      const s = Store.s;
      s.cart = ids ? s.cart.filter(c => ids.indexOf(c.pid) < 0) : [];
      Store.save();
    },
    /* 下单：按供应商拆单 */
    placeOrder(addrId, payType, remark) {
      const s = Store.s;
      const addr = s.addresses.find(a => a.id === addrId) || s.addresses[0];
      const groups = {};
      s.cart.forEach(c => {
        const p = B.product(c.pid); if (!p) return;
        const key = p.owner === 'platform' ? 'PLATFORM' : p.supplierId;
        (groups[key] = groups[key] || []).push({ p, qty: c.qty });
      });
      const created = [];
      Object.keys(groups).forEach(k => {
        const items = groups[k];
        let goods = 0;
        const its = items.map(it => {
          const price = B.tierPrice(it.p, it.qty);
          goods += price * it.qty;
          return { pid: it.p.id, name: it.p.name, e: it.p.e, spec: it.p.spec, price, qty: it.qty, unit: it.p.unit };
        });
        const freight = goods >= 1000 ? 0 : 20;
        const seq = s.seq.order++;
        const o = {
          id: 'O' + Date.now() + '_' + seq,
          no: 'YC' + String(new Date().getFullYear()).slice(2) + pad(new Date().getMonth() + 1) + pad(new Date().getDate()) + '000' + seq,
          retailer: s.retailerAuth.name, retailerId: s.retailerAuth.id,
          supplierId: k, supplierName: k === 'PLATFORM' ? '宠采通平台自营' : (s.suppliers.find(x => x.id === k) || {}).name || '',
          items: its, goods: Math.round(goods * 100) / 100, freight, discount: 0,
          pay: Math.round((goods + freight) * 100) / 100,
          payType, status: '待付款', createdAt: now(), payAt: '',
          addr: { name: addr.name, phone: addr.phone, addr: addr.addr },
          ship: null, remark: remark || ''
        };
        s.orders.unshift(o); created.push(o);
      });
      B.cartClear();
      Store.save();
      return created;
    },
    payOrder(id, method) {
      const o = B.order(id); if (!o) return;
      o.status = o.supplierId === 'PLATFORM' ? '待发货' : '待接单';
      o.payType = method; o.payAt = now();
      Store.save();
    },
    shipOrder(id, company, no) {
      const o = B.order(id); if (!o) return;
      o.status = '已发货';
      o.ship = {
        company, no, at: now(),
        tracks: [
          { t: now(), n: '已发货，等待揽收', l: o.supplierId === 'PLATFORM' ? '平台云仓·杭州' : '供应商仓库' },
          { t: now(), n: '承运商已揽收', l: '转运中心' },
          { t: now(), n: '运输中', l: '发往 ' + (o.addr.addr || '').slice(0, 6) }
        ]
      };
      Store.save();
    },
    receiveOrder(id) {
      const o = B.order(id); if (!o) return;
      o.status = '已完成';
      if (o.ship) o.ship.tracks.push({ t: now(), n: '已签收，签收人：本人', l: (o.addr.addr || '').slice(0, 10) });
      Store.save();
    },
    /* 刷新轨迹（演示：向承运商拉取最新节点） */
    refreshTrack(id) {
      const o = B.order(id); if (!o || !o.ship) return;
      o.ship.tracks.push({ t: now(), n: '【已同步】快件到达【' + (o.addr.addr || '').slice(0, 6) + '】派送网点，正在安排派送', l: (o.addr.addr || '').slice(0, 10) });
      Store.save();
    },
    /* 地址管理 */
    addrAdd(a) {
      const s = Store.s;
      s.addresses.push(Object.assign({ id: 'AD' + Date.now(), def: s.addresses.length ? 0 : 1 }, a));
      Store.save();
    },
    addrUpdate(id, a) { const x = Store.s.addresses.find(v => v.id === id); if (x) Object.assign(x, a); Store.save(); },
    addrDel(id) {
      const s = Store.s;
      const was = (s.addresses.find(v => v.id === id) || {}).def;
      s.addresses = s.addresses.filter(v => v.id !== id);
      if (was && s.addresses[0]) s.addresses[0].def = 1;
      Store.save();
    },
    addrDefault(id) { Store.s.addresses.forEach(a => a.def = a.id === id ? 1 : 0); Store.save(); },
    /* 资质认证 */
    submitCert(data) {
      const s = Store.s;
      s.retailerAuth = Object.assign({}, s.retailerAuth, data, { status: 'pending' });
      s.certForm = data; Store.save();
      s.audits.retailer.unshift({
        id: 'RA' + Date.now(), name: data.name || s.retailerAuth.name, type: data.type || '企业',
        code: data.code || '-', addr: data.addr || '-', contact: data.contact || '-', phone: data.phone || '-',
        files: 3, status: 'pending', submitAt: now()
      });
      Store.save();
    },
    /* 售后：撤销 / 买家退货发货 / 催办 */
    cancelRefund(id) {
      const s = Store.s, r = s.refunds.find(x => x.id === id); if (!r) return;
      r.status = '已撤销';
      (r.logs = r.logs || []).push({ t: now(), n: '零售商撤销售后申请', by: s.retailerAuth.name });
      const o = B.order(r.orderId); if (o && o.status === '退款中') o.status = o.ship ? '已发货' : '待发货';
      Store.save();
    },
    urgeRefund(id) {
      const r = Store.s.refunds.find(x => x.id === id); if (!r) return;
      r.urged = (r.urged || 0) + 1;
      (r.logs = r.logs || []).push({ t: now(), n: '零售商催办（第 ' + r.urged + ' 次）', by: '系统' });
      Store.save();
    },
    returnShip(id, company, no) {
      const r = Store.s.refunds.find(x => x.id === id); if (!r) return;
      r.return = { company, no, at: now() };
      r.status = '待卖家收货';
      (r.logs = r.logs || []).push({ t: now(), n: '零售商已寄回商品：' + company + ' ' + no, by: Store.s.retailerAuth.name });
      Store.save();
    },
    closeOrder(id) { const o = B.order(id); if (o) { o.status = '已关闭'; Store.save(); } },
    addRefund(data) {
      const s = Store.s, seq = s.seq.refund++;
      const r = Object.assign({
        id: 'A' + Date.now(), no: 'AS' + String(new Date().getFullYear()).slice(2) + pad(new Date().getMonth() + 1) + pad(new Date().getDate()) + '00' + seq,
        status: '待供应商处理', createdAt: now(), dueAt: dayOffset(new Date(), 2),
        logs: [{ t: now(), n: '零售商提交售后申请', by: Store.s.retailerAuth.name }]
      }, data);
      s.refunds.unshift(r);
      const o = B.order(r.orderId); if (o) o.status = '退款中';
      Store.save(); return r;
    },
    addTicket(data) {
      const s = Store.s;
      const t = Object.assign({ id: 'T' + Date.now(), no: 'TK' + String(Date.now()).slice(-8), status: '待处理', owner: '', at: now(), msgs: [] }, data);
      s.tickets.unshift(t); Store.save(); return t;
    },
    log(act, obj) {
      Store.s.logs.unshift({ at: now(), who: '平台运营 · 林薇', role: '平台', act, obj, ip: '10.12.3.21' });
      Store.save();
    }
  };

  window.Store = Store;
  window.Act = Act;
  window.B = B;
  window.U = { now, money, pad, day: off => dayOffset(new Date(), off), dayOffset };
})();
