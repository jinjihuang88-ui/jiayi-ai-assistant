# 会员系统使用说明

## 功能概述

本会员系统为移民申请网站提供完整的用户管理功能，包括：

### 核心功能

1. **邮箱验证码登录**
   - 无需密码，使用邮箱验证码快速登录
   - 新用户自动注册
   - 开发模式下验证码会显示在页面上

2. **会员中心**
   - 个人仪表盘，显示申请统计
   - 快速访问各项功能
   - 未读通知提醒

3. **申请记录管理**
   - 查看所有申请记录
   - 按状态筛选（草稿、已提交、审核中、需修改、已通过、已拒绝）
   - 继续编辑草稿或修改申请
   - 删除草稿

4. **申请详情页**
   - 查看申请完整信息
   - 状态历史时间线
   - 顾问反馈查看
   - 表单内容预览

5. **消息沟通系统**
   - 与移民顾问实时沟通
   - 按申请分类消息
   - 消息已读状态

6. **通知中心**
   - 申请状态变更通知
   - 顾问消息通知
   - 系统通知
   - 未读/已读筛选

7. **个人资料管理**
   - 基本信息（姓名、性别、出生日期等）
   - 联系地址
   - 护照信息
   - 通知偏好设置

## 技术架构

- **前端**: Next.js 14 + React 18 + TypeScript + TailwindCSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (开发) / PostgreSQL/MySQL (生产)
- **ORM**: Prisma
- **认证**: 自建邮箱验证码 + JWT Session

## 安装步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：

```env
# SQLite (开发环境，无需额外配置)
DATABASE_URL="file:./dev.db"

# 或 PostgreSQL (生产环境)
# DATABASE_URL="postgresql://user:password@localhost:5432/immigration_db"
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端
npx prisma generate

# 创建数据库表
npx prisma db push
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── send-code/     # 发送验证码
│   │   │   ├── verify-code/   # 验证登录
│   │   │   ├── logout/        # 退出登录
│   │   │   └── me/            # 获取当前用户
│   │   └── member/
│   │       ├── applications/  # 申请管理API
│   │       ├── messages/      # 消息API
│   │       ├── notifications/ # 通知API
│   │       └── profile/       # 个人资料API
│   ├── auth/
│   │   └── login/             # 登录页面
│   └── member/
│       ├── page.tsx           # 会员中心首页
│       ├── applications/      # 申请列表
│       ├── messages/          # 消息页面
│       ├── notifications/     # 通知中心
│       └── profile/           # 个人资料
├── components/
│   └── MemberHeader.tsx       # 会员导航组件
├── lib/
│   ├── prisma.ts              # Prisma客户端
│   └── auth.ts                # 认证工具函数
└── prisma/
    └── schema.prisma          # 数据库模型
```

## 数据库模型

### User (用户)
- 基本信息：邮箱、姓名、电话、头像
- 关联：个人资料、申请、消息、通知、会话

### UserProfile (用户资料)
- 个人信息：姓名、性别、出生日期、国籍
- 联系地址：详细地址、城市、省份、邮编、国家
- 护照信息：护照号、签发国、有效期
- 通知设置：邮件通知、短信通知

### Application (申请)
- 申请类型和状态
- 表单数据（JSON格式）
- RCIC审核信息
- 状态历史、消息、文档

### Message (消息)
- 用户与顾问的沟通记录
- 关联到具体申请
- 已读状态

### Notification (通知)
- 类型：状态变更、消息、提醒、系统
- 已读状态
- 跳转链接

## API 接口

### 认证相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/send-code | 发送验证码 |
| POST | /api/auth/verify-code | 验证码登录 |
| POST | /api/auth/logout | 退出登录 |
| GET | /api/auth/me | 获取当前用户 |

### 会员功能

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/member/applications | 获取申请列表 |
| POST | /api/member/applications | 创建新申请 |
| GET | /api/member/applications/[id] | 获取申请详情 |
| PUT | /api/member/applications/[id] | 更新申请 |
| DELETE | /api/member/applications/[id] | 删除申请 |
| GET | /api/member/messages | 获取消息列表 |
| POST | /api/member/messages | 发送消息 |
| POST | /api/member/messages/read | 标记已读 |
| GET | /api/member/notifications | 获取通知列表 |
| PUT | /api/member/notifications | 标记通知已读 |
| DELETE | /api/member/notifications | 删除通知 |
| GET | /api/member/profile | 获取个人资料 |
| PUT | /api/member/profile | 更新个人资料 |

## 申请状态流程

```
draft (草稿)
  ↓ 用户提交
submitted (已提交)
  ↓ 顾问开始审核
under_review (审核中)
  ↓ 审核结果
  ├── approved (已通过)
  ├── rejected (已拒绝)
  └── needs_revision (需修改)
        ↓ 用户修改后重新提交
      submitted (已提交)
```

## 开发模式说明

在开发模式下（`NODE_ENV=development`）：

1. 验证码会直接显示在登录页面上，方便测试
2. 数据库使用 SQLite，无需额外配置
3. Prisma 查询日志会输出到控制台

## 生产环境部署

1. 修改 `.env` 使用 PostgreSQL 或 MySQL
2. 配置邮件服务发送真实验证码
3. 设置 `NODE_ENV=production`
4. 运行 `npm run build` 构建
5. 运行 `npm run start` 启动

## 后续扩展

- [ ] 邮件服务集成（SendGrid/Resend）
- [ ] 短信验证码
- [ ] 文档上传功能
- [ ] 顾问后台管理系统
- [ ] 申请费用支付
- [ ] 多语言支持
