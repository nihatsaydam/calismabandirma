# Keepsty Admin Panel

Bu uygulama, Keepsty Room Service uygulamasının otel bazlı yönetim panelidir. Her otel için ayrı bir instance çalıştırılarak, otel menülerini ve içeriklerini yönetmek için kullanılır.

## Özellikler

- **Otel Bazlı Yönetim**: Her otelin kendi menü ve içeriklerini yönetmesi
- **Menü Yönetimi**: Kategoriler ve ürünleri ekleme, düzenleme ve silme
- **Çoklu Dil Desteği**: Türkçe, İngilizce, Fransızca ve Arapça dil desteği
- **Google Cloud App Engine Entegrasyonu**: Kolay deploy ve yönetim

## Kurulum

### Yerel Geliştirme Ortamı

1. Gerekli NPM paketlerini yükleyin:
   ```bash
   npm install
   ```

2. `config.json` dosyasını düzenleyerek otel bilgilerini ayarlayın:
   ```json
   {
     "hotelId": "otel-adi",
     "hotelName": "Otel Adı",
     "adminUsername": "admin",
     "adminPassword": "sifre"
   }
   ```

3. Uygulamayı başlatın:
   ```bash
   npm start
   ```

4. Tarayıcınızda `http://localhost:3000` adresini açın.

### Google Cloud App Engine'e Deploy Etme

1. Google Cloud SDK'yı yükleyin ve yapılandırın.

2. `deploy.sh` dosyasını düzenleyerek GCP proje ID'nizi belirtin:
   ```bash
   # YOUR_GCP_PROJECT_ID yazan yeri kendi proje ID'niz ile değiştirin
   ```

3. Deploy scriptini çalıştırın:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. Script çalıştığında otel ID'sine göre bir App Engine servisi oluşturulacak ve deploy edilecektir.

## Dosya Yapısı

- `server.js`: Express sunucusu ve API endpoint'leri
- `config.json`: Otel yapılandırma dosyası
- `public/`: Statik web dosyaları (HTML, CSS, JS)
- `data/`: Menü ve çeviri dosyaları
  - `hotels/`: Otel bazlı menü dosyaları
    - `{hotel-id}/`: Her otel için ayrı klasör
      - `menu_{lang}.json`: Dillere göre menü dosyaları

## API Kullanımı

### Menü Alma

```
GET /api/menu/{dil}
```

Örnek:
```
GET /api/menu/tr
```

### Menü Güncelleme

```
POST /api/menu/{dil}
Content-Type: application/json

{
  "menu": [...]
}
```

## Güvenlik

Bu uygulama, doğrudan internete açık olmamalıdır. Google Cloud IAP (Identity-Aware Proxy) veya benzeri bir güvenlik katmanı ekleyerek koruma sağlamanız önerilir.

## Lisans

Bu yazılım, Keepsty Solutions'a özeldir ve izin olmadan kullanılamaz, dağıtılamaz veya değiştirilemez. 