# Raspberry Pi · Gestione del sito Quiz Mattia

Promemoria operativo del 19 novembre 2026 per `RPI-Luca`. I percorsi e gli esiti riportati derivano dai comandi e dai log condivisi. Per i parametri che dipendono dal Pi, le sezioni indicano come leggere il valore attivo.

## Dove sono i pezzi

| Componente | Riferimento del progetto | A cosa serve |
|---|---|---|
| File di lavoro sul Pi | `/var/web` | Directory usata per il quiz e per la sincronizzazione Git |
| Server web | Caddy, `/etc/caddy/Caddyfile` | Associa indirizzo del sito e directory da servire. Verificare la direttiva `root` del blocco attivo. |
| Condivisione file | Samba | Consente di lavorare da Windows. Il nome della share e il suo `path` si leggono con `testparm -s`. |
| Accesso privato | Tailscale | Collega i dispositivi della tailnet al Pi anche fuori dalla LAN. |
| Repository | `LucaInzoli/WebLaureaTia`, branch `main` | Destinazione prevista delle modifiche fatte sul Pi |
| Sincronizzazione | `quiz-git-sync.timer` → `quiz-git-sync.service` | Lancia `/bin/bash /usr/local/bin/quiz-git-sync` |

**Flusso di lavoro.** Modifica i file nella directory di lavoro del Pi, prova il sito e verifica che il timer abbia pubblicato il commit. Quando la `root` di Caddy punta a quella directory, la modifica è già servita prima del push. La sincronizzazione descritta procede **dal Pi verso GitHub**. Un commit fatto direttamente su GitHub richiede di verificare e integrare le differenze sul Pi.

