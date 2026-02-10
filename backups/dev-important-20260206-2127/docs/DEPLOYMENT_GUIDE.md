# 🚀 完整认证系统部署和测试指南

## 📋 系统概述

已完成开发的功能：

### ✅ 用户功能
- 用户注册（邮箱+密码）
- 邮箱验证（24小时有效期）
- 密码登录
- 重新发送验证邮件

### ✅ 顾问功能
- 顾问注册（A/B/C三个等级）
- 邮箱验证
- 资质审核流程
- 密码登录（审核通过后）

### ✅ 管理功能
- 顾问审核（批准/拒绝/暂停）
- 定期复核（A类顾问6个月）

---

## 📁 文件清单

### 数据库 Schema
- `schema.prisma` - 完整的数据库模型

### API 路由
1. `user-register-route.ts` → `src/app/api/auth/register/route.ts`
2. `rcic-register-route.ts` → `src/app/api/auth/rcic/register/route.ts`
3. `login-route.ts` → `src/app/api/auth/login/route.ts`
4. `verify-email-complete-route.ts` → `src/app/api/auth/verify-email/route.ts`
5. `send-verification-complete-route.ts` → `src/app/api/auth/send-verification/route.ts`
6. `rcic-upload-documents-route.ts` → `src/app/api/auth/rcic/upload-documents/route.ts`
7. `admin-approve-rcic-route.ts` → `src/app/api/admin/rcic/approve/route.ts`

### 前端页面
1. `user-register-page.tsx` → `src/app/auth/register/page.tsx`
2. `rcic-register-page.tsx` → `src/app/auth/rcic/register/page.tsx`
3. `login-page.tsx` → `src/app/auth/login/page.tsx`
4. `verify-page.tsx` → `src/app/auth/verify/page.tsx`
5. `resend-verification-page.tsx` → `src/app/auth/resend-verification/page.tsx`

### 邮件服务
- `email.ts` → `src/lib/email.ts`（已在之前的集成包中）

---

## 🔧 本地测试步骤

### 第一步：安装依赖

```bash
cd C:\Users\User\jiayi-ai-assistant

# 安装新增的依赖
pnpm add bcryptjs jsonwebtoken
pnpm add -D @types/bcryptjs @types/jsonwebtoken
```

### 第二步：更新环境变量

编辑 `.env.local` 文件，添加：

```env
# 数据库连接
DATABASE_URL="your-database-url"

# JWT密钥（生产环境必须更换）
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Resend邮件服务
RESEND_API_KEY=re_EofwxaXN_JmPh8P7zLx3nK5RbmgwsvXiF
EMAIL_FROM=noreply@jiayi.co
EMAIL_FROM_NAME=嘉怡移民助手
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 第三步：更新数据库 Schema

```bash
# 复制新的 schema.prisma 文件
# 然后运行：
npx prisma generate
npx prisma db push
```

### 第四步：复制所有代码文件

按照上面的文件清单，将所有文件复制到对应位置。

### 第五步：启动开发服务器

```bash
pnpm dev
```

服务器应该在 `http://localhost:3000` 启动。

---

## 🧪 测试流程

### 测试 1：用户注册和登录

1. **访问注册页面**
   ```
   http://localhost:3000/auth/register
   ```

2. **填写注册信息**
   - 姓名：测试用户
   - 邮箱：test@example.com
   - 密码：password123
   - 确认密码：password123

3. **提交注册**
   - 应该看到"注册成功"消息
   - 检查邮箱是否收到验证邮件

4. **点击验证链接**
   - 邮件中的链接格式：`http://localhost:3000/auth/verify?token=xxxxx`
   - 点击后应该看到"验证成功"

5. **登录测试**
   - 访问：`http://localhost:3000/auth/login`
   - 选择"普通用户"
   - 输入邮箱和密码
   - 应该成功登录并跳转到用户仪表板

### 测试 2：A类顾问注册和审核

1. **访问顾问注册页面**
   ```
   http://localhost:3000/auth/rcic/register
   ```

2. **填写基本信息（第1步）**
   - 姓名：张顾问
   - 邮箱：rcic@example.com
   - 手机：+1234567890
   - 顾问类型：A类 - 持牌顾问/律师
   - 密码：password123
   - 点击"下一步"

3. **填写资质信息（第2步）**
   - RCIC执照编号：R123456
   - 从业年限：5
   - 所在国家：Canada
   - 所在城市：Toronto
   - 执业机构：ABC Immigration
   - 个人简介：专业持牌移民顾问...
   - 点击"提交注册"

4. **验证邮箱**
   - 检查邮箱收到验证邮件
   - 点击验证链接
   - 应该看到"邮箱验证成功！您的账户正在审核中"

5. **尝试登录（预期失败）**
   - 访问登录页面
   - 选择"移民顾问"
   - 输入邮箱和密码
   - 应该看到"您的账户正在审核中，请耐心等待"

6. **管理员审核（使用API）**
   ```bash
   curl -X POST http://localhost:3000/api/admin/rcic/approve \
     -H "Content-Type: application/json" \
     -d '{
       "rcicId": "顾问的ID",
       "action": "approve",
       "notes": "资质审核通过",
       "adminId": "admin-001"
     }'
   ```

7. **再次登录**
   - 审核通过后应该可以成功登录
   - 跳转到顾问仪表板

### 测试 3：B类顾问注册

