import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onChildRemoved } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// !!! لێرە زانیارییەکانی فایەربەیسەکەت دابنێ !!!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const notesRef = ref(db, 'notes');

function formatText(text) {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" style="color: #1a73e8; text-decoration: underline;">${url}</a>`);
}

window.saveAndCopy = function() {
    const input = document.getElementById('textInput');
    const text = input.value;
    if (text.trim() === "") return;

    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    const dateStr = now.toLocaleDateString('en-GB');
    const fullDateTime = timeStr + " - " + dateStr;

    navigator.clipboard.writeText(text).then(() => {
        push(notesRef, { content: text, time: fullDateTime });
        input.value = "";
    });
};

window.deleteNote = function(key) {
    if(confirm("ئایا دڵنیای لە سڕینەوە؟")) {
        remove(ref(db, `notes/${key}`));
    }
};

onChildAdded(notesRef, (snapshot) => {
    const list = document.getElementById('copyList');
    const li = document.createElement('li');
    const data = snapshot.val();
    li.id = snapshot.key;
    
    li.innerHTML = `
        <div class="note-header">
            <span class="timestamp">${data.time || 'پێشتر'}</span>
        </div>
        <div class="text-content">${formatText(data.content)}</div>
        <div class="actions">
            <button class="copy-item-btn" onclick="copyAgain('${data.content.replace(/'/g, "\\'")}')">کۆپی</button>
            <button class="delete-btn" onclick="deleteNote('${snapshot.key}')">سڕینەوە</button>
        </div>`;
    list.prepend(li);
});

onChildRemoved(notesRef, (snapshot) => {
    const el = document.getElementById(snapshot.key);
    if(el) el.remove();
});

window.copyAgain = function(text) {
    navigator.clipboard.writeText(text);
    alert("کۆپی کرایەوە");
};

const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
});
