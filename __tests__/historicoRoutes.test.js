const request = require('supertest');
const express = require('express');
const Historico = require('../models/Historico');
const historicoRoutes = require('../routes/historicoRoutes');

jest.mock('../models/Historico');

const app = express();
app.use(express.json());
app.use('/historico', historicoRoutes);

describe('Historico Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /historico', () => {
    it('deve retornar o histórico com populate', async () => {
      const mockDate = new Date('2025-06-14T23:06:38.670Z');
      const mockHistorico = [{
        _id: '1',
        cliente: { nome: 'Cliente Teste', telefone: '123456789' },
        pet: { nome: 'Pet Teste', raca: 'Raça Teste' },
        servicosRealizados: [{
          servico: { nome: 'Banho', preco: 50 }
        }],
        dataCheckout: mockDate
      }];

      Historico.find.mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockHistorico)
      }));

      const response = await request(app).get('/historico');

      expect(response.status).toBe(200);
      expect(response.body[0]).toMatchObject({
        _id: '1',
        cliente: { nome: 'Cliente Teste', telefone: '123456789' },
        pet: { nome: 'Pet Teste', raca: 'Raça Teste' },
        servicosRealizados: [{
          servico: { nome: 'Banho', preco: 50 }
        }]
      });
      expect(new Date(response.body[0].dataCheckout)).toEqual(mockDate);
      expect(Historico.find).toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando falhar', async () => {
      Historico.find.mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Erro no banco'))
      }));

      const response = await request(app).get('/historico');

      expect(response.status).toBe(500);
    });
  });
});