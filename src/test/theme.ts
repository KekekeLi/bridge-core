import { useElementPlusTheme } from 'use-element-plus-theme'
import { useStorage } from '@vueuse/core'
import type { BridgeCore } from '../core/bridge'

interface ThemeConfig {
  primary: string
  success: string
  error: string
  warn: string
}

export class ThemeModule {
  private store = useStorage<ThemeConfig>('theme-config', {
    primary: '#409EFF',
    success: '#67C23A',
    error: '#F56C6C',
    warn: '#E6A23C'
  })

  constructor(private bridge: BridgeCore) {
    this.initElementTheme()
    this.setupHandlers()
  }

  private initElementTheme() {
    const { changeTheme } = useElementPlusTheme()
    changeTheme(this.store.value.primary)
    this.applyVariables()
  }

  private setupHandlers() {
    // 监听父应用发来的更新
    this.bridge.registerHandler('THEME_UPDATE', (payload: ThemeConfig) => {
      this.store.value = payload
      this.applyVariables()
      this.sendAck()
    })
  }

  private applyVariables() {
    const root = document.documentElement
    Object.entries(this.store.value).forEach(([key, val]) => {
      // 设置全局变量
      root.style.setProperty(`--el-color-${key}`, val)
    })
  }

  // 主动更新方法（父应用调用）
  public updateTheme(newTheme: Partial<ThemeConfig>) {
    // 合并更新并持久化
    this.store.value = { ...this.store.value, ...newTheme }
    // 发送给子应用
    this.bridge.send('THEME_UPDATE', this.store.value)
    this.applyVariables()
  }

  private sendAck() {
    this.bridge.send('THEME_UPDATE_ACK', { success: true })
  }
}