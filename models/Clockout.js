const mongoose = require('mongoose');
const clockoutSchema = new mongoose.Schema({
    petshopName: String,
    executorName: String,
    hour: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Clockout', clockoutSchema);