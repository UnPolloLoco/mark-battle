loadShader('clear', null, `
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    return def_frag();
  }
`);

loadShader('vignette', null, `
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
	
    float dist = distance(pos, vec2(0, 0));
    float alpha = smoothstep(0.0, 1.0,
      1.0 - (max(0.0, dist - 0.8) * 1.2)
    );
  	alpha = 1.0 - alpha;
	
    return vec4( 
      0.0, 0.0, 0.0, 
	    alpha
    );
  }
`);

loadShader('light', null, `
  uniform float tint;

  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    /*
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
    */

    return def_frag();
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

		vec4 total = vec4(0.0);
		float divisor = 0.0;
  
		for (float i = 0.0; i < 7.0; i += 1.0) {
			float s = -1.0;
			for (int j = 0; j < 2; j++) {
				float mult = (1.0 - i*0.1);
			
				total += mult * texture2D(
					tex, uv + s*vec2(blur * i/6.0, 0)
				);
				divisor += mult;

				s += 2.0;
			}
		}

		vec4 blurred = total / divisor;

		float light = (blurred.r + blurred.g + blurred.b) / 3.0;
		light *= 2.5 - (time * 1.6) - (0.4 * distance(uv, vec2(0.5)));
		vec4 darkened = vec4(light, light, light, c.a);
		
		return darkened;
	} 
`)

// old perish shader
// https://kaboomjs.com/play?example=add&code=eJx9VVFv4zYMfo5%2FBZGX2o2XpEnvMKzrgMPucC8DNuCwp2HYKTZja7UlQ1LSBof%2B932UnNZFuwOCWKLIjxTFj1yt6ENda9NQo3omu%2FuXq%2BApWPKVYzZZtlrRl6BcIEV3amdtHzWztM6LqPCbVTXO%2FeB0YFLec6C9g%2Bo8ifxqx8osB9PMS7rXoaXQMhnxOJeTedYB4UvUzZOkpPnqlXHxQq9prQ%2BnF5pJNOom5VbV7PL5wE77Fsrm0HUlfc1mB6P31vW0h1qgoHu%2BySibHbm6RvCqybHa0GB9SXF1OMbFNVW2s64kr%2FqhY7f5SIEfCvqWzZJtRbdU8%2F6fiFHcQJw87LqDw5E4oktaL9dXWziks1m4kkN%2BCAfHm485ViVc0iI6z8W4pHUR8ZL%2B5k39H%2F5Xf%2Fs9%2FHUZ45vqX38Pf6J%2FNpC94xpWebWoAByuFmGzCNtFuC5oRe%2BX66icstHppg2iO5otHSzO62ay3ontVmxns2R0eUub5TtEko%2B5vFq%2BL2S7Xl5jV2sflKk4Hx8MwS7fFZOb1crdsYmRyj6PqCW9%2FFRLFS3wc4wcmCczSB8p%2Byr1hTLvlA%2B%2Fdrq6AxpiPHj%2BAyX4ab8Hj%2FKLVHUXJeUF3f5C%2BTc894VEffFTLIRc4n6GyB6LQvj0geafhRy%2FRzrOSftImJ3yuiLUbSC7JzZBhxNpM%2FJSDD9PSawco1Z7VDDuGukYdwaGXpQ%2Fqap9FlGjjwyjaSOgil1Q8FCpQe10p4NmHxmv6hqxC9P7XffKLDpTSKWPkT67JWVqsZUGIwYlpeSm%2Bznes2M8nRiJYIKZVdYAbejUiYVGEsBf2cxPe0ZREhGCG4XF5HK9ukOUSBzw0Q8Q%2BVO%2FymbIUH61QUn%2FuI4QEUSExav0AAEHyIM1JanOWzyDihno7ZF7KGYzZ4OC%2BzNWghuFbyLGMyBmM9Rta9GtKpyzkwtJrpNwaor%2Bog2nrA36aCUqDXmOA3XoUgefB4sGtQ9ohX%2BnPr205s%2BhTnFoyUDPobU1WYO7dC9GQJmS1eAJ2cm7ER%2FFc2hBXnfAi2HvTtIpMQ3SszzDp3JHSxSnyjQdJ3%2BDs6AEqhaLo65Rl7vTG6kpqUUh0D1f4F8bTCLJrEwpuXDCgyHeDJloMKc8AZY8o0jqkuqQ7ifKsUVwpwYhgddSXMK3FLeQJxl5VEG6Q0Jf3Eb0y4gFWmaZNZGjz1ebMj9x%2BSYqruJIpR7PoJH%2FF1nNMHEol76hY7%2FA52fa4rNYyASJ%2BWrQZJySOUoOdAGT0tvikcaZLFr3ug6tUBCEall6Fjapop6YUyMq42NhJfY8wKlgSvseAYrz2WlydgbEbWYj0Z6YNk7dooRMOIKxcJKNlNhj9h%2BQT5zq

