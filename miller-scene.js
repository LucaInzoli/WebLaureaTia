
'use strict';

// ── Interstellar: pianeta di Miller ──
// Mostra la schermata del salto temporale.
// Si attiva con:
// "effetti": { "giusta": "miller" }

(function () {

  function avviaScenaMiller() {

    // Evita di aprire più schermate contemporaneamente.
    if (document.getElementById('miller-scene')) return;

    // Crea lo sfondo della scenetta.
    const scena = document.createElement('div');
    scena.id = 'miller-scene';
    scena.className = 'miller-scene';

    scena.setAttribute('role', 'dialog');
    scena.setAttribute('aria-modal', 'true');
    scena.setAttribute(
      'aria-label',
      'Tempo trascorso sul pianeta di Miller'
    );

    // Contenuto della schermata finale.
    scena.innerHTML = `
      <button class="miller-skip"
              type="button"
              aria-label="Chiudi la schermata">
        Chiudi ✕
      </button>

      <div class="miller-result" role="status">

        <span class="miller-kicker">
          DILATAZIONE TEMPORALE
        </span>

        <div class="miller-time">
          <span>
            1 ORA
            <small>SUL PIANETA</small>
          </span>

          <b>≈</b>

          <span class="miller-seven">
            7 ANNI
            <small>SULLA TERRA</small>
          </span>
        </div>

        <p>
          Hai studiato per un'ora.<br>
          Sulla Terra sono passati sette anni.
        </p>

        <strong class="miller-joke">
          La commissione è già andata in pensione. 🎓
        </strong>

      </div>
    `;

    document.body.appendChild(scena);

    const chiudiBtn = scena.querySelector('.miller-skip');

    let chiusa = false;
    let timeoutChiusura;

    // ── Chiusura della scenetta ──

    function chiudi() {
      if (chiusa) return;

      chiusa = true;

      clearTimeout(timeoutChiusura);
      document.removeEventListener('keydown', onKeydown);

      scena.remove();

      // Riporta il focus al pulsante del quiz.
      const prossimo = document.getElementById('next-btn');

      if (prossimo && !prossimo.hidden) {
        prossimo.focus();
      }
    }

    // Permette di chiudere premendo ESC.
    function onKeydown(evento) {
      if (evento.key === 'Escape') {
        chiudi();
      }
    }

    chiudiBtn.addEventListener('click', chiudi);
    document.addEventListener('keydown', onKeydown);

    chiudiBtn.focus();

    // ── Animazione di comparsa ──

    requestAnimationFrame(() => {
      if (!chiusa) {
        scena.classList.add('miller-result-visible');
      }
    });

    // Chiusura automatica dopo 6 secondi.
    timeoutChiusura = window.setTimeout(chiudi, 6000);
  }

  // Rende la funzione richiamabile da script.js.
  window.avviaScenaMiller = avviaScenaMiller;

})();
