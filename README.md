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
