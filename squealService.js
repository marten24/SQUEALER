// Configura Supabase
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


async function fetchAndInsertNasaImg() {
    const apikey = process.env.NASA_API_KEY;
    const url = "https://api.nasa.gov/planetary/apod?api_key=" + apikey;

    try {
        // Fetch dei dati dalla NASA API
        const response = await fetch(url);
        const imgData = await response.json();
        const id= await getIdAlto('Squeal') + 1;

        // Inserimento dei dati nel database
        const { error } = await supabase
            .from('Squeal')
            .insert(

                {
                    id: id,
                    autore: "e07c0fb4-606c-48b7-977a-59535556e3d4",
                    media: imgData.url,
                    data: new Date()
                }
            );

        if (error) {
            console.error('Si è verificato un errore durante l\'inserimento dei dati nel database:', error.message);
            return null;
        }
    } catch (error) {
        console.error('Si è verificato un errore durante l\'operazione:', error);
        return null;
    }
}


//restituisce la data del post di botNasa piu' recente
async function getDataNasa(){
    try {
        const { data, error } = await supabase.rpc('getDataNasa');
        return data;
        if (error) {
            throw error;
        }

    } catch (error) {
        console.error('Errore durante l\'esecuzione della stored procedure:', error.message);
    }
}
//ottieni l'id del canale passando il nome
async function getChnID(nomeChn) {
    try {
        const { data, error } = await supabase
            .from('Canale')
            .select('id')
            .eq('nome', nomeChn);

        if (error) {
            console.error('Errore durante la query:', error);
            return null;
        } else {
            if (data && data.length > 0) {
                return data[0].id;
            } else {
                return null;
            }
        }
    } catch (error) {
        console.error('Errore generico:', error.message);
        return null;
    }
}


async function addCool(sID) {
    try {
        const { data, error } = await supabase.rpc('addCool', { 'sid':sID });
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Errore durante l\'esecuzione della stored procedure:', error.message);
    }
}

async function addCringe(sID) {
    try {
        const { data, error } = await supabase.rpc('addCringe', { 'sid':sID });
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Errore durante l\'esecuzione della stored procedure:', error.message);

    }
}

async function removeCool(sID) {
    try {
        const { data, error } = await supabase.rpc('removeCool', { 'sid':sID });
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Errore durante l\'esecuzione della stored procedure:', error.message);

    }
}

async function removeCringe(sID) {
    try {
        const { data, error } = await supabase.rpc('removeCringe', { 'sid':sID });
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Errore durante l\'esecuzione della stored procedure:', error.message);

    }
}

async function addView(sID) {
    try {
        const { data, error } = await supabase.rpc('addView', { 'sid':sID });
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Errore durante l\'esecuzione della stored procedure:', error.message);

    }
}

async function getCool(sID) {
    try {
        const { data, error } = await supabase.rpc('getCool', { 'sid':sID });
        if (error) {
            throw error;
        }
        else {
            return data;
        }
    } catch (error) {
        console.error('Errore durante l\'esecuzione della stored procedure:', error.message);
    }
}

async function getCringe(sID) {
    try {
        const {data, error} = await supabase.rpc('getCringe', {'sid': sID});
        if (error) {
            throw error;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore durante l\'esecuzione della stored procedure:', error.message);
    }
}

//restituisce tutti gli elementi di uno squeal dato uno squealID
async function getSqueal(sID) {
    try {
        const {data, error} = await supabase.rpc('getSqueal', {'sid': sID});
        if (error) {
            throw error;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore durante l\'esecuzione della stored procedure:', error.message);
    }
}

