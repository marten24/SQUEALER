require('dotenv').config();

const express = require('express');
const session = require('express-session');
const useragent = require('express-useragent');


const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');


const app = express();
const port = 3000;
const cookieParser = require('cookie-parser');
const cron = require('node-cron');

// Configura Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const squealService = require('./squealService')
// Imposta il motore di visualizzazione EJS
app.set('view engine', 'ejs');

// Configura la sessione
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.use(express.json());


//cookie-parser
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.locals.errorMessage = '';
    next();
});

app.use(useragent.express());


app.get('/', async (req, res) => {
    try {
        const userEmail = req.session.userEmail;
        const errorMessage = res.locals.errorMessage;

        const isModerator = req.session.isModerator;

        // Carica gli squeal dalla tabella 'squeal'
        const {data: squeals, squealsError} = await supabase.rpc('gethomesquealsjson');
      
        const {data: publicChannels, publicChannelsError} = await supabase.from('Canale_Pubblico').select('*').eq('visibile', true);
        const {data: privateChannels, privateChannelsError} = await supabase.from('Canale').select('*');

      if (squealsError ){
            throw squealsError;
        }
        if (userEmail) {
            res.render('index', {
                userEmail: userEmail,
                squeals: squeals,
                publicChannels: publicChannels,
                privateChannels: privateChannels,
                errorMessage: errorMessage,
                isModerator: isModerator
            });
        } else {
            res.render('index', {
                userEmail: null,
                squeals: squeals,
                publicChannels: publicChannels,
                errorMessage: errorMessage,
                isModerator: isModerator
            });
        }
    } catch (error) {
        console.error('Errore durante la gestione della richiesta:', error.message);
        res.status(500).send('Errore interno del server');
    }
});
app.get('/profile', (req, res) => {
    // Verifica se l'utente è loggato
    if (!req.session.userEmail) {
        return res.redirect('/');
    }
    res.render('profile', { userEmail: req.session.userEmail });
});

app.post('/changePassword', async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.session.userId;
    if (!userId) {
        res.locals.errorMessage = 'ID utente non disponibile';
        return res.render('profile', { userEmail: req.session.userEmail, errorMessage: res.locals.errorMessage });
    }
    const { error } = await supabase
        .from('Users')
        .update({ password: newPassword })
        .eq('id', userId);
    if (error) {
        res.locals.errorMessage = 'Errore durante il cambio password';
        return res.render('profile', { userEmail: req.session.userEmail, errorMessage: res.locals.errorMessage });
    }
    res.locals.successMessage = 'Password modificata con successo!';
    res.render('profile', { userEmail: req.session.userEmail, successMessage: res.locals.successMessage });
});

app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/signup', (req, res) => {
    let errorMessage = '';
    if (req.query.error) {
        errorMessage = 'L\'email/username esiste già. Scegli un\'altra email/username.';
    }
    res.render('signup', { errorMessage });
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Verifica se esiste un utente con l'email e la password fornite
    const { data, error } = await supabase
        .from('Users')
        .select('id, username, bloccato')  // Includi 'id' e 'username' nella selezione
        .eq('email', email)
        .eq('password', password);

    if (error) {
        res.locals.errorMessage = 'Errore durante il login';
        return res.render('login', { errorMessage: res.locals.errorMessage });
    }

    if (data.length === 0 ) {
        res.locals.errorMessage = 'Credenziali non valide';
        return res.render('login', { errorMessage: res.locals.errorMessage });
    }
    if (data[0].bloccato === true) {
        res.locals.errorMessage = 'Utente bloccato';
        return res.render('login', { errorMessage: res.locals.errorMessage });
    }

    req.session.userEmail = email;
    req.session.userId = data[0].id;

    const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('username, type')
        .eq('id', req.session.userId);

    if (userError) {
        throw userError;
    }

    req.session.username = userData[0].username;
    req.session.userType = userData[0].type;

    if (req.session.userType === 'MOD') {
        req.session.isModerator = true;
    } else {
        req.session.isModerator = false;
    }
    res.redirect('/');
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Controlla se l'email esiste già
    const { data: existingEmail } = await supabase
        .from('Users')
        .select('email')
        .eq('email', email);

    if (existingEmail.length > 0) {
        // Reindirizza l'utente alla pagina di signup con un parametro di query di errore
        return res.redirect('/signup?error=emailExists');
    }

    const { data, error } = await supabase
        .from('Users')
        .insert([{ username, email, password }]);

    if (error) {
        return res.redirect('/signup?error=registrationError');
    }

    req.session.userEmail = email;
    req.session.username = username;
    const result = await squealService.getIdbyUsername(username);
    req.session.userId = result[0].id;



    res.redirect('/');
});


app.get("/addCool/:id", async (req, res) => {
    try {
        const sID = req.params.id;
        await squealService.addCool(sID);
        res.status(200).json({ success: true });
    } catch (e) {
        console.log(e);
    }
});

app.get("/removeCool/:id", async (req, res) => {
    try {
        const sID = req.params.id;
        await squealService.removeCool(sID);
        res.status(200).json({ success: true });
    } catch (e) {
        console.log(e);
    }
});

app.get("/addCringe/:id", async (req, res) => {
    try {
        const sID = req.params.id;
        await squealService.addCringe(sID);
        res.status(200).json({ success: true });
    } catch (e) {
        console.log(e);
    }
});

