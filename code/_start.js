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

loadFont('playfair', 'fonts/PlayfairDisplay.ttf');
loadFont('reenieBeanie', 'fonts/ReenieBeanie.ttf');
loadFont('nerko', 'fonts/NerkoOne.ttf');

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





loadShader('clear', null, `
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    return def_frag();
  }
`);

loadShader('light', null, `
  uniform float tint;

  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
    float dist = distance(pos, vec2(0, 0));
    float alpha = smoothstep(0.0, 1.0,
      1.0 - (max(0.0, dist - 0.3) * 0.6)
    );
    return vec4(
      c.r * alpha * (1.0 + tint/4.0), 
      c.g * alpha, 
      c.b * alpha * (1.0 + tint),
      c.a
    );
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
  uniform float rand;
  uniform float tint;
  
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
	  vec4 base;
	  float avg = (c.r + c.g + c.b) / 3.0;
   
	  if (avg > 0.25 && avg < 0.28) {
		  float col = mod(rand * (floor(uv.x * 250.0) / 250.0) * -40.0, 0.4);
      col += 0.6;
		  col += sin(time * 4.0 + uv.y) / 20.0;
	    base = vec4(0.4*col, 0, col*0.6, c.a);
	  }
	  else {
		  base = c;
	  }
   
	  float dist = distance(pos, vec2(0, 0));
    float alpha = smoothstep(0.0, 1.0,
      1.0 - (max(0.0, dist - 0.3) * 0.6)
    );
	  return vec4(
      base.r * alpha * (1.0 + tint/4.0), 
      base.g * alpha,
      base.b * alpha * (1.0 + tint),
      base.a
    );
  }
`);

loadShader("perish", null, `
	uniform float time;
 
	vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
		vec4 c = def_frag();
		float blur = time * 0.013;
  
		vec4 t1 = texture2D(tex, uv + vec2(blur, 0));
		vec4 t2 = texture2D(tex, uv - vec2(blur, 0));
		vec4 t3 = texture2D(tex, uv + vec2(0, blur));
		vec4 t4 = texture2D(tex, uv - vec2(0, blur));

		vec4 blurred = (c+c + t1+t2+t3+t4) / 6.0;

		float light = (blurred.r + blurred.g + blurred.b) / 3.0;
		light *= 2.5 - (time * 1.6) - (0.4 * distance(uv, vec2(0.5)));
		vec4 darkened = vec4(light, light, light, c.a);
		
		return darkened;
	} 
`)

loadShader("un-perish", null, `
	uniform float time;
 
	vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
		vec4 c = def_frag();
		float blur = max(0.0, time * 0.013);
  
		vec4 t1 = texture2D(tex, uv + vec2(blur, 0));
		vec4 t2 = texture2D(tex, uv - vec2(blur, 0));
		vec4 t3 = texture2D(tex, uv + vec2(0, blur));
		vec4 t4 = texture2D(tex, uv - vec2(0, blur));

		vec4 blurred = (c+c + t1+t2+t3+t4) / 6.0;

		float light = (blurred.r + blurred.g + blurred.b) / 3.0;
		light *= 1.0 - (time * 0.6) - (0.4 * distance(uv, vec2(0.5)));
		vec4 darkened = vec4(light, light, light, c.a);
		
		return mix(blurred, darkened, min(1.0, max(0.0, time * 1.6)));
	} 
`);

loadShader('butterflySpawn', null, `
  uniform float time;
  
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
    float n = max(1.0, 3.0*(1.0 - time) );
    return vec4(c.r *n, c.g *n, c.b *n, c.a);
  }
`);

