const axios = require('axios');

// O handler que a Vercel vai executar
export default async function handler(request, response) {
    const RIOT_API_KEY = process.env.RIOT_API_KEY;

    if (!RIOT_API_KEY) {
        return response.status(500).json({ error: 'A chave da API da Riot não foi configurada.' });
    }

    try {
        const riotIdCompleto = request.query.riotId;
        const [gameName, tagLine] = riotIdCompleto.split('#');

        const accountResponse = await axios.get(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`, {
            headers: { "X-Riot-Token": RIOT_API_KEY }
        });

        const puuid = accountResponse.data.puuid;

        const accountDetailsResponse = await axios.get(`https://br.api.riotgames.com/valorant/v1/by-puuid/${puuid}/account-details`, {
            headers: { "X-Riot-Token": RIOT_API_KEY }
        });

        return response.status(200).json({
            account: accountResponse.data,
            accountDetails: accountDetailsResponse.data
        });

    } catch (error) {
        let errorMessage = 'Não foi possível buscar os dados do jogador.';
        if (error.response) {
            if (error.response.status === 404) errorMessage = 'Jogador não encontrado.';
            else if (error.response.status === 403) errorMessage = 'Chave da API inválida ou expirada.';
        }
        return response.status(500).json({ error: errorMessage });
    }
}