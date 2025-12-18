let db = JSON.parse(localStorage.getItem('conto_v6_db')) || [];
let inputPin = "";
const targetPin = "0007";
let privacy = true;

// 1. GESTIONE PIN
const keypad = document.getElementById('keypad');
[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'DEL'].forEach(v => {
    const btn = document.createElement('button');
    btn.className = 'key';
    if (v !== '') {
        btn.innerText = v;
        btn.onclick = () => {
            if (v === 'DEL') inputPin = inputPin.slice(0, -1);
            else if (inputPin.length < 4) inputPin += v;
            
            document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('filled', i < inputPin.length));
            
            if (inputPin === targetPin) {
                document.getElementById('pin-screen').style.transform = "translateY(-100%)";
            } else if (inputPin.length === 4) {
                inputPin = "";
                setTimeout(() => document.querySelectorAll('.dot').forEach(d => d.classList.remove('filled')), 300);
            }
        };
    } else { btn.style.visibility = "hidden"; }
    keypad.appendChild(btn);
});

// 2. NAVIGAZIONE E TEMA
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebar-overlay');
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
    const b = document.body;
    const current = b.getAttribute('data-theme');
    b.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
}

// 3. LOGICA DATI
function saveData(type) {
    const desc = document.getElementById('add-desc').value;
    const amount = parseFloat(document.getElementById('add-amount').value);
    const date = document.getElementById('add-date').value;

    if (!desc || isNaN(amount)) return alert("Inserisci descrizione e importo");

    db.push({
        id: Date.now(),
        desc,
        amount,
        type,
        date: date || new Date().toISOString().split('T')[0]
    });

    localStorage.setItem('conto_v6_db', JSON.stringify(db));
    document.getElementById('add-desc').value = "";
    document.getElementById('add-amount').value = "";
    document.getElementById('add-date').value = "";
    updateUI();
}

function deleteItem(id) {
    if (confirm("Vuoi eliminare questa operazione?")) {
        db = db.filter(i => i.id !== id);
        localStorage.setItem('conto_v6_db', JSON.stringify(db));
        updateUI();
    }
}

function updateUI() {
    const listMov = document.getElementById('list-mov');
    const listHist = document.getElementById('list-hist');
    const listNotif = document.getElementById('list-notif');
    const qMov = document.getElementById('search-mov').value.toLowerCase();
    const qHist = document.getElementById('search-hist').value.toLowerCase();
    
    listMov.innerHTML = ''; listHist.innerHTML = ''; listNotif.innerHTML = '';
    let inc = 0, exp = 0, notifs = 0;

    // Ordina per data decrescente
    const sorted = [...db].sort((a,b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(item => {
        if (item.type === 'income') inc += item.amount; else exp += item.amount;

        const html = `
            <div class="item-row">
                <div>
                    <strong>${item.desc}</strong><br>
                    <small style="color:var(--text-sec)">${item.date}</small>
                </div>
                <div style="text-align:right">
                    <span style="color:${item.type === 'income' ? 'var(--success)' : 'var(--danger)'}; font-weight:700">
                        ${item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}€
                    </span><br>
                    <button onclick="deleteItem(${item.id})" style="background:none; border:none; color:var(--text-sec); font-size:11px; margin-top:5px">Elimina</button>
                </div>
            </div>`;

        if (item.desc.toLowerCase().includes(qMov)) listMov.innerHTML += html;
        if (item.desc.toLowerCase().includes(qHist)) listHist.innerHTML += html;

        // Logica Notifiche (Scadenze odierne)
        const today = new Date().toISOString().split('T')[0];
        if (item.date === today) {
            notifs++;
            listNotif.innerHTML += `<div class="item-row" style="border-left: 4px solid var(--danger)">⚠️ Scadenza oggi: ${item.desc} (${item.amount}€)</div>`;
        }
    });

    document.getElementById('main-balance').innerText = privacy ? "€ •••••" : "€ " + (inc - exp).toFixed(2).replace('.', ',');
    document.getElementById('stat-inc').innerText = inc.toFixed(2) + " €";
    document.getElementById('stat-exp').innerText = exp.toFixed(2) + " €";
    document.getElementById('notif-badge').innerText = notifs;
}

function togglePrivacy() { privacy = !privacy; updateUI(); }

// Inizializzazione
updateUI();
