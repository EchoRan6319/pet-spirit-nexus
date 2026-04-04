# 宠智灵境全栈开发任务清单

## Phase 1: 后端基础设施补全

- [x] Task 1: 创建数据库层 - 实现 SQLite 初始化、连接管理与建表逻辑
  - [x] 1.1 安装 better-sqlite3 依赖
  - [x] 1.2 编写 `src/db/database.js` - 数据库连接单例与初始化
  - [x] 1.3 编写 `src/db/migrations.sql` - 用户表、宠物档案表、对话记录表 DDL
  - [x] 1.4 编写 `src/db/models/user.js` - 用户 CRUD 操作
  - [x] 1.5 编写 `src/db/models/pet.js` - 宠物档案 CRUD + 记忆标签更新

- [x] Task 2: 创建 API 路由控制器 - 实现 RESTful 接口层
  - [x] 2.1 编写 `src/controllers/user.js` - 用户创建/查询/天数统计接口
  - [x] 2.2 编写 `src/controllers/chat.js` - 聊天接口（集成 LLM + DB 持久化）
  - [x] 2.3 升级 `src/index.js` - 移除调试路由，挂载正式 controller

## Phase 2: 前端应用搭建

- [x] Task 3: 初始化 Uni-app 项目结构
  - [x] 3.1 使用 Vite 创建 Uni-app Vue3 项目脚手架
  - [x] 3.2 配置 pages.json（注册三个页面 + 导航栏样式）
  - [x] 3.3 配置 manifest.json（小程序 AppID 占位）
  - [x] 3.4 创建 `api/request.js` - 封装 uni.request 为 Promise 风格

- [x] Task 4: 实现首页（档案录入）
  - [x] 4.1 编写 `pages/index/index.vue` - 表单 UI（宠物名字/物种/特征/主人昵称）
  - [x] 4.2 实现表单验证与提交逻辑（调用 /api/user/create）
  - [x] 4.3 提交成功后跳转到聊天页并传递 userID

- [x] Task 5: 实现聊天室核心页面
  - [x] 5.1 编写 `components/chat-bubble.vue` - 聊天气泡组件（user/pet 双角色）
  - [x] 5.2 编写 `components/empathy-layer.vue` - 多模态动效遮罩（呼吸光晕 CSS 动画）
  - [x] 5.3 编写 `pages/chat/index.vue` - 消息流 + 输入框 + 发送逻辑
  - [x] 5.4 集成 API 调用（POST /api/chat）+ 响应解析（text/action/memory_update）
  - [x] 5.5 实现多模态 Action 处理：hug/heartbeat 触发震动 + 动效显示
  - [x] 5.6 实现告别协议处理：lock_app action → 3秒延迟跳转纪念碑

- [x] Task 6: 实现纪念碑页面
  - [x] 6.1 编写 `pages/memorial/index.vue` - 锁定态展示界面
  - [x] 6.2 展示宠物档案摘要 + 最后告别语 + 陪伴天数统计
  - [x] 6.3 UI 设计为"石碑"风格，禁止交互（只读模式）

## Phase 3: 联调与优化

- [x] Task 7: 全栈联调测试
  - [x] 7.1 启动后端服务，验证 /health 接口
  - [x] 7.2 前端首页提交档案 → 验证数据库写入
  - [x] 7.3 聊天页发送消息 → 验证 LLM 回复渲染 + Action 触发
  - [x] 7.4 测试第49天模拟场景 → 验证告别协议完整链路

---

# Task Dependencies
- [Task 2] depends on [Task 1] - 控制器需要数据库层支持
- [Task 4] depends on [Task 3] - 首页依赖项目基础结构
- [Task 5] depends on [Task 3, Task 4] - 聊天页依赖基础结构和首页跳转
- [Task 6] depends on [Task 5] - 纪念碑页依赖聊天页的告别逻辑
- [Task 7] depends on [Task 2, Task 5, Task 6] - 联调需要前后端全部就绪
