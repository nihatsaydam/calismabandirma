const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Konfigürasyon dosyasını yükle
let hotelConfig = { hotelId: 'demo-hotel' };
try {
  if (fs.existsSync(path.join(__dirname, 'config.json'))) {
    const configData = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8');
    hotelConfig = JSON.parse(configData);
    console.log('Otel yapılandırması yüklendi:', hotelConfig);
  } else {
    console.log('config.json bulunamadı, varsayılan demo-hotel kullanılıyor');
    
    // Varsayılan config.json dosyasını oluştur
    const defaultConfig = { 
      hotelId: 'demo-hotel',
      hotelName: 'Demo Hotel',
      adminUsername: 'admin',
      adminPassword: 'admin'
    };
    fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(defaultConfig, null, 2), 'utf8');
    console.log('Varsayılan config.json dosyası oluşturuldu');
  }
} catch (error) {
  console.error('Konfigürasyon yüklenirken hata oluştu:', error);
}

// Çalışma dizinini göster
console.log('Çalışma dizini:', process.cwd());
console.log('__dirname:', __dirname);

// CORS ayarları
app.use(cors());

// Gerekli dizinlerin ve dosyaların varlığını kontrol et ve oluştur
function ensureDirectoriesAndFiles() {
  const dataDir = path.join(__dirname, 'data');
  const hotelsDir = path.join(dataDir, 'hotels');
  const hotelsFile = path.join(dataDir, 'hotels.json');
  const translationsFile = path.join(__dirname, 'translations.json');
  
  // data dizini yoksa oluştur
  if (!fs.existsSync(dataDir)) {
    console.log('data/ dizini oluşturuluyor...');
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // hotels dizini yoksa oluştur
  if (!fs.existsSync(hotelsDir)) {
    console.log('data/hotels/ dizini oluşturuluyor...');
    fs.mkdirSync(hotelsDir, { recursive: true });
  }
  
  // Oteller listesi dosyası yoksa oluştur
  if (!fs.existsSync(hotelsFile)) {
    console.log('hotels.json oluşturuluyor...');
    const defaultHotels = {
      hotels: [
        {
          id: hotelConfig.hotelId || "demo-hotel",
          name: hotelConfig.hotelName || "Demo Hotel",
          active: true
        }
      ]
    };
    fs.writeFileSync(hotelsFile, JSON.stringify(defaultHotels, null, 2), 'utf8');
  }
  
  // Varsayılan otel için menü dosyaları oluştur
  const languages = ['tr', 'en', 'fr', 'ar'];
  const defaultHotelId = hotelConfig.hotelId || "demo-hotel";
  const hotelDir = path.join(hotelsDir, defaultHotelId);
  
  if (!fs.existsSync(hotelDir)) {
    fs.mkdirSync(hotelDir, { recursive: true });
  }
  
  languages.forEach(lang => {
    const menuFile = path.join(hotelDir, `menu_${lang}.json`);
    if (!fs.existsSync(menuFile)) {
      console.log(`${defaultHotelId} için menu_${lang}.json oluşturuluyor...`);
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
app.use(express.static(path.join(__dirname, 'public')));

// JSON verileri parse etme
app.use(bodyParser.json());

// Tüm istekleri logla
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API endpoint'lerini tanımlama

// Otel bilgisini getir
app.get('/api/hotel', (req, res) => {
  res.json({ 
    id: hotelConfig.hotelId || "demo-hotel", 
    name: hotelConfig.hotelName || "Demo Hotel" 
  });
});

// Otel listesini getir
app.get('/api/hotels', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'hotels.json');
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.status(404).json({ error: 'Hotels file not found' });
    }
  } catch (error) {
    console.error('Error reading hotels file:', error);
    res.status(500).json({ error: 'Failed to read hotels file' });
  }
});

// Yeni otel ekle
app.post('/api/hotels', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'hotels.json');
  const newHotel = req.body;
  
  if (!newHotel.id || !newHotel.name) {
    return res.status(400).json({ error: 'Hotel ID and name are required' });
  }
  
  try {
    let hotels = { hotels: [] };
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      hotels = JSON.parse(data);
    }
    
    // Otel ID'si zaten var mı kontrol et
    const existingHotelIndex = hotels.hotels.findIndex(hotel => hotel.id === newHotel.id);
    
    if (existingHotelIndex !== -1) {
      return res.status(400).json({ error: 'Hotel ID already exists' });
    }
    
    // Yeni oteli ekle
    hotels.hotels.push({
      id: newHotel.id,
      name: newHotel.name,
      active: newHotel.active !== undefined ? newHotel.active : true
    });
    
    // Otel dosyasını güncelle
    fs.writeFileSync(filePath, JSON.stringify(hotels, null, 2), 'utf8');
    
    // Otel için dizin oluştur
    const hotelDir = path.join(__dirname, 'data', 'hotels', newHotel.id);
    if (!fs.existsSync(hotelDir)) {
      fs.mkdirSync(hotelDir, { recursive: true });
    }
    
    // Varsayılan menü dosyalarını oluştur
    const languages = ['tr', 'en', 'fr', 'ar'];
    languages.forEach(lang => {
      const menuFile = path.join(hotelDir, `menu_${lang}.json`);
      if (!fs.existsSync(menuFile)) {
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
    
    res.status(201).json({ success: true, hotel: newHotel });
  } catch (error) {
    console.error('Error adding hotel:', error);
    res.status(500).json({ error: 'Failed to add hotel' });
  }
});

// Otel bilgilerini güncelle
app.put('/api/hotels/:hotelId', (req, res) => {
  const hotelId = req.params.hotelId;
  const updatedHotel = req.body;
  const filePath = path.join(__dirname, 'data', 'hotels.json');
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const hotels = JSON.parse(data);
      
      const hotelIndex = hotels.hotels.findIndex(hotel => hotel.id === hotelId);
      
      if (hotelIndex === -1) {
        return res.status(404).json({ error: 'Hotel not found' });
      }
      
      // Oteli güncelle
      hotels.hotels[hotelIndex] = {
        ...hotels.hotels[hotelIndex],
        ...updatedHotel,
        id: hotelId // ID değişikliğine izin verme
      };
      
      // Dosyayı kaydet
      fs.writeFileSync(filePath, JSON.stringify(hotels, null, 2), 'utf8');
      
      res.json({ success: true, hotel: hotels.hotels[hotelIndex] });
    } else {
      res.status(404).json({ error: 'Hotels file not found' });
    }
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
});

