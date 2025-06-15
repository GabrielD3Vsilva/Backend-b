const Rates = require('../models/Rates');
const routes = require('express').Router();


routes.post('/', async (req, res) => {
    const {client, petshop, description, rate} = req.body;

    const note = new Rates ({
        petshop: petshop,
        client: client,
        rate: rate,
        description: description
    });

    await note.save();
    console.log(petshop);

    return res.send('ok');
});


routes.get('/', async (req, res) => {
    const rates = await Rates.find().lean();
    console.log(rates)

    return res.json(rates);
})



module.exports = routes;