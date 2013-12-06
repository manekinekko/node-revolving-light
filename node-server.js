var s = require('serialport');
var fs = require('fs');
var express = require('express');
 
var port   = '/dev/cu.usbmodem1411';
var portWindows   = '\\COM4';
var serial = null;
var value  = 0x00;
var intervalToggle = null;
var intervalFade = null;
var lightOn = false;
var color = {r:0, g:0, b:0};

function sendValue(c){
	c.r = c.r || '0';
	c.g = c.g || '0';
	c.b = c.b || '0';
	console.log(c);
  serial.write([c.r, c.g, c.b].join(',')+'\n');
}

function turnOn(){	
  lightOn = true;
  sendValue(color);
}
 
function turnOff(){
  lightOn = false;
  sendValue({
  	r:0,
  	g:0,
  	b:0
  });
}
 
function toggle(){
  if (lightOn) turnOff();
  else turnOn();
}

function fade(){
	if(lightOn) fadeOut();
	else fadeIn();
}

function fadeOut(){
	var c = color || {r:255};
	var t = setInterval(function(){
		sendValue(c);
		c.r--; if(c.r < 0) c.r = 0;
		c.g--; if(c.g < 0) c.g = 0;
		c.b--; if(c.b < 0) c.b = 0;
		if(c.r < 0 && c.g < 0 && c.b < 0){
			lightOn = false;
			clearInterval(t);
		}
	}, 10);
}

function fadeIn(){
	var c = color || {r:0};
	var t = setInterval(function(){
		sendValue(c);
		c.r++; if(c.r > 255) c.r = 255;
		c.g++; if(c.g > 255) c.g = 255;
		c.b++; if(c.b > 255) c.b = 255;
		if(c.r > 255 && c.b > 255 && c.g > 255){
			lightOn = true;
			clearInterval(t);
		}
	}, 10);
}

var app = express();
 
app.get('/', function(req, res){
  res.sendfile('index.html');
});
 
app.get('/on', function(req, res){
  clearInterval(intervalToggle);
  clearInterval(intervalFade);
  turnOn();
  res.end();
});
 
app.get('/off', function(req, res){
  clearInterval(intervalToggle);
  clearInterval(intervalFade);
  turnOff();
  res.end();
});
 
app.get('/blink', function(req, res){
  clearInterval(intervalToggle);
  clearInterval(intervalFade);
  intervalToggle = setInterval(toggle, 500);
  res.end();
});
 
app.get('/blink', function(req, res){
  clearInterval(intervalToggle);
  clearInterval(intervalFade);
  intervalToggle = setInterval(toggle, 500);
  res.end();
});

app.get('/fade', function(req, res){
  clearInterval(intervalToggle);
  clearInterval(intervalFade);
  intervalFade = setInterval(fade, 3000);
  res.end();
});

app.get('/color/:color', function(req, res){
	var c = req.params.color.split(',');
	color.r = +c[0];
	color.g = +c[1];
	color.b = +c[2];
	console.log(req.params.color, c, color);
	if(lightOn) turnOn();
	res.end();
});

console.log("Starting...");
fs.stat('D:/', function(err, stats){

	if (err){
	    console.log("Couldn't stat #{port}");
	    console.log(err, stats);
	    process.exit();
	}
  	console.log("Started.");

  	serial = new s.SerialPort(portWindows, {baudrate: 9600});
	app.listen(8888);
});