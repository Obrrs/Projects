// Configuração do redirecionamento

// Tempo inicial em segundos para o redirecionamento
let seconds = 5;

// Elementos do DOM:
const countdownElement = document.getElementById('seconds');  // Mostra o contador em números
const countdownDisplay = document.getElementById('countdown');  // Outro elemento que mostra o contador
const progressBar = document.getElementById('progress-bar');  // Barra de progresso visual

// Atualiza a barra de progresso baseada no tempo restante
function updateProgress() {

   // Calcula a porcentagem concluída (inversa: 100% quando seconds = 0)
   const percentage = 100 - ((seconds / 5) * 100);

   // Aplica a largura da barra de progresso
   progressBar.style.width = `${percentage}%`;
}

// Função que redireciona para a página inicial
function redirectToHome() {
   window.location.href = '/projeto_pap/index.html';
}

// Intervalo que executa a cada 1 segundo (1000ms)
const countdownInterval = setInterval(() => {
   // Diminui o contador.
   seconds--;

   // Atualiza os elementos visuais com o novo valor
   countdownElement.textContent = seconds;
   countdownDisplay.textContent = seconds;

   // Atualiza a barra de progresso
   updateProgress();
   
   // Quando chegar a 0, para o intervalo e redireciona
   if (seconds <= 0) {
         clearInterval(countdownInterval); // Para o contador
         redirectToHome();  // Executa o redirecionamento
   }
}, 1000);  // Executa a cada 1000ms (1 segundo)

// Atualiza a barra de progresso inicialmente
updateProgress();