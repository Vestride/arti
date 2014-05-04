
float xPos;
float yPos;
boolean drawed=false;
int hexSize = 4;
int space = (hexSize*2);


void setup()
{
  size(3500, 105);
  background(51);
  smooth(); 
  xPos = 0;
  yPos = height;



  fill(40);
  noStroke();
  backgrHex();
}

void draw() {
  if (drawed==false) {
    fill(30);
    noStroke();
    createHex();
    drawed=true;
    //println("widthXheight"+width+"X"+height);
    //println("number of hexes per width:::"+width/hexSize);
    //println("number of hexes per height:::"+height/hexSize);
  }
  else {
  }
}

void keyPressed() {
  switch (key) {
  case 'r':
    reset(); 
    break;
  }
}

void reset() {
  if (drawed) {
    fill(30);
    noStroke();
    createHex();
    drawed=true;
    //println("widthXheight"+width+"X"+height);
    //println("number of hexes per width:::"+width/hexSize);
    //println("number of hexes per height:::"+height/hexSize);
  }
  else {
  }
}

void createHex() {
  float myHeight;

  for (int i = 0; i<(width/hexSize); i++) {

    myHeight = int(random(5, 13));

    for (int j = 0; j<myHeight; j++) {

      float hexX=(hexSize*2)*i;
      float hexY;
      if (i%2==1) { 
        hexY=(hexSize*2)*j;
      }
      else {
        hexY=(hexSize*2)*j+hexSize;
      }

      hexY=(height)-hexY;

      polygon(6, hexX, hexY, hexSize);
    }
  }
}

void backgrHex() {
  float myHeight;

  for (int i = 0; i<(width/hexSize); i++) {

    myHeight = int(20);

    for (int j = 0; j<myHeight; j++) {

      float hexX=(hexSize*2)*i; //diameter * i 
      float hexY;
      if (i%2==1) { 
        hexY=(hexSize*2)*j;
      }
      else {
        hexY=(hexSize*2)*j+hexSize;
      }

      hexY=(height)-hexY;

      polygon(6, hexX, hexY, hexSize);
    }
  }
}


void polygon(int n, float cx, float cy, float r)
{
  float angle = 360.0 / n;

  beginShape();
  for (int i = 0; i < n; i++)
  {
    vertex(cx + r * cos(radians(angle * i)), 
    cy + r * sin(radians(angle * i)));
  }
  endShape(CLOSE);
}

