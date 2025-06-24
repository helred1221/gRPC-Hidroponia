import { producer } from "../kafka/config";

const bancada2 = (async (): Promise<void> => {
  try {
    console.clear();
    console.log("Iniciando conexão");
    await producer.connect();

    console.log("Produzido dados da bancada 2");
    await producer.send({
      topic: "bancada_2",
      messages: [
        { key: "message_from", value: "Bancada 2" },
        { key: "time", value: Date.now().toString() },
        { key: "conteudo", value: "temp, umi, cond" },
      ],
    });

    await producer.disconnect();
    console.log("Mensagens enviadas e conexão encerrada.");
  } catch (error) {
    console.error("Erro no producer:", error);
  }
})();

export default bancada2;
