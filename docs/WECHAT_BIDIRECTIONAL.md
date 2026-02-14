# 网站与企业微信互发消息说明

## 当前能力

| 方向 | 实现方式 | 状态 |
|------|----------|------|
| **网站 → 企业微信群** | 群机器人 Webhook | ✅ 已实现（新用户/顾问注册、跟进人离线通知等） |
| **企业微信 → 网站** | 自建应用接收消息回调 | 🔧 已预留接口，配置后即可打通 |

## 一、网站 → 企业微信群（已用）

- 在**企业微信群**里添加「**群机器人**」（不是 Smart 大模型机器人），复制 Webhook 地址。
- 在 `.env` / Vercel 中配置：`WECHAT_WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxx"`  
- 系统会在以下场景往该群发消息：
  - 新会员 / 新顾问注册
  - 会员发消息或文件、未接来电且跟进人不在线时

## 二、企业微信 → 网站（需配置自建应用）

群机器人**只能发、不能收**。要让「企业微信里发的消息同步到网站」，需用**自建应用 + 接收消息**。

### 1. 创建自建应用

1. 登录 [企业微信管理后台](https://work.weixin.qq.com/)。
2. **应用管理** → **自建** → **创建应用**，记下 **AgentId**、**Secret**。
3. **我的企业** → **企业信息**，记下 **企业ID (CorpID)**。

### 2. 配置接收消息

1. 进入该应用 → **接收消息** → **设置 API 接收**。
2. 填写：
   - **URL**：`https://www.jiayi.co/api/wechat/receive`（生产）或本地用内网穿透后的地址。
   - **Token**：自定义英文/数字，≤32 位（如 `jiayi2026`）。
   - **EncodingAESKey**：点击随机获取，保存 43 位密钥。

### 3. 环境变量

在 `.env` / Vercel 中增加：

```env
WECHAT_CORP_ID="企业ID"
WECHAT_CALLBACK_TOKEN="上一步填的 Token"
WECHAT_ENCODING_AES_KEY="上一步的 43 位 EncodingAESKey"
```

保存后**重新部署**，再在企业微信里点击「保存」完成 URL 校验。

### 4. 互发效果

- **网站 → 群**：继续用现有 Webhook，通知会发到群。
- **企业微信 → 网站**：成员在**该自建应用**里发消息（工作台点进应用发），回调会收到；后续在代码里把消息写入对应案件会话，会员中心即可看到。  
  （注意：是「发到自建应用」的消息会回调，不是「在群机器人所在群里@机器人」的回复。）

## 参考文档

- [消息推送（原「群机器人」）](https://developer.work.weixin.qq.com/document/path/99110)（发到群）
- [接收消息与事件](https://developer.work.weixin.qq.com/document/path/90238)、[加解密方案](https://developer.work.weixin.qq.com/document/path/90968)（收消息）
