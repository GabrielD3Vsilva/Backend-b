const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: String,
    telefone: String,
    telefoneSecundario: String,
    dataCadastro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cliente', clienteSchema);