Repository del progetto: [LucaInzoli/WebLaureaTia](https://github.com/LucaInzoli/WebLaureaTia).

## 1. Caddy e directory pubblicata

Il file di configurazione usato è `/etc/caddy/Caddyfile`. La validazione del 18 novembre ha restituito `Valid configuration` e un avviso di formattazione alla riga 44. Per identificare il dominio e la directory effettiva, leggi il blocco del sito sul Pi:

```bash
sudo cat /etc/caddy/Caddyfile
systemctl status caddy --no-pager
sudo journalctl -u caddy -n 50 --no-pager
```

Dopo una modifica al **Caddyfile**, valida e ricarica solo se la validazione riesce:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy
```

Per un normale aggiornamento di HTML, CSS, JavaScript o JSON basta salvare il file servito e ricaricare il browser. Apri anche `domande.json` accanto a `index.html` per controllare cosa sta servendo Caddy.

### Il precedente 403

Nella prima configurazione i contenuti erano sotto `/home/luca/web`. La directory padre `/home/luca` aveva permessi `drwxr-x---`. Alcuni file mostravano anche il segno `+`, indice della presenza di ACL. Per leggere un file, l’utente del servizio deve poter attraversare **ogni directory padre** e leggere il file. Un accesso riuscito come root o tramite Samba verifica permessi diversi.

Se la root del sito è `/var/web`, controlla così (altrimenti sostituisci il percorso con la root effettiva):

```bash
namei -l /var/web/domande.json
getfacl /var/web/domande.json
sudo -u caddy test -r /var/web/domande.json && echo "JSON leggibile da Caddy"
```

## 2. Indirizzo pubblico, HTTPS e Tailscale

Per il tentativo pubblico è stato usato un dns dinamico fornito da duckdns.org. Nei log il DNS funzionava, ma le verifiche ACME HTTP-01 e TLS-ALPN-01 andavano in timeout. Per queste verifiche l’autorità contatta rispettivamente la porta pubblica 80 o 443. Visitare il sito su una porta personalizzata e ottenere un certificato pubblico sono due prove distinte. L’emissione finale del certificato DuckDNS e la delega del dominio alternativo discusso non risultano confermate.

Per l’accesso privato controlla sul Pi:

```bash
tailscale status
tailscale ip -4
systemctl status tailscaled --no-pager
```

Il secondo comando mostra l’IPv4 Tailscale del Pi. Per usare HTTPS via tailnet, recupera il nome completo effettivo del dispositivo e confrontalo con il blocco del Caddyfile. Il formato discusso era `https://rpi-luca.<tailnet>.ts.net`. Il suffisso tra parentesi angolari è un segnaposto. La validazione del Caddyfile da sola non dimostra che un client abbia completato la connessione HTTPS.

## 3. Samba da Windows

Sul Pi leggi le share risolte, i relativi percorsi e le interfacce in ascolto:

```bash
sudo testparm -s
systemctl status smbd --no-pager
sudo ss -ltnp 'sport = :445'
```

Nell’output di `testparm -s`, la sezione `[nome-share]` dà il nome da usare in Windows e `path` indica la directory reale. Con Tailscale connesso su entrambi i dispositivi, apri in Esplora file `\\<IP-Tailscale-del-Pi>\<nome-share>` e usa l’account Samba configurato. Per controllare da PowerShell la raggiungibilità SMB:

```powershell
Test-NetConnection -ComputerName <IP-Tailscale-del-Pi> -Port 445
```

Sostituisci il segnaposto prima di eseguire il comando. Se il test TCP riesce ma Windows rifiuta l’accesso, controlla utente Samba, permessi della share e permessi della directory. Se il salvataggio da Windows riesce ma il sito resta identico, confronta `path` della share e `root` di Caddy.

## 4. GitHub e timer systemd

Il 19 novembre il servizio risultava avviato da `quiz-git-sync.timer` e terminato con `status=0/SUCCESS`. Fra due esecuzioni è normale leggere `inactive (dead)` sul **servizio**. Per sapere quando avverrà la prossima esecuzione, guarda il **timer**.

Lo schema discusso usava l’utente `luca`, il remoto SSH `git@github-quiz:LucaInzoli/WebLaureaTia.git`, un controllo ogni minuto e una verifica di `origin/main` prima del push. Lo script avrebbe dovuto fermarsi se il remoto conteneva commit da integrare. Frequenza corrente, messaggio «nessuna modifica» e comandi esatti si verificano nelle unità e nello script installati:

```bash
systemctl cat quiz-git-sync.service quiz-git-sync.timer
sudo cat /usr/local/bin/quiz-git-sync
systemctl list-timers --all quiz-git-sync.timer
sudo journalctl -u quiz-git-sync.service -n 30 --no-pager
```

Per seguire una modifica mentre la salvi, lascia aperto `sudo journalctl -fu quiz-git-sync.service`. In un secondo terminale puoi usare `watch -n 2 'systemctl list-timers --all quiz-git-sync.timer'`. Un’uscita con codice zero può indicare anche che non c’era nulla da pubblicare.

Per controllare il repository usando l’account previsto per la sincronizzazione:

```bash
sudo -u luca -H git -C /var/web status -sb
sudo -u luca -H git -C /var/web remote -v
sudo -u luca -H git -C /var/web log -1 --oneline
```

Per verificare la pubblicazione, confronta l’ultimo commit locale con quello visibile sul branch `main` di GitHub. Se i due lati divergono, controlla le modifiche di entrambi prima di integrarli. Un push forzato rischierebbe di cancellare dal branch il lavoro presente solo sul remoto.

| Cosa hai cambiato | Come applicarlo |
|---|---|
| Un intervallo nel file `quiz-git-sync.timer` | `sudo systemctl daemon-reload`, poi `sudo systemctl restart quiz-git-sync.timer`. Controlla il prossimo avvio con `list-timers`. |
| Il file `quiz-git-sync.service` | `sudo systemctl daemon-reload`. Il servizio userà la nuova definizione alla prossima esecuzione. |
| Solo `/usr/local/bin/quiz-git-sync`, ad esempio il testo del log | Bash leggerà la modifica alla prossima esecuzione. Puoi verificarne la sintassi con `bash -n /usr/local/bin/quiz-git-sync`. |
| Un file del quiz | Prova il sito, attendi il timer e verifica il commit. Per le domande aggiornate avvia un nuovo tentativo. |

Per schema JSON, salvataggio del tentativo e personalizzazioni, vedi [Quiz Mattia · Guida al quiz](QUIZ-MATTIA.md).
