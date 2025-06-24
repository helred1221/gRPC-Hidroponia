import { producer } from "../kafka/config";
import { retornaValorRandom } from "../calculation/utils";

interface Hidroponia {
    temperatura: number;
    condutividade: number;
    umidade: number;
}

const dados: Hidroponia = {
    temperatura: retornaValorRandom(1, 100),
    condutividade: retornaValorRandom(5, 50),
    umidade: retornaValorRandom(10, 60)
};

const bancada1 = (async (): Promise<void> => {
    try {
      console.clear();
      console.log("Iniciando conexão");
      await producer.connect();
  
      console.log("Produzido dados Bancada 1");
      await producer.send({
        topic: "bancada_1",
        messages: [
          { key: "Mensagem de: ", value: "Bancada Hidropônica 1" },
          { key: "Temperatura: ", value: dados.temperatura.toString() },
          { key: "Condutividade: ", value: dados.condutividade.toString() },
          { key: "Umidade: ", value: dados.umidade.toString() },
        ],
      });
  
      await producer.disconnect();
      console.log("Mensagens enviadas e conexão encerrada.");
    } catch (error) {
      console.error("Erro no producer:", error);
    }
  })();
  
  export default bancada1;