app.get("/removeCringe/:id", async (req, res) => {
    try {

        const sID = req.params.id;
        await squealService.removeCringe(sID);
        res.status(200).json({ success: true });
    } catch (e) {
        console.log(e);
    }
});

app.get("/addView/:id", async (req, res) => {
    try {
        const sID = req.params.id;
        await squealService.addView(sID);
        res.status(200).json({ success: true });
    } catch (e) {
        console.log(e);
    }
});

app.get("/getCool/:id", async (req, res) => {
    try {
        const sID = req.params.id;
        const coolValue = await squealService.getCool(sID);
        res.send(coolValue.toString());
    } catch (e) {
        console.log(e);
    }
});

app.get("/getCringe/:id", async (req, res) => {
    try {
        const sID = req.params.id;
        const cringeValue = await squealService.getCringe(sID);
        res.send(cringeValue.toString());
    } catch (e) {
        console.log(e);
    }
});
//get degli elementi di uno squeal dato idSqueal
app.get("/getSqueal/:id", async (req, res) => {
    try {
        const sID = req.params.id;
        const squeal = await squealService.getSqueal(sID);
        res.json(squeal);
    } catch (e) {
        console.log(e);
    }
});
//get commenti di un determinato squeal
app.get("/getReplies/:id", async (req, res) => {
    try {
        const sID = req.params.id;
        const { data: reply, error } = await supabase
            .from("Risposte_Squeal")
            .select("testo,user")
            .eq("IdSqueal",sID);
        if(error){
            console.error(error);
        }
        res.json(reply);
    } catch (e) {
        console.log(e);
    }
});
//gestione dell'invio del nuovo commento al db
app.post("/sendReply/:id", async (req, res) => {
    try {
        const sID = req.params.id;
        const { text } = req.body; //corpo del commento
        const username = req.session.username;

        const { error } = await supabase
            .from('Risposte_Squeal')
            .insert(
                { IdSqueal: sID,
                    testo: text,
                    user: username
                });
        if(error) {
            console.error(error);
        }
        res.status(200).send("successo");
    } catch (error) {
        console.error(error);
        res.status(500).send("Si è verificato un errore durante l'elaborazione della richiesta");
    }
});

//logout dell'utente
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

//pagina di creazione di uno Squeal
app.get('/createSqueal', async (req, res) => {
    const userEmail = req.session.userEmail;
    const userId = req.session.userId;
    const errorMessage = res.locals.errorMessage;

    //recupero la lista di amici se dal client arriva un message type amici al client
    const friends = await squealService.getFriends(userId);

    //estraggo gli username dagli amici
    const friendUsernames = [];

    for (const friend of friends) {
        //chiamo getFriendsByUsername per ottenere gli username
        const friendUsernamesData1 = await squealService.getFriendsByUsername(friend.amico1);
        const friendUsername1 = friendUsernamesData1 ? friendUsernamesData1[0]?.username : null;

        const friendUsernamesData2 = await squealService.getFriendsByUsername(friend.amico2);
        const friendUsername2 = friendUsernamesData2 ? friendUsernamesData2[0]?.username : null;

        //aggiungo l'username corretto in base a quale amico è diverso da userId
        if (friend.amico1 !== userId) {
            friendUsernames.push({amico: friendUsername1});
        } else if (friend.amico2 !== userId) {
            friendUsernames.push({amico: friendUsername2});
        }
    }

    //richiamo getIscrizioni x vedere i canali in cui l'utente è iscritto
    const iscrizioni = await squealService.getIscrizioni(userId);

    //estraggo solo i valori interi dalla chiave 'id_canale'
    const idIscrizioni = iscrizioni.map(iscrizioni => iscrizioni.id_canale);

    //ciclo su idIscrizioni chiamando getNomeCanale e memorizza i nomi dei canali in una variabile
    const nomiCanali = [];
    for (const idCanale of idIscrizioni) {
        const nomeCanale = await squealService.getNomeCanale(idCanale);
        nomiCanali.push(nomeCanale.map(canale => canale.nome));
    }

    //QUOTA CARATTERI
    //recupero la quota caratteri giornaliera dell'utente
    const quotaCaratteri = await squealService.getQuotaCaratteri(req.session.userId);
    const quotaGiornaliera= quotaCaratteri[0].day_ch_l;
    const quotaSettimanale= quotaCaratteri[0].wek_ch_l;
    const quotaMensile= quotaCaratteri[0].mon_ch_l;

    //memorizzo in un cookie la quota giornaliera
    res.cookie('quotaGiornaliera', quotaGiornaliera);
    res.cookie('quotaSettimanale', quotaSettimanale);
    res.cookie('quotaMensile', quotaMensile);

    res.render('createSqueal', {userEmail, errorMessage,friendsUsername: friendUsernames, friendsId: friends, nomiCanali: nomiCanali, quotaGiornaliera: quotaGiornaliera, quotaSettimanale: quotaSettimanale, quotaMensile: quotaMensile});
});

