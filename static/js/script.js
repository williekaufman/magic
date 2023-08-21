URL = CONFIG.URL;

grid = document.getElementById('cardsGrid');

colors = {
    '{W}': 'white',
    '{U}': 'blue',
    '{B}': 'black',
    '{R}': 'red',
    '{G}': 'green',
    // This is sort of a lie but it's fine
    '{C}': 'generic'
}

function makeRequestOptions(body, method = 'POST') {
    if (method == 'GET') {
        return {
            method,
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
        };
    }

    return {
        method,
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };
}

function fetchWrapper(url, body, method = 'POST') {
    if (method == 'GET') {
        if (body) {
            url = `${url}?`;
        }
        for (var key in body) {
            url = `${url}${key}=${body[key]}&`;
        }
    }
    return fetch(url, makeRequestOptions(body, method));
}

function makeCardElement(card) {
    cardElement = document.createElement('div');
    cardElement.classList.add('magic-card');

    header = document.createElement('div');
    header.classList.add('header');

    title = document.createElement('div');
    title.classList.add('title');
    title.innerHTML = card.name;

    manaCost = document.createElement('div');
    manaCost.classList.add('mana-cost');
    manaCost.innerHTML = processManaCosts(card.mana_cost);

    header.appendChild(title);
    header.appendChild(manaCost);

    type = document.createElement('div');
    type.classList.add('type');
    type.innerHTML = card.type_line;

    text = document.createElement('div');
    text.classList.add('text');
   
    text.innerHTML = '';

    card.oracle_text.forEach(line => {
        text.innerHTML += `<span class="text-line">${processManaCosts(line)}</span>`;
    })

    flavorText = document.createElement('div');
    flavorText.classList.add('flavor-text');
    flavorText.innerHTML = card.flavor_text;

    cardElement.appendChild(header);
    cardElement.appendChild(type);
    cardElement.appendChild(text);

    cardElement.appendChild(flavorText);

    if (card.power && card.toughness) {
        powerToughness = document.createElement('div');
        powerToughness.classList.add('power-toughness');
        powerToughness.innerHTML = `${card.power}/${card.toughness}`;
        cardElement.appendChild(powerToughness);
    }

    return cardElement;
}

genericManaPattern = /\{([0-9X]+)\}/g;

tapPattern = /\{T\}/g;

function replaceGenericMana(match, capturedDigit) {
    return `<div class="mana-symbol generic">${capturedDigit}</div>`;
}

function replaceTapSymbol(match) {
    return '<div class="mana-symbol tap">T</div>';
}

// TODO: handle hybrid, energy, phyrexian, etc.
function processManaCosts(text) {
    for (const [key, value] of Object.entries(colors)) {
        text = text.replaceAll(key, `<div class="mana-symbol ${value}">${key.charAt(1)}</div>`);
    }
    text = text.replaceAll(genericManaPattern, replaceGenericMana);
    text = text.replaceAll(tapPattern, replaceTapSymbol);

    return text;
}

for (let i = 0; i < 16; i++) {
    fetchWrapper(URL + '/random_card', {}, 'GET')
        .then(response => response.json())
        .then(data => {
            grid.appendChild(makeCardElement(data));
        });
}