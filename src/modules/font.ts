import { useStorage } from '@vueuse/core'
import type { BridgeCore } from '../core/bridge'

interface FontConfig {
  baseSize: number
  scaleFactor: number
}

export class FontModule {
  private store = useStorage<FontConfig>('font-config', {
    baseSize: 14,
    scaleFactor: 1
  })

  constructor(private bridge: BridgeCore) {
    this.applyFontSettings()
    this.setupHandlers()
  }

  private setupHandlers() {
    // 监听父应用发来的更新
    this.bridge.registerHandler('FONT_UPDATE', (payload: FontConfig) => {
      this.store.value = payload
      this.applyFontSettings()
      this.sendAck()
    })
  }

  private applyFontSettings() {
    const { baseSize, scaleFactor } = this.store.value
    const root = document.documentElement
    
    // 应用基础字体
    root.style.fontSize = `${baseSize}px`
    
    // 应用缩放比例
    document.querySelectorAll('.el').forEach(el => {
      (el as HTMLElement).style.fontSize = `${baseSize * scaleFactor}px`
    })
  }

  // 主动更新方法（父应用调用）
  public updateFont(config: Partial<FontConfig>) {
    // 合并更新并持久化
    this.store.value = { ...this.store.value, ...config }
    // 发送给子应用
    this.bridge.send('FONT_UPDATE', this.store.value)
    this.applyFontSettings()
  }

  private sendAck() {
    this.bridge.send('FONT_UPDATE_ACK', { success: true })
  }
}