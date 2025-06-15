const express = require('express');
const router = express.Router();
const Servico = require('../models/Servico'); 
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.get('/', authenticateToken, authorizeRoles('admin', 'gerent', 'executor', 'client'), async (req, res, next) => {
    try {
        const servicos = await Servico.find();
        res.json(servicos);
    } catch (err) {
        
        console.error('Erro ao listar serviços:', err); 
        res.status(500).json({ message: 'Erro interno do servidor ao listar serviços.' });
    }
});


router.post('/', authenticateToken, authorizeRoles('admin', 'gerent', 'executor', 'client'), async (req, res, next) => {
    try {
        const { nome, preco, descricao, categoria } = req.body;
        const novoServico = new Servico({ nome, preco, descricao, categoria });
        await novoServico.save();
        res.status(201).json(novoServico);
    } catch (err) {
        console.error('Erro ao criar serviço:', err); 
        if (err.name === 'ValidationError') { 
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao criar serviço.' });
    }
});


router.put('/:id', authenticateToken, authorizeRoles('admin', 'gerent', 'executor', 'client'), async (req, res, next) => {
    const { id } = req.params; 
    const { nome, preco, descricao, categoria } = req.body; 

    console.log(`Recebida requisição PUT para serviço ID: ${id}`); 
    console.log('Corpo da requisição (dados de atualização):', req.body); 

    try {
        const servicoAtualizado = await Servico.findByIdAndUpdate(
            id,
            { nome, preco, descricao, categoria },
            { new: true, runValidators: true } 
        );

        if (!servicoAtualizado) {
            console.warn(`Serviço com ID ${id} não encontrado para atualização.`);
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }
        res.json(servicoAtualizado);
    } catch (err) {
        console.error(`Erro ao atualizar serviço ID ${id}:`, err); 
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'ID de serviço inválido.' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
});


router.delete('/:id', authenticateToken, authorizeRoles('admin', 'gerent', 'executor', 'client'), async (req, res, next) => {
    const { id } = req.params; 

    console.log(`Recebida requisição DELETE para serviço ID: ${id}`); 

    try {
        const servicoDeletado = await Servico.findByIdAndDelete(id);

        if (!servicoDeletado) {
            console.warn(`Serviço com ID ${id} não encontrado para exclusão.`);
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }
        res.status(200).json({ message: 'Serviço deletado com sucesso!' });
    } catch (err) {
        console.error(`Erro ao deletar serviço ID ${id}:`, err); 
        if (err.name === 'CastError') { 
            return res.status(400).json({ message: 'ID de serviço inválido.' });
        }
        next(err);
    }
});

module.exports = router;