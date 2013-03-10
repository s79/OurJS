@echo off
set debug=..\debug.js
set our=..\our.js
cd src
echo /*!>%debug%
echo. * OurJS>>%debug%
echo. *  Released under the MIT License.>>%debug%
echo. *  Version: %date:~0,4%%date:~5,2%%date:~8,2%>>%debug%
echo. */>>%debug%
copy/y/b %debug% + lang.js + browser.js + dom.js + event_target.js + animation.js + request.js + widget.js + integrated\json2.js + integrated\sizzle.js %debug%
set yuicompressor_path=D:\SkyDrive\ProgramFiles\JSFileCompressor\yuicompressor-2.4.7\build
java -jar %yuicompressor_path%\yuicompressor-2.4.7.jar %debug% -o %our% --charset UTF-8
pause
