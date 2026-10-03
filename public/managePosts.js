    function applyFilter() {
        const sender = document.getElementById("sender").value;
        const date = document.getElementById("date").value;
        const channel = document.getElementById("channelFilter").value; // Ottieni il canale selezionato

        // Includi il canale nella query string
        window.location.href = `/managePosts?sender=${sender}&date=${date}&channel=${channel}`;
    }


    async function updateCool(postId) {
        const coolInput = document.getElementById(`cool_${postId}`);
        const newValue = coolInput.value;

        await updateInteraction(postId, 'cool', newValue);
        location.reload(); // Aggiorna la pagina dopo aver eseguito l'operazione
    }

    async function updateInteraction(postId, columnName, newValue) {
        const response = await fetch(`/updateInteraction?id=${postId}&column=${columnName}&value=${newValue}`, {
            method: 'POST',
        });

        if (!response.ok) {
            console.error('Errore durante la richiesta al server');
        }
    }


    async function updateCringe(postId) {
        const cringeInput = document.getElementById(`cringe_${postId}`);
        const newValue = cringeInput.value;

        await updateInteraction(postId, 'cringe', newValue);
        location.reload();
    }

    async function updateChannel(postId) {
        const channelSelect = document.getElementById(`channel_${postId}`);
        const newChannelId = channelSelect.value;

        const response = await fetch(`/updateChannel?postId=${postId}&newChannelId=${newChannelId}`, {
            method: 'POST',
        });

        if (!response.ok) {
            console.error('Errore durante l aggiornamento del canale');
        } else {
            alert('Canale aggiornato con successo!');
        }
    }
