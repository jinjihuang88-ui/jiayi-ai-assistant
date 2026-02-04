# 嘉怡移民助手 - 备份文档

## 备份时间
2026年2月4日 15:53 (UTC)

## 备份内容

### 1. 完整源代码包
**文件**: `jiayi-backup-20260204_155324.tar.gz` (1.9MB)
**包含内容**:
- `/src` - 完整源代码
- `/prisma` - 数据库Schema和迁移文件
- `/public` - 静态资源文件
- `.env` - 环境变量配置
- `package.json` - 项目依赖配置
- `tsconfig.json` - TypeScript配置
- `next.config.ts` - Next.js配置

### 2. 数据库备份
**文件**: `database_backup_2026-02-04T20-52-51-692Z.json` (551KB)
**数据统计**:
- 用户 (Users): 3条记录
- 顾问 (RCICs): 1条记录
- 案件 (Cases): 31条记录
- 消息 (Messages): 3条记录

## 恢复步骤

### 恢复源代码
```bash
# 1. 解压备份包
tar -xzf jiayi-backup-20260204_155324.tar.gz

# 2. 进入项目目录
cd jiayi-ai-assistant

# 3. 安装依赖
pnpm install

# 4. 配置环境变量（检查.env文件）
# 确保DATABASE_URL等关键变量正确

# 5. 同步数据库结构
npx prisma generate
npx prisma db push

# 6. 启动项目
pnpm dev
```

### 恢复数据库
```bash
# 使用Node.js脚本恢复数据
node restore_database.js database_backup_2026-02-04T20-52-51-692Z.json
```

## 重要配置信息

### 数据库连接
- 提供商: Prisma Postgres
- 连接字符串: 已保存在.env文件中

### Vercel部署
- 项目名: jiayi-ai-assistant
- 生产域名: www.jiayi.co
- 备用域名: jiayi-ai-assistant.vercel.app

### GitHub仓库
- 用户: jinjihuang88-ui
- 仓库: jiayi-ai-assistant
- 分支: main

## 注意事项
1. 恢复前请确保新环境已安装Node.js 24.x和pnpm
2. 数据库恢复会覆盖现有数据，请谨慎操作
3. 环境变量中包含敏感信息，请妥善保管
4. 定期更新备份，建议每周备份一次

## 联系信息
如有问题，请联系系统管理员
