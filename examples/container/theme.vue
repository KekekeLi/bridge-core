<!-- 父应用组件 -->
<script setup>
import { BridgeCore, ThemeModule, FontModule } from 'bridge-core'

// const bridge = useBridge()
// const theme = ref('#409EFF')

// const updateTheme = (color) => {
//   bridge.theme.updatePrimary(color)
// }
// 初始化
const bridge = new BridgeCore({
  allowedOrigins: ['https://child-domain.com'],
  secretKey: 'your-secret-key'
})

const themeModule = new ThemeModule(bridge)
const fontModule = new FontModule(bridge)

// 更新主题示例
themeModule.updatePrimary('#FF0000')

// 更新字体示例
fontModule.setScale(1.2)
</script>

<template>
  <el-color-picker v-model="theme" @change="updateTheme" />
  <el-slider v-model="fontScale" :min="0.8" :max="1.2" :step="0.1" />
</template>