const joystickCtn = document.getElementById('joystick-ctn')
const canvas = document.getElementById('joystick-canvas');
const ctx = canvas.getContext('2d');

canvas.addEventListener('mousedown', startDrawing);
window.addEventListener('mouseup', stopDrawing);
window.addEventListener('mousemove', Draw);

canvas.addEventListener('touchstart', startDrawing);
window.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);
canvas.addEventListener('touchmove', Draw);
window.addEventListener('resize', resize);

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
    resize();
});

var width, height, radius, x_orig, y_orig;

function resize() {
    rect = joystickCtn.getBoundingClientRect();
    height = width = Math.min(rect.width, rect.height);
    radius = width / 5;
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    background();
    joystick(width / 2, height / 2);
}

function background() {
    x_orig = width / 2;
    y_orig = height / 2;

    ctx.beginPath();
    ctx.arc(x_orig, y_orig, radius + 20, 0, Math.PI * 2, true);
    ctx.fillStyle = '#ECE5E5';
    ctx.fill();
}

function joystick(width, height) {
    ctx.beginPath();
    ctx.arc(width, height, radius, 0, Math.PI * 2, true);
    ctx.fillStyle = '#F08080';
    ctx.fill();
    ctx.strokeStyle = '#F6ABAB';
    ctx.lineWidth = 8;
    ctx.stroke();
}

let coord = { x: 0, y: 0 };
let paint = false;

function getPosition(event) {
    const scroll = window.pageYOffset;
    console.log(scroll);
    const mouse_x = event.clientX || event.touches[0].clientX;
    const mouse_y = event.clientY || event.touches[0].clientY;
    coord.x = mouse_x - canvas.offsetLeft;
    coord.y = scroll + mouse_y - canvas.offsetTop;
}

function isInTheCircle() {
    const current_radius = Math.sqrt(Math.pow(coord.x - x_orig, 2) + Math.pow(coord.y - y_orig, 2));
    if (radius >= current_radius) return true
    else return false
}


function startDrawing(event) {
    paint = true;
    getPosition(event);
    if (isInTheCircle()) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background();
        joystick(coord.x, coord.y);
        Draw();
    }
}

function stopDrawing() {
    paint = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background();
    joystick(width / 2, height / 2);

    sendMotorData('CW', 0, 'CW', 0);
}

function Draw(event) {
    if (paint) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background();
        var angle_in_degrees,x, y, speed;
        var angle = -Math.atan2((coord.y - y_orig), (coord.x - x_orig));
        if (angle < 0) {
            angle += 2 * Math.PI;
        }

        angle_in_degrees = Math.round(angle * 180 / Math.PI);

        const current_radius = Math.sqrt(Math.pow(coord.x - x_orig, 2) + Math.pow(coord.y - y_orig, 2));
        const radius_ratio = current_radius / radius < 1 ? current_radius / radius : 1

        if (isInTheCircle()) {
            x = coord.x;
            y = coord.y;
            joystick(x, y);
        } else {
            x = radius * Math.cos(angle) + x_orig;
            y = -radius * Math.sin(angle) + y_orig;
            joystick(x, y);
        }

        getPosition(event);

        var x_relative = Math.round(x - x_orig);
        var y_relative = Math.round(y - y_orig);
        send(radius_ratio, angle)
    }
}

var lastSend = 0
function send(r, theta) {
    let leftMotor, rightMotor;
//    console.log(`theta: ${theta}`);

    if (theta <= Math.PI / 2) {
        rightMotor = -r + (1.27 * r) * theta;
        leftMotor = r;
    } else if (theta <= Math.PI) {
        rightMotor = r;
        leftMotor = r - (1.27 * r) * (theta - Math.PI / 2);
    } else if (theta <= 3 * Math.PI / 2) {
        rightMotor = r - (1.27 * r) * (theta - Math.PI);
        leftMotor = -r;
    } else if (theta <= 2 * Math.PI) {
        rightMotor = -r;
        leftMotor = -r + (1.27 * r) * (theta - 3 * Math.PI / 2);
    }

    const m1Dir = (leftMotor < 0) ? 'CW' : 'CCW';
    const m2Dir = (rightMotor > 0) ? 'CW' : 'CCW';
    const m1Spd = Math.round(Math.abs(100 * leftMotor));
    const m2Spd = Math.round(Math.abs(100 * rightMotor));

//    console.log(`m1Spd: ${m1Spd}`);
//    console.log(`m2Spd: ${m2Spd}`);

    if (Date.now() - lastSend > 50) {
        sendMotorData(m1Dir, m1Spd, m2Dir, m2Spd);
        lastSend = Date.now();
    }
 }

