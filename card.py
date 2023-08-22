import random
from collections import Counter

class Card():
    def __init__(self, d):
        self.mana_cost = d.get('mana_cost', '')
        self.name = d.get('name', '')
        self.type = d.get('type_line', '')
        self.text = d.get('oracle_text', '')
        self.set = d.get('set_name', '')
        self.flavor_text = d.get('flavor_text', '')
        self.power = d.get('power', '')
        self.toughness = d.get('toughness', '')
        self.cmc = d.get('cmc', 0)

    def to_dict(self):
        return {
            'mana_cost': self.mana_cost,
            'name': self.name,
            'type': self.type,
            'text': self.text.split('\n') if self.text else [],
            'set': self.set,
            'flavor_text': self.flavor_text,
            'power': self.power,
            'toughness': self.toughness,
            'cmc': self.cmc
        }

def has_cmc(n):
    return lambda c: c.cmc == n

def has_type(t):
    return lambda c: t in c.type

def has_power(p):
    return lambda c: c.power == p

def has_toughness(t):
    return lambda c: c.toughness == t

all_rules = {
    'cmc': [
        has_cmc(float(n)) for n in range(1, 8)
    ],
    'type': [
        has_type(t) for t in [
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
    'power': [
        has_power(str(p)) for p in range(1, 8)
    ],
    'toughness': [
        has_toughness(str(t)) for t in range(1, 8)
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

def x(cards):
    return cards.pop()

def select_n_cards(cards, n, yes, no):
    ret = []
    while cards:
        card = x(cards)
        if filter_card(card, yes, no):
            ret.append(card.to_dict())
            if len(ret) == n:
                return ret
    return None

def check_validity(answer):
    for k in answer.keys():
        c = Counter(card[k] for card in answer[k])
        if len([v for v in c.values() if v == 4]) != 1:
            return False
    return all(len(answer[k]) == 4 for k in answer.keys()) and len(answer.keys()) == 4

def select_cards(cards):
    tmp = cards
    random.shuffle(tmp)
    rules = select_rules()
    ret = {}
    for k, v in rules.items():
        ret[k] = select_n_cards(tmp, 4, v, [v2 for k2, v2 in rules.items() if k2 != k])
    return ret

def select_cards_outer(cards):
    ret = {}
    i = 0
    while not check_validity(ret) and i < 1000:
        ret = select_cards(cards)
        i += 1
    return ret