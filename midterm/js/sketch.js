let serial;
let portName = "/dev/cu.usbmodem14111";
let ipAddr = "10.17.99.119";

let values = [];

let img;
let heads = [];
let headIndex;
let particles = [];

let xMin, xMax, yMin, yMax;
let imgWidth;

let xWind, yWind;
let windMax = 5;

let fMag = 0.4;

let escape = false;
let escapeAttempt = 0;
let escapeX, escapeY;
let escapeTime = 0;
let escapeDuration = 6000;

function preload(){
    img = loadImage("assets/img/jiwon.png");
    // for(let i = 0; i < 3; i++){
    //     heads[i] = loadImage("assets/img/" + i + ".png");
    // }
}

function setup(){
    // serial = new p5.SerialPort(ipAddr);
    //
    // serial.on('list', printList);
    // serial.on('connected', serverConnected);
    // serial.on('open', portOpen);
    // serial.on('data', serialEvent);
    // serial.on('error', serialError);
    // serial.on('close', portClose);
    //
    // serial.open(portName);

    createCanvas(windowWidth, windowHeight);

    initParticles();

}

function draw(){
    background(0, 30);

    if(escape && millis() - escapeTime > escapeDuration){
        particles = [];
        initParticles();
        windX = windY = 0;
        escapeAttempt = 0;
        escape = false;
    }

    if(xWind * xWind < 0.01){
        xWind = 0;
    }else{
        //xWind -= -0.1
        xWind = lerp(xWind, 0, 0.1);
    }

    if(yWind * yWind < 0.01){
        yWind = 0;
    }else{
        yWind = lerp(yWind, 0, 0.1);
    }

    noStroke();
    push();
    for(let i = 0; i < particles.length; i++){
        let p = particles[i];

        p.applyForce(createVector(xWind, yWind));

        p.checkBoundaries();
        p.applyAttraction();

        let friction = p5.Vector.mult(p.vel, -1);
        friction.normalize();
        friction.mult(fMag);
        friction.limit(p.vel.mag());
        p.applyForce(friction);

        p.update();
        p.display();
    }
    pop();

    for(let i = particles.length - 1; i >= 0; i--){
        let p = particles[i];
        if(p.isDead){
            particles.splice(i, 1);
        }
    }

    // noFill();
    // stroke(255);
    //rect(xMin, yMin, imgWidth, imgWidth);

    if(frameCount % 120 == 0 && escapeAttempt > 0){
        escapeAttempt--;
    }

}

function mousePressed(){
    xWind = map(mouseX, 0, width, -windMax, windMax);
    yWind = map(mouseY, 0, height, -windMax, windMax);

    if(xWind * xWind > (windMax - 1) * (windMax - 1) || yWind * yWind > (windMax - 1) * (windMax - 1)){
        escapeAttempt++;

        console.log(escapeAttempt);

        if(escapeAttempt > 5){
            escapeX = mouseX;
            escapeY = mouseY;
            escape = true;
            escapeTime = millis();
            console.log("escape!");
        }
    }
}

function printList(ports){
    console.log(ports);
}

function serverConnected() {
    console.log('connected to server.');
}

function portOpen() {
    console.log('the serial port opened.')
}

function serialEvent() {
    let dataIn = serial.readLine();

    if(dataIn != ""){
        values = float(dataIn.split(","));
        console.log(values);
    }
}

function serialError(err) {
    console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
    console.log('The serial port closed.');
}

function initParticles(){

    //headIndex = int(random(heads.length));
    //img = heads[headIndex];

    img.loadPixels();

    for(let y = 0; y < img.height; y += 5){
        for(let x = 0; x < img.width; x += 5){
            let i = (y * img.width + x) * 4;

            let r = img.pixels[i];
            let g = img.pixels[i + 1];
            let b = img.pixels[i + 2];
            let a = int(random(50, 200));

            if(r > 0 && g > 0 && b > 0){
                let mappedX = map(x, 0, img.width, -height / 2, height / 2);
                let mappedY = map(y, 0, img.height, -height / 2, height / 2);
                particles.push(new Particle(x - img.width / 2 + width / 2, y - img.height / 2 + height / 2, r, g, b, a));
                //particles.push(new Particle(mappedX + width / 2, mappedY + height / 2, r, g, b, a));
            }

        }
    }

    xMin = width / 2 - img.width / 2 - 100;
    xMax = width / 2 + img.width / 2 + 100;
    yMin = height / 2 - img.height / 2 - 100;
    yMax = height / 2 + img.height / 2 + 100;

    // xMin = width / 2 - height / 2;
    // xMax = width / 2 + height / 2;
    // yMin = height / 2 - img.height / 2 - 100;
    // yMax = height / 2 + img.height / 2 + 100;
    //
    // imgWidth = height;

    xWind = 0;
    yWind = 0;
}

class Particle{

    constructor(x, y, r, g, b, a){
        this.initPos = createVector(x, y);
        this.pos = createVector(x, y);
        this.vel = createVector(random(0.01, 0.05), random(0.01, 0.05));
        this.acc = createVector(0, 0);
        this.aSpeed = random(0.01, 0.05);

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.currentA = 0;
        this.dia = int(random(5, 12));

        this.offset = random(1, 5);

        this.isDead = false;
    }

    applyForce(f){
        f.div(this.dia * 0.5);
        this.acc.add(f);
    }

    applyAttraction(){
        let f;
        if(!escape){
            f = p5.Vector.sub(this.initPos, this.pos);
        }else{
            f = p5.Vector.sub(createVector(escapeX, escapeY), this.pos);
        }
        f.normalize();
        this.acc.add(f);
    }

    update(){
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    display(){
        push();
        translate(this.pos.x, this.pos.y);
        //rotate(frameCount * this.aSpeed);

        if(this.currentA < this.a){
            this.currentA += 2;
        }

        fill(this.r, this.g, this.b, this.currentA);
        ellipse(this.offset, 0, this.dia, this.dia);
        noFill();
        pop();
    }

    checkBoundaries(){

        if(!escape){
            if(this.pos.x < xMin){
                this.pos.x = xMin;
                this.vel.x *= -1;
            }else if(this.pos.x > xMax){
                this.pos.x = xMax;
                this.vel.x *= -1;
            }

            if(this.pos.y < yMin){
                this.pos.y = yMin;
                this.vel.y *= -1;
            }else if(this.pos.y > yMax){
                this.pos.y = yMax;
                this.vel.y *= -1;
            }
        }else{
            if(this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0){
                this.isDead = true;
            }
        }

    }

}