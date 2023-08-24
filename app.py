#!/usr/bin/python3

# TODO:
# Handle more mana symbols
# Some kind of spec
# More card properties

from flask import Flask, jsonify, request, make_response, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_cors import CORS, cross_origin
from threading import Thread
from secrets import compare_digest, token_hex
from card import Card, select_cards_outer
import time
import random
import json

app = Flask(__name__)
socketio = SocketIO(app)
CORS(app)

def new_game_id():
    return token_hex(16)

@app.route("/", methods=['GET'])
def index():
    return render_template('index.html')

@app.route("/new_game", methods=['GET'])
def new_game():
    return {'success': True, 'game_id': new_game_id(), 'data': select_cards_outer(list(cards.values()))}

def get_card(name):
    try:
        return cards[name].to_dict()
    except KeyError:
        for k in cards.keys():
            if k.lower() == name.lower():
                return cards[k].to_dict()
    return None

@app.route("/card", methods=['GET'])
def card():
    name = request.args.get('name')
    card = get_card(name)
    if card:
        return {'success': True, 'data': card}
    else:
        return {'success': False, 'message': 'Card not found'}

real_types = [
    'Creature',
    'Artifact',
    'Enchantment',
    'Planeswalker',
    'Instant',
    'Sorcery',
    'Land',
    'Legendary',
    'Tribal',
    'World'
]

def include_card(card):
    try:
        types = card['type_line'].split(' ')
        for t in types:
            if t == '—':
                break
            if t not in real_types:
                return False
        return card['legalities']['vintage'] != 'not_legal' and not card.get('card_faces')
    except KeyError:
        return False

if __name__ == "__main__":
    with open('cards.json') as f:
        cards = json.load(f)
    cards = {card['name']: Card(card) for card in cards if include_card(card)}
    app.run(host='0.0.0.0', port=5005)