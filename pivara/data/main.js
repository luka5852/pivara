let json_vrijeme_temp;

let temperatura_trazena;
let vrijeme_trazeno;


const state = {
    pumpa_piva: JSON.parse(localStorage.getItem('pumpa_piva')) || false,
    pumpa_vode: JSON.parse(localStorage.getItem('pumpa_vode')) || false, 
    stanje_pivare: JSON.parse(localStorage.getItem('stanje_pivare')) || false
}

const setState = (key, value) => {
    state[key] = value
    localStorage.setItem(key, value)
}

const loadApp = () => {
    upis_boje(state.pumpa_piva, "labela_pumpa_piva");
    upis_boje(state.pumpa_vode, "labela_pumpa_vode");
    upis_boje(state.stanje_pivare, "indikator_rada");
}

loadApp();

function upisati_temp_vrijeme() {
    temperatura_trazena = document.getElementById("temperatura_trazena").value;
    vrijeme_trazeno = document.getElementById("vrijeme_trazeno").value;
    if (vrijeme_trazeno == '' || vrijeme_trazeno == null) {
        vrijeme_trazeno = 0;
        localStorage.setItem('vrijeme_trazeno', 0)
    }
    if (temperatura_trazena < 0) {
        temperatura_trazena = 0;
    }
    else if (temperatura_trazena > 100) {
        temperatura_trazena = 99;
    }
    json_vrijeme_temp = JSON.stringify({
        temperatura_trazena: temperatura_trazena,
        vrijeme_trazeno: vrijeme_trazeno
    });

    localStorage.setItem('temperatura_trazena', temperatura_trazena)
    localStorage.setItem('vrijeme_trazeno', vrijeme_trazeno)


    window.alert(json_vrijeme_temp);
}
function start() {
    background_boja_zelena("indikator_rada");
    setState('stanje_pivare', true);
}
function stop() {
    setState('stanje_pivare', false);
    background_boja_crvena("indikator_rada");
}

function prekidac_pumpa_piva() {
    setState('pumpa_piva',!state.pumpa_piva)
    upis_boje(state.pumpa_piva,"labela_pumpa_piva");
    location.href = '/PUMPA_PIVA';
}
function prekidac_pumpa_vode() {
    setState('pumpa_vode',!state.pumpa_vode)
    upis_boje(state.pumpa_vode, "labela_pumpa_vode");
    location.href = '/PUMPA_VODE';
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