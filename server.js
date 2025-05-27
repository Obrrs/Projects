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
app.get('/escolas', async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        
        // 1. Normalização do termo de busca
        const normalizedTerm = searchTerm
            .normalize('NFD') // Decompõe caracteres acentuados
            .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
            .toLowerCase();
        
        // 2. Divide em termos individuais
        const searchTerms = normalizedTerm.split(/\s+/).filter(term => term.length > 0);
        
        // 3. Procura todas as escolas
        const allEscolas = await Escola.find({}); // Supondo uso do Mongoose
        
        // 4. Filtra as escolas
        const escolasFiltradas = allEscolas.filter(escola => {
            // Cria uma string de busca com todos os campos relevantes
            const searchableText = [
                escola.nome,
                escola.tipo,
                escola.localidade,
                escola.descricao,
                escola.cursos?.join(' ') || '' // Junta cursos em uma string
            ]
            .join(' ') // Une tudo numa grande string
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
            
            // Verifica se TODOS os termos estão presentes
            return searchTerms.every(term => searchableText.includes(term));
        });
        
        res.json(escolasFiltradas);
    } catch (error) {
        console.error('Erro na pesquisa:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao processar pesquisa',
            error: error.message
        });
    }
});

// Rota GET /escolas/:id - Procura UMA escola pelo seu ID único
// (Necessária para a página de detalhes)
app.get("/escolas/:id", async (req, res) => {
    try {
        const { id } = req.params; // Pega no ID da rota (ex: /escolas/605c7...)

        // Verifica se o ID tem um formato válido no MongoDB ObjectId
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
