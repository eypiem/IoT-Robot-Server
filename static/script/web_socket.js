var ws = new WebSocket("ws://127.0.0.1:7071/");
const messages = document.getElementById('messages');
const status = document.getElementById('status');
const robots = document.getElementById('robots');
const cude = document.getElementById('cube');

ws.onopen = function (event) {
    console.log('onopen');
    status.innerText = "Status: Connected";
};

ws.onclose = function (event) {
    console.log('onclose');
    status.innerText = "Status: Disconnected";
};

ws.onmessage = function (event) {
//    message = document.createElement('li');
//    content = document.createTextNode(event.data);
//    message.appendChild(content);
//    messages.appendChild(message);

    const dataObj = JSON.parse(event.data)
    console.log(dataObj);
    const type = dataObj.type
    const data = dataObj.data

    switch (type) {
        case 'robots':
            robots.innerHTML  = null;
            data.forEach((e) => {
                robot = document.createElement('div');
                robot.onclick = () => { connectToRobot(e.id); };
                robot.classList.add('robot-card');
                content = document.createTextNode(e.name);
                robot.appendChild(content);
                robots.appendChild(robot);
            });
            break;
        case 'orientation_data':
            cube.style.transform = `translateZ(-100px) rotateX(${data.roll}deg) rotateZ(${data.pitch}deg)`;
            break;
        case 'climate_data':
//            temperature.shift();
//            temperature.push(data.temperature)
            updateTemperatureChart(data.temperature);
//            pressure.shift(0);
//            pressure.push(data.temperature)
            updatePressureChart(data.pressure);
            break;
    }
};

function onSend() {
    const msg = document.getElementById('msg').value;
    req = {'type': 'msg', 'data':{'data': msg}}
    ws.send(JSON.stringify(req));
    document.getElementById('msg').value = null;
}

function onClose() {
    ws.close();
}

function connectToRobot(robotId) {
    req = {'type': 'conn_req', 'data':{'id': robotId}}
    ws.send(JSON.stringify(req));
}

function disconnectFromRobot() {
    req = {'type': 'disconn_req'}
    ws.send(JSON.stringify(req));
}

var lightState = false
function switchLight() {
    lightState = !lightState
    req = {'type': 'com_led', 'data': {'state': lightState}}
    ws.send(JSON.stringify(req));
}

var soundState = false
function switchSound() {
    soundState = !soundState
    req = {'type': 'com_buzzer', 'data': {'state': soundState}}
    ws.send(JSON.stringify(req));
}

function sendMotorData(m1Dir, m1Spd, m2Dir, m2Spd) {
    req = {'type': 'com_motor', 'data': {'m1': {'dir': m1Dir, 'spd': m1Spd}, 'm2': {'dir': m2Dir, 'spd': m2Spd}}}
    ws.send(JSON.stringify(req));
}
