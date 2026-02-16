const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Game = require('../models/Game');

// GET: Hae kaikki erät
router.get('/all', async (req, res) => {
  try {
    const batchet = await Batch.find().sort({ ostopvm: -1 });
    res.json(batchet);
  } catch (err) {
    res.status(500).json({ virhe: err.message });
  }
});

// POST: Luo uusi erä
router.post('/add', async (req, res) => {
  try {
    const uusiEra = new Batch(req.body);
    const tallennettu = await uusiEra.save();
    res.status(201).json(tallennettu);
  } catch (err) {
    res.status(400).json({ virhe: err.message });
  }
});

// DELETE: Poista erä ja kaikki siihen kuuluvat pelit
router.delete('/:id', async (req, res) => {
  try {
    await Game.deleteMany({ batch_id: req.params.id });
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ viesti: "Erä ja sen pelit poistettu" });
  } catch (err) {
    res.status(500).json({ virhe: err.message });
  }
});

module.exports = router;