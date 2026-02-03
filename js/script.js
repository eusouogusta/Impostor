/**
 * BANCO DE DADOS
 * Separado em constante para facilitar manutenção futura.
 */
const PHRASES_DB = [
  { tema: "Loteria",
    oficial: "Se você ganhasse na loteria, quantos % você daria aos seus pais?",
    impostor: "Qual a maior porcentagem que você já deu de gorjeta pra um garçom?"},

  { tema: "Apocalipse",
    oficial: "Se você pudesse ter apenas um tipo de comida durante um apocalipse, qual seria?",
    impostor: "Uma comida gordurosa que te dá aquele arrependimento depois de comer?"},

  { tema: "Crianças",
    oficial: "De quantas crianças você acha que consegue ganhar no cabo de guerra?",
    impostor: "Quantos amigos você teve durante a infância?"},

  { tema: "Férias",
    oficial: "Qual o lugar mais legal que você foi para passar férias?",
    impostor: "Qual o destino mais barato que você já foi?"},

  {tema: "Dinheiro",
   oficial: "Se você tivesse dinheiro sobrando, com o que gastaria primeiro?",
   impostor: "Qual foi a compra mais inútil que você já fez?"},

  {tema: "Fama",
   oficial: "Qual artista você queria ter o mesmo nível de fama?",
   impostor: "Qual pessoa famosa você já encontrou pessoalmente?"},

  {tema: "Sono",
   oficial: "Quantas horas de sono seriam perfeitas pra você?",
   impostor: "Qual foi a noite que você menos dormiu?"},

  {tema: "Música",
   oficial: "Qual música você colocaria pra tocar agora?",
   impostor: "Qual música você já ouviu tanto que enjoou?"},

  {tema: "Internet",
   oficial: "Qual tipo de conteúdo você perde tempo vendo?",
   impostor: "Qual tipo de conteúdo você já se arrependeu de ver?"},

  {tema: "Festas",
   oficial: "O que não pode faltar numa festa boa?",
   impostor: "Qual foi a coisa mais estranha que você já viu numa festa?"},

  {tema: "Situações Improváveis",
   oficial: "Qual situação você acha que nunca vai viver?",
   impostor: "Qual situação estranha você já viveu?"},

  {tema: "Caos Social",
   oficial: "O que você faria se ninguém fosse te julgar?",
   impostor: "O que você já fez achando que ninguém estava vendo?"},
];

/**
 * CLASSE DO JOGO
 * Encapsula todo o estado e lógica, evitando poluição do escopo global.
 */
class ImpostorGame {
  constructor() {
    this.state = {
      players: [],
      viewed: [],
      currentSet: null,
      impostorIndex: null,
      availableIndices: [] // [NOVO] Array para controlar temas disponíveis
    };

    // Cache de Elementos do DOM
    this.ui = {
      setup: document.getElementById("setup"),
      game: document.getElementById("game"),
      playerName: document.getElementById("playerName"),
      playerList: document.getElementById("playerList"),
      orderBox: document.getElementById("orderBox"),
      buttonsArea: document.getElementById("buttonsArea"),
      phraseBox: document.getElementById("phraseBox"),
      phraseTheme: document.getElementById("phraseTheme"),
      phraseText: document.getElementById("phraseText"),
      roundStatus: document.getElementById("roundStatus"),
      result: document.getElementById("result"),
      // Botões
      addPlayerBtn: document.getElementById("addPlayerBtn"),
      startBtn: document.getElementById("startGameBtn"),
      hidePhraseBtn: document.getElementById("hidePhraseBtn"),
      revealOfficialBtn: document.getElementById("revealOfficialBtn"),
      revealAllBtn: document.getElementById("revealAllBtn"),
      newRoundBtn: document.getElementById("newRoundBtn"),
    };

    this.init();
  }

  init() {
    this.resetAvailableThemes(); // [NOVO] Inicializa o "baralho" de temas
    this.bindEvents();
  }

  // [NOVO] Enche o array com índices [0, 1, 2, ... total]
  resetAvailableThemes() {
    this.state.availableIndices = PHRASES_DB.map((_, index) => index);
    console.log("Temas resetados/embaralhados!"); 
  }

