const SCREEN_RATIO = 0.6;

let ww = window.innerWidth;let wh = window.innerHeight;let kaboomDimensions = {};if (ww * SCREEN_RATIO > wh) {kaboomDimensions = { w: wh / SCREEN_RATIO,h: wh};} else {kaboomDimensions = {w: ww,h: ww * SCREEN_RATIO};};

kaboom({
  background: [32,32,32],
  width: kaboomDimensions.w,
  height: kaboomDimensions.h,
  inspectColor: [255,255,255],
  pixelDensity: 1.5,
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
ls('bean', {
  sliceX: 3,
  sliceY: 3,
  anims: {
    idle:     4,
    moving:   0,
    jump:     3,
    jumpMove: 1,
    fall:     2,
    fallMove: 5,
    battle:   6,
  },
});

loadShader('light', null, `
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
    float dist = distance(pos, vec2(0, 0));
    float alpha = 1.0 - (max(0.0, dist - 0.4) * 0.6);
    return vec4(c.r * alpha, c.g * alpha, c.b * alpha, c.a);
  }
`);

loadShader('slash', null, `
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
    return vec4(1, 1, 1, c.a);
  }
`);

// https://kaboomjs.com/play?example=add&code=eJxtVFFr2zAQfrZ%2BxeGXyqlru1mgY10Hg%2B1tg0HZ0xitYiu2V1sykpKmjPz3fZLcLKUNiSXfd%2FeddPddypI%2BN02vWmrFKEmv%2F8jaWXKabG2kVIyVJd06YRwJehBrrcfgyeKeZ8HhmxYNcDuZ3kkS1kpHGwPXNJpsuZZCFZNq05wee9eR6yQpnzH1SMoGMNwGXx4tOaXlq%2BDshV%2FbaeueXnhG0%2BwbnTvRSMPPhr7t3FlOajsMOd2znaxXOKNoOXZLmrTNKey2u7BZUa0HbXKyYpwGaZZfyMl9Rn9ZElG6oUZu7gJFds2SDbI5anrrPIJFqFryIy%2Bvcqqy%2F45imDoBz8uiogvio9jzqoBPILigqlhltMBy5UPKhZFuaxSN%2Fd6fdxXYwvcyy0%2FOkUfe7HpRMsJnDgshdWHAGPCc6qI9fVmfviCcHdg9nkw0Df%2FFEtwCGassZ4mBPvhj37jOZ%2BukLyvPPBLqxU275suqyudfQMrSvugCbL%2FRnlor3HUaxJM0qMScy56qACmIILDZmKEp46SVVI5G8SAt9Q53VOCG6o4KjAdeLn153leBI7B46ylF2%2B8iBYDe9Vr58llNUon1AGTUOznCEbfWTiD%2FM1ekm41vMgYMjCyBDDrUJa2BS%2BNvhNDZeBqKJvYKwX4ypn6n%2Fal62DkAsR3iUKZOQ4wbB3Unc03TUNPU19nWYpB8eZWF8sbCFlr9nBp%2FTmS7%2BeT1OwNCtYOkc0hwWaH9DdrIDojbaEN8wAT3aEp1jeUjvcNyfh7UH7u2B2aEarwQZzVkz9jTCXYUCAoR%2B3ts8Dy%2B%2FuChX%2FucnsLLK7EkuM6Bsdc3KRdbK3%2BA5utm43V5nHJgyfYu%2FoV9oO%2FCdYWfsDd1e8gwLAeo%2FR9dboYm
