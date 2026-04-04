<template>
  <view class="page">
    <scroll-view scroll-y class="scroll-container">
      <view class="header-section">
        <text class="emoji-icon">🐾</text>
        <text class="main-title">宠智灵境</text>
        <text class="sub-title">让爱与记忆永存</text>
        <text class="desc-text">请告诉我关于你那位特别的小伙伴...</text>
      </view>

      <view class="form-card">
        <view class="form-item">
          <text class="form-label">主人昵称</text>
          <input
            class="form-input"
            :class="{ 'input-focused': focusedField === 'nickname' }"
            type="text"
            v-model="form.nickname"
            placeholder="你的昵称"
            placeholder-class="placeholder-style"
            @focus="focusedField = 'nickname'"
            @blur="focusedField = ''"
          />
        </view>

        <view class="form-item">
          <text class="form-label">宠物名字</text>
          <input
            class="form-input"
            :class="{ 'input-focused': focusedField === 'petName' }"
            type="text"
            v-model="form.petName"
            placeholder="它叫什么名字？"
            placeholder-class="placeholder-style"
            @focus="focusedField = 'petName'"
            @blur="focusedField = ''"
          />
        </view>

        <view class="form-item">
          <text class="form-label">物种</text>
          <input
            class="form-input"
            :class="{ 'input-focused': focusedField === 'species' }"
            type="text"
            v-model="form.species"
            placeholder="例如：金毛犬、英短猫、荷兰猪"
            placeholder-class="placeholder-style"
            @focus="focusedField = 'species'"
            @blur="focusedField = ''"
          />
        </view>

        <view class="form-item">
          <text class="form-label">性格特征</text>
          <textarea
            class="form-textarea"
            :class="{ 'input-focused': focusedField === 'traits' }"
            v-model="form.traits"
            placeholder="它有什么特别的习惯或喜好？例如：总喜欢咬鞋子、怕打雷..."
            placeholder-class="placeholder-style"
            :maxlength="500"
            auto-height
            @focus="focusedField = 'traits'"
            @blur="focusedField = ''"
          />
        </view>

        <button
          class="submit-btn"
          :class="{ 'btn-disabled': submitting }"
          :disabled="submitting"
          @click="handleSubmit"
        >
          {{ submitting ? '创建中...' : '开始陪伴之旅 🐾' }}
        </button>
      </view>

      <view class="footer-tip">
        <text class="tip-text">我们将守护你和它的每一份回忆 💛</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { post } from '@/api/request'

const form = reactive({
  nickname: '',
  petName: '',
  species: '',
  traits: ''
})

const focusedField = ref('')
const submitting = ref(false)

const validateForm = () => {
  if (!form.nickname.trim()) return '请填写主人昵称'
  if (!form.petName.trim()) return '请填写宠物名字'
  if (!form.species.trim()) return '请填写物种'
  if (!form.traits.trim()) return '请描述它的性格特征'
  return null
}

const handleSubmit = async () => {
  const errorMsg = validateForm()
  if (errorMsg) {
    uni.showToast({ title: errorMsg, icon: 'none' })
    return
  }

  submitting.value = true

  try {
    const res = await post('/api/user/create', {
      nickname: form.nickname,
      pet: {
        name: form.petName,
        species_and_traits: `${form.species}，${form.traits}`,
        memories: []
      }
    })

    if (res.success) {
      uni.setStorageSync('userId', res.data.userId)

      uni.showToast({
        title: '档案创建成功',
        icon: 'success',
        duration: 1500
      })

      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/chat/index'
        })
      }, 1500)
    }
  } catch (err) {
    console.error('[Index] 创建失败:', err)
    uni.showToast({
      title: '创建失败，请重试',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@import '@/uni.scss';

.page {
  min-height: 100vh;
  background-color: $bg-color;
}

.scroll-container {
  height: 100vh;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx 40rpx;
}

.emoji-icon {
  font-size: 96rpx;
  margin-bottom: 20rpx;
}

.main-title {
  font-size: 56rpx;
  font-weight: bold;
  color: #FF9966;
  margin-bottom: 16rpx;
}

.sub-title {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.desc-text {
  font-size: 26rpx;
  color: #BBB;
  text-align: center;
}

.form-card {
  margin: 0 32rpx;
  padding: 48rpx 40rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 153, 102, 0.12);
}

.form-item {
  margin-bottom: 36rpx;
}

.form-item:last-of-type {
  margin-bottom: 48rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: $text-color;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: $text-color;
  background-color: #FFF9F5;
  border: 2rpx solid #FFE8DC;
  border-radius: 16rpx;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-textarea {
  width: 100%;
  min-height: 180rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: $text-color;
  background-color: #FFF9F5;
  border: 2rpx solid #FFE8DC;
  border-radius: 16rpx;
  box-sizing: border-box;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.input-focused {
  border-color: $primary-color;
  box-shadow: 0 0 0 4rpx rgba(255, 153, 102, 0.15);
  background-color: #FFFFFF;
}

.placeholder-style {
  color: #CCC;
  font-size: 26rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
  background: linear-gradient(135deg, #FF9966, #FF7744);
  border-radius: 48rpx;
  border: none;
  text-align: center;
  transition: transform 0.2s ease;
}

.submit-btn:active {
  transform: scale(1.02);
}

.btn-disabled {
  background: #CCCCCC !important;
  color: #FFFFFF !important;
}

.btn-disabled:active {
  transform: none;
}

.footer-tip {
  padding: 48rpx 0 80rpx;
  text-align: center;
}

.tip-text {
  font-size: 24rpx;
  color: #BBB;
}
</style>
