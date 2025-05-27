const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  dataCheckIn: { type: Date, default: Date.now },
  infoVisual: { type: Object }, // Observações gerais
  fotos: { type: [String] }, // Array de strings Base64
  servicos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Servico' }] // Serviços associados
});

module.exports = mongoose.model('CheckIn', CheckInSchema);