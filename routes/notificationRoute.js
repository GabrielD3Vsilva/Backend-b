const routes = require('express').Router();
const Notificacao = require('../models/Notificacao');

routes.get('/', async (req, res)=>{
    const all = await Notificacao.find();

    return res.send(all);
})

module.exports = routes;