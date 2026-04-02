/**
 * ECO SISTEMA - CLONAGEM DE BANCO (PROD -> TESTE)
 * Este script puxa todos os dados da API de Produção e espelha na API de Homologação.
 */

const axios = require('axios'); // Necessário instalar: npm install axios

// ==========================================
// CONFIGURAÇÕES (Preencha com as URLs reais)
// ==========================================
const API_PRODUCAO = 'https://api.ecooncologia.com.br:3000'; // Exemplo: URL da sua API de Produção
const API_TESTE = 'https://api.ecooncologia.com.br:4000'; // Exemplo: URL da sua API de Teste/Homologação

// Se a sua API usa algum token (Bearer, API Key), coloque aqui. Se for aberta, deixe vazio.
const HEADERS = {
    'Content-Type': 'application/json',
    'x-api-key': 'EcoOnco_Smart_Seguranca_2026!@'
};

// Todas as rotas que queremos clonar
const ROTAS = [
    'system_configs',
    'medicos',
    'pacientes',
    'repasse_unimed',
    'vendas',
    'escala_mensal',
    'escala_mensal_vita_quimio',
    'escala_mensal_vita_sobreaviso',
    'escala_mensal_cirurgioes'
];

async function clonarBanco() {
    console.log(`[${new Date().toLocaleString()}] INICIANDO CLONAGEM DE PRODUÇÃO PARA TESTE...`);

    for (const rota of ROTAS) {
        console.log(`\nSincronizando tabela: /${rota}...`);
        try {
            // 1. Puxar todos os dados da Produção
            const resProd = await axios.get(`${API_PRODUCAO}/${rota}`, { headers: HEADERS });
            const dadosProducao = resProd.data || {};
            
            const arrayDados = Object.entries(dadosProducao);
            if (arrayDados.length === 0) {
                console.log(`-> Tabela /${rota} vazia na Produção. Pulando...`);
                continue;
            }

            console.log(`-> Encontrados ${arrayDados.length} registros. Injetando no banco de Teste...`);

            // 2. Injetar um por um no banco de Teste (Atualizando/Sobrescrevendo)
            let count = 0;
            for (const [id, registro] of arrayDados) {
                try {
                    // Garantir que o ID vá junto no objeto se for PUT
                    const payload = typeof registro === 'string' ? JSON.parse(registro) : registro;
                    payload.id_firebase = id;

                    // Faz o PUT na base de teste
                    await axios.put(`${API_TESTE}/${rota}/${id}`, payload, { headers: HEADERS });
                    count++;
                } catch (errPut) {
                    console.error(`Erro ao injetar o registro ${id} na rota /${rota}:`, errPut.message);
                }
            }
            
            console.log(`-> Sincronização da tabela /${rota} concluída! (${count}/${arrayDados.length} inseridos)`);

        } catch (error) {
            console.error(`[ERRO] Falha ao processar a rota /${rota}:`, error.message);
        }
    }

    console.log(`\n[${new Date().toLocaleString()}] CLONAGEM FINALIZADA COM SUCESSO!`);
}

clonarBanco();