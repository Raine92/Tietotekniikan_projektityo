require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const batchRoutes = require('./routes/batchRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/batches', batchRoutes); 
app.use('/api/games', gameRoutes);
app.use('/uploads', express.static('uploads'));

// Yhdistetään MongoDB:hen (Lokaali)
// Huom: varmista että MongoDB Community Server on käynnissä koneellasi
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/peli_varasto';

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB yhteys muodostettu!"))
  .catch(err => console.error("MongoDB virhe:", err));

// Testireitti
app.get('/', (req, res) => {
  res.send("Peli-inventaarion API pyörii!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Palvelin käynnissä portissa ${PORT}`);
});