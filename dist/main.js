"use strict";
var gra = 0.2;
var damp = 0.7;
var colors = ['blue', 'yellow', 'red', 'green', 'purple', 'orange', 'grey', 'brown'];
var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
document.body.style.display = 'flex';
document.body.style.justifyContent = 'center';
document.body.style.alignItems = 'center';
document.body.style.height = '95vh';
canvas.width = 650;
canvas.height = 650;
canvas.style.border = '1px solid black';
var context = canvas.getContext('2d');
var circles = [];
var draggedCircle = null;
var prevMousePosition = null;
var getRandomNumber = function () {
    return Math.floor(Math.random() * colors.length);
};
var handleCanvasClick = function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var circle = circles.find(function (circle) { return Math.hypot(circle.x - x, circle.y - y) < circle.sharav; });
    if (!circle) {
        var newCircle = {
            x: x,
            y: y,
            sharav: 20, speedX: 0, speedY: 0, hold: false, qash: 4, color: colors[getRandomNumber()]
        };
        circles.push(newCircle);
    }
};
var handleMouseDown = function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var circle = circles.find(function (circle) { return Math.hypot(circle.x - x, circle.y - y) < circle.sharav; });
    if (circle) {
        circle.hold = true;
        draggedCircle = circle;
        prevMousePosition = { x: x, y: y };
    }
};
var handleMouseMove = function (event) {
    if (draggedCircle) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        draggedCircle.x = x;
        draggedCircle.y = y;
    }
};
var handleMouseUp = function (event) {
    if (draggedCircle && prevMousePosition) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var deltaX = x - prevMousePosition.x;
        var deltaY = y - prevMousePosition.y;
        var time = 100;
        draggedCircle.speedX = deltaX / time;
        draggedCircle.speedY = deltaY / time;
        draggedCircle.hold = false;
        draggedCircle = null;
        prevMousePosition = null;
    }
};
var drawCircle = function (circle, context) {
    context.beginPath();
    context.arc(circle.x, circle.y, circle.sharav, 0, Math.PI * 2);
    context.fillStyle = circle.color;
    context.fill();
    context.stroke();
};
var checkCollisions = function () {
    for (var i = 0; i < circles.length; i++) {
        for (var j = i + 1; j < circles.length; j++) {
            var circle1 = circles[i];
            var circle2 = circles[j];
            var speedX = circle2.x - circle1.x;
            var speedY = circle2.y - circle1.y;
            var distance = Math.hypot(speedX, speedY);
            if (distance <= circle1.sharav + circle2.sharav) {
                var nx = speedX / distance;
                var ny = speedY / distance;
                var tx = -ny;
                var ty = nx;
                var dpTan1 = circle1.speedX * tx + circle1.speedY * ty;
                var dpTan2 = circle2.speedX * tx + circle2.speedY * ty;
                var dpNorm1 = circle1.speedX * nx + circle1.speedY * ny;
                var dpNorm2 = circle2.speedX * nx + circle2.speedY * ny;
                var m1 = (dpNorm1 * (circle1.qash - circle2.qash) + 2 * circle2.qash * dpNorm2) / (circle1.qash + circle2.qash);
                var m2 = (dpNorm2 * (circle2.qash - circle1.qash) + 2 * circle1.qash * dpNorm1) / (circle1.qash + circle2.qash);
                circle1.speedX = tx * dpTan1 + nx * m1;
                circle1.speedY = ty * dpTan1 + ny * m1;
                circle2.speedX = tx * dpTan2 + nx * m2;
                circle2.speedY = ty * dpTan2 + ny * m2;
                var overlap = 0.5 * (circle1.sharav + circle2.sharav - distance + 1);
                circle1.x -= overlap * nx;
                circle1.y -= overlap * ny;
                circle2.x += overlap * nx;
                circle2.y += overlap * ny;
            }
        }
    }
};
var updateCircles = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(function (circle) {
        if (!circle.hold) {
            circle.speedY += gra * circle.qash;
            circle.x += circle.speedX;
            circle.y += circle.speedY;
            if (circle.x - circle.sharav < 0) {
                circle.x = circle.sharav;
                circle.speedX *= -(damp * 0.7);
            }
            else if (circle.x + circle.sharav > canvas.width) {
                circle.x = canvas.width - circle.sharav;
                circle.speedX *= -damp;
            }
            if (circle.y - circle.sharav <= 0) {
                circle.y = circle.sharav;
                circle.speedY *= -damp;
            }
            if (circle.y + circle.sharav > canvas.height) {
                circle.y = canvas.height - circle.sharav;
                circle.speedY *= -damp;
            }
        }
        drawCircle(circle, context);
    });
    checkCollisions();
    if (prevMousePosition) {
        var deltaX = circles[0].x - prevMousePosition.x;
        var deltaY = circles[0].y - prevMousePosition.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        var speed = distance / 5;
        console.log('Mouse Speed:', speed);
    }
    requestAnimationFrame(updateCircles);
};
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseleave', handleMouseUp);
updateCircles();
