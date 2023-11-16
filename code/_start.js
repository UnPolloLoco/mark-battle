const SCREEN_RATIO = 0.6;

let ww = window.innerWidth;let wh = window.innerHeight;let kaboomDimensions = {};if (ww * SCREEN_RATIO > wh) {kaboomDimensions = { w: wh / SCREEN_RATIO,h: wh};} else {kaboomDimensions = {w: ww,h: ww * SCREEN_RATIO};};

kaboom({
  background: [32,32,32],
  width: kaboomDimensions.w,
  height: kaboomDimensions.h,
  inspectColor: [255,255,255],
  pixelDensity: 1.5,
});

debug.inspect = false;

function ls(a,b,c) {
  if (b == undefined) {
    loadSprite(a, `${a}.png`); 
  } else {
    loadSprite(a, `${a}.png`, b);
  };
};

function la(a,b) {
  loadSpriteAtlas(`${a}.png`, b);
};

const SCALE = width()/10;
const JUMP_SPEED = SCALE * 9;
const RUN_SPEED = SCALE * 5;
const GROUND_FRICTION = 8;
const AIR_FRICTION = 2;
const EGG_SLOWDOWN = 0.12;
const EGG_JUMP_SLOWDOWN = 0.25;
const TOUCH = isTouchscreen();

loadSprite('tempBG', 'https://i.ibb.co/ZxrmpQt/IMG-0315.png');

loadRoot('fonts/');

loadFont('playfair', 'PlayfairDisplay.ttf');
loadFont('reenieBeanie', 'ReenieBeanie.ttf');
loadFont('nerko', 'NerkoOne.ttf');
loadFont('titillium', 'TitilliumWeb.ttf');
loadFont('itim', 'Itim.ttf');

loadRoot('sprites/');

ls('mark', {
  sliceX: 2,
  sliceY: 2,
});

ls('puff');

la('blocks', {
  block: {
    x: 0, y: 0,
    width: 500, height: 500,
  },
  rightBlock: {
    x: 500, y: 0,
    width: 500, height: 500,
  },
  bgBlock: {
    x: 1000, y: 0,
    width: 500, height: 500,
  }
});

ls('slash', {
  sliceX: 6,
  sliceY: 1,
  anims: {
    attack: {
      from: 0,
      to: 5,
      speed: 40,
    },
  },
});

ls('beans', {
  sliceX: 3,
  sliceY: 3,
  anims: {
    idle:     3,
    moving:   7,
    jump:     5,
    jumpMove: 6,
    fall:     4,
    fallMove: 2,
    battle:   1,
  },
});

ls('clash', {
  sliceX: 3,
  sliceY: 2,
  anims: {
    clash: {
      from: 0,
      to: 5,
      speed: 30,
    },
  },
});

ls('laser', {
	sliceX: 2,
	sliceY: 1,
	anims: {
		beam: 0,
		boom: 1,
	}
});

ls('minimark', {
  sliceX: 2,
  sliceY: 2,
  anims: {
    moving: 0,
    attacking: 1,
    fallMove: 2,
    jumpMove: 3,
  }
});

la('megaMinimark', {
  megaMinimark: {
    x: 0, y: 0,
    width: 1500, height: 1000,
    sliceX: 3,
    sliceY: 2,
    anims: {
      roll: {
        from: 0, to: 3,
        speed: 15,
        loop: true,
      },
      jump: 4,
      fall: 5,
    }
  },
  
  megaMinimarkExtras: {
    x: 0, y: 1000,
    width: 1500, height: 500,
    sliceX: 3,
    anims: {
      mouth: 0,
      laser: {
        from: 1, to: 2,
        speed: 12,
        loop: true,
      },
    }
  },
});

ls('minimarkEgg', {
  sliceX: 3,
  sliceY: 2,
  anims: {
    miniEgg: {
      from: 0, to: 1,
      speed: 12,
      loop: true,
    },
    miniFall: 2,
    megaEgg: {
      from: 3, to: 4,
      speed: 12,
      loop: true,
    },
    megaFall: 5,
  }
});

ls('laserFlare', {
  sliceX: 2,
  anims: {
    flash: {
      from: 0, to: 1,
      speed: 12,
      loop: true,
    }
  }
});

la('butterfly', {
  butterfly: {
    x: 0, y: 0,
    width: 1000, height: 500,
    sliceX: 2,
    anims: {
      fly: {
        from: 0, to: 1,
        speed: 10,
        loop: true,
      }
    }
  },
  butterflyGlow: {
    x: 0, y: 500,
    width: 1000, height: 500,
    sliceX: 2,
    anims: {
      fly: {
        from: 0, to: 1,
        speed: 10,
        loop: true,
      }
    }
  },
});

ls('egg', {
  sliceX: 2,
  sliceY: 2,
  anims: {
    egg: 0,
    splatter: {
      from: 1, to: 2,
      speed: 12,
    },
    weakSplatter: 3,
  }
});

ls('whiteGlow');
