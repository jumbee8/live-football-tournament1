// -------------------------
// ADATOK
// -------------------------
let db = JSON.parse(localStorage.getItem("tournamentDB")||`{
"users":[], "loggedIn":null, "tournaments":[]
}`);
function saveDB(){ localStorage.setItem("tournamentDB",JSON.stringify(db)); }

let activeTID=null;

// --- FELHASZNÁLÓ
function registerUser(u,p){
    if(db.users.find(x=>x.user===u)) return "Felhasználó már létezik!";
    db.users.push({user:u,pass:p});
    saveDB(); return "OK";
}
function loginUser(u,p){
    if(!db.users.find(x=>x.user===u && x.pass===p)) return "Hibás adatok!";
    db.loggedIn=u; saveDB(); return "OK";
}
function logoutUser(){ db.loggedIn=null; saveDB(); }
function getLoggedInUser(){ return db.loggedIn; }

// --- TORNA
function addTournament(name){
    if(!name) return alert("Adj meg nevet!");
    let t={id:Date.now(),name,teams:[],groups:{},matches:[],knockout:[],podium:[]};
    db.tournaments.push(t); saveDB(); renderTournamentList();
}
function renderTournamentList(){
    let out=""; db.tournaments.forEach(t=>{
        out+=`<div><b>${t.name}</b>
        <button onclick="selectTournament(${t.id})">Megnyitás</button>
        <button onclick="deleteTournament(${t.id})">❌</button></div>`;
    }); document.getElementById("tournamentList").innerHTML=out;
}
function selectTournament(id){ activeTID=id; renderTeamList(); renderManualGroups(); renderMatches(); }
function deleteTournament(id){ db.tournaments=db.tournaments.filter(x=>x.id!==id); saveDB(); renderTournamentList(); activeTID=null; }
