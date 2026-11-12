@echo off
cd /d "%~dp0app"
start "" http://127.0.0.1:5173/
python -m http.server 5173 --bind 127.0.0.1
