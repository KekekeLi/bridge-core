declare module '@like_kk/bridge-core' {
    import { Ref } from 'vue';
  
    // ==================== 核心类型定义 ====================
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
  
    export interface BridgeConfig {
      allowedOrigins: string[];
      secretKey?: string;
      targetWindow?: Window;
      enableCompression?: boolean;
    }
  
    // ==================== 核心类定义 ====================
    export class BridgeCore {
      constructor(config: BridgeConfig);
  
      registerHandler<T>(type: string, handler: (payload: T) => void): void;
      send<T>(type: string, payload: T): void;
      destroy(): void;
  
      // 安全增强方法
      verifyMessageSignature<T>(message: BridgeMessage<T>): boolean;
      generateMessageNonce(): string;
    }
  
    // ==================== 主题模块类型 ====================
    export interface ThemeConfig {
      primary: string;
      variables: Record<string, string>;
    }
  
    export interface ThemeUpdatePayload extends Partial<ThemeConfig> {
      syncToAll?: boolean;
    }
  
    export class ThemeModule {
      constructor(bridge: BridgeCore);
      
      readonly currentTheme: Ref<ThemeConfig>;
      updateTheme(payload: ThemeUpdatePayload): void;
      resetToDefault(): void;
      
      // Element Plus 集成方法
      updateElementPlusTheme(primaryColor: string): void;
    }
  
    // ==================== 字体模块类型 ====================
    export interface FontConfig {
      baseSize: number;
      scaleFactor: number;
      family?: string;
    }
  
    export interface FontUpdatePayload extends Partial<FontConfig> {
      immediateApply?: boolean;
    }
  
    export class FontModule {
      constructor(bridge: BridgeCore);
      
      readonly currentFont: Ref<FontConfig>;
      updateFont(payload: FontUpdatePayload): void;
      resetToDefault(): void;
      
      // 动态缩放方法
      calculateScaledSize(baseValue: number): number;
    }
  
    // ==================== 通用工具类型 ====================
    export interface AckMessage {
      success: boolean;
      timestamp: number;
      message?: string;
    }
  
    export interface ErrorMessage {
      code: string;
      message: string;
      context?: Record<string, unknown>;
    }
  
    // ==================== 插件系统类型 ====================
    export type PluginInstallFunction = (bridge: BridgeCore) => void;
  
    export interface BridgePlugin {
      name: string;
      install: PluginInstallFunction;
    }
  
    // ==================== 扩展声明 ====================
    export interface BridgeCore {
      use(plugin: BridgePlugin): void;
      plugins: Map<string, BridgePlugin>;
    }
  
    // ==================== 安全相关类型 ====================
    export interface EncryptedMessage {
      iv: string;
      ciphertext: string;
      salt?: string;
    }
  
    export interface SecurityConfig {
      encryptionAlgorithm?: 'AES-GCM' | 'AES-CBC';
      keyDerivationIterations?: number;
    }
  
    // ==================== 响应事件类型 ====================
    export interface BridgeEventMap {
      'theme-update': ThemeConfig;
      'font-update': FontConfig;
      'error': ErrorMessage;
      'ack': AckMessage;
    }
  
    // ==================== 导出声明 ====================
    export {
      BridgeCore as default,
    };
}
