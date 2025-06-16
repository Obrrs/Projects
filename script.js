/**
 * Função para mostrar uma lista de itens (escolas/cursos) num container específico.
 * Mostra um número limitado de itens inicialmente e um botão "Ver Mais"/"Ver Menos".
 * @param {Array} items - Array completo de objetos (escolas) para a categoria.
 * @param {string} containerId - O ID do div onde a lista deve ser inserida (espera-se que seja um elemento com a classe 'row').
 * @param {number} limit - Quantos itens mostrar inicialmente.
 */

// Remove acentos e deixa tudo minúsculo
function normalizeText(text) {
    return text
        .normalize('NFD') // Converte caracteres acentuados em letra + acento (ex: "á" → "a´")
        .replace(/[\u0300-\u036f]/g, '') // Remove todos os sinais diacríticos (acentos, til, etc.)
        .toLowerCase(); // Converte para minúsculas (padroniza busca)
}

// Guarda o tempo da pesquisa pra não estar sempre a procurar 
let searchTimeout;

// Mostra uma lista de escolas com limite e botão "Ver Mais"
function displayItemsInCategory(items, containerId, limit = 3) {
    const container = document.getElementById(containerId); // Pega a div onde os itens serão exibidos
    if (!container) {  // Se não existir, mostra erro no terminal
        console.error(`Container com ID "${containerId}" não encontrado.`);
        return;
    }
    // Limpa qualquer conteúdo anterior (mensagens de erro, loading, ou execuções prévias)
    container.innerHTML = '';

    // Mostrar mensagem se não houver itens
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="text-muted small fst-italic">Nenhum item encontrado nesta categoria.</p>';
        return;
    }

    // Variável para controlar se a lista está expandida ou não
    let isExpanded = false;
    // Referência para o botão (será criada se necessário)
    let toggleButton = null;

    // Função interna para renderizar um bloco de itens
    const renderItemsChunk = (startIndex, endIndex) => {
        const actualEndIndex = Math.min(endIndex, items.length);
        for (let i = startIndex; i < actualEndIndex; i++) {
            const item = items[i];
            let divWrapper = document.createElement('div');
            // Adiciona classes Bootstrap para layout em colunas e a classe 'category-item'
            divWrapper.classList.add('col-md-4', 'mb-3', 'category-item');
            // Adiciona uma classe extra para identificar os itens "extra" que podem ser escondidos
            if (i >= limit) {
                divWrapper.classList.add('category-item-extra');
            }
            //um "card" é uma caixa visual usada para exibir 
            // informações de uma categoria (ex: universidades, cursos) de forma organizada na página
            // HTML do card (nome + localidade)
            divWrapper.innerHTML = `
                <div class="info info-small h-100">
                    <h6>${item.nome || 'Nome Indisponível'}</h6>
                    <p class="small text-muted mb-0">${item.localidade || 'Localidade não indicada'}</p>
                    </div>
            `;
            container.appendChild(divWrapper); // Adiciona diretamente ao container (que tem a classe 'row')
        }
    };

    // Renderiza os itens iniciais visíveis
    renderItemsChunk(0, limit);

    // Cria o botão "Ver Mais" apenas se houver mais itens do que o limite
    if (items.length > limit) {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('col-12', 'mt-2', 'text-center'); // Botão centrado a ocupar toda a largura

        toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.classList.add('btn', 'btn-sm', 'btn-outline-primary');
        toggleButton.innerText = `Ver Mais (${items.length - limit} restantes)`;

        buttonContainer.appendChild(toggleButton);

        // Adiciona o botão DEPOIS de todos os itens iniciais no container 'row'
        container.appendChild(buttonContainer);

        // Ao clicar no botão, expande/recolhe a lista
        toggleButton.addEventListener('click', () => {
            isExpanded = !isExpanded; // Inverte o estado

            if (isExpanded) {
                // Estado: Expandido -> Mostra os itens extra
                renderItemsChunk(limit, items.length); // Mostra todos os itens
                toggleButton.innerText = 'Ver Menos';
                toggleButton.classList.replace('btn-outline-primary', 'btn-outline-secondary');
            } else {
                // Mostra todos os itens
                const extraItems = container.querySelectorAll('.category-item-extra');
                extraItems.forEach(el => container.removeChild(el)); // Remove cada item extra

                toggleButton.innerText = `Ver Mais (${items.length - limit} restantes)`;
                toggleButton.classList.replace('btn-outline-secondary', 'btn-outline-primary');
            }
        });
    }
}
/**
 * Função para mostrar os resultados da pesquisa no container #escolas-container.
 * @param {Array} items - Array de objetos (escolas) encontrados.
 * @param {string} containerId - O ID do div de resultados (normalmente 'escolas-container').
 */

