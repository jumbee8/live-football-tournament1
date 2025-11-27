// -------------------------
// ADATOK
// -------------------------
let db = JSON.parse(localStorage.getItem("tournamentDB") || `{
    "users": [],
    "loggedIn": null,
    "tournaments": []
}`);

function saveDB(){ localStorage.setItem("tournamentDB", JSON.stringify(db)); }

// -------------------------
// FELHASZNÁLÓKEZELÉS
// -------------------------
function registerUser(u,p){
    if(db.users.find(x=>x.user===u)) return "Felhasználó már létezik!";
    db.users.push({user:u,pass:p});
    saveDB();
    return "OK";
}
function loginUser(u,p){
    if(!db.users.find(x=>x.user===u && x.pass===p)) return "Hibás adatok!";
    db.loggedIn=u;
    saveDB();
    return "OK";
}
function logoutUser(){ db.loggedIn=null; saveDB(); }
function getLoggedInUser(){ return db.loggedIn; }

// -------------------------
// TORNAKEZELÉS
// -------------------------
function addTournament(name){
    if(!name) return alert("Adj meg nevet!");
    db.tournaments.push({
        id: Date.now(),
        name,
        teams: [],
        groups: {},
        matches: [],
        knockout: [],
        podium: []
    });
    saveDB();
    renderTournamentList();
}

function deleteTournament(id){
    db.tournaments = db.tournaments.filter(t=>t.id!==id);
    saveDB();
    renderTournamentList();
}

function renderTournamentList(){
    let out="";
    db.tournaments.forEach(t=>{
        out+=`<div>
            <b>${t.name}</b>
            <button onclick="selectTournament(${t.id})">Megnyitás</button>
            <button onclick="deleteTournament(${t.id})">❌</button>
        </div>`;
    });
    document.getElementById("tournamentList").innerHTML = out;
}

let activeTID = null;
function selectTournament(id){
    activeTID=id;
    renderTeamList();
    renderManualGroups();
    renderMatches();
}

// -------------------------
// CSAPATOK
// -------------------------
function addTeam(){
    if(!activeTID) return alert("Válassz tornát!");
    let team = document.getElementById("teamName").value.trim();
    if(!team) return;

    let t = db.tournaments.find(x=>x.id===activeTID);

    if(t.teams.includes(team))
        return alert("Ez a csapat már létezik!");

    t.teams.push(team);
    saveDB();
    renderTeamList();
}

function renderTeamList(){
    if(!activeTID) return;
    let t = db.tournaments.find(x=>x.id===activeTID);

    teamList.innerHTML = t.teams.map(x=>`<div>${x}</div>`).join("");
}

// -------------------------
// CSOPORTOK
// -------------------------
function createGroups(){
    if(!activeTID) return;
    let per = Number(teamPerGroup.value);
    let t = db.tournaments.find(x=>x.id===activeTID);

    if(per < 2) return alert("Legalább 2 csapat!");

    let shuffled=[...t.teams].sort(()=>Math.random()-0.5);
    let g={};
    let groupIndex=1;

    while(shuffled.length){
        g["Csoport "+groupIndex] = shuffled.splice(0,per);
        groupIndex++;
    }
    t.groups=g;

    generateGroupMatches();
    saveDB();
    renderManualGroups();
    renderMatches();
}

function manualGroupSetup(){
    if(!activeTID) return;

    let t = db.tournaments.find(x=>x.id===activeTID);
    if(!Object.keys(t.groups).length){
        t.groups={"Csoport 1":[]};
    }
    saveDB();
    renderManualGroups();
}

function renderManualGroups(){
    if(!activeTID) return;
    let t=db.tournaments.find(x=>x.id===activeTID);

    let out="";
    Object.keys(t.groups).forEach(g=>{
        out+=`<div class="groupBox">
            <b>${g}</b><br>
            ${t.groups[g].map(x=>`<div>${x}</div>`).join("")}
            <br><select id="sel_${g}">
                ${t.teams.map(x=>`<option>${x}</option>`).join("")}
            </select>
            <button onclick="addTeamToGroup('${g}')">➕</button>
        </div>`;
    });
    manualGroups.innerHTML=out;
}

