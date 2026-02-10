开发重要文件备份
================
备份时间：2026-02-06 21:27
用途：保存当前开发阶段的核心代码与配置，便于恢复或对比。

包含内容：
- src/          源码（App、API、组件、lib、types）
- prisma/       数据库 schema（TiDB/MySQL）
- docs/         项目文档
- scripts/      数据库与运维脚本（含 clear-cases-only.js）
- public/       静态资源
- tests/        测试
- .cursor/rules 项目规则（如有）
- package.json, pnpm-lock.yaml, next.config.ts, tsconfig.json
- eslint.config.mjs, postcss.config.mjs
- .env.example  （环境变量示例，不含密码）
- .gitignore
- README*.md, DEPLOYMENT*.md

不包含：node_modules、.next、.env（含密钥）、uploads 大文件、其他备份包。

恢复：将本目录内容覆盖回项目根目录对应位置，然后执行 pnpm install 与 prisma generate。
