# 项目概述
bridge-core 项目是一个用于在不同窗口或 iframe 之间进行安全消息通信的 TypeScript 库。它提供了一个 BridgeCore 类，用于管理消息的发送、接收和处理，同时支持消息的安全验证和签名验证。

核心概念
消息类型 (MessageType)：定义了消息的类型，用于区分不同类型的消息。

源类型 (SourceType)：定义了消息的发送源，可能是 container（父窗口）
或 subApp（子窗口）。

消息处理程序 (MessageHandler)：处理接收到的消息的函数。

安全通信器 (SafeCommunicator)：用于处理消息的编码、解码、签名验证和随机数生成。

类结构
BridgeCore

属性：

modules：一个 Map，用于存储消息类型和对应的处理程序。

allowedOrigins：允许的消息来源域名列表。

secretKey：可选的密钥，用于消息的安全验证。

communicator：SafeCommunicator 实例，用于处理消息的安全通信。

context：消息发送的上下文，可以是 HTMLIFrameElement 或 Window。

source：消息的发送源类型。

构造函数：


```
Apply constructor(
  config: {
    allowedOrigins: string[]
    secretKey?: string
    context?: HTMLIFrameElement
    source?: SourceType
  }
)
```


初始化 BridgeCore 实例，设置允许的域名、密钥、上下文和源类型，并初始化消息监听器。

方法：

initListener()：初始化消息监听器，监听 window 的 message 事件。

handleMessage(event: MessageEvent)：处理接收到的消息，验证消息来源，解析消息并路由到相应的处理程序。

parseMessage(data: string)：解析接收到的消息数据，将其转换为 BridgeMessage 对象。

routeMessage(message: BridgeMessage)：根据消息类型查找并调用相应的处理程序。

validateOrigin(origin: string)：验证消息来源是否在允许的域名列表中。

handleError(code: string, error: Error)：处理错误，将错误信息输出到控制台。

registerHandler<T>(type: MessageType, handler: MessageHandler<T>)：注册消息处理程序。

send<T>(type: string, payload: T, target?: string)：发送消息到指定的目标。

destroy()：销毁消息监听器，停止接收消息。

verifyMessageSignature(message: BridgeMessage, signature: string)：验证消息的签名。

generateMessageNonce()：生成消息的随机数。

addAllowedOrigin(origin: string)：添加允许的消息来源域名。

使用示例

typescript

Apply


// 创建 BridgeCore 实例

```
import { BridgeCore, MessageType, SourceType } from './bridge'

const bridge = new BridgeCore({
  allowedOrigins: ['https://example.com'],
  secretKey: 'your-secret-key',
  context: document.getElementById('my-iframe') as HTMLIFrameElement,
  source: SourceType.container
})
```


// 注册消息处理程序

```
bridge.registerHandler(MessageType.MyMessage, (payload) => {
  console.log('Received message:', payload)
})
```


// 发送消息

```

bridge.send(MessageType.MyMessage, { data: 'Hello, World!' }, 'https://example.com')
```


// 销毁 BridgeCore 实例


```
bridge.destroy()
```


注意事项

确保在使用 BridgeCore 时，正确设置允许的域名列表，以防止跨站脚本攻击（XSS）。

如果使用了密钥，确保密钥的安全性，避免泄露。

在销毁 BridgeCore 实例时，确保移除所有的事件监听器，以避免内存泄漏。

总结
bridge-core 项目提供了一个简单而安全的方式来实现不同窗口或 iframe 之间的消息通信。通过使用 BridgeCore 类，你可以方便地发送和接收消息，并对消息进行安全验证和处理。