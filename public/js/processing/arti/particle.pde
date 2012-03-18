class particle {

  float x;
  float y;
  float z;
  float px;
  float py;
  float magnitude;
  float theta;
  float phi;
  float mass;
  

  particle( float dx, float dy, float dz, float V, float T, float P, float M ) {
    x = dx;
    y = dy;
    z = dz;
    px = dx;
    py = dy;
    magnitude = V;
    theta = T;
    phi = P;
    mass = M;
  }

  void reset ( float dx, float dy, float dz, float V, float T, float P, float M ) {
    x = dx;
    y = dy;
    z = dz;
    px = dx;
    py = dy;
    magnitude = V;
    theta = T;
    phi = P;
    mass = M;
  }

  void polygon(int sides, float cx, float cy, float r)
  {
    float angle = 360.0 /sides;

    beginShape();
    for (int i = 0; i < sides; i++)
    {
      vertex(cx + r * cos(radians(angle * i)), 
      cy + r * sin(radians(angle * i)));
    }
    endShape(CLOSE);
  }


  void gravitate( particle C ) {
    float dx, dy, dz;
    float F, t, p;
    if ( sq( x - C.x ) + sq( y - C.y ) + sq( z - C.z ) != 0 ) {
      F = mass * C.mass;
      // magnitude

      dx = ( mass * x + C.mass * C.x ) / ( mass + C.mass );
      dy = ( mass * y + C.mass * C.y ) / ( mass + C.mass );
      dz = ( mass * z + C.mass * C.z ) / ( mass + C.mass );
      // find point to which particle is being attracted (dx,dy,dz)

      t = atan2( dy-y, dx-x );                          // find yaw angle
      p = atan2( dz-z, sqrt( sq(dy-y) + sq(dx-x) ) ) ;  // find depth angle

      dx = F * cos(p) * cos(t);
      dy = F * cos(p) * sin(t);
      dz = F * sin(p);

      dx += magnitude * cos(phi) * cos(theta);
      dy += magnitude * cos(phi) * sin(theta);
      dz += magnitude * sin(phi);

      magnitude = sqrt( sq(dx) + sq(dy) + sq(dz) );
      theta = atan2( dy, dx );
      phi = atan2( dz, sqrt( sq(dx) + sq(dy) ) );
    }
  }

  void repel( particle C ) {
    float dx, dy, dz;
    float F, t, p;
    if ( sq( x - C.x ) + sq( y - C.y ) + sq( z - C.z ) != 0 ) {
      F = mass * C.mass;
      // magnitude

      dx = ( mass * x + C.mass * C.x ) / ( mass + C.mass );
      dy = ( mass * y + C.mass * C.y ) / ( mass + C.mass );
      dz = ( mass * z + C.mass * C.z ) / ( mass + C.mass );
      // find point to which particle is being attracted (dx,dy,dz)

      t = atan2( y-dy, x-dx );                          // find yaw angle
      p = atan2( z-dz, sqrt( sq(dy-y) + sq(dx-x) ) ) ;  // find depth angle

      dx = F * cos(p) * cos(t);
      dy = F * cos(p) * sin(t);
      dz = F * sin(p);

      dx += magnitude * cos(phi) * cos(theta);
      dy += magnitude * cos(phi) * sin(theta);
      dz += magnitude * sin(phi);

      magnitude = sqrt( sq(dx) + sq(dy) + sq(dz) );
      theta = atan2( dy, dx );
      phi = atan2( dz, sqrt( sq(dx) + sq(dy) ) );
    }
  }

  void deteriorate() {
    magnitude *= 0.9;
  }

  void update() {

    x += magnitude * cos(phi) * cos(theta);
    y += magnitude * cos(phi) * sin(theta);
    z += magnitude * sin(phi);
  }

  void display() {
    polygon(6, px, py, 7);
    px = x;
    py = y;
  }

  void display2() {
    polygon(3, px, py, 7);
    px = x;
    py = y;

  }
  
  void display3() {
    polygon(4, px, py, 7);
    px = x;
    py = y;

  }
  
  void display4() {
    polygon(20, px, py, 7);
    px = x;
    py = y;

  }
}

