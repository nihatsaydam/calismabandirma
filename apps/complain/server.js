const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Express uygulaması oluştur
const app = express();

// MongoDB Atlas bağlantısı
mongoose.connect('mongodb+srv://Keepsty:keepsty545434@keepsty.uvd4v.mongodb.net/myDatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

// Middleware
app.use(cors()); // CORS'u etkinleştir
app.use(express.json()); // JSON isteği işleme
app.use(express.static('public')); // Public klasöründen dosya sunma

// Bellboy Şeması (bellboy.js veya server.js içinde tanımlayabilirsiniz)
const bellboySchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  username: { type: String, required: true, default: 'Unknown' },
  request: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
});

// "Bellboy" koleksiyonunda saklamak için model oluşturuyoruz
const BellboyRequest = mongoose.model('BellboyRequest', bellboySchema, 'Bellboy');

const chatSchema = new mongoose.Schema({
  username: String, // Kullanıcı adı
  message: String,  // Mesaj içeriği
  sender: String,   // Gönderen ('user' veya 'bot')
  timestamp: { type: Date, default: Date.now }, // Zaman damgası
  conversationId: String, // Konuşmayı gruplandırmak için ID
});


const Chat = mongoose.model('Chat', chatSchema);

// API Endpoints

// Tüm konuşmaları getiren endpoint
app.get('/getChatLogs', async (req, res) => {
  try {
    const chats = await Chat.find(); // Tüm konuşmaları MongoDB'den al
    res.status(200).json(chats); // JSON formatında geri döndür
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Yeni bir mesaj kaydeden endpoint
app.post('/saveResponse', async (req, res) => {
  try {
    const chat = new Chat(req.body); // İstekten gelen veriyi model ile kaydet
    await chat.save();
    res.status(200).json({ success: true, message: 'Message saved!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Ana sayfa endpoint'i (Opsiyonel)
app.get('/', (req, res) => {
  res.send('Welcome to Keepsty Backend API!');
});

// Sunucuyu başlat
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// Görsel ve mesaj döndüren yeni bir endpoint
app.get('/endChat', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>End Chat</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          margin-top: 50px;
        }
        img {
          max-width: 300px;
          height: auto;
        }
      </style>
    </head>
    <body>
      <h1>You are all set!</h1>
      <img src="/images/your-image.png" alt="You are all set" />
    </body>
    </html>
  `);
});
// Complaint Şeması
const complaintSchema = new mongoose.Schema({
  username: { type: String, required: true },
  language: { type: String, required: true },
  message: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  timestamp: { type: Date, default: Date.now },
});

// Complaint Modeli - Üçüncü parametre ile koleksiyon adı 'complaint'
const Complaint = mongoose.model('Complain', complaintSchema, 'complain');
// Yeni bir şikayeti kaydeden endpoint
app.post('/saveComplain', async (req, res) => {
  try {
    const { username, language, message, sender } = req.body;

    // Gerekli alanların kontrolü
    if (!username || !language || !message || !sender) {
      return res.status(400).json({ success: false, message: 'Eksik alanlar mevcut.' });
    }

    const complaint = new Complaint({
      username,
      language,
      message,
      sender,
    });

    await complaint.save();
    res.status(200).json({ success: true, message: 'Complain saved successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Tüm şikayetleri getiren endpoint
app.get('/getComplainLogs', async (req, res) => {
  try {
    const complaints = await Complaint.find(); 
    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
