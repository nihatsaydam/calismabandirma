# Keepsty RoomService Admin Paneli

Bu admin paneli, Keepsty RoomService uygulaması için ürün yönetimini sağlayan bir yönetim arayüzüdür.

## Özellikler

- Menü yönetimi (kategori ve ürün ekleme, düzenleme, silme)
- Çoklu dil desteği (Türkçe, İngilizce, Fransızca, Arapça)
- Çeviri metinlerini düzenleme

## Kurulum

1. Node.js'i bilgisayarınıza yükleyin (https://nodejs.org/)
2. Bu dizinde aşağıdaki komutu çalıştırarak bağımlılıkları yükleyin:

```bash
npm install
```

## Başlatma

Admin panelini başlatmak için:

```bash
npm start
```

Geliştirme modunda başlatmak için:

```bash
npm run dev
```

Sunucu başladıktan sonra, tarayıcınızda `http://localhost:3000/admin/` adresini açarak admin paneline erişebilirsiniz.

## Kullanım

### Menü Yönetimi

1. Sol menüden "Menü Yönetimi" sekmesini seçin
2. Dil seçimi yapın (Türkçe, İngilizce, Fransızca, Arapça)
3. Kategorileri ve ürünleri görüntüleyin, düzenleyin veya silin

### Ürün Ekleme

1. Sol menüden "Ürün Ekle" sekmesini seçin
2. Formu doldurun:
   - Dil seçin
   - Kategori seçin veya yeni kategori ekleyin
   - Ürün adı, fiyatı ve açıklamasını (opsiyonel) girin
3. "Kaydet" butonuna tıklayın

### Dil Yönetimi

1. Sol menüden "Dil Yönetimi" sekmesini seçin
2. Düzenlemek istediğiniz dili seçin
3. Çeviri metinlerini düzenleyin
4. "Değişiklikleri Kaydet" butonuna tıklayın

## Dosya Yapısı

- `index.html`: Admin paneli ana sayfası
- `style.css`: Admin paneli stil dosyası
- `admin.js`: Admin paneli istemci tarafı JavaScript
- `server.js`: API ve dosya işlemlerini yöneten sunucu kodu
- `package.json`: Proje bağımlılıkları ve komutları 