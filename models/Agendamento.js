const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    dataHora: { type: Date, required: true },
    servicos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Servico' }],
    status: { type: String, enum: ['agendado', 'cancelado', 'finalizado'], default: 'agendado' },
    petshop: String
});

module.exports = mongoose.model('Agendamento', agendamentoSchema);