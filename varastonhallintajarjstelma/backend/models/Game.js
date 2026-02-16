const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  nimi: { type: String, required: true },
  alusta: { type: String, required: true },
  laskennallinen_ostohinta: { type: Number, default: 0 },
  myyntihinta_tavoite: { type: Number },
  kuva_url: { type: String }, // Tallennetaan tiedoston nimi tähän
  market_prices: {
    pricecharting: { type: String, default: "0.00" },
    vpd: { type: String, default: "0.00" },
    retrogametycoon: { type: String, default: "0.00" },
    ebay_avg: { type: String, default: "0.00" }
  },
  muokkauspvm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', gameSchema);