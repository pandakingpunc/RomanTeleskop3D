// Adım adım anlatımlar: rehberli tur, ışık yolu ve uzayda açılış.

/**
 * Rehberli tur durakları.
 * part: vurgulanacak parça · inside: "İçini gör" açık mı · explode: patlatma oranı
 * view: kameranın parça merkezine göre yönü · distance: parça boyutuna göre uzaklık çarpanı
 * overview: tüm gözlemevini gösteren geniş açı
 */
export const TOUR = [
  {
    overview: true,
    view: [0.62, 0.42, 1],
    tr: "<b>Nancy Grace Roman Uzay Teleskobu</b>: NASA'nın karanlık enerjiyi, ötegezegenleri ve evrenin büyük ölçekli yapısını incelemek için tasarladığı geniş alan kızılötesi teleskobu. 12,7 m uzunluğunda ve 30 Ağustos 2026'da fırlatıldı.",
    en: '<b>The Nancy Grace Roman Space Telescope</b>: NASA’s wide-field infrared telescope, built to study dark energy, exoplanets and the large-scale structure of the universe. It is 12.7 m long and launched on 30 August 2026.',
  },
  {
    part: 'sass',
    tr: "Güneş tarafı: <b>altı panelli güneş kalkanı</b> yaklaşık 4,1 kW elektrik üretir ve aynı zamanda teleskobu Güneş'in ısısından koruyan bir gölgelik görevi görür.",
    en: 'The Sun side: the <b>six-panel solar array sun shield</b> generates about 4.1 kW and doubles as a sunshade protecting the telescope from the Sun’s heat.',
  },
  {
    part: 'dac',
    tr: 'Teleskobun ağzındaki <b>siperlik</b>, yandan gelen Güneş ışığının tüpe sızmasını engeller. Fırlatmada açıklığın üzerine katlıydı.',
    en: 'The <b>visor</b> at the telescope’s mouth keeps sunlight from leaking into the tube. It was folded over the opening for launch.',
  },
  {
    part: 'primary',
    inside: true,
    tr: 'İçeride: <b>2,4 metrelik birincil ayna</b> ışığı toplar. Hubble’ınkiyle aynı boyda ama dörtte birinden daha hafif.',
    en: 'Inside: the <b>2.4-meter primary mirror</b> collects the light. It is the same size as Hubble’s but less than a quarter of its weight.',
  },
  {
    part: 'secondary',
    inside: true,
    tr: '<b>İkincil ayna</b> ışığı geri, birincil aynanın ortasındaki delikten arkadaki optiklere yollar. Onu tutan altı çubuk, görüntülerdeki altı kollu yıldız izlerinin kaynağıdır.',
    en: 'The <b>secondary mirror</b> sends light back through the hole in the primary. The six struts that hold it create the six-pointed star spikes in Roman’s images.',
  },
  {
    part: 'wfi_detector',
    inside: true,
    tr: '<b>Geniş Alan Aleti</b>: 18 kızılötesi dedektörden oluşan 300 megapiksellik kamera, −183 °C’de çalışır ve tek pozda Hubble’ın kızılötesi kamerasının yaklaşık 200 katı alanı görür.',
    en: 'The <b>Wide Field Instrument</b>: a 300-megapixel camera of 18 infrared detectors, running at −183 °C and seeing about 200 times the area of Hubble’s infrared camera in one shot.',
  },
  {
    part: 'cgi',
    tr: '<b>Koronagraf</b>: yıldız ışığını maskeler ve şekil değiştiren aynalarla söndürerek yanındaki sönük gezegenleri görüntülemeye çalışır.',
    en: 'The <b>coronagraph</b> blocks starlight with masks and shape-shifting mirrors to image faint planets next to their stars.',
  },
  {
    part: 'bus',
    inside: true,
    tr: '<b>Uzay aracı gövdesi</b>: hidrazin tankları, altı tepki tekerleği ve elektronik bölmeleriyle gözlemevinin yaşam destek ünitesi.',
    en: 'The <b>spacecraft bus</b>: the observatory’s life-support unit, with hydrazine tanks, six reaction wheels and electronics bays.',
  },
  {
    part: 'antenna',
    tr: '<b>Yüksek kazançlı anten</b> günde yaklaşık 1,4 terabayt veriyi Ka bandında Dünya’ya indirir.',
    en: 'The <b>high-gain antenna</b> sends about 1.4 terabytes of data to Earth every day in the Ka band.',
  },
  {
    overview: true,
    view: [-0.55, 0.35, 1],
    explode: 0.85,
    tr: 'Hepsi bir arada: parçalara ayrılmış görünüm. Roman şimdi L2’ye yolculukta; Aralık 2026’da varması ve 2027’de bilim gözlemlerine başlaması bekleniyor.',
    en: 'All together in an exploded view. Roman is now on its way to L2, expected to arrive in December 2026 and begin science in 2027.',
  },
];

