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
})

loadShader('light', null, `
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
    float dist = distance(pos, vec2(0, 0));
    float alpha = 1.0 - (max(0.0, dist - 0.4) * 0.6);
    return vec4(c.r * alpha, c.g * alpha, c.b * alpha, c.a);
  }
`);

loadShader('white', null, `
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
    return vec4(1, 1, 1, c.a);
  }
`);

loadShader('mark', null, `
  uniform float time;
  
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
	  vec4 base;
	  float avg = (c.r + c.g + c.b) / 3.0;
	  if (avg > 0.25 && avg < 0.28) {
      float t = 70.0*uv.x 
			  + 3.0*time 
		  	+ 2.0*( sin(time) + time );
      float col = 0.6 + 0.07*sin(3.0*t);
      base = vec4(0.8*col, 0, col, c.a);
	  }
	  else {
      base = c;
	  }
   
    float dist = distance(pos, vec2(0, 0));
    float alpha = 1.0 - (max(0.0, dist - 0.4) * 0.6);
	  return vec4(
      base.r * alpha, 
      base.g * alpha,
      base.b*alpha,
      base.a
    );
  }
`);

// basic light
// https://kaboomjs.com/play?example=add&code=eJxtVFFr2zAQfrZ%2BxeGXyqlru1mgY10Hg%2B1tg0HZ0xitYiu2V1sykpKmjPz3fZLcLKUNiSXfd%2FeddPddypI%2BN02vWmrFKEmv%2F8jaWXKabG2kVIyVJd06YRwJehBrrcfgyeKeZ8HhmxYNcDuZ3kkS1kpHGwPXNJpsuZZCFZNq05wee9eR6yQpnzH1SMoGMNwGXx4tOaXlq%2BDshV%2FbaeueXnhG0%2BwbnTvRSMPPhr7t3FlOajsMOd2znaxXOKNoOXZLmrTNKey2u7BZUa0HbXKyYpwGaZZfyMl9Rn9ZElG6oUZu7gJFds2SDbI5anrrPIJFqFryIy%2Bvcqqy%2F45imDoBz8uiogvio9jzqoBPILigqlhltMBy5UPKhZFuaxSN%2Fd6fdxXYwvcyy0%2FOkUfe7HpRMsJnDgshdWHAGPCc6qI9fVmfviCcHdg9nkw0Df%2FFEtwCGassZ4mBPvhj37jOZ%2BukLyvPPBLqxU275suqyudfQMrSvugCbL%2FRnlor3HUaxJM0qMScy56qACmIILDZmKEp46SVVI5G8SAt9Q53VOCG6o4KjAdeLn153leBI7B46ylF2%2B8iBYDe9Vr58llNUon1AGTUOznCEbfWTiD%2FM1ekm41vMgYMjCyBDDrUJa2BS%2BNvhNDZeBqKJvYKwX4ypn6n%2Fal62DkAsR3iUKZOQ4wbB3Unc03TUNPU19nWYpB8eZWF8sbCFlr9nBp%2FTmS7%2BeT1OwNCtYOkc0hwWaH9DdrIDojbaEN8wAT3aEp1jeUjvcNyfh7UH7u2B2aEarwQZzVkz9jTCXYUCAoR%2B3ts8Dy%2B%2FuChX%2FucnsLLK7EkuM6Bsdc3KRdbK3%2BA5utm43V5nHJgyfYu%2FoV9oO%2FCdYWfsDd1e8gwLAeo%2FR9dboYm

// light + purple part
//https://kaboomjs.com/play?example=evilness shader&code=eJyNVVFv2zYQfpZ%2BxU3AUspRKMVzmsBZuoduGIah2LAVewmClZJoiw1NChRlJwv833dHSY6NtcAMx9IdP3733fF4yXP4uJPhY5RZfxPHj6K0dsNe4qgU1ePa2d7US7i%2FKrLwfcjifRrH2or6z9YpL1lSSmGSDJLG%2B7Zb5rniqix5ZfObeuGvn2%2FyXz78fLGYLwremnUybW5ELR17sxFaVfIP1drV6k0Gptc6g08xQG%2FUyroNrBDtwauNvEUvfreyWsDKiTXDtzm0tssgvPXbbFisrLYug05sWi3d%2FEfw8imFF9xLnwECd1DL1d%2BBJ72No9Ffik4GawgrtmsEsoo7OIeKr8NvmUIO3%2FEi4NQKGKHeQcHnV3B2FvZ8T9YNxYyiKQMkui54Meu3%2FAnQH50TyYwyG805mgw6ZRg5UwwWFknexIKpIU%2FB3%2BIikl3PCB1ohiTwQykghtJhBb%2BZ4ZYMigzCs%2BJiAO7pR2qEksZxT%2FW6NISrVUe66SFMJdmh2AwJizS9HWs6Vku3jUD4JS%2FgAthGPKEABAaWC9S7SGFG4gcJTvremUEoCeBuFhiykAJfn1jliSVC5H38CZ%2FxVjioeye8soaix5U1GFAi8ONzKzv0%2FVZ%2BlpXnj%2FK5Y%2BjHTu%2FSWEusZ%2B9%2BGnFU13jcSy2Ntqhrdh9H3XGjp1kcYRlYJY3HBk7JdtYLBBT0jnVqrGPJsB7gXSU0rvKrYHy58VkKd%2B%2BArl2U0Kkny3D4jLbsKchDOonTopT6VR02t2eHZO%2BPMnrI4AXb6R%2B5hLcL2E%2FK54sM5ouR8pgkeY%2BSHkGY510jnYQz6LEthHN2B1S6hPh2qvbNcnig6P1xzqX1Wq58chypkWrdeERevAa15lf5%2FLuTXceSsGHKH9M%2FPZET6w5PCH54PViupVn7BpkvYXkCRU8chTpxygyJvlygMMuO1TgS%2B3U57Ng8h8sUvv2PnP8feGxAGsDUbTT7SM0Hi2Uf9BxkHPV3nlMfcqwvp4vFNgGO1U5pLs0LmkuX%2BHd6C76uJMpz6LxtoXVyq5AMcGi2GVgHPrTBTmmNNwI%2BK48djXcnjmjqTcrTQw68oiGhWTpyCueJAjwthlJOqQYPw14%2F4LZC9xJHaVXJ1ndYi00pcYb%2FRYNdmBre00xPaVSNyWfD7lp2XpmhNoED3a8VmUBT9Zgy0EmsTN0R1%2BQfYQ32%2BaCja2yva0q6b2u82jUCGC6F45gU0JAVetyr6La3Vg9xVr2phoD4T0b0GjPyFsbJw7UyUoRkRs%2B9PNzYOEqpN%2F4FZo9G%2Fg%3D%3D
