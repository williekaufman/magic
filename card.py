import random
from collections import Counter

class Card():
    def __init__(self, d):
        self.mana_cost = d.get('mana_cost', '')
        self.name = d.get('name', '')
        self.type = d.get('type_line', '').split(' — ')[0].removesuffix(' ')
        self.subtype = d.get('type_line', '').split(' — ')[1].removeprefix(' ') if ' — ' in d.get('type_line', '') else ''
        self.text = d.get('oracle_text', '')
        self.set = d.get('set_name', '')
        self.flavor_text = d.get('flavor_text', '')
        self.power = d.get('power', '')
        self.toughness = d.get('toughness', '')
        self.cmc = d.get('cmc', 0)
        self.rarity = d.get('rarity', '')

    def to_dict(self):
        return {
            'mana_cost': self.mana_cost,
            'name': self.name,
            'type': self.type,
            'subtype': self.subtype,
            'text': self.text.split('\n') if self.text else [],
            'set': self.set,
            'flavor_text': self.flavor_text,
            'power': self.power,
            'toughness': self.toughness,
            'cmc': self.cmc,
            'rarity': self.rarity,
        }
    
def has_cmc(n):
    return lambda c: c.cmc == n

def is_type(t):
    return lambda c: t == c.type

def is_subtype(t):
    return lambda c: t == c.subtype

def has_power(p):
    return lambda c: c.power == p

def has_toughness(t):
    return lambda c: c.toughness == t

def has_set(s):
    return lambda c: c.set == s

def has_rarity(r):
    return lambda c: c.rarity == r

all_rules = {
    'cmc': [
        has_cmc(float(n)) for n in range(1, 8)
    ],
    'type': [
        is_type(t) for t in [
            'Artifact',
            'Enchantment',
            'Planeswalker',
            'Instant',
            'Sorcery',
            'Land',
            'Legendary',
            'Tribal',
        ]
    ],
    'subtype': [
        is_subtype(t) for t in [
            'Human',
            'Elf',
            'Goblin',
            'Wizard',
            'Warrior',
            'Vampire',
            'Zombie',
            'Elf Warrior',
            'Human Wizard',
            'Human Warrior',
            'Human Cleric',
            'Human Soldier',
            'Human Shaman',
            'Human Rogue',
            'Human Monk',
        ]
    ],
    'power': [
        has_power(str(p)) for p in range(1, 8)
    ],
    'toughness': [
        has_toughness(str(t)) for t in range(1, 8)
    ],
    'set': [
        has_set(s) for s in [
            'Core Set 2021',
            'Throne of Eldraine',
            'Ikoria: Lair of Behemoths',
            'Zendikar Rising',
            'Kaldheim',
            'Strixhaven: School of Mages',
            'Adventures in the Forgotten Realms',
            'Innistrad: Midnight Hunt',
            'Innistrad: Crimson Vow',
            'Time Spiral Remastered',
            'Modern Horizons 2',
            'Core Set 2022',
            'Core Set 2020',
            'Core Set 2019',
            'Core Set 2018',
            'Core Set 2017',
            'Core Set 2016',
            'Core Set 2015',
            'Limited Edition Alpha',
            'Limited Edition Beta',
            'Unlimited Edition',
            ]
    ],
    'rarity': [
        has_rarity(r) for r in [
            'common',
            'uncommon',
            'rare',
            'mythic',
        ] 
    ],
}

def select_rules():
    ret = {}
    keys = random.sample(all_rules.keys(), 4)
    for k in keys:
        ret[k] = random.choice(all_rules[k])
    return ret

def filter_card(card, yes, no):
    return yes(card) and all(not rule(card) for rule in no)

def select_n_cards(cards, n, yes, no):
    ret = []
    while cards:
        card = cards.pop()
        if filter_card(card, yes, no):
            ret.append(card.to_dict())
            if len(ret) == n:
                return ret
    return []

def check_validity(answer):
    all_cards = []
    for cards in answer.values():
        all_cards += cards or []
    for k in answer.keys():
        c = Counter(card[k] for card in all_cards)
        if len([v for v in c.values() if v == 4]) != 1:
            return False
    return all(len(answer[k]) == 4 for k in answer.keys()) and len(answer.keys()) == 4

def select_cards(cards):
    tmp = [c for c in cards]
    random.shuffle(tmp)
    rules = select_rules()
    ret = {}
    for k, v in rules.items():
        ret[k] = select_n_cards(tmp, 4, v, [v2 for k2, v2 in rules.items() if k2 != k])
    return ret

def combine_types(card):
    if card['subtype']:
        return f"{card['type']} - {card['subtype']}"
    else:
        return card['type']

def select_cards_outer(cards):
    ret = {}
    i = 0
    while not check_validity(ret) and i < 1000:
        ret = select_cards(cards)
        i += 1
    for k in ret.keys():
        for c in ret[k]:
            c['type'] = combine_types(c)
    return ret