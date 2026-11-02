/* 宠采通 原型 · 三端导航配置（侧边栏数据源，被 app.js 与全站页面地图共用） */
(function () {
  const NAVS = {
    supplier: [
      { grp: '经营概况', items: [{ k: 'dashboard', t: '工作台', ic: '📊', p: 'dashboard', d: '经营概览：今日/本月销售额、待办提醒、热销商品与数据趋势卡片。' }] },
      {
        grp: '商品管理', items: [
          { k: 'products', t: '商品管理', ic: '📦', p: 'products', d: '在售 / 审核中 / 已驳回 / 已下架 商品列表，支持改价、调库存、上下架与提交审核。' },
          { k: 'product-new', t: '新增商品', ic: '➕', p: 'product-new', d: '填写标题、类目、规格、供货价、库存、图片与售后说明，提交平台审核。' },
          { k: 'audit', t: '审核进度', ic: '🔍', p: 'audit', badge: s => s.products.filter(p => p.supplierId === 'S01' && p.status === 'pending').length, d: '查看提交商品的平台审核状态、审核人与驳回原因，支持按原因修改后重新提交。' }
        ]
      },
      {
        grp: '交易履约', items: [
          { k: 'orders', t: '订单管理', ic: '🧾', p: 'orders', badge: s => s.orders.filter(o => o.supplierId === 'S01' && ['待接单', '待发货'].indexOf(o.status) >= 0).length, d: '待接单 / 待发货 / 已发货 / 已完成 订单处理：接单、备货、发货回填承运商与运单号。' },
          { k: 'aftersale', t: '售后管理', ic: '↩️', p: 'aftersale', badge: s => s.refunds.filter(r => r.supplierId === 'S01' && r.status === '待供应商处理').length, d: '处理零售商发起的退款 / 退货退款申请：同意、驳回、收货确认。' }
        ]
      },
      {
        grp: '店铺与资金', items: [
          { k: 'qualification', t: '资质中心', ic: '🏷️', p: 'qualification', d: '企业证照、品牌授权、质检报告与品类资质维护，到期前提醒与变更申请。' },
          { k: 'settlement', t: '结算中心', ic: '💰', p: 'settlement', d: '按周期查看对账单、订单明细、平台佣金与可提现金额。' }
        ]
      },
      { grp: '服务', items: [{ k: 'service', t: '客服中心', ic: '💬', p: 'service', d: '在线 IM 会话（机器人 + 人工转接）、常见问题、关联订单发起工单。' }] }
    ],
    retailer: [
      {
        grp: '采购', items: [
          { k: 'home', t: '商城首页', ic: '🏠', p: 'home', d: '活动 Banner、类目入口、新品/热销/平台自营楼层与推荐商品。' },
          { k: 'list', t: '商品列表', ic: '🗂️', p: 'list', d: '关键词搜索、品牌/价格/自营/有货筛选、四种排序、网格与列表视图、分页。' },
          { k: 'cart', t: '购物车', ic: '🛒', p: 'cart', badge: s => s.cart.length, d: '按供应商分组展示、改数量 / 删除 / 清空、凑单免运费提示、勾选去结算。' }
        ]
      },
      {
        grp: '我的交易', items: [
          { k: 'orders', t: '我的订单', ic: '🧾', p: 'orders', badge: s => s.orders.filter(o => o.retailerId === 'R01' && ['待付款', '待发货', '已发货'].indexOf(o.status) >= 0).length, d: '状态筛选与计数、支付 / 取消 / 确认收货 / 申请售后 / 再来一单 / 删除订单。' },
          { k: 'logistics', t: '物流查询', ic: '🚚', p: 'logistics', d: '按订单号或运单号查询：承运商信息、轨迹时间轴、刷新轨迹、异常上报、确认收货。' }
        ]
      },
      {
        grp: '我的', items: [
          { k: 'cert', t: '资质认证', ic: '🏷️', p: 'cert', d: '门店资质提交与变更（控制拿货价可见性）、审核进度、收货地址增删改与设为默认。' },
          { k: 'service', t: '客服中心', ic: '💬', p: 'service', d: '在线 IM 会话（机器人 + 人工转接）、常见问题、关联订单发起工单。' }
        ]
      }
    ],
    admin: [
      { grp: '经营', items: [{ k: 'dashboard', t: '数据大盘', ic: '📊', p: 'dashboard', d: 'GMV / 订单 / 用户 / 品类结构核心指标与趋势图、待处理事项聚合入口。' }] },
      {
        grp: '审核中心', items: [
          { k: 'audit-supplier', t: '供应商入驻', ic: '🏭', p: 'audit-supplier', badge: s => s.audits.supplier.filter(a => a.status === 'pending').length, d: '核验营业执照、生产许可证、品牌授权等材料，通过 / 驳回（含原因回填）与批量操作。' },
          { k: 'audit-retailer', t: '零售商资质', ic: '🏪', p: 'audit-retailer', badge: s => s.audits.retailer.filter(a => a.status === 'pending').length, d: '核验门店资质与经营场所，通过后开通拿货价可见与下单权限。' },
          { k: 'audit-product', t: '商品上架', ic: '🔍', p: 'audit-product', badge: s => s.products.filter(p => p.status === 'pending').length, d: '审核商品标题/图片/规格/供货价/资质合规，通过后自动上架至前台。' }
        ]
      },
      {
        grp: '商品经营', items: [
          { k: 'products', t: '商品管理', ic: '📦', p: 'products', d: '全量商品查询与管控：强制下架、价格干预、库存校正、违规记录。' },
          { k: 'self', t: '独代商品', ic: '👑', p: 'self', d: '平台自营独代商品上传与经营：成本价与毛利试算（成本价仅平台可见）、定价与上下架。' },
          { k: 'category', t: '类目管理', ic: '🗂️', p: 'category', d: '一/二/三级类目维护、类目所需资质配置、类目佣金与展示排序。' }
        ]
      },
      {
        grp: '交易与资金', items: [
          { k: 'orders', t: '订单管理', ic: '🧾', p: 'orders', d: '全量订单查询、超时未接单预警、异常订单强制退款与备注留痕。' },
          { k: 'refunds', t: '退款管理', ic: '↩️', p: 'refunds', badge: s => s.refunds.filter(r => ['待平台退款', '平台介入中'].indexOf(r.status) >= 0).length, d: '退款审核与平台介入仲裁：判责、强制退款、驳回并说明理由。' },
          { k: 'finance', t: '财务管理', ic: '💳', p: 'finance', d: '收款与付款流水、平台佣金统计、账户余额与对账。' },
          { k: 'settle', t: '结算管理', ic: '💰', p: 'settle', badge: s => s.settlements.filter(x => x.status !== '已打款').length, d: '供应商结算单复核、打款操作与结算状态跟踪。' }
        ]
      },
      {
        grp: '履约与服务', items: [
          { k: 'logistics', t: '物流管理', ic: '🚚', p: 'logistics', d: '承运商管理、全程轨迹监控、滞留/异常预警与工单联动。' },
          { k: 'tickets', t: '客服工单', ic: '💬', p: 'tickets', badge: s => s.tickets.filter(t => t.status !== '已完结').length, d: '工单受理、分派、处理与完结，支持关联订单/商品与来源追溯。' }
        ]
      },
      {
        grp: '平台维护', items: [
          { k: 'content', t: '内容运营', ic: '📢', p: 'content', d: '首页 Banner、公告、活动楼层与推荐位的配置与上下线。' },
          { k: 'account', t: '账号权限', ic: '🔐', p: 'account', d: '平台账号与角色管理、权限矩阵配置、账号启停与密码策略。' },
          { k: 'logs', t: '操作日志', ic: '📜', p: 'logs', d: '所有审核、订单、资金类操作的审计留痕，支持按人/按类型查询。' }
        ]
      }
    ]
  };

  const ROLE_NAME = { supplier: '供应商端', retailer: '零售商端', admin: '平台管理端' };

  const ROLE_META = {
    supplier: { e: '🏭', name: '供应商端', who: '品牌方 / 经销商', file: 'index.html' },
    retailer: { e: '🏪', name: '零售商端', who: '宠物店 / 宠物医院 / 商超宠物专区', file: 'index.html' },
    admin: { e: '🛡️', name: '平台管理端', who: '运营 / 审核 / 客服 / 财务', file: 'index.html' }
  };

  window.NAVS = NAVS;
  window.ROLE_NAME = ROLE_NAME;
  window.ROLE_META = ROLE_META;
})();
