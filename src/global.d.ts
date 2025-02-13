declare global {
    interface Window {
        __BRIDGE_CORE_INSTANCE__?: import('@like_kk/bridge-core').BridgeCore;
    }
}

export {};