class Layer {

  public int left; // Current left position
  public int right; // Current right position
  public int left_bound;
  public int right_bound;
  public int center; // Center of the stage (px)
  public int spacing; // Amount that the loop is incremented, which gives spacing between lines
  public int pts; // Number of points in one bezier curve
  public int cur_step_left = 0;
  public int cur_step_right = 0;

  public boolean gravity; // Determines whether points are drawn down or up

  private int anchorX;
  private int anchorY;
  private int controlX;
  private int controlY;
  private int anchor2X;
  private int anchor2Y;

  public Layer(int num_lines, int spacing, int points, int anchorX, int anchorY, int controlY, int anchor2X, int anchor2Y, boolean gravity) {
    this.spacing = spacing;
    this.pts = points;

    this.left_bound = getLeftBound(num_lines, this.spacing);
    this.right_bound = getRightBound(num_lines, this.spacing);
    this.left = this.left_bound;
    this.right = this.right_bound;
    this.center = this.left_bound + ((this.right_bound - this.left_bound) / 2);

    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.controlY = controlY;
    this.anchor2X = anchor2X;
    this.anchor2Y = anchor2Y;

    this.gravity = gravity;
  }

  void render() {
    if (this.left <= this.center) {
      this.render_left();
    }

    if (this.right > this.center) {
      this.render_right();
    }
  }

  void reset() {
    this.left = this.left_bound;
    this.right = this.right_bound;
    this.cur_step_left = 0;
    this.cur_step_right = 0;
  }

  void render_left() {
    this.controlX = this.left;

    // We've made it through an iteration of the bezierPoints, reset our loop counter  
    if (this.cur_step_left >= this.pts) {
      this.cur_step_left = 0;
      this.left += this.spacing;
      //fill(0, 40/4);
      //rectMode(CORNER);
      //rect(0, 0, width, height);
    }

    // Draw a point along the bezier curve
    float t = (float (this.cur_step_left)) / this.pts;
    float t_minus = this.gravity ? t : 1 - t;
    float x = bezierPoint(anchorX, controlX, controlX, anchor2X, t);
    float y = bezierPoint(anchorY, controlY, controlY, anchor2Y, t_minus);
    color blended = getBlendedColor(this.cur_step_left, this.pts);
    drawPoint(blended, x, y);
    this.cur_step_left++;
  }

  void render_right() {
    this.controlX = this.right;

    // We've made it through an iteration of the bezierPoints, reset our loop counter  
    if (this.cur_step_right >= this.pts) {
      this.cur_step_right = 0;
      this.right -= this.spacing;
    }
  
    // Draw a point along the bezier curve
    float t = (float (this.cur_step_right)) / this.pts;
    float t_minus = this.gravity ? t : 1 - t;
    float x = bezierPoint(anchorX, controlX, controlX, anchor2X, t);
    float y = bezierPoint(anchorY, controlY, controlY, anchor2Y, t_minus);
    color blended = getBlendedColor(this.cur_step_right, this.pts);
    drawPoint(blended, x, y);
    this.cur_step_right++;
  }
}

