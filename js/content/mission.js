// Görev, L2, görüş alanı ve "Hakkında" panellerinin içeriği (Türkçe / İngilizce).
// Zaman çizelgesi gerçek tarihlere bağlıdır: yeni bir kilometre taşı eklemek için
// TIMELINE dizisine { date, planned?, tr, en } girdisi eklemeniz yeterli.

export const MISSION = {
  tr: {
    tag: 'Görev',
    title: 'Roman ne yapacak?',
    sub: "NASA'nın yeni geniş alan kızılötesi teleskobu",
    intro: "Nancy Grace Roman Uzay Teleskobu, Hubble kadar keskin ama ondan yüzlerce kat geniş bir bakışla gökyüzünü haritalamak için tasarlandı. 30 Ağustos 2026'da Kennedy Uzay Merkezi'nden bir Falcon Heavy roketiyle fırlatıldı; 2027 Mayıs taahhüdünden dokuz ay önce ve bütçesi içinde. Şu anda Güneş–Dünya L2 noktasına doğru yolculuk ederken sistemleri tek tek devreye alınıyor.",
    goalsTitle: 'Bilim hedefleri',
    goals: [
      '<b>Karanlık enerji:</b> Evrenin genişlemesinin neden hızlandığını, gökadaların dağılımını, kütleçekimsel mercek etkisini ve süpernovaları ölçerek araştırmak',
      '<b>Ötegezegenler:</b> Mikromercek yöntemiyle Samanyolu’ndaki gezegenlerin sayımını yapmak; koronagrafla gezegenleri doğrudan görüntüleme teknolojisini denemek',
      '<b>Kızılötesi astrofizik:</b> Yıldız oluşumundan uzak gökadalara kadar her alanda gökbilimcilere geniş bir veri hazinesi sunmak',
    ],
    numbersTitle: 'Sayılarla Roman',
    surveysTitle: 'Temel taramalar',
    surveysNote: 'Üç çekirdek tarama, 5 yıllık birincil görevin yaklaşık %75’ini oluşturur; kalan süre gökbilimcilerin önerilerine ayrılır.',
    timelineTitle: 'Zaman çizelgesi',
    planned: 'planlanan',
    nameTitle: 'Adını kimden alıyor?',
    name: "Dr. Nancy Grace Roman (1925–2018), NASA'nın ilk astronomi şefiydi. Uzay teleskoplarının savunuculuğunu yaptığı ve Hubble'ın temellerini attığı için \"Hubble'ın annesi\" olarak anılır. Teleskobun eski adı WFIRST idi; 20 Mayıs 2020'de onun adı verildi.",
    costNote: 'Yaşam boyu toplam maliyet (üretim, fırlatma ve işletme) yaklaşık 4,3 milyar dolar.',
  },
  en: {
    tag: 'Mission',
    title: 'What will Roman do?',
    sub: 'NASA’s new wide-field infrared telescope',
    intro: 'The Nancy Grace Roman Space Telescope was designed to map the sky with Hubble-like sharpness but a view hundreds of times wider. It launched on 30 August 2026 on a Falcon Heavy rocket from Kennedy Space Center — nine months ahead of its May 2027 commitment and on budget. It is now traveling to the Sun–Earth L2 point while its systems are checked out one by one.',
    goalsTitle: 'Science goals',
    goals: [
      '<b>Dark energy:</b> investigate why the universe’s expansion is accelerating by measuring the distribution of galaxies, gravitational lensing and supernovae',
      '<b>Exoplanets:</b> take a census of planets across the Milky Way using microlensing, and test technology for directly imaging planets with the coronagraph',
      '<b>Infrared astrophysics:</b> give astronomers a vast trove of data on everything from star formation to distant galaxies',
    ],
    numbersTitle: 'Roman by the numbers',
    surveysTitle: 'Core surveys',
    surveysNote: 'The three core surveys take up about 75% of the five-year primary mission; the rest is open to proposals from astronomers.',
    timelineTitle: 'Timeline',
    planned: 'planned',
    nameTitle: 'Who is it named after?',
    name: 'Dr. Nancy Grace Roman (1925–2018) was NASA’s first chief of astronomy. She is known as the “mother of Hubble” for championing space telescopes and laying the groundwork for Hubble. The telescope, formerly called WFIRST, was named after her on 20 May 2020.',
    costNote: 'Total lifetime cost (build, launch and operations) is about $4.3 billion.',
  },
};

