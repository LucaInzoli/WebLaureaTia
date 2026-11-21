
"use strict";

// =====================================================
// REAZIONE A CATENA - CONFIGURAZIONE
// =====================================================

// Modifica qui le parole.
// Vengono mostrate esattamente in questo ordine.
const parole = [
  "Sole",
  "Luna",
  "Mare",
  "Vento",
  "Fuoco",
  "Stella",
  "Tempo",
  "Cuore"
];

// =====================================================
// STATO DEL GIOCO
// =====================================================

let posizione = 0;
let punteggio = 0;

// Elementi HTML
const parolaElement = document.getElementById("word");
const counterElement = document.getElementById("counter");
const scoreElement = document.getElementById("score");
const progressElement = document.getElementById("progress-fill");

// =====================================================
// VISUALIZZAZIONE DELLA PAROLA
// =====================================================

function mostraParola() {

  if (!parole.length) {
    parolaElement.textContent = "Nessuna parola";
    counterElement.textContent = "AGGIUNGI LE PAROLE IN SCRIPT.JS";
    progressElement.style.width = "0%";
    return;
  }

  // Mostra la parola corrente
  parolaElement.textContent = parole[posizione];

  // Aggiorna il contatore
  counterElement.textContent =
    `PAROLA ${posizione + 1} DI ${parole.length}`;

  // Aggiorna la barra di avanzamento
  progressElement.style.width =
    `${((posizione + 1) / parole.length) * 100}%`;

  // Piccola animazione al cambio parola
  parolaElement.classList.remove("appear");

  void parolaElement.offsetWidth;

  parolaElement.classList.add("appear");
}

// =====================================================
// GESTIONE DEL PUNTEGGIO
// =====================================================

function aggiornaPunteggio() {
  scoreElement.textContent = punteggio;
}

// =====================================================
// CONTROLLI DA TASTIERA
// =====================================================

document.addEventListener("keydown", (event) => {

  switch (event.key) {

    // Freccia destra: parola successiva
    case "ArrowRight":

      event.preventDefault();

      if (posizione < parole.length - 1) {
        posizione++;
        mostraParola();
      }

      return;

    // Freccia sinistra: parola precedente
    case "ArrowLeft":

      event.preventDefault();

      if (posizione > 0) {
        posizione--;
        mostraParola();
      }

      return;
  }

  // Tasto + : aggiunge un punto
  if (
    event.key === "+" ||
    event.code === "NumpadAdd"
  ) {

    event.preventDefault();

    punteggio++;
    aggiornaPunteggio();

  }

  // Tasto - : toglie un punto
  else if (
    event.key === "-" ||
    event.key === "−" ||
    event.code === "NumpadSubtract"
  ) {

    event.preventDefault();

    punteggio = Math.max(0, punteggio - 1);
    aggiornaPunteggio();

  }

});

// =====================================================
// INIZIALIZZAZIONE
// =====================================================

mostraParola();
aggiornaPunteggio();