app.post('/iscrizione', async (req, res) => {
    try {
        const userId = req.session.userId;
        const { channelName } = req.body;

        // Ottieni l'ID del canale basato sul nome
        const { data: channelDetails } = await supabase.from('Canale').select('*').eq('nome', channelName);

        if (channelDetails.length > 0) {
            const channelId = channelDetails[0].id;

            // Aggiungi l'iscrizione dell'utente al canale nella tabella Iscrizioni
            const { error } = await supabase.from('Iscrizioni').insert([
                { id_utente: userId, id_canale: channelId }
            ]);

            if (error) throw error;

            // Reindirizza l'utente al canale dopo l'iscrizione
            res.redirect(`/channel/${channelName}`);
        } else {
            // Canale non trovato
            res.status(404).send('Canale non trovato');
        }
    } catch (error) {
        console.error("Errore durante l'iscrizione:", error.message);
        res.status(500).send('Errore interno del server');
    }
});


app.get('/friends', async (req, res) => {
    try {
        //id utente in sessione
        const userId = req.session.userId;

        //prendo gli amici dell'utente
        const friends = await squealService.getFriends(userId);

        //estraggo gli username dagli amici
        const friendUsernames = [];

        for (const friend of friends) {
            //+chiamo getFriendsByUsername per ottenere gli username
            const friendUsernamesData1 = await squealService.getFriendsByUsername(friend.amico1);
            const friendUsername1 = friendUsernamesData1 ? friendUsernamesData1[0]?.username : null;

            const friendUsernamesData2 = await squealService.getFriendsByUsername(friend.amico2);
            const friendUsername2 = friendUsernamesData2 ? friendUsernamesData2[0]?.username : null;

            //aggiungo l'username corretto in base a quale amico è diverso da userId
            if (friend.amico1 !== userId) {
                friendUsernames.push({ amico: friendUsername1 });
            } else if (friend.amico2 !== userId) {
                friendUsernames.push({ amico: friendUsername2 });
            }
        }

        //proseguo con la navigazione al canale
        res.render('friends', { friendsUsername: friendUsernames, friendsId: friends });

    } catch (error) {
        console.error('Errore durante la gestione della richiesta GET /friends:', error.message);
        //invia una risposta JSON di errore
        res.status(500).json({ success: false, error: 'Errore nella gestione della richiesta GET /friends' });
    }
});

//gestire la chat
app.get('/chat', async (req, res) => {
    //ottengo il valore di amico dal parametro della query
    const amico = req.query.amico;
    const userId = req.session.userId;

    //ottieni id dall'username
    const amico_id = await squealService.getIdbyUsername(amico);
    const amicoIdValue = amico_id[0].id;

    //memorizzo nei cookie
    res.cookie('amicoIdValue', amicoIdValue);

    //recupero i messaggi di userId mittente
    const messaggiMittente = await squealService.getMessagesByMittente(userId);

    //recupero i messaggi di userId destinatario
    const messaggiDestinatario = await squealService.getMessagesByDestinatario(userId);

    //unisco i messaggi di mittente e destinatario in un'unica lista
    const messages = [...messaggiMittente, ...messaggiDestinatario];

    //seleziono solo i messaggi dove il mittente o il destinatario corrispondono all'amico
    const messaggiConAmico = messages.filter(
        messaggio => messaggio.id_mittente === amicoIdValue || messaggio.id_destinatario === amicoIdValue
    );

    //seleziono solo i messaggi dove il mittente è userId
    const sonoMittente = messaggiConAmico.filter(
        messaggio => messaggio.id_mittente === userId
    );

    //seleziono solo i messaggi dove il destinatario è userId
    const sonoDestinatario = messaggiConAmico.filter(
        messaggio => messaggio.id_destinatario === userId
    );

    //itero sui messaggi dove il mittente è userId e imposta isMittente a true
    const posizione = sonoMittente.map(messaggio => ({
        ...messaggio,
        isMittente: true
    }));

    const messaggiSistemati = [...sonoDestinatario, ...posizione];

    messaggiSistemati.sort((messaggio1, messaggio2) => {
        const dataOra1 = messaggio1.data;
        const dataOra2 = messaggio2.data;

        //confronto le date e le ore
        if (dataOra1 < dataOra2) {
            return -1;
        } else if (dataOra1 > dataOra2) {
            return 1;
        } else {
            return 0; // Se le date e le ore sono uguali
        }
    });

    res.render('chat', { amico: amico, messaggi: messaggiSistemati });

})

//manda un messaggio
app.post('/send-message', async (req, res) => {
    const messageType = req.body.messageType;
    const idMittente = req.session.userId;

    //recupero l'id del destinatario
    const idDestinatario = req.cookies.amicoIdValue;

    let text = null;
    let media = null;
    let latitudine=  null;
    let longitudine= null;

    //controllo se il messaggio è di tipo testo, immagine o luogo
    if (messageType === 'text') {
        const messageContent = req.body.messageContent;
        text = messageContent;
    } else if (messageType === 'photo') {
        const messageContent = req.body.messageContent;
        media = messageContent;
    }
    else if (messageType === 'luogo') {
        latitudine = req.body.latitudine;
        longitudine = req.body.longitudine;
    }

    //flag per il mittente
    const isMittente = false;

    const id = await squealService.getIdAlto('Chat') + 1;
    const successivo= id + 1;

    //data attuale di tipo timestamp
    const timestampData = new Date();

    //aggiunge un'ora alla data attuale
    const unOraInMillisecondi = 60 * 60 * 1000; //60 minuti * 60 secondi * 1000 millisecondi
    const nuovaData = new Date(timestampData.getTime() + unOraInMillisecondi);

    squealService.inserisciMessaggio(id, idMittente, idDestinatario, text, isMittente, media, latitudine, longitudine, nuovaData);

});

