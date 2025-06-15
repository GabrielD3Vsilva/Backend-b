const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente'); 

router.get('/', async (req, res, next) => {
    try {
        const clientes = await Cliente.find();
        res.json(clientes);
    } catch (err) {
        next(err); 
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { nome, email, telefone, telefoneSecundario = null } = req.body;
        const novoCliente = new Cliente({ nome, email, telefone, telefoneSecundario });
        const clienteSalvo = await novoCliente.save();
        res.status(201).json(clienteSalvo);
    } catch (err) {
        next(err); 
    }
});

module.exports = router;