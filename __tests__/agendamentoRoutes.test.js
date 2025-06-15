const request = require('supertest');
const express = require('express');
const Agendamento = require('../models/Agendamento');
const agendamentoRoutes = require('../routes/agendamentoRoutes');

jest.mock('../models/Agendamento');

const app = express();
app.use(express.json());
app.use('/agendamentos', agendamentoRoutes);

describe('Agendamento Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /agendamentos', () => {
    it('deve retornar todos os agendamentos', async () => {
      const mockDate = new Date('2025-06-14T21:35:46.975Z');
      const mockAgendamentos = [{
        clienteId: '1', 
        petId: '1', 
        dataHora: mockDate.toISOString(),
        servicos: [],
        petshop: null
      }];
      
      Agendamento.find.mockResolvedValue(mockAgendamentos);

      const response = await request(app).get('/agendamentos');
      
      expect(response.status).toBe(200);
      expect(response.body[0].dataHora).toBe(mockDate.toISOString());
      expect(Agendamento.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /agendamentos', () => {
    it('deve criar um novo agendamento', async () => {
      const novoAgendamento = { 
        clienteId: '1', 
        petId: '1', 
        dataHora: new Date().toISOString(),
        servicos: [],
        petshop: null
      };
      
      const mockSave = {
        ...novoAgendamento,
        save: jest.fn().mockResolvedValue(novoAgendamento)
      };
      
      Agendamento.mockImplementation(() => mockSave);

      const response = await request(app)
        .post('/agendamentos')
        .send(novoAgendamento);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        clienteId: '1',
        petId: '1',
        dataHora: expect.any(String)
      });
    });
  });

  describe('PUT /agendamentos/:id', () => {
    it('deve atualizar um agendamento existente', async () => {
      const agendamentoAtualizado = { _id: '1', dataHora: new Date().toISOString() };
      Agendamento.findByIdAndUpdate.mockResolvedValue(agendamentoAtualizado);

      const response = await request(app)
        .put('/agendamentos/1')
        .send({ dataHora: agendamentoAtualizado.dataHora });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(agendamentoAtualizado);
    });

    it('deve retornar 404 se agendamento não existir', async () => {
      Agendamento.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put('/agendamentos/999')
        .send({ dataHora: new Date().toISOString() });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /agendamentos/:id', () => {
    it('deve deletar um agendamento existente', async () => {
      const agendamentoRemovido = { _id: '1' };
      Agendamento.findByIdAndDelete.mockResolvedValue(agendamentoRemovido);

      const response = await request(app).delete('/agendamentos/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ mensagem: 'Agendamento excluído com sucesso' });
    });

    it('deve retornar 404 se agendamento não existir', async () => {
      Agendamento.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app).delete('/agendamentos/999');

      expect(response.status).toBe(404);
    });
  });
});