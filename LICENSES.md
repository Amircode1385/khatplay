# مجوزها و منابع فونت

## وضعیت

مالک پروژه خرید Dana، Yekan Bakh، Anjoman، Peyda، Pinar و پنج قلم تازه را تأیید کرده است. این تأیید، مدرک شرایط وب یا حق تبدیل/subset ناشر نیست. فایل‌های مجوزی که در منبع محلی پیدا شدند در `licenses/` یا کنار قلم نگهداری می‌شوند؛ کدهای لازم باید پیش از انتشار درج شوند.

### قلم‌های واردشده

| قلم | فایل/مجموعه‌ی منبع | سند مجوز محلی | وضعیت وب و subset |
|---|---|---|---|
| Dana | `fonts/Dana/Dana/Webfonts/woff2/` | `licenses/dana-license.pdf` (کپی از `fonts/Dana/Dana/licenses.pdf`) | طبق تأیید مالک مجاز؛ PDF موجود است. هشدار: metadata فونت `OS/2 fsType.noSubsetting` را روشن نشان می‌دهد؛ قبل از انتشار، مدرک مجوزی که صریحاً subset را اجازه می‌دهد نگه دارید. |
| Yekan Bakh | `fonts/YekanBakh 3 ProPlus [@fontiranir]/.../Yekan Bakh Family/webfonts/woff2/` | `licenses/yekan-bakh-license.pdf` | طبق تأیید مالک مجاز؛ PDF موجود است، متن/کد مجوز از فایل استخراج نشد. |
| Anjoman | `fonts/Anjoman_Pro/01 - Anjoman Font Family/05- Webfonts/02- Woff2/` | `licenses/anjoman-FontLicense.txt`, `licenses/anjoman-license.pdf`, `fonts/anjoman/FontLicense.txt` | طبق تأیید مالک مجاز؛ فایل متنی جای کد ۵ رقمی را با `.....` خالی گذاشته و نگه‌داشتن فایل کنار فونت‌ها را می‌خواهد. کد لایسنس: نیازمند درج. |
| Peyda | `fonts/peyda/Peyda/PeydaWeb/woff2/` | `licenses/peyda-FontLicense.txt`, `licenses/peyda-license.pdf`, `fonts/peyda/FontLicense.txt` | طبق تأیید مالک مجاز؛ فایل متنی کد ۶ رقمی را خالی گذاشته و نگه‌داشتن فایل کنار فونت‌ها را می‌خواهد. کد لایسنس: نیازمند درج. |
| Pinar | `fonts/Pinar-V3 [@FontiranIR]/.../Variables/woff2/` | سند مجوز محلی پیدا نشد؛ میان‌بر شرایط استفاده: `fonts/Pinar/Pinar/شرایط استفاده.url` | طبق تأیید مالک مجاز. متن metadata می‌گوید مجوز SIL OFL فقط مربوط به بخش لاتین Commissioner است؛ آن را مجوز بخش فارسی Pinar تلقی نکنید. |
| Morabba | `fonts/Morabba_Pro/.../VF/Webfont/MorabbaVF.woff2` | `fonts/morabba/FontLicense.txt` | فایل کامل WOFF2 نگه داشته شد؛ `OS/2 fsType=256` subset را منع می‌کند. کد لایسنس منبع هنوز placeholder است. |
| IranNastaliq | `fonts/IranNastaliq v3.4/IranNastaliq-v304-Regular.ttf` | سند مستقل در پوشه‌ی منبع پیدا نشد | طبق گفته‌ی مالک خریداری شده؛ TTF به WOFF2 تبدیل و برای فارسی/عربی subset شده است (`fsType=0`). شرایط وب ناشر در مخزن موجود نیست. |
| Bonyade Koodak | `fonts/BonyadeKoodak Pro/.../Webfonts/woff2/BonyadeKoodak-VF.woff2` | سند مستقل در پوشه‌ی مجموعه پیدا نشد | فایل WOFF2 subset شده؛ `OS/2 fsType=8` محدودیت embedding دارد. مجازبودن وب باید با مجوز خرید تطبیق داده شود. |
| Dastan | `fonts/Dastan/Dastan/Web/Dastan-Dot-1.woff2` | سند مستقل در پوشه‌ی مجموعه پیدا نشد | فایل WOFF2 subset شده؛ `OS/2 fsType=8` محدودیت embedding دارد. مجازبودن وب باید با مجوز خرید تطبیق داده شود. |
| 898 Stencil | `fonts/898Stencil/webfont/898Stencil.woff2` | `fonts/898-stencil/FontLicense.txt` | فایل WOFF2 subset شده؛ `OS/2 fsType=8` محدودیت embedding دارد و کد ۶ رقمی در notice درج نشده است. |

تعریف‌های WOFF2 در پروژه‌ی جدید از مسیرهای `fonts/<font-name>/` استفاده می‌کنند و نسخه‌ی subset شده‌اند. اسناد بالا کپیِ اسناد موجود در پروژه‌ی اصلی‌اند؛ اصل‌ها دست‌نخورده مانده‌اند.

Vazirmatn، Lalezar، Estedad، Markazi Text و Noto Nastaliq Urdu عمداً از فهرست فعال و CSS حذف شده‌اند؛ فایل‌هایشان در منبع محلی پیدا نشد.