//manda uno squeal in chat privata
app.post('/send-message-squeal', async (req, res) => {
    const messageType = req.body.messageType;

    const selectedOption = req.body.selectedOption;
    //text
    const selectedFriend = req.body.selectedFriend; //pippo

    const idMittente = req.session.userId;

    //recupero l'id del destinatario
    const idDestinatario = await squealService.getIdbyUsername(selectedFriend);
    const IdValue = idDestinatario[0].id;

    let text = null;
    let media = null;
    let video = null;
    let latitudine=  null;
    let longitudine= null;
    let messageContent = null;

    //controllo se il messaggio è di tipo testo, foto o luogo
    if (messageType === 'text') {
        messageContent = req.body.messageContent;

        text = messageContent;
    } else if (messageType === 'photo') {
        messageContent = req.body.messageContent;
        media = messageContent;

    }
    else if (messageType === 'luogo') {
        latitudine = req.body.latitudine;

        longitudine = req.body.longitudine;

    }

    //flag per il mittente
    const isMittente = false;

    const id = await squealService.getIdAlto('Chat') + 1;
    const successivo = id + 1;

    //data attuale di tipo timestamp
    const timestampData = new Date();

    //aggiungo un'ora alla data attuale in modo sicuro
    const unOraInMillisecondi = 60 * 60 * 1000; // 60 minuti * 60 secondi * 1000 millisecondi
    const nuovaData = new Date(timestampData.getTime() + unOraInMillisecondi);

    squealService.inserisciMessaggio(id, idMittente, IdValue, text, isMittente, media, latitudine, longitudine, nuovaData);

    //NOTIFICHE
    //inserisco la notifica
    const idNotifica = await squealService.getIdAlto('Notifiche') + 1;
    const isPrivate = true;
    const idCanale = null;
    squealService.insertNotifica(idNotifica, IdValue, idMittente, idCanale, isPrivate);
});


app.post('/send-channel', async (req, res) => {
    const messageType = req.body.messageType;
    const selectedOption = req.body.selectedOption;
    const channelSelected = req.body.channelSelected;
    const idChannel = await squealService.getChnID(channelSelected);

    let longitudine= 0;
    let latitudine= 0;
    let squeal= {};
    const id = await squealService.getIdAlto('Squeal') + 1;
    const successivo= id + 1;

    squeal.id= id;
    squeal.autore= req.session.userId;
    squeal.text= null;
    squeal.media= null;
    squeal.video= null;
    squeal.latitudine= null;
    squeal.longitudine= null;

    //controllo se il messaggio è di tipo testo o immagine
    if (messageType === 'text') {
        const messageContent = req.body.messageContent;
        squeal.text = messageContent;
        //controllo per verificare se il message content contiene "@"
        if (messageContent.includes("@")) {
            //trovo l'indice del carattere "@"
            const index = messageContent.indexOf("@");

            //estrae la parte della stringa dopo il carattere "@"
            const restanteDopoAt = messageContent.substring(index + 1);

            //trova l'indice del primo spazio nella parte rimanente
            const parole = restanteDopoAt.split(" ");

            //estrae la prima parola dopo il carattere "@"
            const menzionato = parole[0];

            //recupero l'username dell'utente loggato
            const username = req.session.username;

            const usersUsername = await squealService.getAllUsernames();

            //estraggo username da ciascun elemento
            const usernames = usersUsername.map(item => item.username);

            //verifico se menzione è diverso dal mio username e se esiste un username uguale
            for (let i = 0; i < usernames.length; i++) {
                if (menzionato !== username && menzionato === usernames[i]) {
                    //recupero l'id del menzionato
                    const idMenzionato = await squealService.getIdbyUsername(menzionato);

                    const idMenzione= await squealService.getIdAlto('Menzioni') + 1;

                    //inserisco la menzione nel database
                    squealService.insertMenzione(idMenzione, squeal.id, squeal.autore, idMenzionato[0].id, idChannel);

                    break;
                }
            }
        }
    } else if (messageType === 'photo') {
        const messageContent = req.body.messageContent;
        squeal.media = messageContent;
    } else if (messageType === 'video') {
        const messageContent = req.body.messageContent;
        squeal.video = messageContent;
    }
    else if (messageType === 'luogo') {
        latitudine = req.body.latitudine;
        squeal.latitudine = latitudine;
        longitudine = req.body.longitudine;
        squeal.longitudine = longitudine;
    }

    //data attuale di tipo timestamp
    const timestampData = new Date();

    const nuovaData = new Date(timestampData.getTime() );

    squeal.data= nuovaData;

    //creo lo squeal
    squealService.insertSqueal(squeal.id, squeal.autore, squeal.text, squeal.data, squeal.media, squeal.video, squeal.latitudine, squeal.longitudine);

    //recupero l'id del canale
    const idCanale = await squealService.getChnID(channelSelected);

    //inserisco lo squeal nel canale
    squealService.insertSquealToCanale(squeal.id, idCanale);

    //NOTIFICHE
    //prendo gli id di tutti gli iscritti al canale
    const idIscritti = await squealService.getIdIscritti(idCanale);

    //estraggo i valori con map
    const idIscrittiValues = idIscritti.map(item => item.id_utente);

    const isPrivate = false;
    //ciclo sugli iscritti
    for (let i = 0; i < idIscrittiValues.length; i++) {
        if (idIscrittiValues[i] !== squeal.autore) {
            const idNotifica = await squealService.getIdAlto('Notifiche') + 1 + i;
            //inserisco la notifica
            squealService.insertNotifica(idNotifica, idIscrittiValues[i], squeal.autore, idCanale, isPrivate);
        }
    }

    //QUOTA CARATTERI
    //prende la quota rimasta
    const quotaGiornalieraRimanente = req.body.quotaGiornalieraValue;

    //prendo i cookie con i valori iniziali delle quote
    const quotaGiornalieraUser = req.cookies.quotaGiornaliera;
    const quotaSettimanaleUser = req.cookies.quotaSettimanale;
    const quotaMensileUser = req.cookies.quotaMensile;

    //calcolo il numero di caratteri che è stato sottratto
    const riduciQuota= quotaGiornalieraUser - quotaGiornalieraRimanente;

    //calcolo i valori finali delle quote
    const quotaSettimanaleValue = quotaSettimanaleUser - riduciQuota;
    const quotaMensileValue = quotaMensileUser - riduciQuota;

    //aggiorno il database con queste queste
    idUtente = req.session.userId;
    squealService.updateQuota(idUtente, quotaGiornalieraRimanente, quotaSettimanaleValue, quotaMensileValue);
});