function addTeamToGroup(g){
    let t=db.tournaments.find(x=>x.id===activeTID);
    let val=document.getElementById("sel_"+g).value;

    if(!t.groups[g].includes(val)){
        t.groups[g].push(val);
        saveDB();
        renderManualGroups();
        generateGroupMatches();
        renderMatches();
    } else alert("Már ebben a csoportban van!");
}

// -------------------------
// MÉRKŐZÉSEK
// -------------------------
function generateGroupMatches(){
    let t=db.tournaments.find(x=>x.id===activeTID);
    t.matches=[];

    for(let g in t.groups){
        let teams=t.groups[g];

        for(let i=0;i<teams.length;i++){
            for(let j=i+1;j<teams.length;j++){
                t.matches.push({
                    group:g,
                    home:teams[i],
                    away:teams[j],
                    homeScore:null,
                    awayScore:null
                });
            }
        }
    }

    saveDB();
}

function setScore(idx){
    let t=db.tournaments.find(x=>x.id===activeTID);
    let m=t.matches[idx];

    m.homeScore = Number(document.getElementById("h"+idx).value);
    m.awayScore = Number(document.getElementById("a"+idx).value);

    saveDB();
}

function renderMatches(){
    if(!activeTID) return;
    let t=db.tournaments.find(x=>x.id===activeTID);

    let out="";
    t.matches.forEach((m,i)=>{
        out+=`<div class="matchBox">
            <b>${m.group}</b> — ${m.home} vs ${m.away}<br>
            <input id="h${i}" type="number" value="${m.homeScore ?? ""}" onchange="setScore(${i})">
            -
            <input id="a${i}" type="number" value="${m.awayScore ?? ""}" onchange="setScore(${i})">
        </div>`;
    });

    matchList.innerHTML=out;
}

// -------------------------
// KIESÉSES SZAKASZ + DOBOGÓ
// -------------------------
function generateKnockouts(){
    let t=db.tournaments.find(x=>x.id===activeTID);
    let adv=Number(advanceCount.value);
    if(!adv) return alert("Írd be mennyi továbbjutó!");

    let qualified=[];

    for(let g in t.groups){
        let teams=t.groups[g];
        let scores={};

        teams.forEach(tm=>scores[tm]=0);

        t.matches.filter(m=>m.group===g).forEach(m=>{
            if(m.homeScore!=null && m.awayScore!=null){
                if(m.homeScore>m.awayScore) scores[m.home]+=3;
                else if(m.homeScore<m.awayScore) scores[m.away]+=3;
                else { scores[m.home]++; scores[m.away]++; }
            }
        });

        let sorted = Object.keys(scores).sort((a,b)=>scores[b]-scores[a]);
        qualified.push(...sorted.slice(0,adv));
    }

    // párosítás
    t.knockout=[];
    while(qualified.length>=2){
        let a=qualified.shift();
        let b=qualified.pop();
        t.knockout.push({home:a,away:b,homeScore:null,awayScore:null});
    }

    saveDB();
    renderKnockout();
}

function renderKnockout(){
    let t=db.tournaments.find(x=>x.id===activeTID);
    knockoutDisplay.innerHTML = t.knockout.map((m,i)=>`
        <div class="matchBox">
            ${m.home} vs ${m.away}<br>
            <input id="kh${i}" type="number" value="${m.homeScore ?? ""}">
            -
            <input id="ka${i}" type="number" value="${m.awayScore ?? ""}">
        </div>
    `).join("");
}

// -------------------------
// VÉGEREDMÉNY / DOBOGÓ
// -------------------------
function computePodium(){
    let t=db.tournaments.find(x=>x.id===activeTID);

    if(t.knockout.length < 1) return;

    let f = t.knockout[t.knockout.length-1];
    let champ = f.homeScore > f.awayScore ? f.home : f.away;
    let second = champ===f.home ? f.away : f.home;

    t.podium=[champ,second,"3. hely – nincs kisorsolva"];
    saveDB();

    finalPodium.innerHTML = `
        🥇 ${t.podium[0]}<br>
        🥈 ${t.podium[1]}<br>
        🥉 ${t.podium[2]}
    `;
}
