particle[] Z;
particle[] K;
particle[] Q;
particle[] V;
boolean tracer = true;
int depth;
//float colour = random(1);
int iterations = 300;
int cycles = 0;
int numMoves;

void setup() {
  noLoop();
  size(520, 770, P2D);
  background(0);
}

void ready() {
  console.log("Processing > ready()");
  Z = new particle[artifactData.wingspan/20];
  K = new particle[artifactData.wingspan/10];
  Q = new particle[artifactData.wingspan/20];
  V = new particle[artifactData.wingspan/10];
  smooth();
  noLoop();
  depth = width;
  colorMode(HSB, 360, 100, 100, 1);
  colors = new color[5];
  
  //console.log("Z: " + Z + ", K: " + K + ", depth: " + depth);
  artsakh = new color[5];
  artsakh[0] = color(216, 52, 17);//darkest
  artsakh[1] = color(190, 38, 25, .5);
  artsakh[2] = color(87, 32, 54, .5);
  artsakh[3] = color(151, 28, 36, 1);//base
  artsakh[4] = color(52, 50, 80, .5);//lightest

sandy = new color[5];
sandy[0] = color(163, 11, 87);
sandy[1] = color(193, 33, 85, .5);
sandy[2] = color(36, 37, 95, .5);
sandy[3] = color(16, 56, 85, 1);
sandy[4] = color(12, 72, 92, .5);

royalwe = new color[5];
royalwe[0] = color(22, 62, 91);
royalwe[1] = color(11, 63, 83, .5);
royalwe[2] = color(6, 65, 74, .5);
royalwe[3] = color(348, 60, 61, 1);
royalwe[4] = color(312, 58, 44, .5);
  frameRate(25);
  
  numMoves = ceil(abs(artifactData.bbox/10));
  console.log(numMoves);
  float n = 100;
  float px, py, pz;
  float m, v, theta, phi;
  
  for(int k = 0; k < n; k++) {
    px = random(width);
    py = random(height);
    pz = random(depth);
    m = random(50);
    
    
    for (int i = int((Z.length)*k/n); i < int((Z.length)*(k+1)/n); i++) {
      v = sq(random(sqrt(m)));
      theta = random(TWO_PI);
      phi = random(TWO_PI);
      //console.log(artifactData.wingspan);
    float r = (600/(i+1))*((k+1)/10000);
      //console.log(r);
        if ( r < 0.5 ) {
          Z[i]= new particle( (1-2*r)*width, 2*r*height + artifactData.head, 2*r*depth, 0, 0, 0, 1 );
          K[i]= new particle( (width-(1-2*r)*width), 2*r*height + artifactData.head, 2*r*depth, 0, 0, 0, 1 );
          Q[i]= new particle( (1-2*r)*width, 2*r*height, 2*r*depth, 0, 0, 0, 1 );
          V[i]= new particle( (width-((1-2*r)*width)), 2*r*height, 2*r*depth, 0, 0, 0, 1 );
        }
        else {
          Z[i]= new particle( (1-(2*r-1))*width, (1-(2*r-1))*height, (2*r-1)*depth, 0, 0, 0, 1 );
          K[i]= new particle( (width-(1-(2*r-1))*width), (1-(2*r-1))*height, (2*r-1)*depth, 0, 0, 0, 1 );
          Q[i]= new particle( (1-(2*r-1))*width + artifactData.head, (1-(2*r-1))*height, (2*r-1)*depth, 0, 0, 0, 1 );
          V[i]= new particle( (width-((1-(2*r-1))*width + artifactData.head)), (1-(2*r-1))*height, (2*r-1)*depth, 0, 0, 0, 1 );
        }
    }
  }
  frameRate(60);
  loop();
}

void replay() {
  background(0);
  iterations = 300;
  ready();
}

void draw() {
  //println("drawing");
  if (artifactData == null) {
    return;
  }
    if (iterations > 0) {
      render(); 
      iterations--;
    }else{
    
    }
  
}

