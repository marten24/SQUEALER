function returnBack() {
    window.location.href = "/friends";
}

var messageType;

function selectMessageType(type) {
    messageType = type;

    //rimuove la classe 'selected' da tutti i bottoni
    document.getElementById('textButton').classList.remove('selected');
    document.getElementById('photoButton').classList.remove('selected');
    document.getElementById('luogoButton').classList.remove('selected');

    //aggiunge la classe 'selected' solo al bottone selezionato
    document.getElementById(type + 'Button').classList.add('selected');
}

function sendMessage() {
    // recupera il testo, foto, posizione in base al tipo di messaggio
    var messageContent = '';

    if (messageType === 'text' || messageType === 'photo') {
        messageContent = document.getElementById('messageInput').value;
        alert("Messaggio inviato!");
    } else if (messageType === 'luogo') {
        //ottengo le coordinate
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    var latitudine = position.coords.latitude;
                    var longitudine = position.coords.longitude;

                    alert("Posizione inviata!");
                    //invia dati
                    inviaDatiAlBackend('luogo', latitudine, longitudine);
                    window.location.reload();
                },
                function (error) {
                    console.error('Errore durante l\'ottenimento delle coordinate:', error.message);
                }
            );
        } else {
            console.error('Geolocalizzazione non supportata dal tuo browser.');
        }
        return; //non esegue il codice successivo
    }

    //invia i dati
    fetch('/send-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messageType: messageType,
            messageContent: messageContent,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Risposta dal server:', data);
            // Ricarica la pagina dopo il successo
            window.location.reload();
        })
        .catch(error => {
            console.error('Errore durante l\'invio del messaggio:', error);
        });

    window.location.reload();
}

function inviaDatiAlBackend(messageType, latitudine, longitudine) {
    //invia i dati
    fetch('/send-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messageType: messageType,
            latitudine: latitudine,
            longitudine: longitudine,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Risposta dal server:', data);
        })
        .catch(error => {
            console.error('Errore durante l\'invio delle coordinate:', error);
        });
    window.location.reload();
}
