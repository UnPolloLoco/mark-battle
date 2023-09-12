scene('game', () => {
  const Z = {
    bg:            0,
    mark:        100,
    player:      200,
    projectiles: 300,
    effects:     400,
    tiles:       500,
    ui:          600,
  }

  ///////////////
  // functions //
  ///////////////

  function clamp(a, x, b) {
    return Math.max(Math.min(b, x), a);
  };
  
  ////////////////
  // background //
  ////////////////
  
  add([
    pos(0,0),
    rect(width(), height()),
    fixed(),
    color(rgb(50,50,50)),
    shader('light', () => ({
      'tint': getShaderTint(),
  	})),
    z(Z.bg),
  ]);
  
  // bricks
  for (let r = -1; r <= 6; r++) {
    for (let c = -1; c <= 10; c++) {
      add([
        sprite('bgBlock'),
        opacity(0.08),
        pos(SCALE*c, SCALE*r),
        z(Z.bg),
        scale(SCALE/500),
        shader('light', () => ({ 'tint': getShaderTint(), })),
      ]);
    };
  }; 
  
  // underground shake proofer
  add([
    rect(width() + SCALE*2, SCALE*2),
    pos(-SCALE, height() - SCALE/3),
    color(rgb(130,130,130)),
    z(Z.bg),
    shader('light', () => ({ 'tint': getShaderTint() })),
    area(),
    body({ isStatic: true }),
  ]);
  
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
  		'time': time(),
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
      bounds = [
        vec2( 1.6, 1.6 ),
        vec2( 8.4, 2.6 ),
      ];
    } else if (x == 1) {
      bounds = [
        vec2( 4, 1.6 ),
        vec2( 6, 2.3 ),
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
    let duration = rand(1, 3);
    let magnitude = rand(-10, 10);

    tween(
      mark.angle,
      magnitude,
      duration,
      (val) => mark.angle = val,
      choose([
        easings.easeInOutQuad,
        easings.easeInOutQuad,
        easings.easeInOutQuad,
        
        easings.easeOutBounce,
        easings.easeInOutCubic,
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
    }
  ]);
  player.play('idle');

  const tempHealth = add([
    text('', {
      size: SCALE,
    }),
    color(WHITE),
    pos(SCALE/8, height()-SCALE/8),
    z(Z.ui),
    anchor('botleft'),
  ]);
  tempHealth.onUpdate(() => {
    tempHealth.text = player.health;
  });
  
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
    let attackDelta = time() - player.lastAttack;
    
    if (!player.isAttacking && attackDelta >= 0.25) {
      player.isAttacking = true;
      player.lastAttack = time();
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
  };
	
  // movement borders
  for (let i = 0; i < 2; i++) {
    add([
      rect(SCALE, SCALE*10),
      pos(-SCALE + 11*i*SCALE, -SCALE*3),
      color(BLACK),
      area(),
      body({ isStatic: true }),
      opacity(0),
	    "border",
    ]);
  };

  // constants
  
  setGravity(SCALE * 24);
  
  ///////////
  // level //
  ///////////

  const level = [
    '      #####>        #####>      ',
    '                                ',
    '                                ',
    '                                ',
    '################################',
  ];
  
  const levelConf = {
    tileWidth: SCALE/3,
    tileHeight: SCALE/3,
    pos: vec2(-SCALE/3, SCALE * 13/3),
    tiles: {
      "#": () => [
        sprite('block'),
        area(),
        body({ isStatic: true }),
        anchor('topleft'),
        scale(SCALE/500 / 3),
        shader('light', () => ({ 'tint': getShaderTint() })),
        z(Z.tiles),
        "block",
        { style: 'block' }
      ],
      ">": () => [
        sprite('rightBlock'),
        area(),
        body({ isStatic: true }),
        anchor('topleft'),
        scale(SCALE/500 / 3),
        shader('light', () => ({ 'tint': getShaderTint() })),
        z(Z.tiles), 
        "block",
        { style: 'rightBlock' }
      ],
    },
  };
  
  const levelObject = addLevel(level, levelConf);
  
  // adding the... actual blocks
  let theFilthyKids = levelObject.children;
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < theFilthyKids.length; i++) {
      let obj = theFilthyKids[i];
      if (j == 0) {
        // block border
        add([
          rect(SCALE/3 + SCALE/25, SCALE/3 + SCALE/25),
          pos(obj.pos
            .add(-SCALE/3, SCALE*13/3)
            .sub(SCALE/50, SCALE/50)
          ),
          z(Z.tiles - 1),
          color(BLACK),
        ]);
        // add the block
        add([
          sprite(obj.style),
          pos(obj.pos.add(-SCALE/3, SCALE*13/3)),
          scale(SCALE/500 / 3),
          z(Z.tiles),
          area(),
          body({ isStatic: true }),
          shader('light', () => ({ 'tint': getShaderTint() })),
          "laserBreak",
        ]);
        // block shadow
        if (obj.pos.y < SCALE) {
          add([
            rect(SCALE/3, SCALE*3),
            pos(obj.pos
              .add(-SCALE/3, SCALE*14/3)
            ),
            z(Z.tiles - 2),
            color(rgb(20,20,20)),
            opacity(0.2),
            shader('light', () => ({ 'tint': getShaderTint() }))
          ]);
        };
      // murder the block
      } else {
        destroy(theFilthyKids[i]);
      };
    };
  };
  
  ////////////////
  // health bar //
  ////////////////
  
  // health bar shadow
  for (let i = 1; i <= 3; i++) {
    add([
      rect(SCALE*6 + SCALE/60*i, SCALE/10 + SCALE/60*i),
      pos(SCALE*5, SCALE/2),
      anchor('center'),
      color(BLACK),
      opacity(0.18),
      z(Z.ui),
      fixed(),
    ]);
  };
  
  // empty health bar
  add([
    rect(SCALE*6, SCALE/10),
    pos(SCALE*5, SCALE * 1/2),
    anchor('center'),
    color(rgb(15,15,15)),
    z(Z.ui),
    fixed(),
  ]);
  
  // colored part
  const healthBar = add([
    rect(SCALE*6, SCALE/10),
    pos(SCALE*2, SCALE * 9/20),
    //color(RED),
    color(rgb(140, 0, 240)),
    z(Z.ui),
    fixed(),
  ]);
  
  // health bar label
  for (let i = 0; i < 9; i++) {
    let textPos;
    let textColor;
    let textOpacity;
    if (i == 8) {
      textPos = vec2(0,0);
      textColor = WHITE;
      textOpacity = 1;
    } else {
      textPos = vec2(
        Math.cos(Math.PI*2 * i/8),
        Math.sin(Math.PI*2 * i/8),
      );
      textPos = textPos.scale(SCALE/40);
      textColor = BLACK;
      textOpacity = 0.1;
    };
    for (let j = 1; j <= 3; j++) {
      add([
        text('MARK', {
          size: SCALE/2,  
          textAlign: 'center',
          font: 'playfair',
        }),
        pos(SCALE*5 + textPos.x*j, SCALE * 1/2 + textPos.y*j),
        anchor('center'),
        color(textColor),
        opacity(textOpacity),
        z(Z.ui),
        fixed(),
      ]);
    };
  };
	
  /////////////
  // buttons //
  /////////////
  
  onKeyPress('0', () => {
    debug.inspect = !debug.inspect; 
  });

  // keyboard jump
  onKeyDown("w", () => {
    if (player.isGrounded()) {
			player.jump(JUMP_SPEED);
		};
  });

  

  // keyboard movement
  if (!TOUCH) {
  	onKeyDown("a", () => {
      player.xVel = Math.max(
        -RUN_SPEED,
        player.xVel - RUN_SPEED * dt() * (
          player.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
        )
      );
  	});

	  onKeyDown("d", () => {
      player.xVel = Math.min(
        RUN_SPEED,
        player.xVel + RUN_SPEED * dt() * (
          player.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
        )
      );
  	});

    // keyboard attack
    onKeyPress('space', () => {
      beanAttack();
    });

  };

  // touchscreen attack
  let lastClick = -1;
  onClick(() => {
    if (isTouchscreen() && time() - lastClick < 0.2) {
      beanAttack();
    };
    
    lastClick = time();
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
        player.health--;
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

  //////////////////
  // mark attacks //
  //////////////////

  var maNum = -1; // mark attack number
  
  function markAttack() {
    let phase = clamp(
      1, 
      Math.floor(mark.health / -100) + 6, 
      5
    );
    maNum++;
    let curAttack = maNum % (phase + 1);

    let moveTime = 0.8;
    tween(
      mark.pos,
      newMarkPos(curAttack),
      moveTime,
      (val) => mark.pos = val,
      easings.easeInOutQuad,
    );

    wait(moveTime + 0.5, () => {
      if (curAttack == 0) {
        // LASERS

        mark.laserFlare.opacity = 1;
        
        for (let n = 0; n < 2+phase; n++) {
          wait(0.4 * n, () => {
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
            		{
            			dir: deg2rad( player.pos.angle(eye) ),
            		}
            	]);
            };
          });
        };
        wait(0.4 * (2.5+phase), () => {
          mark.laserFlare.opacity = 0; 
        });
        wait(0.4 * (5+phase), markAttack);
      } else if (curAttack == 1) {
        // MINI MARK
  
        let airTime = 1;
        
        for (let n = 0; n < 2; n++) {
          let mm = add([
            sprite('minimark', { anim: 'moving' }),
            pos(mark.pos),
            z(Z.player - 2),
            scale(SCALE/500 / 3),
            area(),
            body({ 
              gravityScale: 0, 
              mass: 0.75,
            }),
            anchor('center'),
            shader('light', () => ({ 'tint': getShaderTint() })),
            "minimark",
            {
              xVel: 0,
              spawnDir: n%2==0 ? 1 : -1,
              spawnTime: time(),
              canMove: false,
              health: 2,
              attackedBy: -1,
              forceMove: 'none',
              slash: -1,
              lastAttack: -1,
              lastY: -1,
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
          
          tween(
        		mm.pos,
        		mm.pos.add(SCALE * 2.5 * mm.spawnDir, 0),
        		airTime,
        		(val) => mm.pos = val,
        		easings.easeOutCubic,
        	);
          wait(airTime + 0.3, () => {
            mm.gravityScale = 1;
          });
        };
        
        wait(airTime + 4, markAttack);
      } else if (curAttack == 2) {
        // M E G A MINI MARK
  
        let airTime = 1;
        
        for (let n = 0; n < 2; n++) {
          let mm = add([
            sprite('megaMinimark', { anim: 'roll' }),
            pos(mark.pos),
            z(Z.player - 2),
            scale(SCALE/500 / 3*2),
            area(),
            body({ 
              gravityScale: 0, 
              mass: 1.25,
            }),
            anchor('center'),
            shader('light', () => ({ 'tint': getShaderTint() })),
            rotate(0),
            "minimark",
            "megaMinimark",
            {
              xVel: 0,
              spawnDir: n%2==0 ? 1 : -1,
              spawnTime: time(),
              canMove: false,
              health: 4,
              attackedBy: -1,
              forceMove: 'none',
              extra: -1,
              lastAttack: -1,
              lastY: -1,
            }
          ]);

          mm.extra = add([
            sprite('megaMinimarkExtras'),
            anchor('center'),
            opacity(0),
            scale(mm.scale),
            z(Z.player - 1),
            rotate(0),
            shader('light', () => ({ 'tint': getShaderTint() })),
          ]);
          
          tween(
        		mm.pos,
        		mm.pos.add(SCALE * 2.5 * mm.spawnDir, 0),
        		airTime,
        		(val) => mm.pos = val,
        		easings.easeOutCubic,
        	);
          wait(airTime + 0.3, () => {
            mm.gravityScale = 1;
          });
        };
        
        wait(airTime + 4, markAttack);
      };
    });
    
  };

  wait(1, () => {
    markAttack();
  });

  ////////////////////
  // touch controls //
  ////////////////////

  // touch jump 
  let touchJumpCheck = SCALE * -5;
  if (TOUCH) {
    loop(0.1, () => {
      let fixedMousePos = mousePos().y - canvas.getBoundingClientRect().top;
      if (fixedMousePos < touchJumpCheck - SCALE*2) {
        if (player.isGrounded()) {
  		  	player.jump(JUMP_SPEED);
  	  	};
      };
      touchJumpCheck = fixedMousePos;
    });
  };
  
  onUpdate(() => {

    //debug.log(player.health);

    // touch movement
    if (TOUCH) {
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

    // HEALTH BAR DISPLAY
    healthBar.width = SCALE*6 * mark.health/500; 
 
    //////////////////
    // mark damaged //
    //////////////////
    if (!mark.sliced && slash.isColliding(mark) && player.isAttacking) {
      mark.sliced = true;
      //mark.health -= 2;
      mark.health -= 20;

      let clashPos = mark.pos.add(
    		(mark.pos.sub(player.pos))
    		.unit().scale(-SCALE)
    	);
      
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
    get('minimark').forEach((m) => {
      let megaMulti = (m.is('megaMinimark') ? 0.2 : 1);
      let approachStop = (m.is('miniMark') ? SCALE*2 : SCALE*0.6);

      let mmmAttackStop = false;
      if (m.is('megaMinimark')) {
        let laDelta = time() - m.lastAttack;
        if (laDelta < 1.2) {
          mmmAttackStop = true;
        }
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
      } else if (m.spawnTime + 2 < time()) {
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
        time() - m.lastAttack > 0.35
        &&
        Math.abs(player.pos.x - m.pos.x) < SCALE/2
        &&
        Math.abs(player.pos.y - m.pos.y) < SCALE/2
      ) {
        m.lastAttack = time();

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
        time() - m.lastAttack > 3 
        &&
        time() - m.spawnTime > 3
        /* LINE OF SIGHT CHECK WHEN */
      ) {
        m.canMove = false;
        m.lastAttack = time();
        wait(1, () => {
          if (m.health > 0) {
            for (let i = 0; i < 2; i++) {
              let eye = m.pos; //markEyes()[i];
              add([
                pos(eye),
                anchor('left'),
                sprite('laser', { anim: 'beam' }),
                scale(SCALE/500 / 4),
                area({ scale: vec2(1, 0.2) }),
                lifespan(1.5),
                rotate(player.pos.angle(eye)),
                z(Z.projectiles),
                "laser",
                {
                  dir: deg2rad( player.pos.angle(eye) ),
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
        player.health--;
        player.xVel = (player.pos.x - m.pos.x < 0) ? -RUN_SPEED : RUN_SPEED;
      };

      /////////////////////////
      // minimark animations //
      /////////////////////////

      if (!m.is('megaMinimark')) {
        // minimark
        
        if (time() - m.lastAttack < 0.2) {
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

      } else {
        // mega minimark

        let laDelta = time() - m.lastAttack;
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
  		  	move(mi[1] + 8*Math.sin(time()*(3+mark.frame)), SCALE*rand(0.4,0.5)),
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
  		if (p.opacity <= 0) {
  			destroy(p);
  		};
  	});

    let phase = clamp(
      1, 
      Math.floor(mark.health / -100) + 6, 
      5
    );
    mark.frame = Math.min(3, phase - 1);
    
    if (phase == 5) {
      mark.opacity = 0;
    };
    
  });
});

go('game');
