// src/core/BridgeCore.ts
import CryptoJS from 'crypto-js'
import type { BridgeMessage } from '../types/protocol'

type MessageHandler<T = unknown> = (payload: T) => void

export class BridgeCore {
  private handlers = new Map<string, MessageHandler>()
  private allowedOrigins: string[]
  private secretKey?: string
  private targetWindow?: Window

  constructor(config: {
    allowedOrigins: string[]
    secretKey?: string
    targetWindow?: Window
  }) {
    this.allowedOrigins = config.allowedOrigins
    this.secretKey = config.secretKey
    this.targetWindow = config.targetWindow || window.parent
    this.initMessageListener()
  }

  private initMessageListener() {
    window.addEventListener('message', this.handleMessage)
  }

  private handleMessage = (event: MessageEvent) => {
    if (!this.validateOrigin(event.origin)) return

    try {
      const message = this.parseMessage(event.data)
      this.routeMessage(message)
    } catch (err) {
      console.error('[BridgeCore] 消息处理失败:', err)
    }
  }

  private parseMessage(data: string): BridgeMessage {
    try {
      const decrypted = this.secretKey
        ? CryptoJS.AES.decrypt(data, this.secretKey).toString(CryptoJS.enc.Utf8)
        : data
      
      return JSON.parse(decrypted) as BridgeMessage
    } catch (err) {
      throw new Error('消息解析失败')
    }
  }

  private validateOrigin(origin: string): boolean {
    return this.allowedOrigins.includes(origin)
  }

  private routeMessage(message: BridgeMessage) {
    const handler = this.handlers.get(message.type)
    handler?.(message.payload)
  }

  public registerHandler<T>(type: string, handler: MessageHandler<T>) {
    this.handlers.set(type, handler as MessageHandler)
  }

  public send<T>(type: string, payload: T) {
    const message: BridgeMessage = {
      type,
      payload,
      metadata: {
        timestamp: Date.now(),
        source: 'child'
      }
    }

    const data = this.secretKey
      ? CryptoJS.AES.encrypt(JSON.stringify(message), this.secretKey).toString()
      : JSON.stringify(message)

    this.targetWindow?.postMessage(data, '*')
  }

  public destroy() {
    window.removeEventListener('message', this.handleMessage)
  }
}