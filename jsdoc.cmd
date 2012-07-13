@echo off
set jsdoc_path=D:\ProgramFiles\JSDocToolkit
java -jar %jsdoc_path%\jsrun.jar %jsdoc_path%\app\run.js src -s -n -r=5 -d=scripts -t=scripts
pause
