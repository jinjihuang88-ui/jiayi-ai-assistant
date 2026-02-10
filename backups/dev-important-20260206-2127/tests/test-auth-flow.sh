#!/bin/bash

# 认证流程本地测试脚本
# 使用前请确保已安装所有依赖并配置好环境变量

echo "🚀 开始测试认证流程..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
PASSED=0
FAILED=0

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -e "${YELLOW}测试: $name${NC}"
    
    response=$(curl -s -w "\n%{http_code}" -X $method \
        -H "Content-Type: application/json" \
        -d "$data" \
        "http://localhost:3000$url")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ $http_code -ge 200 ] && [ $http_code -lt 300 ]; then
        echo -e "${GREEN}✓ 通过 (HTTP $http_code)${NC}"
        echo "响应: $body"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ 失败 (HTTP $http_code)${NC}"
        echo "响应: $body"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

echo "=== 1. 用户注册测试 ==="
test_api "用户注册" "POST" "/api/auth/register" '{
  "email": "test_user_'$(date +%s)'@example.com",
  "name": "测试用户",
  "password": "password123",
  "phone": "+1234567890"
}'

echo "=== 2. 顾问注册测试 ==="

echo "--- 2.1 A类持牌顾问注册 ---"
test_api "A类顾问注册" "POST" "/api/auth/rcic/register" '{
  "email": "rcic_a_'$(date +%s)'@example.com",
  "name": "张顾问",
  "password": "password123",
  "phone": "+1234567890",
  "consultantType": "A",
  "licenseNumber": "R123456",
  "yearsOfExperience": 5,
  "country": "Canada",
  "city": "Toronto",
  "organization": "ABC Immigration",
  "bio": "专业持牌移民顾问"
}'

echo "--- 2.2 B类留学顾问注册 ---"
test_api "B类顾问注册" "POST" "/api/auth/rcic/register" '{
  "email": "rcic_b_'$(date +%s)'@example.com",
  "name": "李顾问",
  "password": "password123",
  "phone": "+1234567890",
  "consultantType": "B",
  "yearsOfExperience": 3,
  "country": "Canada",
  "city": "Vancouver",
  "bio": "专注留学签证服务"
}'

echo "--- 2.3 C类文案人员注册 ---"
test_api "C类顾问注册" "POST" "/api/auth/rcic/register" '{
  "email": "rcic_c_'$(date +%s)'@example.com",
  "name": "王文案",
  "password": "password123",
  "consultantType": "C",
  "yearsOfExperience": 2,
  "bio": "专业文案翻译"
}'

echo "=== 3. 登录测试（预期失败 - 邮箱未验证） ==="
test_api "未验证邮箱登录" "POST" "/api/auth/login" '{
  "email": "test_user_123@example.com",
  "password": "password123",
  "userType": "user"
}'

echo "=== 4. 重新发送验证邮件测试 ==="
test_api "重新发送验证邮件" "POST" "/api/auth/send-verification" '{
  "email": "test_user_123@example.com"
}'

echo ""
echo "======================================"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo "======================================"
echo ""
echo "📝 注意事项："
echo "1. 邮箱验证需要手动点击邮件中的链接"
echo "2. 顾问审核需要管理员手动批准"
echo "3. 完整流程测试需要访问前端页面"
echo ""
echo "🌐 前端测试地址："
echo "   用户注册: http://localhost:3000/auth/register"
echo "   顾问注册: http://localhost:3000/auth/rcic/register"
echo "   登录页面: http://localhost:3000/auth/login"
echo "   邮箱验证: http://localhost:3000/auth/verify?token=YOUR_TOKEN"
echo ""
