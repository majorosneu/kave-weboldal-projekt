(() => {
    if (document.getElementById("chatbot-widget")) {
        return;
    }

    const SHOP_INFO = {
        address: "1117 Budapest, Pörkölő köz 12.",
        phone: "+36 20 456 7890",
        email: "kapcsolat@kavepont.hu",
        hours: "Hétfő-Péntek: 07:00-19:00\nSzombat: 08:00-16:00\nVasárnap: 09:00-14:00.",
        shipping: "A szállítási díj 990 Ft, a webshopunkon keresztül tudsz rendelni.",
        origin: "A KávéPont 2016-ban nyílt meg családi vállalkozásként. A fókuszunk a minőségi specialty kávé és a nyugodt, barátságos vendégtér."
    };

    const CHAT_FLOW = {
        start: {
            messages: ["Szia! Anna vagyok a KávéPontból. 👋 Miben segíthetek?"],
            options: [
                { label: "Kínálat és Árak", next: "menu" },
                { label: "Nyitvatartás és Helyszín", next: "info" },
                { label: "Asztalfoglalás", next: "booking" },
                { label: "Rólunk", next: "about" }
            ]
        },
        menu: {
            messages: ["Kávékat, teákat, péksüteményeket és otthoni kávékészítéshez való eszközöket, kávébabokat is találsz nálunk. Mit keresel pontosan?"],
            options: [
                { label: "Kávék és Italok", next: "drinks" },
                { label: "Péksütik és Desszertek", next: "pastries" },
                { label: "Vissza a kezdéshez", next: "start" }
            ]
        },
        drinks: {
            messages: ["Pár népszerű italunk ára:\n- Espresso Tonic: 1 490 Ft\n- Flat White: 1 350 Ft\n- Cold Brew: 1 590 Ft\n- Filter Kávé: 1 390 Ft\n- Matcha Latte: 1 690 Ft\n\n(A teljes listát, és a kosárba rakás lehetőségét a fenti 'Webshop' menüpontban találod!)"],
            options: [
                { label: "Desszerteket is megnézem", next: "pastries" },
                { label: "Vissza a kezdéshez", next: "start" }
            ]
        },
        pastries: {
            messages: ["Kínálatunkból:\n- Vajas Croissant: 690 Ft\n- New York Cheesecake: 1 290 Ft\n\nMinden reggel frissen érkeznek a péksüteményeink!"],
            options: [
                { label: "Italokat is megnézem", next: "drinks" },
                { label: "Vissza a kezdéshez", next: "start" }
            ]
        },
        info: {
            messages: [`Nyitvatartásunk:\n${SHOP_INFO.hours}\n\nCímünk:\n${SHOP_INFO.address}`],
            options: [
                { label: "Van kiszállítás?", next: "shipping" },
                { label: "Vissza a kezdéshez", next: "start" }
            ]
        },
        shipping: {
            messages: [SHOP_INFO.shipping],
            options: [
                { label: "Vissza a kezdéshez", next: "start" }
            ]
        },
        booking: {
            messages: ["Asztal foglalásához kérjük, hívj minket telefonon, vagy írj e-mailt!\n\nTelefon: +36 20 456 7890\nE-mail: kapcsolat@kavepont.hu"],
            options: [
                { label: "Hol vagytok pontosan?", next: "info" },
                { label: "Vissza a kezdéshez", next: "start" }
            ]
        },
        about: {
            messages: [SHOP_INFO.origin],
            options: [
                { label: "Vissza a kezdéshez", next: "start" }
            ]
        },
        fallback: {
            messages: ["Sajnos ezt nem teljesen értettem. Kérlek válassz az alábbi témák közül, hogy biztosan tudjak segíteni!"],
            options: [
                { label: "Kínálat és Árak", next: "menu" },
                { label: "Nyitvatartás és Helyszín", next: "info" },
                { label: "Asztalfoglalás", next: "booking" }
            ]
        }
    };

    const widget = document.createElement("section");
    widget.id = "chatbot-widget";
    widget.className = "chatbot-widget";
    widget.setAttribute("aria-label", "KávéPont chatbot");

    widget.innerHTML = `
        <button type="button" class="chatbot-toggle" aria-controls="chatbot-panel" aria-expanded="false" aria-label="Chat megnyitása">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span class="ms-2">Kérdésed van?</span>
        </button>
        <div id="chatbot-panel" class="chatbot-panel" role="dialog" aria-label="KávéPont chatbot panel">
            <div class="chatbot-header">
                <div class="d-flex align-items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=Anna&background=8c5844&color=fff&rounded=true" width="40" height="40" alt="Anna Avatar" style="border-radius:50%; border: 2px solid #fff;">
                    <div>
                        <p class="chatbot-title">Anna (KávéPont)</p>
                        <p class="chatbot-subtitle opacity-75">Interaktív asszisztens</p>
                    </div>
                </div>
                <button type="button" class="chatbot-close" aria-label="Chat bezárása">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div id="chatbot-messages" class="chatbot-messages" aria-live="polite"></div>
            
            <form id="chatbot-form" class="chatbot-form">
                <input id="chatbot-input" type="text" maxlength="280" autocomplete="off" placeholder="Vagy írj egy üzenetet..." />
                <button id="chatbot-send" type="submit" aria-label="Küldés">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </form>
            <p class="chatbot-note">Válassz a gombok közül a gyorsabb információért.</p>
        </div>
    `;

    document.body.appendChild(widget);

    const toggleButton = widget.querySelector(".chatbot-toggle");
    const closeButton = widget.querySelector(".chatbot-close");
    const panel = widget.querySelector(".chatbot-panel");
    const form = widget.querySelector("#chatbot-form");
    const input = widget.querySelector("#chatbot-input");
    const messages = widget.querySelector("#chatbot-messages");

    let isThinking = false;

    function addMessage(role, text, extraClass = "") {
        const row = document.createElement("div");
        row.className = `chatbot-row ${role}`;

        const bubble = document.createElement("p");
        bubble.className = `chatbot-bubble ${extraClass}`.trim();
        bubble.textContent = text;

        row.appendChild(bubble);
        messages.appendChild(row);
        scrollToBottom();
        return row;
    }

    function addOptions(options) {
        if (!options || options.length === 0) return;

        const row = document.createElement("div");
        row.className = "chatbot-row bot chatbot-options-row";

        const container = document.createElement("div");
        container.className = "chatbot-options-container d-flex flex-wrap gap-2 mt-1 mb-2";

        options.forEach(opt => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "btn btn-sm btn-coffee-outline chatbot-option-btn";
            btn.textContent = opt.label;
            btn.dataset.next = opt.next;
            btn.addEventListener("click", () => {
                if (isThinking) return;
                handleOptionClick(opt.label, opt.next);
                // Remove buttons after clicking
                row.remove();
            });
            container.appendChild(btn);
        });

        row.appendChild(container);
        messages.appendChild(row);
        scrollToBottom();
    }

    // Add styles for the inline options
    const style = document.createElement('style');
    style.textContent = `
        .chatbot-option-btn {
            font-size: 0.8rem;
            padding: 0.35rem 0.8rem;
            border-radius: 99px;
            background: #fff;
            border: 1px solid var(--coffee-300);
            color: var(--coffee-700);
            transition: all 0.2s ease;
        }
        .chatbot-option-btn:hover {
            background: var(--coffee-100);
            border-color: var(--coffee-500);
        }
        .chatbot-options-row {
            padding-left: 0.5rem;
            animation: slideInUp 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    function scrollToBottom() {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            messages.scrollTop = messages.scrollHeight;
        }, 10);
    }

    function removeExistingOptions() {
        const existingOpts = messages.querySelectorAll('.chatbot-options-row');
        existingOpts.forEach(el => el.remove());
    }

    function goToNode(nodeId) {
        isThinking = true;
        removeExistingOptions();
        const node = CHAT_FLOW[nodeId] || CHAT_FLOW.fallback;

        // Disable input while thinking
        input.disabled = true;

        const typing = addMessage("bot", "Írás folyamatban...", "typing");

        setTimeout(() => {
            typing.remove();

            // Send multiple messages if they exist
            node.messages.forEach((msg, idx) => {
                setTimeout(() => {
                    addMessage("bot", msg);

                    // Add options after the last message
                    if (idx === node.messages.length - 1) {
                        addOptions(node.options);
                        isThinking = false;
                        input.disabled = false;
                        input.focus();
                    }
                }, idx * 600);
            });

            if (node.messages.length === 0) {
                addOptions(node.options);
                isThinking = false;
                input.disabled = false;
            }

        }, 500);
    }

    function handleOptionClick(userText, nextNodeId) {
        addMessage("user", userText);
        goToNode(nextNodeId);
    }

    // Keyword fallback logic
    function guessNodeFromText(text) {
        const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "");
        if (t.includes("menu") || t.includes("kinalat") || t.includes("ar") || t.includes("mit lehet") || t.includes("termek")) return "menu";
        if (t.includes("ital") || t.includes("kave") || t.includes("inni")) return "drinks";
        if (t.includes("suti") || t.includes("desszert") || t.includes("kaja") || t.includes("enni") || t.includes("pekaru")) return "pastries";
        if (t.includes("nyitva") || t.includes("cim") || t.includes("hol") || t.includes("hely")) return "info";
        if (t.includes("szallit") || t.includes("futar") || t.includes("rendel")) return "shipping";
        if (t.includes("foglal") || t.includes("asztal") || t.includes("telefon")) return "booking";
        if (t.includes("szia") || t.includes("hello") || t.includes("udv")) return "start";
        return "fallback";
    }

    function submitUserMessage(text) {
        if (isThinking) return;
        const trimmed = text.trim();
        if (!trimmed) return;

        addMessage("user", trimmed);
        input.value = "";

        const nextNode = guessNodeFromText(trimmed);
        goToNode(nextNode);
    }

    function openPanel() {
        panel.classList.add("is-open");
        toggleButton.setAttribute("aria-expanded", "true");

        // Initialize chat with start node if empty
        if (messages.children.length === 0) {
            goToNode("start");
        } else {
            setTimeout(() => input.focus(), 40);
        }
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

})();
