import { BridgeMessage, MessageType } from '../types/protocol'
import { SafeCommunicator } from './communicator'
type MessageHandler<T = any> = (payload: T) => void

export class BridgeCore {
  private modules = new Map<MessageType, MessageHandler>()
  private allowedOrigins: string[]
  private secretKey?: string
  private targetWindow?: Window
  private communicator: SafeCommunicator

  constructor(config: {
    allowedOrigins: string[]
    secretKey?: string
    targetWindow?: Window
  }) {
    console.log('init');
    this.allowedOrigins = config.allowedOrigins
    this.secretKey = config.secretKey
    this.targetWindow = config.targetWindow || window.parent
    this.communicator = new SafeCommunicator(this.secretKey)
    this.initListener()
  }

  private initListener() {
    window.addEventListener('message', this.handleMessage)
  }

  private handleMessage = (event: MessageEvent) => {
    if (!this.validateOrigin(event.origin)) return

    try {
      const message = this.parseMessage(event.data)
      this.routeMessage(message)
    } catch (err: any) {
      this.handleError('[BridgeCore] 消息处理失败:', err)
    }
  }

  private parseMessage(data: string): BridgeMessage {
    try {
      return this.communicator.decodeMessage(data)
    } catch (err) {
      throw new Error('消息解析失败')
    }
  }
  // private parseMessage(data: string): BridgeMessage {
  //   const raw = this.encryptionKey 
  //     ? this.decrypt(data) 
  //     : JSON.parse(data)
    
  //   return {
  //     version: raw.version || '1.0',
  //     type: raw.type,
  //     payload: raw.payload,
  //     metadata: raw.metadata
  //   }
  // }

  private routeMessage(message: BridgeMessage) {
    const handler = this.modules.get(message.type)
    handler?.(message.payload)
  }

  // 安全验证
  private validateOrigin(origin: string): boolean {
    console.log(origin, 'origin');
    return this.allowedOrigins.includes(origin);
  }

  // 错误处理
  private handleError(code: string, error: Error) {
    console.error(`[CoreBridge Error ${code}]`, error);
  }

  registerHandler<T>(type: MessageType, handler: MessageHandler<T>) {
    this.modules.set(type, handler)
  }

  // 发送信息
  public send<T>(type: string, payload: T) {
    const message: BridgeMessage = {
      type,
      payload,
      metadata: {
        timestamp: Date.now(),
        source: 'child'
      }
    }

    const data = this.communicator.encodeMessage(message)

    this.targetWindow?.postMessage(data, '*')
  }
  // send(target: Window, type: string, payload: any) {
  //   target.postMessage(JSON.stringify({
  //     type,
  //     payload,
  //     metadata: {
  //       timestamp: Date.now(),
  //       source: 'child'
  //     }
  //   }), '*');
  // }

  public destroy() {
    window.removeEventListener('message', this.handleMessage)
  }

  public verifyMessageSignature(message: BridgeMessage, signature: string): boolean {
    return this.communicator.verifyMessageSignature(message, signature)
  }

  generateMessageNonce(): string {
    return this.communicator.generateMessageNonce()
  }
}