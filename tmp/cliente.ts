import { loadPackageDefinition, Server, ServerCredentials, status, sendUnaryData, ServerUnaryCall, credentials} from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import readline from 'readline-sync';


const calculoDefs = loadSync('./protos/calculo.proto');
const calculoProto = loadPackageDefinition(calculoDefs) as any;

const bancadaDefs = loadSync('./protos/bancada.proto');
const bancadaProto = loadPackageDefinition(bancadaDefs) as any;


const calculoClient = new calculoProto.CalculoService(
  'localhost:50053',
  credentials.createInsecure()
);

async function buscarBancada() {
  const ip = readline.question('IP da bancada (ex: localhost): ');
  const porta = readline.questionInt('Porta da bancada (ex: 50051): ');

  const client = new bancadaProto.BancadaService(
    `${ip}:${porta}`,
    credentials.createInsecure()
  );

  return new Promise((resolve) => {
    client.GetDados({}, (err: any, response: any) => {
      if (err) {
        console.error('Erro:', err.message);
        return resolve(false);
      }
      
      calculoClient.AdicionarDados(response, (err: any) => {
        
        console.log('\nDados coletados:');
        console.log(`- ID: ${response.id}`);
        console.log(`- Temperatura: ${response.temperatura.toFixed(2)}°C`);
        console.log(`- Umidade: ${response.umidade.toFixed(2)}%`);
        console.log(`- Condutividade: ${response.condutividade.toFixed(2)}`);
        resolve(true);
      });
    });
  });
}

async function exibirEstatisticas() {
  return new Promise((resolve) => {
    calculoClient.CalcularEstatisticas({}, (err: any, response: any) => {
      if (err) {
        console.error('Erro:', err.message);
        return resolve(false);
      }
      console.log(response)

      console.log('\n=== ESTATÍSTICAS ===');
      console.log('Temperatura:');
      console.log(`  Média: ${response.mediaTemperatura.toFixed(2)}°C`);
      console.log(`  Mediana: ${response.medianaTemperatura.toFixed(2)}°C`);
      
      console.log('\nUmidade:');
      console.log(`  Média: ${response.mediaUmidade.toFixed(2)}%`);
      console.log(`  Mediana: ${response.medianaUmidade.toFixed(2)}%`);
      
      console.log('\nCondutividade:');
      console.log(`  Média: ${response.mediaCondutividade.toFixed(2)}`);
      console.log(`  Mediana: ${response.medianaCondutividade.toFixed(2)}`);
      
      resolve(true);
    });
  });
}

async function main() {
  while (true) {
    console.log('\n=== MENU ===');
    console.log('1 - Coletar dados de bancada');
    console.log('2 - Ver estatísticas');
    console.log('3 - Limpar dados');
    console.log('0 - Sair');
    
    const opcao = readline.questionInt('Opção: ');

    switch (opcao) {
      case 1:
        await buscarBancada();
        break;
      case 2:
        await exibirEstatisticas();
        break;
      case 3:
        calculoClient.LimparDados({}, () => {
          console.log('Dados limpos com sucesso!');
        });
        break;
      case 0:
        process.exit();
    }
  }
}

main();