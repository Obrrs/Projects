const mongoose = require('mongoose');

const EscolaSchema = new mongoose.Schema({
    nome: { 
        type: String, 
        required: true, 
        trim: true },
    tipo: {
        type: String,
        enum: ['Universidade', 'Politécnico', 'Faculdade', 'Profissional', 'Curso Superior'],
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
    },
    preco: { // Informação sobre custos/propinas
        type: String,
        trim: true
    },
    saidasProfissionais: {
        type: String,
        trim: true,// Lista de possíveis saídas profissionais
        default: []
    }
});

EscolaSchema.index({ nome: 'text', descricao: 'text', localidade: 'text', endereco: 'text', preco: 'text', saidasProfissionais: 'text' });
// Adiciona um índice de texto para permitir buscas por nome, descrição, localidade, etc.

// Exporta o modelo para poder ser usado noutros ficheiros
module.exports = mongoose.model("Escola", EscolaSchema);