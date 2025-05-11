import { loadPackageDefinition, Server, ServerCredentials, status, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import {calcularMedia, calcularMediana} from './utils'
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



calculoServer.addService(calculoProto.CalculoService.service, {
  AdicionarDados: (call: any, callback: any) => {
    try {
      const novoDado = {
        id: call.request.id,
        temperatura: call.request.temperatura,
        umidade: call.request.umidade,
        condutividade: call.request.condutividade
      };
      dados.push(novoDado);
      callback(null, null);
    } catch (error) {
      callback(null, null);
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
      console.log(stats)
      callback(null, stats);
    } catch (error) {
      callback(console.log('Erro'), null);
    }
  },

  LimparDados: (_: any, callback: any) => {
    dados = [];
    callback(null, { mensagem: 'Dados limpos com sucesso!' });
  }
});



calculoServer.bindAsync('0.0.0.0:50053', ServerCredentials.createInsecure(), () => {
  console.log('Servidor de cálculo rodando em 0.0.0.0:50053');
});