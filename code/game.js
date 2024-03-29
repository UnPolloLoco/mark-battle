scene('game', () => {
  const Z = {
    bg:            0,
    mark:        100,
    player:      200,
    projectiles: 300,
    effects:     400,
    tiles:       500,
    ui:          600,
    pause:       700,
  }

  const GAME_STATUS = {
    paused: false,
    lost: false,
  };

  const TIME_REAL_INFO = {
    counter: 0,
    offset: 0,
    lastPause: 0
  };

  const SCORING = {
    points: 0,
    completion: 0,
    timer: 0,
  };

  const PHASE_STATUS = {
    activePhase: 1,
    cutscene: false,
  }
  

  ///////////////
  // functions //
  ///////////////

  function clamp(a, x, b) {
    return Math.max(Math.min(b, x), a);
  };

  ////

  function getPhase() {
    return clamp(
      1, 
      Math.floor(mark.health / -100) + 6, 
      5
    );
  };

  ////

  function builtinTime() {
    return time();
  };

  ////

  function timeReal() {
    return TIME_REAL_INFO.counter;
  };        
  
  ////

  function pauseToggle(override) {
    // check if ANY of the function is run
    if (!GAME_STATUS.lost && !PHASE_STATUS.cutscene) {
      
      if (override == undefined) {
        GAME_STATUS.paused = !GAME_STATUS.paused;
      } else {
        GAME_STATUS.paused = override;
      };

      if (GAME_STATUS.paused) {
        // paused
        // BUILT-IN TIME
        TIME_REAL_INFO.lastPause = builtinTime();
        get('pauseUI').forEach((p) => {
          p.opacity = p.trueOpacity;

          if (p.is('pauseStats')) {
            if (p.labelType == 'time') {
              let m = Math.floor(timeReal() / 60);
              let s = Math.floor(timeReal() % 60);
              s = s < 10 ? '0'+s : s;
              
              p.text = `${m}:${s} elapsed`;
              
            } else if (p.labelType == 'completion') {
              p.text = `${SCORING.completion}% complete`;
              
            } else if (p.labelType == 'points') {
              p.text = `${SCORING.points} points`;
            };
          };
        });
      } else {
        // unpaused
        // BUILT-IN TIME
        TIME_REAL_INFO.offset += builtinTime() - TIME_REAL_INFO.lastPause;
        get('pauseUI').forEach((p) => {
          p.opacity = 0;
        });
      };
      
      get('*').forEach((x) => {
        x.paused = GAME_STATUS.paused;
      });
    };
  };

  ////

  function clearMarkSpawns() {
    get('markSpawn').forEach((s) => {
      destroy(s);
    });
  };

  ////

  function damagePlayer(amount) {
    player.health -= amount;
    redDamageOverlay.opacityAlt = 0.7;
  };

  ////

  function blackScreenTransition(func) {
  	for (let i = 0; i <= 1; i++) {
  		wait(0.3*i, () => {
  			tween(
  				i, 1-i, 0.3,
  				(val) => blackOverlay.opacity = val,
  				easings.easeInOutSine
  			);
  		});
  	};

    if (func != undefined) wait(0.3, () => { func(); });
  };

  ////

  function setUIOpacity(num) {
    get('ui').forEach((ui) => {
      tween(
        1-num, num, 0.3,
        (val) => ui.opacity = val,
        easings.easeInOutSine
      );
    });
  };

  
  ////////////////////////////////
  // background + scene effects //
  ////////////////////////////////

  // main background image
  add([
    sprite('background'),
    pos(0,0),
    z(Z.bg),
    scale(SCALE/120),
  ]);

  // back platform
  add([
    sprite('platformBack'),
    pos(0,0),
    z(Z.bg + 1),
    scale(SCALE/120),
  ]);

  // shading
  add([
    sprite('shading'),
    pos(0,0),
    z(Z.bg + 2),
    scale(SCALE/120),
  ]);
  
  // torches
  add([
    sprite('torches', { anim: 'flicker' }),
    pos(0,0),
    z(Z.bg + 3),
    scale(SCALE/120),
  ]);
  
  // front platform (not bg)
  add([
    sprite('platformFront'),
    pos(0,0),
    z(Z.tiles),
    scale(SCALE/120),
  ]);

  // vignette

  add([
    pos(0,0),
    rect(width(), height()),
    color(RED),
    z(Z.ui - 10),
    shader('vignette'),
  ]);

  // damage shade

  const redDamageOverlay = add([
    pos(0,0),
    rect(width(), height()),
    color(RED),
    z(Z.ui - 11),
    shader('redOverlay', () => ({
      'opacity': 0 
    })),
    {
      opacityAlt: 0,
    }
  ]);

  ////

  const blackOverlay = add([
  	rect(width(), height()),
  	pos(0,0),
    fixed(),
  	color(BLACK),
  	z(1000),
  	opacity(0),
  ]);

  ///////////////////////////////////////
  // movement restrictors (nerd emoji) //
  ///////////////////////////////////////
  
  // underground shake proofer
  add([
    rect(width() + SCALE*4, SCALE*4),
    pos(-SCALE*2, height() - SCALE/8),
    opacity(0),
    area(),
    body({ isStatic: true }),
  ]);

  // movement borders
  for (let i = 0; i < 2; i++) {
    add([
      rect(SCALE*2, SCALE*12),
      pos(-SCALE*2 + 12*i*SCALE, -SCALE*5),
      color(BLACK),
      area(),
      body({ isStatic: true }),
      opacity(0),
	    "border",
    ]);
  };

  // ground hitbox 
  
  add([
    rect(width()*1.5, SCALE),
    pos(width()/2, height() - SCALE*0.375),
    anchor('top'),
    color(BLACK),
    area(),
    body({ isStatic: true }),
    opacity(0),
    "laserBreak",
  ]);

  // right platform hitbox 
  
  add([
    rect(SCALE*1.875, SCALE/4),
    pos(center().add(SCALE*1.25, SCALE*1.36)),
    color(BLACK),
    area(),
    body({ isStatic: true }),
    opacity(0),
    "laserBreak",
  ]);

  // left platform hitbox 
  
  add([
    rect(SCALE*1.875, SCALE/4),
    pos(center().add(-SCALE*1.25, SCALE*1.36)),
    anchor('topright'),
    color(BLACK),
    area(),
    body({ isStatic: true }),
    opacity(0),
    "laserBreak",
  ]);

  ////////////////
  // pause "ui" //
  ////////////////

  // pause menu dim
  
  add([
    rect(width(), height()),
    pos(0,0),
    fixed(),
    color(BLACK),
    opacity(0),
    z(Z.pause),
    "pauseUI", 
    {
      trueOpacity: 0.45,
    }
  ]);

  // pause icon bars
  
  for (let i = 0; i <= 2; i += 2) {
    add([
      pos(center().add(
        (i-1) * SCALE/2, 0
      )),
      rect(SCALE*2/3, SCALE*2),
      color(WHITE),
      opacity(0),
      z(Z.pause + 1),
      anchor('center'),
      "pauseUI", 
      {
        trueOpacity: 0.9,
      }
    ]);
  };

  // stats display

  for (let i = 0; i < 3; i++) {
    add([
      text('', { 
        size: SCALE/4,
        font: 'itim',
      }),
      pos(
        width() - SCALE/4, 
        height() - SCALE/4 - SCALE*i*0.285
      ),
      anchor('botright'),
      color(WHITE),
      z(Z.pause + 1),
      "pauseUI",
      "pauseStats",
      {
        trueOpacity: 0.6,
        labelType: [
          'points',
          'completion',
          'time'
        ][i],
      }
    ]);
  };
  
  ////////////////
  // characters //
  ////////////////
  
  // mark
  const mark = add([
    sprite('mark'),
    pos(SCALE*5, SCALE*2),
    scale(SCALE/500 * 2),
    rotate(0),
    anchor('center'),
    shader('mark', () => ({
  		'time': timeReal(),
      'rand': rand(),
      'tint': getShaderTint(),
  	})),
    z(Z.mark),
    opacity(1),
    area({
      shape: new Polygon([
        vec2(-140, -220), vec2(65, -220), vec2(210, -150), 
        vec2(260, -80),   vec2(260, 40),  vec2(65, 225),
        vec2(-100, 225),  vec2(-240, 90), vec2(-240, -80),
      ]),
      scale: vec2(0.8),
    }),
    'mark',
    {
      health: 500,
      sliced: false,
    }
  ]); 

  mark.laserFlare = mark.add([
    sprite('laserFlare', { anim: 'flash' }),
    anchor('center'),
    opacity(0),
  ]);


  // mark eye coords
  function markEyes() {
    let a = [];
    let b = [
      vec2(-SCALE*0.28, -SCALE*0.22),
      vec2(SCALE*0.28, -SCALE*0.28),
    ]; 
    for (let i = 0; i < 2; i++) {
    	a.push( 
        mark.pos.add(b[i])
      );
    }; 
    return a;
  };

  // mark movement binder
  function newMarkPos(x) {
    let bounds = [
      vec2( 5, 2 ),
      vec2( 5, 2 ),
    ];
    if (x == 0) {
      // pew pew
      bounds = [
        vec2( 1.6, 1.6 ),
        vec2( 8.4, 2.6 ),
      ];
    } else if (x == 1) {
      // minimark
      bounds = [
        vec2( 4, 1.6 ),
        vec2( 6, 2.3 ),
      ];
    } else if (x == 2) {
      // kaboom
      bounds = [
        vec2( 2.6, 1.6 ),
        vec2( 7.4, 2.6 ),
      ];
    } else if (x == 3) {
      // mega minimark
      bounds = [
        vec2( 4, 1.6 ),
        vec2( 6, 2.3 ),
      ];
    } else if (x == 4) {
      // egg
      bounds = [
        vec2( 1.2, 1.4 ),
        vec2( 8.8, 2.3 ),
      ];
    };

    let randPos = vec2(
      rand(bounds[0].x, bounds[1].x),
      rand(bounds[0].y, bounds[1].y),
    );

    return randPos.scale(SCALE);
  };

  // mark evil essence

  function getShaderTint() {
    if (get('mark').length == 1) {
      return (500 - mark.health) /500 *0.5;
    } else {
      return 0;
    };
  };

  // mark quiver

  function markQuiver() {
    let duration = rand(1, 3) * (9 - getPhase()) / 8; // x1 to x0.5
    let magnitude = rand(-10, 10);

    tween(
      mark.angle,
      magnitude,
      duration,
      (val) => mark.angle = val,
      choose([
        easings.easeInOutQuad,
        easings.easeOutBounce,
        easings.easeInOutCubic,
        easings.easeOutBack
      ]),
    );
    
    wait(duration + 0.5, markQuiver);
  };

  markQuiver();
  
  // bean
  const player = add([
    sprite('beans'),
    pos(SCALE*0.9, SCALE),
    scale(SCALE/500 / 3),
    anchor('center'),
    area(),
    body(),
    shader('light', () => ({ 'tint': getShaderTint() })),
    z(Z.player),
    "player",
    "laserBreak",
    {
      xVel: 0,
      isAttacking: false,
      lastAttack: -123,
      health: 10,
      attackedBy: [],
      timeOfDeath: -1,
    }
  ]);
  player.play('idle');

  // player hp bar

  const playerHealthBg = add([
    rect(
      SCALE/3 + SCALE/30, 
      SCALE/40 + SCALE/30
    ),
    pos(player.pos),
    color(BLACK),
    z(Z.ui - 2),
    "playerHealthBar",
    "ui",
  ]);

  const playerHealthBar = add([
    rect(SCALE/3, SCALE/40),
    pos(player.pos),
    color(GREEN),
    z(Z.ui - 1),
    "playerHealthBar",
    "phbColor",
    "ui",
  ]);
  
  // slash
  const slash = player.add([
    sprite('slash'),
    pos(0, -150),
    anchor('center'),
    scale(vec2(16, 10)),
    area({ 
      scale: vec2(0.95, 0.22),
      offset: vec2(0, 90),
    }),
    opacity(0),
    shader('white'),
    {
      attackID: rand(),
    }
  ]);

  // attack func
  function beanAttack() {
    if (!GAME_STATUS.paused) {
      let attackDelta = timeReal() - player.lastAttack;
      
      if (!player.isAttacking && attackDelta >= 0.25) {
        player.isAttacking = true;
        player.lastAttack = timeReal();
        player.gravityScale = 0.7;
       
        slash.flipX = (player.xVel >= 0);
        slash.opacity = 1;
        slash.play('attack');
        slash.attackID = rand();
        
        setTimeout(() => {
          mark.sliced = false;
          player.isAttacking = false;
          player.gravityScale = 1;
          
          slash.opacity = 0;
        }, 175);
      };
    };
  };

  // damage special fx
  function clashEffect(p, s) {
    add([
      pos(p),
      sprite('clash', { anim: 'clash' }),
      shader('white'),
      scale(SCALE/500 * s),
      z(Z.effects),
      lifespan(0.2),
      rotate(randi(0,360)),
      anchor('center'),
    ]);

    add([
      pos(p),
      sprite('whiteGlow'),
      scale(SCALE/500 * s),
      z(Z.effects),
      lifespan(0.05),
      opacity(0.5),
      rotate(randi(0,360)),
      anchor('center'),
    ]);

    SCORING.points += 10;
  };

  // constants
  
  setGravity(SCALE * 24);
  
  ////////////////
  // health bar //
  ////////////////
  
  // health bar shadow
  add([
    pos(0,0),
    fixed(),
    z(Z.ui),
    sprite('healthBarShade'),
    scale(SCALE/600 * 10),
    "ui",
  ]);
  
  // empty health bar
  add([
    rect(SCALE*6, SCALE/10),
    pos(SCALE*5, SCALE * 1/2),
    anchor('center'),
    color(rgb(15,15,15)),
    z(Z.ui),
    fixed(),
    "ui",
  ]);
  
  // colored part
  const healthBar = add([
    rect(SCALE*6, SCALE/10),
    pos(SCALE*2, SCALE * 9/20),
    //color(RED),
    color(rgb(140, 0, 240)),
    z(Z.ui),
    fixed(),
    "ui",
  ]);

  // name shadow
  add([
    pos(0,0),
    fixed(),
    z(Z.ui),
    sprite('nameShade'),
    scale(SCALE/600 * 10),
    "ui",
  ]);
  
  // the name of the evil guy of evilness himself
  add([
    text('MARK', {
      size: SCALE/2,  
      textAlign: 'center',
      font: 'playfair',
    }),
    pos(SCALE*5, SCALE/2),
    anchor('center'),
    color(WHITE),
    z(Z.ui),
    fixed(),
    "ui",
  ]);
	
  /////////////
  // buttons //
  /////////////
  
  onKeyPress('0', () => {
    debug.inspect = !debug.inspect; 
  });

  onKeyPress('p', () => {
    pauseToggle();
  });

  // debug and fun
  
  onKeyPress('m', () => {
    markAttack();
  });
  
  onKeyPress('n', () => {
    player.health = 0;
  });

  onKeyPress('b', () => {
    player.use( color(255,255,0) );
    player.health = 123456789;
  });

  onKeyPress('v', () => {
    player.pos = center();
  });
  
  onKeyPress('c', () => {
    mark.health -= 100;
  });

  onKeyPress('x', () => {
    for (let i = 0; i < 10; i++) {
      wait(i * 0.08, () => {
        markAttack();
      });
    };
  });

  onKeyPress('z', () => {
    clearMarkSpawns();
  });



  // keyboard movement
  
  if (!TOUCH) {

    // jump
    
    onKeyDown("w", () => {
      if (player.isGrounded() && !PHASE_STATUS.cutscene) {
        if (player.isEgged) {
  			  player.jump(JUMP_SPEED * EGG_JUMP_SLOWDOWN);
        } else {
  			  player.jump(JUMP_SPEED); // normal
        };
  		};
    });

    // left
    
  	onKeyDown("a", () => {
      if (!PHASE_STATUS.cutscene) {
        player.xVel = Math.max(
          -RUN_SPEED,
          player.xVel - RUN_SPEED * dt() * (
            player.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
          )
        );
      };
  	});

    // right

	  onKeyDown("d", () => {
      if (!PHASE_STATUS.cutscene) {
        player.xVel = Math.min(
          RUN_SPEED,
          player.xVel + RUN_SPEED * dt() * (
            player.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
          )
        );
      };
  	});

    // keyboard attack
    
    onKeyPress('space', () => {
      if (!PHASE_STATUS.cutscene) beanAttack();
    });

  };

  
  let lastClick = -1;
  
  
  onClick(() => {
    
    // touchscreen attack
    
    if (isTouchscreen() && timeReal() - lastClick < 0.2 && !PHASE_STATUS.cutscene) {
      beanAttack();
    };
    
    lastClick = timeReal();
  });
  
  ////////////////
  // collisions //
  ////////////////
  
  onCollide('player', 'border', (p,b) => {
    p.xVel *= -0.8;
    player.move(p.xVel/10, 0);
  });

  onCollide('laser', 'laserBreak', (l,g) => {
    if (l.curAnim() == 'beam') {
      if (g.is('player')) {
        damagePlayer(1);
      };
  	  l.play('boom');
      //shake(SCALE/35); one day...
  	  wait(0.05, () => { destroy(l); });
    };
  });
  
  //////////////////////
  // animation update //
  //////////////////////
  
  let playerLastYPos = player.pos.y;
  
  loop(0.02, () => {
    let yVelIndex = Math.round((playerLastYPos - player.pos.y) / SCALE * 100);
    playerLastYPos = player.pos.y;
    
    if (player.isAttacking /* OR just took damage? */) {
      // ATTACKING
      player.play('battle');
      player.flipX = false;
    } else {
      if (yVelIndex >= 2) {
        // JUMPING
        if (Math.abs(player.xVel / SCALE) >= 2) {
          player.play('jumpMove');
          player.flipX = (player.xVel < 0);
        } else {
          player.play('jump');
          player.flipX = false;
        }
      } else if (yVelIndex <= -2) {
        // FALLING
        if (Math.abs(player.xVel / SCALE) >= 2) {
          player.play('fallMove');
          player.flipX = (player.xVel < 0);
        } else {
          player.play('fall');
          player.flipX = false;
        }
      } else {
        // NOT JUMPING
        if (Math.abs(player.xVel / SCALE) >= 1) {
          player.play('moving');
          player.flipX = (player.xVel < 0);
        } else {
          player.play('idle');
          player.flipX = false;
        }
      };
    };
  });

  // out of sight out of mind
  
  add([sprite('minimark'),pos(width()*1.5, height()/2),z(Z.mark - 2),scale(SCALE/500 / 3),area(),body({ gravityScale: 0, mass: 0.1,}),anchor('center'),"minimark","purgatory",{xVel: 0,spawnDir: 1,spawnTime: timeReal(),canMove: false,health: 1234567890,attackedBy: -1,forceMove: 'none',slash: -1,lastAttack: -1,lastY: -1,isEgg: false,}]);

  //////////////////
  // mark attacks //
  //////////////////

  function markAttackExtraDelay() {
    return 1 - 0.2 * getPhase();
  };

  var maNum = -1; // mark attack number
  
  function markAttack() {
    maNum++;

    let phase = getPhase();
    let moveTime = 0.8 - 0.15*(phase - 1);

    if (phase < 5) {
      
      // ---------- MAIN ATTACK LINK ---------- 
      
      let curAttack = maNum % (phase + 1);

      if (mark.movementTween) mark.movementTween.cancel();
      
      mark.movementTween = tween(
        mark.pos,
        newMarkPos(curAttack),
        moveTime,
        (val) => mark.pos = val,
        easings.easeInOutQuad,
      );
      
      wait(moveTime + 0.4, () => {
        markAttackMain(curAttack);
      });
    } else {
      
      // ---------- SMOKE ATTACK LINK ---------- 
      
      let curAttack = maNum % 3;
      
      wait(moveTime + 0.4, () => {
        markAttackSmoke(curAttack);
      });
    }
  };

  function markAttackMain(curAttack) {
    if (curAttack == 0) {
      // LASERS

      mark.laserFlare.play('primed');

      tween(
        0, 1,
        0.7,
        (val) => mark.laserFlare.opacity = val,
        easings.linear,
      );

      wait(0.8, () => {
        mark.laserFlare.play('flash');
      });
      
      for (let n = 0; n < 2+getPhase(); n++) {
        wait(0.8 + (0.45 - getPhase()*0.05) * n, () => {
          for (let i = 0; i < 2; i++) {
            let eye = markEyes()[i];
            add([
              pos(eye),
              anchor('left'),
              sprite('laser', { anim: 'beam' }),
              scale(SCALE/500 / 2),
              area({ scale: vec2(1, 0.2) }),
              lifespan(1.5),
              rotate(player.pos.angle(eye)),
              z(Z.projectiles),
              "laser",
              "markSpawn",
              {
                dir: deg2rad( player.pos.angle(eye) ),
              }
            ]);
          };
        });
      };

      let laserFinishTime = 0.8 + (0.45 - getPhase()*0.05) * (2+getPhase());

      wait(laserFinishTime, () => {
        mark.laserFlare.play('primed'); 
        
        tween(
          1, 0,
          0.3,
          (val) => mark.laserFlare.opacity = val,
          easings.linear,
        );
      });
      
      wait(laserFinishTime + 0.75 + markAttackExtraDelay(), markAttack);
    } else if (curAttack == 1) {
      // MINI MARK

      let airTime = 1;
      
      for (let n = 0; n < 2; n++) {
        let mm = add([
          sprite('minimarkEgg', { anim: 'miniEgg' }),
          pos(mark.pos),
          z(Z.mark - 2),
          scale(SCALE/500 / 3),
          area(),
          body({ 
            gravityScale: 0, 
            mass: 0.75,
          }),
          anchor('center'),
          shader('light', () => ({ 'tint': getShaderTint() })),
          "minimark",
          "markSpawn",
          {
            xVel: 0,
            spawnDir: n%2==0 ? 1 : -1,
            spawnTime: timeReal(),
            canMove: false,
            health: 2,
            attackedBy: -1,
            forceMove: 'none',
            slash: -1,
            lastAttack: -1,
            lastY: -1,
            isEgg: true,
          }
        ]);

        mm.slash = mm.add([
          sprite('slash'),
          pos(400, -30),
          anchor('center'),
          scale(vec2(1.8, 3.5)), 
          area({ 
            scale: vec2(0.95, 0.22),
            offset: vec2(0, 90),
          }), 
          opacity(0),
          shader('white'),
          rotate(270),
          {
            attackID: rand(),
          }
        ]);

        // color change
        tween(
          rgb(60, 30, 120),
          rgb(255,255,255),
          airTime + 0.25,
          (c) => mm.color = c,
          easings.easeInQuart
        );

        // move away from mark
        tween(
          mm.pos,
          mm.pos.add(SCALE * 2.5 * mm.spawnDir, 0),
          airTime,
          (val) => mm.pos = val,
          easings.easeOutCubic,
        );

        // size increase
        let sizeTween = tween(
          mm.scale,
          vec2(SCALE/500 / 3*2),
          airTime + 0.25,
          (val) => mm.scale = val,
          easings.easeInQuint,
        );

        // drop to the ground
        wait(airTime + 0.3, () => {
          sizeTween.cancel();
          mm.gravityScale = 1;
          minimarkEggOpen(mm.pos, 0.5);
          mm.scale = mm.scale.scale(0.5);
          mm.play('miniFall');
        });
      };
      
      wait(airTime + 4 + markAttackExtraDelay(), markAttack);
    } else if (curAttack == 2) {
      // KABOOOOOM BUT BUTTERFLY
      let spawnT = timeReal();

      let b = add([
        sprite('butterfly', { anim: 'fly' }),
        pos(mark.pos.add(0, SCALE*1.25)),
        z(Z.projectiles),
        scale(SCALE/500 / 3),
        area(),
        anchor('center'),
        shader('butterflySpawn', () => ({
          'time': timeReal() - spawnT
        })),
        rotate(180),
        "butterfly",
          "markSpawn",
        {
          spawnTime: spawnT,
          dir: 180 * randi(0,2) + rand(-40, 40),
          canFly: false,
        }
      ]);

      b.glow = b.add([
        sprite('butterflyGlow', { anim: 'fly' }),
        anchor('center'),
        opacity(0),
      ]);

      b.areaGlow = add([
        sprite('whiteGlow'),
        anchor('center'),
        opacity(0),
        pos(b.pos),
        z(Z.projectiles - 1),
        scale(SCALE/500 * 2/3),
      ]);

      // funky smoke spawn effect
      for (let i = 0; i < 6; i++) {
        add([
          sprite('puff'),
          pos(b.pos),
          opacity(0.5),  
          move(rand(0,360), SCALE*rand(0.15,0.25)),
          scale(SCALE/500 *rand(0.25,0.5)),
          anchor('center'),  
          z(Z.projectiles + 1),
          rotate(randi(0,360)),
          "puff"
        ]);
      };
      
      // TWEEN BUTTER ANGLE

      tween(
        b.angle,
        player.pos.angle(b.pos) + 90,
        1,
        (val) => b.angle = val,
        easings.easeInOutCubic,
      );

      wait(1, () => {
        b.use(
          shader('light', () => ({ 'tint': getShaderTint() }))
        );

        b.canFly = true;
      });
      
      wait(1.6 + markAttackExtraDelay(), markAttack)
    } else if (curAttack == 3) {
      // M E G A MINI MARK

      let airTime = 1;
      
      for (let n = 0; n < 2; n++) {
        let mm = add([
          sprite('minimarkEgg', { anim: 'megaEgg' }), // mega egga :)))
          pos(mark.pos),
          z(Z.mark - 2),
          scale(SCALE/500 / 3*2),
          area({
            scale: vec2(0.85, 0.65),
            offset: vec2(0, 135),
          }),
          body({ 
            gravityScale: 0, 
            mass: 1.25,
          }),
          anchor('center'),
          shader('light', () => ({ 'tint': getShaderTint() })),
          rotate(0),
          "minimark",
          "megaMinimark",
          "markSpawn",
          {
            xVel: 0,
            spawnDir: n%2==0 ? 1 : -1,
            spawnTime: timeReal(),
            canMove: false,
            health: 4,
            attackedBy: -1,
            forceMove: 'none',
            extra: -1,
            lastAttack: -1,
            lastY: -1,
            isEgg: true,
          }
        ]);

        mm.extra = add([
          sprite('megaMinimarkExtras'),
          anchor('center'),
          opacity(0),
          scale(SCALE/500 / 3*2),
          z(Z.player - 1),
          rotate(0),
          shader('light', () => ({ 'tint': getShaderTint() })),
          "markSpawn",
        ]);

        // color change
        tween(
          rgb(60, 30, 120),
          rgb(255,255,255),
          airTime + 0.25,
          (c) => mm.color = c,
          easings.easeInQuart
        );

        // move away from mark
        tween(
          mm.pos,
          mm.pos.add(SCALE * 2.5 * mm.spawnDir, 0),
          airTime,
          (val) => mm.pos = val,
          easings.easeOutCubic,
        );

        // size change
        let sizeTween = tween(
          mm.scale,
          vec2(SCALE/500 / 3*2*2),
          airTime + 0.25,
          (val) => mm.scale = val,
          easings.easeInQuint,
        );

        // drop down
        wait(airTime + 0.3, () => {
          sizeTween.cancel();
          mm.gravityScale = 1;
          minimarkEggOpen(mm.pos, 0.65);
          mm.scale = mm.scale.scale(0.5);
          mm.play('megaFall');
        });
      };
      
      wait(airTime + 4 + markAttackExtraDelay(), markAttack);
    } else if (curAttack == 4) {
      // THE EGG

      // mark shake
      let shakeCount = 16;
      let shakeMagnitude = 1/15;
      
      for (let i = 0; i < shakeCount; i++) {
        let smModified = shakeMagnitude * (i+1) / shakeCount; // increase shake as time passes
        
        wait(0.1 * i, () => {
          mark.pos = mark.pos.sub(SCALE * smModified, 0); // left
        });
        wait(0.05 + 0.1*i, () => {
          mark.pos = mark.pos.add(SCALE * smModified, 0); // right
        });
      };

      wait(0.1*shakeCount, () => {
        add([
          sprite('egg'),
          pos(mark.pos),
          z(Z.mark - 1),
          scale(SCALE/500 / 1.5),
          area({ 
            collisionIgnore: ['minimark', 'player'],
            scale: vec2(0.65, 1),
          }),
          body(),
          anchor('center'),
          shader('light', () => ({ 'tint': getShaderTint() })),
          "egg",
          "markSpawn",
        ]);
      });
        
      wait(0.7 + 0.1*shakeCount + markAttackExtraDelay(), markAttack);
    };
  };

  ////////////////
  
  ////////////////
  
  ////////////////

  function markAttackSmoke(curAttack) {
    
  };

  wait(1.5, () => {
    markAttack();
  });

  /////////////////////////////
  // mark attack fancy funcs //
  /////////////////////////////

  function butterflyExplosion(butter) {
    if (player.pos.dist(butter.pos) < SCALE * 2) {
      damagePlayer(3);
    };
  };

  function minimarkEggOpen(eggPos, opac) {
    for (let i = 0; i < 25*opac; i++) {
      add([
        sprite('puff'),
        pos(eggPos),
        opacity(opac),
        move(360/15 * i, SCALE * 2.5),
        scale(SCALE/500 * 0.6),
        anchor('center'),
        z(Z.effects),
        rotate(rand(0, 360)),
        "puff",
        "eggPuff" // õ-ô
      ]);
    };
  };

  /////////////////////
  // player onupdate //
  /////////////////////

  player.onUpdate(() => {
  if (!GAME_STATUS.paused) {
    // player health
    playerHealthBg.pos = player.pos.add(
      -SCALE/6 - SCALE/60,
      SCALE/4 - SCALE/60
    );
    
    playerHealthBar.pos = player.pos.add(
      -SCALE/6,
      SCALE/4,
    );

    playerHealthBar.width = SCALE/3 / 10*player.health;

    if (player.health <= 3) {
      playerHealthBar.color = (timeReal() * 6) % 1 < 0.5 ? WHITE : RED;
    } else {
      playerHealthBar.color = GREEN;
    };
  };
  });
  
  ////////////////////
  // touch controls //
  ////////////////////

  // touch jump 
  
  let touchJumpCheck = SCALE * -5;
  if (TOUCH) {
    loop(0.05, () => {
      if (!PHASE_STATUS.cutscene) {
        let fixedMousePos = mousePos().y - canvas.getBoundingClientRect().top;
        if (fixedMousePos < touchJumpCheck - SCALE*1 && player.isGrounded()) {
          if (player.isEgged) {
    			  player.jump(JUMP_SPEED * EGG_JUMP_SLOWDOWN);
          } else {
    			  player.jump(JUMP_SPEED); // normal
          };
        };
        touchJumpCheck = fixedMousePos;
      };
    });
  };
  
  onUpdate(() => {
  if (!GAME_STATUS.paused) {
    // touch movement
    if (TOUCH && !PHASE_STATUS.cutscene) {
      
      if (isMouseDown()) {
        if ((mousePos().x - canvas.getBoundingClientRect().left) < player.pos.x) {
          player.xVel = Math.max(
            -RUN_SPEED,
            player.xVel - RUN_SPEED * dt() * (
              player.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
            )
          );
        } else {
          player.xVel = Math.min(
            RUN_SPEED,
            player.xVel + RUN_SPEED * dt() * (
              player.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
            )
          );
        };
      };
      
    };

    //////////////////////////
    // player indirect move //
    //////////////////////////
    let doFriction = false;
    if (!TOUCH) {
      // on keyboard and not pressing a nor d
      if (!(isKeyDown('a') || isKeyDown('d'))) {
        doFriction = true;
      };
    } else {
      // on touch and not holding down
      if (!isMouseDown()) {
        doFriction = true;
      };
    };

    if (doFriction) {
      player.xVel -= player.xVel * dt() * (
        player.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
      );
    };
    
    player.move(player.xVel, 0);

    /////////////////
    // health bars //
    /////////////////

    // mark health
    healthBar.width = SCALE*6 * mark.health/500; 

    
    //////////////////
    // mark damaged //
    //////////////////
    if (!mark.sliced && slash.isColliding(mark) && player.isAttacking) {
      mark.sliced = true;
      mark.health -= 5;
      SCORING.completion = Math.floor((500 - mark.health) / 5);

      let clashPos = mark.pos.add(
    		(mark.pos.sub(player.pos))
    		.unit().scale(-SCALE)
    	);

      // ten points get added by clashEffect,
      // so hitting mark adds 20
      SCORING.points += 10;
      
      clashEffect(clashPos, 3);
      
      shake(SCALE/10);
    };

    ////////////
    // lasers //
    ////////////
    mark.update() // if this isnt here then the laser eye anim doesnt work??
    
    get('laser').forEach((l) => {
  		if (l.curAnim() == 'beam') {
  			l.pos = l.pos.add(
  				SCALE*12 * dt() * Math.cos(l.dir),
  				SCALE*12 * dt() * Math.sin(l.dir)
  			);
  		};
  	});

    /////////////////
    // minimark ai //
    /////////////////

    let mmCount = 0;
    
    get('minimark').forEach((m) => {
      
      mmCount++;
      m.color = mmCount == 1 ? RED : WHITE;

      if (m.is('purgatory')) {
        m.pos = vec2(width() * 1.5, height()/2);
        m.gravityScale = 0;
      };
      
      if (timeReal() - m.spawnTime < 0.7 && rand() < 0.35) {
        add([
          sprite('puff'),
          pos(m.pos),
          opacity(0.4),  
          move(rand(0,360), SCALE*rand(0.2,0.3)),
          scale(SCALE/500 *rand(0.25,0.6)),
          anchor('center'),  
          z(Z.mark - 1),
          rotate(randi(0,360)),
          "puff"
        ]);
      };

      // ACTUAL MINIMARK
      
      let megaMulti = (m.is('megaMinimark') ? 0.2 : 1);
      let approachStop = (m.is('miniMark') ? SCALE*2 : SCALE*0.6);

      let mmmAttackStop = false;
      if (m.is('megaMinimark')) {
        let laDelta = timeReal() - m.lastAttack;
        if (laDelta < 1.2) {
          mmmAttackStop = true;
        }
      };

      if (m.curAnim() == 'miniFall' || m.curAnim() == 'megaFall') {
        if (m.isGrounded()) {
          m.use(sprite(`${m.is('megaMinimark') ? 'megaM' : 'm'}inimark`));
          m.isEgg = false;
        };
      };
      
      if (m.canMove) {
        if (player.pos.x <= m.pos.x - approachStop || m.forceMove == 'left' && !mmmAttackStop) { // left
          m.xVel = Math.max(
            -RUN_SPEED * 0.75,
            m.xVel - RUN_SPEED * 0.75 * megaMulti * dt() * (
              m.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
            )
          );
        } else if (player.pos.x >= m.pos.x + approachStop || m.forceMove == 'right' && !mmmAttackStop) { // right
          m.xVel = Math.min(
            RUN_SPEED / 2,
            m.xVel + RUN_SPEED * 0.75 * megaMulti * dt() * (
              m.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
            )
          );
        } else if ((Math.abs(player.pos.x - m.pos.x) < approachStop && Math.abs(player.pos.y - m.pos.y) < SCALE/4) || mmmAttackStop) { 
          // slowing
          m.xVel -= m.xVel * dt() * (
            m.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
          );
          if ((player.pos.y > SCALE*4.3 || m.pos.y > SCALE*4.5) && Math.abs(player.pos.y - m.pos.y) > approachStop) {
            m.forceMove = rand() < 0.5 ? 'left' : 'right';
          };
        };
        // jumping
        if (player.pos.y < m.pos.y - SCALE*0.75 && m.isGrounded() && !mmmAttackStop) {
          let mpxs = m.pos.x / SCALE;
          if ( !((1.4 < mpxs && mpxs < 4) || (6 < mpxs && mpxs < 8.5)) ) {
            m.forceMove = 'none';
            m.jump(JUMP_SPEED);
          };
        };

        // removing forcemove
        if (Math.abs(player.pos.y - m.pos.y) < SCALE/8) {
          m.forceMove = 'none';
        };
      
        m.move(m.xVel, 0);
      // cant move yet
      } else if (m.spawnTime + 2 < timeReal()) {
        m.canMove = true;
      };

      ////////////////////
      // minimark dmged //
      ////////////////////
      if (slash.isColliding(m) && m.attackedBy != slash.attackID && player.isAttacking) {
        m.attackedBy = slash.attackID;
        m.health--;

        let clashPos = m.pos.add(
      		(m.pos.sub(player.pos))
      		.unit().scale(-SCALE / 3)
      	);
        
        clashEffect(clashPos, (m.is('megaMinimark') ? 2:1));
        
        if (m.health <= 0) {
          if (m.is('megaMinimark')) {
            destroy(m.extra);
          };
          destroy(m);
        };
      };

      /////////////////////
      // minimark attack //
      /////////////////////

      if (
        m.canMove
        &&
        !m.is('megaMinimark')
        &&
        timeReal() - m.lastAttack > 0.35
        &&
        Math.abs(player.pos.x - m.pos.x) < SCALE/2
        &&
        Math.abs(player.pos.y - m.pos.y) < SCALE/2
      ) {
        m.lastAttack = timeReal();

        let pmpx = (player.pos.x - m.pos.x < 0);
        m.slash.flipX = pmpx;
        m.slash.pos.x = (pmpx ? -400 : 400);
        m.slash.angle = (pmpx ? 90 : 270);
        
        m.slash.opacity = 1;
        m.slash.play('attack');
        m.slash.attackID = rand();
        
        setTimeout(() => {
          m.slash.opacity = 0;
        }, 175);
      };

      //////////////////////////
      // MEGA minimark attack //
      //////////////////////////

      if (
        m.is('megaMinimark') 
        &&
        timeReal() - m.lastAttack > 3 
        &&
        timeReal() - m.spawnTime > 3
        /* LINE OF SIGHT CHECK WHEN */
      ) {
        m.canMove = false;
        m.lastAttack = timeReal();
        wait(1, () => {
          if (m.health > 0) {
            for (let i = 0; i < 2; i++) {
              let eyes = [
              	vec2(0, 0.18),
              	vec2(-0.13, 0.16),
              ];
              let eye = eyes[i].scale(SCALE);

              if (m.flipX) {
                eye = eye.scale(vec2(-1, 1));
              };
              
              add([
                pos(m.pos.add( eye )),
                anchor('left'),
                sprite('laser', { anim: 'beam' }),
                scale(SCALE/500 / 4),
                area({ scale: vec2(1, 0.2) }),
                lifespan(1.5),
                rotate(player.pos.angle(m.pos.add(eye))),
                z(Z.projectiles),
                "laser",
                {
                  dir: deg2rad( player.pos.angle(m.pos.add(eye)) ),
                }
              ]);
              
            };
          };
        });
      };

      ///////////////////////////
      // minimark attack check //
      ///////////////////////////
      
      if (
        !m.is('megaMinimark')
        &&
        m.slash.opacity == 1 
        &&
        m.slash.isColliding(player) 
        && 
        !player.attackedBy.includes(m.slash.attackID)
      ) {
        player.attackedBy.push(m.slash.attackID);
        player.attackedBy = player.attackedBy.slice(-10);
        damagePlayer(1);
        player.xVel = (player.pos.x - m.pos.x < 0) ? -RUN_SPEED : RUN_SPEED;
      };

      /////////////////////////
      // minimark animations //
      /////////////////////////

      if (!m.isEgg && !m.is('megaMinimark')) {
        // minimark
        
        if (timeReal() - m.lastAttack < 0.2) {
          m.play('attacking');
        } else {
          if (m.isGrounded() || m.lastY == -1) {
            // MOVING
            m.play('moving');
          } else if (m.pos.y > m.lastY) { 
            // FALLING
            m.play('fallMove');
          } else { 
            // JUMPING
            m.play('jumpMove');
          };
          m.flipX = (m.xVel < 0);
        };

      } else if (!m.isEgg) {
        // mega minimark

        let laDelta = timeReal() - m.lastAttack;
        if (laDelta < 1.2) {
          // ATTACKING
          if (laDelta < 0.5) {
            if (m.curAnim() != 'roll') m.play('roll');
            m.extra.opacity = 1;
            m.extra.play('mouth');
          } else {
            if (m.curAnim() != 'roll') m.play('roll');
            m.extra.opacity = 1;
            m.extra.play('laser');
          }
        } else {
          if (m.isGrounded() || m.lastY == -1) {
            // MOVING
            if (m.curAnim() != 'roll') m.play('roll');
            m.extra.opacity = 0;
          } else if (m.pos.y > m.lastY) { 
            // FALLING
            if (m.curAnim() != 'fall') m.play('fall');
            m.extra.opacity = 0;
          } else { 
            // JUMPING
            if (m.curAnim() != 'jump') m.play('jump');
            m.extra.opacity = 0;
          };
          m.flipX = (m.xVel > 0);
          m.animSpeed = Math.abs(m.xVel/SCALE);
        };
        
        m.extra.angle = m.angle;
        m.extra.pos = m.pos;
        m.extra.flipX = m.flipX;
      }

      m.lastY = m.pos.y;
      
    });

    //////////////////////
    // kaboom butterfly //
    //////////////////////

    get('butterfly').forEach((b) => {
      if (b.canFly) {
        b.pos = b.pos.add(Vec2.fromAngle(b.dir).scale(SCALE * dt()))
        b.angle = b.dir + 90;

        let angleToBean = player.pos.angle(b.pos); // from b.pos to player.pos
        b.dir = angleToBean;

        b.areaGlow.pos = b.pos;

        let lifeLength = timeReal() - (b.spawnTime + 1);

        if (rand() < lifeLength ** 2 / 36) {
    	  	add([
    	  		sprite('puff'),
    	  		pos(b.pos),
      			opacity(0.4),  
    	  		move(rand(0,360), SCALE*rand(0.15,0.25)),
    	  		scale(SCALE/500 *rand(0.25,0.5)),
    	  		anchor('center'),  
    	  		z(Z.projectiles - 1),
    	  		rotate(randi(0,360)),
    		  	"puff"
    	  	]);
      	};

        let o = (
          (lifeLength / 5) ** 8
          *
          Math.sin(30.2 * lifeLength) 
          +
          (lifeLength / 5) ** 3
        );
        
        // let o = (lifeLength ** 2 / 25);
        // o += 0.3 * Math.sin(15 * lifeLength);

        b.glow.opacity = o;
        b.areaGlow.opacity = o;

        if (lifeLength >= 5) {
          addKaboom(b.pos, {
            scale: 1/231 * SCALE*4
          });
          butterflyExplosion(b);
          destroy(b.areaGlow);
          destroy(b);
        };
      };
    });

    //////////////////
    // egg behavior //
    //////////////////

    // preset
    player.isEgged = false;

    get('egg').forEach((e) => {
      if (e.frame == 0 && e.isGrounded()) {
        e.scale = e.scale.scale(2);
        e.play('splatter');
        
        e.unuse('body');
        
        e.use(
          area({
            scale: vec2(0.9, 0.2),
            offset: vec2(0, -50),
          })
        );
        e.use(
          z(Z.tiles + 1)
        );
        
        e.pos = e.pos.add(0, SCALE/24 * 7)
      };

      if (rand() < 0.1) {
    		add([
    			sprite('puff'),
    			pos(e.pos),
    			opacity(0.4),
    			move(rand(200,340), SCALE*rand(0.2,0.3)),
    			scale(SCALE/500 *rand(0.4,0.8)),
    			anchor('center'),
    			z(Z.mark - 2),
    			rotate(randi(0,360)),
    			"puff"
    		]);
    	};
      
      if (e.isColliding(player)) {
        player.isEgged = true;
      };
      
      if (player.isEgged) {
        player.xVel = clamp(
          -RUN_SPEED * EGG_SLOWDOWN, 
          player.xVel, 
          RUN_SPEED * EGG_SLOWDOWN,
        );
      };
    });

    //////////////////////////////////////
    // mark visual phases + smoke puffs //
    //////////////////////////////////////

    if (rand() < 0.25 + (mark.frame)/10) {
  		add([
  			sprite('puff'),
  			pos(mark.pos),
  			opacity(0.5),
  			move(rand(0,360), SCALE*rand(0.15,0.25)),
  			scale(SCALE/500 *rand(0.5,1)),
  			anchor('center'),
  			z(Z.mark - 2),
  			rotate(randi(0,360)),
  			"puff"
  		]);
  	};

    let mcmf = markCavities[mark.frame];
  	for (let i = 0; i < mcmf.length; i++) {
  		let mi = mcmf[i];

  		if (mcmf.length > i && rand() < 0.3) {
  			add([
  			  sprite('puff'),
  		    pos(mark.pos.add(mi[0].scale(SCALE))),
  		  	opacity(0.5),
  		  	move(mi[1] + 8*Math.sin(timeReal()*(3+mark.frame)), SCALE*rand(0.4,0.5)),
  	    	scale(SCALE/500 * mi[2]),
  		    anchor('center'),
		    	z(1),
  				rotate(mi[1]),
          "puff",
  				"jetPuff"
  	    ]);
  		};
  	};
  
  	get('puff').forEach((p) => {
  		p.opacity -= dt()*0.1;
  		if (p.is('jetPuff')) {
  			p.opacity -= dt() * (0.15 - mark.frame/30);
  		}
      if (p.is('eggPuff')) {
  			p.opacity -= dt() * (1.5 - mark.frame/30);
  		}
  		if (p.opacity <= 0) {
  			destroy(p);
  		};
  	});

    ///////////////////////
    // MARK PHASE CHANGE //
    ///////////////////////

    function setupPhaseChangeCutscene() {
      if (!true) {
        phaseChangeCutscene();
        return;
      };
      
      PHASE_STATUS.activePhase += 1;
      PHASE_STATUS.cutscene = true;

      setUIOpacity(0);
      clearMarkSpawns();

      wait(0.8, () => {
        blackScreenTransition(() => {
          player.xVel = 0;
          player.pos = vec2(
            width()/2,
            height() - SCALE
          );

          mark.movementTween.cancel();
          mark.pos = vec2(
            width()/2,
            SCALE*2
          );
          
          phaseChangeCutscene();
        });
      });
    }

    ////

    function phaseChangeCutscene() {
      if (!true) {
        endPhaseChangeCutscene();
        return;
      };
      
      camPos(mark.pos);
      camScale(2.5);

      let t = tween(
        2.5, 2, 1.5,
        (val) => camScale(val),
        easings.linear
      );
      
      wait(1.5, () => {
        t.cancel();

        camPos(center());
        
        tween(
          1.3, 1, 0.5,
          (val) => camScale(val),
          easings.easeOutCubic
        );
        
        wait(0.8, endPhaseChangeCutscene);
      });

    };

    ////

    function endPhaseChangeCutscene() {
      if (!true) {
        return;
      };
      
      mark.frame = Math.min(3, getPhase() - 1);
      if (getPhase() == 5) {
        mark.opacity = 0;
      };
      
      PHASE_STATUS.cutscene = false;
      setUIOpacity(1);
    }

    ////

    if (getPhase() != PHASE_STATUS.activePhase) {
      setupPhaseChangeCutscene();
    }

    /////////////////
    // LOSS EFFECT //
    /////////////////
    
    if (player.health <= 0) {
      if (player.timeOfDeath == -1) {
        // BUILT-IN TIME
        player.timeOfDeath = builtinTime();

        // hide pause ui
        get('pauseUI').forEach((p) => {
          p.pos.y = -2 * height();
        });

        playerHealthBar.width = 0;

        pauseToggle(true);
        GAME_STATUS.lost = true;
        
        wait(1.6, () => {
          go('fail', SCORING);
        });
      };
      usePostEffect('perish', () => ({
        // BUILT-IN TIME
        'time': builtinTime() - player.timeOfDeath,
      }));
    };

    ///////////////////
    // DAMAGE EFFECT //
    ///////////////////

    if (redDamageOverlay.opacityAlt > 0) {
      redDamageOverlay.opacityAlt -= dt() * 2.5;
      redDamageOverlay.use(
        shader('redOverlay', () => ({
          'opacity': redDamageOverlay.opacityAlt
        }))
      );
    };
    
    ///////////////
    // WIN EVENT //
    ///////////////

    if (mark.health <= 0 && player.health > 0) {
      go('win');
    };

    // NEEDS TO BE BUILT-IN TIME
    TIME_REAL_INFO.counter = builtinTime() - TIME_REAL_INFO.offset;
    
    SCORING.timer = timeReal();
  };
  // end of un-paused checker thingy
    
    
  });
});

go('game');
