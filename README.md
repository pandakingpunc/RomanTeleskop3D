# Roman Uzay Teleskobu 3D

Nancy Grace Roman Uzay Teleskobu'nun tarayıcıda çalışan, interaktif 3D modeli.
Tek bir HTML dosyasından oluşur; kurulum ya da derleme gerektirmez.

**Canlı demo:** https://pandakingpunc.github.io/RomanTeleskop3D/

## Özellikler

- Fare ile döndürme, yakınlaştırma ve kaydırma (OrbitControls)
- Parçaların üstüne gelince isim, tıklayınca ayrıntı paneli
- Kaydırıcı ile modeli parçalarına ayırma ("patlatma") animasyonu
- "İçeri göz at" modu ile tüpün içindeki optikleri görme
- Adım adım anlatılan ışık yolu animasyonu (nasıl çalışır?)
- Boyut ölçüleri ve L2 yörüngesi açıklaması
- Türkçe / İngilizce arayüz

## Çalıştırma

Dosyayı doğrudan tarayıcıda açmanız yeterli:

```
index.html
```

3D kütüphanesi (three.js 0.160) jsDelivr CDN'den yüklenir, bu yüzden internet bağlantısı gerekir.
Arayüz metinleri CDN'den bağımsız olarak yüklenir.

## GitHub Pages ile yayınlama

1. Depoyu GitHub'a gönderin.
2. **Settings → Pages** bölümünde *Source* olarak **Deploy from a branch**, branch olarak **main / (root)** seçin.
3. Birkaç dakika içinde site `https://<kullanici-adi>.github.io/<depo-adi>/` adresinde yayında olur.

## Teknolojiler

- [three.js](https://threejs.org/) 0.160 (ES module, importmap ile)
- Saf HTML / CSS / JavaScript, bağımlılık yöneticisi yok

## Kaynak ve notlar

Model, kamuya açık NASA görsel ve teknik açıklamalarına dayanarak eğitim amaçlı, şematik olarak modellenmiştir; birebir mühendislik modeli değildir.

## Lisans

[MIT](LICENSE)

---

## English

An interactive, browser-based 3D model of the Nancy Grace Roman Space Telescope, built as a single HTML file with three.js.
Open `index.html` in a browser (internet connection required for the three.js CDN). Turkish and English UI included. Licensed under MIT.
