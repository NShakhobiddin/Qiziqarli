/* =========================================================================
   Qiziqarli — kontent ma’lumotlari
   Yangi mavzu qo‘shish: mavzular/_shablon.html dan nusxa oling va
   quyidagi `topics` ro‘yxatiga bitta yozuv qo‘shing.
   Yangi fakt qo‘shish: `facts` ro‘yxatiga { cat, text, source } qo‘shing.
   ========================================================================= */

window.QZ_DATA = {
  categories: [
    { id: "koinot", name: "Koinot" },
    { id: "tabiat", name: "Tabiat" },
    { id: "tarix", name: "Tarix" },
    { id: "ilm", name: "Ilm-fan" },
    { id: "inson", name: "Inson" }
  ],

  /* art: bosh sahifadagi kichik animatsiya turi
     (orbit | ocean | timeline | water | pendulum | pulse | quiz) */
  topics: [
    {
      slug: "quyosh-tizimi",
      url: "mavzular/quyosh-tizimi.html",
      cats: ["koinot"],
      title: "Quyosh tizimi",
      desc: "Sayyoralar harakatini tezlashtiring, birini bosib uning sirlarini o‘qing. Boshqa sayyoradagi vazningizni hisoblang.",
      kind: "Simulyatsiya",
      minutes: 6,
      art: "orbit"
    },
    {
      slug: "okean",
      url: "mavzular/okean.html",
      cats: ["tabiat"],
      title: "Okean tubiga sho‘ng‘ing",
      desc: "Sirtdan Mariana botig‘igacha 10 935 metr. Har bir chuqurlikda kim yashashini va bosim qanchaga yetishini ko‘ring.",
      kind: "Scroll-sayohat",
      minutes: 8,
      art: "ocean"
    },
    {
      slug: "tarix",
      url: "mavzular/tarix.html",
      cats: ["tarix"],
      title: "Vaqt chizig‘i",
      desc: "Yozuv ixtirosidan Ipak yo‘li, al-Xorazmiy, Ulug‘bek va koinotgacha: 5 000 yillik tarix bitta sahifada.",
      kind: "Vaqt chizig‘i",
      minutes: 7,
      art: "timeline"
    },
    {
      slug: "suv-aylanishi",
      url: "mavzular/suv-aylanishi.html",
      cats: ["tabiat", "ilm"],
      title: "Suvning aylanishi",
      desc: "Bir tomchi suv okeandan bulutga, bulutdan tog‘ga va yana okeanga qanday qaytadi? Jarayonni bosqichma-bosqich kuzating.",
      kind: "Jarayon",
      minutes: 4,
      art: "water"
    },
    {
      slug: "mayatnik",
      url: "mavzular/mayatnik.html",
      cats: ["ilm", "koinot"],
      title: "Mayatnik laboratoriyasi",
      desc: "Ipni uzaytiring, mayatnikni Oyga yoki Yupiterga olib boring. Tebranish davri nimaga bog‘liqligini o‘zingiz toping.",
      kind: "Tajriba",
      minutes: 5,
      art: "pendulum"
    },
    {
      slug: "hayot",
      url: "mavzular/hayot.html",
      cats: ["inson"],
      title: "Hayotingiz raqamlarda",
      desc: "Tug‘ilgan kuningizni kiriting: yuragingiz necha marta urgan, Quyosh atrofida qancha yo‘l bosib o‘tgansiz?",
      kind: "Kalkulyator",
      minutes: 3,
      art: "pulse"
    },
    {
      slug: "viktorina",
      url: "mavzular/viktorina.html",
      cats: ["koinot", "tabiat", "tarix", "ilm", "inson"],
      tag: "Aralash",
      title: "Haqiqatmi yoki afsona?",
      desc: "Oltin baliqning xotirasi, Xitoy devori, tuyaning o‘rkachi. 10 ta mashhur da’voni tekshirib ko‘ring.",
      kind: "Viktorina",
      minutes: 4,
      art: "quiz"
    }
  ],

  facts: [
    /* Koinot */
    { cat: "koinot", text: "Quyosh nuri Yerga taxminan 8 daqiqa 20 soniyada yetib keladi. Osmonga qaraganingizda Quyoshni 8 daqiqa oldingi holatida ko‘rasiz.", source: "NASA" },
    { cat: "koinot", text: "Saturn suvdan yengil: uning o‘rtacha zichligi 0,69 g/sm³. Yetarlicha katta hovuz topilsa, u suv yuzida qalqib turardi.", source: "NASA" },
    { cat: "koinot", text: "Yupiterning ichiga Yer kattaligidagi 1 300 dan ortiq sayyora sig‘adi.", source: "NASA" },
    { cat: "koinot", text: "Neytron yulduz moddasining bir choy qoshig‘i Yerda taxminan bir milliard tonna kelardi.", source: "NASA" },
    { cat: "koinot", text: "Venerada bir sutka (243 Yer kuni) bir yildan (225 Yer kuni) uzunroq davom etadi.", source: "NASA" },
    { cat: "koinot", text: "Oyda shamol ham, yomg‘ir ham yo‘q. Astronavtlar 1969-yilda qoldirgan oyoq izlari millionlab yil saqlanishi mumkin.", source: "NASA" },

    /* Tarix */
    { cat: "tarix", text: "Ulug‘bek rasadxonasida tuzilgan «Ziji jadidi Ko‘ragoniy» katalogida 1 018 ta yulduzning o‘rni ko‘rsatilgan.", source: "Britannica" },
    { cat: "tarix", text: "Ulug‘bek yulduz yili uzunligini 365 kun 6 soat 10 daqiqa 8 soniya deb hisoblagan. Bugungi aniq qiymatdan farqi bir daqiqaga ham yetmaydi.", source: "Britannica" },
    { cat: "tarix", text: "«Algebra» so‘zi al-Xorazmiyning «Al-jabr val-muqobala» kitobi nomidan, «algoritm» so‘zi esa olimning o‘z nomidan kelib chiqqan.", source: "Britannica" },
    { cat: "tarix", text: "Ibn Sinoning «Tib qonunlari» Yevropa universitetlarida taxminan 500 yil davomida asosiy tibbiyot darsligi bo‘lgan.", source: "Britannica" },
    { cat: "tarix", text: "Kleopatra Giza piramidalari qurilgan davrga qaraganda iPhone ixtiro qilingan davrga yaqinroq yashagan.", source: "Britannica" },
    { cat: "tarix", text: "Oksford universitetida dars berish 1096-yilda boshlangan. Atsteklarning Tenochtitlan shahri esa faqat 1325-yilda barpo etilgan.", source: "University of Oxford" },

    /* Tabiat */
    { cat: "tabiat", text: "Ahtapotning uchta yuragi va ko‘k rangli qoni bor. Qoniga mis asosidagi gemotsianin rang beradi.", source: "Smithsonian" },
    { cat: "tabiat", text: "Yer yuzida taxminan 20 kvadrillion chumoli yashaydi. Bu har bir odamga 2,5 milliondan ortiq chumoli degani.", source: "PNAS, 2022" },
    { cat: "tabiat", text: "Ko‘k kitning yuragi taxminan 180 kg keladi. Chuqurlikka sho‘ng‘iganda u daqiqasiga atigi 2 marta urishi mumkin.", source: "PNAS, 2019" },
    { cat: "tabiat", text: "Orol dengizi 1960-yillarda dunyodagi to‘rtinchi eng katta ko‘l edi. Bugun uning katta qismi Orolqum cho‘liga aylangan.", source: "NASA Earth Observatory" },
    { cat: "tabiat", text: "1 kg asal to‘plash uchun asalarilar taxminan 4 million gulga qo‘nib chiqadi.", source: "National Honey Board" },

    /* Ilm-fan */
    { cat: "ilm", text: "Yorug‘lik bir soniyada Yer ekvatori bo‘ylab 7,5 marta aylanib chiqa oladi.", source: "NIST" },
    { cat: "ilm", text: "Suv +4 °C da eng zich bo‘ladi. Shuning uchun ko‘llar tubidan emas, ustidan muzlaydi va baliqlar qishda tirik qoladi.", source: "USGS" },
    { cat: "ilm", text: "Chaqmoq atrofidagi havoni taxminan 30 000 °C gacha qizdiradi. Bu Quyosh sirtidan besh baravar issiq.", source: "NOAA" },
    { cat: "ilm", text: "Yer sayyorasiga har soniyada o‘rtacha 44 marta chaqmoq uriladi.", source: "NASA" },

    /* Inson */
    { cat: "inson", text: "Bitta odam tanasidagi barcha DNK iplarini uchma-uch ulasak, Quyoshgacha 200 martadan ko‘proq borib-kelishga yetadi.", source: "Genome.gov" },
    { cat: "inson", text: "Chaqaloq taxminan 300 ta suyak bilan tug‘iladi. Ular o‘sish davomida birikib, kattalarda 206 ta bo‘lib qoladi.", source: "Britannica" },
    { cat: "inson", text: "Oshqozon kislotasi shunchalik kuchliki, oshqozon devorini himoya qiluvchi hujayralar har 3–5 kunda yangilanadi.", source: "Britannica" },
    { cat: "inson", text: "Biz daqiqasiga o‘rtacha 15–20 marta ko‘z pirpiratamiz. Bu kuniga 14 000 dan ortiq degani.", source: "AAO" }
  ]
};
