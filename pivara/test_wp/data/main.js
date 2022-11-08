let temperatura_trazena;
let vrijeme_trazeno;
let vrijeme_trenutno = 0;
var message;

const state = {
    pumpa_piva: JSON.parse(localStorage.getItem('pumpa_piva')) || false,
    pumpa_vode: JSON.parse(localStorage.getItem('pumpa_vode')) || false, 
    stanje_pivare: JSON.parse(localStorage.getItem('stanje_pivare')) || false,
    stanje_kuvanja: localStorage.getItem('stanje_kuvanja') || 'false',
    trazeno_vrijeme: JSON.parse(localStorage.getItem('trazeno_vrijeme')) || 0,
    trazena_temperatura: localStorage.getItem('trazena_temperatura') || 0 
}

const setState = (key, value) => {
    state[key] = value
    localStorage.setItem(key, value)
}

const loadApp = () => {
    state.stanje_kuvanja;
    state.pumpa_piva;
    state.pumpa_vode;
    state.stanje_pivare;
    state.trazena_temperatura;
    state.trazeno_vrijeme;
    upis_boje(state.pumpa_piva, "labela_pumpa_piva");
    upis_boje(state.pumpa_vode, "labela_pumpa_vode");
    upis_boje(state.stanje_pivare, "indikator_rada");
    upisati_vrijednost_u_labelu('labela_trazena_temperatura', state.trazena_temperatura);
    upisati_vrijednost_u_labelu('labela_trazeno_vrijeme', state.trazeno_vrijeme);
    if(state.stanje_pivare == true){
        document.getElementById('slika_brewera').style.filter = "drop-shadow(0 0 0.75rem #15ff00)";
    }    
    else if(state.stanje_pivare == false){
        document.getElementById('slika_brewera').style.filter = "drop-shadow(0 0 0.75rem #F00)";       
    }
}

loadApp();

var delay_in_microseconds = 1000; //1 sekund
///INTERUPT KOJI NAKON ODREDJENOG VREMENA PALI FUNKCIJU
setInterval(function(){
    if(state.stanje_pivare){ //Kad pivara radi provjerava dalje da li je kuvanje zavrseno ili nije
        if(state.stanje_kuvanja === 'kuvanje'){ //Provjerava stanje kuvanja
            document.getElementById('labela_trenutno_vrijeme').innerHTML = vrijeme_trenutno;
            if(parseInt(vrijeme_trenutno) >= parseInt(state.trazeno_vrijeme)){
                document.getElementById('slika_brewera').style.filter = "drop-shadow(0 0 0.75rem #15ff00)";
                setState('stanje_kuvanja', 'zavrseno');
                
                //FUNKCIJA DA POŠALJE MIKROKONTROLERU DA JE KRAJ KUVANJA
                
            }
            vrijeme_trenutno += 1;
        }
    }
}, delay_in_microseconds * 60); //Svakog (sekunda * X) opali funkciju 

setInterval(function(){
    //POLING ZA ČITANJE STANJA GRIJAČA
    //POLING ZA ČITANJE TRENUTNE TEMPERATURE
}, delay_in_microseconds * 15); //Polling za senzore, grijace itd itd - interakcija sa esp32-kom 


function send_data_to_esp32(){
    //POSLATI STANJE PUMPE PIVA
    //POSLATI STANJE PUMPE VODE
    //POSLATI TEMPERATURU
}

/*
    NAPRAVITI SA STRANE DUGMAD ZA:
        -PROKLJUCAVANJE VODE
        -WIRPOL EFEKAT
        -KLJUCANJE SA HMELJOM
*/

