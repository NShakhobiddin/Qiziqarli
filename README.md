# Qiziqarli

Koinot, tabiat, tarix va inson haqidagi bilimlarni **interaktiv va animatsion** ko‘rsatadigan o‘zbek tilidagi sayt.

Ilhom manbalari: [neal.fun](https://neal.fun) (scroll-sayohatlar, «The Deep Sea»), Bartosz Ciechanowski (o‘zingiz boshqaradigan ilmiy tushuntirishlar), [PhET](https://phet.colorado.edu) (fizika simulyatsiyalari), Kurzgesagt (flat-vektor animatsiya), Wait But Why («Hayotingiz haftalarda»), The Pudding (scrollytelling).

Vizual uslub: Samarqand koshinlari ranglari (lojuvard, firuza, za’faron, anor) va Ulug‘bek davri usturlobi. Bosh sahifadagi usturlob halqasi bo‘limlar bo‘yicha navigatsiya vazifasini bajaradi.

## Mavzular

| Mavzu | Fayl | Turi |
|---|---|---|
| Quyosh tizimi | `mavzular/quyosh-tizimi.html` | Simulyatsiya + boshqa sayyoradagi vazn |
| Okean tubiga sho‘ng‘ing | `mavzular/okean.html` | Scroll-sayohat (0 → 10 935 m) |
| Vaqt chizig‘i | `mavzular/tarix.html` | Interaktiv tarix (dunyo va Markaziy Osiyo) |
| Suvning aylanishi | `mavzular/suv-aylanishi.html` | Bosqichma-bosqich jarayon animatsiyasi |
| Mayatnik laboratoriyasi | `mavzular/mayatnik.html` | Fizika tajribasi (Yer, Oy, Mars, Yupiter) |
| Hayotingiz raqamlarda | `mavzular/hayot.html` | Kalkulyator + «hayot haftalarda» |
| Haqiqatmi yoki afsona? | `mavzular/viktorina.html` | Viktorina |

## Ishga tushirish

Hech narsa o‘rnatish shart emas. `index.html` faylini brauzerda oching.

Mahalliy server orqali ochish (ixtiyoriy):

```bash
python3 -m http.server 8000
# keyin brauzerda: http://localhost:8000
```

## Internetga joylash (GitHub Pages, bepul)

1. GitHub’da repozitoriyani oching → **Settings** → **Pages**.
2. **Source**: «Deploy from a branch».
3. **Branch**: kerakli branchni va `/ (root)` papkasini tanlang → **Save**.
4. 1–2 daqiqadan so‘ng sayt `https://<foydalanuvchi>.github.io/<repozitoriya>/` manzilida ochiladi.

## Tuzilma

```
index.html                 bosh sahifa
assets/css/main.css        dizayn tizimi: ranglar, shriftlar, umumiy komponentlar
assets/css/home.css        bosh sahifa uslublari
assets/js/data.js          mavzular ro‘yxati va faktlar (kontent shu yerda)
assets/js/common.js        mavzu (kunduzgi/tungi), raqam formatlash, nusxa olish
assets/js/home.js          usturlob, bugungi fakt, mavzular to‘ri, hisoblagichlar
mavzular/_shablon.html     yangi mavzu uchun shablon
mavzular/*.html            interaktiv mavzular (har biri o‘z CSS va JS kodi bilan)
```

## Yangi kontent qo‘shish

**Yangi fakt.** `assets/js/data.js` faylidagi `facts` ro‘yxatiga qo‘shing:

```js
{ cat: "tabiat", text: "Fakt matni.", source: "Manba nomi" },
```

`cat` qiymatlari: `koinot`, `tabiat`, `tarix`, `ilm`, `inson`. Fakt «Bugungi fakt» bandida va usturlobda shu bo‘lim tanlanganda chiqadi.

**Yangi mavzu.**

1. `mavzular/_shablon.html` faylidan nusxa oling, masalan `mavzular/vulqonlar.html`.
2. `<body data-topic="vulqonlar">` qiymatini, sarlavha, teg va tavsifni o‘zgartiring.
3. Interaktiv qismni `.stage` ichiga yozing; shu sahifaga oid CSS `<style>` ichida, JS esa pastdagi `<script>` ichida turadi.
4. `assets/js/data.js` dagi `topics` ro‘yxatiga yozuv qo‘shing:

```js
{
  slug: "vulqonlar",
  url: "mavzular/vulqonlar.html",
  cats: ["tabiat"],
  title: "Vulqonlar",
  desc: "Bir-ikki jumlali tavsif.",
  kind: "Simulyatsiya",
  minutes: 5,
  art: "orbit"   // kartadagi kichik animatsiya: orbit | ocean | timeline | water | pendulum | pulse | quiz
}
```

Mavzu bosh sahifadagi kartalar to‘riga, filtrga, pastki menyuga va «Keyingi mavzu» zanjiriga avtomatik qo‘shiladi.

## Yozuv qoidalari

- O‘zbek lotin yozuvi: o‘ va g‘ uchun `‘` (U+2018), tutuq belgisi uchun `’` (U+2019).
- Raqamlar: `QZ.fmt(1234567.8, 1)` → `1 234 567,8`.
- Ranglar faqat CSS tokenlari orqali (`var(--lojuvard)` va h.k.), shunda kunduzgi va tungi rejim avtomatik ishlaydi.
- Animatsiyalar `prefers-reduced-motion` sozlamasini hurmat qiladi.
- Har bir fakt ishonchli manbaga tayanadi (NASA, Britannica, USGS, NOAA va h.k.).
