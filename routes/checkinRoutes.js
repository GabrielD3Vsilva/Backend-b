const express = require('express');
const router = express.Router();
const CheckIn = require('../models/CheckIn');
const Historico = require('../models/Historico');
const Servico = require('../models/Servico');

// Configuração para aumentar o limite de payload
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));

// POST - Criar check-in (com imagens em Base64)
router.post('/', async (req, res, next) => {
  try {
    const { clienteId, petId, dataCheckIn, infoVisual, fotos } = req.body;

    // Validação básica
    if (!clienteId || !petId) {
      return res.status(400).json({ error: 'Cliente e pet são obrigatórios' });
    }

    // Garante que 'fotos' seja um array de strings Base64 válidas
    const fotosValidas = Array.isArray(fotos) ? 
      fotos.filter(foto => typeof foto === 'string' && foto.startsWith('data:image')) : 
      [];

    // Limita a 6 fotos no máximo
    const fotosProcessadas = fotosValidas.slice(0, 6);

    const novoCheckIn = new CheckIn({
      clienteId,
      petId,
      dataCheckIn: dataCheckIn || new Date(),
      infoVisual: infoVisual || {},
      fotos: fotosProcessadas
    });

    await novoCheckIn.save();
    
    // Retorna o check-in criado sem popular referências (mais rápido)
    res.status(201).json({
      _id: novoCheckIn._id,
      clienteId: novoCheckIn.clienteId,
      petId: novoCheckIn.petId,
      dataCheckIn: novoCheckIn.dataCheckIn,
      fotosCount: novoCheckIn.fotos.length
    });

  } catch (err) {
    next(err);
  }
});

// GET - Listar todos os check-ins (com paginação)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [checkins, total] = await Promise.all([
      CheckIn.find()
        .sort({ dataCheckIn: -1 })
        .skip(skip)
        .limit(limit)
        .populate('clienteId', 'nome telefone')
        .populate('petId', 'nome raca'),
      CheckIn.countDocuments()
    ]);

    res.json({
      data: checkins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET - Obter um check-in específico
router.get('/:id', async (req, res, next) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id)
      .populate('clienteId', 'nome telefone')
      .populate('petId', 'nome raca');

    if (!checkIn) {
      return res.status(404).json({ error: 'Check-in não encontrado' });
    }

    // Para economizar banda, não retornamos as fotos completas na listagem
    const response = checkIn.toObject();
    if (response.fotos && response.fotos.length > 0) {
      response.fotos = response.fotos.map((foto, index) => ({
        id: index,
        preview: foto.substring(0, 50) + '...' // Mini preview do Base64
      }));
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// GET - Obter uma foto específica de um check-in
router.get('/:id/fotos/:fotoIndex', async (req, res, next) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id);
    
    if (!checkIn) {
      return res.status(404).json({ error: 'Check-in não encontrado' });
    }

    const fotoIndex = parseInt(req.params.fotoIndex);
    if (isNaN(fotoIndex) ){
      return res.status(400).json({ error: 'Índice de foto inválido' });
    }

    if (!checkIn.fotos || fotoIndex < 0 || fotoIndex >= checkIn.fotos.length) {
      return res.status(404).json({ error: 'Foto não encontrada' });
    }

    res.json({ foto: checkIn.fotos[fotoIndex] });
  } catch (err) {
    next(err);
  }
});

// PUT - Finalizar check-out (mantido igual)
router.put('/:id/checkout', async (req, res, next) => {
  try {
    const { servicos } = req.body;

    const checkIn = await CheckIn.findById(req.params.id)
      .populate('clienteId')
      .populate('petId');

    if (!checkIn) {
      return res.status(404).json({ error: 'Check-in não encontrado' });
    }

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