'use strict';

// ── Configurazione ──

// Mostra il pulsante di riavvio usato durante le prove.
const TEST_MODE = false;
const $ = id => document.getElementById(id);

const isBonus = new URLSearchParams(window.location.search).has('bonus');
const questionsFile = isBonus ? 'domande-extra.json' : 'domande.json';
const progressKey = isBonus ? 'quizBonusProgress' : 'quizProgress';

// ── Animazioni ed effetti ──

function lanciaCoriandoli() {

  $('score').animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(2.5)', color: '#22c55e' },
        { transform: 'scale(1)' }
      ],
      { duration: 850, easing: 'ease-out' }
    );

  // Rispetta la preferenza di sistema per il movimento ridotto.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const colori = ['#ad9cff', '#54e6a5', '#ffd166', '#ff7597', '#65d6ff'];
  // Lo strato copre la finestra e lascia passare i clic.
  const strato = document.createElement('div');

  strato.setAttribute('aria-hidden', 'true');
  Object.assign(strato.style, {
    position: 'fixed',
    inset: '0',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: '9999'
  });
  document.body.append(strato);

  const animazioni = [];

  // Alterna il lato di partenza e varia la traiettoria di ogni coriandolo.
  for (let i = 0; i < 60; i++) {
    const daSinistra = i % 2 === 0;
    const pezzo = document.createElement('span');

    Object.assign(pezzo.style, {
      position: 'absolute',
      left: daSinistra ? '4%' : '96%',
      bottom: '-12px',
      width: '7px',
      height: '12px',
      borderRadius: '2px',
      backgroundColor: colori[i % colori.length]
    });
    strato.append(pezzo);

    const direzione = daSinistra ? 1 : -1;
    const distanza = direzione * (12 + Math.random() * 38);
    const altezza = 30 + Math.random() * 45;
    const rotazione = direzione * (180 + Math.random() * 540);

    const volo = pezzo.animate([
      {
        transform: 'translate(0, 0) rotate(0deg)',
        easing: 'ease-out'
      },
      {
        transform: `translate(${distanza * 0.6}vw, -${altezza}vh) rotate(${rotazione / 2}deg)`,
        offset: 0.45,
        easing: 'ease-in'
      },
      {
        transform: `translate(${distanza}vw, 4vh) rotate(${rotazione}deg)`
      }
    ], {
      duration: 1200 + Math.random() * 650,
      delay: Math.random() * 180
    });

    animazioni.push(volo.finished);
  }

  // Rimuove lo strato quando tutti i coriandoli hanno terminato o sono stati annullati.
  Promise.allSettled(animazioni).then(() => strato.remove());
}

