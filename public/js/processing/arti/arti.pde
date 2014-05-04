int axisX;

Layer[] layers;

Palette palette;

color[] colors;

void setup() {
  noLoop();
  size(520, 770);
  smooth();
  background(0);
  frameRate(60);
  noFill();
  colorMode(RGB, 255, 255, 255, 100);
  axisX = width / 2;
  
  palette = new Palette();
}


void ready() {
  console.log("Ready in processing");
  // First layer
  int liness = 40;
  int spacing = 10;
  int pointss = 30;
  int x1 = axisX;
  int y1 = artifactData.wingspan / 10;
  int cy = artifactData.arm / 2;
  int x2 = axisX;
  int y2 = artifactData.height;
  boolean gravity = true;
  Layer layer_one = new Layer(liness, spacing, pointss, x1, y1, cy, x2, y2, gravity);
  
  // Second layer
  liness = 20;
  spacing = 30;
  pointss = 15;
  x1 = axisX;
  y1 = artifactData.arm;
  cy = 240;
  x2 = axisX;
  y2 = artifactData.height * 2;
  gravity = false;
  Layer layer_two = new Layer(liness, spacing, pointss, x1, y1, cy, x2, y2, gravity);
  
  // Third layer
  liness = 30;
  spacing = 10;
  pointss = 20;
  x1 = axisX;
  y1 = artifactData.wingspan;
  cy = 300;
  x2 = axisX;
  y2 = round(artifactData.wingspan * 1.5);
  gravity = true;;
  Layer layer_three = new Layer(liness, spacing, pointss, x1, y1, cy, x2, y2, gravity);
  
  // Add new layers to our layers array
  layers = new Layer[] { layer_one, layer_two, layer_three };
  
  // Update the color palette
  getPalette(int (random(340, 610)));
  
  // Let's go!
  loop();
}

void draw() {  
  if (artifactData == null || layers == null) {
    return;
  }
  
  for(int i = 0; i < layers.length; i++) {
    layers[i].render();
  }
}
