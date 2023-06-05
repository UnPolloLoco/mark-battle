const SCREEN_RATIO = 0.6;

let ww = window.innerWidth;let wh = window.innerHeight;let kaboomDimensions = {};if (ww * SCREEN_RATIO > wh) {kaboomDimensions = { w: wh / SCREEN_RATIO,h: wh};} else {kaboomDimensions = {w: ww,h: ww * SCREEN_RATIO};};

kaboom({
  background: [50,50,50],
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
loadSprite('block', 'mark.png');
