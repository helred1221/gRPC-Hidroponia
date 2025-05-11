import { loadPackageDefinition, Server, ServerCredentials, status, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { retornaValorRandom } from './utils';

// Bancada package definition variable instantiation.
const bancadaDefs = loadSync('./protos/bancada.proto');
// The bancada package definition Load as a gRPC object hierarchy. 
const bancadaProto = loadPackageDefinition(bancadaDefs) as any;

// Creation of a new Bancada Server
const bancadaServer = new Server();

// An implementation of the Bancada Service is added here
bancadaServer.addService(bancadaProto.BancadaService.service, {
  // This is the implementation of the service definition on proto bancada file passing random values to the client through the proto buffers
  GetDados: (_: any, callback: any) => {
    callback(null, {
      id: 1,
      temperatura: retornaValorRandom(18, 26),
      umidade: retornaValorRandom(60, 90),
      condutividade: retornaValorRandom(1.2, 2.5)
    });
  }
});

// Aqui é criado o bindAsync do servidor para executar qualquer IP, na porta 50051 passando credenciais inseguras como parâmetro. 
bancadaServer.bindAsync('0.0.0.0:50051', ServerCredentials.createInsecure(), () => {
  console.log('Bancada 1 rodando em 0.0.0.0:50051');
});