const mongoose = require('mongoose');

const clockinSchema = mongoose.Schema(
    {
        petshopName: { type: String, required: true },
        executorName: { type: String, required: true },
        hour: { type: Date, default: Date.now }
    }
);

module.exports = mongoose.model('Clockin', clockinSchema);