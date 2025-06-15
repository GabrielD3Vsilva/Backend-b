const request = require('supertest');
const express = require('express');
const Cliente = require('../models/Cliente');
const clienteRoutes = require('../routes/clienteRoutes');

jest.mock('../models/Cliente');

const app = express();
app.use(express.json());
app.use('/clientes', clienteRoutes);

describe('Cliente Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /clientes', () => {
    it('deve retornar todos os clientes', async () => {
      const mockClientes = [{ 
        nome: 'Cliente 1', 
        email: 'cliente1@teste.com',
        telefone: '123456789',
        telefoneSecundario: null
      }];
      Cliente.find.mockResolvedValue(mockClientes);

      const response = await request(app).get('/clientes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockClientes);
    });
  });

  describe('POST /clientes', () => {
    it('deve criar um novo cliente', async () => {
      const novoCliente = {
        nome: 'Novo Cliente',
        email: 'novo@teste.com',
        telefone: '123456789',
        telefoneSecundario: null
      };
      
      const mockSave = {
        ...novoCliente,
        save: jest.fn().mockResolvedValue(novoCliente)
      };
      
      Cliente.mockImplementation(() => mockSave);

      const response = await request(app)
        .post('/clientes')
        .send(novoCliente);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(novoCliente);
    });
  });
});