  bindEvents() {
    this.ui.addPlayerBtn.addEventListener("click", () => this.addPlayer());
    this.ui.startBtn.addEventListener("click", () => this.startGame());
    this.ui.hidePhraseBtn.addEventListener("click", () => this.hidePhrase());
    this.ui.revealOfficialBtn.addEventListener("click", () => this.revealOfficial());
    this.ui.revealAllBtn.addEventListener("click", () => this.revealAll());
    this.ui.newRoundBtn.addEventListener("click", () => this.setupRound());

    // Permitir adicionar com Enter
    this.ui.playerName.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addPlayer();
    });

    // Event Delegation para botões de jogadores (Performance)
    this.ui.buttonsArea.addEventListener("click", (e) => {
      if (e.target.classList.contains("player-btn")) {
        const index = parseInt(e.target.dataset.index);
        this.showPhrase(index, e.target);
      }
    });
  }

  addPlayer() {
    const name = this.ui.playerName.value.trim();
    if (!name || this.state.players.includes(name)) return;

    this.state.players.push(name);
    this.ui.playerName.value = "";
    this.ui.playerName.focus();
    this.updatePlayerListUI();
  }

  updatePlayerListUI() {
    const listHtml = this.state.players
      .map(p => `<div class="player-tag">👤 ${p}</div>`)
      .join("");
    
    this.ui.playerList.innerHTML = `<h3>Jogadores:</h3>${listHtml}`;
    this.ui.startBtn.disabled = this.state.players.length < 3;
  }

  startGame() {
    this.ui.setup.classList.add("hidden");
    this.ui.game.classList.remove("hidden");
    this.setupRound();
  }

  setupRound() {
    // [ALTERADO] Lógica de seleção única de tema
    
    // 1. Se acabaram os temas, reseta a lista para começar de novo
    if (this.state.availableIndices.length === 0) {
        this.resetAvailableThemes();
    }

    // 2. Sorteia um índice DENTRO do array de disponíveis
    const randomIndexPosition = Math.floor(Math.random() * this.state.availableIndices.length);
    
    // 3. Pega o ID real do banco de dados
    const dbIndex = this.state.availableIndices[randomIndexPosition];
    
    // 4. Remove esse índice da lista de disponíveis (para não repetir)
    this.state.availableIndices.splice(randomIndexPosition, 1);

    // 5. Define a frase atual
    this.state.currentSet = PHRASES_DB[dbIndex];
    
    // Reset de estado da rodada
    this.state.viewed = new Array(this.state.players.length).fill(false);
    this.state.impostorIndex = Math.floor(Math.random() * this.state.players.length);

    // Reset UI
    this.ui.result.classList.add("hidden");
    this.ui.phraseBox.classList.add("hidden");
    this.ui.roundStatus.classList.add("hidden");
    this.ui.roundStatus.innerHTML = "";
    this.ui.revealOfficialBtn.disabled = true;

    this.renderGameButtons();
    this.generateOrder();
  }

  renderGameButtons() {
    this.ui.buttonsArea.innerHTML = "";
    const fragment = document.createDocumentFragment();

    this.state.players.forEach((player, i) => {
      const btn = document.createElement("button");
      btn.textContent = player;
      btn.className = "player-btn";
      btn.dataset.index = i;
      fragment.appendChild(btn);
    });

    this.ui.buttonsArea.appendChild(fragment);
  }

  showPhrase(index, button) {
    if (this.state.viewed[index]) return;

    this.state.viewed[index] = true;
    button.disabled = true;

    const isImpostor = index === this.state.impostorIndex;
    const { tema, impostor, oficial } = this.state.currentSet;

    this.ui.phraseBox.classList.remove("hidden");
    this.ui.phraseTheme.textContent = tema;
    this.ui.phraseText.textContent = isImpostor ? impostor : oficial;

    this.checkRoundReady();
  }

  hidePhrase() {
    this.ui.phraseText.textContent = "📱 Passe o celular";
    this.ui.phraseTheme.textContent = "...";
    
    setTimeout(() => {
        if(!this.ui.phraseBox.classList.contains('hidden')) {
            this.ui.phraseBox.classList.add("hidden");
        }
    }, 800);
  }

  checkRoundReady() {
    const allViewed = this.state.viewed.every(v => v);
    if (allViewed) {
      this.ui.roundStatus.classList.remove("hidden");
      this.ui.roundStatus.innerHTML = `✅ Todos já viram suas frases!`;
      this.ui.revealOfficialBtn.disabled = false;
    }
  }

  generateOrder() {
    const shuffled = [...this.state.players];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    this.ui.orderBox.innerHTML = shuffled.join(" → ");
  }

  revealOfficial() {
    this.ui.result.classList.remove("hidden");
    this.ui.result.innerHTML = `
      <p>📌 Tema: <b>${this.state.currentSet.tema}</b></p>
      <hr style="margin: 10px 0; opacity: 0.3">
      <p>✅ Frase Oficial:</p>
      <h3>${this.state.currentSet.oficial}</h3>
    `;
  }

  revealAll() {
    const impostorName = this.state.players[this.state.impostorIndex];
    this.ui.result.classList.remove("hidden");
    this.ui.result.innerHTML = `
      <h2 style="color: #ff4757">🕵️ Impostor: ${impostorName}</h2>
      <br>
      <p>📌 Tema: ${this.state.currentSet.tema}</p>
      <p>✅ ${this.state.currentSet.oficial}</p>
      <p>😈 ${this.state.currentSet.impostor}</p>
    `;
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  new ImpostorGame();
});