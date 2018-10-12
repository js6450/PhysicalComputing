function setup(){
    createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw(){
    background(0);

    push();
    translate(0, height / 4);
    rotateY(frameCount * 0.01);
    sphere(50);
    pop();

    push();
    translate(0, - height / 4);
    rotateY(frameCount * 0.01);
    sphere(50);
    pop();

    push();
    translate(- height / 4, 0);
    rotateX(frameCount * 0.01);
    sphere(50);
    pop();

    push();
    translate(height / 4, 0);
    rotateX(frameCount * 0.01);
    sphere(50);
    pop();
}