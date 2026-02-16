const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Game = require('../models/Game');
const Batch = require('../models/Batch');
const { getPrices } = require('../utils/priceScraper');

// Kuvien tallennusasetukset
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage });

// APUFUNKTIO: Päivittää erän pelien hinnat
const paivitaEranHinnat = async (batch_id) => {
  const era = await Batch.findById(batch_id);
  if (!era) return;
  const pelienLkm = await Game.countDocuments({ batch_id });
  if (pelienLkm > 0) {
    const yksikkoHinta = (era.ostohinta_yhteensa / pelienLkm).toFixed(2);
    await Game.updateMany({ batch_id }, { laskennallinen_ostohinta: yksikkoHinta });
  }
};

// --- 1. GET REITIT ---

// Hae kaikki pelit (populoi erän tiedot)
router.get('/all', async (req, res) => {
  try {
    const pelit = await Game.find().populate('batch_id', 'nimi');
    res.json(pelit);
  } catch (err) {
    res.status(500).json({ virhe: err.message });
  }
});

// --- 2. POST REITIT ---

// Lisää peli ja laske erän hinnat uudelleen
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { batch_id, nimi, alusta } = req.body;
    
    const era = await Batch.findById(batch_id);
    if (!era) return res.status(404).json({ virhe: "Erää ei löytynyt" });

    const uusiPeli = new Game({
      batch_id,
      nimi,
      alusta,
      kuva_url: req.file ? `/uploads/${req.file.filename}` : null
    });

    await uusiPeli.save();

    // Päivitetään KAIKKIEN erän pelien laskennallinen ostohinta
    const pelienLkm = await Game.countDocuments({ batch_id });
    const yksikkoHinta = (era.ostohinta_yhteensa / pelienLkm).toFixed(2);
    
    await Game.updateMany({ batch_id }, { laskennallinen_ostohinta: yksikkoHinta });

    res.status(201).json(uusiPeli);
  } catch (err) {
    res.status(500).json({ virhe: err.message });
  }
});

// --- 3. PUT REITIT ---

// PUT: Muokkaa peliä
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { nimi, alusta, batch_id, market_prices } = req.body;
    const peli = await Game.findById(req.params.id);
    
    if (!peli) return res.status(404).json({ virhe: "Peliä ei löytynyt" });

    // Päivitetään perustiedot
    peli.nimi = nimi || peli.nimi;
    peli.alusta = alusta || peli.alusta;
    peli.batch_id = batch_id || peli.batch_id;

    // Jos market_prices tuli pyynnössä, päivitetään se
    if (market_prices) {
      // Huom: varmista että market_prices on objekti (jos se tulee JSONina)
      peli.market_prices = typeof market_prices === 'string' ? JSON.parse(market_prices) : market_prices;
      peli.markModified('market_prices');
    }

    if (req.file) {
      peli.kuva_url = `/uploads/${req.file.filename}`;
    }

    await peli.save();
    res.json(peli);
  } catch (err) {
    console.error(err);
    res.status(500).json({ virhe: "Muokkaus epäonnistui" });
  }
});

// --- 4. DELETE REITIT ---

// Poista peli
router.delete('/:id', async (req, res) => {
  try {
    const peli = await Game.findById(req.params.id);
    if (!peli) return res.status(404).json({ virhe: "Peliä ei löytynyt" });

    const batch_id = peli.batch_id;
    await Game.findByIdAndDelete(req.params.id);
    
    // Päivitetään muiden pelien hinnat poiston jälkeen
    await paivitaEranHinnat(batch_id);

    res.json({ viesti: "Peli poistettu" });
  } catch (err) {
    console.error("Poistovirhe:", err);
    res.status(500).json({ virhe: "Palvelinvirhe poistossa" });
  }
});

module.exports = router;