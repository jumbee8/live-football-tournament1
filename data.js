// --- Inicializálás ---
let DB = { tournaments: [] };
let currentTournamentIndex = null;

function loadDB() {
    let raw = localStorage.getItem("torna_db");
    if (raw) {
        try { DB = JSON.parse(raw); } 
        catch(e) { DB = { tournaments: [] }; }
    }
    DB.tournaments = DB.tournaments || [];
}
function saveDB() { localStorage.setItem("torna_db", JSON.stringify(DB)); }
loadDB();

// --- Tornák kezelése ---
function addTournament(name){
    if(!name) return alert("Adj nevet a tornának!");
    DB.tournaments.push({name, teams:[], groups:[], matches:[], knockouts:[], podium:[]}); 
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
    fillMatchList(); 
    renderTournamentList();
}

// --- Csapatok ---
function addTeam(){
    if(currentTournamentIndex===null) return alert("Válassz tornát!");
    let name=document.getElementById("teamName").value;
    if(!name) return alert("Adj csapatnevet!");
    let t = DB.tournaments[currentTournamentIndex];
    if(t.teams.includes(name)) return alert("Ez a csapat már fel van véve!");
    t.teams.push(name); 
    saveDB(); renderTournamentList();
}

// --- Csoportok ---
function createGroups(){
    if(currentTournamentIndex===null) return alert("Válassz tornát!");
    let per=parseInt(document.getElementById("teamPerGroup").value);
    if(!per || per<1) return alert("Adj meg csapatszámot!");
    let t = DB.tournaments[currentTournamentIndex];
    t.groups=[];
    t.matches=[];
    let teamsCopy = [...t.teams];
    
    while(teamsCopy.length){
        t.groups.push(teamsCopy.splice(0, per));
    }

    // Minden csoport mérkőzései
    t.groups.forEach(g=>{
        for(let i=0;i<g.length;i++){
            for(let j=i+1;j<g.length;j++){
                t.matches.push({teamA:g[i], teamB:g[j], scoreA:"", scoreB:""});
            }
        }
    });
    saveDB(); fillMatchList(); renderTournamentList();
}

function manualGroupSetup(){
    alert("Kézi csoportalkotás mostantól implementálható drag/drop vagy select alapján.");
}

// --- Mérkőzések ---
function fillMatchList(){
    if(currentTournamentIndex===null) return;
    let t = DB.tournaments[currentTournamentIndex];
    let div=document.getElementById("matchList");
    if(!div) return;
    div.innerHTML="";
    t.matches.forEach((m,i)=>{
        div.innerHTML+=`
            <div>
            ${m.teamA} <input placeholder='Hazai' value='${m.scoreA||""}' onchange='saveMatchResult(${i}, this.value, null)'> : 
            <input placeholder='Vendég' value='${m.scoreB||""}' onchange='saveMatchResult(${i}, null, this.value)'> ${m.teamB}
            </div>`;
    });
}

function saveMatchResult(idx,a,b){
    if(currentTournamentIndex===null) return;
    let t = DB.tournaments[currentTournamentIndex];
    if(a!==null) t.matches[idx].scoreA=a;
    if(b!==null) t.matches[idx].scoreB=b;
    saveDB();
}

// --- Továbblépés, kiesés ---
function generateKnockouts(){
    if(currentTournamentIndex===null) return alert("Válassz tornát!");
    let count=parseInt(document.getElementById("advanceCount").value);
    if(!count || count<1) return alert("Adj meg hány csapat jusson tovább!");
    let t=DB.tournaments[currentTournamentIndex];

    // Csak csoportonkénti továbbjutás
    t.knockouts=[];
    t.groups.forEach(g=>{
        // Rangsor: a legtöbb győzelem/scoreA>scoreB
        let scores = g.map(team=>{
            let won = t.matches.filter(m=>
                ((m.teamA==team && parseInt(m.scoreA||0)>parseInt(m.scoreB||0))||
                 (m.teamB==team && parseInt(m.scoreB||0)>parseInt(m.scoreA||0)))
            ).length;
            return {team, won};
        });
        scores.sort((a,b)=>b.won-a.won);
        t.knockouts.push(...scores.slice(0,count).map(x=>x.team));
    });
    alert("Kieséses szakasz előkészítve: "+t.knockouts.join(", "));
    saveDB();
}

// --- Nézői oldal ---
function renderTournamentList(){
    let div=document.getElementById("tournamentList");
    if(!div) return;
    div.innerHTML="";
    DB.tournaments.forEach((t,i)=>{
        let d=document.createElement("div");
        d.innerHTML=`<b>${t.name}</b>
        <button onclick="selectTournament(${i})">Megnyitás</button>
        <button onclick="deleteTournament(${i})">Törlés</button>
        <div>Csapatok: ${t.teams.join(", ")}</div>`;
        div.appendChild(d);
    });
}

function renderTournamentsForIndex(){
    let box=document.getElementById("tournamentDisplay");
    if(!box) return;
    box.innerHTML="";
    DB.tournaments.forEach(t=>{
        let div=document.createElement("div");
        div.innerHTML=`<h2>${t.name}</h2>`;
        t.groups.forEach((g,gi)=>{ div.innerHTML+=`<h3>${gi+1}. csoport</h3>${g.join("<br>")}`; });
        div.innerHTML+="<h3>Mérkőzések</h3>";
        t.matches.forEach(m=>{
            div.innerHTML+=`<div>${m.teamA} ${m.scoreA||"-"} : ${m.scoreB||"-"} ${m.teamB}</div>`;
        });
        box.appendChild(div);
    });
}
