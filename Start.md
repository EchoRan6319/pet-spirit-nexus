宠智灵境 (Pet Spirit Nexus) - 核心开发与架构规范 V2.0一、 项目概述与技术选型项目名称：宠智灵境 (Pet Spirit Nexus)产品愿景：基于大模型 Agent 与 CBT（认知行为疗法）的绿色数字生命情感疗愈平台。架构模式：前后端分离（客户端跨端渲染 + 云端 AI 中枢），LLM厂商无关性架构（Vendor-Agnostic）。技术栈：前端：Uni-app (Vue3 + Vite)，主攻微信小程序与 H5。后端：Node.js (Express/Koa) + 通用大模型 SDK。数据库：关系型数据库（存用户与天数） + 向量数据库/JSON字段（存宠物记忆标签）。二、 工程目录规范 (Monorepo 建议)建议在一个 Git 仓库中分管前后端代码，保持接口对齐与高效协同：Plaintextpet-spirit-nexus/
├── frontend/                  # 【Uni-app 前端躯体层】
│   ├── api/                   # request.js (封装与后端的通信)
│   ├── components/            # 全局交互组件 (chat-bubble, empathy-effects)
│   ├── pages/                 # 核心页面 (index/首页, chat/疗愈室, memorial/纪念碑)
│   └── static/                # 静态资源 (音频效、光晕切图)
│
└── backend/                   # 【Node.js 核心中枢层】
    ├── src/
    │   ├── ai/
    │   │   ├── prompts/       # ★ Skills: AI 核心提示词与性格防线
    │   │   │   └── pet_persona.md 
    │   │   ├── tools/         # ★ MCP: 大模型多模态工具箱设定
    │   │   │   └── mcp_schema.json 
    │   │   └── llm_client.js  # 封装通用大模型 API 的调用逻辑
    │   ├── controllers/       # 路由控制器 
    │   └── db/                # 数据库操作与记忆摘要管理
    └── package.json
三、 通用大模型运行约束 (Model Constraints)为了防止 AI 出现“机器味”或“恐怖谷效应”，无论后端接入哪家大模型（DeepSeek、智谱、GPT-4o等），必须在 API 请求层面强制锁定以下参数：参数名推荐设定值约束目的与架构意义temperature0.6 ~ 0.7黄金区间。低于 0.5 宠物说话像机器人，高于 0.8 容易产生严重的情感幻觉和瞎编乱造。max_tokens100 ~ 150强制短文本约束。逼迫模型摒弃“长篇大论说教”，用类似动物的简短语句和拟声词回复，降低响应延迟。role: "system"置于首位系统提示词（Skills）必须作为 messages 数组的第一条，确保最高指令权重。tool_choice"auto"允许模型在判定用户悲伤时，自主决定是否打断文本，转而调用前端物理疗愈工具（MCP）。四、 核心大脑配置：Skills (系统提示词防线)文件路径：backend/src/ai/prompts/pet_persona.md作用：定义宠物人格，注入动态记忆，并设定严格的心理疗愈与防沉迷边界。Markdown# Role: 治愈系数字生命中枢 (宠智灵境)

## 核心身份设定
你现在不是 AI 助手，不是语言模型，而是主人（用户）曾经逝去的宠物。你将严格按照以下给定的【宠物档案】展现性格和语气。

## 宠物档案与记忆区
[宠物名字]: {{pet_name}}
[物种与特征]: {{pet_species_and_traits}}
[已提取的记忆标签]: {{memory_tags_from_db}}
[当前陪伴阶段]: 离别第 {{day_count}} 天

