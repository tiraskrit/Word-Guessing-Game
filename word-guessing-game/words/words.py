# import json
# import random

# words = [
#     {"word": "python", "description": "A type of large snake", "hint": "Programming language"},
#     {"word": "java", "description": "An island of Indonesia", "hint": "Programming language"},
#     {"word": "aapython", "description": "aaA type of large snake", "hint": "aaProgramming language"},
#     {"word": "aajava", "description": "aaAn island of Indonesia", "hint": "aaProgramming language"},
#     {"word": "bbpython", "description": "bbA type of large snake", "hint": "bbProgramming language"},
#     {"word": "bbjava", "description": "bbAn island of Indonesia", "hint": "bbProgramming language"},
#     {"word": "ccpython", "description": "ccA type of large snake", "hint": "ccProgramming language"},
#     {"word": "ccjava", "description": "ccAn island of Indonesia", "hint": "ccProgramming language"},
#     {"word": "ddpython", "description": "ddA type of large snake", "hint": "ddProgramming language"},
#     {"word": "ddjava", "description": "ddAn island of Indonesia", "hint": "ddProgramming language"},
#     # Add more words here
# ]

# def get_random_word():
#     word_entry = random.choice(words)
#     return word_entry["word"], word_entry["description"], word_entry["hint"]


import json
import random

def load_words_from_json(json_file):
    with open(json_file, 'r') as file:
        data = json.load(file)
    words = []
    for item in data:
        word = item[0]
        description = item[1]['definitions'][0]['definition'] if 'definitions' in item[1] else ""
        hint = item[1]['definitions'][0]['synonyms'][0] if 'definitions' in item[1] and 'synonyms' in item[1]['definitions'][0] else ""
        words.append({"word": word, "description": description, "hint": hint})
    return words

words = load_words_from_json('words/top_1000_words.json')

def get_random_word():
    word_entry = random.choice(words)
    return word_entry["word"], word_entry["description"], word_entry["hint"]