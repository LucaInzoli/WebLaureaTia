'use strict';
const TEST_MODE = true;
const $ = id => document.getElementById(id);

function lanciaCoriandoli() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const colori = ['#ad9cff', '#54e6a5', '#ffd166', '#ff7597', '#65d6ff'];
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

  Promise.allSettled(animazioni).then(() => strato.remove());
}

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
  }
};
const shuffle = array => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
let questions = [], round = [], position = 0, points = 0, answered = false;
let selectedAnswer = null;
let currentOptions = [];

function saveProgress() {
  localStorage.setItem('quizProgress', JSON.stringify({
    round,
    position,
    points,
    answered,
    selectedAnswer,
    currentOptions
  }));
}

function restoreProgress() {
  const saved = localStorage.getItem('quizProgress');
  if (!saved) return false;

  try {
    const state = JSON.parse(saved);

    if (!Array.isArray(state.round) ||
        state.round.length === 0 ||
        !Number.isInteger(state.position) ||
        state.position < 0 ||
        state.position > state.round.length ||
        !Number.isInteger(state.points) ||
        state.points < 0 ||
        state.points > state.round.length) {
      throw new Error('Salvataggio non valido');
    }

    round = state.round;
    position = state.position;
    points = state.points;
    answered = state.answered === true;
    selectedAnswer = state.selectedAnswer ?? null;
    currentOptions = state.currentOptions || [];

    if (position >= round.length) {
      showResult();
    } else {
      show('quiz-screen');
      renderQuestion(true);
    }

    return true;
  } catch (error) {
    localStorage.removeItem('quizProgress');
    return false;
  }
}

function show(screen) {
  ['start-screen', 'quiz-screen', 'end-screen'].forEach(id => $(id).hidden = id !== screen);
}

async function loadQuestions() {
  try {
    const response = await fetch('domande.json', {cache: 'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data) || !data.length) throw new Error('Il file deve contenere un array non vuoto.');
    for (const [i, item] of data.entries()) {
      if (!item || typeof item.domanda !== 'string' || !item.domanda.trim() || !Array.isArray(item.risposte) || item.risposte.length !== 4 || item.risposte.some(a => typeof a !== 'string' || !a.trim()) || !Number.isInteger(item.corretta) || item.corretta < 0 || item.corretta > 3) {
        throw new Error(`Domanda ${i + 1} non valida: servono domanda, quattro risposte e corretta (0–3).`);
      }
    }
    questions = data;
    $('total-questions').textContent = questions.length;
    $('start-btn').disabled = false;
    $('start-btn').innerHTML = 'Iniziamo!<span>→</span>';
    restoreProgress();
  } catch (err) {
    $('load-error').hidden = false;
    $('load-error').textContent = `Impossibile caricare domande.json: ${err.message}. Apri il sito tramite un server web, non con file://.`;
    $('start-btn').textContent = 'Quiz non disponibile';
  }
}

function start() {
  round = shuffle(questions);
  position = 0;
  points = 0;
  answered = false;
  selectedAnswer = null;
  currentOptions = [];

  saveProgress();

  show('quiz-screen');
  renderQuestion();
}

function renderQuestion(restoring = false) {
  if (!restoring) {
    answered = false;
    selectedAnswer = null;
    currentOptions = [];
  }

  const q = round[position];

  $('counter').textContent = `DOMANDA ${position + 1} DI ${round.length}`;
  $('score').textContent = `${points} ${points === 1 ? 'punto' : 'punti'}`;
  $('progress-fill').style.width = `${position / round.length * 100}%`;
  $('question-text').textContent = q.domanda;
  $('feedback').textContent = '';
  $('next-btn').hidden = true;

  const container = $('answers');
  container.replaceChildren();

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

  if (restoring && answered) {
    displayAnswer(selectedAnswer);
  }

  saveProgress();
}

function choose(index) {
  if (answered) return;

  answered = true;
  selectedAnswer = index;

  const q = round[position];

  if (index === q.corretta) {
    points++;
    lanciaCoriandoli();
  }

  displayAnswer(index);
  saveProgress();
  const esito = index === q.corretta ? 'giusta' : 'sbagliata';
  const nomeEffetto = q.effetti?.[esito] ?? q.effetti?.sempre;

  if (nomeEffetto && Object.hasOwn(effettiQuiz, nomeEffetto)) {
    effettiQuiz[nomeEffetto]();
  }
}

function displayAnswer(index) {
  const q = round[position];
  const correct = index === q.corretta;

  for (const button of $('answers').children) {
    button.disabled = true;

    const optionIndex = Number(button.dataset.index);

    if (optionIndex === q.corretta) {
      button.classList.add('correct');
    } else if (optionIndex === index) {
      button.classList.add('incorrect');
    }
  }

  $('score').textContent = `${points} ${points === 1 ? 'punto' : 'punti'}`;

  const esito = correct ? 'giusta' : 'sbagliata';
  const messaggio = q.feedback?.[esito];

  if (correct) {
    $('feedback').textContent = `✓ ${messaggio ?? 'Esatto! Risposta corretta.'}`;
  } else {
    const rispostaGiusta = q.risposte[q.corretta];
    $('feedback').textContent =
      `✕ ${messaggio ?? 'Non proprio!'} La risposta giusta è: ${rispostaGiusta}`;
  }

  $('progress-fill').style.width =
    `${(position + 1) / round.length * 100}%`;

  $('next-btn').textContent =
    position === round.length - 1
      ? 'Vedi il risultato →'
      : 'Prossima domanda →';

  $('next-btn').hidden = false;
}

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
//$('start-btn').addEventListener('click', start);
//$('retry-btn').addEventListener('click', start);
$('start-btn').addEventListener('click', () => {
  planeTransition(start);
});

$('retry-btn').addEventListener('click', () => {
  planeTransition(start);
});
$('next-btn').addEventListener('click', next);
loadQuestions();

$('restart-btn').hidden = !TEST_MODE;
$('restart-btn').addEventListener('click', () => {
  console.log('RESTART CLICCATO');
  if (!confirm('Vuoi davvero ricominciare il quiz?')) return;

  localStorage.removeItem('quizProgress');

  location.reload();
});

function planeTransition(callback) {
  const transition = document.getElementById('plane-transition');

  // Riavvia l'animazione
  transition.classList.remove('active');
  void transition.offsetWidth;
  transition.classList.add('active');

  // Cambia schermata quando l'ala copre il browser
  setTimeout(() => {
    callback();
  }, 1100);

  // Ripulisce l'animazione
  setTimeout(() => {
    transition.classList.remove('active');
  }, 2200);
}