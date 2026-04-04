<template>
  <view class="chat-container">
    <view class="chat-header">
      <text class="pet-name">{{ petName || '你的小伙伴' }}</text>
      <text class="day-count">第 {{ dayCount }} 天</text>
    </view>

    <scroll-view
      scroll-y="true"
      class="message-list"
      :scroll-into-view="scrollToView"
      scroll-with-animation
    >
      <view
        v-for="(msg, index) in chatList"
        :key="msg.id"
        :id="'msg-' + index"
      >
        <chat-bubble :text="msg.text" :role="msg.role" />
      </view>

      <view v-if="isTyping" class="typing-indicator">
        <text class="typing-text">正在输入...</text>
      </view>
    </scroll-view>

    <empathy-layer
      :show="showEmpathyEffect"
      :action-type="currentActionType"
      @hide="handleEmpathyHide"
    />

    <view class="input-area">
      <input
        v-model="inputText"
        class="message-input"
        placeholder="说点什么吧..."
        :adjust-position="true"
        confirm-type="send"
        @confirm="sendMessage"
      />
      <button
        class="send-btn"
        @click="sendMessage"
        :disabled="!inputText.trim() || isSending"
      >
        发送
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { get, post } from '@/api/request'
import ChatBubble from '@/components/chat-bubble.vue'
import EmpathyLayer from '@/components/empathy-layer.vue'

const chatList = ref([])
const inputText = ref('')
const isSending = ref(false)
const isTyping = ref(false)
const showEmpathyEffect = ref(false)
const currentActionType = ref('')
const scrollToView = ref('')
const petName = ref('')
const dayCount = ref(1)
const userId = ref('')

onMounted(async () => {
  userId.value = uni.getStorageSync('userId')
  if (!userId.value) {
    uni.reLaunch({ url: '/pages/index/index' })
    return
  }

  try {
    const profileRes = await get(`/api/user/${userId.value}/profile`)
    if (profileRes.success) {
      petName.value = profileRes.data.pet.name
      dayCount.value = profileRes.data.dayCount
    }
  } catch (err) {
    console.error('[Chat] 获取档案失败:', err)
  }
})

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isSending.value) return

  inputText.value = ''

  chatList.value.push({
    id: Date.now(),
    role: 'user',
    text: text
  })

  await nextTick()
  scrollToBottom()

  isSending.value = true
  isTyping.value = true

  try {
    const res = await post('/api/chat', {
      userId: userId.value,
      message: text,
      chatHistory: chatList.value.slice(-10).map(m => ({
        role: m.role,
        content: m.text
      }))
    })

    isTyping.value = false

    if (res.success) {
      const data = res.data

      if (data.type === 'text' && data.text) {
        chatList.value.push({
          id: Date.now() + 1,
          role: 'pet',
          text: data.text
        })
      } else if (data.type === 'action') {
        if (data.text) {
          chatList.value.push({
            id: Date.now() + 1,
            role: 'pet',
            text: data.text
          })
        }

        if (data.action === 'hug' || data.action === 'heartbeat') {
          currentActionType.value = data.action
          showEmpathyEffect.value = true
        } else if (data.action === 'lock_app') {
          handleFarewellProtocol(data.text)
        }
      } else if (data.type === 'memory_update') {
        console.log('[Chat] 记忆已更新:', data.newTags)
      }

      await nextTick()
      scrollToBottom()
    }
  } catch (err) {
    console.error('[Chat] 发送失败:', err)
    isTyping.value = false
    chatList.value.push({
      id: Date.now() + 1,
      role: 'pet',
      text: '*(歪头)* 网络好像不太好，再说一次？'
    })
  } finally {
    isSending.value = false
  }
}

function scrollToBottom() {
  const lastIndex = chatList.value.length - 1
  scrollToView.value = 'msg-' + lastIndex
}

function handleEmpathyHide() {
  showEmpathyEffect.value = false
}

function handleFarewellProtocol(blessingText) {
  if (blessingText) {
    chatList.value.push({
      id: Date.now() + 1,
      role: 'pet',
      text: blessingText
    })
  }

  setTimeout(() => {
    uni.reLaunch({ url: '/pages/memorial/index' })
  }, 3000)
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-color;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #FFE4CC 0%, #FFD4A8 100%);
}

.pet-name {
  font-size: 34rpx;
  font-weight: 600;
  color: $text-color;
}

.day-count {
  font-size: 26rpx;
  color: $primary-color;
  font-weight: 500;
}

.message-list {
  flex: 1;
  padding: 20rpx 24rpx;
  padding-bottom: 40rpx;
}

.typing-indicator {
  display: flex;
  padding: 16rpx 28rpx;
  margin: 8rpx 0;
}

.typing-text {
  font-size: 26rpx;
  color: #bbb;
  font-style: italic;
}

.input-area {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  border-top: 1rpx solid #f0e8e0;
}

.message-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  margin-right: 20rpx;
  font-size: 28rpx;
  background-color: #f7f3ef;
  border-radius: 36rpx;
  border: none;
}

.send-btn {
  width: 120rpx;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0;
  font-size: 28rpx;
  color: #fff;
  background-color: $primary-color;
  border-radius: 36rpx;
  border: none;
}

.send-btn[disabled] {
  opacity: 0.5;
}
</style>