loadShader("un-perish", null, `
	uniform float time;
 
	vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
		vec4 c = def_frag();
		float blur = max(0.0, time * 0.013);
  
		vec4 total = vec4(0.0);
		float divisor = 0.0;
		for (float i = 0.0; i < 7.0; i += 1.0) {
			float s = -1.0;
			for (int j = 0; j < 2; j++) {
				float mult = (1.0 - i*0.1);
			
				total += mult * texture2D(
					tex, uv + s*vec2(blur * i/6.0, 0)
				);
				divisor += mult;

				s += 2.0;
			}
		}

		vec4 blurred = total / divisor;

		float light = (blurred.r + blurred.g + blurred.b) / 3.0;
		light *= 1.0 - (time * 0.6) - (0.4 * distance(uv, vec2(0.5)));
		vec4 darkened = vec4(light, light, light, c.a);
		
		return mix(blurred, darkened, min(1.0, max(0.0, time * 1.6)));
	} 
`);

// old un-perish
// https://kaboomjs.com/play?example=add&code=eJx9VW1v20YM%2Fmz9CsJfIsWq35IVw7IMKNaiXwpsQLFPRbGeJVq6RboT7s5OjCL%2FfQ%2FvbEdZsgKGdS%2FkQx7Jh1ws6F1da9NQo3omu%2FmHq%2BApWPKVYzZZtljQ56BcIEV3amNtHyWztM6LKPDJqhr3fnA6MCnvOdDWQXSajvxiw8rMB9NMS7rXoaXQMhmxOJWbadYB4XOUzdNJSdPFC%2BXimVzTWh8OzyTT0VE2CbeqZpdPd%2BbNwE77FvJm13UlfcsmO6O31vW0hWSgoHu%2BySib7Lm6hv%2BqybFa02B9SXG128fFNVW2s64kr%2FqhY7d%2BT4EfCvqeTZJuRbdU8%2FbviFHc4DhZ2HQ7h6tePeTL%2BbKMFumSsF5dQYzoBBBWEANm2Dlev8%2BxKmGcZtGNXGBKWhYROcmvX5V%2F87%2FyVz%2FCh2eiMpa%2F%2FhH%2BSP6kIHvHNbTyalYBOKxmYT0LV7NwXdCC3s6XUTjFpdNNG0T2qDZ30Ditm9F6I7pXojuZJKXLW1rNl%2FAkPwfzbSHb5fwau1r7oEzF%2BTF1cHb%2BUzF6Wa3cHZvoqezziFrS8081V1EDP8eIgaFeP5ycLc8YJY5NvpLM%2FjfFK3gVrT5S9k3ilHXgSKd8%2BL3T1R2s4007z3%2Bifj9styBhfnEu2YuS8oJuf6P8OyrkQiAvfhHI07NzefETWJE9FoXw8h1NPwrJ%2Foi0npL2kXgb5XVFKP5Adktsgg4H0ubIb1H8OG4GyjEKvgcNEKZI67gzUPQi%2FEFV7dMRNXrPUBo3FKrYBQULlRrURnc6aPaxc6i6hvPSMfpN90ItGlPIgo%2BePpklZWrRlUYlCiWlvKT3Od6yY2RdlORghJlV1gBt6NSBhYviwJds4se9pyiJCM4dD4vR43p1By8ROOCjr8Dzc9%2FLJohQvloj6T8vI0QEkcPiRXiAgAvEwZqSVOct0qBiBHq75x6C2cTZoGD%2BhJXgjoevIsY7IGYTlHxr0fUq3LOTB0ms0%2BFYFU1KG05RG%2FTeilca5zku1K5Lk2AaLLrcNqClfk39fm7NX0Od%2FNASgZ5Da2uyBm%2Fpno2SMgWrQQrZSd6I92I5tOC92yFj2LuDtFtMlZSWJ%2FhU9uirYlSZpuNkb3AW1EDVYrHXNepyc3glNCW1KAS65wv8a4OJJpGVaScPTnhQRM4QiQbzzhNgyTOKRHgd0vtEOPKYOzUICbyW4hLCJb%2BFPEnJowrSGxL67DaiX0Ys0DLLrIkkfXrauAkkMt9EwUUczdQjDRrxfxbVDGOLcmkhOrYOfH6lK3xmMxlDMV4NWpJTMo%2FJgS5gUsotknSc7SJ1r%2BvQCgVBqJal3WGTKurMnBpeGR8LK7HnAUYFUzr%2FEaA43R1GdydAvGZyJNqZacfpXZQ4E45gohxkIyX2mP0LFX2vwg%3D%3D

