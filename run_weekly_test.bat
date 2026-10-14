@echo off
chcp 65001 >nul
title English Breakfast - Еженедельное тестирование системы
echo.
echo =======================================================================
echo   Запуск еженедельной автоматической диагностики English Breakfast
echo =======================================================================
echo.

cd /d "%~dp0"

node scripts\weekly_test.mjs --save-report

echo.
if "%1"=="--no-pause" goto end
pause
:end