function upisati_temp_vrijeme() {
    if(state.stanje_pivare){
        var tmp_prekid_rada = confirm("Da li ste sigurni da želite prekinuti trenutno kuvanje");
    }
    else{
        var tmp_prekid_rada = true;
    }
        
    if(tmp_prekid_rada){
        temperatura_trazena = document.getElementById("temperatura_trazena").value;
        vrijeme_trazeno = document.getElementById("vrijeme_trazeno").value;
        if (vrijeme_trazeno == '' || vrijeme_trazeno == null || vrijeme_trazeno < 0) {
            vrijeme_trazeno = 0;
        }
        if (temperatura_trazena < 0 || temperatura_trazena == '') {
            temperatura_trazena = 0;
        }
        else if (temperatura_trazena > 100) {
            temperatura_trazena = 99;
        }
        setState('trazeno_vrijeme', vrijeme_trazeno);
        setState('trazena_temperatura', temperatura_trazena);        
        upisati_vrijednost_u_labelu('labela_trazena_temperatura', state.trazena_temperatura);
        upisati_vrijednost_u_labelu('labela_trazeno_vrijeme', state.trazeno_vrijeme);

        background_boja_crvena("indikator_rada");
        setState('stanje_pivare', false);
        document.getElementById('slika_brewera').style.filter = "none";
        setState('stanje_kuvanja', 'false');
        background_boja_zuta("indikator_rada");
    }
}
function upisati_vrijednost_u_labelu(tmp_id, vrijednost){
    document.getElementById(tmp_id).innerHTML = vrijednost;
}
function start() {
    if(!state.stanje_pivare){
        vrijeme_trenutno = 0;
        background_boja_zelena("indikator_rada");
        setState('stanje_pivare', true);
        setState('stanje_kuvanja', "kuvanje");
        temperatura_trazena = document.getElementById("temperatura_trazena").value = '';
        vrijeme_trazeno = document.getElementById("vrijeme_trazeno").value = '';
        document.getElementById('slika_brewera').style.filter = "drop-shadow(0 0 0.75rem #ffae00)";
    
        //FUNKCIJA DA POŠALJE MIKROKONTROLERU DA ZAPOČNE KUVANJE
    }
    else{
        alert('Proces je vec u toku');
    }
}

function stop() {
    if(!state.stanje_pivare || state.stanje_kuvanja == 'zavrseno'){
        var tmp_stop = true;
    }
    else{
        var tmp_stop = confirm("Da li ste sigurni da želite prekinuti trenutno kuvanje");
    }
    if(tmp_stop){
        setState('stanje_pivare', false);
        setState('pumpa_piva',false)
        setState('pumpa_vode',false)
        setState('stanje_kuvanja', 'false');
        background_boja_crvena("indikator_rada");
        upis_boje(state.pumpa_vode, "labela_pumpa_piva");
        upis_boje(state.pumpa_vode, "labela_pumpa_vode");
        temperatura_trazena = document.getElementById("temperatura_trazena").value = '';
        vrijeme_trazeno = document.getElementById("vrijeme_trazeno").value = '';
        document.getElementById('slika_brewera').style.filter = "drop-shadow(0 0 0.75rem #F00)";

        //FUNKCIJA DA POŠALJE MIKROKONTROLERU DA ZAVRŠI KUVANJE

    }
}

function prekidac_pumpa_piva() {
    if(state.stanje_pivare){
        var xhttp = new XMLHttpRequest();
        setState('pumpa_piva',!state.pumpa_piva)
        upis_boje(state.pumpa_piva,"labela_pumpa_piva");
        xhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == "200"){
                message = this.responseText;
            }
        }
        xhttp.open("PUT", "PREKIDAC_PUMPA_PIVO", false);
        xhttp.send();
    }
}
function prekidac_pumpa_vode() {
    if(state.stanje_pivare){
        var xhttp = new XMLHttpRequest();
        setState('pumpa_vode',!state.pumpa_vode);
        upis_boje(state.pumpa_vode, "labela_pumpa_vode");
        xhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == "200"){
                message = this.responseText;
            }
        }
        xhttp.open("PUT", "PREKIDAC_PUMPA_VODA", false);
        xhttp.send();
    }

    //location.href = '/PUMPA_VODE';
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