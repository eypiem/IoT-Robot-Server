import json


class User:
    def __init__(self, name, id, socket):
        self.name = name
        self.id = id
        self.socket = socket

    def dict(self):
        return {
            'name': self.name,
            'id': self.id
        }

    @staticmethod
    def parse(user_json):
        user_obj = json.loads(user_json)
        return User(user_obj['name'], user_obj['id'])