app.get('/notifiche', async (req, res) => {
    try {
        //id utente
        const userId = req.session.userId;

        //prendo l'id di chi mi ha inviato la notifica
        const idNotificante = await squealService.getNotificante(userId);

        //estrae solo i valori di interesse da idMenzionante
        const idNotificanteValues = idNotificante.data.map(item => item.id_notificante);

        //recupero l'id del canale
        const idCanale = await squealService.getIdCanaleNotifiche(idNotificanteValues);

        //estrae i valori con map solo se id_canale è diverso da null
        const idCanaleValues = idCanale.data.map(item => (item.id_canale !== null) ? item.id_canale : null);

        //recupero il valore isPrivate
        const isPrivate = await squealService.getIsPrivate(idCanaleValues);

        //estrae i valori
        const isPrivateValues = isPrivate.data.map(item => item.isPrivate !== null ? item.isPrivate : true);

        //array per contenere le informazioni di ogni notifica
        const notificanti = [];

        //ciclo su ogni id_menzionante e memorizzo le informazioni
        for (let i = 0; i < idNotificanteValues.length; i++) {
            const idNotificante = idNotificanteValues[i];
            const usernameNotificante = await squealService.getUsernameById(idNotificante);

            //map direttamente sugli username
            const usernames = usernameNotificante.map(item => item.username);

            const isPrivate = isPrivateValues[i];
            let canali = null;

            if(isPrivate === false) {
                const canale = idCanaleValues[i];
                const nomeCanale = await squealService.getNomeCanale(canale);

                item => item.isPrivate !== null ? item.isPrivate : true
                canali = nomeCanale.map(item => item.nome !== null ? item.nome : null);
            }

            //creo un oggetto con tutte le informazioni e lo aggiungo all'array
            notificanti.push({
                usernames: usernames,
                canale: canali,
                isPrivate: isPrivate
            });
        }

        res.render('notifiche', { notificanti: notificanti });

    } catch (error) {
        console.error('Errore durante la gestione della richiesta GET /notifiche:', error.message);
        res.status(500).json({ success: false, error: 'Errore nella gestione della richiesta GET /notifiche' });
    }
});

//gestione menzioni
app.get('/menzioni', async (req, res) => {
    try {
        //id utente
        const userId = req.session.userId;

        //prendo l'id di chi mi ha menzionato
        const result = await squealService.getMenzionante(userId);

        //estrae solo i valori di interesse da idMenzionante
        const idMenzionanteValues = result.data.map(item => item.id_menzionante);

        //array per contenere le informazioni di ogni menzione
        const menzionanti = [];

        //ciclo su ogni id_menzionante e memorizzo l'username
        for (const idMenzionante of idMenzionanteValues) {
            //memorizzo l'username di chi mi ha menzionato
            const usernameMenzionante = await squealService.getUsernameById(idMenzionante);
            //aggiungo l'username all'array
            menzionanti.push({ username: usernameMenzionante });
        }

        //correggo la sintassi
        const usernameMenzionanti= menzionanti.map(item => item.username[0].username);

        //memorizza nel cookie
        res.cookie('menzionanti', usernameMenzionanti);

        res.render('menzioni', { menzionanti: usernameMenzionanti });

    } catch (error) {
        console.error('Errore durante la gestione della richiesta GET /menzioni:', error.message);
        res.status(500).json({ success: false, error: 'Errore nella gestione della richiesta GET /menzioni' });
    }
});

