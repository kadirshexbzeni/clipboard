// لایەنی سەرەوەی کۆدەکە وەک خۆیەتی، تەنها ئەم گۆڕانکارییانە لە خوارەوە بکە:
import { getDatabase, ref, push, onChildAdded, remove, onChildRemoved } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ... (هەمان firebaseConfig و دەستپێکردنی App)

const db = getDatabase(app);
const notesRef = ref(db, 'notes');

// --- زیادکردنی فانکشنی ڕەشکردنەوە ---
window.deleteNote = function(key) {
    const itemRef = ref(db, `notes/${key}`);
    remove(itemRef).then(() => {
        alert("تێبینییەکە ڕەشکرایەوە");
    });
};

// --- نوێکردنەوەی نیشاندانی لیستەکە ---
onChildAdded(notesRef, (snapshot) => {
    const data = snapshot.val();
    const key = snapshot.key; // کلیلی هەر تێبینییەک بۆ ڕەشکردنەوە پێویستە
    addToList(data.content, key);
});

// کاتێک لە ئامێرێکی تر شتێک ڕەش دەکرێتەوە، لێرەش لایببات
onChildRemoved(notesRef, (snapshot) => {
    const key = snapshot.key;
    const el = document.getElementById(key);
    if (el) el.remove();
});

function addToList(text, key) {
    const list = document.getElementById('copyList');
    const li = document.createElement('li');
    li.id = key; // ئایدی لقاڵەکە دادەنێین بۆ ئەوەی بزانین کامەیە ڕەش دەکرێتەوە
    
    li.innerHTML = `
        <div class="text-content">${text}</div>
        <div class="actions">
            <button class="copy-item-btn" onclick="copyAgain('${text.replace(/'/g, "\\'")}')">کۆپی</button>
            <button class="delete-btn" onclick="deleteNote('${key}')">سڕینەوە</button>
        </div>
    `;
    
    list.prepend(li);
}
