// Importa a biblioteca mongoose para interagir com o MongoDB
const mongoose = require('mongoose');

// Define a string de conexão com o banco de dados MongoDB
// 'mongodb://localhost:27017' - Endereço do servidor MongoDB
// 'escolasDB' - Nome do banco de dados utilizado
const dbURI = 'mongodb://localhost:27017/escolasDB';

// Define o schema (estrutura) dos documentos da coleção 'Escola'
const EscolaSchema = new mongoose.Schema({
    // Campo nome: tipo String, obrigatório (required: true), 
    // trim remove espaços em branco no início e fim
    nome: { type: String, required: true, trim: true },
    tipo: { type: String, enum: ['Universidade', 'Politécnico','Faculdade', 'Profissional', 'Curso Superior',] }, // Ajustar se necessário
    descricao: { type: String, trim: true },
    localidade: String,
    saidasProfissionais: String,
});

// Cria o modelo 'Escola' baseado no schema definido
// Este modelo será usado para todas as operações CRUD na coleção
const Escola = mongoose.model("Escola", EscolaSchema);

// Função assíncrona principal que realiza o seeding (popular o banco)
async function seedDatabase() {
    try {
        // 1. Conectar à base de dados
        console.log('A conectar à base de dados...');
        await mongoose.connect(dbURI);
        console.log('MongoDB conectado para seeding.');

        // 2. Limpar a coleção existente (opcional - cuidado em produção!)
        console.log('A limpar a coleção escolas...');
        await Escola.deleteMany({});

        // 3. Inserir os novos dados
        console.log('A inserir novos dados...');
        await Escola.insertMany(escolasParaInserir);
        console.log('Dados inseridos com sucesso!');

    } catch (error) {
        // Tratamento de erros
        console.error('Erro durante o seeding:', error);
    } finally {
        // 4. Desconectar da base (executa sempre, mesmo com erro)
        console.log('A fechar a conexão...');
        await mongoose.disconnect();
        console.log('Conexão fechada.');
    }
}

// Executa a função de seeding
seedDatabase();