//visualizzazione delle menzioni
app.get('/viewMenzioni', async (req, res) => {
    //recupera cookie
    const usernameMenzionanti = req.cookies.menzionanti;

    //prendo l'id dell'utente
    const userId = req.session.userId;

    //recupero gli id degli squeal dove l'utente è stato menzionato
    const idSqueal = await squealService.getIdSquealMenzioni(userId);

    //estraggo i valori
    const idSquealValues = idSqueal.map(item => item.id_squeal);
    const idCanaleValues = idSqueal.map(item => item.id_canale);

    let squealText = null;
    const menzioni = [];

    for (let i = 0; i < idSquealValues.length; i++) {
        const idSquealValue = idSquealValues[i];
        const idCanaleValue = idCanaleValues[i];

        //estraggo il nome del canale con l'id
        const nomeCanale = await squealService.getNomeCanale(idCanaleValue);

        //estraggo il valore
        const nomeCanaleValue = nomeCanale.map(item => item.nome);

        //recupero gli squeal
        const squeal = await squealService.getSquealMenzioni(idSquealValue);

        //estraggo il valore
        const squealText = squeal.map(item => item.testo);

        //aggiungo il valore all'array
        menzioni.push({
            menzione: squealText,
            usernameMenzionante: usernameMenzionanti[i],
            nomeCanale: nomeCanaleValue
        });
    }
    res.render('viewMenzioni', { menzioni: menzioni});
});

//gestione abbonamento
app.get('/acquistaCaratteri', async (req, res) => {

    //prendo l'id dell'utente
    const userId = req.session.userId;

    //chiamo getIsAbbonato
    const isAbbonato = await squealService.getIsAbbonato(userId);

    //estrae il valore
    const isAbbonatoValue = isAbbonato[0].isAbbonato;

    res.render('acquistaCaratteri', { isAbbonatoValue: isAbbonatoValue });
});

//compra abbonamento
app.post('/updateBuyCaratteri', async (req, res) => {
    //prendo l'id dell'utente
    const userId = req.session.userId;

    //abbono l'utente
    await squealService.updateAbbonato(userId);

});

app.get('/channel/:channelName', async (req, res) => {
    try {
        const channelName = req.params.channelName;
        let channelDetails;
        let squealDetails = [];
        const userId = req.session.userId;
        let { data: publicChannelDetails } = await supabase.from('Canale_Pubblico').select('*').eq('nome', channelName);
        if (publicChannelDetails.length === 0) {
            let { data: privateChannelDetails } = await supabase.from('Canale').select('*').eq('nome', channelName);
            channelDetails = privateChannelDetails[0];
            // Verifica iscrizione dell'utente
            const { data: subscription } = await supabase
                .from('Iscrizioni')
                .select('*')
                .eq('id_utente', userId)
                .eq('id_canale', channelDetails.id);

            if (subscription.length === 0) {
                // Utente non iscritto, reindirizza alla pagina di iscrizione
                return res.render('subscription', { channelName: channelName });
            }
            // Ottieni gli ID degli squeal associati al canale
            const { data: squealIds } = await supabase.from('Squeal_Canale').select('id_squeal').eq('id_canale', channelDetails.id);


            // Recupera gli squeal dalla tabella Squeal per ogni id_squeal trovato
            for (const squealId of squealIds) {
                const { data: squeal } = await supabase.from('Squeal').select('*,Users(username)').eq('id', squealId.id_squeal);
                squealDetails.push(squeal[0]);
            }
        } else {
            //PUBBLICO
            channelDetails = publicChannelDetails[0];

            if (channelName === 'ALLS') {
                squealDetails = await squealService.getALLS();
            } else if (channelName === 'TOP10') {
                squealDetails = await squealService.getTOP10();
            } else if (channelName === 'CONTROVERSIAL') {
                squealDetails = await squealService.getCONTROVERSIAL();
            } else if (channelName === 'WORST10') {
                squealDetails = await squealService.getWORST10();
            } else if (channelName === 'RANDOM') {
                squealDetails = await squealService.getRANDOM();
            } else if (channelName === 'NASA') {
                squealDetails = await squealService.getNasa();
            }
        }



        const userEmail = req.session.userEmail;
      
        res.render('channel', {
            userEmail: userEmail,
            channelDetails: channelDetails,
            squeals: squealDetails
        });
    } catch (error) {
        console.error('Errore durante la gestione della richiesta del canale:', error.message);
        res.status(500).send('Errore interno del server');
    }
});

// Dichiarazione di una variabile globale per tenere traccia dello stato del blocco
let isModeratorDashboardLocked = false;
let currentModerator = null;

