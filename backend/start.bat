@echo off
echo ========================================
echo Volitus 后端服务启动脚本
echo ========================================
echo.

cd /d %~dp0

echo [1/3] 检查虚拟环境...
if not exist "venv\Scripts\activate.bat" (
    echo 虚拟环境不存在，正在创建...
    python -m venv venv
    echo 虚拟环境创建完成
)

echo [2/3] 激活虚拟环境并安装依赖...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo [3/3] 启动 FastAPI 服务...
echo.
echo 服务地址: http://localhost:8000
echo API 文档: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
