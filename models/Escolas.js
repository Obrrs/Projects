const mongoose = require('mongoose');

const EscolaSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },
    tipo: {
        type: String,
        enum: ['Unisidade', 'Politécnico', 'Faculdade', 'Profissional', 'Curso Superior'],
        required: true
    },
    descricao: { type: String, trim: true },
    localidade: String, 
    endereco: { // Morada completa
        type: String,
        trim: true
    },
    website: { // Link para o site
        type: String,
        trim: true
        // Poderias adicionar validação de URL aqui depois, se quiseres
    },
    preco: { // Informação sobre custos/propinas
        type: String, // Usar String para flexibilidade (ex: "Gratuito", "1000€/ano", "Sob consulta")
        trim: true
    }
    
});

// Opção 1: Índice de Texto (Recomendado para pesquisa em texto)
EscolaSchema.index({ nome: 'text', descricao: 'text', localidade: 'text', endereco: 'text'});

// Exporta o modelo para poder ser usado noutros ficheiros
module.exports = mongoose.model("Escola", EscolaSchema);