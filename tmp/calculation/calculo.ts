import { loadPackageDefinition, Server, ServerCredentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { calcularMedia, calcularMediana } from './utils';
import { producer } from "../kafka/config";

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
  try {
    await producer.connect();
    console.log('Producer conectado para publicar cálculos');

    setInterval(async () => {
      try {
        if (dados.length > 0) {
          const temperaturas = dados.map(d => d.temperatura);
          const umidades = dados.map(d => d.umidade);
          const condutividades = dados.map(d => d.condutividade);

          const resultado = {
            media: {
              temperatura: calcularMedia(temperaturas),
              umidade: calcularMedia(umidades),
              condutividade: calcularMedia(condutividades),
            },
            mediana: {
              temperatura: calcularMediana(temperaturas),
              umidade: calcularMediana(umidades),
              condutividade: calcularMediana(condutividades),
            }
          };

          await producer.send({
            topic: 'Calculados',
            messages: [{
              key: 'Cálculo',
              value: JSON.stringify(resultado),
            }]
          });

          console.log('Cálculos enviados:', resultado);
        } else {
          await producer.send({
            topic: 'Calculados',
            messages: [{
              key: 'Cálculo',
              value: JSON.stringify('Não há dados para calcular'),
            }]
          });

          console.log('Nenhum dado para calcular');
        }
      } catch (err) {
        console.error('Erro ao enviar cálculo:', err);
      }
    }, 5000);
  } catch (err) {
    console.error('Erro ao conectar producer:', err);
  }
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