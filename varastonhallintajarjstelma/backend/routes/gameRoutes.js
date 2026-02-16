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

// APUFUNKTIO: Päivittää erän pelien laskennalliset ostohinnat
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

/**
 * Hae kaikki pelit ja yhdistä niihin erän nimi
 */
router.get('/all', async (req, res) => {
  try {
    const pelit = await Game.find().populate('batch_id', 'nimi');
    res.json(pelit);
  } catch (err) {
    res.status(500).json({ virhe: err.message });
  }
});

// --- 2. POST REITIT ---

/**
 * Lisää uusi peli ja laske erän hinnat uudelleen
 */
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

    // Päivitetään heti kaikkien saman erän pelien kulut
    await paivitaEranHinnat(batch_id);

    res.status(201).json(uusiPeli);
  } catch (err) {
    res.status(500).json({ virhe: err.message });
  }
});

// --- 3. PUT REITIT ---

/**
 * ERITYINEN: Päivitä markkinahinnat ulkoisista lähteistä
 * Tämä reitti on oltava ennen yleistä /:id reittiä, jotta "update-price" ei tulkita ID:ksi
 */
router.put('/update-price/:id', async (req, res) => {
  try {
    const peli = await Game.findById(req.params.id);
    if (!peli) return res.status(404).json({ virhe: "Peliä ei löytynyt" });

    // Haetaan hinnat scraperilla
    const h = await getPrices(peli.nimi, peli.alusta);

    // Päivitetään hinnat ja käytetään sovittuja kertoimia
    peli.market_prices = {
      pricecharting: (h.pricecharting * 0.92).toFixed(2),
      vpd: h.vpd.toFixed(2),
      retrogametycoon: h.retrogametycoon.toFixed(2),
      ebay_avg: (h.ebay.median * 0.92).toFixed(2)
    };
    
    peli.muokkauspvm = Date.now();
    peli.markModified('market_prices');
    await peli.save();
    res.json(peli);
  } catch (err) {
    res.status(500).json({ virhe: err.message });
  }
});

/**
 * YLEINEN: Muokkaa pelin perustietoja tai hintoja manuaalisesti
 */
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { nimi, alusta, batch_id, market_prices } = req.body;
    const peli = await Game.findById(req.params.id);
    
    if (!peli) return res.status(404).json({ virhe: "Peliä ei löytynyt" });

    const vanhaBatchId = peli.batch_id;

    // Päivitetään kentät jos ne on annettu
    peli.nimi = nimi || peli.nimi;
    peli.alusta = alusta || peli.alusta;
    peli.batch_id = batch_id || peli.batch_id;

    if (market_prices) {
      peli.market_prices = typeof market_prices === 'string' ? JSON.parse(market_prices) : market_prices;
      peli.markModified('market_prices');
    }

    if (req.file) {
      peli.kuva_url = `/uploads/${req.file.filename}`;
    }

    await peli.save();

    // Jos erä vaihtui, päivitetään molempien erien kululaskelmat
    if (vanhaBatchId.toString() !== peli.batch_id.toString()) {
      await paivitaEranHinnat(vanhaBatchId);
      await paivitaEranHinnat(peli.batch_id);
    }

    res.json(peli);
  } catch (err) {
    console.error(err);
    res.status(500).json({ virhe: "Muokkaus epäonnistui" });
  }
});

// --- 4. DELETE REITIT ---

/**
 * Poista peli ja päivitä erän jäljellä olevien pelien kulut
 */
router.delete('/:id', async (req, res) => {
  try {
    const peli = await Game.findById(req.params.id);
    if (!peli) return res.status(404).json({ virhe: "Peliä ei löytynyt" });

    const batch_id = peli.batch_id;
    await Game.findByIdAndDelete(req.params.id);
    
    // Lasketaan kulu uudelleen jäljelle jääneille peleille
    await paivitaEranHinnat(batch_id);

    res.json({ viesti: "Peli poistettu" });
  } catch (err) {
    console.error("Poistovirhe:", err);
    res.status(500).json({ virhe: "Palvelinvirhe poistossa" });
  }
});

module.exports = router;