const SCREEN_RATIO = 0.6;

let ww = window.innerWidth;let wh = window.innerHeight;let kaboomDimensions = {};if (ww * SCREEN_RATIO > wh) {kaboomDimensions = { w: wh / SCREEN_RATIO,h: wh};} else {kaboomDimensions = {w: ww,h: ww * SCREEN_RATIO};};

kaboom({
  background: [32,32,32],
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

loadFont('playfair', 'fonts/PlayfairDisplay.ttf')

loadRoot('sprites/');

ls('mark');
loadSprite('player', 'mark.png');
la('blocks', {
  block: {
    x: 0, y: 0,
    width: 500, height: 500,
  },
  rightBlock: {
    x: 500, y: 0,
    width: 500, height: 500,
  }
});

loadShader('light', null, `
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
    float dist = distance(pos, vec2(0, 0));
    float alpha = 1.0 - (max(0.0, dist - 0.4) * 0.7);
    return vec4(c.r * alpha, c.g * alpha, c.b * alpha, c.a);
  }
`);
