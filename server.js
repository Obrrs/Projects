const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Escola = require('./models/Escolas');

const app = express();
app.use(express.json());
app.use(cors());

// --- Ligar à Base de Dados ---
mongoose.connect("mongodb://localhost:27017/escolasDB")
  .then(() => console.log("MongoDB conectado com sucesso!"))
  .catch(err => console.error("### Erro ao conectar ao MongoDB:", err)); // Log de erro melhorado

// --- Rotas da API ---

// Rota GET /escolas: Busca todas, filtra por tipo E/OU pesquisa por texto 'q'
app.get("/escolas", async (req, res) => {
    try {
        const { q, tipo } = req.query;
        let query = {};

        // Adiciona filtro por TIPO, se o parâmetro 'tipo' foi passado
        if (tipo) {
            query.tipo = tipo; // Define o filtro diretamente
            console.log(`INFO: Filtrando por tipo = "${tipo}"`);
        }

        // Adiciona pesquisa por TEXTO, se o parâmetro 'q' foi passado
        if (q) {
            console.log(`INFO: Pesquisando por texto = "${q}"`);
            const textSearchQuery = { $text: { $search: q } };
            // Combina com o filtro 'tipo' se ambos existirem
            if (query.tipo) {
                query = { $and: [ { tipo: query.tipo }, textSearchQuery ] };
            } else {
                query = textSearchQuery;
            }
        }

        console.log("INFO: Query final para MongoDB:", JSON.stringify(query));

        // A variável 'Escola' aqui vem do 'require('./models/Escola')' no topo
        const escolas = await Escola.find(query);
        console.log(`INFO: Encontradas ${escolas.length} escolas.`);
        res.json(escolas);

    } catch (error) {
        console.error("!!! ERRO na rota /escolas:", error);
        res.status(500).json({ message: "Erro interno ao buscar escolas." });
    }
});


// Rota GET /escolas/:id - Busca UMA escola pelo seu ID único
// (Necessária para a página de detalhes)
app.get("/escolas/:id", async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da rota (ex: /escolas/605c7...)

        // Verifica se o ID tem um formato válido do MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`AVISO: Tentativa de busca com ID inválido: "${id}"`);
            return res.status(400).json({ message: "Formato de ID inválido." }); // 400 Bad Request
        }

        console.log(`INFO: Buscando escola por ID = "${id}"`);
        const escola = await Escola.findById(id);

        if (!escola) {
            // Se findById retorna null, a escola não existe
            console.warn(`AVISO: Escola com ID "${id}" não encontrada.`);
            return res.status(404).json({ message: "Escola não encontrada." }); // 404 Not Found
        }

        console.log(`INFO: Escola encontrada: "${escola.nome}"`);
        res.json(escola); // Envia os dados da escola encontrada

    } catch (error) {
        console.error(`!!! ERRO na rota /escolas/${req.params.id}:`, error);
        res.status(500).json({ message: "Erro interno ao buscar detalhes da escola." });
    }
});

// --- Fim Rotas API ---


// --- Iniciar o Servidor ---
const PORT = process.env.PORT || 5000; // Usa a porta definida no ambiente ou 5000 como padrão
app.listen(PORT, () => console.log(`\n--- Servidor 'Escolha Certa' a correr na porta ${PORT} ---`));
