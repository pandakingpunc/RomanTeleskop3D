// Parça bilgileri (Türkçe ve İngilizce). Kaynaklar: NASA basın kiti (Ağustos 2026), NASA Roman blogu,
// roman.gsfc.nasa.gov teknik sayfaları ve NASA mühendislik makaleleri. Ayrıntılar README'de.
//
// layer: 'outer' = dışarıdan görünen yapı, 'inner' = "İçini gör" modunda görünen iç parça
// view:  kamera bu parçaya odaklanırken parçanın merkezinden bakılacak yön (yaklaşık)
// actions: bilgi panelinde gösterilecek ek düğmeler

export const GROUPS = [
  { id: 'optics', parts: ['dac', 'barrel', 'primary', 'secondary', 'aft_optics', 'carrier'] },
  { id: 'instruments', parts: ['wfi', 'wfi_wheel', 'wfi_detector', 'cgi', 'cgi_dms', 'cgi_bench'] },
  { id: 'spacecraft', parts: ['sass', 'liss', 'bus', 'bus_tanks', 'bus_wheels', 'antenna'] },
];

export const PART_ORDER = GROUPS.flatMap((g) => g.parts);

export const PARTS = {
  dac: {
    layer: 'outer',
    view: [-0.75, 0.55, 0.45],
    actions: ['deploy'],
    tr: {
      name: 'Açılır Açıklık Kapağı',
      sub: 'Siperlik · başıboş Güneş ışığını dışarıda tutar',
      desc: "Teleskobun ağzının Güneş tarafında yükselen çadır biçimli siperlik. İki kat güçlendirilmiş ısıl battaniyeden yapılmıştır ve üç yaylı bom üzerinde gerilir. Fırlatma sırasında teleskobun açıklığının üzerine katlanarak onu korudu; uzayda bir pop-up kitabın sayfası gibi kalktı. Görev boyunca açık kalır ve teleskop Güneş'e göre uç açılarda dururken bile tüpe sızabilecek ışığı keser.",
      facts: [
        "NASA Goddard Uzay Uçuş Merkezi'nde tasarlanıp üretildi",
        '1 Eylül 2026’da yaklaşık 8 dakikada açıldı',
        'Dış yüzü gümüş renkli yalıtım, iç yüzü ışığı yutan siyah',
        'Modelde "Uzayda açılış" ile katlı ve açık hâlini karşılaştırabilirsiniz',
      ],
    },
    en: {
      name: 'Deployable Aperture Cover',
      sub: 'Visor · keeps stray sunlight out',
      desc: 'A tent-like visor that rises on the Sun-facing side of the telescope’s opening. It is made of two layers of reinforced thermal blanket stretched over three spring-loaded booms. During launch it was folded over the aperture to protect it; in space it sprang up like the page of a pop-up book. It stays open for the whole mission, blocking light that could leak into the tube even when the telescope points at extreme angles relative to the Sun.',
      facts: [
        'Designed and built at NASA’s Goddard Space Flight Center',
        'Deployed on 1 September 2026 in about 8 minutes',
        'Silver insulation on the outside, light-absorbing black on the inside',
        'Use “Deployment” to compare its folded and open states',
      ],
    },
  },

  barrel: {
    layer: 'outer',
    view: [0.25, 0.45, 1],
    actions: ['inside'],
    tr: {
      name: 'Dış Tüp (OBA)',
      sub: 'Teleskobu saran karbon kompozit kabuk',
      desc: "Teleskobu çevreleyen altıgen kesitli karbon kompozit yapı. Mühendisler onu \"sütunlar üstündeki ev\" diye tarif eder: üst bölüm teleskobu sarar, alt bölümdeki dikmeler aletlerin bulunduğu bölgeyi çevreleyerek uzay aracı gövdesine bağlanır. Teleskopla doğrudan temas etmez; böylece ısı ve titreşim aynalara geçmez. Ortadaki güneş panellerini ve açıklık kapağını da taşır. İçindeki aynaları görmek için \"İçini gör\" modunu açın.",
      facts: [
        'Yaklaşık 5 m uzunluğunda ve 4 m genişliğinde',
        'İçinde eğik gelen başıboş ışığı tuzaklayan 10 perde (bafıl) bulunur',
        'Dışı gümüş renkli çok katmanlı yalıtımla (MLI) kaplı, iç yüzeyi ışığı yutan siyah',
        'Goddard’da tasarlandı, Applied Composites tarafından üretildi',
      ],
    },
    en: {
      name: 'Outer Barrel Assembly (OBA)',
      sub: 'Carbon-composite shell around the telescope',
      desc: 'A hexagonal carbon-composite structure that surrounds the telescope. Engineers describe it as a “house on stilts”: the upper section encloses the telescope, while struts in the lower section surround the instrument area and attach to the spacecraft bus. It never touches the telescope itself, so heat and vibration don’t reach the mirrors. It also carries the central solar panels and the aperture cover. Turn on “Look inside” to see the mirrors.',
      facts: [
        'About 5 m long and 4 m wide',
        'Ten internal baffles trap stray light arriving at oblique angles',
        'Wrapped in silver multi-layer insulation (MLI) outside, light-absorbing black inside',
        'Designed at Goddard and built by Applied Composites',
      ],
    },
  },

  primary: {
    layer: 'inner',
    view: [-1, 0.35, 0.55],
    actions: ['light'],
    tr: {
      name: 'Birincil Ayna',
      sub: '2,4 m · ışığı toplar',
      desc: "Teleskobun kalbi. 2,4 metre çapındaki içbükey ayna, gökyüzünden gelen ışığı toplayıp öne, ikincil aynaya doğru yansıtır. Hubble'ın aynasıyla aynı boyda olmasına karşın yalnızca 186 kg'dır; Hubble'ın 828 kg'lık aynasının dörtte birinden hafiftir. Ortasındaki delik, ikincil aynadan geri dönen ışığın arkadaki optiklere ve aletlere ulaşmasını sağlar.",
      facts: [
        'Yüzeyi 400 nanometreden ince bir gümüş tabakayla kaplı (Hubble’ınki alüminyum); gümüş kızılötesini çok iyi yansıtır',
        'Yaklaşık −7 °C’de çalışır',
        'Teleskop 2012’de ABD Ulusal Keşif Ofisi (NRO) tarafından NASA’ya devredildi ve L3Harris tarafından yenilendi',
        'Üç aynalı optik düzenin (anastigmat) ilk aynası',
      ],
      specs: [['Çap', '2,4 m'], ['Kütle', '186 kg'], ['Kaplama', 'Gümüş'], ['Sıcaklık', '≈ −7 °C']],
    },
    en: {
      name: 'Primary Mirror',
      sub: '2.4 m · collects the light',
      desc: 'The heart of the telescope. This concave mirror, 2.4 meters across, gathers light from the sky and reflects it forward to the secondary mirror. It is the same size as Hubble’s mirror yet weighs only 186 kg — less than a quarter of Hubble’s 828 kg mirror. The hole in its center lets light returning from the secondary mirror pass through to the optics and instruments behind it.',
      facts: [
        'Coated with a layer of silver less than 400 nanometers thick (Hubble’s uses aluminum); silver reflects infrared very well',
        'Operates at about −7 °C',
        'The telescope was transferred to NASA by the U.S. National Reconnaissance Office (NRO) in 2012 and refurbished by L3Harris',
        'The first mirror of a three-mirror (anastigmat) optical design',
      ],
      specs: [['Diameter', '2.4 m'], ['Mass', '186 kg'], ['Coating', 'Silver'], ['Temperature', '≈ −7 °C']],
    },
  },

  secondary: {
    layer: 'inner',
    view: [-0.9, 0.5, 0.7],
    actions: ['light'],
    tr: {
      name: 'İkincil Ayna',
      sub: '0,58 m · ışığı geri yansıtır',
      desc: 'Birincil aynanın önünde, altı çubuktan oluşan hafif bir ölçüm yapısıyla tutulan dışbükey ayna. Birincil aynadan gelen yakınsayan ışığı geri, birincil aynanın ortasındaki delikten arkadaki optiklere yollar. Arkasındaki altı ayaklı mekanizma, odağı ve hizalamayı uzaktan komutla mikron hassasiyetinde ayarlayabilir.',
      facts: [
        'Çapı yaklaşık 0,58 m',
        'Taşıyıcı çubuklar, Roman görüntülerinde parlak yıldızların çevresinde altı kollu kırınım izlerine yol açar',
        'Birincil aynayla aynı, ısıl genleşmesi çok düşük ölçüm yapısına bağlıdır',
      ],
    },
    en: {
      name: 'Secondary Mirror',
      sub: '0.58 m · reflects the light back',
      desc: 'A convex mirror held in front of the primary mirror by a lightweight metering structure of six struts. It catches the converging light from the primary and sends it back through the hole in the primary’s center to the optics behind it. A six-legged mechanism behind it can adjust focus and alignment by remote command with micron precision.',
      facts: [
        'About 0.58 m across',
        'Its support struts create six-pointed diffraction spikes around bright stars in Roman’s images',
        'Mounted on the same low-thermal-expansion metering structure as the primary mirror',
      ],
    },
  },

  aft_optics: {
    layer: 'inner',
    view: [0.2, 0.6, 1],
    actions: ['light'],
    tr: {
      name: 'Arka Optik Modül',
      sub: 'Üçüncül ayna · ışığı aletlere dağıtır',
      desc: 'Birincil aynanın arkasında, alet taşıyıcının içinde duran optik modül. Buradaki üçüncül ayna ve katlama aynaları görüntüyü düzeltip ışığı Geniş Alan Aleti’ne yönlendirir. Bu üç aynalı düzen (anastigmat), Hubble’ınkinden çok daha geniş bir alanı kenarlarına kadar keskin görmeyi sağlar. Ayrı bir aynalı düzenek, ışığın bir kısmını koronagrafa aktarır.',
      facts: [
        'Gözlemevinde ışık yolunda toplam 10 ayna bulunur',
        'Geniş Alan Aleti’ne f/7,9 odak oranında ışık iletir',
        'Koronagrafa giden ışık beş aynalı ayrı bir düzenekle paralel demet hâline getirilir',
      ],
    },
    en: {
      name: 'Aft Optics',
      sub: 'Tertiary mirror · routes light to the instruments',
      desc: 'An optical module behind the primary mirror, inside the instrument carrier. Its tertiary mirror and fold mirrors correct the image and direct the light to the Wide Field Instrument. This three-mirror design (an anastigmat) keeps a far wider field than Hubble’s sharp all the way to the edges. A separate mirror assembly sends part of the light to the coronagraph.',
      facts: [
        'The observatory’s light path contains 10 mirrors in total',
        'Delivers an f/7.9 beam to the Wide Field Instrument',
        'Light bound for the coronagraph is turned into a parallel beam by a separate five-mirror assembly',
      ],
    },
  },

  carrier: {
    layer: 'outer',
    view: [0.35, 0.55, 1],
    tr: {
      name: 'Alet Taşıyıcı',
      sub: 'Teleskobu ve aletleri taşıyan kafes',
      desc: 'Teleskobun hemen arkasında (gerçekte altında) duran, ısıl genleşmesi son derece düşük kompozit çubuklardan oluşan kafes yapı. Teleskobu, Geniş Alan Aleti’ni ve koronagrafı birbirine göre hizalı tutar ve hepsini uzay aracı gövdesine bağlar. Yönelim için kullanılan yıldız izleyiciler de bu yapının üzerindedir.',
      facts: [
        'Üç yıldız izleyici (ESA katkısı) ve bir jiroskop birimi taşır',
        'Sıcaklık değişse de boyu neredeyse hiç değişmeyen kompozit malzemeden yapılmıştır',
        'Dış tüpün dikmeleri bu bölgeyi çevreler ama ona dokunmaz',
      ],
    },
    en: {
      name: 'Instrument Carrier',
      sub: 'Truss that holds the telescope and instruments',
      desc: 'A truss of composite struts with extremely low thermal expansion, sitting right behind the telescope (below it, as the observatory stands). It keeps the telescope, the Wide Field Instrument and the coronagraph aligned with each other and connects them all to the spacecraft bus. The star trackers used for pointing are mounted on it too.',
      facts: [
        'Carries three star trackers (contributed by ESA) and a gyroscope unit',
        'Made of composites whose length barely changes with temperature',
        'The outer barrel’s struts surround this area without touching it',
      ],
    },
  },

  wfi: {
    layer: 'outer',
    view: [0.1, 0.25, 1],
    actions: ['inside', 'light'],
    tr: {
      name: 'Geniş Alan Aleti (WFI)',
      sub: '300 megapiksellik kızılötesi kamera',
      desc: "Roman'ın ana bilim aleti. Tek bir pozda Hubble'ın kızılötesi kamerasından yaklaşık 200 kat geniş bir gökyüzü alanını, Hubble keskinliğinde görüntüler. Karanlık enerji, karanlık madde ve ötegezegen araştırmalarının çoğu bu kamerayla yapılacak. Mavi panel, dedektörleri soğuk tutmak için ısıyı uzaya atan radyatördür.",
      facts: [
        '18 adet H4RG-10 dedektör, toplam 300,8 milyon etkin piksel',
        'Görüş alanı 0,281 kare derece (≈ 0,8° × 0,4°): dolunayın alanından büyük',
        '0,48–2,3 mikron: görünür ışığın kırmızı ucundan yakın kızılötesine',
        '8 filtre, bir grizm ve bir prizma ile hem görüntüleme hem tayf ölçümü yapar',
        'NASA Goddard ve BAE Systems (eski adıyla Ball Aerospace) tarafından üretildi',
        'Işık yolunda mavi renkle gösterilir',
      ],
      specs: [['Piksel', '300,8 MP'], ['Görüş alanı', '0,281 deg²'], ['Dalga boyu', '0,48–2,3 µm'], ['Piksel ölçeği', '0,11″']],
    },
    en: {
      name: 'Wide Field Instrument (WFI)',
      sub: '300-megapixel infrared camera',
      desc: 'Roman’s main science instrument. In a single exposure it images a patch of sky roughly 200 times larger than Hubble’s infrared camera sees, with Hubble-like sharpness. Most of the dark energy, dark matter and exoplanet research will be done with this camera. The blue panel is a radiator that dumps heat into space to keep the detectors cold.',
      facts: [
        '18 H4RG-10 detectors with 300.8 million active pixels in total',
        'Field of view of 0.281 square degrees (≈ 0.8° × 0.4°) — larger than the area of the full Moon',
        '0.48–2.3 microns: from the red end of visible light into the near infrared',
        'Eight filters, a grism and a prism allow both imaging and spectroscopy',
        'Built by NASA Goddard and BAE Systems (formerly Ball Aerospace)',
        'Shown in blue in the light path',
      ],
      specs: [['Pixels', '300.8 MP'], ['Field of view', '0.281 deg²'], ['Wavelength', '0.48–2.3 µm'], ['Pixel scale', '0.11″']],
    },
  },

  wfi_wheel: {
    layer: 'inner',
    view: [-0.6, 0.5, 1],
    tr: {
      name: 'Eleman Tekerleği',
      sub: '8 filtre · grizm · prizma',
      desc: 'Dedektörlerin önünde dönen tekerlek; hangi ışığın kameraya ulaşacağını seçer. Sekiz geniş bant filtre gökyüzünü farklı "renklerde" görüntülemeyi sağlar. Grizm ve prizma ise ışığı tayfına ayırır; böylece tek bir pozda binlerce gökadanın uzaklığı aynı anda ölçülebilir.',
      facts: [
        'Filtreler: F062, F087, F106, F129, F146, F158, F184, F213 (F062 ≈ 0,62 µm merkez dalga boyu)',
        'Grizm 1,0–1,93 µm, prizma 0,75–1,8 µm aralığında tayf alır',
        'Geniş alan taramasında yaklaşık 20 milyon gökadanın tayfı ölçülecek',
      ],
    },
    en: {
      name: 'Element Wheel',
      sub: '8 filters · grism · prism',
      desc: 'A wheel that turns in front of the detectors and selects what light reaches the camera. Eight broadband filters let it image the sky in different “colors”. The grism and the prism spread light into a spectrum, so the distances of thousands of galaxies can be measured in a single exposure.',
      facts: [
        'Filters: F062, F087, F106, F129, F146, F158, F184, F213 (F062 ≈ 0.62 µm center wavelength)',
        'The grism covers 1.0–1.93 µm, the prism 0.75–1.8 µm',
        'The wide-area survey will measure spectra of about 20 million galaxies',
      ],
    },
  },

  wfi_detector: {
    layer: 'inner',
    view: [-1, 0.3, 0.6],
    actions: ['light'],
    tr: {
      name: 'Dedektör Mozaiği',
      sub: '18 kızılötesi dedektör · −183 °C',
      desc: 'Işığın yolculuğunun sona erdiği yüzey: 6 × 3 düzeninde, hafif bir yay çizecek şekilde dizilmiş 18 kızılötesi dedektör. Her biri 4096 × 4096 piksellik bir H4RG-10 algılayıcıdır. Kızılötesinde aletin kendi ısısı gürültü yaratmasın diye yaklaşık −183 °C’ye (90 K) kadar pasif olarak soğutulur.',
      facts: [
        'Her dedektör ≈ 16,8 megapiksel; piksel boyutu 10 mikron',
        'Cıva-kadmiyum-tellür (HgCdTe) yarı iletken; Teledyne üretimi',
        'Bir piksel gökyüzünde 0,11 yay saniyesine karşılık gelir',
        'Yay biçimli dizilim, odak düzleminin en keskin bölgesini izler',
      ],
      specs: [['Dedektör', '18 × H4RG-10'], ['Piksel', '4096 × 4096'], ['Sıcaklık', '≈ −183 °C'], ['Malzeme', 'HgCdTe']],
    },
    en: {
      name: 'Detector Mosaic',
      sub: '18 infrared detectors · −183 °C',
      desc: 'Where the light’s journey ends: 18 infrared detectors in a 6 × 3 layout, arranged in a gentle arc. Each one is a 4096 × 4096-pixel H4RG-10 sensor. They are passively cooled to about −183 °C (90 K) so the instrument’s own heat doesn’t add noise in the infrared.',
      facts: [
        'Each detector is ≈ 16.8 megapixels with 10-micron pixels',
        'Mercury cadmium telluride (HgCdTe) semiconductor made by Teledyne',
        'One pixel covers 0.11 arcseconds of sky',
        'The arc-shaped layout follows the sharpest region of the focal plane',
      ],
      specs: [['Detectors', '18 × H4RG-10'], ['Pixels', '4096 × 4096'], ['Temperature', '≈ −183 °C'], ['Material', 'HgCdTe']],
    },
  },

  cgi: {
    layer: 'outer',
    view: [0.3, -0.42, -1],
    actions: ['inside', 'light'],
    tr: {
      name: 'Koronagraf Aleti (CGI)',
      sub: 'Teknoloji gösterimi · ötegezegen görüntüleme',
      desc: "Bir yıldızın göz kamaştırıcı ışığını bastırarak yanındaki çok sönük gezegenleri ve toz diskleri doğrudan görüntülemeyi amaçlayan alet. Yıldızlar gezegenlerinden milyonlarca, hatta milyarlarca kat parlaktır; koronagraf maskeler ve şekil değiştirebilen aynalarla bu ışığı söndürür. Gelecekte Dünya benzeri gezegenleri arayacak teleskopların teknolojisini uzayda ilk kez dener.",
      facts: [
        'Gereksinim: yıldızından 10 milyon kat sönük bir gezegeni algılamak; tasarım 100 milyon katı aşmayı hedefliyor',
        'Uzayda aktif dalga cephesi kontrolü yapan ilk koronagraf',
        'JPL tarafından üretildi; küçük bir kuyruklu piyano boyutunda (en geniş yeri ≈ 1,7 m)',
        'İlk ışığını 22 Eylül 2026’da Büyük Macellan Bulutu’ndaki sönük bir yıldızla aldı',
        'Işık yolunda sarı renkle gösterilir',
      ],
      specs: [['Kontrast hedefi', '≈ 10⁻⁸'], ['Deforme ayna', '2 × 2304'], ['Bantlar', '575–825 nm'], ['Kamera', 'EMCCD']],
    },
    en: {
      name: 'Coronagraph Instrument (CGI)',
      sub: 'Technology demonstration · exoplanet imaging',
      desc: 'An instrument that suppresses a star’s glare to directly image the very faint planets and dust disks around it. Stars are millions to billions of times brighter than their planets; the coronagraph blocks this light with masks and shape-shifting mirrors. It is the first in-space test of the technology future telescopes will need to search for Earth-like planets.',
      facts: [
        'Requirement: detect a planet 10 million times fainter than its star; the design aims to exceed 100 million times',
        'The first coronagraph to use active wavefront control in space',
        'Built by JPL; about the size of a baby grand piano (≈ 1.7 m at its widest)',
        'Saw first light on 22 September 2026 with a faint star in the Large Magellanic Cloud',
        'Shown in yellow in the light path',
      ],
      specs: [['Contrast goal', '≈ 10⁻⁸'], ['Deformable mirrors', '2 × 2304'], ['Bands', '575–825 nm'], ['Camera', 'EMCCD']],
    },
  },

  cgi_dms: {
    layer: 'inner',
    view: [-0.6, 0.8, -0.8],
    actions: ['light'],
    tr: {
      name: 'Deforme Edilebilir Aynalar',
      sub: '2 ayna × 2304 aktüatör',
      desc: 'Yüzeyleri 48 × 48 = 2304 minik piston (aktüatör) ile nanometre altı hassasiyetle şekillendirilebilen iki ayna. Teleskop optiklerindeki küçük kusurların ve titreşimlerin bozduğu ışık dalgasını düzelterek görüntüde yıldız ışığından arındırılmış bir "karanlık delik" açarlar. İki aynanın farklı düzlemlerde durması hem genlik hem faz hatalarını düzeltmeyi mümkün kılar.',
      facts: [
        'Her ayna 48 × 48 aktüatörlü',
        'Hızlı yönlendirme aynasıyla birlikte çalışır',
        'Bir saç telinin kalınlığının on binde birinden küçük şekil değişikliklerini kontrol eder',
      ],
    },
    en: {
      name: 'Deformable Mirrors',
      sub: '2 mirrors × 2,304 actuators',
      desc: 'Two mirrors whose surfaces can be reshaped with sub-nanometer precision by 48 × 48 = 2,304 tiny pistons (actuators). They correct the light wave distorted by tiny flaws in the telescope optics and by vibrations, opening a “dark hole” in the image that is cleared of starlight. Because the two mirrors sit in different planes, they can correct both amplitude and phase errors.',
      facts: [
        'Each mirror has 48 × 48 actuators',
        'Works together with a fast steering mirror',
        'Controls shape changes smaller than a ten-thousandth of the width of a human hair',
      ],
    },
  },

  cgi_bench: {
    layer: 'inner',
    view: [0.3, 0.9, -0.7],
    tr: {
      name: 'Koronagraf Optik Tezgâhı',
      sub: 'Maskeler, filtreler ve EMCCD kamera',
      desc: 'Maskelerin, merceklerin, filtrelerin ve kameraların üzerine monte edildiği sert plaka. Işık, deforme edilebilir aynalardan sonra yıldızı kapatan odak düzlemi maskesine ve kırınım halkalarını kesen Lyot durdurucusuna gider; en sonda tek tek fotonları sayabilen düşük gürültülü EMCCD kameraya ulaşır.',
      facts: [
        'EMCCD kameralar 1024 × 1024 piksel; ESA katkısı (Teledyne e2v)',
        'Gözlem bantları: 575, 660, 730 ve 825 nm',
        'İlk 18 aylık işletmede yaklaşık 3 aylık koronagraf gözlemi planlanıyor',
      ],
    },
    en: {
      name: 'Coronagraph Optical Bench',
      sub: 'Masks, filters and EMCCD camera',
      desc: 'A rigid plate carrying the masks, lenses, filters and cameras. After the deformable mirrors, light reaches a focal-plane mask that blocks the star and a Lyot stop that cuts away diffraction rings, and finally a low-noise EMCCD camera that can count individual photons.',
      facts: [
        'The EMCCD cameras are 1024 × 1024 pixels, contributed by ESA (Teledyne e2v)',
        'Observing bands: 575, 660, 730 and 825 nm',
        'About three months of coronagraph observations are planned within the first 18 months of operations',
      ],
    },
  },

  sass: {
    layer: 'outer',
    view: [0.15, 1, 0.55],
    actions: ['deploy'],
    tr: {
      name: 'Güneş Paneli Kalkanı (SASS)',
      sub: '6 panel · ≈ 4,1 kW elektrik · aynı zamanda güneşlik',
      desc: "Gözlemevinin Güneş'e bakan yüzünü kaplayan, 3 × 2 düzeninde altı güneş paneli. Hem tüm elektriği üretir hem de bir kalkan gibi davranarak teleskobu ve aletleri Güneş'in ışığından ve ısısından korur. Ortadaki iki panel dış tüpe cıvatalıdır; kenarlardaki dört panel fırlatma sırasında tüpün yanlarına katlıydı ve yörüngede yaylarla açıldı.",
      facts: [
        'Her panel yaklaşık 2,1 m × 3 m; toplam 3.902 güneş hücresi',
        'Gözlemevine yaklaşık 4.100 watt güç sağlar',
        'Açılma, fırlatmadan 1 saat 23 dakika sonra doğrulandı (30 Ağustos 2026)',
        'Teleskop Güneş’e göre 54° ile 126° arasında yönlendirilir; böylece kalkan hep Güneş tarafında kalır',
      ],
      specs: [['Panel', '6 (2 sabit, 4 açılır)'], ['Güneş hücresi', '3.902'], ['Güç', '≈ 4,1 kW'], ['Panel boyutu', '≈ 2,1 × 3 m']],
    },
    en: {
      name: 'Solar Array Sun Shield (SASS)',
      sub: '6 panels · ≈ 4.1 kW of power · also a sunshade',
      desc: 'Six solar panels in a 3 × 2 layout covering the Sun-facing side of the observatory. They generate all of its electricity and also act as a shield, protecting the telescope and instruments from sunlight and heat. The two central panels are bolted to the outer barrel; the four outer panels were folded against the sides of the barrel for launch and sprang open in orbit.',
      facts: [
        'Each panel is about 2.1 m × 3 m; 3,902 solar cells in total',
        'Supplies about 4,100 watts to the observatory',
        'Deployment was confirmed 1 hour 23 minutes after launch (30 August 2026)',
        'The telescope points between 54° and 126° from the Sun, so the shield always stays on the Sun side',
      ],
      specs: [['Panels', '6 (2 fixed, 4 deployable)'], ['Solar cells', '3,902'], ['Power', '≈ 4.1 kW'], ['Panel size', '≈ 2.1 × 3 m']],
    },
  },

  liss: {
    layer: 'outer',
    view: [0.6, 1, 0.6],
    actions: ['deploy'],
    tr: {
      name: 'Alt Alet Güneşliği (LISS)',
      sub: 'Gövdeyi ve aletleri gölgeler',
      desc: 'Gövdenin Güneş tarafında, dış güneş paneli sütunlarının hizasında duran iki gümüş renkli kanat. Üzerlerinde güneş hücresi yoktur; görevleri gölge sağlamaktır. Fırlatmada katlıydılar ve güneş panelleriyle birlikte açıldılar.',
      facts: [
        'Her kanat yaklaşık 2,1 m × 2,1 m ve 7,6 cm kalınlığında',
        'İki kanat arasında bir boşluk vardır',
        'Güneş panelleriyle aynı anda açıldıkları doğrulandı',
      ],
    },
    en: {
      name: 'Lower Instrument Sun Shade (LISS)',
      sub: 'Shades the bus and instruments',
      desc: 'Two silver flaps on the Sun-facing side of the bus, lined up with the outer solar panel columns. They carry no solar cells — their job is to provide shade. They were folded for launch and opened together with the solar panels.',
      facts: [
        'Each flap is about 2.1 m × 2.1 m and 7.6 cm thick',
        'There is a gap between the two flaps',
        'Their deployment was confirmed together with the solar panels',
      ],
    },
  },

  bus: {
    layer: 'outer',
    view: [0.75, 0.35, 0.85],
    actions: ['inside'],
    tr: {
      name: 'Uzay Aracı Gövdesi',
      sub: 'Güç, yönelim, itki ve iletişim',
      desc: "Gözlemevinin yaşam destek ünitesi. Altıgen alüminyum gövde güneş panellerinden gelen elektriği dağıtır, teleskobu hedefe çevirir, yörüngeyi korur ve verileri Dünya'ya gönderir. Altı elektronik bölmesinin kapakları aynı zamanda ısıyı uzaya atan radyatörlerdir. Yakıt tanklarını ve tepki tekerleklerini görmek için \"İçini gör\" modunu açın.",
      facts: [
        'NASA Goddard’da üretildi; çerçevesi yaklaşık 4,3 × 3,7 × 2 m ve 1.600 kg',
        'Gözlemevinin yakıtsız kütlesi yaklaşık 8 ton',
        'Birincil görev 5 yıl; isabetli fırlatma sayesinde yakıt en az 22 yıla yetebilir',
        'Uzayda yakıt ikmali yapılabilecek şekilde tasarlandı',
      ],
      specs: [['Kuru kütle', '≈ 8 t'], ['Güç', '≈ 4,1 kW'], ['Biçim', 'Altıgen'], ['Görev', '5 yıl +']],
    },
    en: {
      name: 'Spacecraft Bus',
      sub: 'Power, pointing, propulsion and communications',
      desc: 'The observatory’s life-support unit. The hexagonal aluminum bus distributes power from the solar panels, points the telescope, maintains the orbit and sends data to Earth. The doors of its six electronics bays double as radiators that shed heat into space. Turn on “Look inside” to see the propellant tanks and reaction wheels.',
      facts: [
        'Built at NASA Goddard; its frame is about 4.3 × 3.7 × 2 m and 1,600 kg',
        'The observatory’s dry mass is about 8 metric tons',
        'The primary mission is 5 years; thanks to a precise launch, propellant could last at least 22 years',
        'Designed so that it could be refueled in space',
      ],
      specs: [['Dry mass', '≈ 8 t'], ['Power', '≈ 4.1 kW'], ['Shape', 'Hexagonal'], ['Mission', '5 years +']],
    },
  },

  bus_tanks: {
    layer: 'inner',
    view: [0.8, 0.6, 0.8],
    tr: {
      name: 'Yakıt Tankları',
      sub: 'Hidrazin',
      desc: "Gövdenin ortasındaki silindirin içinde duran hidrazin tankları. Küçük iticiler bu yakıtla L2 çevresindeki yörüngeyi korur ve tepki tekerleklerinde biriken açısal momentumu boşaltır. L2'ye vardıktan sonra yaklaşık her 28 günde bir küçük bir düzeltme ateşlemesi yapılacak.",
      facts: [
        'Fırlatmada yaklaşık 290 galon (≈ 1.100 litre) hidrazin yüklendi',
        '31 Ağustos 2026’daki ilk rota düzeltmesi yalnızca ≈ 18 kg yakıt harcadı',
        'Hidrazin tek bileşenli bir yakıttır: katalizöre değince kendiliğinden ayrışıp itki üretir',
      ],
    },
    en: {
      name: 'Propellant Tanks',
      sub: 'Hydrazine',
      desc: 'Hydrazine tanks inside the central cylinder of the bus. Small thrusters use this propellant to maintain the orbit around L2 and to unload angular momentum that builds up in the reaction wheels. After arriving at L2, a small correction burn is planned about every 28 days.',
      facts: [
        'About 290 gallons (≈ 1,100 liters) of hydrazine were loaded for launch',
        'The first course correction on 31 August 2026 used only ≈ 18 kg of propellant',
        'Hydrazine is a monopropellant: it decomposes on contact with a catalyst to produce thrust',
      ],
    },
  },

  bus_wheels: {
    layer: 'inner',
    view: [0.9, 0.7, 0.5],
    tr: {
      name: 'Tepki Tekerlekleri',
      sub: 'Yakıt harcamadan yönelim',
      desc: 'Hızla dönen ağır diskler. Bir tekerleğin dönüş hızı değiştiğinde teleskop ters yönde döner; böylece yakıt harcamadan hedeften hedefe çevrilir ve poz sırasında son derece sabit tutulur. Roman’da piramit düzeninde altı tekerlek vardır ve titreşim aynalara ulaşmasın diye yalıtıcılar üzerine monte edilmiştir.',
      facts: [
        'Piramit düzeninde 6 tekerlek',
        'Yönelim testlerinde derecenin 1/100.000’inden daha iyi kararlılık ölçüldü',
        'Yıldız izleyiciler ve jiroskopla birlikte çalışır; en ince ayar WFI dedektörlerindeki kılavuz yıldızlarla yapılır',
      ],
    },
    en: {
      name: 'Reaction Wheels',
      sub: 'Pointing without propellant',
      desc: 'Heavy, fast-spinning disks. When a wheel speeds up or slows down, the telescope turns the opposite way, so it can slew from target to target without using propellant and hold extremely still during exposures. Roman has six wheels in a pyramid arrangement, mounted on isolators so their vibration doesn’t reach the mirrors.',
      facts: [
        'Six wheels in a pyramid arrangement',
        'Pointing tests measured stability better than 1/100,000 of a degree',
        'Works with the star trackers and gyroscope; the finest corrections use guide stars on the WFI detectors',
      ],
    },
  },

  antenna: {
    layer: 'outer',
    view: [0.8, 0.7, 0.6],
    actions: ['deploy'],
    tr: {
      name: 'Yüksek Kazançlı Anten',
      sub: 'Ka bandı · saniyede 500 megabit',
      desc: "Gövdenin alt ucundaki iletişim modülünden açılan bir kol üzerindeki 1,7 metrelik yönlendirilebilir çanak. Geniş Alan Aleti'nin ürettiği devasa veriyi Ka bandında Dünya'ya indirir: günde yaklaşık 1,4 terabayt. Bu, Roman'ı NASA'nın en çok veri üreten astrofizik görevlerinden biri yapar.",
      facts: [
        'Karbon kompozit çanak: 1,7 m, 10,9 kg; iki eksende yönlendirilebilir',
        'Bilim verisi Ka bandında (26 GHz) en fazla 500 Mbit/s; komutlar S bandında',
        'Yer istasyonları: White Sands (ABD), New Norcia (Avustralya, ESA) ve Misasa (Japonya, JAXA)',
        '5 yılda yaklaşık 20 petabayt veri bekleniyor',
        '31 Ağustos 2026’da açıldı',
      ],
      specs: [['Çap', '1,7 m'], ['Hız', '500 Mbit/s'], ['Günlük veri', '≈ 1,4 TB'], ['Bant', 'Ka (26 GHz)']],
    },
    en: {
      name: 'High-Gain Antenna',
      sub: 'Ka band · 500 megabits per second',
      desc: 'A steerable 1.7-meter dish on a boom that swings out from the communications module at the bottom of the bus. It downlinks the enormous data volume from the Wide Field Instrument to Earth in the Ka band — about 1.4 terabytes per day — making Roman one of NASA’s most data-rich astrophysics missions.',
      facts: [
        'Carbon-composite dish: 1.7 m, 10.9 kg, steerable in two axes',
        'Science data in the Ka band (26 GHz) at up to 500 Mbit/s; commands in the S band',
        'Ground stations: White Sands (USA), New Norcia (Australia, ESA) and Misasa (Japan, JAXA)',
        'About 20 petabytes of data are expected over five years',
        'Deployed on 31 August 2026',
      ],
      specs: [['Diameter', '1.7 m'], ['Data rate', '500 Mbit/s'], ['Daily data', '≈ 1.4 TB'], ['Band', 'Ka (26 GHz)']],
    },
  },
};

/** Parça listesinde ve etiketlerde gösterilen sıra numarası (1'den başlar). */
export function partNumber(id) {
  return PART_ORDER.indexOf(id) + 1;
}

export function groupOf(id) {
  return GROUPS.find((g) => g.parts.includes(id))?.id;
}
