
int getLeftBound(int totalLines, int spacing) {
  return round(width/2 - ((totalLines * spacing) / 2));
}

int getRightBound(int totalLines, int spacing) {
  return round(width/2 + ((totalLines * spacing) / 2));
}

void getPalette(int wingspan) {
  palette.getColors(wingspan);
  colors = palette.colors;
}

color getBlendedColor(int current_line_step, int total_points) {
  float t = (float (current_line_step)) / total_points;
  float colorIndex = map(t, 0, 1, 0, 4);
  color prev = colors[floor(colorIndex)];
  color next = colors[ceil(colorIndex)];
  float colors_btwn_pts = (float (total_points)) / (colors.length - 1);
  int current_color_step = round((current_line_step % colors_btwn_pts) + 1);
  float blend_amount = constrain(current_color_step / colors_btwn_pts, 0, 1);
  color blended = lerpColor(prev, next, blend_amount);
  return blended;
}

void drawPoint(color colour, float x, float y) {
    noStroke();
    fill(colour, 100);
    ellipse(x, y, 5, 5);
}

void reset() {
  background(0);
  for(int i = 0; i < layers.length; i++) {
    layers[i].reset();
  }
  layers = null;
}

// Restart the pde
void replay() {
  reset();
  ready();
}

void mousePressed() {
  if (mouseButton == RIGHT) {
    noLoop();
  } 
  else {
    loop();
    replay();
  }
}

void keyPressed() {
  if ( key == ENTER ) {
    println("You hit enter =]");
  }
}