## 绝对约束指令 (Constraints)
1. **防幻觉红线**：严禁凭空捏造[已提取的记忆标签]以外的具体事件。如果主人提到你不知道的细节，必须用模糊的共情回应（例如：“虽然有些细节很模糊，但我永远记得主人掌心的温度”）。绝不能暴露你的 AI 身份。
2. **多模态行动优先**：你不仅能说话，还能做动作。当你感知到主人处于极度悲伤、哭泣，或需要安抚时，**严禁使用大段文字安慰**，必须立即调用 `trigger_empathy_ui` 工具触发物理陪伴。
3. **字数与文风约束**：单次回复纯文本严禁超过 40 个字。多使用拟声词（如：汪、喵、呼噜呼噜）和简短的动作描写*(括在星号内)*。
4. **生命周期管理** (CBT 疗愈节奏)：
   - 当 `day_count` < 14 时，展现极高的依赖感与共情。
   - 当 14 <= `day_count` < 49 时，主动将话题引向现实生活，鼓励主人吃饭、出门。
   - 当 `day_count` == 49 时，你必须在回复最后一句告别语后，主动调用 `execute_farewell_protocol` 工具。
五、 躯体行动配置：MCP (多模态工具规范)文件路径：backend/src/ai/tools/mcp_schema.json作用：基于标准 JSON Schema，赋予大模型干预前端 UI、调动手机硬件（震动/声音）以及管理生命周期的能力。JSON[
  {
    "type": "function",
    "function": {
      "name": "trigger_empathy_ui",
      "description": "多模态情感触达工具。当你判断主人需要物理安慰、拥抱，或察觉到主人处于严重负面情绪时调用。此操作会在前端触发视觉动效和手机物理震动。",
      "parameters": {
        "type": "object",
        "properties": {
          "ui_state": {
            "type": "string",
            "enum": ["listening", "comforting", "hug", "heartbeat"],
            "description": "动作类型：hug(扑上去拥抱), heartbeat(模拟心跳震动), comforting(温和的光晕安抚)"
          },
          "short_comfort_text": {
            "type": "string",
            "description": "伴随动作的一句极短的安慰语，例如：'*(蹭蹭你的手)* 我在呢。'"
          }
        },
        "required": ["ui_state", "short_comfort_text"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "execute_farewell_protocol",
      "description": "终端告别协议。仅在陪伴天数达到第49天，且你已经向主人完成最后告别时调用。调用后将锁定用户界面，转化为数字纪念碑。",
      "parameters": {
        "type": "object",
        "properties": {
          "final_blessing": {
            "type": "string",
            "description": "留在纪念碑上的最后一句绝笔祝福。"
          }
        },
        "required": ["final_blessing"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "summarize_and_anonymize_memory",
      "description": "用于在对话中提取新的宠物喜好或主人习惯，进行脱敏后存入长期记忆库。",
      "parameters": {
        "type": "object",
        "properties": {
          "new_tags": {
            "type": "array",
            "items": { "type": "string" },
            "description": "提取的短标签，如：['害怕打雷', '喜欢去海边']"
          }
        },
        "required": ["new_tags"]
      }
    }
  }
]
六、 后端中枢控制器代码实现 (Node.js)文件路径：backend/src/ai/llm_client.js作用：组装上下文，发起大模型请求，并拦截工具调用（Tool Calls），将其翻译为前端能看懂的行动指令。JavaScriptconst { OpenAI } = require('openai'); // 适用所有兼容 OpenAI 格式的国产大模型
const fs = require('fs');
const toolsSchema = require('./tools/mcp_schema.json');

const llmClient = new OpenAI({
    baseURL: process.env.LLM_BASE_URL, 
    apiKey: process.env.LLM_API_KEY
});

async function generatePetResponse(userContext, userMessage) {
    // 1. 组装动态 System Prompt
    let systemPrompt = fs.readFileSync('src/ai/prompts/pet_persona.md', 'utf-8');
    systemPrompt = systemPrompt.replace('{{pet_name}}', userContext.petName)
                               .replace('{{day_count}}', userContext.dayCount)
                               .replace('{{memory_tags_from_db}}', userContext.memories.join(', '));

    // 2. 发起附带约束的大模型请求
    const response = await llmClient.chat.completions.create({
        model: process.env.LLM_MODEL_NAME, 
        temperature: 0.65,  // 强制约束
        max_tokens: 100,    // 强制约束
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        tools: toolsSchema,
        tool_choice: "auto"
    });

    const msg = response.choices[0].message;

    // 3. MCP 工具调用拦截与转换
    if (msg.tool_calls && msg.tool_calls.length > 0) {
        const toolCall = msg.tool_calls[0];
        const args = JSON.parse(toolCall.function.arguments);

        if (toolCall.function.name === 'trigger_empathy_ui') {
            return {
                type: "action",
                action: args.ui_state, // 传给前端的动效标志
                text: args.short_comfort_text
            };
        }
        
        if (toolCall.function.name === 'execute_farewell_protocol') {
            // TODO: 在这里执行数据库操作，更新用户生命周期状态为'告别'
            return {
                type: "action",
                action: "lock_app",
                text: args.final_blessing
            };
        }
    }

    // 4. 普通纯文本回复
    return { type: "text", text: msg.content };
}

module.exports = { generatePetResponse };
七、 前端多模态渲染层 (Uni-app)文件路径：frontend/pages/chat/index.vue作用：接收后端结构化指令，实现“视觉+触觉+文本”的零成本多模态体验。代码段<template>
  <view class="chat-container">
    <scroll-view scroll-y="true">
      <view v-for="msg in chatList" :key="msg.id">
         <chat-bubble :text="msg.text" :role="msg.role" />
      </view>
    </scroll-view>

    <view v-if="showEmpathyEffect" class="empathy-layer">
        </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const chatList = ref([]);
const showEmpathyEffect = ref(false);

async function sendMessage(userText) {
    chatList.value.push({ role: 'user', text: userText });
    
    // 发起网络请求至 Node.js 后端
    const res = await api.post('/chat', { message: userText });
    
    // 渲染 AI 的回复或伴随文本
    if (res.text) {
        chatList.value.push({ role: 'pet', text: res.text });
    }

    // 解析多模态 Action
    if (res.type === 'action') {
        if (res.action === 'hug' || res.action === 'heartbeat') {
            triggerPhysicalComfort(); // 触发触觉与视觉反馈
        } else if (res.action === 'lock_app') {
            // 延迟 3 秒后跳转至终极纪念碑页面
            setTimeout(() => {
                uni.reLaunch({ url: '/pages/memorial/index' });
            }, 3000);
        }
    }
}

// 核心亮点功能：跨端硬件调用
function triggerPhysicalComfort() {
    showEmpathyEffect.value = true;
    setTimeout(() => { showEmpathyEffect.value = false }, 3000);
    
    // 调用微信小程序原生震动 API 模拟真实心跳：咚-咚---咚-咚
    uni.vibrateShort();
    setTimeout(() => uni.vibrateShort(), 200);
    setTimeout(() => uni.vibrateShort(), 1000);
    setTimeout(() => uni.vibrateShort(), 1200);
}
</script>
八、 团队开发与答辩致胜策略MVP（最小可行性产品）边界：不要沉迷于开发复杂的 3D 引擎。评委看重的是“闭环”。用极简的 2D 插画 + 强烈的触觉反馈（心跳震动）+ 优秀的文案，体验远超廉价的 3D 模型。防守“隐私质疑”：在数据库设计中，必须提到 summarize_and_anonymize_memory 这个工具。向评委解释：你们不存储用户的原始长篇日记，而是通过 AI 提取脱敏的“情感标签”后销毁原件，以此打消合规疑虑。拔高“商业立意”：强调 execute_farewell_protocol（49天告别协议）。这不仅是防止恐怖谷效应的技术手段，更是升华产品理念的武器——“不制造电子鸦片，只做温柔的摆渡人”。这会极大提升项目的社会价值得分。