loadShader('butterflySpawn', null, `
  uniform float time;
  
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
    
    float light = (c.r + c.g + c.b) * 2.0;
    vec4 starter;

    if (light < 0.1) {
      starter = vec4(0,0,0, c.a);
    } else {
      starter = vec4(0.235, 0.117, 0.471, c.a);
    }
    
    return mix(
      c, 
      starter, 
      1.0 - time
    );
  }
`);

loadShader("perishScreenBackground", null, `
  uniform float time;
  
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
  	vec4 c = def_frag();
  	float newPosY = pos.y * 6.0 / 10.0;
  	
  	float dist = distance(vec2(0,0), vec2(pos.x, newPosY)) - 0.1;
  
  	float angle;
  
  	if (pos.x != 0.0) {
  		angle = atan(newPosY / pos.x) * 57.29;
  	} else {
  		angle = 0.0;
  	}
  	
  	if (pos.x < 0.0) {
  		angle += 180.0;
  	} else if (pos.x > 0.0 && newPosY < 0.0) {
  		angle += 360.0;
  	};
  
  	angle /= 360.0;
  	
  	float col = dist * 0.2;
  	col *= 1.0 + 0.15 * sin((angle + time / 120.0) * 140.0);
  
  	float altShimmer = sin((angle - time / 50.0) * 230.0) - 0.5;
  	altShimmer = altShimmer * altShimmer * altShimmer * altShimmer;
  	
  	col *= 1.0 + 0.05 * altShimmer;

  	float distModded = dist + 0.3;
  	col *= max(1.0, distModded * distModded);
  	
  	return vec4(
  		col * 0.55, 
  		0, 
  		col * 0.95,
  		1
  	);
  }
`);

loadShader('redOverlay', null, `
  uniform float opacity; 
  
  vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
	
    float dist = distance(pos, vec2(0, 0));
    dist *= dist * dist;
    
    float alpha = smoothstep(0.0, 1.0,
      dist * 0.25 + 0.07
    );

    alpha *= opacity;
	
    return vec4( 
      1.0, 0.0, 0.0, 
	    alpha
    );
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

// perish menu background
// https://kaboomjs.com/play?example=shader&code=eJyNU1tvmzAUfsa%2F4oyHylAKhJRu7ZZKa%2Fu2TZ3UvUzTtLrYCVbBjsC0mar89x0bSFg2aZMQ9rl837k6SeDL7c3tBbQl46IBrouuFsowI7UCqawiISRJ4Lprja4HP%2FLIHrSuaUBIpRm%2FWzfSCOo%2FCKb8CPykdYo2sYp4rVb%2B6OjQ1F%2BLRrblXdEIoa5Y8bhqdKc4QlVXVRHcE4BOyaVualgizoCRtXiLWvyeRHEKy4atKN4yWOs2AnfrnqLeWOhKNxG0rF5XosluwIhNAC%2BI9Xo7LICL5Q9HElhar4%2BixPNn3X5FM7LGPyGEsziFBGZpnDq3vSuXrbE0eDBVCJcLTaM06JOhlmATjYxBACeQxrOhhIGDqVU1VuXJJfQgeLVA13RI2HNOGIlhHDommLgEsagQ8tdxdu6S24KoWnEAGzPfjunv47z7M8zxAmZvdpCebw%2B4tAA4Otr16e8M87Mdw1hcb0umtn0bcFxDJ7GcNM6c2SpDzAYDHtvO5WhrpaJ0COM2wo4mcymEMDu1l4MGV%2BaulHWNi72Yok9GdD6As7m72BnlLvxvyIkQ%2FpewK%2FCgijQ%2FcCOTbfqkORd87IR1n087UbMNRZ5o6htOhGAXtBGma5R7CtRNxjHY0vLINcdLh3M0nOeRk2f274i25B5Pwjin3wgyFoY%2BS25KivtdCrkqDQ2CiHi4GP3WE8%2B9Onr18f31Byu2%2F3rqNIDFJdAX4nm%2BHYd%2F4aZCLXhryb8H5BfV7D8T
