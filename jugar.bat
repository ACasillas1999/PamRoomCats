@echo off
title PamRoomCats - Juego de la Tesis y los Michis
echo ======================================================
echo    🐱 PamRoomCats - Iniciando el juego sin XAMPP...
echo ======================================================
echo.

:: Abrir el navegador en el puerto 8080
start http://localhost:8080/

:: Usar el servidor integrado de Node, Python o PHP (el que este disponible)
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo Iniciando servidor ligero con Node.js...
    node -e "const http=require('http'),fs=require('fs'),path=require('path');http.createServer((req,res)=>{let p='.'+decodeURI(req.url.split('?')[0]);if(p==='./')p='./index.html';const ext=path.extname(p);const m={'html':'text/html','js':'application/javascript','css':'text/css','json':'application/json','sqlite':'application/octet-stream','wasm':'application/wasm'};fs.readFile(p,(e,d)=>{if(e){res.writeHead(404);res.end('404');}else{res.writeHead(200,{'Content-Type':m[ext.slice(1)]||'text/plain'});res.end(d);}});}).listen(8080,()=>console.log('Servidor activo en http://localhost:8080/'));"
    goto end
)

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo Iniciando servidor ligero con Python...
    python -m http.server 8080
    goto end
)

where php >nul 2>nul
if %errorlevel% equ 0 (
    echo Iniciando servidor ligero con PHP CLI...
    php -S localhost:8080
    goto end
)

echo No se detecto un runtime para el servidor local. Abriendo directamente index.html...
start index.html

:end
pause
