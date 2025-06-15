const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const PetshopSchema = new mongoose.Schema({
    nomePetshop: {
        type: String,
        required: true
    },
    nomeAdm: {
        type: String,
        required: true
    },
    endereco: {
        type: String,
        required: true 
    },
    telefone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    },
  
});

PetshopSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Petshop', PetshopSchema)