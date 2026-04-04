'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 中间件
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
// 健康检查
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: '宠智灵境 Pet Spirit Nexus Backend',
    model: process.env.LLM_MODEL_NAME || 'not configured',
    time: new Date().toISOString(),
  });
});

const userRouter = require('./controllers/user');
const chatRouter = require('./controllers/chat');

app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);

// ============================================================
// 启动
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🐾 宠智灵境后端已启动`);
  console.log(`   地址: http://localhost:${PORT}`);
  console.log(`   模型: ${process.env.LLM_MODEL_NAME || '⚠️  未配置，请检查 .env'}`);
  console.log(`   健康检查: http://localhost:${PORT}/health\n`);
});

module.exports = app;
