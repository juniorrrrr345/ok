@echo off
REM ====================================
REM IDFFULL Boutique - Script de Setup Windows
REM ====================================

echo =====================================
echo   IDFFULL Boutique - Setup Windows
echo =====================================
echo.

REM Verifier Node.js
echo Verification de Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe.
    echo Veuillez installer Node.js 18+ depuis https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js detecte
echo.

REM Installation des dependances
echo Installation des dependances...
call npm install
echo [OK] Dependances installees
echo.

REM Creer .env.local si necessaire
if not exist .env.local (
    echo Creation du fichier .env.local...
    copy .env.example .env.local >nul
    echo [OK] Fichier .env.local cree
    echo.
    echo IMPORTANT: Configurez votre fichier .env.local avec:
    echo   - MongoDB URI
    echo   - Cloudinary credentials
    echo   - Admin username/password
    echo.
) else (
    echo [OK] Fichier .env.local existe deja
    echo.
)

REM Creer les dossiers
echo Creation des dossiers...
if not exist "public\uploads" mkdir "public\uploads"
if not exist "src\temp" mkdir "src\temp"
echo [OK] Dossiers crees
echo.

echo =====================================
echo   Setup termine!
echo =====================================
echo.
echo Prochaines etapes:
echo 1. Configurez votre fichier .env.local
echo 2. Lancez: npm run dev
echo 3. Ouvrez: http://localhost:3000
echo 4. Admin: http://localhost:3000/admin
echo.
echo Documentation: DUPLICATION_GUIDE_COMPLETE.md
echo Fonctionnalites: FEATURES_ADDED.md
echo.
pause