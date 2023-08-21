#!/usr/bin/python3

from flask import Flask, jsonify, request, make_response, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_cors import CORS, cross_origin
from threading import Thread
from secrets import compare_digest, token_hex
from card import Card
import time
import random
import json

app = Flask(__name__)
# socketio = SocketIO(app)
CORS(app)

def new_game_id():
    return token_hex(16)

@app.route("/", methods=['GET'])
def index():
    return render_template('index.html')

@app.route("/new_game", methods=['GET'])
def new_game():
    return {'success': True, 'game_id': new_game_id()}

@app.route("/random_card", methods=['GET'])
def random_card():
    card = random.choice(list(cards.values()))
    return card.to_dict()

if __name__ == "__main__":
    with open('cards.json') as f:
        cards = json.load(f)
    cards = {card['name']: Card(card) for card in cards}
    app.run(host='0.0.0.0', port=5001)
