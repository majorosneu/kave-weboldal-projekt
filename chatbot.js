(() => {
    if (document.getElementById("chatbot-widget")) {
        return;
    }

    const SHOP_INFO = {
        address: "1117 Budapest, Pörkölő köz 12.",
        phone: "+36 20 456 7890",
        email: "kapcsolat@kavepont.hu",
        hours: "Hétfő-Péntek 07:00-19:00, Szombat 08:00-16:00, Vasárnap 09:00-14:00.",
        shipping: "A szállítási díj 990 Ft, és csak akkor számoljuk fel, ha van termék a kosárban.",
        origin:
            "A KávéPont 2016-ban nyílt meg családi vállalkozásként. A fókuszunk a minőségi specialty kávé és a nyugodt, barátságos vendégtér."
    };

    const PRODUCTS = [
        { name: "Espresso Tonic", price: 1490, aliases: ["espresso tonic", "tonic"] },
        { name: "Flat White", price: 1350, aliases: ["flat white", "flat"] },
        { name: "Vajas Croissant", price: 690, aliases: ["vajas croissant", "croissant"] },
        { name: "Etióp Kávébab 250g", price: 3990, aliases: ["etióp kávébab", "etiop kavebab", "kávébab", "kavebab", "bab"] },
        { name: "Cold Brew", price: 1590, aliases: ["cold brew"] },
        { name: "Filter Kávé", price: 1390, aliases: ["filter kávé", "filter kave", "filter"] },
        { name: "Matcha Latte", price: 1690, aliases: ["matcha latte", "matcha"] },
        { name: "Mocha", price: 1550, aliases: ["mocha"] },
        { name: "New York Cheesecake", price: 1290, aliases: ["new york cheesecake", "cheesecake"] },
        { name: "Ajándék Kávébox", price: 7990, aliases: ["ajándék kávébox", "ajandek kavebox", "kávébox", "kavebox", "gift"] }
    ];

    const widget = document.createElement("section");
    widget.id = "chatbot-widget";
    widget.className = "chatbot-widget";
    widget.setAttribute("aria-label", "KávéPont chatbot");

    widget.innerHTML = `
        <button type="button" class="chatbot-toggle" aria-controls="chatbot-panel" aria-expanded="false">
            Chat
        </button>
        <div id="chatbot-panel" class="chatbot-panel" role="dialog" aria-label="KávéPont chatbot panel">
            <div class="chatbot-header">
                <div>
                    <p class="chatbot-title">KávéPont Asszisztens</p>
                    <p class="chatbot-subtitle">Termékek, árak, nyitvatartás</p>
                </div>
                <button type="button" class="chatbot-close" aria-label="Chat bezárása">x</button>
            </div>

            <div class="chatbot-quick" role="group" aria-label="Gyors kérdések">
                <button type="button" data-question="Mi a kínálat?">Választék</button>
                <button type="button" data-question="Melyik a legolcsóbb termék?">Legolcsóbb</button>
                <button type="button" data-question="Mit ajánlasz?">Ajánlat</button>
                <button type="button" data-question="Mik a nyitvatartási idők?">Nyitvatartás</button>
                <button type="button" data-question="Hol vagytok pontosan?">Cím</button>
                <button type="button" data-question="Mennyi a szállítás?">Szállítás</button>
            </div>

            <div id="chatbot-messages" class="chatbot-messages" aria-live="polite"></div>
            <form id="chatbot-form" class="chatbot-form">
                <input id="chatbot-input" type="text" maxlength="280" autocomplete="off" placeholder="Írj ide (pl. választék, árak, nyitvatartás)" />
                <button id="chatbot-send" type="submit">Küldés</button>
            </form>
            <p class="chatbot-note">KávéPont online asszisztens termékekhez és alap információkhoz.</p>
        </div>
    `;

    document.body.appendChild(widget);

    const toggleButton = widget.querySelector(".chatbot-toggle");
    const closeButton = widget.querySelector(".chatbot-close");
    const panel = widget.querySelector(".chatbot-panel");
    const quickQuestions = widget.querySelector(".chatbot-quick");
    const form = widget.querySelector("#chatbot-form");
    const input = widget.querySelector("#chatbot-input");
    const messages = widget.querySelector("#chatbot-messages");

    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function formatPrice(value) {
        return `${value.toLocaleString("hu-HU")} Ft`;
    }

    function addMessage(role, text, extraClass = "") {
        const row = document.createElement("div");
        row.className = `chatbot-row ${role}`;

        const bubble = document.createElement("p");
        bubble.className = `chatbot-bubble ${extraClass}`.trim();
        bubble.textContent = text;

        row.appendChild(bubble);
        messages.appendChild(row);
        messages.scrollTop = messages.scrollHeight;
        return row;
    }

    function includesAny(text, keywords) {
        return keywords.some((keyword) => text.includes(keyword));
    }

    function findProductByText(normalizedUserText) {
        return PRODUCTS.find((product) =>
            product.aliases.some((alias) => normalizedUserText.includes(normalizeText(alias)))
        );
    }

    function getCatalogReply() {
        const lines = PRODUCTS.map((product) => `- ${product.name}: ${formatPrice(product.price)}`);
        return `Jelenlegi kínálatunk:\n${lines.join("\n")}`;
    }

    function getCheapestReply() {
        const cheapest = PRODUCTS.reduce((min, current) => (current.price < min.price ? current : min), PRODUCTS[0]);
        return `A legolcsóbb termékünk: ${cheapest.name} (${formatPrice(cheapest.price)}).`;
    }

    function getMostExpensiveReply() {
        const max = PRODUCTS.reduce((top, current) => (current.price > top.price ? current : top), PRODUCTS[0]);
        return `A legdrágább termékünk: ${max.name} (${formatPrice(max.price)}).`;
    }

    function getRecommendationReply() {
        return "Ha klasszikus kávés italt keresel, a Flat White (1 350 Ft) jó választás. Frissítő opcióhoz ajánlom az Espresso Tonicot (1 490 Ft).";
    }

    function getDessertReply() {
        return "Desszerthez jó választás a New York Cheesecake (1 290 Ft), reggelire pedig a Vajas Croissant (690 Ft).";
    }

    function getDrinkOnlyReply() {
        const drinkNames = ["Espresso Tonic", "Flat White", "Cold Brew", "Filter Kávé", "Matcha Latte", "Mocha"];

        const list = PRODUCTS.filter((item) => drinkNames.includes(item.name))
            .map((item) => `- ${item.name}: ${formatPrice(item.price)}`)
            .join("\n");

        return `Ital kínálat:\n${list}`;
    }

    function getPastryOnlyReply() {
        const list = PRODUCTS.filter((item) => ["Vajas Croissant", "New York Cheesecake"].includes(item.name))
            .map((item) => `- ${item.name}: ${formatPrice(item.price)}`)
            .join("\n");

        return `Péksüti és desszert kínálat:\n${list}`;
    }

    function getBotReply(userText) {
        const text = normalizeText(userText);

        if (!text) {
            return "Írj nyugodtan egy kérdést, és segítek.";
        }

        if (includesAny(text, ["szia", "hello", "jo nap", "udv", "hali", "szevasz"])) {
            return "Szia! Segítek termékekkel, árakkal, nyitvatartással és elérhetőséggel kapcsolatban.";
        }

        if (
            includesAny(text, [
                "valasztek",
                "kinalat",
                "mik vannak",
                "mi vannak",
                "mi van",
                "mi elerheto",
                "mi kaphato",
                "miket lehet",
                "termekek",
                "mit tudok rendelni",
                "menu",
                "itallap"
            ])
        ) {
            return getCatalogReply();
        }

        if (includesAny(text, ["ital", "kaves ital", "mit lehet inni", "inni"])) {
            return getDrinkOnlyReply();
        }

        if (includesAny(text, ["desszert", "suti", "pekaru", "reggeli", "édes" ])) {
            return getPastryOnlyReply();
        }

        if (includesAny(text, ["legolcsobb", "legolcsobbik", "olcso", "legkedvezobb"])) {
            return getCheapestReply();
        }

        if (includesAny(text, ["legdragabb", "dragabb", "premium", "prémium"])) {
            return getMostExpensiveReply();
        }

        if (includesAny(text, ["ajanlj", "ajanlasz", "mit ajanlasz", "ajanlat", "ajánlat"])) {
            return getRecommendationReply();
        }

        if (includesAny(text, ["desszertet ajanlj", "sutit ajanlj", "edeset ajanlj", "édeset ajánlj"])) {
            return getDessertReply();
        }

        const matchedProduct = findProductByText(text);
        if (matchedProduct) {
            return `${matchedProduct.name} ára: ${formatPrice(matchedProduct.price)}.`;
        }

        if (includesAny(text, ["nyitvatart", "mikor vagytok nyitva", "nyitva", "zaras", "nyitas", "meddig vagytok nyitva"])) {
            return `Nyitvatartás: ${SHOP_INFO.hours}`;
        }

        if (includesAny(text, ["cim", "hol vagytok", "hol talallak", "hely", "merre", "hol talalhato"])) {
            return `Címünk: ${SHOP_INFO.address}`;
        }

        if (includesAny(text, ["telefon", "email", "elerhetoseg", "kapcsolat", "telefonszam", "e mail"])) {
            return `Elérhetőség: ${SHOP_INFO.phone} | ${SHOP_INFO.email}`;
        }

        if (includesAny(text, ["szallitas", "szallitasi dij", "futar", "kiszallitas", "dij", "hany ft a szallitas"])) {
            return SHOP_INFO.shipping;
        }

        if (includesAny(text, ["rolatok", "kik vagytok", "mikor nyitottatok", "tortenet", "csaladi", "honnan indultatok"])) {
            return SHOP_INFO.origin;
        }

        if (includesAny(text, ["asztalfoglalas", "foglalas", "asztalt foglalnek", "foglalnék"])) {
            return "Asztalfoglaláshoz kérlek keress minket telefonon vagy e-mailben: +36 20 456 7890 | kapcsolat@kavepont.hu";
        }

        if (includesAny(text, ["fizetes", "kartya", "keszpenz", "mivel lehet fizetni", "fizethetek kartyaval"])) {
            return "A helyszínen készpénzzel és bankkártyával is tudsz fizetni.";
        }

        return "Ebben tudok segíteni: választék, italok, desszertek, árak, nyitvatartás, elérhetőség, szállítás, rólunk.";
    }

    function submitUserMessage(text) {
        const trimmed = text.trim();
        if (!trimmed) {
            return;
        }

        addMessage("user", trimmed);
        input.value = "";

        const typing = addMessage("bot", "Válasz készül...", "typing");
        setTimeout(() => {
            typing.remove();
            addMessage("bot", getBotReply(trimmed));
        }, 350);
    }

    function openPanel() {
        panel.classList.add("is-open");
        toggleButton.setAttribute("aria-expanded", "true");
        setTimeout(() => input.focus(), 40);
    }

    function closePanel() {
        panel.classList.remove("is-open");
        toggleButton.setAttribute("aria-expanded", "false");
    }

    toggleButton.addEventListener("click", () => {
        if (panel.classList.contains("is-open")) {
            closePanel();
        } else {
            openPanel();
        }
    });

    closeButton.addEventListener("click", closePanel);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && panel.classList.contains("is-open")) {
            closePanel();
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        submitUserMessage(input.value);
    });

    quickQuestions.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-question]");
        if (!button) {
            return;
        }
        submitUserMessage(button.dataset.question || "");
    });

    addMessage("bot", "Szia! Segítek termékekkel, árakkal és alap információkkal kapcsolatban.");
    addMessage("bot", "Írd be például: választék, mit ajánlasz, mikor vagytok nyitva, vagy mikor nyitottatok.");
})();
