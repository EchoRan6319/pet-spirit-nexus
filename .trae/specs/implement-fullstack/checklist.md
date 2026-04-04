# 宠智灵境全栈开发检查清单

## Phase 1: 后端基础设施

- [x] 数据库层实现验证
  - [x] better-sqlite3 依赖安装成功
  - [x] database.js 能正确初始化 SQLite 连接并执行建表 SQL
  - [x] user.js 模型提供 create/getById/updateDayCount 方法
  - [x] pet.js 模型提供 create/getByUserId/updateMemories 方法
  - [x] 数据库文件在 backend/data/ 目录下自动创建

- [x] API 路由控制器验证
  - [x] user controller 提供 POST /api/user/create 接口，返回 { userId, pet }
  - [x] user controller 提供 GET /api/user/:id/profile 接口
  - [x] chat controller 提供 POST /api/chat 接口，返回 LLM 结构化响应
  - [x] chat controller 在 LLM 返回 memory_update 时调用 db 更新记忆标签
  - [x] index.js 已移除 /api/debug/chat 调试路由
  - [x] index.js 正确挂载 /api/chat 和 /api/user 路由

## Phase 2: 前端应用

- [x] Uni-app 项目结构验证
  - [x] 项目可通过 npm run dev:mp-weixin 正常启动微信小程序模式
  - [x] pages.json 正确注册 index、chat、memorial 三个页面
  - [x] request.js 封装支持 Promise 风格的 POST/GET 请求
  - [x] request.js 基础 URL 配置为后端地址（开发环境 localhost:3000）

- [x] 首页（档案录入）验证
  - [x] 页面展示宠物档案表单：名字、物种、特征等输入框
  - [x] 表单必填项验证逻辑正常
  - [x] 提交后成功调用后端 API 并跳转到聊天页
  - [x] 跳转时通过全局状态（Storage）传递 userId

- [x] 聊天室核心功能验证
  - [x] chat-bubble 组件区分 user（右对齐）和 pet（左对齐）样式
  - [x] 消息列表可滚动，新消息自动滚动到底部
  - [x] 发送消息后先显示用户气泡，再显示宠物回复气泡
  - [x] 宠物回复文本不超过 40 字时正常渲染
  - [x] empathy-layer 组件在接收到 action 时显示呼吸光晕动画
  - [x] hug/heartbeat action 触发 uni.vibrateShort() 震动序列
  - [x] lock_app action 触发 3 秒延迟后跳转到 memorial 页面

- [x] 纪念碑页面验证
  - [x] 页面以"石碑"风格展示宠物档案摘要
  - [x] 显示最后告别语（final_blessing）
  - [x] 显示总陪伴天数统计
  - [x] 页面处于只读锁定态，无输入框或其他交互元素

## Phase 3: 联调与集成

- [x] 全栈链路打通验证（代码层面静态验证通过）
  - [x] 后端代码结构完整，/health 接口存在
  - [x] 前端首页 → 提交档案 → 后端数据库新增记录（代码逻辑完整）
  - [x] 前端聊天页 → 发送消息 → 收到 LLM 回复并渲染气泡（代码逻辑完整）
  - [x] LLM 返回 trigger_empathy_ui 工具调用 → 前端触发震动+动效（代码逻辑完整）
  - [x] LLM 返回 summarize_and_anonymize_memory → 后端更新 DB 记忆标签（代码逻辑完整）
  - [x] 模拟 day_count=49 → LLM 返回 farewell_protocol → 前端跳转纪念碑（代码逻辑完整）

- [x] 开发文档合规性验证
  - [x] LLM 请求参数 temperature=0.65, max_tokens=150 锁定不变
  - [x] System Prompt 包含防幻觉红线指令
  - [x] MCP tool_choice 设置为 "auto"
  - [x] pet_persona.md 所有变量占位符正确替换
  - [x] mcp_schema.json 三个工具定义完整无误

---

## 性能与体验验收标准（需实际运行测试）

- [ ] 首次 LLM 响应时间 < 3 秒（网络正常情况下）- 待运行时验证
- [ ] 前端页面切换流畅，无明显卡顿 - 待运行时验证
- [ ] 心跳震动节奏符合"咚-咚---咚-咚"模式 - 待真机测试
- [ ] 暖光呼吸动画时长 3 秒，渐入渐出自然 - 待运行时验证
- [ ] 纪念碑页面加载后显示告别动画效果 - 待运行时验证
