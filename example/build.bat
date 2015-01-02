@echo off
cd %~dp0
node ..\node_modules\webpack\bin\webpack.js --config webpack.config.js --progress --colors
node ..\node_modules\http-server\bin\http-server -p 3030
