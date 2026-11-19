# 🎓 Quiz per Mattia

> La commissione ti ha promosso. Ora tocca a noi.

Un ultimo esame per la festa di laurea di Mattia. Ogni domanda ha quattro risposte e ogni risposta esatta vale un punto e una pioggia di coriandoli.

## Come si gioca

Premi **Iniziamo!** e aspetta il passaggio dell’aereo. Scegli una risposta per scoprire la soluzione e, su alcune domande, anche il commento della commissione. A ogni partita cambiano sia l’ordine delle domande sia quello delle risposte.

Se ricarichi la pagina, ritrovi la partita al punto in cui l’hai lasciata. Il browser salva i progressi sul dispositivo. Alla fine puoi vedere il punteggio e riprovare.

## Avvio in locale

Servono Git e Python 3. Il quiz è scritto in HTML, CSS e JavaScript e si avvia direttamente dai sorgenti.

```bash
git clone https://github.com/LucaInzoli/WebLaureaTia.git
cd WebLaureaTia
python3 -m http.server 8000 --bind 127.0.0.1
```

Apri [il quiz nel browser](http://127.0.0.1:8000). Su Windows puoi usare `py -m http.server 8000 --bind 127.0.0.1`. Per fermare il server premi **Ctrl+C**.

## Come farne una versione tua

| Per cambiare… | Apri |
|---|---|
| Domande, risposte e battute | `domande.json` |
| Titolo e testi delle schermate | `index.html` |
| Colori, pulsanti e animazione dell’aereo | `style.css` |
| Punteggio, salvataggio ed effetti speciali | `script.js` |

Per aggiungere una domanda, scrivi il testo, le quattro opzioni e l’indice della risposta corretta (da 0 a 3). Avvia un nuovo tentativo per provare la raccolta aggiornata. La [guida al quiz](QUIZ-MATTIA.md) contiene un esempio completo e spiega come associare una battuta o un’animazione a una singola domanda.