// basic light
// https://kaboomjs.com/play?example=add&code=eJxtVFFr2zAQfrZ%2BxeGXyqlru1mgY10Hg%2B1tg0HZ0xitYiu2V1sykpKmjPz3fZLcLKUNiSXfd%2FeddPddypI%2BN02vWmrFKEmv%2F8jaWXKabG2kVIyVJd06YRwJehBrrcfgyeKeZ8HhmxYNcDuZ3kkS1kpHGwPXNJpsuZZCFZNq05wee9eR6yQpnzH1SMoGMNwGXx4tOaXlq%2BDshV%2FbaeueXnhG0%2BwbnTvRSMPPhr7t3FlOajsMOd2znaxXOKNoOXZLmrTNKey2u7BZUa0HbXKyYpwGaZZfyMl9Rn9ZElG6oUZu7gJFds2SDbI5anrrPIJFqFryIy%2Bvcqqy%2F45imDoBz8uiogvio9jzqoBPILigqlhltMBy5UPKhZFuaxSN%2Fd6fdxXYwvcyy0%2FOkUfe7HpRMsJnDgshdWHAGPCc6qI9fVmfviCcHdg9nkw0Df%2FFEtwCGassZ4mBPvhj37jOZ%2BukLyvPPBLqxU275suqyudfQMrSvugCbL%2FRnlor3HUaxJM0qMScy56qACmIILDZmKEp46SVVI5G8SAt9Q53VOCG6o4KjAdeLn153leBI7B46ylF2%2B8iBYDe9Vr58llNUon1AGTUOznCEbfWTiD%2FM1ekm41vMgYMjCyBDDrUJa2BS%2BNvhNDZeBqKJvYKwX4ypn6n%2Fal62DkAsR3iUKZOQ4wbB3Unc03TUNPU19nWYpB8eZWF8sbCFlr9nBp%2FTmS7%2BeT1OwNCtYOkc0hwWaH9DdrIDojbaEN8wAT3aEp1jeUjvcNyfh7UH7u2B2aEarwQZzVkz9jTCXYUCAoR%2B3ts8Dy%2B%2FuChX%2FucnsLLK7EkuM6Bsdc3KRdbK3%2BA5utm43V5nHJgyfYu%2FoV9oO%2FCdYWfsDd1e8gwLAeo%2FR9dboYm

// light + purple part
// https://kaboomjs.com/play?example=evilnessshader&code=eJyNVVFv2zYQfpZ%2BxU3AUspRKMVzmsBZuoduGIah2LAVewmClZJoiw1NChRlJwv833dHSY6NtcAMx9IdP3733fF4yXP4uJPhY5RZfxPHj6K0dsNe4qgU1ePa2d7US7i%2FKrLwfcjifRrH2or6z9YpL1lSSmGSDJLG%2B7Zb5rniqix5ZfObeuGvn2%2FyXz78fLGYLwremnUybW5ELR17sxFaVfIP1drV6k0Gptc6g08xQG%2FUyroNrBDtwauNvEUvfreyWsDKiTXDtzm0tssgvPXbbFisrLYug05sWi3d%2FEfw8imFF9xLnwECd1DL1d%2BBJ72No9Ffik4GawgrtmsEsoo7OIeKr8NvmUIO3%2FEi4NQKGKHeQcHnV3B2FvZ8T9YNxYyiKQMkui54Meu3%2FAnQH50TyYwyG805mgw6ZRg5UwwWFknexIKpIU%2FB3%2BIikl3PCB1ohiTwQykghtJhBb%2BZ4ZYMigzCs%2BJiAO7pR2qEksZxT%2FW6NISrVUe66SFMJdmh2AwJizS9HWs6Vku3jUD4JS%2FgAthGPKEABAaWC9S7SGFG4gcJTvremUEoCeBuFhiykAJfn1jliSVC5H38CZ%2FxVjioeye8soaix5U1GFAi8ONzKzv0%2FVZ%2BlpXnj%2FK5Y%2BjHTu%2FSWEusZ%2B9%2BGnFU13jcSy2Ntqhrdh9H3XGjp1kcYRlYJY3HBk7JdtYLBBT0jnVqrGPJsB7gXSU0rvKrYHy58VkKd%2B%2BArl2U0Kkny3D4jLbsKchDOonTopT6VR02t2eHZO%2BPMnrI4AXb6R%2B5hLcL2E%2FK54sM5ouR8pgkeY%2BSHkGY510jnYQz6LEthHN2B1S6hPh2qvbNcnig6P1xzqX1Wq58chypkWrdeERevAa15lf5%2FLuTXceSsGHKH9M%2FPZET6w5PCH54PViupVn7BpkvYXkCRU8chTpxygyJvlygMMuO1TgS%2B3U57Ng8h8sUvv2PnP8feGxAGsDUbTT7SM0Hi2Uf9BxkHPV3nlMfcqwvp4vFNgGO1U5pLs0LmkuX%2BHd6C76uJMpz6LxtoXVyq5AMcGi2GVgHPrTBTmmNNwI%2BK48djXcnjmjqTcrTQw68oiGhWTpyCueJAjwthlJOqQYPw14%2F4LZC9xJHaVXJ1ndYi00pcYb%2FRYNdmBre00xPaVSNyWfD7lp2XpmhNoED3a8VmUBT9Zgy0EmsTN0R1%2BQfYQ32%2BaCja2yva0q6b2u82jUCGC6F45gU0JAVetyr6La3Vg9xVr2phoD4T0b0GjPyFsbJw7UyUoRkRs%2B9PNzYOEqpN%2F4FZo9G%2Fg%3D%3D

