# الإجراءات المتبقية | Action Items

## ✅ تم إنجازه بالفعل | Already Done

- ✅ إصلاح خطأ الـ API token loading
- ✅ إضافة fallback للـ development mode
- ✅ إنشاء .env.local للتطوير المحلي
- ✅ تصحيح جميع language props
- ✅ اختبار API endpoints
- ✅ اختبار UI (EN و AR)
- ✅ اختبار audio download

---

## 📋 الإجراءات التي قد تحتاج إليها | Optional Actions

### إذا كان الـ Replicate Token غير صحيح

**المشكلة**: 
- إذا رأيت "Replicate API error: 401" في الإنتاج (Vercel)

**الحل**:
1. تحقق من token في Vercel Dashboard
2. اذهب إلى: Settings → Environment Variables
3. تأكد من أن `REPLICATE_API_TOKEN` بالقيمة الصحيحة:
   ```
   r8_SKVLjnSdIAscqVCsZE1G7iSV59hd4NO0jODmi
   ```
4. Redeploy الـ project

**اختبر في Terminal**:
```bash
# في المشروع المحلي
curl -X POST http://localhost:3000/api/process-audio \
  -F 'file=@test.wav' \
  -F 'oldName=Nora' \
  -F 'newName=Hessa'
```

---

### إذا أردت استخدام Replicate API الحقيقي في Development

اترك token في .env.local (موجود بالفعل):
```
REPLICATE_API_TOKEN=r8_SKVLjnSdIAscqVCsZE1G7iSV59hd4NO0jODmi
```

عندها سيحاول استخدام API الحقيقي. قد تحتاج لـ valid token من Replicate.

---

### إذا أردت تغيير الـ Models

في ملف `app/api/process-audio/route.ts`, ابحث عن:

```typescript
// Step 2: facebook/demucs
version: 'fb14dd82cc0b43efb5a9f92acf07e74b242f4147bcf501921cfe58bdf4bbd724'

// Step 3: lucataco/rvc
version: '8d493fcfe33fc2bf1f7b7c6eaa4c5c7262b85a6fd44f1b3a5fd0ef66b7e9c45a'

// Step 4: coqui/xtts-v2
version: '8cd7f0797e0c8203eb5f4362a7b5fc381b3dccdf59e8c31868fb36eb51e5f4f1'
```

استبدل version IDs بـ IDs من Replicate API.

---

### إذا أردت استخدام Database بدلاً من In-Memory Storage

حالياً الـ jobs محفوظة في memory فقط (تُحذف عند restart).

**للحفظ الدائم**, أضف Supabase أو Database:

1. استبدل `jobStore` (Map) بـ database queries
2. احفظ job data في PostgreSQL/Supabase
3. استرجع الـ job data من database عند GET request

---

### إذا أردت إضافة User Authentication

حالياً التطبيق مفتوح بدون login.

**للإضافة**:
1. أضف Supabase Auth أو Auth.js
2. احفظ user_id مع كل job
3. تحقق من ownership عند GET request

---

### إذا أردت رفع الملفات إلى S3 أو Vercel Blob

حالياً الملفات لا تُحفظ (تستخدم base64 مباشرة).

**للإضافة**:
1. استخدم Vercel Blob أو AWS S3
2. احفظ الملف بعد الرفع
3. أرسل URL للملف إلى Replicate API

---

## 🚀 النشر على Vercel

### الخطوات:
```bash
# 1. تأكد من جميع التغييرات
git status

# 2. أضف التغييرات
git add .

# 3. commit
git commit -m "fix: Resolve API token and add error handling"

# 4. push
git push origin main
```

### Vercel سيقوم تلقائياً بـ:
- Build المشروع
- استخدام Environment Variables
- Deploy على https://your-project.vercel.app

---

## 📝 ملفات مهمة

| الملف | الوصف |
|------|-------|
| `.env.local` | متغيرات البيئة (التطوير المحلي فقط) |
| `app/api/process-audio/route.ts` | API endpoints الرئيسية |
| `app/page.tsx` | الـ Dashboard |
| `ERROR_RESOLUTION.md` | شرح الخطأ والحل |
| `FINAL_STATUS.md` | الحالة الحالية |

---

## 💬 اسأل إذا

- لم تفهم شيء ❓
- أردت تطبيق ميزة جديدة 🎯
- حصل خطأ جديد 🐛

---

Generated: 2026-05-19