/**Função para mostrar os resultados da pesquisa */
function displaySearchResults(items, containerId) {
     // Obtém o elemento container pelo ID fornecido
    const container = document.getElementById(containerId);
    if (!container) {
        // Se o container não for encontrado, exibe um erro no console e interrompe a função
        console.error(`Container de resultados da pesquisa com ID "${containerId}" não encontrado.`);
        return;
    }

    // Limpa qualquer conteúdo anterior do container
    container.innerHTML = '';
    
    // Se não houver itens, exibe uma mensagem informando que nenhuma escola foi encontrada
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhuma escola encontrada para a sua pesquisa.</p>';
        return;
    }

    // Exibe o título com a quantidade de resultados encontrados
    container.innerHTML = `<h4 class="mb-3 text-center">Resultados da Pesquisa (${items.length}):</h4>`;

    // Para cada item na lista, cria um novo bloco/zona com as informações da escola
    items.forEach(item => {
        let div = document.createElement('div');
        div.classList.add('info', 'mb-3');
        div.innerHTML = `
            <h5>${item.nome || 'Nome Indisponível'}</h5>
            <p>${item.descricao || 'Descrição não disponível.'}</p>
            <p class="small text-muted mb-0">Tipo: ${item.tipo || 'N/A'} | Localidade: ${item.localidade || 'N/A'}</p>
            ${item.cursos && item.cursos.length > 0 ? 
                `<p class="small mt-2"><strong>Cursos:</strong> ${item.cursos.join(', ')}</p>` : ''}
        `;
        // Adiciona o bloco criado ao container principal
        container.appendChild(div);
    });
    
}
/**
 * Sugere resultados enquanto o usuário digita (digitação)
 */
function handleSearchInput() {
    clearTimeout(searchTimeout); // Cancela a procura anterior se o utilizador ainda está a digitar
    const searchTerm = document.getElementById('searchInput').value.trim();  // Pega a palavra digitada pelo utilizador
    
    // Se a procura estiver vazia, mostra uma mensagem padrão
    if (!searchTerm) {
        const searchResultContainer = document.getElementById('escolas-container');
        if (searchResultContainer) {
            searchResultContainer.innerHTML = '<p class="text-center text-muted">↑ Use a pesquisa acima para encontrar uma escola específica.</p>';
        }
        return;
    }
    
    // Espera 300ms após a última tecla para fazer a procura (evita sobrecarga)
    searchTimeout = setTimeout(() => {
        if (searchTerm.length >= 2) {  // Só pesquisa se tiver pelo menos 2 caracteres
            searchSchool();
        }
    }, 300);
}
/**
 * Função principal para procurar todas as escolas do backend e distribuí-las pelas categorias no HTML.
 */
async function fetchAndDisplayCategories() {
    try {
        console.log("A procuar todas as escolas para categorias...");  // Faz requisição ao backend
        const response = await fetch('http://localhost:5000/escolas'); // Procura TUDO
        if (!response.ok) {
            throw new Error(`Erro HTTP ao buscar escolas: ${response.status}`);
        }
        const allEscolas = await response.json();
        console.log(`Recebidas ${allEscolas.length} escolas do backend.`);

        // Filtra escolas por tipo:
        const universidades = allEscolas.filter(e => e.tipo === 'Universidade');
        const politecnicos = allEscolas.filter(e => e.tipo === 'Politécnico');
        const faculdades = allEscolas.filter(e => e.tipo === 'Faculdade');
        const profissionais = allEscolas.filter(e => e.tipo === 'Profissional');
        const cursos = allEscolas.filter(e => e.tipo === 'Curso Superior');

        console.log(`Filtradas: ${universidades.length} U, ${politecnicos.length} P, ${faculdades.length} F, ${profissionais.length} P, ${cursos.length} CS`);

        // Chamar a função para mostrar cada lista no seu devido lugar
        displayItemsInCategory(universidades, 'universidades-list', 3);
        displayItemsInCategory(politecnicos, 'politecnicos-list', 3);
        displayItemsInCategory(faculdades, 'faculdades-list', 3);
        displayItemsInCategory(profissionais, 'escolas-profissionais-list', 3);
        displayItemsInCategory(cursos, 'cursos-superiores-list', 3);
        // Chama para outras categorias divs no HTML

        // Limpa o container da pesquisa ou coloca uma mensagem inicial
        const searchResultContainer = document.getElementById('escolas-container');
        if (searchResultContainer) {
            searchResultContainer.innerHTML = '<p class="text-center text-muted">↑ Use a pesquisa acima para encontrar uma escola específica.</p>';
        }

    } catch (error) {   // Se algo der errado (ex: servidor offline)
        console.error('Falha ao carregar ou mostrar escolas por categoria:', error);
        // Mostra uma mensagem de erro geral na página
        const mainContainer = document.querySelector('.container'); // O container dos cards
        if (mainContainer) {
             const errorDiv = document.createElement('div');
             errorDiv.innerHTML = '<p class="alert alert-danger">Não foi possível carregar as listas de escolas por categoria. Verifique se o servidor está a correr e a base de dados acessível.</p>';
             // Adiciona antes da primeira caixa/zona de categoria
             const firstCard = mainContainer.querySelector('.card');
             if(firstCard) {
                 mainContainer.insertBefore(errorDiv, firstCard);
             } else {
                 mainContainer.prepend(errorDiv);
             }
        }
    }
}

