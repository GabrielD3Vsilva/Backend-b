const express = require('express');
const router = express.Router();
const CheckIn = require('../models/CheckIn');
const Historico = require('../models/Historico');
const Servico = require('../models/Servico');
const upload = require('../utils/multerConfig'); 

router.post('/', upload.array('fotos', 6), async (req, res, next) => {
    try {
        const { clienteId, petId, dataCheckIn, infoVisual } = req.body;
        const fotosPaths = req.files?.map(file => file.path) || [];

        const novoCheckIn = new CheckIn({
            clienteId,
            petId,
            dataCheckIn,
            infoVisual: JSON.parse(infoVisual),
            fotos: fotosPaths
        });

        await novoCheckIn.save();
        res.status(201).json(novoCheckIn);
    } catch (err) {
        next(err);
    }
});


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

// Rota para checkout
router.put('/:id/checkout', async (req, res, next) => {
  try {
    const { servicos } = req.body; // Agora servicos é um array de objetos com { servicoId, executor }

    const checkIn = await CheckIn.findById(req.params.id)
      .populate('clienteId')
      .populate('petId');

    if (!checkIn) {
      const error = new Error('Check-in não encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Busca os serviços e calcula o total
    const servicosRealizados = await Servico.find({ 
      _id: { $in: servicos.map(s => s.servicoId) } 
    });
    
    const valorTotal = servicosRealizados.reduce((total, servico) => total + servico.preco, 0);

    // Mapeia os serviços com seus executores
    const servicosComExecutores = servicosRealizados.map(servico => {
      const servicoInfo = servicos.find(s => s.servicoId.toString() === servico._id.toString());
      return {
        servico: servico._id,
        executor: servicoInfo.executor
      };
    });

    const historicoAtendimento = new Historico({
      cliente: checkIn.clienteId._id,
      pet: checkIn.petId._id,
      dataAtendimento: checkIn.dataCheckIn,
      dataCheckout: new Date(),
      servicosRealizados: servicosComExecutores,
      valorTotal: valorTotal,
      observacoes: checkIn.infoVisual
    });

    await historicoAtendimento.save();
    await CheckIn.findByIdAndDelete(req.params.id);

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