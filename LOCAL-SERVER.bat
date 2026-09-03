@echo off
setlocal
title Claw Grab - Local Server
cd /d "%~dp0claw-grab-random-name-picker\dist"
echo ========================================
echo  Claw Grab Random Name Picker
echo  Serving on http://localhost:8080
echo ========================================
echo.
python -m http.server 8080 2>nul && goto :done
py -m http.server 8080 2>nul && goto :done
npx serve -l 8080 -s . && goto :done
node -e "require('http').createServer((r,s)=>{require('fs').readFile('.'+r.url.split('?')[0].replace(/\/$/,'/index.html'),(e,d)=>{s.writeHead(e?404:200,{'Content-Type':({'html':'text/html','js':'application/javascript','css':'text/css','png':'image/png','jpg':'image/jpeg','svg':'image/svg+xml'}[r.url.split('.').pop()]||'application/octet-stream')});s.end(e?'Not found':d)})}).listen(8080,()=>console.log('http://localhost:8080'));process.stdin.resume()" && goto :done
echo [ERROR] Could not start server. Install Python from https://www.python.org/
pause
exit /b 1
:done
echo.
echo Press Ctrl+C to stop the server.
pause
