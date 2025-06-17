import { loadPackageDefinition, Server, ServerCredentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { calcularMedia, calcularMediana } from './utils';
import { createProducer } from '../kafka/config';

interface DadoBancada {
  id: number;
  temperatura: number;
  umidade: number;
  condutividade: number;
}

let dados: DadoBancada[] = [];

const calculoDefs = loadSync('./protos/calculo.proto');
const calculoProto = loadPackageDefinition(calculoDefs) as any;

const calculoServer = new Server();

async function run() {
  const calculos = await createProducer();

  setInterval(async () => {
    try {
      await calculos.send({
        topic: 'Calculados',
        messages: [{
          key: 'Cálculo',
          value: JSON.stringify(dados.length > 0 ? { dados } : { mensagem: 'Não há dados para calcular' })
        }]
      });
      console.log(dados.length > 0 
        ? 'Servidor de cálculos publicou dados' 
        : 'Não há dados para calcular');
    } catch(err) {
      console.error('Erro na publicação de dados:', err);
    }
  }, 5000);
}

calculoServer.addService(calculoProto.CalculoService.service, {
  AdicionarDados: (call: any, callback: any) => {
    try {
      dados.push({
        id: call.request.id,
        temperatura: call.request.temperatura,
        umidade: call.request.umidade,
        condutividade: call.request.condutividade
      });
      callback(null, { mensagem: 'Dado adicionado' });
    } catch (error) {
      callback({
        code: 500,
        message: 'Erro ao adicionar dado'
      });
    }
  },

  CalcularEstatisticas: (_: any, callback: any) => {
    try {
      const stats = {
        mediaTemperatura: calcularMedia(dados.map(d => d.temperatura)),
        medianaTemperatura: calcularMediana(dados.map(d => d.temperatura)),
        mediaUmidade: calcularMedia(dados.map(d => d.umidade)),
        medianaUmidade: calcularMediana(dados.map(d => d.umidade)),
        mediaCondutividade: calcularMedia(dados.map(d => d.condutividade)),
        medianaCondutividade: calcularMediana(dados.map(d => d.condutividade))
      };

      callback(null, stats);
    } catch (error) {
      callback({
        code: 500,
        message: 'Erro ao calcular estatísticas'
      });
    }
  },

  LimparDados: (_: any, callback: any) => {
    dados = [];
    callback(null, { mensagem: 'Dados limpos com sucesso!' });
  }
});

calculoServer.bindAsync('0.0.0.0:50053', ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Erro ao iniciar servidor:', err);
    return;
  }
  console.log(`Servidor de cálculo rodando em 0.0.0.0:${port}`);
  run().catch(console.error);
});