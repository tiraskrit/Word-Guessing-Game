from flask import request, jsonify
from flask_cors import CORS
from app import app
from words.words import get_random_word

# Allow CORS for all routes
CORS(app)

game_state = {
    "team_1_score": 0,
    "team_2_score": 0,
    "current_word": None,
    "current_hint": None,
    "current_turn": 1,
    "rounds_left": 0,
}

@app.route('/start_game', methods=['POST'])
def start_game():
    data = request.json
    game_state["team_1_score"] = 0
    game_state["team_2_score"] = 0
    game_state["current_turn"] = 1
    game_state["rounds_left"] = data["rounds"]
    game_state["current_word"], description, game_state["current_hint"] = get_random_word()
    return jsonify({
        "team_1_score": game_state["team_1_score"],
        "team_2_score": game_state["team_2_score"],
        "current_turn": game_state["current_turn"],
        "rounds_left": game_state["rounds_left"],
        "word_description": description,
        "letters": len(game_state["current_word"]),
        "current_hint": game_state["current_hint"],
        "game_over": False
    })


@app.route('/get_word', methods=['GET'])
def get_word():
    word, description, hint = get_random_word()
    game_state["current_word"] = word
    game_state["current_hint"] = hint
    return jsonify({"word": word, "description": description, "letters": len(word)})

@app.route('/submit_guess', methods=['POST'])
def submit_guess():
    data = request.json
    action = data["action"]
    team = game_state["current_turn"]

    if game_state["current_word"] is None:
        return jsonify({"error": "No word set. Start a new game or get a new word."}), 400

    if action == "correct":
        points = 20 if game_state["current_turn"] == team else 5
        if team == 1:
            game_state["team_1_score"] += points
        else:
            game_state["team_2_score"] += points

        # Switch to the other team's turn for the next round
        game_state["current_turn"] = 2 if team == 1 else 1

    elif action == "wrong" or action == "pass":
        # Switch to the other team's turn
        game_state["current_turn"] = 2 if team == 1 else 1

    game_state["rounds_left"] -= 1

    if game_state["rounds_left"] <= 0:
        winner = 1 if game_state["team_1_score"] > game_state["team_2_score"] else 2
        return jsonify({
            "game_over": True,
            "winner": winner,
            "team_1_score": game_state["team_1_score"],
            "team_2_score": game_state["team_2_score"]
        })

    # Update word and description for every round
    game_state["current_word"], description, game_state["current_hint"] = get_random_word()

    return jsonify({
        "word_description": description,
        "letters": len(game_state["current_word"]),
        "team_1_score": game_state["team_1_score"],
        "team_2_score": game_state["team_2_score"],
        "current_turn": game_state["current_turn"],
        "rounds_left": game_state["rounds_left"]
    })






@app.route('/get_hint', methods=['GET'])
def get_hint():
    return jsonify({"hint": game_state["current_hint"]})

@app.route('/next_round', methods=['POST'])
def next_round():
    if game_state["rounds_left"] > 0:
        game_state["current_word"], description, game_state["current_hint"] = get_random_word()
        game_state["rounds_left"] -= 1
        return jsonify({
            "word_description": description,
            "letters": len(game_state["current_word"]),
            "current_hint": game_state["current_hint"],
            "team_1_score": game_state["team_1_score"],
            "team_2_score": game_state["team_2_score"],
            "current_turn": game_state["current_turn"],
            "rounds_left": game_state["rounds_left"]
        })
    return jsonify({"error": "No rounds left. Start a new game."}), 400