/**
 * Função chamada quando o botão de pesquisa é clicado ou Enter é pressionado.
 */
async function searchSchool() {
    const inputElement = document.getElementById('searchInput');
    const searchTerm = inputElement.value.trim();
    const searchResultContainer = document.getElementById('escolas-container'); // Container dos resultados da pesquisa

    if (!searchResultContainer) {
        console.error("Container de resultados da pesquisa (#escolas-container) não encontrado!");
        return;
    }

    // Mostra feedback visual enquanto pesquisa
    searchResultContainer.innerHTML = '<p class="text-center">A pesquisar...</p>';

    // Se a pesquisa for limpa, volta a mostrar a mensagem padrão
    if (!searchTerm) {
        searchResultContainer.innerHTML = '<p class="text-center text-muted">↑ Use a pesquisa acima para encontrar uma escola específica.</p>';
        // fetchAndDisplayCategories();
        return;
    }

    try {
        console.log(`A pesquisar por: "${searchTerm}"`);
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        const response = await fetch(`http://localhost:5000/escolas?q=${encodedSearchTerm}`);

        if (!response.ok) {
            // Tenta ler a mensagem de erro do servidor se existir
            let errorMsg = `Erro na pesquisa: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg += ` - ${errorData.message || 'Erro desconhecido do servidor'}`;
            } catch (e) { /* Ignora se a resposta não for JSON */ }
            throw new Error(errorMsg);
        }

        const escolasFiltradas = await response.json();
        console.log(`Encontradas ${escolasFiltradas.length} escolas na pesquisa.`);

        // Usa a função específica para mostrar os resultados da pesquisa
        displaySearchResults(escolasFiltradas, 'escolas-container');

    } catch (error) {  // Se falhar a pesquisa (ex: rede, servidor offline)
        console.error('Falha ao pesquisar escolas:', error);
        searchResultContainer.innerHTML = `<p class="text-center text-danger">Ocorreu um erro durante a pesquisa: ${error.message}. Tente novamente.</p>`;
    }
}

/**
 * Função auxiliar para lidar com a tecla Enter no input de pesquisa.
 */
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') { // Se apertar Enter, faz a pesquisa
        event.preventDefault(); // Evita que o Enter faça outras coisas (ex: submeter formulário)
        searchSchool(); // Chama a mesma função da pesquisa do botão
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Carregado. A iniciar script.");

    fetchAndDisplayCategories();  // Carrega as categorias de escolas

    // Configura o botão de pesquisa
    const searchButton = document.querySelector('.search button');
    if (searchButton) {
        searchButton.addEventListener('click', searchSchool);
        console.log("Listener de clique adicionado ao botão de pesquisa.");
    } else {
        console.warn("Botão de pesquisa não encontrado no HTML.");
    }

     // Configura o input de busca (tecla Enter e digitação)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', handleSearchKeyPress);
        searchInput.addEventListener('input', handleSearchInput); // <-- Adicione esta linha
        console.log("Listeners de pesquisa adicionados ao input.");
    } else {
        console.warn("Input de pesquisa (searchInput) não encontrado no HTML.");
    }
    // ========== INTERCEPTADOR DE ROTAS ==========
    document.addEventListener('DOMContentLoaded', () => {
        // Intercepta todos os cliques em links
        document.body.addEventListener('click', function(event) {
            const link = event.target.closest('a');
            if (!link) return;

            // Verifica se é para detalhes.html
            if (link.href.includes('/detalhes.html')) {  // Se tentar aceder detalhes.html
                event.preventDefault();  // Bloqueia o link
                showMaintenanceAlert();  // Mostra aviso
                return;
            }
        });

        // Se já estiver em detalhes.html, redireciona para indela.html após 5 segundos
        if (window.location.pathname.includes('/detalhes.html')) {
            showMaintenanceAlert();
            redirectToHomeAfterDelay();
        }
    });
});


// Fim do ficheiro script.js