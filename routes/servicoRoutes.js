const express = require('express');
const router = express.Router();
const Servico = require('../models/Servico'); // Importa o modelo Servico

// Rota para listar todos os serviços
router.get('/', async (req, res, next) => {
    try {
        const servicos = await Servico.find();
        res.json(servicos);
    } catch (err) {
        next(err);
    }
});

// Rota para criar um novo serviço
router.post('/', async (req, res, next) => {
    try {
        const { nome, preco, descricao, categoria } = req.body;
        const novoServico = new Servico({ nome, preco, descricao, categoria });
        await novoServico.save();
        res.status(201).json(novoServico);
    } catch (err) {
        next(err);
    }
});

module.exports = router;