// better purple?
// https://kaboomjs.com/play?example=evilnessshader&code=eJyNVW2P2zYM%2Fmz%2FCs7ArnLOkXNZ7rbmdu2HbhiGoVixFtuAw2GVbSVWT5EMWU4uO%2BS%2Fj5SdN7QFZiSxRJEPH1Ikk%2BfwYSPDY5RZfhPHj6KwdsWe46gQ5ePS2c5Uc7i%2FnmTh85DFuzSOtRXV%2B8YpL1lSSGGSDJLa%2B6ad57niqih4afPvl%2B%2Fe%2F%2F3Xy%2FzXt7%2BMZ9Obl7wxy2RvXItKOvZiJbQq5R%2BqsYvFiwxMp3UGH2OAzqiFdStYoLYHr1by9jOpE6YiKX7WspzBwoklw9UUGttmEFbdOusPS6uty6AVq0ZLN%2F0JvHxK4Rlt6elV4A4qufgn4KS3cTTIC9HKsOvdivUSFVnJHVxCyZfht0ghh%2B%2F4JOipBTDSegUTPr2Gi4tg8yPtfiCfUTRAISmEWtmKUSwwAoZy61i35k%2B4m15P%2BISAh8UIxjNcZAg0S28H6vgQzOUdSm9uCXvYtsowShyazfgEWSLqNqBNBp74UGxIgeJkiDpCW4TPCGOEeLjgok%2FFjn6kRnUKYLArj0d9RJVqPaURX8KUkh1ughHt9MB6SKVuaoHqV8hvDGwlnliIL6CMQ5jIHnn0FJz0nTM9WSLA3SggZCEMvjzbFWc7ETzv4o%2F4jtfCQdU54ZU15D0urUGHEhU%2FbBvZouz34pMsPX%2BU25ahHJujTWMt8co69%2FOgh2qTeLClLsC9qCp2H0ftaW%2BkWRxhGlgpjceaT2nvrBeoMKE15qnGO0%2F686DelkLjKb8Omy%2F3Ckvh7hVQp0YJXXMyD23CyCRKqJ5QQq8g2ZHbh3RPV4tC6iNf7AXPDuHfn8T4kMEzVtK%2Fcg43M9jtY5nOMpjOBshTkOQNknwEYbabWjoJF9BhoQjn7AYomQnhbVTl63n%2FwjB2p1korNdy4ZNTT7VUy9qj5vjo1Jrf5Padk23LkmCwzwgm5PyOznZ3eGfw%2BnjVXEuz9DUiX8H8TBUlcRTyxCkyBPpygsJAPGXjiOzX6bDT7SVcpfDtZ3T%2Bv%2BOhJGmKU%2F3RACU2by2mvedzoHFS8XlOlckxv5xaja2COmY77ecDjYcr%2FJ73xdeZRHkOrbcNNE6uFYIBztgmA%2BvAhzLYKK2xR%2BCT8ljj2E1xRENyzzw9xMBLGhuapQOmcJ4gwNNhSOU%2B1CBhWOsHvbXQncTJW5ay8S3mYlVIHPl%2F0v8Ajdc39BeQ0vAags9660q2Xpk%2BNwEDxceM7JX22WPKQCsxM1VLWHv5oFZjnfc82tp2uqKgu6bCZq9QgeFRuI49Axq9Qg%2B2ivq%2Fsbr3s%2BhM2TvE%2FyTRaYzIWxhmEdfKSBGCGST38tCxcZRSbfwHVEtZTw%3D%3D

