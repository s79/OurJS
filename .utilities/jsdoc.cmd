@echo off
set jsdoc_path=jsdoc-toolkit
java -jar %jsdoc_path%\jsrun.jar %jsdoc_path%\app\run.js ..\src\ -s -n -r=5 -d=..\docs -t=..\docs\scripts
pause
