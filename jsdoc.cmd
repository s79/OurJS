@echo off
set jsdoc_path=D:\SkyDrive\ProgramFiles\JSDocToolkit
java -jar %jsdoc_path%\jsrun.jar %jsdoc_path%\app\run.js src src\integrated widgets -s -n -d=scripts -t=scripts
pause
