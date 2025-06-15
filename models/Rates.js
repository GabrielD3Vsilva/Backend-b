const mongoose = require('mongoose');

const ratesSchema = new mongoose.Schema(
    {
        petshop: String,
        client: String,
        rate: Number,
        description: String
    }
)

module.exports = mongoose.model('Rates', ratesSchema);