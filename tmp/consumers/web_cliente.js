const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
const PORT = 3000;

const kafka = new Kafka({
  clientId: 'web-cliente',
  brokers: ['localhost:9092']
});

let estatisticasAtuais = null;

async function iniciarConsumidor() {
  const consumer = kafka.consumer({ groupId: 'grupo_web' });

  try {
    await consumer.connect();
    console.log('Conectado ao Kafka');

    await consumer.subscribe({ topic: 'Calculados', fromBeginning: false });
    console.log('Inscrito no tópico "Calculados"');

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          if (!message.value) return;

          const dados = JSON.parse(message.value.toString());

          if (dados.media && dados.mediana) {
            estatisticasAtuais = dados;
            console.log('Estatísticas atualizadas');
          } else {
            console.log('Mensagem ignorada:', dados);
          }
        } catch (error) {
          console.error('Erro ao processar mensagem:', error);
        }
      }
    });
  } catch (error) {
    console.error('Erro no consumidor:', error);
  }
}

app.get('/', (req, res) => {
  if (!estatisticasAtuais) {
    return res.send('<p>Nenhuma estatística disponível.</p>');
  }

  const { media, mediana } = estatisticasAtuais;

  res.send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="5">
        <title>Estatísticas</title>
      </head>
      <body>
        <h2>Últimos Cálculos</h2>
        <table border="1" cellpadding="4" cellspacing="0">
          <tr><th></th><th>Temperatura</th><th>Umidade</th><th>Condutividade</th></tr>
          <tr><td>Média</td><td>${media.temperatura.toFixed(2)}</td><td>${media.umidade.toFixed(2)}</td><td>${media.condutividade.toFixed(2)}</td></tr>
          <tr><td>Mediana</td><td>${mediana.temperatura.toFixed(2)}</td><td>${mediana.umidade.toFixed(2)}</td><td>${mediana.condutividade.toFixed(2)}</td></tr>
        </table>
        <p>Atualiza a cada 5s</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

iniciarConsumidor();
