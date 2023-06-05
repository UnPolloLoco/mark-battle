const SCREEN_RATIO = 0.6;

let ww = window.innerWidth;let wh = window.innerHeight;let kaboomDimensions = {};if (ww * SCREEN_RATIO > wh) {kaboomDimensions = { w: wh / SCREEN_RATIO,h: wh};} else {kaboomDimensions = {w: ww,h: ww * SCREEN_RATIO};};

kaboom({
  background: [30,30,30],
  width: kaboomDimensions.w,
  height: kaboomDimensions.h,
  inspectColor: [255,255,255],
  pixelDensity: 1,
  crisp: true,
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

loadFont('noto', 'fonts/NotoSerifDisplay.ttf')

loadRoot('sprites/');

ls('mark');
loadSprite('player', 'mark.png');
la('blocks', {
  bottomBlock: {
    x: 0, y: 0,
    width: 500, height: 500,
  },
  middleBlock: {
    x: 500, y: 0,
    width: 500, height: 500,
  },
  leftBlock: {
    x: 1000, y: 0,
    width: 500, height: 500,
  },
  rightBlock: {
    x: 1500, y: 0,
    width: 500, height: 500,
  }
});
