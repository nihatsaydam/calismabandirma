const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Çalışma dizinini göster
console.log('Çalışma dizini:', process.cwd());
console.log('__dirname:', __dirname);

// Gerekli dizinlerin ve dosyaların varlığını kontrol et ve oluştur
function ensureDirectoriesAndFiles() {
  const dataDir = path.join(__dirname, '..', 'data');
  const translationsFile = path.join(__dirname, '..', 'translations.json');
  
  // data dizini yoksa oluştur
  if (!fs.existsSync(dataDir)) {
    console.log('data/ dizini oluşturuluyor...');
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Varsayılan menü dosyaları oluştur
  const languages = ['tr', 'en', 'fr', 'ar'];
  
  languages.forEach(lang => {
    const menuFile = path.join(dataDir, `menu_${lang}.json`);
    if (!fs.existsSync(menuFile)) {
      console.log(`menu_${lang}.json oluşturuluyor...`);
      const defaultMenu = {
        menu: [
          {
            key: "ornek-kategori",
            name: lang === 'tr' ? 'Örnek Kategori' : 'Example Category',
            image: "",
            items: [
              {
                name: lang === 'tr' ? 'Örnek Ürün' : 'Example Product',
                price: "100 TL"
              }
            ]
          }
        ]
      };
      fs.writeFileSync(menuFile, JSON.stringify(defaultMenu, null, 2), 'utf8');
    }
  });
  
  // translations.json yoksa oluştur
  if (!fs.existsSync(translationsFile)) {
    console.log('translations.json oluşturuluyor...');
    const defaultTranslations = {
      "en": {
        "time_period_prompt": "Select the time period of the service that you want.",
        "select_language": "Select Your Language",
        "keepsty_title": "Keepsty",
        "roomservice_subtitle": "RoomService",
        "tagline": "Keep Your Stay, Keep Your Care",
        "home": "Home",
        "cart": "Cart",
        "chat": "Chat",
        "back": "Back",
        "accept": "Accept",
        "reject": "Reject"
      },
      "tr": {
        "time_period_prompt": "İstediğiniz hizmet süresini seçin.",
        "select_language": "Dilinizi Seçin",
        "keepsty_title": "Keepsty",
        "roomservice_subtitle": "Oda Servisi",
        "tagline": "Konaklamanı Koru, Bakımını Koru",
        "home": "Ana Sayfa",
        "cart": "Sepet",
        "chat": "Sohbet",
        "back": "Geri",
        "accept": "Kabul Et",
        "reject": "Reddet"
      },
      "fr": {
        "time_period_prompt": "Sélectionnez la période de temps pour le service que vous souhaitez.",
        "select_language": "Choisissez Votre Langue",
        "keepsty_title": "Keepsty",
        "roomservice_subtitle": "Service de Chambre",
        "tagline": "Gardez Votre Séjour, Gardez Vos Soins",
        "home": "Accueil",
        "cart": "Panier",
        "chat": "Chat",
        "back": "Retour",
        "accept": "Accepter",
        "reject": "Refuser"
      },
      "ar": {
        "time_period_prompt": "اختر الفترة الزمنية للخدمة التي تريدها.",
        "select_language": "اختر لغتك",
        "keepsty_title": "Keepsty",
        "roomservice_subtitle": "خدمة الغرف",
        "tagline": "حافظ على إقامتك، حافظ على رعايتك",
        "home": "الرئيسية",
        "cart": "السلة",
        "chat": "دردشة",
        "back": "رجوع",
        "accept": "قبول",
        "reject": "رفض"
      }
    };
    fs.writeFileSync(translationsFile, JSON.stringify(defaultTranslations, null, 2), 'utf8');
  }
  
  console.log('Gerekli dizin ve dosyalar hazır!');
}

// Başlangıçta gerekli dosyaları kontrol et ve oluştur
ensureDirectoriesAndFiles();

// Statik dosyaları sunma (CSS, JS, vb.)
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname)));

// JSON verileri parse etme
app.use(bodyParser.json());

// Tüm istekleri logla
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API endpoint'lerini tanımlama
// Menü dosyasını yükleme
app.get('/api/menu/:lang', (req, res) => {
  const lang = req.params.lang;
  const filePath = path.join(__dirname, '..', 'data', `menu_${lang}.json`);
  
  console.log('Menü dosyası yolu:', filePath);
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      console.error(`Dosya bulunamadı: ${filePath}`);
      
      // Dosya bulunamadıysa varsayılan bir menü oluştur
      const defaultMenu = {
        menu: [
          {
            key: "ornek-kategori",
            name: lang === 'tr' ? 'Örnek Kategori' : 'Example Category',
            image: "",
            items: [
              {
                name: lang === 'tr' ? 'Örnek Ürün' : 'Example Product',
                price: "100 TL"
              }
            ]
          }
        ]
      };
      
      // Dosyayı kaydet
      fs.writeFileSync(filePath, JSON.stringify(defaultMenu, null, 2), 'utf8');
      
      // Varsayılan menüyü döndür
      res.json(defaultMenu);
    }
  } catch (error) {
    console.error('Error reading menu file:', error);
    res.status(500).json({ error: 'Failed to read menu file' });
  }
});