//restituisce gli amici di un utente
async function getFriends(userId) {
    try {
        const {data, error} = await supabase
            .from('Amici')
            .select('amico1, amico2')
            .or(`amico1.eq.${userId}, amico2.eq.${userId}`);
        if (error) {
            console.error('Errore durante la chiamata a getFriends:', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getFriends:', error.message);
        return null;
    }
}

//restituisce gli username degli amici di un utente
async function getFriendsByUsername(userId, friendId) {
    try {
        const {data, error} = await supabase
            .from('Users')
            .select('username')
            .or(`id.eq.${userId}`, `id.eq.${friendId}`);

        if (error) {
            console.error('Errore durante la chiamata a getFriendsByUsername:', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getFriendsByUsername:', error.message);
        return null;
    }
}

//prende tutti i messaggi dove mittente = userId
async function getMessagesByMittente(userId) {
    try {
        const {data, error} = await supabase
            .from('Chat')
            .select('*')
            .eq('id_mittente', userId);
        if (error) {
            console.error('Errore durante la chiamata a getMessagesByUserId:', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getMessagesByUserId:', error.message);
        return null;
    }
}

//prende tutti i messaggi dove destinatario = userId
async function getMessagesByDestinatario(userId) {
    try {
        const {data, error} = await supabase
            .from('Chat')
            .select('*')
            .eq('id_destinatario', userId);
        if (error) {
            console.error('Errore durante la chiamata a getMessagesByUserId:', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getMessagesByUserId:', error.message);
        return null;
    }
}

//restituisce l'id di un utente dato il suo username
async function getIdbyUsername(username) {
    try {
        const {data, error} = await supabase
            .from('Users')
            .select('id')
            .eq('username', username);
        if (error) {
            console.error('Errore durante la chiamata a getIdbyUsername', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getIdbyUsername:', error.message);
        return null;
    }
}

//restituisce l'username di un utente dato il suo id
async function getUsernameById(id) {
    try {
        const {data, error} = await supabase
            .from('Users')
            .select('username')
            .eq('id', id);
        if (error) {
            console.error('Errore durante la chiamata a getUsernameById', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getUsernameById:', error.message);
        return null;
    }
}

//insert di un messaggio nella tabella chat
async function inserisciMessaggio(id, id_mittente, id_destinatario, text, isMittente, media, latitudine, longitudine, data) {
    try {
        const {error} = await supabase
            .from('Chat')
            .insert([
                {
                    id: id,
                    id_mittente: id_mittente,
                    id_destinatario: id_destinatario,
                    text: text,
                    isMittente: isMittente,
                    media: media,
                    latitudine: latitudine,
                    longitudine: longitudine,
                    data: data
                },
            ]);
        if (error) {
            console.error('Errore durante l\'inserimento del messaggio:', error.message);
            return {success: false, error: error.message};
        } else {
            return {success: true};
        }
    } catch (e) {
        console.error('Errore generale:', e.message);
        return {success: false, error: e.message};
    }
}

//prende l'id piu alto di una tabella
async function getIdAlto(nomeTabella) {
    try {
        const {data, error} = await supabase

            .from(nomeTabella)
            .select('id', {count: 'exact'})
            .order('id', {ascending: false})
            .limit(1);
        if (error) {
            console.error('Errore durante la chiamata a getIdAlto', error.message);
            return null;
        } else {
            return data.length > 0 ? data[0].id : null;
        }
    } catch (error) {
        console.error('Errore generico in getIdAlto:', error.message);
        return null;
    }
}

//prende l'id degli utenti che hanno menzionato uno specifico utente
async function getMenzionante(menzionato) {
    try {
        const { data, error } = await supabase
            .from('Menzioni')
            .select('id_menzionante')
            .eq('id_menzionato', menzionato);
        if (error) {
            console.error('Errore durante la ricezione del menzionante:', error.message || error);
            return { success: false, error: 'Errore durante la ricezione del menzionante' };
        } else {
            return { success: true, data: data }; // Ritorno anche i dati
        }
    } catch (e) {
        console.error('Errore generale durante la ricezione del menzionante', e.message);
        return { success: false, error: 'Errore generale durante la ricezione del menzionante' };
    }
}

//restituisce i canali in cui è iscritto un utente
async function getIscrizioni(userId) {
    try {
        const {data, error} = await supabase
            .from('Iscrizioni')
            .select('id_canale')
            .eq('id_utente', userId);
        if (error) {
            console.error('Errore durante la chiamata a getIscrizioni', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getIscrizioni:', error.message);
        return null;
    }
}

async function getNomeCanale(id) {
    try {
        const {data, error} = await supabase
            .from('Canale')
            .select('nome')
            .eq('id', id);

        if (error) {
            console.error('Errore durante la chiamata a getNomeCanale', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getNomeCanale:', error.message);
        return null;
    }
}

async function insertSqueal(id, autore, testo, data, media, video, latitudine, longitudine) {
    try {
        const {error} = await supabase
            .from('Squeal')
            .insert([
                {
                    id: id,
                    autore: autore,
                    testo: testo,
                    data: data,
                    media: media,
                    video: video,
                    latitudine: latitudine,
                    longitudine: longitudine
                },
            ]);
        if (error) {
            console.error('Errore durante l\'inserimento dello squeal:', error.message);
            return {success: false, error: error.message};
        } else {
            return {success: true};
        }
    } catch (e) {
        console.error('Errore generale:', e.message);
        return {success: false, error: e.message};
    }
}

//inserisci uno squeal dentro un canale specifivo
async function insertSquealToCanale(id_squeal, id_canale) {
    try {
        const {error} = await supabase
            .from('Squeal_Canale')
            .insert([
                {
                    id_squeal: id_squeal,
                    id_canale: id_canale,
                },
            ]);
        if (error) {
            console.error('Errore durante l\'inserimento dello squeal nel canale:', error.message);
            return {success: false, error: error.message};
        } else {
            return {success: true};
        }
    } catch (e) {
        console.error('Errore generale:', e.message);
        return {success: false, error: e.message};
    }
}

async function getAllUsernames() {
    try {
        const {data, error} = await supabase
            .from('Users')
            .select('username')
        if (error) {
            console.error('Errore durante la chiamata a getAllUsernames:', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getAllUsernames:', error.message);
        return null;
    }
}

//inserisci una nuova menzione
async function insertMenzione(id, id_squeal, id_menzionante, id_menzionato, id_canale) {
    try {
        const {error} = await supabase
            .from('Menzioni')
            .insert([
                {
                    id: id,
                    id_squeal: id_squeal,
                    id_menzionante: id_menzionante,
                    id_menzionato: id_menzionato,
                    id_canale: id_canale
                },
            ]);
        if (error) {
            console.error('Errore durante l\'inserimento della menzione:', error.message);
            return {success: false, error: error.message};
        } else {
            return {success: true};
        }
    } catch (e) {
        console.error('Errore generale:', e.message);
        return {success: false, error: e.message};
    }
}

//restituisce gli id iscritti ad un canale
async function getIdIscritti(id_canale) {
    try {
        const {data, error} = await supabase
            .from('Iscrizioni')
            .select('id_utente')
            .eq('id_canale', id_canale);
        if (error) {
            console.error('Errore durante la chiamata a getIdIscritti:', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getIdIscritti:', error.message);
        return null;
    }
}

async function insertNotifica(id, id_notificato, id_notificante, id_canale, isPrivate) {
    try {
        const {error} = await supabase
            .from('Notifiche')
            .insert([
                {
                    id: id,
                    id_notificato: id_notificato,
                    id_notificante: id_notificante,
                    id_canale: id_canale,
                    isPrivate: isPrivate
                },
            ]);
        if (error) {
            console.error('Errore durante l\'inserimento della notifica:', error.message);
            return {success: false, error: error.message};
        } else {
            return {success: true};
        }
    } catch (e) {
        console.error('Errore generale:', e.message);
        return {success: false, error: e.message};
    }
}

//restituisce chi mi ha mandato la notifica
async function getNotificante(id_notificato) {
    try {
        const { data, error } = await supabase
            .from('Notifiche')
            .select('id_notificante')
            .eq('id_notificato', id_notificato);
        if (error) {
            console.error('Errore durante la ricezione delle notifiche:', error.message || error);
            return { success: false, error: 'Errore durante la ricezione delle notifiche' };
        } else {
            return { success: true, data: data };
        }
    } catch (e) {
        console.error('Errore generale durante la ricezione delle notifiche', e.message);
        return { success: false, error: 'Errore generale durante la ricezione delle notifiche' };
    }
}


//restituisce l'id del canale dalle notifiche
async function getIdCanaleNotifiche(idNotificanteValues) {
    try {
        const { data, error } = await supabase
            .from('Notifiche')
            .select('id_canale')
            .in('id_notificante', idNotificanteValues);
        if (error) {
            console.error('Errore durante la ricezione del notificato:', error.message || error);
            return { success: false, error: 'Errore durante la ricezione del notificato' };
        } else {
            return { success: true, data: data };
        }
    } catch (e) {
        console.error('Errore generale durante la ricezione del del notificato', e.message);
        return { success: false, error: 'Errore generale durante la ricezione del del notificato' };
    }
}

//check se il messaggio è privato o meno
async function getIsPrivate() {
    try {
        const { data, error } = await supabase
            .from('Notifiche')
            .select('isPrivate');
        if (error) {
            console.error('Errore durante la ricezione del flag:', error.message || error);
            return { success: false, error: 'Errore durante la ricezione del flag' };
        } else {
            return { success: true, data: data };
        }
    } catch (e) {
        console.error('Errore generale durante la ricezione del flag', e.message);
        return { success: false, error: 'Errore generale durante la ricezione del flag' };
    }
}

//restituisce l'id dello squeal e del canale dove sono stato menzionato
async function getIdSquealMenzioni(id_menzionato) {
    try {
        const {data, error} = await supabase
            .from('Menzioni')
            .select('id_squeal, id_canale')
            .eq('id_menzionato', id_menzionato);
        if (error) {
            console.error('Errore durante la chiamata a getSquealMenzioni', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getSquealMenzioni:', error.message);
        return null;
    }
}

//restituisce lo squeal dove sono stato menzionato
async function getSquealMenzioni(id_squeal) {
    try {
        const {data, error} = await supabase
            .from('Squeal')
            .select('*')
            .eq('id', id_squeal);
        if (error) {
            console.error('Errore durante la chiamata a getSquealMenzioni', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getSquealMenzioni:', error.message);
        return null;
    }
}

async function getQuotaCaratteri(idUtente) {
    try {
        const {data, error} = await supabase
            .from('Users')
            .select('day_ch_l, wek_ch_l, mon_ch_l')
            .eq('id', idUtente);
        if (error) {
            console.error('Errore durante la chiamata a getQuotaCaratteri', error.message);
            return null;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Errore generico in getQuotaCaratteri:', error.message);
        return null;
    }
}

async function updateQuota(userId, nuovaQuotaGiorn, nuovaQuotaSett, nuovaQuotaMens) {
    try {
        const { data, error } = await supabase
            .from('Users')
            .update({
                day_ch_l: nuovaQuotaGiorn,
                wek_ch_l: nuovaQuotaSett,
                mon_ch_l: nuovaQuotaMens,
            })
            .eq('id', userId);
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Errore durante l\'aggiornamento della quota:', error.message);
    }
}

//gestione abbonamento
async function updateAbbonato(userId) {
    try {
        const { data, error } = await supabase
            .from('Users')
            .update({
                isAbbonato: true,
            })
            .eq('id', userId);
        if (error) {
            throw error;
        }
        if (data.length === 0) {
            throw new Error('Utente non trovato');
        }
    } catch (error) {
        console.error('Errore durante l\'aggiornamento IsAbbonato:', error.message);
    }
}

//controlla se sono abbontato
async function getIsAbbonato(id_utente) {
    const { data, error } = await supabase
        .from('Users')
        .select('isAbbonato')
        .eq('id', id_utente);
    if (error) {
        console.error(error);
        return [];
    }
    return data;
}

async function getCONTROVERSIAL() {
    const { data, error } = await supabase
        .from('Squeal')
        .select('*, Users(username)')
        .eq('status', 'CONTROVERSIAL');

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

async function getALLS() {
    const { data, error } = await supabase
        .from('Squeal')
        .select('*, Users(username)')

    if (error) {
        console.error(error);
        return [];
    }
    return data;
}

async function getWORST10() {
    const { data, error } = await supabase
        .from('Squeal')
        .select('*, Users(username)')
        .order('cringe', { ascending: false })
        .limit(10);

    if (error) {
        console.error(error);
        return [];
    }
    return data;
}

async function getTOP10() {
    const { data, error } = await supabase
        .from('Squeal')
        .select('*, Users(username)')
        .order('cool', { ascending: false })
        .limit(10);

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}
async function getRANDOM() {
    const { data: allIds, error: idsError } = await supabase
        .from('Squeal')
        .select('id');
    if (idsError) {
        console.error('Errore durante il recupero degli ID:', idsError);
        return null;
    }
    const idArray = allIds.map(row => row.id);
    const randomIds = [];
    for (let i = 0; i < 10 && idArray.length; i++) {
        const randomIndex = Math.floor(Math.random() * idArray.length);
        randomIds.push(idArray[randomIndex]);
        idArray.splice(randomIndex, 1);
    }

    const { data: randomSqueals, error: squealsError } = await supabase
        .from('Squeal')
        .select('*, Users!Squeal_autore_fkey(username)')
        .in('id', randomIds);

    if (squealsError) {
        console.error('Errore durante il recupero dei Squeal:', squealsError);
        return null;
    }

    return randomSqueals;
}

function calculateUserPopularity(squeals) {
    const weights = {
        NORMAL: 1,
        POPULAR: 3,
        CONTROVERSIAL: -1,
        UNPOPULAR: -2
    };
    let score = 0;
    squeals.forEach(squeal => {
        if (squeal.status in weights) {
            score += weights[squeal.status];
        }
    });
    //le soglie per ciascuna categoria di popolarità
    const thresholds = {
        POPOLARE: 10,
        NORMALE: 0,
        CONTROVERSO: -5,
        NON_POPOLARE: -10
    };

    // Determino la popolarità in base al punteggio
    if (score >= thresholds.POPOLARE) {
        return 'POPOLARE';
    } else if (score >= thresholds.NORMALE) {
        return 'NORMALE';
    } else if (score >= thresholds.CONTROVERSO) {
        return 'CONTROVERSO';
    } else {
        return 'NON_POPOLARE';
    }
}


//canale dedicato al bot nasa
async function getNasa() {
    const day = 24 * 60 * 60 * 1000; // Millisecondi in un giorno
    const newestDate = new Date(await getDataNasa()); //data dello squeal nasa piu' recente
    const now = new Date(); //data di oggi

    if (now.getTime() - newestDate.getTime() > day) { //se sono trascorse almeno 24h carica una foto
        await fetchAndInsertNasaImg();
    }

    const { data, error } = await supabase
        .from('Squeal')
        .select('*, Users(username)')
        .eq('autore', 'e07c0fb4-606c-48b7-977a-59535556e3d4');

    if (error) {
        console.error(error);
        return [];
    }
    return data;
}

module.exports = {
    getSqueal,
    getChnID,

    getFriends,
    getFriendsByUsername,
    getIdbyUsername,
    getMessagesByMittente,
    getMessagesByDestinatario,
    inserisciMessaggio,
    getIdAlto,
    addCool,
    removeCool,
    addCringe,
    removeCringe,
    addView,
    getCool,
    getCringe,
    getUsernameById,
    getMenzionante,
    getIscrizioni,
    getNomeCanale,
    insertSqueal,
    insertSquealToCanale,
    getAllUsernames,
    insertMenzione,
    getIdIscritti,
    insertNotifica,
    getNotificante,
    getIdCanaleNotifiche,
    getIsPrivate,
    getIdSquealMenzioni,
    getSquealMenzioni,
    getQuotaCaratteri,
    updateQuota,
    getCONTROVERSIAL,
    getALLS,
    getWORST10,
    getTOP10,
    getRANDOM,
    updateAbbonato,
    getIsAbbonato,
    getNasa,
    calculateUserPopularity
};