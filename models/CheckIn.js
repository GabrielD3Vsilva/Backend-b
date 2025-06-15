const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
    clienteId: { type: mongoose.Schema.Types.ObjectId, required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    dataCheckIn: { type: Date, required: true },
    infoVisual: {
        corpo: String,
        patas: String,
        cabeça: String,
        cauda: String,
        olhos: String,
        boca: String
    },
    fotos: [String],
    servicos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Servico' }], // Adicionei isso pois estava no seu checkin original, embora não seja usado no checkout diretamente do checkin.
    finalizado: { type: Boolean, default: false },
    dataCheckOut: Date,
    valorTotal: Number
});

module.exports = mongoose.model('CheckIn', checkInSchema);