app.get('/dashboardMod', async (req, res) => {
    try {
        // Verifica se la dashboard è già bloccata da un altro moderatore
        if (isModeratorDashboardLocked && req.session.userEmail !== currentModerator) {
            res.redirect('/');
            return;
        }
        const userAgent = req.headers['user-agent'].toLowerCase();
        const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
        const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword));

        if (isMobile) {
            // Se l'utente sta utilizzando un dispositivo mobile, reindirizzalo
            res.redirect('/');
            return;
        }
        isModeratorDashboardLocked = true;
        currentModerator = req.session.userEmail;

        res.render('dashboardMod', {});
    } catch (error) {
        console.error('Errore durante la gestione della richiesta:', error.message);
        res.status(500).send('Errore interno del server');
    }
});
app.get('/manageUsers', async (req, res) => {
    try {
        // Ottieni il tipo selezionato dal filtro
        const userTypeFilter = req.query.type || '';
        // Ottieni l'username selezionato dal filtro
        const usernameFilter = req.query.username || '';
        const popularityFilter = req.query.popularity || ''; // Filtro per la popolarità

        let query = await supabase.from('Users').select('*,Squeal(*)') ;
        if (userTypeFilter && !usernameFilter) {
            query = await supabase.from('Users').select('*,Squeal(*)').eq('type', userTypeFilter);
        }
        if (usernameFilter && !userTypeFilter) {
            query = await supabase.from('Users').select('*,Squeal(*)').ilike('username', `%${usernameFilter}%`);
        }
        if (usernameFilter && userTypeFilter) {
            query = await supabase.from('Users').select('*,Squeal(*)').eq('type', userTypeFilter).ilike('username', `%${usernameFilter}%`);
        }

        const { data: users, error } = await query;

        if (error) {
            // Gestisci l'errore
            console.error('Errore durante il recupero degli utenti:', error.message);
            return res.status(500).send('Errore interno del server');
        }
        // Calcola la popolarità per ogni utente
        const usersWithPopularity = users.map(user => {
            const popularity = squealService.calculateUserPopularity(user.Squeal);
            return { ...user, popularity };
        });
        const filteredUsers = popularityFilter ? usersWithPopularity.filter(user => user.popularity === popularityFilter) : usersWithPopularity;
        res.render('manageUsers', { users: filteredUsers, userTypeFilter, usernameFilter, popularityFilter });

    } catch (error) {
        console.error('Errore durante la gestione della richiesta:', error.message);
        res.status(500).send('Errore interno del server');
    }
});


app.get('/unlockDashboard', (req, res) => {
    // Verifica se l'utente che vuole sbloccare la dashboard è il moderatore corrente
    if (req.session.userEmail === currentModerator) {
        // Sblocca la dashboard
        isModeratorDashboardLocked = false;
        currentModerator = null;
        res.status(200).send('Logout del moderatore avvenuto con successo.');
    } else {
        // Invia una risposta di errore se il moderatore non è autorizzato
        res.status(403).send('Accesso negato. Non sei autorizzato a fare il logout del moderatore.');
    }
});
app.post('/toggleBlockStatus', async (req, res) => {
    const { id, block } = req.query;

    const { data, error } = await supabase
        .from('Users')
        .update({ bloccato: block })
        .eq('id', id);
    if (error) {
        console.error('Errore durante l\'aggiornamento dello stato di blocco:', error);
        res.status(500).send('Errore durante l\'aggiornamento dello stato di blocco');
    } else {
        res.status(200).send('Operazione completata con successo');
    }
});
app.post('/updateChars', async (req, res) => {
    const { id, column, value } = req.query;
    const updateData = {};
    updateData[column] = value;
    const { data, error } = await supabase
        .from('Users')
        .update(updateData)
        .eq('id', id);
    if (error) {
        console.error('Errore durante l\'aggiornamento dei caratteri:', error);
        res.status(500).send('Errore durante l\'aggiornamento dei caratteri');
    } else {
        res.status(200).send('Operazione completata con successo');
    }
});


app.get('/managePosts', async (req, res) => {
    const { sender, date, channel } = req.query;
    let squealQuery = supabase
        .from('Squeal')
        .select(`
            *,
            Users (
                username
            ),
            Squeal_Canale!inner (
                id_canale, Canale (nome)
            )
        `);
    if (sender) {
        squealQuery = squealQuery
            .ilike('Users.username', `%${sender}%`);

    }
    if (date) {
        const [year, month, day] = date.split('-'); // Divido la data
        squealQuery = squealQuery
            .gte('data', `${date}T00:00:00+01`) // Data e ora iniziali del giorno specificato
            .lte('data', `${date}T23:59:59+01`); // Data e ora finali del giorno specificato
    }

    if (channel) {
        squealQuery = squealQuery.eq('Squeal_Canale.id_canale', channel);
    }
    const { data, error } = await squealQuery;
    const { data: channels, error: channelsError } = await supabase
        .from('Canale')
        .select('id, nome');
    if (error) {
        console.error('Errore durante la query dei post', error.message);
    } else {
        squeal = data;
    }
    res.render('managePosts', { squeal, channels});
});

app.post('/updateChannel', async (req, res) => {
    const { postId, newChannelId } = req.query;
    const { data, error } = await supabase
        .from('Squeal_Canale')
        .update({ id_canale: newChannelId })
        .match({ id_squeal: postId });
    if (error) {
        console.error('Errore durante laggiornamento del canale', error.message);
        res.status(500).send('Errore durante laggiornamento del canale');
    } else {
        res.send('Canale aggiornato con successo');
    }
});
app.post('/deleteChannel', async (req, res) => {
    const { id } = req.body;

    const { data, error } = await supabase
        .from('Canale')
        .delete()
        .match({ id });
    if (error) {
        console.error('Errore durante l\'eliminazione del canale', error.message);
        return res.status(500).json({ success: false });
    }
    res.json({ success: true });
});