// minimark
// https://kaboomjs.com/play?example=evilnessshader&code=eJyNVW1v2zYQ%2Fiz9ipuAtZSjULLnFIW7dB%2FaYRiGYsNWDBiCYKUkWmJDkxpFOc0C%2F%2FfdUZJjoy0wQZbE47089%2FDunOfw%2Fl6GyyjTfBPHd6K0dsce46gU1V3j7GDqDdxcFVm4b7P4kMaxtqL%2Bo3PKS5aUUpgkg6T1vus3ea64Kkte2Xz%2Ftvmr2f6T%2F%2Fzup8uX6%2BWSd6ZJZuNW1NKx5zuhVSV%2FV53dbp9nYAatM%2FgQAwxGba3bwRa1PXi1k68%2BkzphapLivZfVGrZONAy%2FVtDZPoPwNeyzcbOy2roMerHrtHSrt%2BDlpxQe0ZauUQWuoZbbv4Of9FUcTfJS9DKsxrBi36Aiq7iDC6h4E55lCjl8x4ugp7bASOs1FHx1Bc%2BeBZvvafWSYkbR5ApBoauCv0AfBV8uemUY5bpYXvEiPRGuCl4s2LDnDxe0nxK6KJhfXMNsBQtY8wKtSI%2FwkFUAhBclgbEoIVbw9QJtMygy8rFAAPjBxZjzgR5Sozohneyqp60Req16T3zhS5hKsiPlDJ0WBHBkduJMd61A9SXiuwS2E58QBCoGL5eY5jpF9IhjhOCkH5wZwRIA7hbBQxbS4M3ZqjxbiRD5EH%2FAd7wXDurBCa%2BsoehxZQ0GlKj4%2FqGTPcp%2BLT%2FKyvM7%2BdAzlGMX9GmsJZ7N4H6c9OiM4smWyh3Xoq7ZTRz1p02QZnGENLBKGo%2FFndLaWS9QoaBv5Km1jiXjflDvK6Fxl1%2BFxZebgqVw%2FRqoJaOEjjnZhH5gZBIl1AQooVeQHCjsbTrD1aKU%2BgkvFr1nx%2FRvTnK8zeARK%2BlfuYEXazjMuazWGazWk8tTJ8kbBHkHwjzct9JJeAYDFopwzt4DkZmQv3tV%2B3YzvjCNwykLpfVabn1yGqmVqmk9al4%2BBbXmF%2Fnwm5N9z5JgMDOChJyf0dnqGs8Mfng6aq6laXyLnpewOVNFSRwFnjhlho6%2BTFCYfKdoHIH9Ohx2uryAZQrffgbn%2FweeSpLGNdUfTUpC884i7SOeI4yTis9zqkyO%2FHJqNbYL6sh2Os4HGg9L%2FJ33xdeRRHkOvbcddE7uFToDHKZdBtaBD2Vwr7TGHoGPymONYzfFEU3DGXl6zIFXNDY0SyefwnlyAZ42A5VzqkHCsNaPenuhB4kjtqpk53vkYldKnO1%2F0sDHPoA3NOtTGl5T8tloXcveKzNyE3yg%2BImRWWlmjykDvURm6p58zfJJrcU6H3H0rR10TUkPXY3NXqMCw61wHDMCGr1CT7aK%2Br%2BzeoyzHUw1BsQ%2FHzFozMhbmGYR18pIEZKZJDfy2LFxlFJt%2FAeSOFZf
