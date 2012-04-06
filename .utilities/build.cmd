@echo off
set ourjs=..\our.js
cd ..\src
echo /*!>%ourjs%
echo. * OurJS>>%ourjs%
echo. * Released under the MIT License.>>%ourjs%
echo. * Version: %date%>>%ourjs%
echo. */>>%ourjs%
copy/y/b %ourjs% + lang.js + browser.js + dom.js + component.js + animation.js + request.js + modularization.js + execute.js + plugins\json2.js + plugins\sizzle.js + plugins\DD_belatedPNG.js %ourjs%
pause
