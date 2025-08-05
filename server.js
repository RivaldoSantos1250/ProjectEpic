require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

const RIOT_API_KEY = process.env.RIOT_API_KEY;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/valorant-stats', async (req, res) => {
    if (!RIOT_API_KEY || RIOT_API_KEY === 'RGAPI-SUA-CHAVE-SECRETA-DA-RIOT-VAI-AQUI') {
        return res.status(500).json({ error: 'A chave da API da Riot não foi configurada no servidor.' });
    }

    try {
        const riotIdCompleto = req.query.riotId;
        const [gameName, tagLine] = riotIdCompleto.split('#');

        const accountResponse = await axios.get(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`, {
            headers: { "X-Riot-Token": RIOT_API_KEY }
        });

        const puuid = accountResponse.data.puuid;

        const accountDetailsResponse = await axios.get(`https://br.api.riotgames.com/val/content/v1/contents`, {
             headers: { "X-Riot-Token": RIOT_API_KEY }
        });

        // Este endpoint de exemplo busca detalhes da conta. Você pode explorar a API para mais dados.
        // Por exemplo, para pegar o nível da conta, é necessário outro endpoint que não é diretamente disponível na API pública padrão.
        // A API da Riot é complexa. Este código é um ponto de partida funcional.
        // Vamos simular alguns dados para o exemplo, pois a API pública para NÍVEL e CARD é mais complexa.
        // A chamada real para detalhes de um jogador específico como nível não existe em um endpoint simples.
        // Mas podemos usar o PUUID para buscar histórico de partidas, etc.
         const valorantAccountDetailsResponse = await axios.get(`https://br.api.riotgames.com/valorant/v1/by-puuid/${puuid}/account-details`, {
            headers: { "X-Riot-Token": RIOT_API_KEY }
        });


        res.json({
            account: accountResponse.data,
            accountDetails: {
                accountLevel: valorantAccountDetailsResponse.data.accountLevel,
                card: {
                    small: valorantAccountDetailsResponse.data.card.small,
                }
            }
        });

    } catch (error) {
        let errorMessage = 'Não foi possível buscar os dados do jogador.';
        if (error.response) {
            if (error.response.status === 404) {
                errorMessage = 'Jogador não encontrado. Verifique o Riot ID.';
            } else if (error.response.status === 403) {
                errorMessage = 'Chave da API da Riot inválida ou expirada.';
            }
        }
        res.status(500).json({ error: errorMessage });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando. Abra seu navegador em http://localhost:${port}`);
});