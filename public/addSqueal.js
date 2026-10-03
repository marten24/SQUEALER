document.querySelectorAll('.add-squeal-btn').forEach(button => {
    button.addEventListener('click', function() {
        const squealId = this.getAttribute('data-squeal-id');
        const canaleId = this.getAttribute('data-channel-id');
        fetch(`/associateSquealWithChannel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ squealId, canaleId }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Squeal aggiunto con successo!');
                    window.location.reload();
                } else {
                    alert('Errore durante l\'aggiunta dello squeal');
                }
            })
            .catch(error => console.error('Errore:', error));
    });
});
