const express = require('express');
const router = express.Router();
const CheckIn = require('../models/CheckIn');
const Historico = require('../models/Historico');
const Servico = require('../models/Servico');

// POST - Criar check-in (com imagens em Base64)
router.post('/', async (req, res, next) => {
  try {
    const { clienteId, petId, dataCheckIn, infoVisual, fotos } = req.body;

    // Validação básica
    if (!clienteId || !petId || !dataCheckIn) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Garante que 'fotos' seja um array de strings Base64
    const fotosBase64 = Array.isArray(fotos) ? fotos : [];

    const novoCheckIn = new CheckIn({
      clienteId,
      petId,
      dataCheckIn,
      infoVisual: typeof infoVisual === 'string' ? JSON.parse(infoVisual) : infoVisual,
      fotos: fotosBase64
    });

    await novoCheckIn.save();
    res.status(201).json(novoCheckIn);

  } catch (err) {
    next(err);
  }
});

// GET - Listar todos os check-ins
router.get('/', async (req, res, next) => {
  try {
    const checkins = await CheckIn.find()
      .sort({ dataCheckIn: -1 })
      .populate('clienteId', 'nome telefone')
      .populate('petId', 'nome raca')
      .populate('servicos', 'nome preco');
    res.json(checkins);
  } catch (err) {
    next(err);
  }
});

// PUT - Finalizar check-out
router.put('/:id/checkout', async (req, res, next) => {
  try {
    const { servicos } = req.body;

    const checkIn = await CheckIn.findById(req.params.id)
      .populate('clienteId')
      .populate('petId');

    if (!checkIn) {
      return res.status(404).json({ error: 'Check-in não encontrado' });
    }

    // Calcula valor total e mapeia serviços
    const servicosRealizados = await Servico.find({
      _id: { $in: servicos.map(s => s.servicoId) }
    });

    const valorTotal = servicosRealizados.reduce((total, servico) => total + servico.preco, 0);

    const servicosComExecutores = servicosRealizados.map(servico => {
      const servicoInfo = servicos.find(s => s.servicoId.toString() === servico._id.toString());
      return {
        servico: servico._id,
        executor: servicoInfo?.executor || 'Não especificado'
      };
    });

    // Cria histórico
    const historicoAtendimento = new Historico({
      cliente: checkIn.clienteId._id,
      pet: checkIn.petId._id,
      dataAtendimento: checkIn.dataCheckIn,
      dataCheckout: new Date(),
      servicosRealizados: servicosComExecutores,
      valorTotal,
      observacoes: checkIn.infoVisual
    });

    await historicoAtendimento.save();
    await CheckIn.findByIdAndDelete(req.params.id);

    // Retorna histórico populado
    const historicoPopulado = await Historico.findById(historicoAtendimento._id)
      .populate('cliente', 'nome telefone')
      .populate('pet', 'nome raca')
      .populate('servicosRealizados.servico', 'nome preco');

    res.json({
      mensagem: 'Checkout realizado com sucesso',
      historico: historicoPopulado
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;