// Aggiungi qui nuovi effetti e usa il loro nome in "effetti" in domande.json.
const effettiQuiz = {
  festeggia() {
    $('score').animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.4)', color: '#22c55e' },
        { transform: 'scale(1)' }
      ],
      { duration: 550, easing: 'ease-out' }
    );
  },
  // Mostra una spiegazione geografica quando viene sbagliata
  // la domanda sul confine tra Francia e Brasile.
  scopriGuyana() {
    const dialog = document.createElement('dialog');
    dialog.className = 'guyana-dialog';
    dialog.setAttribute('aria-label', 'Curiosità sulla Guyana francese');

    dialog.innerHTML = `
      <div class="guyana-visual" aria-hidden="true">
        <div>🇫🇷<small>Francia<br>Europa</small></div>
        <span>➜</span>
        <div>🌎<small>Guyana francese<br>Sud America</small></div>
      </div>

      <h3>La Francia confina col Brasile?! 🤯</h3>

      <p>
        La <strong>Guyana francese</strong> si trova in
        Sud America, ma è parte integrante della Francia!
        Confina con il <strong>Brasile 🇧🇷</strong>,
        formando il confine terrestre più lungo della Francia.
      </p>

      <form method="dialog">
        <button type="submit">Ora è tutto chiaro!</button>
      </form>
    `;

    document.body.append(dialog);

    // Rimuove la finestra quando viene chiusa.
    dialog.addEventListener('close', () => dialog.remove(), {
      once: true
    });

    dialog.showModal();
  },
  // Avvia la scena solo per la risposta corretta di Miller.
  miller() {
    const domandaCorrente = position;
    setTimeout(() => {
      // Se il giocatore è già passato alla prossima domanda, non interromperlo.
      if (position === domandaCorrente && answered) avviaScenaMiller();
    }, 1300);
  },
  cadutaLibera() {

    // Evita di aprire due animazioni contemporaneamente.
    document.getElementById('caduta-libera')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'caduta-libera';

    overlay.innerHTML = `
      <div class="pannello">
        <h2>🔬 Esperimento di Galileo</h2>
        <p>Due masse diverse. Stessa altezza. Nessuna aria.</p>

        <div class="campo">
          <div class="sfera leggera">1 kg</div>
          <div class="sfera pesante">10 kg</div>
          <div class="suolo"></div>
        </div>

        <div class="risultato">🏁 Arrivano insieme!</div>
        <p>Nel vuoto la gravità accelera entrambi allo stesso modo.</p>

        <button type="button">Chiudi</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Chiusura manuale.
    overlay.querySelector('button').addEventListener('click', () => {
      overlay.remove();
    });

    // Chiusura automatica dopo 5 secondi.
    setTimeout(() => overlay.remove(), 5000);
  }
};
function planeTransition(callback) {
  const transition = document.getElementById('plane-transition');

  // Forza il ricalcolo del layout per far ripartire l’animazione CSS.
  transition.classList.remove('active');
  void transition.offsetWidth;
  transition.classList.add('active');

  // Avvia il quiz quando l’ala copre la finestra.
  setTimeout(() => {
    callback();
  }, 1100);

  // Rimuove la classe al termine dell’animazione.
  setTimeout(() => {
    transition.classList.remove('active');
  }, 2200);
}

// ── Mescolamento e stato del tentativo ──

// Fisher–Yates su una copia, così l’array di partenza mantiene il suo ordine.
const shuffle = array => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// questions contiene il pool caricato, round contiene le domande del tentativo.
let questions = [];
let round = [];
let position = 0;
let points = 0;
let answered = false;
let selectedAnswer = null;
let currentOptions = [];

// ── Salvataggio e ripristino ──

// Salva anche la scelta e l’ordine delle opzioni per ricostruire la schermata dopo un reload.
function saveProgress() {
  localStorage.setItem(progressKey, JSON.stringify({
    round,
    position,
    points,
    answered,
    selectedAnswer,
    currentOptions,
    ollySbloccato
  }));
}

function restoreProgress() {
  const saved = localStorage.getItem(progressKey);
  if (!saved) return false;

  try {
    const state = JSON.parse(saved);

    if (
      !Array.isArray(state.round) ||
      state.round.length === 0 ||
      !Number.isInteger(state.position) ||
      state.position < 0 ||
      state.position > state.round.length ||
      !Number.isInteger(state.points) ||
      state.points < 0 ||
      state.points > state.round.length
    ) {
      throw new Error('Salvataggio non valido');
    }

    round = state.round;
    position = state.position;
    points = state.points;
    answered = state.answered === true;
    selectedAnswer = state.selectedAnswer ?? null;
    currentOptions = state.currentOptions || [];
    ollySbloccato = state.ollySbloccato === true;

    // Una posizione pari alla lunghezza del round indica un tentativo concluso.
    if (position >= round.length) {
      showResult();
    } else {
      show('quiz-screen');
      renderQuestion(true);
    }

    return true;
  } catch (error) {
    localStorage.removeItem(progressKey);
    return false;
  }
}

// ── Schermate e caricamento delle domande ──

function show(screen) {
  ['start-screen', 'quiz-screen', 'end-screen'].forEach(id => $(id).hidden = id !== screen);
}

async function loadQuestions() {
  try {
    const response = await fetch(questionsFile, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data) || !data.length) throw new Error('Il file deve contenere un array non vuoto.');
    for (const [i, item] of data.entries()) {
      if (
        !item ||
        typeof item.domanda !== 'string' ||
        !item.domanda.trim() ||
        !Array.isArray(item.risposte) ||
        item.risposte.length !== 4 ||
        item.risposte.some(a => typeof a !== 'string' ||
        !a.trim()) ||
        !(
          (Number.isInteger(item.corretta) &&
          item.corretta >= 0 &&
          item.corretta <= 3) ||
          (Array.isArray(item.corretta) &&
          item.corretta.length > 0 &&
          item.corretta.every(n =>
            Number.isInteger(n) && n >= 0 && n <= 3
          ) &&
          new Set(item.corretta).size === item.corretta.length)
        )
      ) {
        throw new Error(`Domanda ${i + 1} non valida: servono domanda, quattro risposte e corretta (0–3).`);
      }
    }
    questions = data;
    $('total-questions').textContent = questions.length;
    $('start-btn').disabled = false;
    $('start-btn').innerHTML = 'Iniziamo!<span>→</span>';
    const restored = restoreProgress();
    if (isBonus && !restored) {
      start();
    }
  } catch (err) {
    $('load-error').hidden = false;
    $('load-error').textContent = `Impossibile caricare domande.json: ${err.message}. Apri il sito tramite un server web, non con file://.`;
    $('start-btn').textContent = 'Quiz non disponibile';
  }
}

