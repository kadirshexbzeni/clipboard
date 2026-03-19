import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onChildRemoved } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "لێرە_کلیلەکە_دابنێ",
  authDomain: "my-clipboard-app.firebaseapp.com",
  databaseURL: "https://my-clipboard-app-default-rtdb.firebaseio.com",
  projectId: "my-clipboard-app",
  storageBucket: "my-clipboard-app.appspot.com",
  messagingSenderId: "لێرە_ژمارەکە_دابنێ",
  appId: "لێرە_ئایدی_ئەپەکە_دابنێ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const notesRef = ref(db, 'notes');

// فەنکشن بۆ ناسینەوەی لینک
function formatText(text) {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" style="color: #1a73e8;">${url}</a>`);
}

window.saveAndCopy = function() {
    const input = document.getElementById('textInput');
    const text = input.value;
    if (text.trim() === "") return;

    navigator.clipboard.writeText(text).then(() => {
        push(notesRef, { content: text, time: Date.now() });
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
    const content = snapshot.val().content;
    li.id = snapshot.key;
    li.innerHTML = `
        <div class="text-content">${formatText(content)}</div>
        <div class="actions">
            <button class="copy-item-btn" onclick="copyAgain('${content.replace(/'/g, "\\'")}')">کۆپی</button>
            <button class="delete-btn" onclick="deleteNote('${snapshot.key}')">سڕینەوە</button>
        </div>`;
    list.prepend(li);
});

onChildRemoved(notesRef, (snapshot) => {
    document.getElementById(snapshot.key)?.remove();
});

window.copyAgain = function(text) {
    navigator.clipboard.writeText(text);
    alert("کۆپی کرایەوە");
};

// Dark Mode
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