// Otel sil
app.delete('/api/hotels/:hotelId', (req, res) => {
  const hotelId = req.params.hotelId;
  const filePath = path.join(__dirname, 'data', 'hotels.json');
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const hotels = JSON.parse(data);
      
      const hotelIndex = hotels.hotels.findIndex(hotel => hotel.id === hotelId);
      
      if (hotelIndex === -1) {
        return res.status(404).json({ error: 'Hotel not found' });
      }
      
      // Oteli listeden çıkar
      hotels.hotels.splice(hotelIndex, 1);
      
      // Dosyayı kaydet
      fs.writeFileSync(filePath, JSON.stringify(hotels, null, 2), 'utf8');
      
      res.json({ success: true, message: `Hotel ${hotelId} deleted successfully` });
    } else {
      res.status(404).json({ error: 'Hotels file not found' });
    }
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
});

// Belirli bir otelin menüsünü yükleme
app.get('/api/hotels/:hotelId/menu/:lang', (req, res) => {
  const hotelId = req.params.hotelId;
  const lang = req.params.lang;
  const filePath = path.join(__dirname, 'data', 'hotels', hotelId, `menu_${lang}.json`);
  
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
      
      // Otel dizini kontrol et ve yoksa oluştur
      const hotelDir = path.join(__dirname, 'data', 'hotels', hotelId);
      if (!fs.existsSync(hotelDir)) {
        fs.mkdirSync(hotelDir, { recursive: true });
      }
      
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

// Belirli bir otelin menüsünü güncelleme
app.post('/api/hotels/:hotelId/menu/:lang', (req, res) => {
  const hotelId = req.params.hotelId;
  const lang = req.params.lang;
  const filePath = path.join(__dirname, 'data', 'hotels', hotelId, `menu_${lang}.json`);
  const data = req.body;
  
  console.log('Menü güncelleme dosya yolu:', filePath);
  
  try {
    // Otel dizini kontrol et ve yoksa oluştur
    const hotelDir = path.join(__dirname, 'data', 'hotels', hotelId);
    if (!fs.existsSync(hotelDir)) {
      fs.mkdirSync(hotelDir, { recursive: true });
    }
    
    // JSON verisini string'e dönüştürme (pretty-print için)
    const jsonData = JSON.stringify(data, null, 2);
    
    // Dosyaya yazma
    fs.writeFileSync(filePath, jsonData, 'utf8');
    res.json({ success: true, message: `${hotelId} için menu_${lang}.json başarıyla güncellendi` });
  } catch (error) {
    console.error('Error writing menu file:', error);
    res.status(500).json({ error: 'Failed to write menu file' });
  }
});

// Kolay erişim için konfigürasyon dosyasındaki otel ID'sine yönlendirme
app.get('/api/menu/:lang', (req, res) => {
  const lang = req.params.lang;
  const hotelId = hotelConfig.hotelId || 'demo-hotel';
  const filePath = path.join(__dirname, 'data', 'hotels', hotelId, `menu_${lang}.json`);
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.status(404).json({ error: 'Menu file not found' });
    }
  } catch (error) {
    console.error('Error reading menu file:', error);
    res.status(500).json({ error: 'Failed to read menu file' });
  }
});

app.post('/api/menu/:lang', (req, res) => {
  const lang = req.params.lang;
  const hotelId = hotelConfig.hotelId || 'demo-hotel';
  const filePath = path.join(__dirname, 'data', 'hotels', hotelId, `menu_${lang}.json`);
  const data = req.body;
  
  try {
    const hotelDir = path.join(__dirname, 'data', 'hotels', hotelId);
    if (!fs.existsSync(hotelDir)) {
      fs.mkdirSync(hotelDir, { recursive: true });
    }
    
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData, 'utf8');
    res.json({ success: true, message: `menu_${lang}.json updated successfully` });
  } catch (error) {
    console.error('Error writing menu file:', error);
    res.status(500).json({ error: 'Failed to write menu file' });
  }
});

// Çeviri dosyasını yükleme
app.get('/api/translations', (req, res) => {
  const filePath = path.join(__dirname, 'translations.json');
  
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
  const filePath = path.join(__dirname, 'translations.json');
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

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Sunucuyu başlatma
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}`);
}); 