import { createProducer } from '../kafka/config';
import { TOPICS } from '../kafka/config';
import { retornaValorRandom } from '../calculation/utils';

const BANCADA_ID = 1;

async function run() {
    const producer = await createProducer();
    
    setInterval(async () => {
        const temperatura = retornaValorRandom(18, 26);
        const umidade = retornaValorRandom(60, 90);
        const condutividade = retornaValorRandom(1.2, 2.5);
        
        console.log(temperatura,umidade)
        try { // aqui abaixo publica :D
            
            await producer.send({
                topic: TOPICS.TEMPERATURA,
                messages: [{
                    key: `bancada_${BANCADA_ID}`,
                    value: JSON.stringify({ bancadaId: BANCADA_ID, valor: temperatura })
                }]
            });
            
            await producer.send({
                topic: TOPICS.UMIDADE,
                messages: [{
                    key: `bancada_${BANCADA_ID}`,
                    value: JSON.stringify({ bancadaId: BANCADA_ID, valor: umidade })
                }]
            });
            
            await producer.send({
                topic: TOPICS.CONDUTIVIDADE,
                messages: [{
                    key: `bancada_${BANCADA_ID}`,
                    value: JSON.stringify({ bancadaId: BANCADA_ID, valor: condutividade })
                }]
            });
            
            console.log(`Bancada ${BANCADA_ID} publicou dados`);
        } catch (err) {
            console.error(`Erro na bancada ${BANCADA_ID}:`, err);
        }
    }, 5000); // publica a cada 5 segundo ou seja cria os dados automáticos sem intervenção
}

run().catch(console.error);