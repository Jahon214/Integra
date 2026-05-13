document.addEventListener("DOMContentLoaded", function () {

    // ================= CONFIG =================
    const STORAGE_USERS = "konus_users";
    const STORAGE_CURRENT_USER = "konus_current";

    const BOT_TOKEN = "TOKEN_YOZ";
    const CHAT_ID = "CHAT_ID_YOZ";

    // ================= TELEGRAM =================
    function sendToTelegram(message) {
        if (!BOT_TOKEN || !CHAT_ID) return;

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "HTML"
            }),
        }).catch(() => { });
    }

    // ================= CUSTOM ALERT (CHIROYLI) =================
    function showAlert(message) {
        let box = document.createElement("div");

        box.innerHTML = message;
        box.style.position = "fixed";
        box.style.top = "20px";
        box.style.left = "50%";
        box.style.transform = "translateX(-50%)";
        box.style.background = "#222";
        box.style.color = "#fff";
        box.style.padding = "15px 25px";
        box.style.borderRadius = "10px";
        box.style.zIndex = "9999";
        box.style.fontSize = "16px";
        box.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";

        document.body.appendChild(box);

        setTimeout(() => {
            box.remove();
        }, 2500);
    }

    // ================= PAGES =================
    const pages = {
        login: document.getElementById("loginPage"),
        register: document.getElementById("registerPage"),
        home: document.getElementById("homePage"),
        alifbo: document.getElementById("alifboPage"),
        yassi: document.getElementById("yassiPage"),
        hajmli: document.getElementById("hajmliPage"),
        test: document.getElementById("testPage"),
    };

    function show(page) {
        Object.values(pages).forEach(p => p?.classList.remove("active"));
        pages[page]?.classList.add("active");
    }

    // ================= STORAGE =================
    const getUsers = () => JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
    const saveUsers = (u) => localStorage.setItem(STORAGE_USERS, JSON.stringify(u));
    const setUser = (u) => localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(u));
    const getUser = () => JSON.parse(localStorage.getItem(STORAGE_CURRENT_USER));
    const logout = () => {
        localStorage.removeItem(STORAGE_CURRENT_USER);
        show("login");
    };

    // ================= REGISTER =================
    document.getElementById("registerBtn").onclick = () => {

        const fullname = regFullname.value.trim();
        const login = regLogin.value.trim();
        const password = regPassword.value.trim();

        if (!fullname || !login || !password) {
            showAlert("❌ Barcha maydonlarni to‘ldiring");
            return;
        }

        let users = getUsers();

        if (users.some(u => u.login === login)) {
            showAlert("❌ Login band");
            return;
        }

        const user = { fullname, login, password };
        users.push(user);

        saveUsers(users);
        setUser(user);

        showAlert(`✅ Xush kelibsiz ${fullname}`);
        show("home");
        updateUser();
    };

    // ================= LOGIN =================
    document.getElementById("loginBtn").onclick = () => {

        const login = loginUsername.value.trim();
        const password = loginPassword.value.trim();

        const user = getUsers().find(
            u => u.login === login && u.password === password
        );

        if (!user) {
            showAlert("❌ Login yoki parol noto‘g‘ri");
            return;
        }

        setUser(user);

        loginUsername.value = "";
        loginPassword.value = "";

        showAlert(`👋 Xush kelibsiz ${user.fullname}`);
        show("home");
        updateUser();
    };


    // ================== GOTO REGISTER/LOGIN ==================
    document.getElementById("goToRegisterBtn")?.addEventListener("click", () => {
        show("register");
    });

    document.getElementById("backToLoginBtn")?.addEventListener("click", () => {
        show("login");
    });


    // ================= FULLNAME FIX =================
    function updateUser() {
        const user = getUser();
        const el = document.getElementById("userDisplayName");

        if (user && el) {
            el.innerText = user.fullname;
        }
    }

    // ================= LOGOUT =================
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        logout();
    });

    // ================= NAV =================
    gotoSection1.onclick = () => show("alifbo");
    gotoSection2.onclick = () => show("yassi");
    gotoSection3.onclick = () => show("hajmli");

    backFromAlifbo.onclick = () => show("home");
    backFromYassi.onclick = () => show("home");
    backFromHajmli.onclick = () => show("home");

    // ================= TEST =================
    let currentTest = "alifbo";

    const testQuestions = {
        alifbo: [
            { q: "Kesma nima?", a: "B", options: ["A) Nur", "B) Kesma", "C) Siniq"] },
            { q: "Nur nima?", a: "C", options: ["A) Chiziq", "B) Kesma", "C) Nur"] }
        ]
    };

    function startTest(type) {
        currentTest = type;
        show("test");

        const form = document.getElementById("testForm");

        form.innerHTML = testQuestions[type].map((q, i) => `
            <div>
                <p>${q.q}</p>
                ${q.options.map((o, j) => `
                    <label>
                        <input type="radio" name="q${i}" value="${String.fromCharCode(65 + j)}">
                        ${o}
                    </label>
                `).join("")}
            </div>
        `).join("");

        showAlert("📝 Test boshlandi");
    }

    startTestBtn1.onclick = () => startTest("alifbo");

    document.getElementById("submitTestBtn").onclick = () => {

        const user = getUser();
        const qs = testQuestions[currentTest];

        let correct = 0, wrong = 0, empty = 0;

        qs.forEach((q, i) => {
            const sel = document.querySelector(`input[name="q${i}"]:checked`);

            if (!sel) empty++;
            else if (sel.value === q.a) correct++;
            else wrong++;
        });

        // ================= TELEGRAM SEND =================
        sendToTelegram(`
📚 <b>Test natija</b>
👤 ${user.fullname}
🔐 ${user.login}
📊 ${currentTest}

✅ To‘g‘ri: ${correct}
❌ Xato: ${wrong}
⏳ Bo‘sh: ${empty}
        `);

        showAlert(`📊 Natija: ${correct}/${qs.length}`);
        show("home");
    };

    // ================= INIT =================
    function init() {
        const user = getUser();

        if (user) {
            show("home");
            updateUser();
        } else {
            show("login");
        }
    }

    init();

});