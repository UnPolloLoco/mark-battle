const SCREEN_RATIO = 0.6;

let ww = window.innerWidth;let wh = window.innerHeight;let kaboomDimensions = {};if (ww * SCREEN_RATIO > wh) {kaboomDimensions = { w: wh / SCREEN_RATIO,h: wh};} else {kaboomDimensions = {w: ww,h: ww * SCREEN_RATIO};};

kaboom({
  background: [255,255,255],
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
  } else if (c == undefined) {
    loadSprite(a, `${b}.png`);
  } else {
    loadSprite(a, `${b}.png`, c);
  };
};

const SCALE = width()/10;

loadRoot('sprites/');

ls('mark');
ls('player', 'mark');
