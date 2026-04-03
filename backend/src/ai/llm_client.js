'use strict';

const { OpenAI } = require('openai'); // 兼容所有 OpenAI 格式的国产大模型
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================================
// 工具箱与提示词加载（启动时缓存，避免每次请求都读文件）
// ============================================================
const toolsSchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'tools/mcp_schema.json'), 'utf-8')
);

const petPersonaTemplate = fs.readFileSync(
  path.join(__dirname, 'prompts/pet_persona.md'),
  'utf-8'
);

// ============================================================
// LLM 客户端初始化（LLM 厂商无关，通过 .env 切换）
// ============================================================
const llmClient = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
});

/**
 * 组装动态 System Prompt，将用户上下文注入提示词模板
 * @param {Object} userContext - 用户与宠物上下文
 * @param {string} userContext.petName - 宠物名字
 * @param {string} userContext.petSpeciesAndTraits - 物种与特征描述
 * @param {string[]} userContext.memories - 已提取的记忆标签数组
 * @param {number} userContext.dayCount - 离别天数
 * @returns {string} 装配好的 System Prompt
 */
function buildSystemPrompt(userContext) {
  const memoryStr =
    userContext.memories && userContext.memories.length > 0
      ? userContext.memories.join('、')
      : '（暂无记录，请从对话中逐渐了解主人）';

  return petPersonaTemplate
    .replace('{{pet_name}}', userContext.petName || '未命名')
    .replace('{{pet_species_and_traits}}', userContext.petSpeciesAndTraits || '未知物种')
    .replace('{{memory_tags_from_db}}', memoryStr)
    .replace('{{day_count}}', String(userContext.dayCount || 1));
}

/**
 * 核心：生成宠物回复，包含 MCP Tool Call 拦截
 * @param {Object} userContext - 用户与宠物上下文
 * @param {string} userMessage - 用户当前消息
 * @param {Array} chatHistory - 对话历史记录 [{ role, content }]
 * @returns {Promise<Object>} 结构化回复 { type, action?, text, toolName? }
 */
async function generatePetResponse(userContext, userMessage, chatHistory = []) {
  // 1. 组装动态 System Prompt
  const systemPrompt = buildSystemPrompt(userContext);

  // 2. 构建完整 messages 数组（System 置首，保证最高指令权重）
  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-10), // 保留最近 10 条历史，防止 token 超限
    { role: 'user', content: userMessage },
  ];

  // 3. 发起附带强制约束的大模型请求
  const response = await llmClient.chat.completions.create({
    model: process.env.LLM_MODEL_NAME,
    temperature: 0.65,   // 黄金区间：防止机器味(＜0.5) 与情感幻觉(＞0.8)
    max_tokens: 150,     // 强制短文本约束，逼迫模型用简短语句回复
    messages,
    tools: toolsSchema,
    tool_choice: 'auto', // 允许模型自主判断是否调用工具
  });

  const msg = response.choices[0].message;

  // 4. MCP 工具调用拦截与转换
  if (msg.tool_calls && msg.tool_calls.length > 0) {
    const toolCall = msg.tool_calls[0];
    const toolName = toolCall.function.name;
    let args;

    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error(`[LLM Client] Tool call arguments parse error for "${toolName}":`, e);
      return { type: 'text', text: '*(挠挠头)* 汪？' };
    }

    // 工具：触发多模态情感 UI
    if (toolName === 'trigger_empathy_ui') {
      return {
        type: 'action',
        toolName: 'trigger_empathy_ui',
        action: args.ui_state,       // 传给前端的动效标志：hug / heartbeat / comforting / listening
        text: args.short_comfort_text,
      };
    }

    // 工具：执行终极告别协议（第 49 天）
    if (toolName === 'execute_farewell_protocol') {
      return {
        type: 'action',
        toolName: 'execute_farewell_protocol',
        action: 'lock_app',           // 告知前端锁定并跳转纪念碑
        text: args.final_blessing,    // 绝笔祝福语，将永久留在纪念碑上
        finalBlessing: args.final_blessing,
      };
    }

    // 工具：提取并脱敏记忆标签（后端静默处理，不影响前端展示）
    if (toolName === 'summarize_and_anonymize_memory') {
      return {
        type: 'memory_update',
        toolName: 'summarize_and_anonymize_memory',
        newTags: args.new_tags,
        category: args.category,
        text: null, // 记忆提取是后台静默行为，不向前端返回文字
      };
    }

    // 未知工具，降级处理
    console.warn(`[LLM Client] Unknown tool call: ${toolName}`);
    return { type: 'text', text: '*(歪头)* 汪？' };
  }

  // 5. 普通纯文本回复
  return {
    type: 'text',
    text: msg.content,
  };
}

module.exports = { generatePetResponse, buildSystemPrompt };
