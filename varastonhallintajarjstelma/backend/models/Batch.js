const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  nimi: { type: String, required: true },
  ostopvm: { type: Date, default: Date.now },
  ostohinta_yhteensa: { type: Number, required: true },
  tavoite_kerroin: { type: Number, default: 2.0 },
  kertynyt_myyntitulo: { type: Number, default: 0 },
  onko_tavoite_tayttynyt: { type: Boolean, default: false }
});

module.exports = mongoose.model('Batch', BatchSchema);