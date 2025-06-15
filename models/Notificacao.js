const mongoose = require('mongoose');


const notificacaoSchema = new mongoose.Schema(
    {
        petshop: String,
        client: String
    }
)

module.exports = mongoose.model('Notificacao', notificacaoSchema);