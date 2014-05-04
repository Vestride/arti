class Palette {
  
  public color[] colors;
  
  public color[] Mountains = { 
    color(21, 30, 43), 
    color(204, 190, 101),
    color(118, 138, 94),
    color(66, 92, 80),
    color(39, 60, 64)
  };
  
  public color[] Invisible = { 
    color(41, 39, 33), 
    color(54, 50, 49),
    color(63, 62, 69),
    color(44, 79, 102),
    color(0, 99, 145)
  };
  
  public color[] BlueSky = { 
    color(22, 25, 59), 
    color(53, 71, 140),
    color(78, 122, 199),
    color(127, 178, 240),
    color(173, 213, 247)
  };
  
  public color[] SteelHeart = { 
    color(39, 42, 43), 
    color(56, 55, 55),
    color(71, 59, 57),
    color(105, 43, 40),
    color(148, 5, 0)
  };
  
  public color[] IndianNight = { 
    color(43, 21, 40), 
    color(64, 37, 48),
    color(99, 68, 68),
    color(135, 116, 108),
    color(176, 172, 164)
  };
  
  public color[] Oliva = { 
    color(117, 53, 62), 
    color(125,80, 69),
    color(166, 130, 94),
    color(191, 172, 120),
    color(115, 114, 74)
  };
  
  public color[] SeaPebbles = { 
    color(201, 186, 148), 
    color(242, 236, 193),
    color(209, 222, 189),
    color(173, 207, 177),
    color(139, 189, 179)
  };
  
  public color[] Rhubarbarian = { 
    color(69, 43, 51), 
    color(105, 59, 62),
    color(158, 81, 78),
    color(64, 56, 52),
    color(166, 181, 161)
  };
  
  public color[] OceanDiver = { 
    color(230, 226, 175), 
    color(167, 163, 126),
    color(239, 236, 202),
    color(4, 99, 128),
    color(0, 47, 47)
  };
  
  public color[] SummerBeach = { 
    color(199, 223, 216), 
    color(144, 200, 216),
    color(242, 206, 153),
    color(216, 129, 96),
    color(235, 98, 65)
  };
  
  public color[] Sunset = { 
    color(194, 68, 62), 
    color(199, 114, 100),
    color(184, 150, 138),
    color(122, 120, 116),
    color(83, 102, 97)
  };
  
  public color[] RoyalWe = { 
    color(232, 140, 89), 
    color(212, 104, 79),
    color(189, 78, 65),
    color(156, 63, 81),
    color(112, 47, 99)
  };
  
  public color[] Transmorphed = { 
    color(255, 67, 26), 
    color(214, 60, 43),
    color(181, 49, 53),
    color(133, 44, 69),
    color(102, 36, 67)
  };
  
  public color[] UVRays = { 
    color(52, 169, 255), 
    color(89, 130, 219),
    color(102, 94, 184),
    color(104, 70, 130),
    color(99, 46, 98)
  };
  
  public Palette() {
    
  }
  
  public void getColors(int wingspan) {
    if (wingspan > 600) {
      this.colors = this.Mountains;
    }
    else if (wingspan > 580) {
      this.colors = this.Invisible;
    }
    else if (wingspan > 560) {
      this.colors = this.BlueSky;
    }
    else if (wingspan > 540) {
      this.colors = this.SteelHeart;
    }
    else if (wingspan > 520) {
      this.colors = this.IndianNight;
    }
    else if (wingspan > 500) {
      this.colors = this.Oliva;
    }
    else if (wingspan > 480) {
      this.colors = this.SeaPebbles;
    }
    else if (wingspan > 460) {
      this.colors = this.Rhubarbarian;
    }
    else if (wingspan > 440) {
      this.colors = this.OceanDiver;
    }
    else if (wingspan > 420) {
      this.colors = this.SummerBeach;
    }
    else if (wingspan > 400) {
      this.colors = this.Sunset;
    }
    else if (wingspan > 380) {
      this.colors = this.RoyalWe;
    }
    else if (wingspan > 360) {
      this.colors = this.Transmorphed;
    }
    else {
      this.colors = this.UVRays;
    }
  }
  
  
}
