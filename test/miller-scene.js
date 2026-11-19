'use strict';

// Scenetta originale ispirata al pianeta di Miller di Interstellar.
// Nessun video, asset esterno o dipendenza.
(function () {
  function avviaScenaMiller() {
    if (document.getElementById('miller-scene')) return;

    const movimentoRidotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scena = document.createElement('div');
    scena.id = 'miller-scene';
    scena.className = 'miller-scene';
    scena.setAttribute('role', 'dialog');
    scena.setAttribute('aria-modal', 'true');
    scena.setAttribute('aria-label', 'Scena del pianeta di Miller');

    scena.innerHTML = `
      <button class="miller-skip" type="button" aria-label="Salta la scena">Salta ✕</button>
      <div class="miller-world" aria-hidden="true">
        <div class="miller-cloud miller-cloud-1"></div>
        <div class="miller-cloud miller-cloud-2"></div>
        <div class="miller-horizon"></div>
        <div class="miller-water"></div>
        <div class="miller-ship">
          <svg viewBox="0 0 280 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M18 62 L90 49 112 27 169 27 191 49 262 62 262 76 192 73 172 91 108 91 88 73 18 76 Z" fill="#1a2c38" stroke="#88a1aa" stroke-width="3" />
            <path d="M112 27 L168 27 154 47 126 47 Z" fill="#8dc4d0" opacity=".7"/>
            <path d="M20 70 L82 64 M198 64 L260 70" stroke="#d4edf0" stroke-width="3" opacity=".7"/>
          </svg>
        </div>
        <div class="miller-wave"><div class="miller-foam"></div></div>
        <div class="miller-scene-title">
          <span>MISSIONE MILLER</span>
          <strong>Qui il tempo non perdona.</strong>
        </div>
      </div>
      <div class="miller-flash" aria-hidden="true"></div>
      <div class="miller-result" role="status">
        <span class="miller-kicker">DILATAZIONE TEMPORALE</span>
        <div class="miller-time">
          <span>1 ORA <small>SUL PIANETA</small></span>
          <b>≈</b>
          <span class="miller-seven">7 ANNI <small>SULLA TERRA</small></span>
        </div>
        <p>Hai studiato per un'ora.<br>Sulla Terra sono passati sette anni.</p>
        <strong class="miller-joke">La commissione è già andata in pensione. 🎓</strong>
      </div>
    `;

    document.body.appendChild(scena);
    const salta = scena.querySelector('.miller-skip');
    const timer = [];
    let chiusa = false;

    function programma(fn, millisecondi) {
      timer.push(window.setTimeout(fn, millisecondi));
    }

    function chiudi() {
      if (chiusa) return;
      chiusa = true;
      timer.forEach(clearTimeout);
      document.removeEventListener('keydown', tastoPremuto);
      scena.remove();
      const prossimo = document.getElementById('next-btn');
      if (prossimo && !prossimo.hidden) prossimo.focus();
    }

    function tastoPremuto(evento) {
      if (evento.key === 'Escape') chiudi();
    }

    salta.addEventListener('click', chiudi);
    document.addEventListener('keydown', tastoPremuto);
    salta.focus();

    if (movimentoRidotto) {
      scena.classList.add('miller-result-visible');
      programma(chiudi, 6500);
      return;
    }

    requestAnimationFrame(() => {
      if (!chiusa) scena.classList.add('miller-play');
    });

    // L'onda arriva, copre la vista e lascia spazio alla rivelazione.
    programma(() => scena.classList.add('miller-impact'), 3100);
    programma(() => scena.classList.add('miller-result-visible'), 4100);
    programma(chiudi, 9200);
  }

  window.avviaScenaMiller = avviaScenaMiller;
})();
