# 会员与顾问系统更新说明

## 更新日期：2026年1月30日

## 新增功能

### 1. 会员消息系统增强

**文件位置：**
- `src/app/member/messages/page.tsx` - 会员消息页面
- `src/app/api/member/messages/route.ts` - 消息API
- `src/app/api/member/messages/read/route.ts` - 标记已读API
- `src/app/api/member/rcic-status/route.ts` - 顾问在线状态API

**功能特性：**
- 支持文字消息发送
- 支持图片上传发送
- 支持文档上传发送（PDF、Word、Excel）
- 显示顾问在线状态
- 消息已读状态追踪
- 按申请分类消息会话

### 2. 文件上传功能

**文件位置：**
- `src/app/api/upload/route.ts` - 通用文件上传API

**支持的文件类型：**
- 图片：JPG、PNG、GIF、WebP（最大10MB）
- 文档：PDF、DOC、DOCX、XLS、XLSX（最大20MB）

**存储位置：**
- 文件存储在 `public/uploads/` 目录
- 按日期自动分类存储

### 3. RCIC顾问后台完善

**文件位置：**
- `src/app/rcic/login/page.tsx` - 顾问登录页面
- `src/app/rcic/dashboard/page.tsx` - 顾问仪表板
- `src/app/rcic/cases/page.tsx` - 案件列表页面
- `src/app/rcic/cases/[id]/page.tsx` - 案件详情审核页面
- `src/app/rcic/messages/page.tsx` - 顾问消息页面

**API接口：**
- `src/app/api/rcic/auth/login/route.ts` - 顾问登录（验证码方式）
- `src/app/api/rcic/auth/me/route.ts` - 获取当前顾问信息
- `src/app/api/rcic/auth/logout/route.ts` - 顾问登出
- `src/app/api/rcic/cases/route.ts` - 获取案件列表
- `src/app/api/rcic/cases/[id]/route.ts` - 案件详情和审核
- `src/app/api/rcic/messages/route.ts` - 顾问消息
- `src/app/api/rcic/messages/read/route.ts` - 标记消息已读

**认证库：**
- `src/lib/rcic-auth.ts` - RCIC顾问认证工具函数

### 4. 数据库模型更新

**新增模型（在 prisma/schema.prisma）：**
- `MessageAttachment` - 消息附件表
- `RCIC` - 顾问信息表
- `RCICSession` - 顾问会话表
- `RCICVerificationCode` - 顾问验证码表

## 使用说明

### 初始化数据库

```bash
# 安装依赖
npm install

# 推送数据库变更
npm run db:push

# 运行种子数据（创建测试顾问账户）
npm run db:seed
```

### 测试顾问账户

系统预置了两个测试顾问账户：

1. **张顾问**
   - 邮箱：rcic@example.com
   - 执照号：R123456

2. **李移民**
   - 邮箱：consultant@example.com
   - 执照号：R789012

### 登录流程

1. 访问 `/rcic/login`
2. 输入顾问邮箱
3. 点击获取验证码
4. 开发环境下验证码会自动填入（生产环境需发送邮件）
5. 点击登录进入顾问后台

## 页面路由

### 会员端
- `/member` - 会员中心首页
- `/member/messages` - 消息中心
- `/member/applications` - 申请列表
- `/member/applications/[id]` - 申请详情

### 顾问端
- `/rcic/login` - 顾问登录
- `/rcic/dashboard` - 顾问仪表板
- `/rcic/cases` - 案件管理
- `/rcic/cases/[id]` - 案件审核
- `/rcic/messages` - 消息管理

## 技术说明

### 文件上传流程
1. 前端选择文件
2. 调用 `/api/upload` 上传
3. 返回文件URL和元信息
4. 将附件信息附加到消息发送

### 消息系统架构
- 消息按申请ID分组
- 支持用户和顾问双向沟通
- 附件存储在 MessageAttachment 表
- 已读状态独立追踪

### 顾问认证流程
1. 邮箱验证码登录（无密码）
2. Session存储在数据库
3. Cookie保存session token
4. 7天有效期自动续期

## 后续开发建议

1. **实时消息推送**
   - 集成 WebSocket 或 Server-Sent Events
   - 实现消息实时通知

2. **视频通话功能**
   - 推荐使用腾讯云TRTC
   - 集成TUICallKit组件

3. **邮件通知**
   - 配置SMTP服务
   - 实现验证码邮件发送
   - 实现消息通知邮件

4. **文件存储优化**
   - 迁移到云存储（如阿里云OSS、腾讯云COS）
   - 实现文件CDN加速
