import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onChildRemoved } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// !!! دڵنیابەرەوە کلیلەکانت لێرە ڕاستن !!!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "my-clipboard-app.firebaseapp.com",
  databaseURL: "https://my-clipboard-app-default-rtdb.firebaseio.com",
  projectId: "my-clipboard-app",
  storageBucket: "my-clipboard-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const notesRef = ref(db, 'notes');

// فەنکشن بۆ چاککردنی کات و گۆڕینی ژمارە درێژەکە بۆ کاتی ئاسایی
function formatNoteTime(timeData) {
    if (!timeData) return "بێ کات";
    
    // ئەگەر کاتەکە ژمارەیەکی درێژ بوو (Unix Timestamp)
    if (!isNaN(timeData) && timeData.toString().length > 10) {
        const d = new Date(Number(timeData));
        return d.getHours().toString().padStart(2, '0') + ":" + 
               d.getMinutes().toString().padStart(2, '0') + " - " + 
               d.toLocaleDateString('en-GB');
    }
    return timeData; // ئەگەر خۆی پێشتر دەق بوو
}

function formatText(text) {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" style="color: #1a73e8; text-decoration: underline;">${url}</a>`);
}

window.saveAndCopy = function() {
    const input = document.getElementById('textInput');
    const text = input.value;
    if (text.trim() === "") return;

    // پاشەکەوتکردن بە شێوازی کاتی ئێستا
    const now = new Date();
    const fullDateTime = now.getHours().toString().padStart(2, '0') + ":" + 
                         now.getMinutes().toString().padStart(2, '0') + " - " + 
                         now.toLocaleDateString('en-GB');

    navigator.clipboard.writeText(text).then(() => {
        push(notesRef, { content: text, time: fullDateTime });
        input.value = "";
    });
};

// فەنکشنی سڕینەوە (گرنگ: دەبێت پەیوەندی بە window-ەوە هەبێت)
window.deleteNote = function(key) {
    if(confirm("ئایا دڵنیای لە سڕینەوە؟")) {
        const itemRef = ref(db, `notes/${key}`);
        remove(itemRef).then(() => {
            console.log("سڕایەوە");
        }).catch((error) => {
            alert("کێشە هەیە لە سڕینەوە: " + error.message);
        });
    }
};

onChildAdded(notesRef, (snapshot) => {
    const list = document.getElementById('copyList');
    const data = snapshot.val();
    const key = snapshot.key;
    
    const li = document.createElement('li');
    li.id = key;
    
    li.innerHTML = `
        <div class="note-header">
            <span class="timestamp">${formatNoteTime(data.time)}</span>
        </div>
        <div class="text-content">${formatText(data.content)}</div>
        <div class="actions">
            <button class="copy-item-btn" onclick="copyAgain(\`${data.content.replace(/`/g, "\\`")}\`)">کۆپی</button>
            <button class="delete-btn" onclick="deleteNote('${key}')">سڕینەوە</button>
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
