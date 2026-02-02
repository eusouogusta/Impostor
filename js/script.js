/**
 * BANCO DE DADOS
 * Separado em constante para facilitar manutenção futura.
 */
const PHRASES_DB = [
  { tema: "Objetos", oficial: "Algo que você usaria todos os dias", impostor: "Algo que você evitaria sempre" },
  { tema: "Superpoderes", oficial: "Um poder que facilitaria sua vida", impostor: "Um poder que complicaria sua vida" },
  { tema: "Lugares", oficial: "Um lugar onde você se sentiria em casa", impostor: "Um lugar onde você se sentiria desconfortável" },
  { tema: "Comida", oficial: "Algo que você comeria sem enjoar", impostor: "Algo que você evitaria comer" },
  { tema: "Animais", oficial: "Um animal que você gostaria de ter", impostor: "Um animal que te daria medo" },
  { tema: "Clima", oficial: "Um tipo de clima agradável", impostor: "Um tipo de clima insuportável" },
  { tema: "Rotina", oficial: "Algo que faz parte do seu dia", impostor: "Algo que você nunca faria no dia a dia" },
  { tema: "Objetos pessoais", oficial: "Algo que você sempre leva com você", impostor: "Algo que você nunca levaria" },
  { tema: "Situações", oficial: "Algo que daria uma vergonha leve", impostor: "Algo que seria extremamente vergonhoso" },
  { tema: "Coisas irritantes", oficial: "Algo que te incomoda um pouco", impostor: "Algo que te deixa muito irritado" },
  { tema: "Hábitos", oficial: "Um hábito estranho mas aceitável", impostor: "Um hábito completamente bizarro" },
  { tema: "Mentiras", oficial: "Uma mentira social aceitável", impostor: "Uma mentira absurda" },
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
      impostorIndex: null
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
    this.bindEvents();
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
    // Uso de map para gerar HTML de forma mais limpa
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
    // Reset de estado
    this.state.viewed = new Array(this.state.players.length).fill(false);
    this.state.currentSet = PHRASES_DB[Math.floor(Math.random() * PHRASES_DB.length)];
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
    const fragment = document.createDocumentFragment(); // Performance: Reflow único

    this.state.players.forEach((player, i) => {
      const btn = document.createElement("button");
      btn.textContent = player;
      btn.className = "player-btn";
      btn.dataset.index = i; // Usado no Event Delegation
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
    
    // Pequeno delay para UX
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
    // Algoritmo Fisher-Yates Shuffle para aleatoriedade real (Performance/Correção)
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