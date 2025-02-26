// 子应用入口文件
import { BridgeCore } from 'bridge-core'
import { ThemeModule, FontModule } from '@team/bridge-core/modules'

const bridge = new BridgeCore({
  origins: ['https://parent-domain.com'],
  secretKey: import.meta.env.VITE_SECRET_KEY
})

// 初始化模块
new ThemeModule(bridge, 'theme-config')
new FontModule(bridge)

const handleCustomAction = (data: any) => {
  console.log('Custom event received:', data)
}

// 监听自定义事件
bridge.on('CUSTOM_EVENT', handleCustomAction)
