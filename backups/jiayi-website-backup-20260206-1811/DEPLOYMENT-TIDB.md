# TiDB Cloud 部署指南

本文档说明如何将项目部署到 Vercel 并连接 TiDB Cloud 数据库。

## 前置条件

✅ 已注册 TiDB Cloud 账号并创建集群  
✅ 已获取数据库连接信息  
✅ 已在 Vercel 配置 DATABASE_URL 环境变量  

## 部署步骤

### 1. 更新项目代码

将此代码包解压并替换您的 GitHub 仓库文件。主要变更：

- ✅ Prisma schema 已从 SQLite 改为 MySQL
- ✅ 添加了数据库索引优化查询性能
- ✅ 文本字段使用 `@db.Text` 和 `@db.LongText` 存储大内容
- ✅ 添加了自动初始化 API

### 2. 推送代码到 GitHub

```bash
git add .
git commit -m "配置 TiDB Cloud 数据库"
git push origin main
```

### 3. Vercel 自动部署

推送后，Vercel 会自动检测到更新并开始部署。

### 4. 初始化数据库

部署完成后，访问以下 URL 初始化数据库表结构和测试数据：

```
https://your-domain.vercel.app/api/init
```

成功后会返回：
```json
{
  "success": true,
  "message": "数据库初始化完成",
  "stats": {
    "users": 0,
    "rcics": 2,
    "applications": 0
  }
}
```

### 5. 测试登录

**用户登录：** `https://your-domain.vercel.app/auth/login`  
使用任意邮箱注册/登录

**顾问登录：** `https://your-domain.vercel.app/rcic/login`  
使用测试账号：
- `rcic@example.com`（张顾问）
- `consultant@example.com`（李移民）

## 数据库连接配置

### DATABASE_URL 格式

```
mysql://用户名:密码@主机:端口/数据库名?sslaccept=strict
```

### 您的配置（示例）

```
mysql://33ZSMvez7cRXQzx.root:YOUR_PASSWORD@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/immigration_assistant?sslaccept=strict
```

**重要：** 请将 `YOUR_PASSWORD` 替换为您在 TiDB Cloud 创建的实际密码。

## 常见问题

### Q1: 部署后提示数据库连接失败

**解决方案：**
1. 检查 Vercel 环境变量中的 `DATABASE_URL` 是否正确
2. 确认密码中的特殊字符是否需要 URL 编码
3. 确认 TiDB 集群状态为 Active

### Q2: 访问 /api/init 返回错误

**解决方案：**
1. 检查数据库是否已创建（`immigration_assistant`）
2. 查看 Vercel 部署日志中的详细错误信息
3. 确认 TiDB 集群允许外部连接

### Q3: 如何查看数据库内容

**方法一：TiDB Cloud SQL Editor**
1. 登录 TiDB Cloud 控制台
2. 点击 "SQL Editor"
3. 执行查询：`SELECT * FROM User;`

**方法二：使用 Prisma Studio（本地）**
```bash
npx prisma studio
```

## 数据库维护

### 查看所有表

```sql
SHOW TABLES;
```

### 查看表结构

```sql
DESCRIBE User;
DESCRIBE Application;
DESCRIBE Message;
```

### 清空测试数据（谨慎使用）

```sql
-- 清空所有表数据（保留表结构）
TRUNCATE TABLE MessageAttachment;
TRUNCATE TABLE Message;
TRUNCATE TABLE Document;
TRUNCATE TABLE StatusHistory;
TRUNCATE TABLE Application;
TRUNCATE TABLE Notification;
TRUNCATE TABLE Session;
TRUNCATE TABLE VerificationCode;
TRUNCATE TABLE SavedInfo;
TRUNCATE TABLE UserProfile;
TRUNCATE TABLE User;
TRUNCATE TABLE RCICSession;
TRUNCATE TABLE RCICVerificationCode;
TRUNCATE TABLE RCIC;
```

## 性能优化建议

1. **启用连接池**（Prisma 默认已启用）
2. **使用索引**（schema 中已添加常用字段索引）
3. **定期清理过期数据**：
   ```sql
   -- 清理过期验证码
   DELETE FROM VerificationCode WHERE expiresAt < NOW();
   DELETE FROM RCICVerificationCode WHERE expiresAt < NOW();
   
   -- 清理过期会话
   DELETE FROM Session WHERE expiresAt < NOW();
   DELETE FROM RCICSession WHERE expiresAt < NOW();
   ```

## 备份建议

### 自动备份（TiDB Cloud）

TiDB Cloud 免费版提供自动备份功能，保留 7 天。

### 手动导出

```bash
# 使用 mysqldump 导出
mysqldump -h gateway01.us-east-1.prod.aws.tidbcloud.com \
  -P 4000 \
  -u 33ZSMvez7cRXQzx.root \
  -p \
  immigration_assistant > backup.sql
```

## 迁移到国内数据库

未来迁移到国内数据库（如阿里云 RDS）步骤：

1. 导出数据：`mysqldump` 或 TiDB Cloud 导出功能
2. 在新数据库创建相同结构：`npx prisma db push`
3. 导入数据：`mysql < backup.sql`
4. 更新 Vercel 环境变量 `DATABASE_URL`
5. 重新部署

## 技术支持

- TiDB Cloud 文档：https://docs.pingcap.com/tidbcloud
- Prisma 文档：https://www.prisma.io/docs
- Vercel 文档：https://vercel.com/docs
