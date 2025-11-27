let USER_DB_KEY = "torna_users";
let LOGIN_KEY = "torna_loggedin";

function loadUsers() { let raw = localStorage.getItem(USER_DB_KEY); return raw ? JSON.parse(raw) : {}; }
function saveUsers(u){ localStorage.setItem(USER_DB_KEY, JSON.stringify(u)); }
function registerUser(username,password){ 
    let users = loadUsers(); 
    if(!username || !password) return "Üres mező!"; 
    if(users[username]) return "A felhasználó már létezik!"; 
    users[username] = {password:password}; 
    saveUsers(users); 
    return "OK";
}
function loginUser(username,password){ 
    let users = loadUsers(); 
    if(!users[username]) return "Nincs ilyen felhasználó!"; 
    if(users[username].password!==password) return "Hibás jelszó!"; 
    localStorage.setItem(LOGIN_KEY,username); 
    return "OK";
}
function logoutUser(){ localStorage.removeItem(LOGIN_KEY);}
function getLoggedInUser(){ return localStorage.getItem(LOGIN_KEY);}
