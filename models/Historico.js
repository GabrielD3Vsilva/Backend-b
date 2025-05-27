const mongoose = require('mongoose');

const HistoricoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  dataAtendimento: { type: Date, required: true },
  dataCheckout: { type: Date, default: Date.now },
  servicosRealizados: [{
    servico: { type: mongoose.Schema.Types.ObjectId, ref: 'Servico' },
    executor: { type: String }
  }],
  valorTotal: { type: Number, required: true },
  observacoes: { type: Object }
});

module.exports = mongoose.model('Historico', HistoricoSchema);