void render(){
  colorMode(RGB, 255, 255, 255, 100);
  float r;
  
  if(cycles == 0){
    if ( !tracer ) {
      background(255);
    }
  }
  //console.log(numMoves);
  for (int i = 0; i < Z.length; i++) {
//    if ( Z[i].magnitude > 0.1 ) {
//        stroke(255);
//    }
//    else {
//    }
    
    //console.log(iterations+ ">"+ceil(400/numMoves));
    if (iterations%numMoves < 5) {
       //console.log("less than 5");
       Z[i].gravitate( new particle( artifactData.rhandX, artifactData.rhandY, depth/2, 0, 0, 0, 0.75 ) );
       K[i].gravitate( new particle( width-artifactData.rhandX, artifactData.rhandY, depth/2, 0, 0, 0, 0.75 ) );
       Q[i].gravitate( new particle( artifactData.lhandX, artifactData.lhandY+artifactData.torso, depth/2, 0, 0, 0, 0.75 ) );
       V[i].gravitate( new particle( width-artifactData.lhandX, artifactData.lhandY+artifactData.torso, depth/2, 0, 0, 0, 0.75 ) );
    }else if (iterations%numMoves < 15) {
       //console.log("less than 15");
       Z[i].gravitate( new particle( tan(artifactData.lhandX), artifactData.lhandY, depth/2, 0, 0, 0, 0.75 ) );
       K[i].gravitate( new particle( width-tan(artifactData.lhandX), artifactData.lhandY, depth/2, 0, 0, 0, 0.75 ) );
       Q[i].gravitate( new particle( artifactData.rhandX, artifactData.rhandY+artifactData.torso, depth/2, 0, 0, 0, 0.75 ) );
       V[i].gravitate( new particle( width-artifactData.rhandX, artifactData.rhandY+artifactData.torso, depth/2, 0, 0, 0, 0.75 ) );
    }else if(iterations%numMoves < 35){
       //console.log("less than 35");
       Z[i].repel( new particle( cos(artifactData.lhandX), artifactData.lhandY, depth/2, 0, 0, 0, 0.75 ) );
       K[i].repel( new particle( width-cos(artifactData.lhandX), artifactData.lhandY, depth/2, 0, 0, 0, 0.75 ) );
       Q[i].repel( new particle( artifactData.rhandX, artifactData.rhandY+artifactData.torso, depth/2, 0, 0, 0, 0.75 ) );
       V[i].repel( new particle( width-artifactData.rhandX, artifactData.rhandY+artifactData.torso, depth/2, 0, 0, 0, 0.75 ) );
    }else if(iterations%numMoves < 60){
      //console.log("less than 60");
      Z[i].gravitate( new particle(sin(artifactData.head), artifactData.height, depth/2, 0, 0, 0, 0.75 ) );
       K[i].gravitate( new particle( width-sin(artifactData.head), artifactData.height, depth/2, 0, 0, 0, 0.75 ) );
       Q[i].gravitate( new particle( artifactData.rhandX, artifactData.rhandY+artifactData.torso, depth/2, 0, 0, 0, 0.75 ) );
       V[i].gravitate( new particle( width-artifactData.rhandX, artifactData.rhandY+artifactData.torso, depth/2, 0, 0, 0, 0.75 ) );
    }
    else {
      Z[i].deteriorate();
      K[i].deteriorate();
      Q[i].deteriorate();
      V[i].deteriorate();
    }

    Z[i].update();
    K[i].update();
    Q[i].update();
    V[i].update();

    colorMode(HSB, 360, 100, 100, 1);

    //stroke(40);
   //colorMode(HSB,1);
  
   fill(royalwe[0]);
    Z[i].display();
   fill(royalwe[1]);
    K[i].display();
   fill(royalwe[2]);
    Q[i].display();
   fill(royalwe[3]);
    V[i].display();

    r = float(i)/Z.length;
    //dividing the magnitude increases the threshold for color. higher the threshold, less white or black and more color
//    if ( Z[i].magnitude > 0.1 ) {
//        stroke(255);
//        background(0,.5);
//    }
//    else {
//    }
      //stroke(40);
      if(i != Z.length - 1){
        //stroke(255);
           line(Z[i].x, Z[i].y, Z[i+1].x, Z[i+1].y);
           line(K[i].x, K[i].y, K[i+1].x, K[i+1].y);
      }
  }
}
void mousePressed() {
  if (mouseButton == RIGHT) {
    noLoop();
  } 
  else {
    loop();
  }
}

void keyPressed() {

  if ( key == ENTER ) {
    tracer = !tracer;
  }
}
