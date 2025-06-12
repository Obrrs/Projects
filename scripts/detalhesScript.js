// Configuração do redirecionamento
let seconds = 5;
const countdownElement = document.getElementById('seconds');
const countdownDisplay = document.getElementById('countdown');
const progressBar = document.getElementById('progress-bar');

function updateProgress() {
   const percentage = 100 - ((seconds / 5) * 100);
   progressBar.style.width = `${percentage}%`;
}

function redirectToHome() {
   window.location.href = '/projeto_pap/index.html';
}

const countdownInterval = setInterval(() => {
   seconds--;
   countdownElement.textContent = seconds;
   countdownDisplay.textContent = seconds;
   updateProgress();
   
   if (seconds <= 0) {
         clearInterval(countdownInterval);
         redirectToHome();
   }
}, 1000);

// Atualiza a barra de progresso inicialmente
updateProgress();