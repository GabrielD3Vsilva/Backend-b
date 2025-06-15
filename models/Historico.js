const mongoose = require('mongoose');

const historicoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  dataAtendimento: { type: Date, required: true },
  dataCheckout: { type: Date, required: true },
  servicosRealizados: [{
    servico: { type: mongoose.Schema.Types.ObjectId, ref: 'Servico' },
    executor: { type: String, required: true }
  }],
  valorTotal: { type: Number, required: true },
  observacoes: { type: Object },
  petshop: String
}, { timestamps: true });

module.exports = mongoose.model('Historico', historicoSchema);