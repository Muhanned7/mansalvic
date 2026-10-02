@echo off
title MongoDB Server (D: Drive)
echo ====================================================
echo Starting MongoDB Server on External Drive D:\
echo Config: D:\Program Files\MongoDB\Server\8.3\bin\mongod.cfg
echo Data:   D:\Program Files\MongoDB\Server\8.3\data
echo Port:   27017
echo ====================================================
"D:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --config "D:\Program Files\MongoDB\Server\8.3\bin\mongod.cfg"
pause
