/**
 * Função para mostrar uma lista de itens (escolas/cursos) num container específico.
 * Mostra um número limitado de itens inicialmente e um botão "Ver Mais"/"Ver Menos".
 * @param {Array} items - Array completo de objetos (escolas) para a categoria.
 * @param {string} containerId - O ID do div onde a lista deve ser inserida (espera-se que seja um elemento com a classe 'row').
 * @param {number} limit - Quantos itens mostrar inicialmente.
 */

function normalizeText(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

let searchTimeout;

function displayItemsInCategory(items, containerId, limit = 3) {
    const container = document.getElementById(containerId);
    if (!container) {
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

        // Adiciona o listener de clique ao botão
        toggleButton.addEventListener('click', () => {
            isExpanded = !isExpanded; // Inverte o estado

            if (isExpanded) {
                // Estado: Expandido -> Mostra os itens extra
                renderItemsChunk(limit, items.length); // Renderiza os restantes
                toggleButton.innerText = 'Ver Menos';
                toggleButton.classList.replace('btn-outline-primary', 'btn-outline-secondary');
            } else {
                // Estado: Recolhido -> Remove os itens extra
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
function displaySearchResults(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container de resultados da pesquisa com ID "${containerId}" não encontrado.`);
        return;
    }
    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhuma escola encontrada para a sua pesquisa.</p>';
        return;
    }

    container.innerHTML = `<h4 class="mb-3 text-center">Resultados da Pesquisa (${items.length}):</h4>`;

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
        container.appendChild(div);
    });
    
}
/**
 * Sugere resultados enquanto o usuário digita (debounced)
 */
function handleSearchInput() {
    clearTimeout(searchTimeout);
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (!searchTerm) {
        const searchResultContainer = document.getElementById('escolas-container');
        if (searchResultContainer) {
            searchResultContainer.innerHTML = '<p class="text-center text-muted">↑ Use a pesquisa acima para encontrar uma escola específica.</p>';
        }
        return;
    }
    
    searchTimeout = setTimeout(() => {
        if (searchTerm.length >= 2) {
            searchSchool();
        }
    }, 300);
}
/**
 * Função principal para procurar todas as escolas do backend e distribuí-las pelas categorias no HTML.
 */
async function fetchAndDisplayCategories() {
    try {
        console.log("A procuar todas as escolas para categorias...");
        const response = await fetch('http://localhost:5000/escolas'); // Procura TUDO
        if (!response.ok) {
            throw new Error(`Erro HTTP ao buscar escolas: ${response.status}`);
        }
        const allEscolas = await response.json();
        console.log(`Recebidas ${allEscolas.length} escolas do backend.`);

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

    } catch (error) {
        console.error('Falha ao carregar ou mostrar escolas por categoria:', error);
        // Mostra uma mensagem de erro geral na página
        const mainContainer = document.querySelector('.container'); // O container dos cards
        if (mainContainer) {
             const errorDiv = document.createElement('div');
             errorDiv.innerHTML = '<p class="alert alert-danger">Não foi possível carregar as listas de escolas por categoria. Verifique se o servidor está a correr e a base de dados acessível.</p>';
             // Adiciona antes do primeiro card de categoria
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

    } catch (error) {
        console.error('Falha ao pesquisar escolas:', error);
        searchResultContainer.innerHTML = `<p class="text-center text-danger">Ocorreu um erro durante a pesquisa: ${error.message}. Tente novamente.</p>`;
    }
}

/**
 * Função auxiliar para lidar com a tecla Enter no input de pesquisa.
 */
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evita que o Enter faça outras coisas (ex: submeter formulário)
        searchSchool(); // Chama a mesma função da pesquisa do botão
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Carregado. A iniciar script.");

    fetchAndDisplayCategories();

    const searchButton = document.querySelector('.search button');
    if (searchButton) {
        searchButton.addEventListener('click', searchSchool);
        console.log("Listener de clique adicionado ao botão de pesquisa.");
    } else {
        console.warn("Botão de pesquisa não encontrado no HTML.");
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', handleSearchKeyPress);
        searchInput.addEventListener('input', handleSearchInput); // <-- Adicione esta linha
        console.log("Listeners de pesquisa adicionados ao input.");
    } else {
        console.warn("Input de pesquisa (searchInput) não encontrado no HTML.");
    }
});


// Fim do ficheiro script.js
