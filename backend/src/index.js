'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

// ============================================================
// 路由挂载（后续阶段接入）
// ============================================================
// const chatRouter = require('./controllers/chat');
// const petRouter = require('./controllers/pet');
// app.use('/api/chat', chatRouter);
// app.use('/api/pet', petRouter);

// ============================================================
// 临时调试路由：直接测试 AI 核心（阶段二验证用）
// ============================================================
const { generatePetResponse } = require('./ai/llm_client');

app.post('/api/debug/chat', async (req, res) => {
  try {
    const {
      petName = '豆豆',
      petSpeciesAndTraits = '金毛犬，活泼爱撒娇，总喜欢咬主人的鞋子',
      memories = ['害怕打雷', '喜欢去公园', '最爱鸡肉罐头'],
      dayCount = 3,
      message = '我今天好想你',
      chatHistory = [],
    } = req.body;

    const userContext = { petName, petSpeciesAndTraits, memories, dayCount };
    const result = await generatePetResponse(userContext, message, chatHistory);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Debug Chat Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

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