// ── Avvio e visualizzazione della domanda ──

function start() {
  round = shuffle(questions);
  position = 0;
  points = 0;
  answered = false;
  selectedAnswer = null;
  currentOptions = [];

  // Blocca nuovamente Olly a ogni nuova partita
  ollySbloccato = false;

  saveProgress();

  show('quiz-screen');
  renderQuestion();
}

// =====================================
// MASCOTTE CANTANTE
// =====================================

let ollyTimer = null;
let ollySbloccato = false;

function mostraOlly() {
  const mascotte = document.getElementById('olly-mascot');

  if (!mascotte) return;

  // Annulla un'eventuale animazione precedente
  clearTimeout(ollyTimer);

  mascotte.classList.remove('visible');

  // Riavvia l'animazione di ingresso
  void mascotte.offsetWidth;

  mascotte.classList.add('visible');

  // Dopo 2 secondi, la mascotte scompare
  ollyTimer = setTimeout(() => {
    mascotte.classList.remove('visible');
  }, 4000);
}

function renderQuestion(restoring = false) {
  if (!restoring) {
    answered = false;
    selectedAnswer = null;
    currentOptions = [];
  }

  const q = round[position];

  if (q.domanda.toLowerCase().includes('festa')) {
    mostraOlly();
    ollySbloccato = true;
  } else if (!restoring && ollySbloccato && Math.random() < 0.3) {
    mostraOlly();
  }

  $('counter').textContent = `DOMANDA ${position + 1} DI ${round.length}`;
  $('score').textContent = `${points} ${points === 1 ? 'punto' : 'punti'}`;
  $('progress-fill').style.width = `${position / round.length * 100}%`;
  $('question-text').textContent = q.domanda;
  $('feedback').textContent = '';
  $('next-btn').hidden = true;

  const container = $('answers');
  container.replaceChildren();

  // Mantiene l’indice nel JSON per verificare la risposta anche dopo averla mescolata.
  if (!restoring || currentOptions.length !== 4) {
    currentOptions = shuffle(q.risposte.map((text, index) => ({
      text,
      index
    })));
  }

  currentOptions.forEach((option, displayIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer';

    const letter = document.createElement('span');
    letter.className = 'letter';
    letter.textContent = 'ABCD'[displayIndex];

    const content = document.createElement('span');
    content.textContent = option.text;

    button.append(letter, content);
    button.addEventListener('click', () => choose(option.index));
    button.dataset.index = String(option.index);

    container.append(button);
  });

  // Ricostruisce il feedback senza eseguire di nuovo choose e i suoi effetti.
  if (restoring && answered) {
    displayAnswer(selectedAnswer);
  }

  saveProgress();
}

