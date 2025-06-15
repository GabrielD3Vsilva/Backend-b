const express = require('express');
const router = express.Router();
const Agendamento = require('../models/Agendamento'); 

router.get('/', async (req, res, next) => {
    try {
        const agendamentos = await Agendamento.find();
        res.json(agendamentos);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { clienteId, petId, dataHora, servicos = [], petshop = null } = req.body;
        const novoAgendamento = new Agendamento({ clienteId, petId, dataHora, servicos, petshop });
        await novoAgendamento.save();
        res.status(201).json(novoAgendamento);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { dataHora, servicos, status } = req.body;
        const agendamentoAtualizado = await Agendamento.findByIdAndUpdate(
            req.params.id,
            { dataHora, servicos, status },
            { new: true }
        );

        if (!agendamentoAtualizado) {
            const error = new Error('Agendamento não encontrado');
            error.statusCode = 404;
            throw error;
        }

        res.json(agendamentoAtualizado);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const agendamentoRemovido = await Agendamento.findByIdAndDelete(req.params.id);
        if (!agendamentoRemovido) {
            const error = new Error('Agendamento não encontrado');
            error.statusCode = 404;
            throw error;
        }
        res.json({ mensagem: 'Agendamento excluído com sucesso' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;