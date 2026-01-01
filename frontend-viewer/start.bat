@echo off
echo ========================================
echo Volitus 观众端启动脚本
echo ========================================
echo.

cd /d %~dp0

echo [1/2] 检查依赖...
if not exist "node_modules" (
    echo 依赖未安装，正在安装...
    npm install
)

echo [2/2] 启动开发服务器...
echo.
echo 访问地址: http://localhost:5173
echo.
npm run dev
