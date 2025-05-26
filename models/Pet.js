const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    nome: { type: String, required: true },
    raca: String,
    dataNascimento: Date,
    peso: Number
});

module.exports = mongoose.model('Pet', petSchema);