@echo off
cd src
set ourjs=..\our.js
set ourjsmin=..\our.min.js
set yuicompressor_path=D:\ProgramFiles\JSFileCompressor\yuicompressor-2.4.7\build
echo /*!>%ourjs%
echo. * OurJS>>%ourjs%
echo. *  Released under the MIT License.>>%ourjs%
echo. *  Version: %date%>>%ourjs%
echo. */>>%ourjs%
copy/y/b %ourjs% + lang.js + browser.js + dom.js + component.js + animation.js + request.js + modularization.js + execute.js + plugins\json2.js + plugins\sizzle.js + plugins\DD_belatedPNG.js %ourjs%
java -jar %yuicompressor_path%\yuicompressor-2.4.7.jar %ourjs% -o %ourjsmin% --charset UTF-8
pause
