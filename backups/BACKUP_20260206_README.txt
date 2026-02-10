加移网站备份说明 - 2026-02-06
================================

备份文件：jiayi-website-backup-20260206.zip（约 1.2 MB）

包含内容：
- src/          前端与 API 源码
- public/        静态资源（含 logo）
- prisma/       数据库 schema（无 .db 数据文件）
- database/     数据库 schema 副本
- scripts/      脚本
- docs/         文档
- tests/        测试
- package.json, pnpm-lock.yaml, next.config.ts, tsconfig.json 等配置
- .env.example  环境变量示例（不含敏感 .env）
- README、DEPLOYMENT 等说明

不包含：node_modules、.next、.env、本地数据库 dev.db（需在新环境重新 pnpm install 与配置 .env）

上传到 Google Drive：
1. 本备份 zip 已复制到桌面：C:\Users\User\Desktop\jiayi-website-backup-20260206.zip
2. 若已安装 Google Drive 桌面版，可将该 zip 拖入 Google Drive 文件夹
3. 或打开 https://drive.google.com 登录后，点击「新建」->「文件上传」，选择该 zip

恢复：在任意电脑解压后执行 pnpm install，配置 .env，即可继续开发。
