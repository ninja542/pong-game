
// calls the callback at about 60 times per second.
// kinda like setTimeout, but computer optimizes it.
var animate = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function(callback){
		window.setTimeout(callback, 1000/60);
	};

var paddlespeed = 8;
// create the canvas
var canvas = document.createElement('canvas');
var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var player = new Player(580);
// var computer = new Computer();
var player2 = new Player(10);
var ball = new Ball(200, 300);
var keysDown = [];

// render function
var render = function(){
	context.clearRect(0, 0, width, height);
	context.beginPath();
	// context.fillStyle = "#F0F";
	// context.fillRect(0, 0, width, height);
	context.fillStyle = "#FFF";
	context.fillRect(0, height/2, width, 2);
	player.render();
	player2.render();
	// computer.render();
	ball.render();
};

// update function
var update = function(){
	player.update();
	// computer.update(ball);
	player2.update(65, 68);
	// ball.update(player.paddle, computer.paddle);
	ball.update(player.paddle, player2.paddle);
};

// step function, which then calls itself again in a loop.
var step = function(){
	update();
	render();
	animate(step);
};

function Paddle(x, y, width, height){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.x_speed = 0;
	this.y_speed = 0;
}

Paddle.prototype.render = function(){
	context.beginPath();
	context.fillStyle = "FFF";
	context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function(x, y){
	this.x += x;
	this.y += y;
	this.x_speed = x;
	this.y_speed = y;
	if (this.x < 0){
		this.x = 0;
		this.x_speed = 0;
	}
	else if (this.x + this.width > width){
		this.x = 400 - this.width;
		this.x_speed = 0;
	}
};

function Computer() {
	this.paddle = new Paddle(175, 10, 50, 10);
}

Computer.prototype.render = function(){
	this.paddle.render();
};

Computer.prototype.update = function(ball){
	var ball_xpos = ball.x;
	var diff = -((this.paddle.x + (this.paddle.width/2)) - ball_xpos);
	if (diff < -4){ // max speed left
		diff = -5;
	}
	else if (diff > 4){ // max speed right
		diff = 5;
	}
	this.paddle.move(diff, 0);
	if(this.paddle.x < 0){
		this.paddle.x = 0;
	}
	else if(this.paddle.x + this.paddle.width > width){
		this.paddle.x = width - this.paddle.width;
	}
};

function Player(y) {
	this.paddle = new Paddle(175, y, 50, 10);
}

Player.prototype.render = function(){
	this.paddle.render();
};

Player.prototype.update = function(left = 37, right = 39){
	for(var key in keysDown){
		if(key == left){ // left arrow
			this.paddle.move(-paddlespeed, 0);
		}
		else if(key == right){ // right arrow
			this.paddle.move(paddlespeed, 0);
		}
		else {
			this.paddle.move(0, 0);
		}
	}
};

function Ball(x, y){
	this.x = x;
	this.y = y;
	this.x_speed = 0;
	this.y_speed = 3;
	this.radius = 5;
}

Ball.prototype.render = function(){
	context.beginPath();
	context.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
	context.fillStyle = "#FFF";
	context.fill();
};

Ball.prototype.update = function(paddle1, paddle2){
	this.x += this.x_speed;
	this.y += this.y_speed;
	var left = this.x - this.radius;
	var top = this.y - this.radius;
	var right = this.x + this.radius;
	var bottom = this.y + this.radius;
	if (left < 0){ // hitting left wall
		this.x = this.radius;
		this.x_speed = -this.x_speed;
	}
	else if (right > width){ // hitting right wall
		this.x = width - this.radius;
		this.x_speed = -this.x_speed;
	}
	if (this.y < 0 || this.y > 600){
		this.x_speed = 0;
		this.y_speed = 3;
		this.x = 200;
		this.y = 300;
	}
	if (top > 300) {
		if (top < (paddle1.y + paddle1.height) &&
			bottom > paddle1.y &&
			left < (paddle1.x + paddle1.width) &&
			right > paddle1.x){
			// hit the player's paddle
			this.y_speed = -this.y_speed - 2;
			this.x_speed += (paddle1.x_speed / 2);
			this.y += this.y_speed;
		}
	}
	else {
		if (top < (paddle2.y + paddle2.height) &&
			bottom > paddle2.y &&
			left < (paddle2.x + paddle2.width) &&
			right > paddle2.x){
			this.y_speed = -this.y_speed + 2;
			this.x_speed += (paddle2.x_speed / 2);
			this.y += this.y_speed;
		}
	}
};

// controls
window.addEventListener("keydown", function(event){
	keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event){
	delete keysDown[event.keyCode];
});

// when webpage is loaded, attach canvas to it. Also calls the step function to animate it.
window.onload = function(){
	document.body.appendChild(canvas).setAttribute("id", "game");
	animate(step);
};
