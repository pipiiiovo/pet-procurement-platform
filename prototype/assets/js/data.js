/* 宠采通 原型 · Mock 数据种子（宠物用品业态） */
window.SEED = (function () {
  const now = new Date('2026-11-02T10:00:00');
  const fmt = (d, off) => {
    const x = new Date(now.getTime() + (off || 0) * 86400000);
    const p = n => String(n).padStart(2, '0');
    return x.getFullYear() + '-' + p(x.getMonth() + 1) + '-' + p(x.getDate()) + ' ' + p(x.getHours()) + ':' + p(x.getMinutes());
  };

  const categories = [
    { name: '宠物主粮', e: '🐱', subs: ['猫粮', '狗粮', '幼宠粮', '处方粮'] },
    { name: '宠物零食', e: '🍖', subs: ['肉干冻干', '磨牙洁齿', '猫条妙鲜包', '罐头湿粮'] },
    { name: '猫砂清洁', e: '🧴', subs: ['膨润土猫砂', '豆腐猫砂', '除臭清洁', '猫砂盆具'] },
    { name: '宠物保健', e: '💊', subs: ['体内外驱虫', '营养补充', '关节皮毛', '口腔护理'] },
    { name: '宠物玩具', e: '🧶', subs: ['猫抓板', '逗猫棒', '咬胶玩具', '益智漏食'] },
    { name: '牵引出行', e: '🦮', subs: ['牵引绳', '胸背项圈', '航空箱包', '车载用品'] },
    { name: '窝垫服饰', e: '🛏️', subs: ['窝垫猫窝', '宠物服饰', '毯子床垫', '爬架跳台'] },
    { name: '洗护美容', e: '🧼', subs: ['洗护香波', '梳剪工具', '美甲洁耳', '剃毛电器'] }
  ];

  const suppliers = [
    { id: 'S01', name: '宠悦宠物食品（杭州）有限公司', code: '91330100MA2XXXXX1A', cat: '宠物主粮 / 宠物零食', contact: '张伟', phone: '13800001111', level: 'A', rate: 4.8, settle: 'T+7', status: 'approved', createdAt: fmt(null, -186), sales: 1286000 },
    { id: 'S02', name: '喵趣猫砂（江苏）有限公司', code: '91330100MA2YYYYY2B', cat: '猫砂清洁', contact: '李敏', phone: '13800002222', level: 'A', rate: 4.7, settle: '月结', status: 'approved', createdAt: fmt(null, -240), sales: 986000 },
    { id: 'S03', name: '康宠动物保健（上海）有限公司', code: '91330100MA2ZZZZZ3C', cat: '宠物保健', contact: '王强', phone: '13800003333', level: 'B', rate: 4.5, settle: 'T+7', status: 'approved', createdAt: fmt(null, -120), sales: 642000 },
    { id: 'S04', name: '趣宠宠物用品（义乌）有限公司', code: '91330100MA2AAAAA4D', cat: '宠物玩具 / 牵引出行', contact: '陈静', phone: '13800004444', level: 'B', rate: 4.6, settle: 'T+7', status: 'approved', createdAt: fmt(null, -95), sales: 431000 },
    { id: 'S05', name: '优宠供应链（上海）有限公司', code: '91330100MA2BBBBB5E', cat: '窝垫服饰 / 洗护美容', contact: '赵磊', phone: '13800005555', level: 'A', rate: 4.9, settle: '月结', status: 'approved', createdAt: fmt(null, -310), sales: 1580000 }
  ];

  const products = [
    { id: 'P1001', name: '皇家 成猫全价粮 2kg*6袋 整箱装', brand: '皇家', cat: '宠物主粮', sub: '猫粮', e: '🐱', spec: '2kg*6袋/箱', unit: '箱', price: 268.0, retail: 368, tiers: [{ min: 1, max: 9, p: 268 }, { min: 10, max: 49, p: 252 }, { min: 50, p: 236 }], moq: 1, stock: 8600, sales: 4820, supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', owner: 'supplier', status: 'onSale', shelf: '18个月', from: '浙江杭州', ship: '48小时内', rate: 4.9, tag: '热销' },
    { id: 'P1002', name: '麦富迪 牛肉双拼全价狗粮 10kg*2袋', brand: '麦富迪', cat: '宠物主粮', sub: '狗粮', e: '🐶', spec: '10kg*2袋/箱', unit: '箱', price: 198.0, retail: 278, tiers: [{ min: 1, max: 9, p: 198 }, { min: 10, max: 39, p: 186 }, { min: 40, p: 174 }], moq: 1, stock: 3200, sales: 1680, supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', owner: 'supplier', status: 'onSale', shelf: '18个月', from: '山东聊城', ship: '48小时内', rate: 4.8, tag: '热销' },
    { id: 'P1003', name: '渴望 无谷六种鱼全价猫粮 5.4kg*2袋', brand: '渴望', cat: '宠物主粮', sub: '猫粮', e: '🐟', spec: '5.4kg*2袋/箱', unit: '箱', price: 620.0, retail: 820, tiers: [{ min: 1, max: 19, p: 620 }, { min: 20, p: 578 }], moq: 1, stock: 4100, sales: 2310, supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', owner: 'supplier', status: 'onSale', shelf: '18个月', from: '加拿大原装进口', ship: '48小时内', rate: 4.9, tag: '' },
    { id: 'P1004', name: '麦富迪 鸡肉干 200g*20袋 整箱', brand: '麦富迪', cat: '宠物零食', sub: '肉干冻干', e: '🍗', spec: '200g*20袋/箱', unit: '箱', price: 96.0, retail: 138, tiers: [{ min: 1, max: 9, p: 96 }, { min: 10, max: 29, p: 89 }, { min: 30, p: 82 }], moq: 1, stock: 2600, sales: 1420, supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', owner: 'supplier', status: 'onSale', shelf: '12个月', from: '山东聊城', ship: '48小时内', rate: 4.8, tag: '热销' },
    { id: 'P1005', name: '珍致 猫条妙鲜包 14g*30条*10盒', brand: '珍致', cat: '宠物零食', sub: '猫条妙鲜包', e: '🐾', spec: '14g*30条*10盒/箱', unit: '箱', price: 128.0, retail: 178, tiers: [{ min: 1, max: 19, p: 128 }, { min: 20, p: 118 }], moq: 2, stock: 3900, sales: 1980, supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', owner: 'supplier', status: 'onSale', shelf: '12个月', from: '上海', ship: '48小时内', rate: 4.7, tag: '' },
    { id: 'P1006', name: '希宝 鸡肉冻干 80g*12罐 整箱', brand: '希宝', cat: '宠物零食', sub: '肉干冻干', e: '🥫', spec: '80g*12罐/箱', unit: '箱', price: 268.0, retail: 368, tiers: [{ min: 1, max: 4, p: 268 }, { min: 5, p: 248 }], moq: 1, stock: 980, sales: 620, supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', owner: 'supplier', status: 'onSale', shelf: '12个月', from: '泰国原装进口', ship: '48小时内', rate: 4.8, tag: '' },
    { id: 'P1007', name: '喵趣 膨润土结团猫砂 10kg*4袋 整箱', brand: '喵趣', cat: '猫砂清洁', sub: '膨润土猫砂', e: '🧴', spec: '10kg*4袋/箱', unit: '箱', price: 78.0, retail: 118, tiers: [{ min: 1, max: 9, p: 78 }, { min: 10, p: 71 }], moq: 1, stock: 1560, sales: 940, supplierId: 'S02', supplierName: '喵趣猫砂（江苏）有限公司', owner: 'supplier', status: 'onSale', shelf: '3年', from: '江苏南通', ship: '48小时内', rate: 4.9, tag: '热销' },
    { id: 'P1008', name: '喵趣 豆腐混合猫砂 6L*6包 整箱', brand: '喵趣', cat: '猫砂清洁', sub: '豆腐猫砂', e: '🫘', spec: '6L*6包/箱', unit: '箱', price: 108.0, retail: 158, tiers: [{ min: 1, max: 19, p: 108 }, { min: 20, p: 98 }], moq: 1, stock: 2400, sales: 1160, supplierId: 'S02', supplierName: '喵趣猫砂（江苏）有限公司', owner: 'supplier', status: 'onSale', shelf: '24个月', from: '江苏南通', ship: '48小时内', rate: 4.8, tag: '' },
    { id: 'P1009', name: '大宠爱 体外驱虫滴剂 猫用 3支*10盒', brand: '大宠爱', cat: '宠物保健', sub: '体内外驱虫', e: '💊', spec: '3支*10盒/箱', unit: '箱', price: 268.0, retail: 398, tiers: [{ min: 1, max: 9, p: 268 }, { min: 10, p: 248 }], moq: 1, stock: 3400, sales: 2080, supplierId: 'S03', supplierName: '康宠动物保健（上海）有限公司', owner: 'supplier', status: 'onSale', shelf: '24个月', from: '上海', ship: '48小时内', rate: 4.8, tag: '热销' },
    { id: 'P1010', name: '卫仕 宠物复合维生素 200片*12瓶', brand: '卫仕', cat: '宠物保健', sub: '营养补充', e: '🧪', spec: '200片*12瓶/箱', unit: '箱', price: 88.0, retail: 128, tiers: [{ min: 1, max: 9, p: 88 }, { min: 10, p: 80 }], moq: 1, stock: 1800, sales: 880, supplierId: 'S03', supplierName: '康宠动物保健（上海）有限公司', owner: 'supplier', status: 'onSale', shelf: '24个月', from: '上海', ship: '72小时内', rate: 4.7, tag: '' },
    { id: 'P1011', name: '趣宠 瓦楞纸猫抓板 大号 10个/箱', brand: '趣宠', cat: '宠物玩具', sub: '猫抓板', e: '🧶', spec: '10个/箱', unit: '箱', price: 62.0, retail: 89, tiers: [{ min: 1, max: 19, p: 62 }, { min: 20, max: 99, p: 57 }, { min: 100, p: 52 }], moq: 1, stock: 5800, sales: 3260, supplierId: 'S04', supplierName: '趣宠宠物用品（义乌）有限公司', owner: 'supplier', status: 'onSale', shelf: '长期', from: '浙江义乌', ship: '48小时内', rate: 4.9, tag: '热销' },
    { id: 'P1012', name: '趣宠 自动伸缩牵引绳 5m 20条/箱', brand: '趣宠', cat: '牵引出行', sub: '牵引绳', e: '🦮', spec: '20条/箱', unit: '箱', price: 72.0, retail: 102, tiers: [{ min: 1, max: 9, p: 72 }, { min: 10, p: 66 }], moq: 1, stock: 4200, sales: 1740, supplierId: 'S04', supplierName: '趣宠宠物用品（义乌）有限公司', owner: 'supplier', status: 'onSale', shelf: '长期', from: '浙江义乌', ship: '72小时内', rate: 4.7, tag: '' },
    { id: 'P1013', name: '优宠 冬季加厚宠物窝垫 M码 8个/箱', brand: '优宠', cat: '窝垫服饰', sub: '窝垫猫窝', e: '🛏️', spec: '8个/箱', unit: '箱', price: 138.0, retail: 188, tiers: [{ min: 1, max: 9, p: 138 }, { min: 10, p: 126 }], moq: 1, stock: 1600, sales: 720, supplierId: 'S05', supplierName: '优宠供应链（上海）有限公司', owner: 'supplier', status: 'onSale', shelf: '长期', from: '江苏苏州', ship: '48小时内', rate: 4.8, tag: '' },
    { id: 'P1014', name: '优宠 宠物沐浴露 500ml*12瓶 整箱', brand: '优宠', cat: '洗护美容', sub: '洗护香波', e: '🧼', spec: '500ml*12瓶/箱', unit: '箱', price: 96.0, retail: 138, tiers: [{ min: 1, max: 19, p: 96 }, { min: 20, p: 88 }], moq: 1, stock: 3600, sales: 2460, supplierId: 'S05', supplierName: '优宠供应链（上海）有限公司', owner: 'supplier', status: 'onSale', shelf: '3年', from: '上海', ship: '48小时内', rate: 4.9, tag: '热销' },

    /* 平台自营独代商品 */
    { id: 'D2001', name: '宠仓优选 无谷鲜肉全价猫粮 2kg*6袋（平台独代）', brand: '宠仓优选', cat: '宠物主粮', sub: '猫粮', e: '👑', spec: '2kg*6袋/箱', unit: '箱', price: 158.0, cost: 92.0, retail: 228, tiers: [{ min: 1, max: 19, p: 158 }, { min: 20, max: 99, p: 145 }, { min: 100, p: 132 }], moq: 1, stock: 26000, sales: 12800, supplierId: 'PLATFORM', supplierName: '宠采通平台自营', owner: 'platform', status: 'onSale', shelf: '18个月', from: '平台云仓·杭州', ship: '24小时内', rate: 4.9, tag: '自营爆款', isSelf: 1 },
    { id: 'D2002', name: '宠仓优选 混合豆腐猫砂 6L*6包（平台独代）', brand: '宠仓优选', cat: '猫砂清洁', sub: '豆腐猫砂', e: '🧺', spec: '6L*6包/箱', unit: '箱', price: 62.0, cost: 34.0, retail: 98, tiers: [{ min: 1, max: 19, p: 62 }, { min: 20, p: 56 }], moq: 1, stock: 18000, sales: 9600, supplierId: 'PLATFORM', supplierName: '宠采通平台自营', owner: 'platform', status: 'onSale', shelf: '24个月', from: '平台云仓·杭州', ship: '24小时内', rate: 4.8, tag: '自营爆款', isSelf: 1 },
    { id: 'D2003', name: '宠仓优选 冻干鸡肉猫零食 100g*20袋（平台独代）', brand: '宠仓优选', cat: '宠物零食', sub: '肉干冻干', e: '🍖', spec: '100g*20袋/箱', unit: '箱', price: 68.0, cost: 38.0, retail: 98, tiers: [{ min: 1, max: 19, p: 68 }, { min: 20, p: 62 }], moq: 1, stock: 8600, sales: 5400, supplierId: 'PLATFORM', supplierName: '宠采通平台自营', owner: 'platform', status: 'onSale', shelf: '12个月', from: '平台云仓·嘉兴', ship: '24小时内', rate: 4.7, tag: '自营', isSelf: 1 },
    { id: 'D2004', name: '宠仓优选 宠物益生菌 30袋*12盒（平台独代·新品）', brand: '宠仓优选', cat: '宠物保健', sub: '营养补充', e: '🧫', spec: '30袋*12盒/箱', unit: '箱', price: 88.0, cost: 48.0, retail: 128, tiers: [{ min: 1, max: 19, p: 88 }, { min: 20, p: 79 }], moq: 2, stock: 5200, sales: 0, supplierId: 'PLATFORM', supplierName: '宠采通平台自营', owner: 'platform', status: 'onSale', shelf: '18个月', from: '平台云仓·杭州', ship: '24小时内', rate: 5.0, tag: '新品', isSelf: 1 },

    /* 待审核 / 草稿 / 驳回 */
    { id: 'P1015', name: '佩蒂 牛皮咬胶洁齿卷 100g*20袋 整箱装', brand: '佩蒂', cat: '宠物零食', sub: '磨牙洁齿', e: '🦴', spec: '100g*20袋/箱', unit: '箱', price: 88.0, retail: 128, tiers: [{ min: 1, max: 9, p: 88 }, { min: 10, p: 80 }], moq: 1, stock: 3200, sales: 0, supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', owner: 'supplier', status: 'pending', shelf: '18个月', from: '浙江杭州', ship: '48小时内', rate: 0, tag: '', submitAt: fmt(null, -1) },
    { id: 'P1016', name: '自有品牌 手工鲜肉猫饭 200g*30袋（无资质提交）', brand: '自有品牌', cat: '宠物主粮', sub: '猫粮', e: '🍲', spec: '200g*30袋/箱', unit: '箱', price: 128.0, retail: 188, tiers: [{ min: 1, p: 128 }], moq: 1, stock: 800, sales: 0, supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', owner: 'supplier', status: 'rejected', shelf: '30天', from: '浙江杭州', ship: '48小时内', rate: 0, tag: '', auditMsg: '商品主图含水印，且未提供《宠物饲料生产许可证》与产品质检报告，请补充后重新提交' },
    { id: 'P1017', name: '自制宠物零食礼盒 500g*6袋', brand: '自有品牌', cat: '宠物零食', sub: '肉干冻干', e: '🎁', spec: '500g*6袋/箱', unit: '箱', price: 66.0, retail: 98, tiers: [{ min: 1, p: 66 }], moq: 5, stock: 900, sales: 0, supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', owner: 'supplier', status: 'draft', shelf: '6个月', from: '上海', ship: '48小时内', rate: 0, tag: '' }
  ];

  const mkTrack = (no, days) => ([
    { t: fmt(null, -days), n: '已发货，等待揽收', l: '浙江省杭州市' },
    { t: fmt(null, -days + 0.2), n: '承运商已揽收', l: '杭州转运中心' },
    { t: fmt(null, -days + 0.6), n: '运输中', l: '杭州 → 上海转运中心' },
    { t: fmt(null, -days + 1.1), n: '到达派送网点', l: '上海市闵行区' },
    { t: fmt(null, -days + 1.4), n: '派送中，请保持电话畅通', l: '上海市闵行区' }
  ]);

  const orders = [
    {
      id: 'O1', no: 'YC2610300001', retailer: '宠爱多宠物生活馆（建国路店）', retailerId: 'R01', supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司',
      items: [{ pid: 'P1001', name: '皇家 成猫全价粮 2kg*6袋 整箱装', e: '🐱', spec: '2kg*6袋/箱', price: 252, qty: 20, unit: '箱' }, { pid: 'P1004', name: '麦富迪 鸡肉干 200g*20袋 整箱', e: '🍗', spec: '200g*20袋/箱', price: 89, qty: 10, unit: '箱' }],
      goods: 5930, freight: 0, discount: 50, pay: 5880, payType: '微信支付', status: '已发货', createdAt: fmt(null, -2), payAt: fmt(null, -2),
      addr: { name: '王建国', phone: '13900001234', addr: '上海市闵行区建国路 128 号 1 层' }, ship: { company: '德邦物流', no: 'DPK202610300881', at: fmt(null, -1), tracks: mkTrack('DPK202610300881', 1.2) }, remark: '请工作日 9:00-17:00 送达'
    },
    {
      id: 'O2', no: 'YC2610300002', retailer: '宠爱多宠物生活馆（建国路店）', retailerId: 'R01', supplierId: 'S02', supplierName: '喵趣猫砂（江苏）有限公司',
      items: [{ pid: 'P1007', name: '喵趣 膨润土结团猫砂 10kg*4袋 整箱', e: '🧴', spec: '10kg*4袋/箱', price: 71, qty: 10, unit: '箱' }],
      goods: 710, freight: 0, discount: 0, pay: 710, payType: '支付宝', status: '待发货', createdAt: fmt(null, -0.6), payAt: fmt(null, -0.6),
      addr: { name: '王建国', phone: '13900001234', addr: '上海市闵行区建国路 128 号 1 层' }, ship: null, remark: ''
    },
    {
      id: 'O3', no: 'YC2610280007', retailer: '宠爱多宠物生活馆（建国路店）', retailerId: 'R01', supplierId: 'PLATFORM', supplierName: '宠采通平台自营',
      items: [{ pid: 'D2001', name: '宠仓优选 无谷鲜肉全价猫粮 2kg*6袋（平台独代）', e: '👑', spec: '2kg*6袋/箱', price: 132, qty: 100, unit: '箱' }, { pid: 'D2002', name: '宠仓优选 混合豆腐猫砂 6L*6包（平台独代）', e: '🧺', spec: '6L*6包/箱', price: 56, qty: 50, unit: '箱' }],
      goods: 16000, freight: 0, discount: 200, pay: 15800, payType: '微信支付', status: '已完成', createdAt: fmt(null, -4), payAt: fmt(null, -4),
      addr: { name: '李芳', phone: '13900005678', addr: '上海市闵行区莘庄镇莘东路 66 号' }, ship: { company: '京东物流', no: 'JD0088123456', at: fmt(null, -3.6), tracks: [{ t: fmt(null, -3.6), n: '已发货', l: '平台云仓·杭州' }, { t: fmt(null, -3.4), n: '承运商已揽收', l: '杭州转运中心' }, { t: fmt(null, -3), n: '运输中', l: '杭州 → 上海' }, { t: fmt(null, -2.4), n: '已签收，签收人：本人', l: '上海市闵行区' }] }, remark: ''
    },
    {
      id: 'O4', no: 'YC2611010003', retailer: '汪汪队宠物医院（七宝店）', retailerId: 'R03', supplierId: 'S03', supplierName: '康宠动物保健（上海）有限公司',
      items: [{ pid: 'P1009', name: '大宠爱 体外驱虫滴剂 猫用 3支*10盒', e: '💊', spec: '3支*10盒/箱', price: 248, qty: 20, unit: '箱' }],
      goods: 4960, freight: 0, discount: 0, pay: 4960, payType: '微信支付', status: '待接单', createdAt: fmt(null, -0.2), payAt: fmt(null, -0.2),
      addr: { name: '陈明', phone: '13900009012', addr: '上海市闵行区七宝镇青年路 88 号' }, ship: null, remark: '请避开午高峰配送'
    },
    {
      id: 'O5', no: 'YC2610270005', retailer: '宠爱多宠物生活馆（建国路店）', retailerId: 'R01', supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司',
      items: [{ pid: 'P1005', name: '珍致 猫条妙鲜包 14g*30条*10盒', e: '🐾', spec: '14g*30条*10盒/箱', price: 118, qty: 20, unit: '箱' }],
      goods: 2360, freight: 0, discount: 0, pay: 2360, payType: '微信支付', status: '退款中', createdAt: fmt(null, -5), payAt: fmt(null, -5),
      addr: { name: '王建国', phone: '13900001234', addr: '上海市闵行区建国路 128 号 1 层' }, ship: { company: '中通快运', no: 'ZTO778899001', at: fmt(null, -4.5), tracks: [{ t: fmt(null, -4.5), n: '已发货', l: '上海' }, { t: fmt(null, -4), n: '派送中', l: '上海市闵行区' }] }, remark: ''
    },
    {
      id: 'O6', no: 'YC2610260009', retailer: '喵星人宠物用品（莘庄店）', retailerId: 'R02', supplierId: 'S04', supplierName: '趣宠宠物用品（义乌）有限公司',
      items: [{ pid: 'P1011', name: '趣宠 瓦楞纸猫抓板 大号 10个/箱', e: '🧶', spec: '10个/箱', price: 52, qty: 100, unit: '箱' }],
      goods: 5200, freight: 0, discount: 0, pay: 5200, payType: '对公转账', status: '待付款', createdAt: fmt(null, -0.1), payAt: '',
      addr: { name: '李芳', phone: '13900005678', addr: '上海市闵行区莘庄镇莘东路 66 号' }, ship: null, remark: '需开票'
    }
  ];

  const refunds = [
    { id: 'A1', no: 'AS261101001', orderNo: 'YC2610270005', orderId: 'O5', retailer: '宠爱多宠物生活馆（建国路店）', supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', pid: 'P1005', name: '珍致 猫条妙鲜包 14g*30条*10盒', e: '🐾', qty: 20, amount: 2360, type: '退货退款', reason: '到货临期（剩余保质期不足 3 个月）', imgs: 2, status: '待供应商处理', createdAt: fmt(null, -1), dueAt: fmt(null, 1), logs: [{ t: fmt(null, -1), n: '零售商提交售后申请', by: '宠爱多宠物生活馆（建国路店）' }] },
    { id: 'A2', no: 'AS261031002', orderNo: 'YC2610280007', orderId: 'O3', retailer: '宠爱多宠物生活馆（建国路店）', supplierId: 'PLATFORM', supplierName: '宠采通平台自营', pid: 'D2002', name: '宠仓优选 混合豆腐猫砂 6L*6包（平台独代）', e: '🧺', qty: 8, amount: 448, type: '仅退款', reason: '外箱破损，部分猫砂受潮结块', imgs: 3, status: '待平台退款', createdAt: fmt(null, -2), dueAt: fmt(null, 0), logs: [{ t: fmt(null, -2), n: '零售商提交售后申请', by: '宠爱多宠物生活馆（建国路店）' }, { t: fmt(null, -1.6), n: '平台自营同意售后（仅退款）', by: '平台运营 · 林薇' }] },
    { id: 'A3', no: 'AS261030003', orderNo: 'YC2611010003', orderId: 'O4', retailer: '汪汪队宠物医院（七宝店）', supplierId: 'S03', supplierName: '康宠动物保健（上海）有限公司', pid: 'P1009', name: '大宠爱 体外驱虫滴剂 猫用 3支*10盒', e: '💊', qty: 2, amount: 496, type: '退货退款', reason: '到货外盒压损，影响售卖', imgs: 4, status: '平台介入中', createdAt: fmt(null, -2.5), dueAt: fmt(null, -0.5), logs: [{ t: fmt(null, -2.5), n: '零售商提交售后申请', by: '汪汪队宠物医院（七宝店）' }, { t: fmt(null, -1.8), n: '供应商拒绝（凭证不足）', by: '康宠动物保健（上海）有限公司' }, { t: fmt(null, -1.5), n: '零售商申请平台介入', by: '系统' }] }
  ];

  const audits = {
    supplier: [
      { id: 'SA1', name: '沪上优选宠物食品有限公司', code: '91310100MA2CCCCC6F', cat: '宠物零食', contact: '周涛', phone: '13800006666', files: 5, status: 'pending', submitAt: fmt(null, -0.4), risk: '正常', capital: '500万' },
      { id: 'SA2', name: '川味宠物零食有限公司', code: '91510100MA2DDDDD7G', cat: '宠物主粮', contact: '刘洋', phone: '13800007777', files: 4, status: 'pending', submitAt: fmt(null, -1.8), risk: '存在 1 条经营异常记录', capital: '100万' },
      { id: 'SA3', name: '晨光宠物保健（苏州）有限公司', code: '91330100MA2EEEEE8H', cat: '宠物保健', contact: '孙丽', phone: '13800008888', files: 6, status: 'pending', submitAt: fmt(null, -3), risk: '正常', capital: '1000万' }
    ],
    retailer: [
      { id: 'RA1', name: '邻家宠物（虹桥店）', type: '企业', code: '91310100MA2FFFFF9J', addr: '上海市闵行区虹桥路 300 号', contact: '吴敏', phone: '13900002222', files: 3, status: 'pending', submitAt: fmt(null, -0.3) },
      { id: 'RA2', name: '老王宠物店（个体）', type: '个体工商户', code: '身份证 3101**********1234', addr: '上海市松江区新桥镇新南街 12 号', contact: '王德发', phone: '13900003333', files: 2, status: 'pending', submitAt: fmt(null, -1.2) },
      { id: 'RA3', name: '好邻居宠物（都市路店）', type: '企业', code: '91310100MA2HHHHH2K', addr: '上海市闵行区都市路 4855 号', contact: '郑爽', phone: '13900004444', files: 2, status: 'pending', submitAt: fmt(null, -2.1) }
    ]
  };

  const tickets = [
    { id: 'T1', no: 'TK261101001', type: '售后投诉', from: '零售商 · 宠爱多宠物生活馆（建国路店）', orderNo: 'YC2610270005', title: '猫条到货临期，要求退货', level: '高', status: '待处理', owner: '', at: fmt(null, -1), msgs: [{ me: false, t: '我 10 月 27 日下单的猫条妙鲜包，到货后剩余保质期不足 3 个月，门店卖不出去，申请退货。', at: fmt(null, -1) }] },
    { id: 'T2', no: 'TK261031002', type: '物流咨询', from: '零售商 · 喵星人宠物用品（莘庄店）', orderNo: 'YC2610300001', title: '猫砂物流已 3 天未更新', level: '中', status: '处理中', owner: '客服 · 小云', at: fmt(null, -1.5), msgs: [{ me: false, t: '运单 DPK202610300881 已经两天没有更新了，什么时候能到？', at: fmt(null, -1.5) }, { me: true, t: '您好，已为您加急核实，承运商反馈车辆在途，预计今日 18:00 前送达。', at: fmt(null, -1.4) }] },
    { id: 'T3', no: 'TK261030003', type: '入驻咨询', from: '供应商 · 沪上优选宠物食品', orderNo: '', title: '宠物零食类目需要哪些资质', level: '低', status: '已完结', owner: '客服 · 阿泽', at: fmt(null, -2.2), msgs: [{ me: false, t: '我们想入驻宠物零食类目，需要准备哪些材料？', at: fmt(null, -2.2) }, { me: true, t: '需要营业执照、宠物饲料生产许可证、品牌授权书与产品质检报告，详见入驻指引。', at: fmt(null, -2.1) }] }
  ];

  const settlements = [
    { id: 'ST1', no: 'JS20261025001', supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', period: '2026-10-18 ~ 2026-10-24', orders: 128, goods: 186420, refund: -1980, fee: -9321, freight: 2600, pay: 176719, status: '已打款', at: fmt(null, -8) },
    { id: 'ST2', no: 'JS20261025002', supplierId: 'S02', supplierName: '喵趣猫砂（江苏）有限公司', period: '2026-10-18 ~ 2026-10-24', orders: 86, goods: 120360, refund: 0, fee: -6018, freight: 1800, pay: 116142, status: '已打款', at: fmt(null, -8) },
    { id: 'ST3', no: 'JS20261101001', supplierId: 'S01', supplierName: '宠悦宠物食品（杭州）有限公司', period: '2026-10-25 ~ 2026-10-31', orders: 142, goods: 213680, refund: -495, fee: -10684, freight: 3200, pay: 205701, status: '待财务复核', at: '' },
    { id: 'ST4', no: 'JS20261101002', supplierId: 'S05', supplierName: '优宠供应链（上海）有限公司', period: '2026-10-25 ~ 2026-10-31', orders: 64, goods: 158900, refund: 0, fee: -7945, freight: 0, pay: 150955, status: '待供应商确认', at: '' }
  ];

  const logs = [
    { at: fmt(null, -0.3), who: '运营 · 林薇', role: '平台', act: '商品审核通过', obj: 'P1015 佩蒂 牛皮咬胶洁齿卷', ip: '10.12.3.21' },
    { at: fmt(null, -0.8), who: '财务 · 周舟', role: '平台', act: '结算单复核', obj: 'JS20261101001', ip: '10.12.3.45' },
    { at: fmt(null, -1.2), who: '审核 · 何以', role: '平台', act: '供应商入驻驳回', obj: '川味宠物零食（原因：经营异常未解除）', ip: '10.12.3.18' },
    { at: fmt(null, -1.6), who: '客服 · 小云', role: '平台', act: '工单转派', obj: 'TK261031002 → 阿泽', ip: '10.12.4.02' },
    { at: fmt(null, -2.1), who: '超管 · 系统', role: '平台', act: '修改类目资质要求', obj: '宠物保健：新增兽药经营资质强制校验', ip: '10.12.1.10' }
  ];

  const notices = [
    { id: 'N1', title: '11·11 宠物用品采购节：全场满 2000 减 120，自营商品叠加 9.5 折', at: fmt(null, -1), to: '零售商' },
    { id: 'N2', title: '关于宠物保健、宠物零食类目资质校验规则升级的通知', at: fmt(null, -2), to: '供应商' },
    { id: 'N3', title: '平台物流时效考核将于 11 月 15 日起执行（48 小时发货率 ≥ 95%）', at: fmt(null, -3), to: '供应商' }
  ];

  return {
    role: 'retailer',
    cart: [],
    supplierAuth: { status: 'approved', name: '宠悦宠物食品（杭州）有限公司', id: 'S01' },
    retailerAuth: { status: 'approved', name: '宠爱多宠物生活馆（建国路店）', id: 'R01' },
    me: { supplier: { name: '宠悦宠物食品（杭州）有限公司', id: 'S01' }, retailer: { name: '宠爱多宠物生活馆（建国路店）', id: 'R01' }, admin: { name: '平台运营 · 林薇', id: 'A01' } },
    categories, suppliers, products, orders, refunds, audits, tickets, settlements, logs, notices,
    banners: [
      { t: '11·11 宠物用品采购节 · 满 2000 减 120', s: '自营商品叠加 9.5 折', e: '🎉' },
      { t: '新客首单立减 50', s: '认证即得 200 元采购券包', e: '🎁' },
      { t: '平台自营独代 · 一件也批发', s: '24 小时极速发货', e: '⚡' }
    ],
    addresses: [
      { id: 'AD1', name: '王建国', phone: '13900001234', addr: '上海市闵行区建国路 128 号 1 层', def: 1 },
      { id: 'AD2', name: '王建国（仓库）', phone: '13900001234', addr: '上海市闵行区都会路 2333 号 B 库', def: 0 }
    ],
    seq: { order: 7, refund: 4 }
  };
})();
