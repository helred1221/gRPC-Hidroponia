import { loadPackageDefinition, Server, ServerCredentials, status, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { retornaValorRandom } from './utils';


const bancadaDefs = loadSync('./protos/bancada.proto');
const bancadaProto = loadPackageDefinition(bancadaDefs) as any;

const bancadaServer = new Server();

bancadaServer.addService(bancadaProto.BancadaService.service, {
  GetDados: (_: any, callback: any) => {
    callback(null, {
      id: 1,
      temperatura: retornaValorRandom(18, 26),
      umidade: retornaValorRandom(60, 90),
      condutividade: retornaValorRandom(1.2, 2.5)
    });
  }
});

bancadaServer.bindAsync('0.0.0.0:50051', ServerCredentials.createInsecure(), () => {
  console.log('Bancada 1 rodando em 0.0.0.0:50051');
});