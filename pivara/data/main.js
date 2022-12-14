let temperatura_trazena;
let temperatura_trenutna = 0;
let vrijeme_trenutno = 0;
let vrijeme_trazeno;

const API_URL = "http://192.168.1.1";

const state = {
    stanje_pivare: JSON.parse(localStorage.getItem('stanje_pivare')) || false,
    stanje_kuvanja: localStorage.getItem('stanje_kuvanja') || "false",
    pumpa_piva: JSON.parse(localStorage.getItem('pumpa_piva')) || false,
    pumpa_vode: JSON.parse(localStorage.getItem('pumpa_vode')) || false,
    grijac: JSON.parse(localStorage.getItem('grijac')) || false, 
    trazeno_vrijeme: JSON.parse(localStorage.getItem('trazeno_vrijeme')) || 0,
    trenutno_vrijeme: JSON.parse(localStorage.getItem('trenutno_vrijeme')) || 0,
    trazena_temperatura: JSON.parse(localStorage.getItem('trazena_temperatura')) || 0,
    trenutna_temperatura: JSON.parse(localStorage.getItem('trenutna_temperatura')) || 0
}

const setState = (key, value) => {
    state[key] = value
    localStorage.setItem(key, value)
}

//Function for polling of data from device to brewer
function poling_device_to_brewer(){
    var tmp_json = JSON.stringify({
        stanje_pivare: state.stanje_pivare,
        stanje_kuvanja: state.stanje_kuvanja,
        pumpa_piva: state.pumpa_piva,
        pumpa_vode: state.pumpa_vode,
        trazena_temperatura: state.trazena_temperatura,
        trazeno_vrijeme: state.trazeno_vrijeme,
        vrijeme_trenutno: vrijeme_trenutno
    });
    fetch(`${API_URL}/JSON`, {body: tmp_json, method: "POST"})
    .then((response) => response.json())
    .then((data) => {
        alert(JSON.stringify(data));
        setState("trenutna_temperatura", data.temperatura_trenutna);
        setState("trenutno_vrijeme", data.vrijeme_trenutno);
        setState("grijac", data.grijac);
        if(data.stanje_kuvanja){
            setState("stanje_kuvanja", "zavrseno");
        }
    })
    .catch((err) => console.log(err));

    upis_boje(state.grijac, "labela_grijac");
    upisati_vrijednost_u_labelu("labela_trenutno_vrijeme", state.trenutno_vrijeme);
    upisati_vrijednost_u_labelu("labela_trenutna_temperatura", state.trenutna_temperatura);
    state_light();
}


const loadApp = () => {
    state.stanje_kuvanja;
    state.pumpa_piva;
    state.pumpa_vode;
    state.stanje_pivare;
    state.trazena_temperatura;
    state.trazeno_vrijeme;
    state.trenutna_temperatura;
    state.trenutno_vrijeme;
    state.grijac;
    upisati_vrijednost_u_labelu('labela_trazena_temperatura', state.trazena_temperatura);
    upisati_vrijednost_u_labelu('labela_trazeno_vrijeme', state.trazeno_vrijeme);
    upisati_vrijednost_u_labelu('labela_trenutno_vrijeme', state.trenutno_vrijeme);
    upisati_vrijednost_u_labelu('labela_trenutna_temperatura', state.trenutna_temperatura);
    state_light();
}

loadApp();

var delay_in_microseconds = 1000; //1 sekund

setInterval(function(){
    poling_device_to_brewer();
}, delay_in_microseconds * 10); //Every X seconds, poling is done to check/sync brewer with device

