/// ===== LOGIN ADATOK =====
function load(key){ return JSON.parse(localStorage.getItem(key) || "[]"); }
function save(key,data){ localStorage.setItem(key, JSON.stringify(data)); }

function registerUser(u,p){
    let users = load("users");
    if(users.find(x=>x.user===u)) return "A felhasználó létezik!";
    users.push({user:u,pass:p});
    save("users", users);
    return "OK";
}
function loginUser(u,p){
    let users = load("users");
    if(users.find(x=>x.user===u && x.pass===p)){
        localStorage.setItem("loggedIn", u);
        return "OK";
    }
    return "Hibás adatok!";
}
function logoutUser(){ localStorage.removeItem("loggedIn"); }
function getLoggedInUser(){ return localStorage.getItem("loggedIn"); }

// ===== FŐ ADATOK =====
// tournament = { name:"...", teams:[], groups:[], matches:[], knockout:[] }

function getData(){
    let u = getLoggedInUser();
    if(!u) return null;
    let data = load("tournaments_"+u);
    return data.length ? data : [];
}
function saveData(arr){
    let u = getLoggedInUser();
    save("tournaments_"+u, arr);
}

// ===== TORNÁK =====
function addTournament(name){
    if(!name) return alert("Adj meg nevet!");
    let d = getData();
    d.push({name, teams:[], groups:[], matches:[], knockout:[]});
    saveData(d);
    renderTournamentList();
}
function renderTournamentList(){
    let d=getData();
    let box=document.getElementById("tournamentList");
    box.innerHTML="";
    d.forEach((t,i)=>{
        let b=document.createElement("button");
        b.textContent=t.name;
        b.onclick=()=>{localStorage.setItem("currentTournament",i); renderTeamList(); renderMatches();};
        box.appendChild(b);
    });
}
function getCurrent(){
    let d=getData();
    let i=localStorage.getItem("currentTournament");
    return d[i] || null;
}
function saveCurrent(t){
    let d=getData();
    let i=localStorage.getItem("currentTournament");
    d[i]=t;
    saveData(d);
}

// ===== CSAPATOK =====
function renderTeamList(){
    let t=getCurrent(); if(!t) return;
    let box=document.getElementById("teamList");
    box.innerHTML="<h3>Csapatok:</h3>";
    t.teams.forEach(c=>box.innerHTML+=c+"<br>");
}
function addTeam(){
    let t=getCurrent(); if(!t) return;
    let name=document.getElementById("teamName").value.trim();
    if(!name) return alert("Adj meg csapatnevet!");
    if(t.teams.includes(name)) return alert("Már létezik ez a csapat!");

    t.teams.push(name);
    saveCurrent(t);
    renderTeamList();
}

// ===== AUTOMATIKUS CSOPORTOK =====
function createGroups(){
    let t=getCurrent(); if(!t) return;
    let size=parseInt(document.getElementById("teamPerGroup").value);
    if(!size || size<2) return alert("Hibás érték!");

    t.groups=[];
    let temp=[...t.teams];

    while(temp.length){
        t.groups.push(temp.splice(0,size));
    }
    saveCurrent(t);
    alert("Csoportok létrehozva!");
}

// ===== KÉZI CSOPORTBEOSZTÁS =====
function manualGroupSetup(){
    let t=getCurrent(); if(!t) return;
    let box=document.getElementById("manualGroups");
    box.innerHTML="<h3>Kézi szerkesztés</h3>";

    t.groups = t.groups.length ? t.groups : [[]];

    t.groups.forEach((g,gi)=>{
        let div=document.createElement("div");
        div.className="group-box";
        div.innerHTML="<b>"+(gi+1)+". csoport</b><br>";

        g.forEach(team=>{
            div.innerHTML+=team+"<br>";
        });

        // új csapat hozzáadása kézzel
        let sel=document.createElement("select");
        sel.id="groupAdd_"+gi;

        let opt=document.createElement("option");
        opt.value=""; opt.textContent="Válassz csapatot";
        sel.appendChild(opt);

        t.teams.forEach(team=>{
            if(!g.includes(team)){
                let o=document.createElement("option");
                o.value=team; o.textContent=team;
                sel.appendChild(o);
            }
        });

        let btn=document.createElement("button");
        btn.textContent="Hozzáadás";
        btn.onclick=function(){
            let team=document.getElementById("groupAdd_"+gi).value;
            if(team){
                g.push(team);
                saveCurrent(t);
                manualGroupSetup();
            }
        };

        div.appendChild(sel);
        div.appendChild(btn);

        box.appendChild(div);
    });
}

// ===== MÉRKŐZÉSEK LISTÁJA =====
function renderMatches(){
    let t=getCurrent(); if(!t) return;
    let box=document.getElementById("matchList");
    box.innerHTML="";

    if(!t.groups.length) return;

    t.matches = []; // mindig újrageneráljuk

    t.groups.forEach((g,gi)=>{
        box.innerHTML+="<h3>"+(gi+1)+". csoport</h3>";

        for(let i=0;i<g.length;i++){
            for(let j=i+1;j<g.length;j++){
                let m={a:g[i], b:g[j], score:null};
                t.matches.push(m);

                box.innerHTML+=g[i]+" vs "+g[j]+
                    ` <input data-a="${g[i]}" data-b="${g[j]}" size="1" class="scA"> : 
                      <input data-a="${g[i]}" data-b="${g[j]}" size="1" class="scB"><br>`;
            }
        }
    });

    saveCurrent(t);
}

// ===== KIESÉSES SZAKASZ =====
function generateKnockouts(){
    let t=getCurrent(); if(!t) return;
    let n=parseInt(document.getElementById("advanceCount").value);
    if(!n) return alert("Adj meg számot!");

    // egyszerű dobogó generálás helykitöltő mód
    t.knockout = ["Elődöntő 1","Elődöntő 2","Döntő","Bronzmeccs"];

    saveCurrent(t);

    document.getElementById("knockoutDisplay").innerHTML =
        "<h3>Kieséses szakasz generálva</h3>";
}
