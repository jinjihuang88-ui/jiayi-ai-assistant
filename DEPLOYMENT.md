# 部署指南

本文档说明如何正确部署加移AI助理系统。

## 部署前准备

### 1. 环境变量配置

在部署平台（如 Vercel、Railway、Render 等）中配置以下环境变量：

```
DATABASE_URL="file:./dev.db"
NODE_ENV="production"
```

如果使用云数据库（推荐用于生产环境），请配置相应的数据库连接字符串：

**PostgreSQL 示例：**
```
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

**MySQL 示例：**
```
DATABASE_URL="mysql://user:password@host:3306/database"
```

### 2. 数据库迁移

部署后需要初始化数据库。有两种方式：

**方式一：自动初始化（推荐）**

系统已配置自动初始化功能。首次访问登录页面时，会自动调用 `/api/init` 接口创建必要的数据库表和测试数据。

**方式二：手动初始化**

如果自动初始化失败，可以手动访问以下URL：
```
https://your-domain.com/api/init
```

成功后会返回：
```json
{
  "success": true,
  "message": "数据库初始化完成",
  "stats": { "users": 0, "rcics": 2, "applications": 0 },
  "rcicResults": [...]
}
```

## 常见部署问题

### 问题1：发送验证码失败

**原因：** 数据库未正确初始化或连接失败

**解决方案：**
1. 检查 `DATABASE_URL` 环境变量是否正确配置
2. 访问 `/api/init` 手动初始化数据库
3. 检查部署平台的日志查看详细错误信息

### 问题2：RCIC顾问登录失败

**原因：** 测试顾问账户未创建

**解决方案：**
1. 访问 `/api/init` 初始化数据库
2. 使用以下测试账户登录：
   - `rcic@example.com`（张顾问）
   - `consultant@example.com`（李移民）

### 问题3：SQLite 在 Serverless 环境不工作

**原因：** Serverless 环境（如 Vercel）不支持 SQLite 文件持久化

**解决方案：**
1. 使用云数据库服务（推荐）：
   - [PlanetScale](https://planetscale.com/) - MySQL 兼容
   - [Supabase](https://supabase.com/) - PostgreSQL
   - [Railway](https://railway.app/) - PostgreSQL/MySQL
   - [Neon](https://neon.tech/) - PostgreSQL

2. 修改 `prisma/schema.prisma` 中的 provider：
```prisma
datasource db {
  provider = "postgresql"  // 或 "mysql"
  url      = env("DATABASE_URL")
}
```

3. 重新生成 Prisma Client：
```bash
npx prisma generate
npx prisma db push
```

## Vercel 部署步骤

1. 连接 GitHub 仓库
2. 配置环境变量：
   - `DATABASE_URL` - 数据库连接字符串
3. 部署
4. 访问 `/api/init` 初始化数据库

## Railway 部署步骤

1. 创建新项目
2. 添加 PostgreSQL 数据库服务
3. 连接 GitHub 仓库
4. Railway 会自动配置 `DATABASE_URL`
5. 部署完成后访问 `/api/init`

## 生产环境建议

### 邮件服务配置

当前系统在页面上直接显示验证码（临时方案）。生产环境应配置邮件服务：

1. 选择邮件服务提供商：
   - SendGrid
   - Mailgun
   - AWS SES
   - 阿里云邮件推送

2. 添加环境变量：
```
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-username"
SMTP_PASS="your-password"
MAIL_FROM="noreply@yourdomain.com"
```

3. 修改 `src/app/api/auth/send-code/route.ts` 中的邮件发送逻辑

### 文件存储配置

当前文件存储在本地 `public/uploads/` 目录。生产环境建议使用云存储：

1. 选择云存储服务：
   - 阿里云 OSS
   - 腾讯云 COS
   - AWS S3

2. 修改 `src/app/api/upload/route.ts` 使用云存储 SDK

## 测试账户

系统预置了两个测试顾问账户：

| 邮箱 | 姓名 | 执照号 |
|------|------|--------|
| rcic@example.com | 张顾问 | R123456 |
| consultant@example.com | 李移民 | R789012 |

普通用户可以使用任意邮箱注册登录。