export const STATS = [
  { value: { tr: '300,8 MP', en: '300.8 MP' }, label: { tr: 'Geniş Alan Aleti kamerası', en: 'Wide Field Instrument camera' } },
  { value: { tr: '≈ 1,4 TB', en: '≈ 1.4 TB' }, label: { tr: 'günlük veri', en: 'of data per day' } },
  { value: { tr: '1 milyar +', en: '1 billion +' }, label: { tr: 'gökada görüntülenecek', en: 'galaxies to be imaged' } },
  { value: { tr: '≈ 100.000', en: '≈ 100,000' }, label: { tr: 'yeni ötegezegen bekleniyor', en: 'new exoplanets expected' } },
  { value: { tr: '≈ 100.000', en: '≈ 100,000' }, label: { tr: 'süpernova ve kozmik patlama', en: 'supernovae and cosmic blasts' } },
  { value: { tr: '20 milyar', en: '20 billion' }, label: { tr: 'yıldıza kadar (Samanyolu düzlemi)', en: 'stars (Milky Way plane survey)' } },
];

export const SURVEYS = [
  {
    tr: { name: 'Yüksek Enlem Geniş Alan Taraması', meta: '520 gün · 5.000 kare dereceden fazla', text: 'Gökyüzünün yaklaşık %12’sini tarayarak 1 milyardan fazla gökadayı görüntüleyecek ve yaklaşık 20 milyon gökadanın tayfını ölçecek. Karanlık madde haritaları ve karanlık enerji ölçümleri bu taramadan çıkacak.' },
    en: { name: 'High Latitude Wide Area Survey', meta: '520 days · over 5,000 square degrees', text: 'Covering about 12% of the sky, it will image more than a billion galaxies and measure spectra for about 20 million. Maps of dark matter and measurements of dark energy will come from this survey.' },
  },
  {
    tr: { name: 'Yüksek Enlem Zaman Alanı Taraması', meta: '180 gün · iki alan, tekrar tekrar', text: 'Aynı bölgelere düzenli olarak dönerek Ia türü süpernovalar dahil yaklaşık 100.000 kozmik patlama yakalayacak. Bu "standart mumlar" evrenin genişleme tarihini ölçmeye yarar.' },
    en: { name: 'High Latitude Time Domain Survey', meta: '180 days · two fields, revisited repeatedly', text: 'By returning to the same fields regularly, it will catch about 100,000 cosmic blasts, including type Ia supernovae — “standard candles” used to measure the universe’s expansion history.' },
  },
  {
    tr: { name: 'Galaktik Şişkinlik Zaman Alanı Taraması', meta: '438 gün · 6 alan, her 12 dakikada bir', text: 'Samanyolu’nun merkezine doğru yüz milyonlarca yıldızı izleyerek mikromercek yöntemiyle 1.000’den fazla gezegen ve geçiş yöntemiyle yaklaşık 100.000 gezegen bulması bekleniyor; bunlar arasında başıboş gezegenler de var.' },
    en: { name: 'Galactic Bulge Time Domain Survey', meta: '438 days · 6 fields, every 12 minutes', text: 'Monitoring hundreds of millions of stars toward the center of the Milky Way, it is expected to find more than 1,000 planets through microlensing and about 100,000 through transits — including free-floating rogue planets.' },
  },
  {
    tr: { name: 'Galaktik Düzlem Taraması', meta: '29 gün · ≈ 700 kare derece', text: 'İlk genel astrofizik taraması: Samanyolu’nun tozlu düzlemini kızılötesinde haritalayarak 20 milyara kadar yıldızı kataloglayacak.' },
    en: { name: 'Galactic Plane Survey', meta: '29 days · ≈ 700 square degrees', text: 'The first general astrophysics survey: mapping the dusty plane of the Milky Way in the infrared and cataloging up to 20 billion stars.' },
  },
];

