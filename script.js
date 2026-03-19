import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// لێرە زانیارییەکانی خۆت دابنێ (کە لە Settings وەرتگرتووە)
const firebaseConfig = {
  apiKey: "لێرە_کلیلەکە_دابنێ",
  authDomain: "my-clipboard-app.firebaseapp.com",
  databaseURL: "https://my-clipboard-app-default-rtdb.firebaseio.com",
  projectId: "my-clipboard-app",
  storageBucket: "my-clipboard-app.appspot.com",
  messagingSenderId: "لێرە_ژمارەکە_دابنێ",
  appId: "لێرە_ئایدی_ئەپەکە_دابنێ"
};

// دەستپێکردن
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const notesRef = ref(db, 'notes');

// کرداری ناردن و کۆپی
window.saveAndCopy = function() {
    const input = document.getElementById('textInput');
    const text = input.value;

    if (text.trim() === "") {
        alert("تکایە دەقێک بنووسە");
        return;
    }

    // کۆپی بۆ ناو مۆبایل/کۆمپیوتەر
    navigator.clipboard.writeText(text).then(() => {
        // ناردن بۆ فایەربەیس
        push(notesRef, {
            content: text,
            time: Date.now()
        });
        input.value = "";
        alert("کۆپی کرا و بۆ هەموو ئامێرەکان ناردرا!");
    });
};

// کاتێک هەر تێکستێکی نوێ دێت، لێرە زیاد دەبێت
onChildAdded(notesRef, (snapshot) => {
    const data = snapshot.val();
    addToList(data.content);
});

function addToList(text) {
    const list = document.getElementById('copyList');
    const li = document.createElement('li');
    
    li.innerHTML = `
        <span>${text.length > 40 ? text.substring(0, 40) + "..." : text}</span>
        <button class="copy-item-btn" onclick="copyAgain('${text.replace(/'/g, "\\'")}')">کۆپی</button>
    `;
    
    list.prepend(li);
}

window.copyAgain = function(text) {
    navigator.clipboard.writeText(text);
    alert("دووبارە کۆپی کرایەوە");
};
