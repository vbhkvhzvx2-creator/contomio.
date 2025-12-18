let db = JSON.parse(localStorage.getItem('conto_v4')) || [];
let inputPin = "";
const correctPin = "0007"; // IL TUO PIN
let privacy = true;

// --- TASTIERINO ---
const keypad = document.getElementById('keypad');
// Layout tastierino iOS
[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'DEL'].forEach(v => {
    const btn = document.createElement('button');
    btn.className = 'key';
    if (v === '') {
        btn.style.background = 'transparent';
    } else {
        btn.innerText = v;
        btn.onclick = () => handlePin(v);
    }
    keypad.appendChild(btn);
});

function handlePin(v) {
    if (v === 'DEL') {
        inputPin = inputPin.slice(0, -1);
    } else if (inputPin.length < 4) {
        inputPin += v;
    }
    
    // Aggiorna i puntini orizzontali
    const dots = document.querySelectorAll('.dot');
    dots.forEach((d, i) => d.classList.toggle('filled', i < inputPin.length));

    // Controllo PIN
    if (inputPin === correctPin) {
        document.getElementById('pin-screen').style.transform = "translateY(-100%)";
    } else if (inputPin.length === 4) {
        // Feedback errore (opzionale: vibrazione o reset)
        inputPin = "";
        setTimeout(() => {
            dots.forEach(d => d.classList.remove('filled'));
        }, 250);
    }
}

// ... Resto del codice per navigazione e dati (uguale a prima)


// --- NAVIGAZIONE ---
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('overlay');
    const isOpen = sb.classList.toggle('open');
    ov.style.display = isOpen ? 'block' : 'none';
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    toggleSidebar();
    updateUI();
}

function toggleTheme() {
    const body = document.body;
    body.setAttribute('data-theme', body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

// --- LOGICA DATI ---
function saveItem(type) {
    const desc = document.getElementById('add-desc').value;
    const amount = parseFloat(document.getElementById('add-amount').value);
    const date = document.getElementById('add-date').value || new Date().toISOString().split('T')[0];

    if (!desc || isNaN(amount)) return alert("Dati mancanti");

    db.push({ id: Date.now(), desc, amount, type, date });
    localStorage.setItem('conto_v4', JSON.stringify(db));
    
    document.getElementById('add-desc').value = "";
    document.getElementById('add-amount').value = "";
    updateUI();
}

function deleteItem(id) {
    if (confirm("Eliminare?")) {
        db = db.filter(i => i.id !== id);
        localStorage.setItem('conto_v4', JSON.stringify(db));
        updateUI();
    }
}

function updateUI() {
    const qMov = document.getElementById('search-mov').value.toLowerCase();
    const qHist = document.getElementById('search-hist').value.toLowerCase();
    const listMov = document.getElementById('list-mov');
    const listHist = document.getElementById('list-hist');
    const listNotif = document.getElementById('list-notif');

    listMov.innerHTML = ''; listHist.innerHTML = ''; listNotif.innerHTML = '';
    let inc = 0, exp = 0, notifCount = 0;

    // Ordinamento cronologico inverso
    db.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(item => {
        if (item.type === 'income') inc += item.amount; else exp += item.amount;

        const row = `<div class="nav-link" style="display:flex; justify-content:space-between">
            <div><b>${item.desc}</b><br><small>${item.date}</small></div>
            <div style="color:${item.type==='income'?'var(--in)':'var(--out)'}">
                ${item.type==='income'?'+':'-'}${item.amount.toFixed(2)}€
                <button onclick="deleteItem(${item.id})" style="background:none; border:none; color:gray; margin-left:10px">✕</button>
            </div>
        </div>`;

        if (item.desc.toLowerCase().includes(qMov)) listMov.innerHTML += row;
        if (item.desc.toLowerCase().includes(qHist)) listHist.innerHTML += row;

        // Logica Notifiche (se la data è oggi)
        if (item.date === new Date().toISOString().split('T')[0]) {
            listNotif.innerHTML += `<div class="nav-link">⚠️ Oggi scadenza: ${item.desc}</div>`;
            notifCount++;
        }
    });

    document.getElementById('main-balance').innerText = privacy ? "€ •••••" : (inc - exp).toFixed(2) + " €";
    document.getElementById('stat-in').innerText = inc.toFixed(2) + " €";
    document.getElementById('stat-out').innerText = exp.toFixed(2) + " €";
    document.getElementById('notif-count').innerText = notifCount;
}

function togglePrivacy() { privacy = !privacy; updateUI(); }

updateUI();
