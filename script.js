let db = JSON.parse(localStorage.getItem('conto_db_v5')) || [];
let inputPin = "";
const targetPin = "0007";
let privacy = true;

// --- TASTIERINO PIN ---
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

// --- FUNZIONI APP ---
function toggleSidebar() {
    const open = document.getElementById('sidebar').classList.toggle('open');
    document.querySelector('.overlay').style.display = open ? 'block' : 'none';
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    toggleSidebar();
    updateUI();
}

function toggleTheme() {
    const b = document.body;
    b.setAttribute('data-theme', b.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

function saveData(type) {
    const d = document.getElementById('add-desc').value;
    const a = parseFloat(document.getElementById('add-amount').value);
    if (!d || !a) return;
    db.push({ id: Date.now(), desc: d, amount: a, type, date: new Date().toLocaleDateString() });
    localStorage.setItem('conto_db_v5', JSON.stringify(db));
    document.getElementById('add-desc').value = "";
    document.getElementById('add-amount').value = "";
    updateUI();
}

function updateUI() {
    let tot = 0;
    db.forEach(i => tot += (i.type === 'income' ? i.amount : -i.amount));
    document.getElementById('main-balance').innerText = privacy ? "€ •••••" : "€ " + tot.toFixed(2);
}

function togglePrivacy() { privacy = !privacy; updateUI(); }

updateUI();
