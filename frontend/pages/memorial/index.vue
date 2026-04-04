<template>
  <view class="memorial-container">
    <view class="sky-decoration">
      <view class="star star-1"></view>
      <view class="star star-2"></view>
      <view class="star star-3"></view>
      <view class="star star-4"></view>
      <view class="star star-5"></view>
      <view class="star star-6"></view>
    </view>

    <view class="monument-card">
      <view class="pet-avatar">
        <text class="avatar-icon">🐾</text>
      </view>

      <view class="monument-header">
        <text class="monument-title">数字纪念碑</text>
        <text class="monument-subtitle">{{ petName }} 的永恒记忆</text>
      </view>

      <view class="divider"></view>

      <view class="info-section">
        <view class="info-item">
          <text class="info-label">名字</text>
          <text class="info-value">{{ petName }}</text>
        </view>

        <view class="info-item">
          <text class="info-label">物种与特征</text>
          <text class="info-value">{{ speciesAndTraits }}</text>
        </view>

        <view class="info-item">
          <text class="info-label">共同记忆</text>
          <view class="memory-tags">
            <text
              v-for="(tag, index) in memories"
              :key="index"
              class="memory-tag"
            >
              {{ tag }}
            </text>
          </view>
        </view>
      </view>

      <view class="divider"></view>

      <view class="blessing-section">
        <text class="blessing-label">最后的留言</text>
        <view class="blessing-content">
          <text class="blessing-text">"{{ finalBlessing }}"</text>
        </view>
      </view>

      <view class="stats-section">
        <view class="stat-item">
          <text class="stat-number">{{ totalDays }}</text>
          <text class="stat-label">天的陪伴</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-number">{{ memories.length }}</text>
          <text class="stat-label">段珍贵回忆</text>
        </view>
      </view>

      <view class="footer-message">
        <text class="footer-text">感谢你，让它以另一种方式永远存在 💛</text>
      </view>
    </view>

    <view v-if="showPetals" class="petals-container">
      <view
        v-for="(petal, index) in petals"
        :key="index"
        class="petal"
        :style="{ left: petal.left, animationDelay: petal.delay }"
      ></view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { get } from '@/api/request'

const petName = ref('小伙伴')
const speciesAndTraits = ref('')
const memories = ref([])
const finalBlessing = ref('去好好生活吧，我会一直在你心里。')
const totalDays = ref(49)
const showPetals = ref(true)

const petals = reactive(
  Array.from({ length: 15 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`
  }))
)

onMounted(async () => {
  const userId = uni.getStorageSync('userId')

  if (userId) {
    try {
      const res = await get(`/api/user/${userId}/profile`)

      if (res.success && res.data) {
        const { pet, dayCount } = res.data

        petName.value = pet.name || '小伙伴'
        speciesAndTraits.value = pet.species_and_traits || ''
        memories.value = pet.memories || []
        totalDays.value = dayCount || 49

        if (pet.final_blessing) {
          finalBlessing.value = pet.final_blessing
        }
      }
    } catch (err) {
      console.error('[Memorial] 获取档案失败:', err)
    }
  }

  setTimeout(() => {
    showPetals.value = false
  }, 10000)
})
</script>

<style scoped>
.memorial-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 40rpx;
  padding-top: 80rpx;
  position: relative;
  overflow: hidden;
}

.sky-decoration .star {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s ease-in-out infinite;
}

.star-1 { top: 60rpx; left: 10%; animation-delay: 0s; }
.star-2 { top: 120rpx; left: 25%; animation-delay: 0.5s; width: 6rpx; height: 6rpx; }
.star-3 { top: 80rpx; left: 70%; animation-delay: 1.2s; }
.star-4 { top: 200rpx; left: 85%; animation-delay: 0.3s; width: 10rpx; height: 10rpx; }
.star-5 { top: 300rpx; left: 5%; animation-delay: 1.5s; width: 6rpx; height: 6rpx; }
.star-6 { top: 160rpx; left: 50%; animation-delay: 0.8s; }

.monument-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 60rpx 48rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 10;
}

.pet-avatar {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, $primary-color, #FF7744);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(255, 153, 102, 0.4);
}

.avatar-icon {
  font-size: 72rpx;
}

.monument-header {
  text-align: center;
  margin-bottom: 16rpx;
}

.monument-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.monument-subtitle {
  font-size: 28rpx;
  color: #888;
  display: block;
}

.divider {
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #ddd, transparent);
  margin: 40rpx 0;
}

.info-section {
  padding: 0 8rpx;
}

.info-item {
  margin-bottom: 28rpx;
}

.info-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.info-value {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  display: block;
}

.memory-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.memory-tag {
  background: #FFF5E6;
  color: #FF7744;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  border: 2rpx solid #FFE4CC;
}

.blessing-section {
  margin: 40rpx 0;
  padding: 40rpx;
  background: linear-gradient(135deg, #FFF5E6, #FFE8D6);
  border-radius: 24rpx;
  border-left: 8rpx solid $primary-color;
}

.blessing-label {
  font-size: 26rpx;
  color: #FF7744;
  font-weight: bold;
  display: block;
  margin-bottom: 20rpx;
}

.blessing-text {
  font-size: 32rpx;
  color: #444;
  line-height: 1.8;
  font-style: italic;
}

.stats-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60rpx;
  margin: 40rpx 0;
  padding: 32rpx;
  background: #F9F9F9;
  border-radius: 20rpx;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 56rpx;
  font-weight: bold;
  color: #FF7744;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #888;
  margin-top: 8rpx;
  display: block;
}

.stat-divider {
  width: 2rpx;
  height: 80rpx;
  background: #eee;
}

.footer-message {
  text-align: center;
  margin-top: 40rpx;
}

.footer-text {
  font-size: 26rpx;
  color: #999;
}

.petals-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
}

.petal {
  position: absolute;
  top: -20rpx;
  width: 16rpx;
  height: 16rpx;
  background: rgba(255, 183, 178, 0.6);
  border-radius: 50% 0 50% 0;
  animation: fall 8s linear infinite;
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(1500rpx) rotate(720deg);
    opacity: 0;
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style>
