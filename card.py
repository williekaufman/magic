class Card():
    def __init__(self, d):
        self.mana_cost= d.get('mana_cost', '')
        self.name = d.get('name', '')
        self.type_line = d.get('type_line', '')
        self.oracle_text = d.get('oracle_text', '')
        self.set_name = d.get('set_name', '')
        self.flavor_text = d.get('flavor_text', '')
        self.power = d.get('power', '')
        self.toughness = d.get('toughness', '')
        self.cmc = d.get('cmc', '')

    def to_dict(self):
        return {
            'mana_cost': self.mana_cost,
            'name': self.name,
            'type_line': self.type_line,
            'oracle_text': self.oracle_text.split('\n') if self.oracle_text else [],
            'set_name': self.set_name,
            'flavor_text': self.flavor_text,
            'power': self.power,
            'toughness': self.toughness,
            'cmc': self.cmc
        }