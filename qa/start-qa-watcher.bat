@echo off
title Mansalvic QA watcher
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0watch-communications.ps1"
pause
