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

// Rota para atualizar um serviço existente
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco } = req.body;
        
        const servicoAtualizado = await Servico.findByIdAndUpdate(
            id,
            { nome, descricao, preco },
            { new: true } // Retorna o documento atualizado
        );
        
        if (!servicoAtualizado) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        
        res.json(servicoAtualizado);
    } catch (err) {
        next(err);
    }
});

// Rota para deletar um serviço
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const servicoDeletado = await Servico.findByIdAndDelete(id);
        
        if (!servicoDeletado) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        
        res.json({ message: 'Serviço deletado com sucesso' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;