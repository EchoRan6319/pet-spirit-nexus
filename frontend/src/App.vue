<script setup>
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  const userId = uni.getStorageSync('userId')
  if (!userId) {
    console.log('用户未登录')
  } else {
    console.log('用户已登录, userId:', userId)
  }
})
</script>

<style>
page {
  background-color: #FFF8F0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
