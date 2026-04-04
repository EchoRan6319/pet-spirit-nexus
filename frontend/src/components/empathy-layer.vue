<template>
  <view v-if="show" :class="['empathy-layer', `action-${actionType}`]"></view>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  actionType: { type: String, default: '' }
})

const emit = defineEmits(['hide'])

function triggerVibration() {
  uni.vibrateShort()
  setTimeout(() => uni.vibrateShort(), 200)
  setTimeout(() => uni.vibrateShort(), 1000)
  setTimeout(() => uni.vibrateShort(), 1200)
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.actionType === 'hug' || props.actionType === 'heartbeat') {
      triggerVibration()
    }
    setTimeout(() => {
      emit('hide')
    }, 3000)
  }
})
</script>

<style scoped>
.empathy-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle, rgba(255, 200, 150, 0.4) 0%, rgba(0, 0, 0, 0) 70%);
  pointer-events: none;
  z-index: 999;
  animation: breathe 3s ease-in-out forwards;
}

.action-heartbeat .empathy-layer,
.action-hug.empathy-layer {
  animation-duration: 2s;
}

@keyframes breathe {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}
</style>
