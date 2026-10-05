# مولّدة — تطبيق الجابي (Molada Collector)

تطبيق React Native (Expo + TypeScript) لجباية اشتراكات المولدات الأهلية في العراق.
يعمل أوفلاين أولاً: الدفعات تُحفظ محلياً ثم تُزامن لاحقاً.

## التشغيل

```bash
cd mobile
npm install
npx expo start
```

- Android / iOS: امسح QR من Expo Go أو شغّل محاكياً.
- Web (معاينة): `npx expo start --web` أو `npm run export:web`.

حساب تجريبي (mock): هاتف `07701234567` · PIN `1234`.

## الشاشات (الجابي)

| الرمز | الشاشة | المسار |
|---|---|---|
| C1 | تسجيل الدخول | `/login` |
| C2 | تحديث اليوم | `/bootstrap` |
| C3 | قائمة الشارع | `/(collector)` |
| C4 | بطاقة المشترك | `/subscriber/[id]` |
| C5 | استلام كاش | `/receive/[id]` |
| C6 | الوصل | `/receipt/[paymentId]` |
| C7 | طابور المزامنة | `/(collector)/queue` |
| C8 | إنهاء اليوم | `/(collector)/eod` |

## البنية

```
src/
  api/       واجهة API + mock / HTTP
  components/
  db/        SQLite (أصلي) + memory/localStorage (ويب)
  screens/
  store/
  theme/     رموز v4 iraqi-bold
  types/
  utils/
app/         expo-router
```

## إعدادات API

في `app.json` → `expo.extra`:

- `useMockApi`: `true` (افتراضي) يستخدم بيانات عربية تجريبية.
- `apiBaseUrl`: عنوان ASP.NET لاحقاً، مثلاً `https://host/api/v1`.

المسارات المتوقعة: `/auth/login` · `/collector/bootstrap` · `/collector/sync` · `/collector/shifts/close`.

## فحص الأنواع

```bash
npx tsc --noEmit
```

## ملاحظات

- RTL مفعّل عبر `I18nManager.forceRTL`.
- الخط: Cairo (`@expo-google-fonts/cairo`).
- الألوان: تيل `#063A46` · كهرمان `#F5A623` (تصميم v4).
- على الويب تُستخدم تخزين محلي بدلاً من SQLite.


## الـ API الحقيقي / Real API

الواجهة `src/api` تدعم وضعين عبر `app.json` → `expo.extra`:

| العلم | المعنى |
|---|---|
| `useMockApi: true` | البيانات التجريبية المحلية (الافتراضي للبناء العام على المنفذ 4310) |
| `useMockApi: false` | عميل HTTP تجاه ASP.NET على `apiBaseUrl` |

```json
"extra": {
  "apiBaseUrl": "http://YOUR_LAN_IP:5080/api/v1",
  "useMockApi": false
}
```

- تسجيل الدخول يعيد JWT + refresh؛ `session.token` = access token.
- المزامنة تستخدم `/collector/sync` (ومكافئها على السيرفر `/device/sync`).
- البناء العام المنشور (Cloudflare / port 4310) يبقى على mock — لا تشير إلى `localhost` من نفق عام.
- حساب تجريبي على الباك: `07701234567` / `1234`.



## معاينة عامة بنفس الأصل (cloudflared → :4310)

السيرفر `tools/preview-server.mjs` يقدّم ملفات `dist/` ويعيد توجيه `/api/*` إلى الباك على `http://127.0.0.1:5080` — نفس الأصل، بدون CORS ونفق واحد.

```bash
# 1) باك ASP.NET على 5080 (من مجلد backend)
export PATH="$HOME/.dotnet:$PATH"
cd /workspace/generator_app/backend
nohup env ASPNETCORE_ENVIRONMENT=Development   dotnet run --project src/Molada.Api --urls http://0.0.0.0:5080   > /tmp/molada-api.log 2>&1 &

# 2) بناء الويب على الـ API الحقيقي (مسار نسبي)
cd /workspace/generator_app/mobile
npm run export:web:live

# 3) معاينة على 4310 (cloudflared الحالي يشير هنا — لا تعِد تشغيل النفق)
# أوقف serve القديم على 4310 إن وُجد، ثم:
nohup node tools/preview-server.mjs 4310 > /tmp/molada-preview.log 2>&1 &
```

الافتراضي في `app.json` يبقى `useMockApi: true` لتطوير الموبايل. التصدير الحي يستخدم متغيرات `EXPO_PUBLIC_*` عبر `app.config.js`.



## بناء APK أندرويد (بدون حساب Expo)

الباك التجريبي العام (عبر نفس نفق cloudflared + `tools/preview-server.mjs`):

`https://educated-geek-berry-grows.trycloudflare.com/api/v1`

```bash
# متطلبات: JDK 17، Android SDK (platform 36 + build-tools 36 + NDK 27.1.12297006)
export ANDROID_HOME=$HOME/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export EXPO_PUBLIC_USE_MOCK_API=false
export EXPO_PUBLIC_API_BASE_URL=https://educated-geek-berry-grows.trycloudflare.com/api/v1

cd mobile
npx expo prebuild -p android --clean
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
# توقيع الإصدار: ملف خارج المستودع /workspace/generator_app/keys/keystore.properties
cd android && ./gradlew assembleRelease
cp app/build/outputs/apk/release/app-release.apk /workspace/generator_app/molada-collector.apk
```

`app.json` يبقى على mock للتطوير. البناء الحي يستخدم `EXPO_PUBLIC_*` عبر `app.config.js`. مجلد `android/` وملفات المفاتيح غير مضمّنة في git.

