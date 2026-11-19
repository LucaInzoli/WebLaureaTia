# Quiz Mattia · Guida al quiz

Versione documentata il 19 novembre 2026, dai quattro sorgenti della cartella Quiz Mattia. Il quiz è un sito statico per la festa di laurea di Mattia. Il Raspberry serve i file e il browser gestisce domande, punteggio, animazioni e salvataggio.

## Dove fare una modifica

| Voglio cambiare… | File | Punto da cercare |
|---|---|---|
| Titolo, frase di apertura o testo dei pulsanti | `index.html` | Le sezioni `start-screen`, `quiz-screen` ed `end-screen` |
| Domande, soluzioni e battute | `domande.json` | L’oggetto della singola domanda |
| Colori, impaginazione mobile o traiettoria dell’aereo | `style.css` | `.answer.correct`, `.answer.incorrect`, `@keyframes planeFly` |
| Regole, effetti e ripristino | `script.js` | `choose`, `effettiQuiz`, `restoreProgress` |

## Una partita dall’inizio al risultato

1. Apri il sito via HTTP o HTTPS. `loadQuestions()` carica `domande.json`, controlla i campi obbligatori e abilita «Iniziamo!». Se un oggetto è malformato, il quiz mostra l’errore all’avvio.
2. «Iniziamo!» attiva `planeTransition(start)`. L’aereo attraversa lo schermo in 2,2 secondi e la partita inizia a metà della transizione. `start()` mescola tutte le **27 domande** attuali. Ogni tentativo usa l’intera raccolta.
3. `renderQuestion()` mescola anche le quattro opzioni, conservandone gli indici originali. Al primo clic `choose(index)` blocca ulteriori risposte. Una risposta esatta vale un punto e attiva i coriandoli.
4. `displayAnswer()` evidenzia la soluzione, scrive il feedback e mostra «Prossima domanda» oppure «Vedi il risultato». In caso di errore aggiunge anche il testo della soluzione.
5. Dopo l’ultima domanda, `showResult()` mostra il totale e sceglie il messaggio in base al risultato (100%, almeno 70%, sotto il 70%). «Riprova» genera un nuovo ordine e azzera il punteggio.

La schermata iniziale recita «1 solo e unico tentativo». Il codice permette di riprovare dalla schermata finale. Inoltre `TEST_MODE = true` rende visibile «Ricomincia» durante la partita. Impostarlo a `false` nasconde quel pulsante di prova. Il pulsante finale «Riprova» ha una gestione separata.

## Scrivere una domanda

Il file è un array JSON. Inserisci ogni domanda tra parentesi graffe, separa gli oggetti con una virgola e chiudi l’ultimo senza virgola finale. Esempio completo di un oggetto da inserire nell’array:

```json
{
  "domanda": "Nel vuoto lasci cadere due oggetti di massa diversa dalla stessa altezza e nello stesso istante. Quale arriva prima?",
  "risposte": [
    "Quello più pesante",
    "Quello più leggero",
    "Arrivano insieme",
    "Dipende dalla densità"
  ],
  "corretta": 2,
  "feedback": {
    "giusta": "Esatto dottore! Un punto a te e uno a Galileo.",
    "sbagliata": "Stavolta il punto va a Galileo."
  },
  "effetti": { "giusta": "festeggia" }
}
```

Servono una domanda con testo, quattro risposte con testo e un intero da 0 a 3 in `corretta`. Nell’esempio il valore 2 indica la terza voce di `risposte`, «Arrivano insieme», qualunque lettera le venga assegnata sullo schermo. Se sposti una risposta nel JSON, aggiorna il suo indice.

### Feedback ed effetti

| Impostazione | Comportamento |
|---|---|
| `feedback.giusta` o `feedback.sbagliata` | Sostituisce la frase standard per quell’esito. Il quiz aggiunge il simbolo ✓ o ✕. |
| `effetti.giusta` o `effetti.sbagliata` | Esegue la funzione registrata con quel nome in `effettiQuiz`. |
| `effetti.sempre` | Effetto di riserva se manca quello specifico dell’esito. |
| Campi facoltativi assenti | Il quiz usa il feedback standard. I coriandoli partono comunque a ogni risposta corretta. |

`lanciaCoriandoli()` parte in `choose()` subito dopo `points++`. Lancia 60 pezzetti dai due angoli inferiori, lascia cliccabili i pulsanti e rimuove lo strato al termine. Rispetta la preferenza di sistema per il movimento ridotto. L’effetto aggiuntivo `festeggia` anima il **punteggio** per 550 ms. Attualmente la domanda di Galileo lo richiama per la risposta giusta.

Per aggiungere un nuovo effetto, definisci un metodo in `effettiQuiz` e usa esattamente il suo nome nel JSON. Un nome sconosciuto viene ignorato. Per un effetto che deve partire una sola volta al clic, segui il percorso di `choose()`: il ripristino usa nuovamente `displayAnswer()` per ridisegnare l’esito.

## Salvataggio e prova delle modifiche

La chiave `quizProgress` in `localStorage` contiene domande della partita, posizione, punti, stato della risposta, risposta scelta e ordine delle opzioni. F5 riprende anche una domanda già risposta senza assegnare altri punti. Il salvataggio appartiene al browser e all’origine del sito. Aprire il quiz con un nome host o una porta diversa può quindi mostrare un altro tentativo.

- **Ho aggiornato il JSON e vedo le domande precedenti.** «Ricomincia» e conferma per iniziare una partita con il file aggiornato. Il refresh ripristina la copia delle domande salvata nel tentativo. Per provare senza perdere i progressi, apri una finestra privata.
- **Il quiz si blocca all’avvio.** Apri `domande.json` dallo stesso indirizzo del sito. Controlla l’esito HTTP e la sintassi con `python3 -m json.tool domande.json` dalla cartella del progetto. Il pulsante di avvio si abilita solo dopo la validazione applicativa.
- **Voglio provare i coriandoli.** Nella console del browser esegui `lanciaCoriandoli()`. Per verificare anche il punteggio, rispondi correttamente, annota il totale e premi F5.
- **Un pulsante reagisce solo dalla console.** Controlla che il suo ID compaia una volta sola, per esempio con `document.querySelectorAll('#restart-btn').length` (atteso: 1). Gli strati delle animazioni usano `pointer-events: none`.

Per pubblicazione, servizi e log sul Pi, vedi [Raspberry Pi · Gestione del sito](RASPBERRY-PI.md).
