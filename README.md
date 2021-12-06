# IoT-Robot-Server

The goal of this project was to create an online platform in which users can find and connect to their robots from anywhere. The user can monitor the status, sensors data, and also send live commands to their robots.

The server uses Flask and operates on a Linux system. It employs WebSocket and TCP connections to establish a live, two-way stream of data between the web browser and the robot.

## Deployment

Firstly, create a virtual environment and install the required packages:

```bash
python3 -m venv my_venv
source my_venv/bin/activate
pip install -r requirements.txt
```

Then, run the server:
```bash
export FLASK_ENV=development
flask run
```

## Configuration


### In `app.py`:

You can change the TCP server and WebSocket server ports:
```python
class TCPServerThread(threading.Thread):
    PORT = 7070
```
```python
class WebsocketsThread(threading.Thread):
    PORT = 7071
```
## Communication format

The server and the robot communicate with each other using JSON commands. You can create new commands by assigning a new `type` and adding your required parameters. (Note that new commands should also be added in the [robot side](https://github.com/AmirParsaMahdian/IoT-Robot-Client).)

### Existing command types:

#### `self_info`:
From the robot to the server. To declare the availability of the robot.
```javascript
{
    type: "self_info"
    data: {
        name: "Robot X",
        id: "1as6df"
    }
}
```

#### `robots`:
From the browser to the server. To get a list of available robots.
```javascript
{
    type: "robots"
    data: {
        robots: [
            {
                name: "Robot X",
                id: "1as6df"
            },
            ...
        ]
    }
}
```

#### `conn_req`:
From the browser to the server. To start a connection.
```javascript
{
    type: "conn_req"
    data: {
        id: "1as6df"
    }
}
```

#### `disconn_req`:
From the browser to the server. To end a connection.
```javascript
{
    type: "disconn_req"
    data: {
        id: "1as6df"
    }
}
```

#### `msg`:
Between the browser and the robot. To send a text message.
```javascript
{
    type: "msg"
    data: {
        data: "Hello world."
    }
}
```

#### `com_led`:
From the browser to the robot. To change the LED status.
```javascript
{
    type: "com_led"
    data: {
        state: True
    }
}
```

#### `com_buzzer`:
From the browser to the robot. To change the buzzer status.
```javascript
{
    type: "com_buzzer"
    data: {
        state: False
    }
}
```

#### `com_motor`:
From the browser to the robot. To control the motors.
```javascript
{
    "type": "com_motor"
    "data": {
        "m1": {
            "dir": "CW",
            "spd": 20
        }
    }
}
```

#### `orientation_data`:
From the robot to the browser. To send accelerometer data.
```javascript
{
    "type": "orientation_data"
    "data": {
        "pitch": 45,
        "roll": 60,
    }
}
```

#### `climate_data`:
From the robot to the browser. To send climate sensor data.
```javascript
{
    "type": "climate_data"
    "data": {
        "temperature": 27,
        "pressure": 86000,
    }
}
```

## Possible improvements

- Add authetication before connecting to robot.
- Add voice and video transmition capability.
- Estabilish direct connection from robot to browser for reduced latancy and server load (ex. WebRTC).
## Authors

- [@AmirParsaMahdian](https://www.github.com/AmirParsaMahdian)


## License

[MIT](https://choosealicense.com/licenses/mit/)
