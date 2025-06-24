import { loadSync } from "@grpc/proto-loader";
import { cliente } from "../kafka/config";
import { EachMessagePayload } from "kafkajs";
import { credentials, loadPackageDefinition } from "@grpc/grpc-js";

const calculoDefs = loadSync('../protos/calculo.proto');
const calculoProto = loadPackageDefinition(calculoDefs) as any;
const calculoClient = new calculoProto.CalculoService(
    'localhost:50053',
    credentials.createInsecure()
);

const consumer = (async (): Promise<void> => {
  try {
    await cliente.connect();
    await cliente.subscribe({
      topic: "bancada_1",
      fromBeginning: true,
    });

    console.clear();
    console.log("Iniciando cliente e aguardando dados");
    await cliente.run({
      eachMessage: async ({ topic, message }: EachMessagePayload): Promise<void> => {
        const mensagem = `${topic}\n[${message.key} | ${message.value}] \n${message.timestamp}`;
        console.log(`${mensagem}`);
      },
    });
  } catch (error) {
    console.error("Erro no cliente:", error);
  }
})();

async function verEstatisticas() {
    return new Promise<void>((resolve) => {
        calculoClient.CalcularEstatisticas({}, (err: any, response: any) => {
            if (err) {
                console.error('Erro ao obter estatísticas:', err.message);
                return resolve();
            }
            // 
            console.log('\n=== ESTATÍSTICAS ===');
            console.log('Temperatura:');
            console.log(`  Média: ${response.mediaTemperatura?.toFixed(2) || 'N/A'}°C`);
            console.log(`  Mediana: ${response.medianaTemperatura?.toFixed(2) || 'N/A'}°C`);
            // 
            console.log('\nUmidade:');
            console.log(`  Média: ${response.mediaUmidade?.toFixed(2) || 'N/A'}%`);
            console.log(`  Mediana: ${response.medianaUmidade?.toFixed(2) || 'N/A'}%`);
            // 
            console.log('\nCondutividade:');
            console.log(`  Média: ${response.mediaCondutividade?.toFixed(2) || 'N/A'}`);
            console.log(`  Mediana: ${response.medianaCondutividade?.toFixed(2) || 'N/A'}`);
            // 
            resolve();
        });
    });
}

export default consumer;







// import { createConsumer } from '../kafka/config';
// import { TOPICS } from '../kafka/config';
// import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
// import { loadSync } from '@grpc/proto-loader';
// import readline from 'readline-sync';
// interface DadosTemporarios {
//     temperatura?: number;
//     umidade?: number;
//     condutividade?: number;
//     lastUpdate?: Date;
// }

// const dadosTemporarios: Map<number, DadosTemporarios> = new Map();

// const calculoDefs = loadSync('./protos/calculo.proto');
// const calculoProto = loadPackageDefinition(calculoDefs) as any;
// //ip e porta do servidor de cálculo
// const calculoClient = new calculoProto.CalculoService(
//     'localhost:50053',
//     credentials.createInsecure()
// );

// const bancadasAssinadas: Set<number> = new Set();

// async function processarDadoCompleto(bancadaId: number) {
//     const dados = dadosTemporarios.get(bancadaId);
    
//     if (!dados) return;


//     const dezSegundosAtras = new Date(Date.now() - 10000);
//     if (dados.temperatura !== undefined && 
//         dados.umidade !== undefined && 
//         dados.condutividade !== undefined &&
//         dados.lastUpdate && dados.lastUpdate > dezSegundosAtras) {
        
//         console.log(`\nDados completos da bancada ${bancadaId}:`);
//         console.log(`- Temperatura: ${dados.temperatura.toFixed(2)}°C`);
//         console.log(`- Umidade: ${dados.umidade.toFixed(2)}%`);
//         console.log(`- Condutividade: ${dados.condutividade.toFixed(2)}`);

//         try {
//             await new Promise<void>((resolve, reject) => {
//                 calculoClient.AdicionarDados({
//                     id: bancadaId,
//                     temperatura: dados.temperatura,
//                     umidade: dados.umidade,
//                     condutividade: dados.condutividade
//                 }, (err: any) => {
//                     if (err) {
//                         console.error('Erro ao enviar dados:', err.message);
//                         reject(err);
//                     } else {
//                         console.log('Dados enviados para cálculo com sucesso');
//                         resolve();
//                     }
//                 });
//             });
//         } catch (err) {
//             console.error('Erro ao enviar para cálculo:', err);
//         } finally {
//             dadosTemporarios.delete(bancadaId);
//         }
//     }
// }



