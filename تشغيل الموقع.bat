@echo off
echo.
echo ========================================
echo    🎓 الخدمات الجامعية - Academic Services
echo ========================================
echo.
echo 🚀 جاري تشغيل السيرفر...
echo.

cd /d "%~dp0"
start "" cmd /k "node server.js"

timeout /t 2 /nobreak > nul

echo ✅ تم تشغيل السيرفر!
echo.
echo 🌐 فتح الموقع في المتصفح...
start "" "http://localhost:3000"

echo.
echo ========================================
echo  الموقع شغال على: http://localhost:3000
echo  لوحة التحكم: http://localhost:3000/admin-panel.html
echo  اسم المستخدم: admin
echo  كلمة المرور: admin123
echo ========================================
echo.
