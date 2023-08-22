URL = CONFIG.URL;

grid = document.getElementById('cardsGrid');
totalCost = 0;

toastElement = document.getElementById('toast');
totalCostElement = document.getElementById('totalCost');

attribute = null;
cost = null;
category = null;

gameOver = false;

currentGuess = [];

currentActionElement = document.getElementById('currentAction');
currentAction = null;

submitButton = document.getElementById('submitButton');

answer = {}

buttons = [
    document.getElementById('button1'),
    document.getElementById('button2'),
    document.getElementById('button3'),
    document.getElementById('button4'),
]

function updateCurrentAction(action) {
    currentAction = action;
}

document.getElementById('newGameButton').addEventListener('click', event => {
    newGame();
});

buttons.forEach(button => {
    button.addEventListener('click', event => {
       if (button.classList.contains('correct-guess')) {
            showToast('Category is already done');
            return;
        }
        buttons.forEach(button => {
            button.classList.remove('selected');
        });
        button.classList.add('selected');
        category = button.getAttribute('data-category');
        attributeElements.forEach(element => {
            element.classList.remove('selected');
        }); 
        updateCurrentAction('guessing');
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

function titleOfCard(cardElement) {
    return cardElement.querySelector('.header').querySelector('.title').textContent;
}

function toggleGuessing(card) {
    if (card.classList.contains('correct-guess')) {
        showToast('Card has already been used');
        return;
    } else if (card.classList.contains('incorrect-guess')) {
        return;
    }

    if (currentGuess.includes(card)) {
        currentGuess.splice(currentGuess.indexOf(card), 1);
        card.classList.remove('part-of-guess');
    } else {
        currentGuess.push(card);
        card.classList.add('part-of-guess');
    }
}

function guess() {
    if (currentGuess.length != 4) {
        showToast('Guesses must be 4 cards', 3, 'red');
        console.log(currentGuess);
        return;
    }
    currentButton = buttons.find(button => button.classList.contains('selected'));
    if (currentButton && currentButton.classList.contains('correct-guess')) {
        showToast('Category is already done', 3, 'red');
        return;
    }

    correctAnswer = answer[category];
    correct = true
    currentGuess.forEach(card => {
        if (!correctAnswer.includes(titleOfCard(card))) {
            correct = false;
        }
    });


    if (!correct) {
        currentGuess.forEach(card => {
            card.classList.remove('part-of-guess');
            card.classList.add('incorrect-guess');
            setTimeout(function () {
                card.classList.remove('incorrect-guess');
            }, 1000);
        });
        addCost(5);
    } else {
        buttons.find(button => button.classList.contains('selected')).classList.add('correct-guess');
        currentGuess.forEach(card => {
            card.classList.remove('part-of-guess');
            card.classList.add('correct-guess');
        });

        if (!buttons.find(button => !button.classList.contains('correct-guess'))) {
            gameOver = true;
            unhideAll();
            totalCostElement.innerHTML = `Final score: ${100 - totalCost}`;
            totalCostElement.style.color = 'green';
            showToast(`You win! Final score: ${100 - totalCost}`, 10, 'green');
        }
    }
    currentGuess = [];
}

submitButton.addEventListener('click', event => {
    guess();
});

function addCost(cost) {
    if (gameOver) {
        return ;
    }
    totalCost += cost;
    totalCostElement.innerHTML = `Points remaining: ${100 - totalCost}`;
}

function showToast(message, seconds = 3, color = 'blue') {
    if (seconds == 0) {
        toastElement.style.visibility = 'hidden';
        return;
    }

    toastElement.textContent = message;
    toastElement.style.visibility = 'visible';

    toastElement.style.backgroundColor = color;

    setTimeout(function () {
        toastElement.style.visibility = 'hidden';
        toastElement.style.backgroundColor = 'blue';
    }, seconds * 1000);
}

attributes = [
    'mana-cost',
    'type',
    'text',
    'flavor-text',
    'power-toughness',
    'set',
    'rarity',
]

function unhideAll() {
    cards = document.querySelectorAll('.magic-card');
    cards.forEach(card => {
        attributes.forEach(attribute => {
            unhide(card, attribute);
        });
    });
    showToast('', 0);
}

function unhide(element, attribute) {
    free = false;
    if (element.classList.contains('correct-guess')) {
        free = true;
    }
    
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

    return free ? 0 : parseInt(cost);
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

    set = document.createElement('div');
    set.classList.add('set');
    set.title = card.set_name;
    set.innerHTML = card.set;

    rarity = document.createElement('div');
    rarity.classList.add('rarity');
    rarity.innerHTML = card.rarity;

    typeLine = document.createElement('div');
    typeLine.classList.add('header');

    typeLine.appendChild(type);
    typeLine.appendChild(set);
    typeLine.appendChild(rarity);

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
    cardElement.appendChild(typeLine);
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

        if (currentAction == 'guessing') {
            toggleGuessing(topmostElement);
        } else {
            addCost(unhide(topmostElement, attribute));
        }
    });

    return cardElement;
}

genericManaPattern = /\{([0-9X]+)\}/g;
phyrexianManaPattern = /\{([WUBRG])\/P\}/g;
tapPattern = /\{T\}/g;
hybridManaPattern = /\{([WUBRG])\/([WUBRG])\}/g;

function replaceGenericMana(match, capturedDigit) {
    return `<div class="mana-symbol generic">${capturedDigit}</div>`;
}

function replaceTapSymbol(match) {
    return '<div class="mana-symbol tap">T</div>';
}

function replacePhyrexianMana(match, capturedLetter) {
    return `<div class="mana-symbol phyrexian ${colors[capturedLetter]}">&#934;</div>`;
}

function replaceHybridMana(match, color1, color2) {
    return `<div class="mana-symbol hybrid" style="background: linear-gradient(135deg, ${colors[color1]} 50%, ${colors[color2]} 50%)"></div>`;
}

// TODO: handle energy, etc.
function processManaCosts(text) {
    for (const [key, value] of Object.entries(colors)) {
        text = text.replaceAll('{' + key + '}', `<div class="mana-symbol ${value}">${key}</div>`);
    }
    text = text.replaceAll(genericManaPattern, replaceGenericMana);
    text = text.replaceAll(tapPattern, replaceTapSymbol);
    text = text.replaceAll(phyrexianManaPattern, replacePhyrexianMana);
    text = text.replaceAll(hybridManaPattern, replaceHybridMana);
    
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
    gameOver = false;
    currentGuess = [];

    buttons.forEach(button => {
        button.classList.remove('selected');
        button.classList.remove('correct-guess');
    });

    totalCostElement.style.color = 'black';

    addCost(-totalCost);

    grid.innerHTML = '';

    fetchWrapper(URL + '/new_game', {}, 'GET')
        .then(response => response.json())
        .then(data => {
            if (!data['success']) {
                showToast('New game failed', 10, 'red');
                return;
            } else {
                processNewGameData(data['data']);
            }
        }
        );

    showToast('', 0);
}


attributeElements = document.querySelectorAll('.attribute');
rulesTextButton = document.getElementById('rulesTextButton');
typeButton = document.getElementById('typeButton');
manaCostButton = document.getElementById('manaCostButton');
flavorTextButton = document.getElementById('flavorTextButton');
ptButton = document.getElementById('ptButton');
setButton = document.getElementById('setButton');
rarityButton = document.getElementById('rarityButton');

attributeElements.forEach(element => {
    element.addEventListener('click', event => {
        attributeElements.forEach(element => {
            element.classList.remove('selected');
        });
        buttons.forEach(button => {
            button.classList.remove('selected');
        });
        attribute = element.getAttribute('data-attribute');
        cost = element.getAttribute('data-cost');
        element.classList.add('selected');
        updateCurrentAction('buying');
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
    } else if (event.key == 's') {
        setButton.click();
    } else if (event.key == 'a') {
        rarityButton.click();
    } else if (event.ctrlKey && event.key == 'Enter') {
        submitButton.click();
    } else if (event.ctrlKey && event.altKey && event.key == 'n') {
        newGame();
    } else if (event.ctrlKey && event.altKey && event.key == 'u') {
        unhideAll();
    }
}

document.addEventListener('keydown', handleKeyDown);

rulesTextButton.click();

newGame();