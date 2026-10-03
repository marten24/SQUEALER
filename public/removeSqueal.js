    document.querySelectorAll('.remove-squeal-btn').forEach(button => {
    button.addEventListener('click', function() {
        const squealId = this.getAttribute('data-squeal-id');
        const canaleId = this.getAttribute('data-channel-id');

        fetch(`/disassociateSquealFromChannel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ squealId, canaleId }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Squeal rimosso con successo!');
                    window.location.reload();
                } else {
                    alert('Errore durante la rimozione dello squeal');
                }
            })
            .catch(error => console.error('Errore:', error));
    });
});
