<template>
  <view :class="['chat-bubble', `bubble-${role}`]">
    <text class="bubble-text">{{ text }}</text>
  </view>
</template>

<script setup>
defineProps({
  text: { type: String, required: true },
  role: { type: String, required: true }
})
</script>

<style scoped>
.chat-bubble {
  max-width: 70%;
  padding: 20rpx 28rpx;
  margin: 16rpx 0;
  line-height: 1.6;
  font-size: 28rpx;
  word-break: break-all;
}

.bubble-user {
  margin-left: auto;
  background-color: $bubble-user;
  border-radius: 24rpx 24rpx 6rpx 24rpx;
}

.bubble-user .bubble-text {
  color: #fff;
}

.bubble-pet {
  margin-right: auto;
  background-color: $bubble-pet;
  border-radius: 24rpx 24rpx 24rpx 6rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.bubble-pet .bubble-text {
  color: $text-color;
}
</style>