/** Işık yolu adımları; step = görünür ışın bölümü sayısı (1..5). */
export const LIGHT_STEPS = [
  {
    tr: '<b>1.</b> Yıldız ışığı, teleskobun açık ucundan paralel ışınlar hâlinde girer. Siperlik, yandan gelen Güneş ışığını dışarıda tutar.',
    en: '<b>1.</b> Starlight enters the open end of the telescope as parallel rays. The visor keeps sideways sunlight out.',
  },
  {
    tr: '<b>2.</b> 2,4 metrelik <b>birincil ayna</b> ışığı toplar ve öne, ikincil aynaya doğru odaklar.',
    en: '<b>2.</b> The 2.4-meter <b>primary mirror</b> gathers the light and focuses it forward onto the secondary mirror.',
  },
  {
    tr: '<b>3.</b> <b>İkincil ayna</b> ışığı geri, birincil aynanın ortasındaki delikten arkadaki optik modüle yollar.',
    en: '<b>3.</b> The <b>secondary mirror</b> sends the light back through the hole in the primary to the aft optics.',
  },
  {
    tr: '<b>4.</b> Üçüncül ayna görüntüyü düzeltir ve ışık ayrılır: <b>Geniş Alan Aleti (mavi)</b> ve <span class="y">koronagraf (sarı)</span>.',
    en: '<b>4.</b> The tertiary mirror corrects the image and the light splits: <b>Wide Field Instrument (blue)</b> and <span class="y">coronagraph (yellow)</span>.',
  },
  {
    tr: '<b>5.</b> WFI’de ışık filtre tekerleğinden geçip 18 dedektöre düşer. <span class="y">Koronagrafta</span> şekil değiştiren aynalar yıldız ışığını söndürür, kamera tek tek fotonları sayar.',
    en: '<b>5.</b> In the WFI, light passes the filter wheel and lands on 18 detectors. In the <span class="y">coronagraph</span>, shape-shifting mirrors cancel starlight and the camera counts single photons.',
  },
];

/** Uzayda açılış adımları; value = model açılma durumu (0 katlı … 1 açık). */
export const DEPLOY_STEPS = [
  {
    value: 0,
    tr: '<b>Fırlatma (30 Ağustos 2026):</b> Roman, Falcon Heavy’nin burun konisi içinde katlı. Güneş panelleri tüpün yanlarına, siperlik teleskobun ağzına, anten kolu gövdenin arkasına katlı.',
    en: '<b>Launch (30 August 2026):</b> Roman is folded inside the Falcon Heavy’s nose cone. The solar panels are folded against the tube, the visor over the opening and the antenna boom behind the bus.',
  },
  {
    value: 0.4,
    tr: '<b>+1 saat 23 dakika:</b> Dört dış güneş paneli ve iki alt güneşlik yaylarla açılır; gözlemevi elektrik üretmeye başlar.',
    en: '<b>+1 hour 23 minutes:</b> The four outer solar panels and the two lower sun shades spring open, and the observatory starts generating power.',
  },
  {
    value: 0.66,
    tr: '<b>31 Ağustos:</b> Yüksek kazançlı anten kolu açılır ve çanak Dünya’ya döner.',
    en: '<b>31 August:</b> The high-gain antenna boom swings out and the dish turns toward Earth.',
  },
  {
    value: 1,
    tr: '<b>1 Eylül:</b> Siperlik bir pop-up kitabın sayfası gibi kalkar. Gözlemevi artık tamamen açık; L2’ye yolculuk sürüyor.',
    en: '<b>1 September:</b> The visor rises like the page of a pop-up book. The observatory is now fully deployed and on its way to L2.',
  },
];
