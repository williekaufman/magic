URL = CONFIG.URL;

grid = document.getElementById('cardsGrid');
totalCost = 0;

toastElement = document.getElementById('toast');

categoriesGridElement = document.getElementById('categoriesGrid');

attribute = null;
cost = null;
category = null;

answer = {}

buttons = [
    document.getElementById('button1'),
    document.getElementById('button2'),
    document.getElementById('button3'),
    document.getElementById('button4'),
]

buttons.forEach(button => {
    button.addEventListener('click', event => {
        buttons.forEach(button => {
            button.classList.remove('selected');
        });
        button.classList.add('selected');
        category = button.getAttribute('data-category');
        console.log(category);
    })
});

colors = {
    'W': 'white',
    'U': 'blue',
    'B': 'black',
    'R': 'red',
    'G': 'green',
    // This is sort of a lie but it's fine
    'C': 'generic'
}

function addCost(cost) {
    totalCost += cost;
    document.getElementById('totalCost').innerHTML = `Points remaining: ${100 - totalCost}`;
}

function showToast(message, seconds = 3) {
    if (seconds == 0) {
        toastElement.style.visibility = 'hidden';
        return;
    }

    toastElement.textContent = message;
    toastElement.style.visibility = 'visible';

    setTimeout(function () {
        toastElement.style.visibility = 'hidden';
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
    manaCost.innerHTML = card.mana_cost ? processManaCosts(card.mana_cost) : 'No mana cost';

    header.appendChild(title);
    header.appendChild(manaCost);

    type = document.createElement('div');
    type.classList.add('type');
    type.innerHTML = card.type;

    text = document.createElement('div');
    text.classList.add('text');

    text.innerHTML = '';

    card.text.forEach(line => {
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

    powerToughness = document.createElement('div');
    powerToughness.classList.add('power-toughness');
    powerToughness.innerHTML = card.power && card.toughness ? `${card.power}/${card.toughness}` : 'N/A';

    footer = document.createElement('div');
    footer.classList.add('footer');
    footer.appendChild(flavorText);
    footer.appendChild(powerToughness);

    cardElement.appendChild(footer);

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
phyrexianManaPattern = /\{([WUBRG])\/P\}/g;
tapPattern = /\{T\}/g;

function replaceGenericMana(match, capturedDigit) {
    return `<div class="mana-symbol generic">${capturedDigit}</div>`;
}

function replaceTapSymbol(match) {
    return '<div class="mana-symbol tap">T</div>';
}

function replacePhyrexianMana(match, capturedLetter) {
    return `<div class="mana-symbol phyrexian ${colors[capturedLetter]}">&#934;</div>`;
}

// TODO: handle hybrid, energy, phyrexian, etc.
function processManaCosts(text) {
    for (const [key, value] of Object.entries(colors)) {
        text = text.replaceAll('{' + key + '}', `<div class="mana-symbol ${value}">${key}}</div>`);
    }
    text = text.replaceAll(genericManaPattern, replaceGenericMana);
    text = text.replaceAll(tapPattern, replaceTapSymbol);
    text = text.replaceAll(phyrexianManaPattern, replacePhyrexianMana);

    return text;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function processNewCategories(categories) {
    for (var i = 0; i < categories.length; i++) {
        buttons[i].innerHTML = categories[i];
        buttons[i].setAttribute('data-category', categories[i]);
    }
};

function processNewGameData(data) {
    keys = Object.keys(data);
    processNewCategories(keys);
    cards = [];
    keys.forEach(key => {
        cards = cards.concat(data[key]);
    });
    shuffleArray(cards);
    cards.forEach(card => {
        grid.appendChild(makeCardElement(card));
    });
    answer = {}
    keys.forEach(key => {
        answer[key] = data[key].map(card => card.name);
    });
}

function newGame() {
    addCost(-totalCost);

    fetchWrapper(URL + '/new_game', {}, 'GET')
        .then(response => response.json())
        .then(data => {
            if (!data['success']) {
                showToast('New game failed', 10);
                return;
            } else {
                processNewGameData(data['data']);
            }
        }
        );
}


attributeElements = document.querySelectorAll('.attribute');
rulesTextButton = document.getElementById('rulesTextButton');
typeButton = document.getElementById('typeButton');
manaCostButton = document.getElementById('manaCostButton');
flavorTextButton = document.getElementById('flavorTextButton');
ptButton = document.getElementById('ptButton');

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
    } else if (event.key == 'p') {
        ptButton.click();
    }
}

document.addEventListener('keydown', handleKeyDown);

rulesTextButton.click();

newGame();