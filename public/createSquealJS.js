$(document).ready(function(){
    var quotaGiornalieraText = document.getElementById('quotaGiornaliera').textContent;
    var quotaSettimanaleText = document.getElementById('quotaSettimanale').textContent;
    var quotaMensileText = document.getElementById('quotaMensile').textContent;

    var quotaGiornaliera = document.getElementById('quotaGiornaliera');
    var quotaSettimanale = document.getElementById('quotaSettimanale');
    var quotaMensile = document.getElementById('quotaMensile');

    //estrae solo il numero dal testo
    var quotaGiornalieraValue = parseInt(quotaGiornalieraText.match(/\d+/)[0]);
    var quotaSettimanaleValue = parseInt(quotaSettimanaleText.match(/\d+/)[0]);
    var quotaMensileValue = parseInt(quotaMensileText.match(/\d+/)[0]);

    //variabili
    var selectedFriend;
    var messageType;
    var selectedOption;
    var channelSelected;
    var longitudine = null;
    var latitudine = null;

    //cambio su #selectOption
    $("#selectOption").change(function(){
        selectedOption = $(this).val();
        if (selectedOption === 'user') {
            $(".friends-select").show();
            $(".channels").hide();
            $(".caratteri").hide();
            bottoneInvia.style.visibility = "visible";
        } else {
            $(".channels").show();
            $(".friends-select").hide();
            $(".caratteri").show();
            if (quotaGiornalieraValue >= 125 && quotaSettimanaleValue >= 125 && quotaMensileValue >= 125) {
                //mostra il create button
                bottoneInvia.style.visibility = "visible";
            } else {
                //nascondi il create button
                bottoneInvia.style.visibility = "hidden";
            }
        }
    });

    $(".type-button").click(function() {
        $(".type-button").removeClass("active");
        $(this).addClass("active");

        messageType = $(this).data("type");  //assegno il valore a messageType
        var amici= document.getElementById("user");

        //nascondo tutti i container e scelgo quale mostrare in base al tipo di messaggio
        $(".textInput-container, .fotoInput-container, .mapInput-container, .videoInput-container").hide();

        $(".select").show();
        if (messageType === "text") {
            $("#inputText").attr("placeholder", "Enter text here...");
            $(".textInput-container").show();
            amici.disabled = false;
        } else if (messageType === "photo") {
            $("#inputFoto").attr("placeholder", "Enter link here...");
            $(".fotoInput-container").show();
            amici.disabled = false;
        } else if (messageType === "video") {
            $("#inputVideo").attr("placeholder", "Enter link here...");
            $(".videoInput-container").show();
            amici.disabled = true;
        } else if (messageType === "luogo") {
            $(".createButton-container").show();
            amici.disabled = false;
            if (quotaGiornalieraValue >= 125 && quotaSettimanaleValue >= 125 && quotaMensileValue >= 125) {
                //mostra il create button
                bottoneInvia.style.visibility = "visible";
            } else {
                //nascondi il create button
                bottoneInvia.style.visibility = "hidden";
            }
        }
    });

    //QUOTA CAREATTERI
    var nuovaQuotaGiornaliera;
    var bottoneInvia = document.querySelector('.btn.create-squeal');

    //aggiorno la quota in tempo reale durante la digitazione
    $("#inputText").on('input', function() {
        //ottengo il valore del testo inserito
        var testoInserito = $(this).val();

        //calcolo la nuova quota
        nuovaQuotaGiornaliera = quotaGiornalieraValue - testoInserito.length;
        var quotaSettimanale = quotaSettimanaleValue - testoInserito.length;
        var quotaMensile = quotaMensileValue - testoInserito.length;

        if (nuovaQuotaGiornaliera >= 0 && quotaSettimanale >= 0 && quotaMensile >= 0) {
            //aggiorno la visualizzazione della quota in tempo reale
            $("#quotaGiornaliera").text(nuovaQuotaGiornaliera + " caratteri giornalieri");
            $("#quotaSettimanale").text(quotaSettimanale + " caratteri settimanali");
            $("#quotaMensile").text(quotaMensile + " caratteri mensili");
            //non nascondere il pulsante di creazione
            bottoneInvia.style.visibility= "visible";
        } else {
            $("#quotaGiornaliera").text("Hai superato la quota caratteri");
            $("#quotaSettimanale").text("");
            $("#quotaMensile").text("");

            //disabilito il pulsante di creazione
            bottoneInvia.style.visibility= "hidden";
        }
    });

    //aggiorno la quota in tempo reale del campo foto
    $("#inputFoto").on('input', function() {
        //ottengo il valore del testo inserito
        var testoInserito = $(this).val();

        if(testoInserito.length > 0) {
            //calcolo la nuova quota
            nuovaQuotaGiornaliera = quotaGiornalieraValue - 125;
            var quotaSettimanale = quotaSettimanaleValue - 125;
            var quotaMensile = quotaMensileValue - 125;
            if (nuovaQuotaGiornaliera >= 0 && quotaSettimanale >= 0 && quotaMensile >= 0) {
                //aggiorno la visualizzazione della quota in tempo reale
                $("#quotaGiornaliera").text(nuovaQuotaGiornaliera + " caratteri giornalieri");
                $("#quotaSettimanale").text(quotaSettimanale + " caratteri settimanali");
                $("#quotaMensile").text(quotaMensile + " caratteri mensili");
                //non nascondere il pulsante di creazione
                bottoneInvia.style.visibility= "visible";
            } else {
                $("#quotaGiornaliera").text("Hai superato la quota caratteri (hai bisogno di 125 caratteri per creare un post)");
                $("#quotaSettimanale").text("");
                $("#quotaMensile").text("");

                //disabilito il pulsante di creazione
                bottoneInvia.style.visibility= "hidden";
            }
        } else {
            //reimposta le quote ai valori originali
            $("#quotaGiornaliera").text(quotaGiornalieraValue + " caratteri giornalieri");
            $("#quotaSettimanale").text(quotaSettimanaleValue + " caratteri settimanali");
            $("#quotaMensile").text(quotaMensileValue + " caratteri mensili");

            //mostra il pulsante di creazione
            bottoneInvia.style.visibility= "visible";
        }
    });

    //aggiorno la quota in tempo reale durante del campo video
    $("#inputVideo").on('input', function() {
        //ottengo il valore del testo inserito
        var testoInserito = $(this).val();

        if(testoInserito.length > 0) {
            //calcolo la nuova quota
            nuovaQuotaGiornaliera = quotaGiornalieraValue - 150;
            var quotaSettimanale = quotaSettimanaleValue - 150;
            var quotaMensile = quotaMensileValue - 150;
            if (nuovaQuotaGiornaliera >= 0 && quotaSettimanale >= 0 && quotaMensile >= 0) {
                //aggiorno la visualizzazione della quota in tempo reale
                $("#quotaGiornaliera").text("Ti rimangono solo: " + nuovaQuotaGiornaliera + " caratteri giornalieri");
                $("#quotaSettimanale").text(quotaSettimanale + " caratteri settimanali");
                $("#quotaMensile").text(quotaMensile + " caratteri mensili");
                //non nascondere il pulsante di creazione
                bottoneInvia.style.visibility= "visible";
            } else {
                $("#quotaGiornaliera").text("Hai superato la quota caratteri (hai bisogno di 150 caratteri per inserire un video)");
                $("#quotaSettimanale").text("");
                $("#quotaMensile").text("");

                //disabilito il pulsante di creazione
                bottoneInvia.style.visibility= "hidden";
            }
        } else {
            //reimposta le quote ai valori originali
            $("#quotaGiornaliera").text(quotaGiornalieraValue + " caratteri giornalieri");
            $("#quotaSettimanale").text(quotaSettimanaleValue + " caratteri settimanali");
            $("#quotaMensile").text(quotaMensileValue + " caratteri mensili");

            //mostra il pulsante di creazione
            bottoneInvia.style.visibility= "visible";
        }
    });

    //gestisce l'invio del modulo
    $("form").submit(function(event) {
        // Ottieni il valore dell'amico selezionato
        if(selectedOption === 'user') {
            selectedFriend = $("#friendsSelect").val();

            //ottiene il valore del testo inserito
            if (messageType === "text") {
                messageContent = $("#inputText").val();
            } else if (messageType === "photo") {
                messageContent = $("#inputFoto").val();
            } else if (messageType === "luogo") {
                //ottengo le coordinate
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            latitudine = position.coords.latitude;
                            longitudine = position.coords.longitude;

                            //invia i dati
                            inviaDatiAlBackend('luogo', latitudine, longitudine, selectedFriend);
                        },
                        function (error) {
                            console.error('Errore durante l\'ottenimento delle coordinate:', error.message);
                        }
                    );
                } else {
                    console.error('Geolocalizzazione non supportata dal tuo browser.');
                }
                return;//evita l'esecuzione del codice successivo
            }

            function inviaDatiAlBackend(messageType, latitudine, longitudine, selectedOption) {
                //invia i dati
                fetch('/send-message-squeal?selectedFriend=' + selectedFriend, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        selectedOption: selectedOption,
                        selectedFriend: selectedFriend,
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

                event.preventDefault();
                alert("Posizione inviata!");
                window.location.reload();
            }

            //invia i dati
            fetch('/send-message-squeal?selectedFriend=' + selectedFriend, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedOption: selectedOption,
                    selectedFriend: selectedFriend,
                    messageType: messageType,
                    messageContent: messageContent,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Risposta dal server:', data);
                })
                .catch(error => {
                    console.error('Errore durante l\'invio del messaggio:', error);
                });

            event.preventDefault();
            alert("Messaggio inviato!");
            window.location.reload();
        } else  {
            channelSelected = $("#channels").val();

            //ottiengo il valore del testo inserito
            if (messageType === "text") {
                messageContent = $("#inputText").val();
                //diminuisci il valore di quota giornaliera in base al numeri di caratteri scritti daal utente
                quotaGiornalieraValue = quotaGiornalieraValue - messageContent.length;
            } else if (messageType === "photo") {
                messageContent = $("#inputFoto").val();
                quotaGiornalieraValue = nuovaQuotaGiornaliera;
            } else if (messageType === "video"){
                messageContent = $("#inputVideo").val();
                quotaGiornalieraValue = nuovaQuotaGiornaliera;
            } else if (messageType === "luogo") {
                quotaGiornalieraValue = quotaGiornalieraValue - 125;
                //ottenergo le coordinate
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            latitudine = position.coords.latitude;
                            longitudine = position.coords.longitude;

                            //invia i dati
                            inviaDatiAlBackend('luogo', latitudine, longitudine, channelSelected, quotaGiornalieraValue);
                        },
                        function (error) {
                            console.error('Errore durante l\'ottenimento delle coordinate:', error.message);
                        }
                    );
                } else {
                    console.error('Geolocalizzazione non supportata dal tuo browser.');
                }
                return;  //evita l'esecuzione del codice successivo
            }

            function inviaDatiAlBackend(messageType, latitudine, longitudine, selectedOption, quotaGiornalieraValue) {
                //invia i dati
                fetch('/send-channel?channelSelected=' + channelSelected, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        selectedOption: selectedOption,
                        channelSelected: channelSelected,
                        messageType: messageType,
                        latitudine: latitudine,
                        longitudine: longitudine,
                        quotaGiornalieraValue: quotaGiornalieraValue,
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Risposta dal server:', data);
                    })
                    .catch(error => {
                        console.error('Errore durante l\'invio delle coordinate:', error);
                    });

                event.preventDefault();
                alert("Posizione inviata!");
                window.location.reload();
            }

            //invia i dati
            fetch('/send-channel?channelSelected=' + channelSelected, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedOption: selectedOption,
                    channelSelected: channelSelected,
                    messageType: messageType,
                    messageContent: messageContent,
                    quotaGiornalieraValue: quotaGiornalieraValue,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Risposta dal server:', data);
                })
                .catch(error => {
                    console.error('Errore durante l\'invio del messaggio:', error);
                });

            event.preventDefault();
            alert("Messaggio inviato nel canale!");
            window.location.reload();
        }
    });
});