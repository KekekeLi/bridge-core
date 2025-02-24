// src/types/protocol.ts
export type MessageType = 
  | 'THEME_UPDATE' 
  | 'FONT_SCALE'
  | 'USER_SYNC'
  | string

export interface BridgeMessage<T = unknown> {
  type: MessageType
  payload: T
  metadata?: {// 消息数据 
    timestamp: number, // 时间戳 
    source: string, // 消息来源（父应用或子应用）
    signature?: string // 安全签名（用于验证）
  }
}

export type SourceType = 'container' | 'subApp'