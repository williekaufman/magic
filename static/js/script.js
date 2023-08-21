URL = CONFIG.URL;

grid = document.getElementById('cardsGrid');
totalCost = 0;

toastElement = document.getElementById('toast');

attribute = null;
cost = null;

colors = {
    '{W}': 'white',
    '{U}': 'blue',
    '{B}': 'black',
    '{R}': 'red',
    '{G}': 'green',
    // This is sort of a lie but it's fine
    '{C}': 'generic'
}

function addCost(cost) {
    totalCost += cost;
    document.getElementById('totalCost').innerHTML = `Points remaining: ${100 - totalCost}`;
}

function showToast(message, seconds = 3) {
    if (seconds == 0) {
        toastElement.style.display = 'none';
        return;
    }

    toastElement.textContent = message;
    toastElement.style.display = 'inline-block';

    setTimeout(function () {
        toastElement.style.display = 'none';
    }, seconds * 1000);
}


function unhide(element, attribute) {
    if (attribute == 'mana-cost') {
        element = element.querySelector('.header');
    }
    
    child = element.querySelector(`.${attribute}`);

    if (!child) {
        return 0;
    }

    if (child.style.visibility === 'visible') {
        showToast('Already visible!', 10);
        return 0;
    };


    child.style.visibility = 'visible';

    if (attribute == 'type') {
        unhide(element, 'power-toughness');
    }

    return parseInt(cost);
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

    if (text.innerHTML == '') {
        text.innerHTML = '<span class="text-line">This card has no rules text. Sorry!</span>';
    }

    flavorText = document.createElement('div');
    flavorText.classList.add('flavor-text');
    flavorText.innerHTML = card.flavor_text || 'This card has no flavor text. Sorry!';

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

    cardElement.addEventListener('click', event => {
        topmostElement = event.target;

        while (!topmostElement.classList.contains('magic-card')) {
            topmostElement = topmostElement.parentElement;
        }

        addCost(unhide(topmostElement, attribute));
    });

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

attributeElements = document.querySelectorAll('.attribute');
rulesTextButton = document.getElementById('rulesTextButton');
typeButton = document.getElementById('typeButton');
manaCostButton = document.getElementById('manaCostButton');
flavorTextButton = document.getElementById('flavorTextButton');

attributeElements.forEach(element => {
    element.addEventListener('click', event => {
        attributeElements.forEach(element => {
            element.classList.remove('selected');
        });
        attribute = element.getAttribute('data-attribute');
        cost = element.getAttribute('data-cost');
        element.classList.add('selected');
    });
});

function handleKeyDown(event) {
    if (event.key == 'r') {
        rulesTextButton.click();
    } else if (event.key == 't') {
        typeButton.click();
    } else if (event.key == 'm') {
        manaCostButton.click();
    } else if (event.key == 'f') {
        flavorTextButton.click();
    }
}

document.addEventListener('keydown', handleKeyDown);

rulesTextButton.click();

addCost(0);