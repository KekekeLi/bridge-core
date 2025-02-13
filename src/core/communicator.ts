import CryptoJS from 'crypto-js'
import { BridgeMessage } from '@/types/protocol'
export class SafeCommunicator {
  private secretKey: string

  constructor(key?: string) {
    this.secretKey = key || ''
  }

  encodeMessage<T>(message: T): string {
    const payload = JSON.stringify(message)
    return this.secretKey 
      ? CryptoJS.AES.encrypt(payload, this.secretKey).toString()
      : payload
  }

  decodeMessage<T>(data: string): T {
    try {
      const payload = this.secretKey
        ? CryptoJS.AES.decrypt(data, this.secretKey).toString(CryptoJS.enc.Utf8)
        : data
      return JSON.parse(payload)
    } catch (e) {
      throw new Error('消息解密失败')
    }
  }

  verifyMessageSignature(data: BridgeMessage, signature: string): boolean {
    // TODO: 实现消息签名验证
    return true
  }

  generateMessageNonce(): string {
    // TODO: 实现消息随机数生成
    return ''
  }
}