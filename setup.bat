@echo off
echo.
echo Community Tool Support System - Setup Wizard
echo =============================================
echo.
echo Please provide your MySQL credentials:
echo.

setlocal enabledelayedexpansion

set /p DB_USER="Enter MySQL username (default: root): " || set "DB_USER=root"
set /p DB_PASSWORD="Enter MySQL password (default: blank): "
set /p DB_HOST="Enter MySQL host (default: localhost): " || set "DB_HOST=localhost"

if "!DB_PASSWORD!"=="" (
    set "DB_PASSWORD_LINE=DB_PASSWORD="
) else (
    set "DB_PASSWORD_LINE=DB_PASSWORD=!DB_PASSWORD!"
)

(
    echo DB_HOST=!DB_HOST!
    echo DB_USER=!DB_USER!
    echo !DB_PASSWORD_LINE!
    echo DB_NAME=community_tools
    echo PORT=3000
) > .env

echo.
echo ✓ .env file created with your settings
echo.
echo Now running database setup...
echo.

node setup.js

if %errorlevel% equ 0 (
    echo.
    echo ✓ Setup complete! Run 'npm start' to launch the server
) else (
    echo.
    echo ✗ Setup failed. Check your MySQL credentials and try again.
)

pause