// Menü dosyasını güncelleme
app.post('/api/menu/:lang', (req, res) => {
  const lang = req.params.lang;
  const filePath = path.join(__dirname, '..', 'data', `menu_${lang}.json`);
  const data = req.body;
  
  console.log('Menü güncelleme dosya yolu:', filePath);
  
  try {
    // Data dizini kontrol et ve yoksa oluştur
    const dataDir = path.dirname(filePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // JSON verisini string'e dönüştürme (pretty-print için)
    const jsonData = JSON.stringify(data, null, 2);
    
    // Dosyaya yazma
    fs.writeFileSync(filePath, jsonData, 'utf8');
    res.json({ success: true, message: `menu_${lang}.json updated successfully` });
  } catch (error) {
    console.error('Error writing menu file:', error);
    res.status(500).json({ error: 'Failed to write menu file' });
  }
});

// Çeviri dosyasını yükleme
app.get('/api/translations', (req, res) => {
  const filePath = path.join(__dirname, '..', 'translations.json');
  
  console.log('Çeviri dosyası yolu:', filePath);
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      console.error(`Dosya bulunamadı: ${filePath}`);
      
      // Varsayılan çeviri dosyası oluştur
      const defaultTranslations = {
        "en": {
          "time_period_prompt": "Select the time period of the service that you want.",
          "select_language": "Select Your Language",
          "keepsty_title": "Keepsty",
          "roomservice_subtitle": "RoomService",
          "tagline": "Keep Your Stay, Keep Your Care",
          "home": "Home",
          "cart": "Cart",
          "chat": "Chat",
          "back": "Back",
          "accept": "Accept",
          "reject": "Reject"
        },
        "tr": {
          "time_period_prompt": "İstediğiniz hizmet süresini seçin.",
          "select_language": "Dilinizi Seçin",
          "keepsty_title": "Keepsty",
          "roomservice_subtitle": "Oda Servisi",
          "tagline": "Konaklamanı Koru, Bakımını Koru",
          "home": "Ana Sayfa",
          "cart": "Sepet",
          "chat": "Sohbet",
          "back": "Geri",
          "accept": "Kabul Et",
          "reject": "Reddet"
        },
        "fr": {
          "time_period_prompt": "Sélectionnez la période de temps pour le service que vous souhaitez.",
          "select_language": "Choisissez Votre Langue",
          "keepsty_title": "Keepsty",
          "roomservice_subtitle": "Service de Chambre",
          "tagline": "Gardez Votre Séjour, Gardez Vos Soins",
          "home": "Accueil",
          "cart": "Panier",
          "chat": "Chat",
          "back": "Retour",
          "accept": "Accepter",
          "reject": "Refuser"
        },
        "ar": {
          "time_period_prompt": "اختر الفترة الزمنية للخدمة التي تريدها.",
          "select_language": "اختر لغتك",
          "keepsty_title": "Keepsty",
          "roomservice_subtitle": "خدمة الغرف",
          "tagline": "حافظ على إقامتك، حافظ على رعايتك",
          "home": "الرئيسية",
          "cart": "السلة",
          "chat": "دردشة",
          "back": "رجوع",
          "accept": "قبول",
          "reject": "رفض"
        }
      };
      
      // Dosyayı kaydet
      fs.writeFileSync(filePath, JSON.stringify(defaultTranslations, null, 2), 'utf8');
      
      // Varsayılan çevirileri döndür
      res.json(defaultTranslations);
    }
  } catch (error) {
    console.error('Error reading translations file:', error);
    res.status(500).json({ error: 'Failed to read translations file' });
  }
});

// Çeviri dosyasını güncelleme
app.post('/api/translations', (req, res) => {
  const filePath = path.join(__dirname, '..', 'translations.json');
  const data = req.body;
  
  console.log('Çeviri güncelleme dosya yolu:', filePath);
  
  try {
    // JSON verisini string'e dönüştürme (pretty-print için)
    const jsonData = JSON.stringify(data, null, 2);
    
    // Dosyaya yazma
    fs.writeFileSync(filePath, jsonData, 'utf8');
    res.json({ success: true, message: 'Translations updated successfully' });
  } catch (error) {
    console.error('Error writing translations file:', error);
    res.status(500).json({ error: 'Failed to write translations file' });
  }
});

// Admin paneli ana sayfasını sunma
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin paneline yönlendirme
app.get('/admin', (req, res) => {
  res.redirect('/admin/');
});

app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Sunucuyu başlatma
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin/`);
  
  // Dosyaların varlığını kontrol et
  const translationsPath = path.join(__dirname, '..', 'translations.json');
  console.log('Çeviri dosyası var mı?', fs.existsSync(translationsPath));
  
  const menuTrPath = path.join(__dirname, '..', 'data', 'menu_tr.json');
  console.log('Türkçe menü dosyası var mı?', fs.existsSync(menuTrPath));
}); 