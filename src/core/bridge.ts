import { BridgeMessage, MessageType, SourceType, ContextType, PostMessageFn } from '../types/protocol'
import { SafeCommunicator } from './communicator'
type MessageHandler<T = any> = (payload: T) => void

export class BridgeCore {
  // 模块，支持注册事件
  private modules = new Map<MessageType, MessageHandler>()
  // 可接收的信息源
  private allowedOrigins: string[]
  // 密钥，用于消息加密
  private secretKey?: string
  // 加/解密工具
  private communicator: SafeCommunicator
  // iframe或window的postMessage通信上下文
  private iframeContext?: HTMLIFrameElement[] | Window
  // 新tab页的postMessage通信上下文
  private tabContext?: Map<string, PostMessageFn> | null
  // 消息源
  private source?: SourceType

  constructor(config: {
    allowedOrigins: string[]
    secretKey?: string
    context?: HTMLIFrameElement
    iframeContext?: HTMLIFrameElement[]
    tabContext?: Map<string, PostMessageFn> | null
    source?: SourceType
  }) {
    this.allowedOrigins = config.allowedOrigins
    this.secretKey = config.secretKey
    this.iframeContext = config.iframeContext
    this.tabContext = config.tabContext 
    this.source = config.source
    this.communicator = new SafeCommunicator(this.secretKey)
    this.initListener()
  }

  private initListener() {
    window.addEventListener('message', this.handleMessage)
  }

  public getOrigins() {
    return this.allowedOrigins
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
      // return this.communicator.decodeMessage(data)
      return JSON.parse(data)
    } catch (err) {
      throw new Error('消息解析失败')
    }
  }

  private routeMessage(message: BridgeMessage) {
    const handler = this.modules.get(message.type)
    handler?.(message.payload)
  }

  // 安全验证
  private validateOrigin(origin: string): boolean {
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
  public send<T>(type: string, payload: T, target?: string) {
    const message: BridgeMessage = {
      type,
      payload,
    };

    if (this.source === 'container') {
      // 父传子：iframe
      // (this.context as HTMLIFrameElement)?.contentWindow?.postMessage(JSON.stringify(message), target || '*')
      (this.iframeContext as HTMLIFrameElement[])?.forEach((iframe) => {
        iframe?.contentWindow?.postMessage(JSON.stringify(message), target || '*')
      })
      // 父传子：新tab页
      if (this.tabContext) {
        this.tabContext.forEach((fn: PostMessageFn, key) => {
          fn(JSON.stringify(message), key)
        })
      }
    } else if(this.source === 'subApp') {
      if (window.opener) {
        // 子传父
        window.opener?.postMessage(JSON.stringify(message), this.allowedOrigins[0])
      } else {
        // 子传父
        window.parent.postMessage(JSON.stringify(message), this.allowedOrigins[0])
      }
    }
  }

  public destroy() {
    window.removeEventListener('message', this.handleMessage)
  }

  public verifyMessageSignature(message: BridgeMessage, signature: string): boolean {
    return this.communicator.verifyMessageSignature(message, signature)
  }

  generateMessageNonce(): string {
    return this.communicator.generateMessageNonce()
  }

  public addAllowedOrigin(origin: string) {
    this.allowedOrigins.push(origin)
  }

  public clearAllowedOrigins() {
    this.allowedOrigins = []
  }

  public updateContext(context: HTMLIFrameElement[] | Map<string, PostMessageFn>, type: ContextType) {
    if (type === 'iframe') {
      this.iframeContext = context as HTMLIFrameElement[]
    } else if (type === 'tab') {
      this.tabContext = context as Map<string, PostMessageFn>
    }
  }
}