// ── Risposte, feedback ed effetti ──

// Verifica se l'indice selezionato è tra le risposte corrette.
// Supporta sia un numero singolo che un array.
function isCorrectAnswer(question, index) {
  const corrette = Array.isArray(question.corretta)
    ? question.corretta
    : [question.corretta];

  return corrette.includes(index);
}

function choose(index) {
  if (answered) return;

  answered = true;
  selectedAnswer = index;

  const q = round[position];
  const correct = isCorrectAnswer(q, index);

  if (correct) {
    points++;
    lanciaCoriandoli();
  }

  displayAnswer(index);
  saveProgress();

  // Gestisce gli effetti personalizzati della domanda.
  const esito = correct ? 'giusta' : 'sbagliata';
  const nomeEffetto = q.effetti?.[esito] ?? q.effetti?.sempre;

  if (nomeEffetto && Object.hasOwn(effettiQuiz, nomeEffetto)) {
    effettiQuiz[nomeEffetto]();
  }
}

function displayAnswer(index) {
  const q = round[position];
  const correct = isCorrectAnswer(q, index);

  for (const button of $('answers').children) {
    button.disabled = true;

    const optionIndex = Number(button.dataset.index);

    if (isCorrectAnswer(q, optionIndex)) {
      button.classList.add('correct');
    } else if (optionIndex === index) {
      button.classList.add('incorrect');
    }
  }

  $('score').textContent =
    `${points} ${points === 1 ? 'punto' : 'punti'}`;

  const esito = correct ? 'giusta' : 'sbagliata';
  const messaggio = q.feedback?.[esito];

  if (correct) {
    $('feedback').textContent =
      `✓ ${messaggio ?? 'Esatto! Risposta corretta.'}`;
  } else {
    const indiciCorretti = Array.isArray(q.corretta)
      ? q.corretta
      : [q.corretta];

    const risposteGiuste = indiciCorretti
      .map(i => q.risposte[i])
      .join(', ');

    const testoRisposta = indiciCorretti.length === 1
      ? `La risposta corretta è: ${risposteGiuste}`
      : `Le risposte corrette sono: ${risposteGiuste}`;

    $('feedback').textContent =
      `✕ ${messaggio ?? 'Non proprio!'} ${testoRisposta}`;
  }

  $('progress-fill').style.width =
    `${(position + 1) / round.length * 100}%`;

  $('next-btn').innerHTML =
  position === round.length - 1
    ? 'Vedi il risultato <span>→</span>'
    : 'Prossima domanda <span>→</span>';

  $('next-btn').hidden = false;
}

// ── Avanzamento e risultato finale ──

function next() {
  if (!answered) return;

  position++;
  answered = false;
  selectedAnswer = null;
  currentOptions = [];

  saveProgress();

  if (position < round.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  show('end-screen');

  $('final-score').textContent = `${points} / ${round.length}`;

  const percentage = points / round.length * 100;

  $('final-message').textContent =
    percentage === 100
      ? 'Perfetto! Hai risposto correttamente a tutte le domande.'
      : percentage >= 70
        ? 'Bel risultato! Hai dimostrato di saperne parecchio.'
        : 'Ogni tentativo è un allenamento. Riprova e migliora il tuo punteggio!';
}

// ── Eventi e inizializzazione ──

$('start-btn').addEventListener('click', () => {
  planeTransition(start);
});

$('retry-btn').addEventListener('click', () => {
  localStorage.removeItem(progressKey);
  location.reload();
});
$('next-btn').addEventListener('click', next);
loadQuestions();

$('restart-btn').hidden = !TEST_MODE;
$('restart-btn').addEventListener('click', () => {
  console.log('RESTART CLICCATO');
  if (!confirm('Vuoi davvero ricominciare il quiz?')) return;

  localStorage.removeItem(progressKey);

  location.reload();
});