function upisati_temp_vrijeme() {
    if(state.stanje_pivare){
        var tmp_prekid_rada = confirm("Da li ste sigurni da ??elite prekinuti trenutno kuvanje");
    }
    else{
        var tmp_prekid_rada = true;
    }
    if(tmp_prekid_rada){
        temperatura_trazena = document.getElementById("temperatura_trazena").value;
        var vrijeme_trazeno = document.getElementById("vrijeme_trazeno").value;
        if (vrijeme_trazeno == '' || vrijeme_trazeno == null || vrijeme_trazeno < 0) {
            vrijeme_trazeno = 0;
        }
        if (temperatura_trazena < 0 || temperatura_trazena == '') {
            temperatura_trazena = 0;
        }
        else if (temperatura_trazena > 100) {
            temperatura_trazena = 99;
        }
        setState("trazeno_vrijeme", vrijeme_trazeno);
        setState("trazena_temperatura", temperatura_trazena);        
        setState('stanje_pivare', false);
        setState("pumpa_piva", false);
        setState("pumpa_vode", false);
        setState("stanje_kuvanja", "false");

        upisati_vrijednost_u_labelu('labela_trazena_temperatura', state.trazena_temperatura);
        upisati_vrijednost_u_labelu('labela_trazeno_vrijeme', state.trazeno_vrijeme);
    }
    poling_device_to_brewer();
}

function upisati_vrijednost_u_labelu(tmp_id, vrijednost){
    document.getElementById(tmp_id).innerHTML = vrijednost;
}

function start() {
    if(!state.stanje_pivare){
        vrijeme_trenutno = 0;
        setState("stanje_pivare", true);
        setState("stanje_kuvanja", "kuvanje");
        temperatura_trazena = document.getElementById("temperatura_trazena").value = "";
        vrijeme_trazeno = document.getElementById("vrijeme_trazeno").value = "";
        poling_device_to_brewer();
    }
    else{
        alert('Proces je vec u toku');
    }
}

function stop() {
    if(!state.stanje_pivare || state.stanje_kuvanja == "zavrseno"){
        var tmp_stop = true;
    }
    else{
        var tmp_stop = confirm("Da li ste sigurni da ??elite prekinuti trenutno kuvanje");
    }
    if(tmp_stop){
        setState('stanje_pivare', false);
        setState('pumpa_piva',false);
        setState('pumpa_vode',false);
        setState('stanje_kuvanja', "false");
        temperatura_trazena = document.getElementById("temperatura_trazena").value = '';
        vrijeme_trazeno = document.getElementById("vrijeme_trazeno").value = '';
        poling_device_to_brewer();
    }
}

function prekidac_pumpa_piva() {
    if(state.stanje_pivare){
        setState('pumpa_piva',!state.pumpa_piva)
        poling_device_to_brewer();
    }
}

function prekidac_pumpa_vode() {
    if(state.stanje_pivare){
        setState('pumpa_vode',!state.pumpa_vode);
        poling_device_to_brewer();
    }
}

function state_light(){
    upis_boje(state.stanje_pivare, "indikator_rada");
    upis_boje(state.pumpa_piva, "labela_pumpa_piva");
    upis_boje(state.pumpa_vode, "labela_pumpa_vode");
    upis_boje(state.grijac, "labela_grijac");
    switch(state.stanje_kuvanja){
        case "false":
            document.getElementById("slika_brewera").style.filter = "drop-shadow(0 0 0.75rem #F00)";
            break;
        case "kuvanje":
            document.getElementById("slika_brewera").style.filter = "drop-shadow(0 0 0.75rem #ffae00)";
            break;
        default:
            document.getElementById("slika_brewera").style.filter = "drop-shadow(0 0 0.75rem #15ff00)";
    }
}

function upis_boje(state, id){
    if(state){
        background_boja_zelena(id);
    }
    else{
        background_boja_crvena(id);
    }
}

function background_boja_zelena(id){
    document.getElementById(id).style.backgroundColor = "#ABFF00";
    document.getElementById(id).style.boxShadow = "rgba(0, 0, 0, 0.2) 0 -1px 7px 1px, inset #304701 0 -1px 9px, #89FF00 0 2px 12px";
}
function background_boja_crvena(id){
    document.getElementById(id).style.backgroundColor = "#F00";
    document.getElementById(id).style.boxShadow = "rgba(0, 0, 0, 0.2) 0 -1px 7px 1px, inset #441313 0 -1px 9px, rgba(255, 0, 0, 0.5) 0 2px 12px";
}
function background_boja_zuta(id){
    document.getElementById(id).style.backgroundColor = "#ffae00";
    document.getElementById(id).style.boxShadow = "rgba(0, 0, 0, 0.2) 0 -1px 7px 1px, inset #441313 0 -1px 9px, rgba(255, 0, 0, 0.5) 0 2px 12px";
}