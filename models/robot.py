import json


class Robot:
    def __init__(self, name, id, socket=None):
        self.name = name
        self.id = id
        self.socket = socket

    def dict(self):
        return {
            'name': self.name,
            'id': self.id
        }

    @staticmethod
    def parse(robot_json):
        robot_obj = json.loads(robot_json)
        return Robot(robot_obj['name'], robot_obj['id'])
