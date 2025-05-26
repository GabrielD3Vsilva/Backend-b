const express = require('express');
const router = express.Router();
const Historico = require('../models/Historico'); // Importa o modelo Historico

// Rota para histórico (GET simples)
router.get('/', async (req, res, next) => {
    try {
        const historico = await Historico.find()
            .populate('cliente', 'nome telefone')
            .populate('pet', 'nome raca')
            .populate('servicosRealizados.servico', 'nome preco')
            .sort({ dataCheckout: -1 });

        res.json(historico);
    } catch (err) {
        next(err);
    }
});

module.exports = router;