app.post('/addChannel', async (req, res) => {
    const { nome, descrizione, type } = req.body;
    const admin = req.session.userId;
    // Prima determina l'ID più alto esistente
    const { data: maxIdData, error: maxIdError } = await supabase
        .from('Canale')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
    if (maxIdError) {
        console.error('Errore durante il recupero dell\'ID massimo', maxIdError.message);
        return res.status(500).json({ success: false });
    }
    const maxId = maxIdData.length > 0 ? maxIdData[0].id : 0;
    const newId = maxId + 1;

    const { data: insertData, error: insertError } = await supabase
        .from('Canale')
        .insert([{ id: newId, nome, descrizione, type, admin }]);
    if (insertError) {
        console.error('Errore durante l\'inserimento del nuovo canale', insertError.message);
        return res.status(500).json({ success: false });
    }
    res.json({ success: true });
});


app.get('/managePrivateChannels', async (req, res) => {
    const { data, error } = await supabase
        .from('Canale')
        .select('nome, descrizione, id');
    if (error) {
        console.error('Errore durante la query dei canali', error.message);
        return res.status(500).send('Errore interno del server');
    }
    res.render('managePrivateChannels', { canali: data });
});
app.post('/updateInteraction', async (req, res) => {
    const { id, column, value } = req.query;
    const updateData = {};
    updateData[column] = value;
    const { data, error } = await supabase
        .from('Squeal')
        .update(updateData)
        .eq('id', id);
    if (error) {
        console.error('Errore durante l\'aggiornamento delle interazioni:', error);
        res.status(500).send('Errore durante l\'aggiornamento delle interazioni');
    } else {
        res.status(200).send('Operazione completata con successo');
    }
});
app.get('/manageChannels', async (req, res) => {
    let channels = [];
    const channelsQuery = supabase
        .from('Canale_Pubblico')
        .select('*');
    const { data, error } = await channelsQuery;
    if (data) {
        channels = data;
    } else {
        console.error('Errore durante il recupero dei canali:', error);
    }
    res.render('manageChannels', { channels });
});

app.post('/updateChannelDescription', async (req, res) => {
    const { id, descrizione } = req.query;
    const { data, error } = await supabase
        .from('Canale_Pubblico')
        .update({ descrizione: descrizione })
        .eq('id', id);

    if (error) {
        console.error('Errore durante laggiornamento della descrizione del canale:', error);
        return res.status(500).send('Errore durante l aggiornamento della descrizione del canale');
    }
    res.send('Descrizione aggiornata con successo');
});
app.get('/addSquealToChannel/:canaleId', async (req, res) => {
    const canaleId = req.params.canaleId;

    const { data: squeals, error } = await supabase.from('Squeal').select('*');
    const { data: squealsInChannel, error: errorSquealsInChannel } = await supabase.from('Squeal_Canale').select('id_squeal');

// un set con gli id_squeal presenti in squealsInChannel
    const squealsInChannelIds = new Set(squealsInChannel.map(s => s.id_squeal));

// filtrare squeals per includere solo quelli il cui id non è presente in squealsInChannelIds
    const filteredSqueals = squeals.filter(squeal => !squealsInChannelIds.has(squeal.id));

    if (error || errorSquealsInChannel) {
        console.error('Errore durante la query degli squeal disponibili', error.message);
        return res.status(500).send('Errore interno del server');
    }
    res.render('addSqueal', { squeals: filteredSqueals, canaleId });
});


app.post('/associateSquealWithChannel', async (req, res) => {
    const { squealId, canaleId } = req.body;
    const { data, error } = await supabase
        .from('Squeal_Canale')
        .insert([{ id_squeal: squealId, id_canale: canaleId }]);
    if (error) {
        console.error('Errore durante l\'associazione dello squeal con il canale', error.message);
        return res.status(500).json({ success: false });
    }
    res.json({ success: true });
});

app.post('/updateChannelVisibility', async (req, res) => {
    const { id, visible } = req.query;
    const { data, error } = await supabase
        .from('Canale_Pubblico')
        .update({ visibile: visible === 'true' })
        .eq('id', id);
    if (error) {
        console.error('Errore durante l\'aggiornamento della visibilità del canale:', error);
        res.status(500).send('Errore durante l\'aggiornamento della visibilità del canale');
    } else {
        res.status(200).send('Operazione completata con successo');
    }
});
app.post('/disassociateSquealFromChannel', async (req, res) => {
    const { squealId, canaleId } = req.body;
    const { data, error } = await supabase
        .from('Squeal_Canale')
        .delete()
        .match({ id_squeal: squealId, id_canale: canaleId });
    if (error) {
        console.error('Errore durante la rimozione dell\'associazione dello squeal con il canale', error.message);
        return res.status(500).json({ success: false });
    }
    res.json({ success: true });
});
app.get('/removeSquealFromChannel/:canaleId', async (req, res) => {
    const canaleId = req.params.canaleId;
    //query per ottenere tutti gli squeal associati a questo canale
    const { data: squeals, error } = await supabase
        .from('Squeal')
        .select(`*, Squeal_Canale!inner(*)`)
        .eq('Squeal_Canale.id_canale', canaleId);
    if (error) {
        console.error('Errore durante la query degli squeal associati', error.message);
        return res.status(500).send('Errore interno del server');
    }
    res.render('removeSqueal', { squeals: squeals, canaleId: canaleId });
});

app.listen(port, () => {
    console.log(`Server avviato su http://localhost:${port}`);
});

//file statici
app.use(express.static('public'));