// async function limparDados() {
//     return new Promise<void>((resolve) => {
//         calculoClient.LimparDados({}, (err: any, response: any) => {
//             if (err) {
//                 console.error('Erro ao limpar dados:', err.message);
//             } else {
//                 console.log(response.mensagem || 'Dados limpos com sucesso!');
//             }
//             resolve();
//         });
//     });
// }

// async function main() {
//     console.log('Conectando ao broker Kafka...');
//     const consumer = await createConsumer(`cliente_${Date.now()}`);
    
//     try {
//         await consumer.subscribe({ 
//             topics: Object.values(TOPICS),
//             fromBeginning: true 
//         });

//         console.log('Iniciando consumo de mensagens...');
//         await consumer.run({
//             eachMessage: async ({ topic, message }) => {
//                 try {
//                     if (!message.value) return;
                    
//                     const data = JSON.parse(message.value.toString());
//                     const bancadaId = data.bancadaId;
                    
//                     if (!bancadasAssinadas.has(bancadaId)) return;

//                     if (!dadosTemporarios.has(bancadaId)) {
//                         dadosTemporarios.set(bancadaId, {});
//                     }

//                     const dadosBancada = dadosTemporarios.get(bancadaId)!;

//                     switch (topic) {
//                         case TOPICS.TEMPERATURA:
//                             dadosBancada.temperatura = data.valor;
//                             break;
//                         case TOPICS.UMIDADE:
//                             dadosBancada.umidade = data.valor;
//                             break;
//                         case TOPICS.CONDUTIVIDADE:
//                             dadosBancada.condutividade = data.valor;
//                             break;
//                     }

//                     dadosBancada.lastUpdate = new Date();
//                     dadosTemporarios.set(bancadaId, dadosBancada);


//                     await processarDadoCompleto(bancadaId);
//                 } catch (error) {
//                     console.error('Erro ao processar mensagem:', error);
//                 }
//             }
//         });

//         while (true) {
//             console.log('\n=== MENU CLIENTE ===');
//             console.log('1 - Assinar bancada');
//             console.log('2 - Cancelar assinatura');
//             console.log('3 - Ver estatísticas');
//             console.log('4 - Limpar dados');
//             console.log('5 - Listar bancadas assinadas');
//             console.log('0 - Sair');
            
//             const opcao = readline.question('Opção: ').trim();
            
//             switch (opcao) {
//                 case '1': {
//                     const id = readline.questionInt('ID da bancada: ');
//                     if (isNaN(id)) {
//                         console.log('ID inválido!');
//                         break;
//                     }
//                     bancadasAssinadas.add(id);
//                     console.log(`Assinando bancada ${id}`);
//                     break;
//                 }
                    
//                 case '2': {
//                     const id = readline.questionInt('ID da bancada: ');
//                     if (isNaN(id)) {
//                         console.log('ID inválido!');
//                         break;
//                     }
//                     bancadasAssinadas.delete(id);
//                     dadosTemporarios.delete(id);
//                     console.log(`Cancelando assinatura da bancada ${id}`);
//                     break;
//                 }
                    
//                 case '3':
//                     await verEstatisticas();
//                     break;
                    
//                 case '4':
//                     await limparDados();
//                     break;
                    
//                 case '5':
//                     console.log('Bancadas assinadas:', Array.from(bancadasAssinadas).join(', ') || 'Nenhuma');
//                     break;
                    
//                 case '0':
//                     await consumer.disconnect();
//                     console.log('Desconectando...');
//                     process.exit(0);
                    
//                 default:
//                     console.log('Opção inválida!');
//             }
//         }
//     } catch (error) {
//         console.error('Erro no cliente:', error);
//         await consumer.disconnect();
//         process.exit(1);
//     }
// }

// main().catch(async (error) => {
//     console.error('Erro fatal:', error);
//     process.exit(1);
// });