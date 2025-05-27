// seed.js
const mongoose = require('mongoose');

// Define a connection string e o nome da DB
const dbURI = 'mongodb://localhost:27017/escolasDB';

const EscolaSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },
    tipo: { type: String, enum: ['Universidade', 'Politécnico','Faculdade', 'Profissional', 'Curso Superior',] }, // Ajustar se necessário
    descricao: { type: String, trim: true },
    localidade: String,
    saidasProfissionais: [String],
});
const Escola = mongoose.model("Escola", EscolaSchema);

// Função para conectar, inserir dados e desconectar
async function seedDatabase() {
    try {
        console.log('A conectar à base de dados...');
        await mongoose.connect(dbURI);
        console.log('MongoDB conectado para seeding.');

        // Limpa dados antigos 
        console.log('A limpar a coleção escolas...');
        await Escola.deleteMany({});

        console.log('A inserir novos dados...');
        await Escola.insertMany(escolasParaInserir);
        console.log('Dados inseridos com sucesso!');

    } catch (error) {
        console.error('Erro durante o seeding:', error);
    } finally {
        // Garante que a conexão é fechada no final
        console.log('A fechar a conexão...');
        await mongoose.disconnect();
        console.log('Conexão fechada.');
    }
}

// Executa a função de seeding
seedDatabase();