<!-- 父应用组件 -->
<script setup>
import { BridgeCore, ThemeModule, FontModule } from 'bridge-core'

// 初始化通信中心
let themeModule = null, fontModule = null
const iframePage = ref(null)
const config = localStorage.getItem(THEME_CONFIG_KEY)
onMounted(() => {
  const iframe = iframePage.value
  iframe.onload = () => {

    const bridge = new BridgeCore({
      allowedOrigins: [url.value],
      secretKey: '123',
      context: iframe,
      source: 'container'
    })
    themeModule = new ThemeModule(bridgeStore.bridge, THEME_CONFIG_KEY)
    fontModule = new FontModule(bridgeStore.bridge)
    // 确保发送到 iframe 的实际源
    themeModule.updateTheme(JSON.parse(config), url.value)
  }
})

// 更新字体示例
fontModule.setScale(1.2)
</script>

<template>
  <el-color-picker v-model="theme" @change="updateTheme" />
  <el-slider v-model="fontScale" :min="0.8" :max="1.2" :step="0.1" />
</template>