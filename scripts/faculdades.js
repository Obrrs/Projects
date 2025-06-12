/**
 * @param {Array} escolas Array com os dados das escolas a mostrar.
 * @param {string} containerId ID do elemento HTML onde a lista será inserida.
 */
function displayVerticalList(escolas, containerId) {
   const container = document.getElementById(containerId);
   if (!container) {
       console.error(`ERRO: Container #${containerId} não encontrado no HTML.`);
       return;
   }
   container.innerHTML = ''; // Limpa conteúdo anterior (ex: "A carregar...")

   if (!escolas || escolas.length === 0) {
       container.innerHTML = '<p class="text-center text-muted">Nenhuma Faculdade encontrada.</p>';
       return;
   }

   // Cria um div para cada escola
   escolas.forEach(escola => {
       let div = document.createElement('div');
       // Adiciona a classe 'info' (para estilo do style.css) e margem inferior
       div.classList.add('info', 'mb-3');

       // Cria o HTML interno com os detalhes da escola
       div.innerHTML = `
           <h5>
               <a href="/projeto_pap/paginas/detalhes.html?id=${escola._id}">
                   ${escola.nome || 'Nome Indisponível'}
               </a>
           </h5>
           <p>${escola.descricao || 'Descrição não disponível.'}</p>
           <p class="small mb-1"><strong>Endereço:</strong> ${escola.endereco || escola.localidade || 'N/A'}</p>
           <p class="small mb-1"><strong>Website:</strong> ${escola.website ? `<a href="/projeto_pap/paginas/detalhes.html" target="_self" rel="noopener noreferrer">${escola.website}</a>` : 'N/A'}</p>
           <p class="small text-muted mb-0"><strong>Preço/Propinas:</strong> ${escola.preco || 'N/A'}</p>
           ${escola.saidasProfissionais && escola.saidasProfissionais.length > 0 
            ? `<p class="small mt-2"><strong>Saídas Profissionais:</strong> ${escola.saidasProfissionais.join(', ')}</p>`
            : ''}
       `;
       container.appendChild(div);
   });
}

/**
* @param {string} tipoEscola Tipo de escola a filtrar (ex: 'Profissional').
* @param {string} containerId ID do container no HTML.
*/
async function loadEscolasPorTipo(tipoEscola, containerId) {
   const container = document.getElementById(containerId);
   if (!container) {
       console.error(`ERRO: Elemento com ID "${containerId}" não encontrado.`);
       return;
   }
   container.innerHTML = `<p class="text-center text-muted">A carregar lista de ${tipoEscola.toLowerCase()}...</p>`;

   try {
       console.log(`INFO: Buscando escolas do tipo "${tipoEscola}"...`);
       // Chama a API pedindo apenas o tipo específico
       const response = await fetch(`http://localhost:5000/escolas?tipo=${encodeURIComponent(tipoEscola)}`);

       if (!response.ok) {
           throw new Error(`Erro ${response.status} ao buscar escolas.`);
       }
       const escolas = await response.json();
       console.log(`INFO: Recebidas ${escolas.length} escolas do tipo "${tipoEscola}".`);

       // Mostra a lista completa verticalmente
       displayVerticalList(escolas, containerId);

   } catch (error) {
       console.error(`ERRO ao carregar ${tipoEscola}:`, error);
       if (container) {
           container.innerHTML = `<p class="alert alert-danger">Não foi possível carregar a lista. ${error.message}</p>`;
       }
   }
}

// --- Ponto de Entrada do Script ---
document.addEventListener('DOMContentLoaded', () => {
   console.log("INFO: DOM faculdade.html carregado.");
   // ...chama a função para carregar as escolas no div correto.
   loadEscolasPorTipo('Faculdade', 'faculdades-list');

});
