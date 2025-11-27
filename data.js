let DB={tournaments:[]};
function loadDB(){let raw=localStorage.getItem("torna_db"); if(raw){try{DB=JSON.parse(raw);}catch(e){DB={tournaments:[]};}} DB.tournaments=DB.tournaments||[];}
function saveDB(){localStorage.setItem("torna_db",JSON.stringify(DB));}
loadDB();
let currentTournamentIndex=null;

function addTournament(name){
    if(!name) return alert("Adj nevet a tornának!");
    DB.tournaments.push({name,teams:[],groups:[],matches:[],knockouts:[],podium:[]}); 
    saveDB(); renderTournamentList();
}

function deleteTournament(index){
    if(!confirm("Biztosan törlöd a tornát?")) return; 
    DB.tournaments.splice(index,1); 
    if(currentTournamentIndex===index) currentTournamentIndex=null; 
    saveDB(); renderTournamentList();
}

function selectTournament(i){
    currentTournamentIndex=i; 
    alert("Torna kiválasztva: "+DB.tournaments[i].name); 
    fillMatchList();
}

function addTeam(){
    if(currentTournamentIndex===null) return alert("Válassz tornát!"); 
    let name=document.getElementById("teamName").value; 
    if(!name) return alert("Adj csapatnevet!"); 
    let t=DB.tournaments[currentTournamentIndex]; 
    if(t.teams.includes(name)) return alert("Ez a csapat már fel van véve!"); 
    t.teams.push(name); 
    saveDB(); renderTournamentList();
}

// Placeholder: automatikus csoport, kézi csoport, mérkőzések, kieséses szakasz logika
function createGroups(){alert("Csoport generálás – működő logika később bővíthető.");}
function manualGroupSetup(){alert("Kézi csoportalkotás placeholder.");}
function fillMatchList(){alert("Mérkőzéslista megjelenítés placeholder.");}
function renderTournamentList(){alert("Tornalistázás placeholder.");}
function renderTournamentsForIndex(){alert("Nézői megjelenítés placeholder.");}
function generateKnockouts(){alert("Kieséses szakasz generálás placeholder.");}
