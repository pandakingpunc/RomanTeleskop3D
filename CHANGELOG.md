# Değişiklik günlüğü

## 2.0.0 — 9 Ekim 2026

Projenin baştan sona yenilendiği sürüm.

### Model ve görseller
- Gözlemevi NASA çizimleri, basın kiti ve mühendislik makalelerine göre gerçek ölçekte yeniden
  modellendi: altıgen dış tüp ve dikmeleri, açılır siperlik (DAC), 3 × 2 panelli güneş kalkanı (SASS),
  alt güneşlikler (LISS), alet taşıyıcı, arka optik modül, altıgen gövde, iletişim modülü ve açılır anten.
- İç parçalar: 2,4 m içbükey birincil ayna ve merkezi bafıl, altı çubuklu ikincil ayna taşıyıcısı,
  8 filtre, grizm ve prizmalı eleman tekerleği, kavisli 18 dedektörlü odak düzlemi, koronagrafın deforme edilebilir
  aynaları ve optik tezgâhı, hidrazin tankları, piramit düzeninde 6 tepki tekerleği.
- Prosedürel dokular: buruşuk yalıtım folyosu, güneş hücreleri, radyatörler, aktüatör ızgarası;
  yanardöner dedektör yüzeyleri.
- Gölgeler, bloom, Samanyolu arka planı, renkli yıldızlar, Güneş parlaması, hilal Dünya ve Ay.
- three.js 0.160 → 0.186.1.

### Yeni özellikler
- Kesit görünümü ("İçini gör"), 5 adımlı ışık yolu, gerçek tarihli "uzayda açılış" animasyonu,
  10 duraklı rehberli tur.
- Parça listesi, numaralı 3D etiketler, önceki/sonraki parça gezintisi, teknik değer kartları.
- Görev, görüş alanı (ölçekli SVG) ve L2 panelleri; gerçek tarihlere bağlı zaman çizelgesi.
- Boyut çizgileri ve ölçek için insan figürü.
- Paylaşılabilir bağlantılar (`#part=…`, `#tour`, `?lang=en` …), ekran görüntüsü, tam ekran,
  klavye kısayolları ve yardım penceresi.
- Telefon düzeni: alt araç çubuğu ve alttan açılan bilgi sayfaları.

### İçerik
- Tüm bilgiler Ekim 2026 itibarıyla güncellendi (ör. 30 Ağustos 2026 fırlatması, ≈ 8 t kuru kütle,
  4,1 kW güç, 300,8 MP kamera, ≈ 1,4 TB/gün veri). Önceki sürümdeki "4,2 ton", "beş güneş paneli"
  ve "en erken 2026 sonbaharı" gibi eskimiş bilgiler düzeltildi.
- Dil, tarayıcı diline göre otomatik seçilir; seçim hatırlanır.

### Altyapı
- Tek dosya, okunabilir ES modüllerine bölündü (derleme adımı yok, GitHub Pages ayarı değişmedi).
- Pil dostu, yalnızca gerektiğinde çizen döngü; cihaza göre otomatik kalite ve gerektiğinde
  kendiliğinden kalite düşürme. Aynı malzemeli sabit parçalar birleştirilerek kare başına çizim
  çağrısı yarıya indirildi; Samanyolu dokusu açılıştan sonra boşta üretiliyor.
- PWA: manifest, ikonlar ve çevrimdışı çalışma için service worker.
- Erişilebilirlik: klavye kısayolları, ekran okuyucu etiketleri, odak yönetimi, "hareketi azalt" ve
  yüksek kontrast desteği.
- Paylaşım önizlemesi (Open Graph) görseli ve meta etiketleri.
- ESLint, Playwright uçtan uca testleri (masaüstü + telefon) ve GitHub Actions CI.

## 1.0.0 — 20 Eylül 2026

- İlk sürüm: tek HTML dosyasından oluşan interaktif three.js modeli.
