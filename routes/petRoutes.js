const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet'); 


router.get('/cliente/:clienteId', async (req, res, next) => {
    try {
        const pets = await Pet.find({ clienteId: req.params.clienteId });
        res.json(pets);
    } catch (err) {
        next(err);
    }
});


router.post('/', async (req, res, next) => {
    try {
        const { clienteId, nome, raca, dataNascimento, peso } = req.body;
        const novoPet = new Pet({ clienteId, nome, raca, dataNascimento, peso });
        await novoPet.save();
        res.status(201).json(novoPet);
    } catch (err) {
        next(err);
    }
});


router.get('/', async (req, res, next) => {
    try {
        const ids = req.query.ids?.split(',') || [];
        
        if (ids.length === 0) {
            const allPets = await Pet.find();
            return res.json(allPets);
        }
        const pets = await Pet.find({ _id: { $in: ids } });
        res.json(pets);
    } catch (err) {
        next(err);
    }
});


module.exports = router;