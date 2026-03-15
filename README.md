# HotSpot Manager - اپ موبایل

اپلیکیشن موبایل برای سیستم مدیریت فروش اینترنت HotSpot Manager.

## 📱 ویژگی‌ها
- داشبورد با آمار فروش
- ثبت و مدیریت فروش
- تخصیص GB به فروشندگان (مدیر)
- مدیریت پرداخت‌ها (مدیر)
- گزارش‌های کامل (مدیر)
- پروفایل کاربری
- پشتیبانی از فارسی و RTL

## 🔗 سرور
اتصال به: **https://hotspot-manager.pages.dev**

---

## 🚀 ساخت APK

### روش ۱: EAS Build (توصیه‌شده - رایگان)

```bash
# ۱. نصب EAS CLI
npm install -g eas-cli

# ۲. ورود به اکانت Expo (رایگان)
eas login

# ۳. ساخت APK
eas build -p android --profile preview

# ✅ بعد از چند دقیقه لینک دانلود APK می‌دهد
```

**ثبت‌نام Expo:** https://expo.dev/signup (رایگان)

---

### روش ۲: Build محلی (نیاز به Android Studio)

```bash
# پیش‌نیازها:
# - Java 17
# - Android SDK

npm install
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug

# APK در: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📦 نصب APK

بعد از دریافت APK:
1. فایل را به گوشی Android منتقل کنید
2. در گوشی: **تنظیمات → امنیت → نصب از منابع ناشناس** را فعال کنید
3. فایل APK را باز کرده و نصب کنید

## 🔑 ورود به سیستم

از اطلاعات کاربری که مدیر شرکت برایتان ساخته استفاده کنید.

---

## 🛠️ توسعه محلی

```bash
npm install
npx expo start
# یا
npx expo start --tunnel
```

## 📋 فناوری‌ها
- React Native + Expo
- TypeScript
- React Navigation
- expo-secure-store
