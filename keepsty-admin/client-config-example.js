// Keepsty RoomService Otel Yapılandırması
// Bu dosyayı kopyalayıp, hotel-config.js olarak kaydedin ve kendi otel bilgilerinizi ekleyin
// Bu dosya, main.js ve diğer istemci dosyalarında kullanılacaktır

const HOTEL_CONFIG = {
  // Otel bilgileri (admin panelindeki config.json ile aynı olmalıdır)
  hotelId: "demo-hotel",
  hotelName: "Demo Hotel",
  
  // API bağlantı bilgileri
  adminApiUrl: "https://keepsty-admin-demo-hotel-dot-YOUR_GCP_PROJECT_ID.appspot.com",
  
  // Varsayılan dil
  defaultLanguage: "tr", // tr, en, fr, ar
  
  // Tema renkleri (opsiyonel)
  theme: {
    primaryColor: "#9b795c",
    secondaryColor: "#343a40"
  }
};

// Bu yapılandırmayı dışa aktar (ES modules için)
export default HOTEL_CONFIG;

// CommonJS uyumluluğu için
if (typeof module !== 'undefined') {
  module.exports = HOTEL_CONFIG;
} 