export const TIMELINE = [
  { date: '2010', tr: 'ABD Ulusal Akademileri’nin on yıllık değerlendirmesinde en yüksek öncelikli büyük uzay görevi seçildi (WFIRST adıyla)', en: 'Ranked the top-priority large space mission in the U.S. National Academies’ decadal survey (as WFIRST)' },
  { date: '2012', tr: 'Ulusal Keşif Ofisi, 2,4 m’lik teleskobu NASA’ya devretti', en: 'The National Reconnaissance Office transferred the 2.4 m telescope to NASA' },
  { date: '2020-05-20', tr: 'Teleskoba Nancy Grace Roman’ın adı verildi', en: 'The telescope was named after Nancy Grace Roman' },
  { date: '2026-06-21', tr: 'Gözlemevi mavna ile Kennedy Uzay Merkezi’ne ulaştı', en: 'The observatory arrived at Kennedy Space Center by barge' },
  { date: '2026-08-30', tr: 'Fırlatma: Falcon Heavy, LC-39A, 07:26 EDT. 1 saat 23 dakika sonra güneş panelleri açıldı', en: 'Launch: Falcon Heavy, LC-39A, 7:26 a.m. EDT. Solar panels deployed 1 h 23 min later' },
  { date: '2026-08-31', tr: 'İlk rota düzeltmesi ve yüksek kazançlı antenin açılması', en: 'First course correction and high-gain antenna deployment' },
  { date: '2026-09-01', tr: 'Açıklık kapağı (siperlik) açıldı; koronagraf çalıştırıldı', en: 'Aperture cover (visor) deployed; coronagraph powered on' },
  { date: '2026-09-15', tr: 'Geniş Alan Aleti çalıştırıldı ve soğumaya başladı', en: 'Wide Field Instrument activated and began cooling down' },
  { date: '2026-09-22', tr: 'Koronagrafın ilk ışığı', en: 'Coronagraph first light' },
  { date: '2026-12', planned: true, tr: 'L2 çevresindeki yörüngeye varış (fırlatmadan ≈ 100 gün sonra)', en: 'Arrival in orbit around L2 (≈ 100 days after launch)' },
  { date: '2027', planned: true, tr: '90 günlük devreye alma sonrası bilim gözlemlerinin başlaması', en: 'Science operations begin after 90 days of commissioning' },
];

export const L2 = {
  tr: {
    tag: 'Yörünge',
    title: 'Güneş–Dünya L2 Noktası',
    sub: "Dünya'dan 1,5 milyon km uzakta, Güneş'in tam karşı tarafında",
    desc: "Roman, Dünya'nın Güneş'e göre arka tarafında bulunan ikinci Lagrange noktası (L2) çevresinde, \"halo\" adı verilen geniş bir yörüngede dolanacak. Burada Güneş, Dünya ve Ay hep aynı yönde kalır; tek bir kalkan üçünü birden engelleyebilir ve teleskop gökyüzünün büyük bölümünü kesintisiz gözleyebilir. Sıcaklık da çok kararlıdır; bu, aynaların biçimini korumak için önemlidir.",
    facts: [
      "Fırlatmadan L2'ye yolculuk yaklaşık 100 gün sürer; varış Aralık 2026 başında bekleniyor",
      'Halo yörüngede bir tur yaklaşık 6 ay sürer ve Dünya’nın gölgesine hiç girmez',
      'Yörüngeyi korumak için yaklaşık her 28 günde bir küçük bir ateşleme yapılır',
      "James Webb ve Euclid teleskopları da L2 çevresinde çalışıyor",
    ],
    diagramNote: 'Ölçekli değildir',
    sun: 'Güneş',
    earth: 'Dünya',
    moon: 'Ay',
    halo: 'L2 · halo yörünge',
    distance: '1,5 milyon km',
    sunDistance: '150 milyon km',
  },
  en: {
    tag: 'Orbit',
    title: 'Sun–Earth L2 Point',
    sub: '1.5 million km from Earth, directly opposite the Sun',
    desc: 'Roman will travel in a wide “halo” orbit around the second Lagrange point (L2), on the far side of Earth from the Sun. From there the Sun, Earth and Moon always stay in roughly the same direction, so a single shield can block all three and the telescope can observe most of the sky without interruption. Temperatures are also very stable — important for keeping the mirrors’ shape.',
    facts: [
      'The trip from launch to L2 takes about 100 days; arrival is expected in early December 2026',
      'One loop of the halo orbit takes about six months and never enters Earth’s shadow',
      'A small burn about every 28 days keeps the orbit on track',
      'The James Webb and Euclid telescopes also operate around L2',
    ],
    diagramNote: 'Not to scale',
    sun: 'Sun',
    earth: 'Earth',
    moon: 'Moon',
    halo: 'L2 · halo orbit',
    distance: '1.5 million km',
    sunDistance: '150 million km',
  },
};

