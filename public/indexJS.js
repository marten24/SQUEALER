
const addCool = async function(ID) {
    try {
        const response = await fetch(`/addCool/${ID}`);
        if (response.ok) {
            const newCoolValue = await fetch(`/getCool/${ID}`);
            const newCoolValueResponse = await newCoolValue.text();
            const coolBtn = document.getElementById("coolBtn"+ID);
            const cringeBtn = document.getElementById("cringeBtn"+ID);
            coolBtn.textContent = ("Cool "+newCoolValueResponse);
            coolBtn.disabled = true;
            cringeBtn.disabled = true;
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const addCringe = async function(ID) {
    try {
        const response = await fetch(`/addCringe/${ID}`);
        if (response.ok){
            const newCringeValue = await fetch(`/getCringe/${ID}`);
            const newCringeValueResponse = await newCringeValue.text();
            const cringeBtn = document.getElementById("cringeBtn"+ID);
            const coolBtn = document.getElementById("coolBtn"+ID);
            cringeBtn.textContent = ("Cringe "+newCringeValueResponse);
            cringeBtn.disabled = true;
            coolBtn.disabled = true;
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const removeCool = async function(ID) {
    try {
        await fetch(`/removeCool/${ID}`);

    } catch (error) {
        console.error('Error:', error);
    }
};

const removeCringe = async function(ID) {
    try {
        await fetch(`/removeCringe/${ID}`);
    } catch (error) {
        console.error('Error:', error);
    }
};

const replyToSqueal = async function(ID) {
    try{
        const squeal = await fetch(`/getSqueal/${ID}`);
        if(squeal.ok){
            const dataSqueal = await squeal.json();

            if(dataSqueal.video!=null){
                document.getElementById('squealInfo').innerHTML = `<br><div style=" flexdirection:center ">
                    <img src="https://www.macchiavello.com/wp/wp-content/uploads/2016/08/YouTube-logo-full_color.png" style="width: 100px; height: 100px;"></div>`;
            }

            else if(dataSqueal.media!=null){
                document.getElementById('squealInfo').innerHTML = `<div style="display: flex; flexdirection:center items-align:center; ">
                    <img src=${dataSqueal.media} style="width: 100px; height: 100px;"></div>`;
            }

            else if(dataSqueal.longitudine != null && dataSqueal.latitudine != null){
                document.getElementById('squealInfo').innerHTML = `<br><div style=" flexdirection:center ">
                    <img src="https://th.bing.com/th/id/OIP.Sx5i13lFGeR-01pTZhBEtwAAAA?w=256&h=256&rs=1&pid=ImgDetMain" style="width: 100px; height: 100px;"></div>`;
            }

            else{
                document.getElementById('squealInfo').innerHTML = `<br><div style="text-align:left;"><p>${dataSqueal.testo}</p></div>`;
            }

            // Visualizza il popup
            document.getElementById('sendreplyPopup').style.display = 'block';
            document.body.classList.add('popup-open');
            document.getElementById("sendReplyBtn").addEventListener("click", function() {
                sendReply(ID);
            });

        }
    }catch(error){
        console.error('Si è verificato un errore durante la richiesta:', error);
    }
};

function closePopup() {
    // Chiudi il popup
    document.getElementById('sendreplyPopup').style.display = 'none';
    document.getElementById('replyText').value = '';
    const button = document.getElementById("sendReplyBtn");
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    document.body.classList.remove('popup-open');

}

const closeRepliesPopup = () => {
    document.body.classList.remove('popup-open');
    document.getElementById('repliesPopup').style.display = 'none';
};

const viewReplies = async function(ID) {
    try {
        const response = await fetch(`/getReplies/${ID}`);
        const replies = await response.json();

        const popupContent = document.getElementById('popupContent');
        popupContent.innerHTML = '';
        console.log(replies);
        if(replies.length > 0){
            replies.forEach(reply => {
                const replyElement = document.createElement('div');
                replyElement.innerHTML = `<strong style= "float: left">${reply.user}</strong><br> <p style= "text-align: left"> ${reply.testo}</p>`;
                popupContent.appendChild(replyElement);
            });
        }else{
            const replyElement = document.createElement('div');
            replyElement.innerHTML = `<p>This Squeal has no replies yet</p>`;
            popupContent.appendChild(replyElement);
        }
        document.body.classList.add('popup-open');
        document.getElementById('repliesPopup').style.display = 'block';
    }catch(e){
        console.log(e);
    }
}

const sendReply = async function(ID) {
    // Invia la risposta
    const replyText = document.getElementById('replyText').value;
    if (!replyText.trim()) {
        alert("Your reply needs some text!");
        return;
    }

    try {
        // Effettua la richiesta fetch includendo il testo e l'ID
        const response = await fetch(`/sendReply/${ID}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: replyText }) // Invia il testo come JSON
        });
        document.getElementById('replyText').value = '';

    }catch(e){
        console.log(e);
    }
    const button = document.getElementById("sendReplyBtn");
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    closePopup();
}

const addView = async function(ID) {
    console.log('Adding view');
    try {
        await fetch(`/addView/${ID}`);
        // Rimuovi il ricaricamento automatico della pagina
        // window.location.reload();
    } catch (error) {
        console.error('Error:', error);
    }
};


document.addEventListener("DOMContentLoaded", function () {
    const squealCards = document.querySelectorAll(".squeal-card");


    const options = {
        root: null,
        rootMargin: "0px",
        threshold: 0.5, // Quando almeno il 50% dell'elemento è visibile
    };

    const handleIntersection = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const squealId = entry.target.dataset.squealId;
                addView(squealId);
                observer.unobserve(entry.target);
            }
        });
    };


    const observer = new IntersectionObserver(handleIntersection, options);
    squealCards.forEach((card) => {
        observer.observe(card);
    });
});