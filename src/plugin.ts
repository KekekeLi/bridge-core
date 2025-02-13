import { BridgeCore } from './core/bridge'
type PluginInstallFunction = (bridge: BridgeCore) => void

export interface BridgePlugin {
  install: PluginInstallFunction
}
