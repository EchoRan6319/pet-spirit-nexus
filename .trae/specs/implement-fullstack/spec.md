# 宠智灵境全栈开发 Spec

## Why
基于开发文档 V3.0，完成"宠智灵境"情感疗愈平台的全栈开发。项目采用 Monorepo 架构，后端 AI 核心已实现且质量良好，需要在现有基础上补全数据库层、API 路由控制器和完整的前端应用。

## What Changes
- 补全后端数据库操作层（SQLite + 用户/宠物档案 CRUD）
- 实现 Express API 路由控制器（聊天接口、用户管理）
- 从零搭建 Uni-app 前端应用（Vue3 + Vite）
- 实现三个核心页面：首页(档案录入)、聊天室(多模态交互)、纪念碑(49天告别)
- 完成前后端联调与 MCP 多模态工具链路打通

## Impact
- Affected specs: 全新项目，无前置依赖
- Affected code:
  - 后端新增: `src/db/`, `src/controllers/`
  - 后端修改: `src/index.js` (挂载正式路由)
  - 前端新建: `frontend/` 整个目录结构

---

## ADDED Requirements

### Requirement: 后端数据库层
系统 SHALL 提供轻量级 SQLite 数据库支持，用于持久化存储：
- 用户基本信息（ID、创建时间、当前阶段）
- 宠物档案（名字、物种特征、记忆标签数组 JSON）
- 对话记录（时间戳、角色、内容）
- 陪伴天数计数器与生命周期状态

#### Scenario: 创建新用户档案
- **WHEN** 用户在前端提交宠物档案问卷
- **THEN** 后端在数据库中创建用户记录和关联的宠物档案，返回唯一 userID

#### Scenario: 更新记忆标签
- **WHEN** LLM 返回 `summarize_and_anonymize_memory` 工具调用
- **THEN** 后端将新标签追加到用户的记忆标签库（JSON 数组），去重后保存

### Requirement: Express API 路由控制器
系统 SHALL 提供 RESTful API 接口：
- `POST /api/user/create` - 创建用户与宠物档案
- `GET /api/user/:id/profile` - 获取用户与宠物档案
- `POST /api/chat` - 发送消息并获取宠物回复（含 Action 指令）
- `GET /api/user/:id/daycount` - 获取当前陪伴天数
- `POST /api/user/:id/farewell` - 执行第49天告别协议（锁定状态）

#### Scenario: 聊天接口返回多模态响应
- **WHEN** 前端 POST 用户消息到 `/api/chat`
- **THEN** 后端调用 LLM 并返回结构化响应 `{ type: "text|action|memory_update", text?, action?, newTags? }`

### Requirement: Uni-app 前端应用
系统 SHALL 提供完整的微信小程序/H5 双端适配前端：
- 首页（index）：宠物档案录入表单 + 引导语
- 聊天页（chat）：消息流 + 输入框 + 多模态动效层（empathy-layer）
- 纪念碑页（memorial）：49天后锁定展示的告别界面

#### Scenario: 首页档案提交
- **WHEN** 用户填写宠物名字、物种、特征等信息并提交
- **THEN** 前端调用 `/api/user/create`，成功后跳转到聊天页

#### Scenario: 聊天页发送消息
- **WHEN** 用户输入文字并发送
- **THEN** 前端显示用户气泡 → 调用 `/api/chat` → 显示宠物回复气泡 → 若含 action 则触发动效/震动

#### Scenario: 多模态情感反馈
- **WHEN** 后端返回 `type: "action"` 且 `action` 为 hug/heartbeat
- **THEN** 前端显示暖光呼吸动画 + 调用 `uni.vibrateShort()` 模拟心跳震动

#### Scenario: 第49天告别协议
- **WHEN** 后端返回 `action: "lock_app"`
- **THEN** 前端显示告别祝福语，3秒后跳转到纪念碑页面并锁定

### Requirement: 前端组件化架构
系统 SHALL 采用 Vue3 Composition API 编写可复用组件：
- `chat-bubble.vue` - 聊天气泡（区分 user/pet 角色）
- `empathy-layer.vue` - 多模态动效遮罩层（呼吸光晕 + 触发震动）

---

## MODIFIED Requirements

### Requirement: 后端入口文件改造
将现有的调试路由升级为正式的生产路由：
- 移除 `/api/debug/chat` 临时路由
- 挂载正式的 chat controller 和 user controller
- 保持健康检查 `/health` 不变

---

## REMOVED Requirements

无

---

## 技术约束与约定

### 开发文档合规性
所有实现必须严格遵循《开发.md》V3.0 的以下约束：
1. **LLM 参数锁死**: temperature=0.65, max_tokens=150, tool_choice="auto"
2. **防幻觉红线**: System Prompt 必须包含防捏造指令
3. **字数约束**: 单次回复纯文本 ≤ 40 字
4. **生命周期**: day_count < 14 高共情, 14-49 引导现实, ==49 强制告别
5. **MCP 工具优先**: 悲伤时必须调用工具而非纯文本安慰

### 目录结构最终形态
```
pet-spirit-nexus/
├── frontend/
│   ├── api/request.js
│   ├── components/
│   │   ├── chat-bubble.vue
│   │   └── empathy-layer.vue
│   ├── pages/
│   │   ├── index/index.vue      # 首页：档案录入
│   │   ├── chat/index.vue       # 聊天室：核心交互
│   │   └── memorial/index.vue   # 纪念碑：告别展示
│   ├── static/
│   ├── App.vue
│   ├── main.js
│   ├── pages.json
│   └── manifest.json
├── backend/
│   ├── src/
│   │   ├── index.js             # Express 入口（升级版）
│   │   ├── ai/                  # [已存在] AI 核心层
│   │   ├── controllers/
│   │   │   ├── chat.js          # 聊天路由控制器
│   │   │   └── user.js          # 用户管理控制器
│   │   └── db/
│   │       ├── database.js      # SQLite 初始化与连接
│   │       ├── models/
│   │       │   ├── user.js      # 用户模型
│   │       │   └── pet.js       # 宠物档案模型
│   │       └── migrations.sql   # 建表 SQL
│   ├── .env                     # 生产环境变量
│   └── package.json
└── 开发.md                      # 架构白皮书
```