export const FOV = {
  tr: {
    tag: 'Görüş alanı',
    title: 'Tek bakışta ne kadar gökyüzü?',
    sub: '18 dedektör = 0,281 kare derece',
    desc: "Roman'ın Geniş Alan Aleti tek bir pozda yaklaşık 0,8° × 0,4°'lik bir alan görür. Bu, Hubble'ın kızılötesi kamerası WFC3/IR'nin görüş alanının yaklaşık 200 katıdır ve dolunayın kapladığı alandan büyüktür. Üstelik keskinlik Hubble ile aynıdır: Hubble'ın gökyüzünde yüzlerce poz gerektiren bir taramayı Roman çok daha kısa sürede tamamlayabilir.",
    facts: [
      'Bir dedektör gökyüzünde ≈ 7,5 × 7,5 yay dakikası görür',
      'Dolunayın çapı ≈ 31 yay dakikasıdır',
      'Hubble WFC3/IR: ≈ 2,3 × 2 yay dakikası',
      'NASA genel anlatımlarda "Hubble’dan en az 100 kat geniş" ifadesini kullanır',
    ],
    roman: 'Roman · WFI',
    hubble: 'Hubble WFC3/IR',
    moon: 'Dolunay',
    scale: 'Ölçekli · ölçek çubuğu 10 yay dakikası',
    arcmin: '10′',
    footprint: '0,8° × 0,4° · 0,281 deg²',
  },
  en: {
    tag: 'Field of view',
    title: 'How much sky in one look?',
    sub: '18 detectors = 0.281 square degrees',
    desc: 'Roman’s Wide Field Instrument sees about 0.8° × 0.4° of sky in a single exposure. That is roughly 200 times the field of Hubble’s infrared camera, WFC3/IR, and larger than the area of the full Moon — with the same sharpness as Hubble. A survey that would take Hubble hundreds of pointings can be finished by Roman in a fraction of the time.',
    facts: [
      'Each detector sees ≈ 7.5 × 7.5 arcminutes of sky',
      'The full Moon is ≈ 31 arcminutes across',
      'Hubble WFC3/IR: ≈ 2.3 × 2 arcminutes',
      'NASA’s general descriptions say Roman’s view is “at least 100 times” Hubble’s',
    ],
    roman: 'Roman · WFI',
    hubble: 'Hubble WFC3/IR',
    moon: 'Full Moon',
    scale: 'To scale · scale bar is 10 arcminutes',
    arcmin: '10′',
    footprint: '0.8° × 0.4° · 0.281 deg²',
  },
};

export const ABOUT = {
  tr: {
    tag: 'Hakkında',
    title: 'Bu model hakkında',
    desc: 'Bu interaktif model eğitim amacıyla hazırlanmıştır. Geometri NASA’nın kamuya açık görsellerine, basın kitine ve mühendislik makalelerine dayanılarak şematik olarak oluşturulmuştur; birebir mühendislik modeli değildir ve ölçüler yaklaşıktır. Model ve arayüz açık kaynaklıdır (MIT lisansı).',
    sourcesTitle: 'Başlıca kaynaklar',
    techTitle: 'Teknoloji',
    tech: 'three.js 0.186 (WebGL), saf HTML/CSS/JavaScript modülleri; derleme adımı yok. Tüm dokular tarayıcıda prosedürel olarak üretilir.',
    code: 'Kaynak kodu GitHub’da',
  },
  en: {
    tag: 'About',
    title: 'About this model',
    desc: 'This interactive model was made for education. Its geometry is a schematic reconstruction based on NASA’s public images, press kit and engineering papers; it is not an engineering model and the dimensions are approximate. The model and the interface are open source (MIT license).',
    sourcesTitle: 'Main sources',
    techTitle: 'Technology',
    tech: 'three.js 0.186 (WebGL) with plain HTML/CSS/JavaScript modules and no build step. All textures are generated procedurally in the browser.',
    code: 'Source code on GitHub',
  },
};

export const SOURCES = [
  { label: 'NASA · Roman Space Telescope', url: 'https://science.nasa.gov/mission/roman-space-telescope/' },
  { label: 'NASA · Roman launch blog', url: 'https://science.nasa.gov/blogs/roman/' },
  { label: 'NASA Goddard · Roman technical pages', url: 'https://roman.gsfc.nasa.gov/science/observatory_technical.html' },
  { label: 'NASA · Hubble vs. Roman', url: 'https://science.nasa.gov/mission/hubble/observatory/hubble-vs-roman/' },
  { label: 'NASA SVS · Roman images and animations', url: 'https://svs.gsfc.nasa.gov/search/?search=Roman%20Space%20Telescope' },
];

export const REPO_URL = 'https://github.com/pandakingpunc/RomanTeleskop3D';
