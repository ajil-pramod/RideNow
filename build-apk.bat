@echo off
echo Building RideNow APK...
echo.

echo Step 1: Building Next.js app...
call npm run build
if %errorlevel% neq 0 (
    echo Failed to build Next.js app
    pause
    exit /b 1
)

echo Step 2: Syncing with Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo Failed to sync with Capacitor
    pause
    exit /b 1
)

echo Step 3: Building Android APK...
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo Failed to build APK - Check if Java 17 is installed
    echo Current Java version:
    java -version
    echo.
    echo Please install Java 17 and set JAVA_HOME
    pause
    exit /b 1
)

echo.
echo ✅ APK built successfully!
echo 📱 APK location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can now install this APK on your Android device
pause