1. **注册B类顾问**
   - 选择"B类 - 留学/签证顾问"
   - 不需要填写执照编号
   - 其他流程同A类

2. **验证限制**
   - B类顾问不能提供移民服务
   - 只能提供留学/访签咨询

### 测试 4：C类文案人员注册

1. **注册C类人员**
   - 选择"C类 - 文案/辅助人员"
   - 最简化的注册流程

2. **验证限制**
   - C类不能独立接单
   - 只能作为协作人员

---

## 🔍 数据库验证

### 检查用户表

```sql
SELECT id, email, name, emailVerified, createdAt 
FROM users 
ORDER BY createdAt DESC 
LIMIT 5;
```

### 检查顾问表

```sql
SELECT id, email, name, consultantType, approvalStatus, emailVerified 
FROM rcics 
ORDER BY createdAt DESC 
LIMIT 5;
```

### 检查验证令牌表

```sql
SELECT email, type, expiresAt, createdAt 
FROM verification_tokens 
WHERE expiresAt > NOW() 
ORDER BY createdAt DESC;
```

---

## ⚠️ 常见问题排查

### 问题 1：邮件没收到

**检查清单：**
- [ ] RESEND_API_KEY 是否正确
- [ ] EMAIL_FROM 是否配置（使用 noreply@jiayi.co）
- [ ] 检查垃圾邮件文件夹
- [ ] 在 Resend Dashboard 查看发送日志

### 问题 2：数据库连接失败

**解决方案：**
```bash
# 检查 DATABASE_URL
echo $DATABASE_URL

# 测试数据库连接
npx prisma db push
```

### 问题 3：JWT错误

**解决方案：**
- 确保 JWT_SECRET 已配置
- 生产环境必须使用强密钥

### 问题 4：文件上传失败

**解决方案：**
```bash
# 创建上传目录
mkdir -p public/uploads/rcic
chmod 755 public/uploads
```

### 问题 5：TypeScript类型错误

**解决方案：**
```bash
# 重新生成 Prisma Client
npx prisma generate

# 重启开发服务器
pnpm dev
```

---

## 📊 测试检查清单

### 用户流程
- [ ] 用户可以注册
- [ ] 收到验证邮件
- [ ] 邮箱验证成功
- [ ] 收到欢迎邮件
- [ ] 可以登录
- [ ] 未验证邮箱无法登录
- [ ] 可以重新发送验证邮件

### 顾问流程
- [ ] A类顾问可以注册
- [ ] B类顾问可以注册
- [ ] C类顾问可以注册
- [ ] A类必须提供执照编号
- [ ] 收到验证邮件
- [ ] 邮箱验证成功
- [ ] 审核前无法登录
- [ ] 管理员可以审核
- [ ] 审核通过后可以登录
- [ ] 审核拒绝无法登录

### 安全性
- [ ] 密码已加密存储
- [ ] JWT token 正常工作
- [ ] 验证令牌24小时过期
- [ ] 过期令牌被自动删除
- [ ] 邮箱格式验证
- [ ] 密码强度验证（至少8位）

---

## 🚢 部署到生产环境

### 第一步：环境变量配置

在 Vercel Dashboard 添加所有环境变量：

```
DATABASE_URL=your-production-database-url
JWT_SECRET=your-super-strong-production-secret
RESEND_API_KEY=re_EofwxaXN_JmPh8P7zLx3nK5RbmgwsvXiF
EMAIL_FROM=noreply@jiayi.co
EMAIL_FROM_NAME=嘉怡移民助手
NEXT_PUBLIC_APP_URL=https://jiayi-ai-assistant.vercel.app
```

### 第二步：数据库迁移

```bash
# 在生产数据库运行
npx prisma db push
```

### 第三步：提交代码

```bash
git add .
git commit -m "feat: complete authentication system with email verification and consultant approval"
git push
```

### 第四步：验证部署

1. 等待 Vercel 部署完成
2. 访问生产环境测试注册流程
3. 检查邮件发送是否正常
4. 验证所有功能

---

## 📝 后续优化建议

### 短期（1-2周）
1. 添加密码重置功能
2. 添加手机号验证
3. 完善错误提示信息
4. 添加登录日志记录

### 中期（1-2个月）
1. 实现顾问文档上传功能
2. 添加管理员审核界面
3. 实现顾问评分系统
4. 添加服务范围限制

### 长期（3-6个月）
1. 实现两步验证（2FA）
2. 添加社交登录（Google, WeChat）
3. 实现单点登录（SSO）
4. 完善权限管理系统

---

## 🎯 成功标准

本地测试通过的标准：

✅ 所有API端点返回正确的HTTP状态码  
✅ 用户可以完整走完注册→验证→登录流程  
✅ 顾问可以完整走完注册→验证→审核→登录流程  
✅ 邮件正常发送和接收  
✅ 数据库正确存储所有信息  
✅ 没有控制台错误  
✅ 没有TypeScript类型错误  
✅ 没有Prisma查询错误

---

## 📞 需要帮助？

如果在测试过程中遇到问题：

1. **查看控制台日志**：`pnpm dev` 的输出
2. **查看浏览器控制台**：F12 开发者工具
3. **查看数据库**：使用 Prisma Studio (`npx prisma studio`)
4. **查看邮件日志**：Resend Dashboard

---

**准备好了吗？开始本地测试！** 🚀

测试通过后再部署到生产环境，确保系统稳定运行。
