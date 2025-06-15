const request = require('supertest');
const express = require('express');
const Rates = require('../models/Rates');
const ratesRoutes = require('../routes/rateRoutes');

jest.mock('../models/Rates');

const app = express();
app.use(express.json());
app.use('/rates', ratesRoutes);

describe('Rates Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /rates', () => {
    it('deve criar uma nova avaliação com sucesso', async () => {
      const mockRate = {
        _id: '123',
        petshop: 'petshop123',
        client: 'client123',
        rate: 5,
        description: 'Excelente serviço',
        save: jest.fn().mockResolvedValue(true)
      };

      Rates.mockImplementation(() => mockRate);

      const response = await request(app)
        .post('/rates')
        .send({
          client: 'client123',
          petshop: 'petshop123',
          description: 'Excelente serviço',
          rate: 5
        });

      expect(response.status).toBe(200);
      expect(response.text).toBe('ok');
      expect(mockRate.save).toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando falhar', async () => {
      const mockRate = {
        save: jest.fn().mockRejectedValue(new Error('Erro no banco'))
      };

      Rates.mockImplementation(() => mockRate);

      const response = await request(app)
        .post('/rates')
        .send({
          client: 'client123',
          petshop: 'petshop123',
          description: 'Excelente serviço',
          rate: 5
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /rates', () => {
    it('deve retornar todas as avaliações', async () => {
      const mockRates = [{
        _id: '1',
        petshop: 'petshop123',
        client: 'client123',
        rate: 5,
        description: 'Excelente serviço'
      }];

      Rates.find.mockImplementation(() => ({
        lean: jest.fn().mockResolvedValue(mockRates)
      }));

      const response = await request(app).get('/rates');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRates);
    });

    it('deve retornar erro 500 quando falhar', async () => {
      Rates.find.mockImplementation(() => ({
        lean: jest.fn().mockRejectedValue(new Error('Erro no banco'))
      }));

      const response = await request(app).get('/rates');

      expect(response.status).toBe(500);
    });
  });
});