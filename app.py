from flask import Flask, render_template
import asyncio
import websockets
import socket
import threading
import json
from models.user import User
from models.robot import Robot
from models.conn_pair import ConnPair

app = Flask(__name__)


robots = list()
users = list()
conn_pairs = list()


class TCPServerThread(threading.Thread):
    IP = ''
    PORT = 7070
    BUFFER_SIZE = 255
    s = None

    def __init__(self):
        threading.Thread.__init__(self, daemon=True)

    def run(self):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as self.s:
            print("TCPServer running")
            self.s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.s.bind((self.IP, self.PORT))
            self.s.listen()
            self.s.setblocking(False)
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self.run_server())

    async def run_server(self):
        print('run_server(): called')
        while True:
            loop = asyncio.get_event_loop()
            client, addr = await loop.sock_accept(self.s)
            loop.create_task(self.handle_client(client))

    async def handle_client(self, client):
        print('handle_client(): called')
        greet = "Welcome to the Socc.\n"
        message_obj = {'type': 'msg', 'data': {'data': greet}}
        self.send(client, message_obj)
        while True:
            try:
                loop = asyncio.get_event_loop()
                req_json = (await loop.sock_recv(client, self.BUFFER_SIZE)).decode('utf8')
                req_json = req_json[1:-1]
                reqs_json = req_json.split('}{')
                for req in reqs_json:
                    req = '{' + req + '}'
                    await self.handle_req(client, req)
            except:
                await self.disconnect(client)
                break

    async def disconnect(self, client):
        robot = next(e for e in robots if e.socket == client)
        robots.remove(robot)
        try:
            conn_pair = next(e for e in conn_pairs if e.robot == robot)
            conn_pairs.remove(conn_pair)
        except:
            pass
        client.close()
        print('Robot disconnected.')
        await refresh_robots_for_users()

    async def handle_req(self, client, req_json):
        # print(req_json)
        try:
            req = json.loads(req_json)
        except:
            return
        req_type = req['type']
        req_data = req['data']

        if req_type == 'self_info':
            robots.append(Robot(req_data['name'], req_data['id'], client))
            await refresh_robots_for_users()
        else:
            try:
                user = next(e.user for e in conn_pairs if e.robot.socket == client)
                await WebsocketsThread.send(user.socket, req_json)
            except:
                # print('Robot is not connected to any user')
                pass

    @staticmethod
    def send(client, msg):
        client.sendall(json.dumps(msg).encode('utf-8'))


class WebsocketsThread(threading.Thread):
    IP = ''
    PORT = 7071

    def __init__(self):
        threading.Thread.__init__(self, daemon=True)

    def run(self):
        print("WebSocket running")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        start_server = websockets.serve(self.handle_client, self.IP, self.PORT)
        loop.run_until_complete(start_server)
        loop.run_forever()

    async def handle_client(self, client, path):
        users.append(User('name', 'id', client))
        await self.send(client, 'Welcome to the Websocc')
        await refresh_robots_for_user(client)
        while True:
            try:
                req = await client.recv()
                if req == 'quit':
                    break
                await self.handle_req(client, req)
            except:
                await self.disconnect(client)
                break

    async def disconnect(self, client):
        user = next(e for e in users if e.socket == client)
        users.remove(user)
        try:
            conn_pair = next(e for e in conn_pairs if e.users == user)
            conn_pairs.remove(conn_pair)
        except:
            pass
        await client.close()
        print('User disconnected.')

    async def handle_req(self, client, req_json):
        print(req_json)
        req = json.loads(req_json)
        req_type = req['type']
        req_data = req['data']

        if req_type == 'conn_req':
            user = next(e for e in users if e.socket == client)
            robot = next(e for e in robots if e.id == req_data['id'])
            conn_pairs.append(ConnPair(user, robot))
        elif req_type == 'disconn_req':
            conn_pair = next(e for e in conn_pairs if e.user.socket == client)
            conn_pairs.remove(conn_pair)
        else:
            try:
                robot = next(e.robot for e in conn_pairs if e.user.socket == client)
                TCPServerThread.send(robot.socket, req)
            except:
                print('User is not connected to any robot')
                pass

    @staticmethod
    async def send(client, msg):
        await client.send(msg)


async def refresh_robots_for_users():
    print('refresh_robots_for_clients(): called')
    robots_json = {'type': 'robots', 'data': [e.dict() for e in robots]}
    for user in users:
        await WebsocketsThread.send(user.socket, json.dumps(robots_json))


async def refresh_robots_for_user(user_socket):
    print('refresh_robots_for_client(): called')
    robots_json = {'type': 'robots', 'data': [e.dict() for e in robots]}
    await WebsocketsThread.send(user_socket, json.dumps(robots_json))


@app.route('/')
def hello():
    return render_template('index.html')


def main():
    tcp_thread = TCPServerThread()
    tcp_thread.start()

    websockets_thread = WebsocketsThread()
    websockets_thread.start()

    app.run('0.0.0.0')


if __name__ == '__main__':
    main()
