#!/bin/bash

# 数据库初始化脚本
# 使用方法: ./scripts/init-db.sh

echo "🚀 初始化数据库..."

# 检查 .env 文件
if [ ! -f .env ]; then
  echo "📝 创建 .env 文件..."
  cp .env.example .env
  echo "✅ .env 文件已创建，请根据需要修改配置"
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 生成 Prisma 客户端
echo "🔧 生成 Prisma 客户端..."
npx prisma generate

# 创建数据库并应用迁移
echo "🗄️ 创建数据库..."
npx prisma db push

echo "✅ 数据库初始化完成！"
echo ""
echo "现在可以运行以下命令启动开发服务器："
echo "  npm run dev"
echo ""
echo "访问 http://localhost:3000 查看网站"
