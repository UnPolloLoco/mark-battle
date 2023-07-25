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
    shader('light'),
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
        shader('light'),
      ]);
    };
  }; 
  
  // underground shake proofer
  add([
    rect(width() + SCALE*2/3, SCALE),
    pos(-SCALE/3, height()),
    color(rgb(130,130,130)),
    z(Z.bg),
    shader('light'),
  ]);
  
  ////////////////
  // characters //
  ////////////////
  
  // mark
  const mark = add([
    sprite('mark'),
    pos(SCALE*5, SCALE*2),
    scale(SCALE/640 * 2),
    rotate(0),
    anchor('center'),
    shader('mark', () => ({
  		'time': time(),
      'rand': rand(),
  	})),
    z(Z.mark),
    area({shape: new Polygon([
      vec2(-140, -220), vec2(65, -220), vec2(210, -150), 
      vec2(260, -80),   vec2(260, 40),  vec2(65, 225),
      vec2(-100, 225),  vec2(-240, 90), vec2(-240, -80),
    ])}),
    {
      health: 500,
      sliced: false,
    }
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
  
  // bean
  const player = add([
    sprite('beans'),
    pos(SCALE*0.9, SCALE),
    scale(SCALE/500 / 3),
    anchor('center'),
    area(),
    body(),
    shader('light'),
    z(Z.player),
    "player",
    "laserBreak",
    {
      xVel: 0,
      isAttacking: false,
      lastAttack: -123,
      health: 10,
    }
  ]);
  player.play('idle');
  
  // slash
  const slash = player.add([
    sprite('slash'),
    pos(500, -150), // 0, -150
    anchor('center'),
    scale(vec2(16, 10).scale(0.5)), // remove 0.5
    area({ 
      scale: vec2(0.95, 0.22),
      offset: vec2(0, 90),
    }),
    opacity(0),
    shader('white'),
    rotate(270), // remove
    {
      attackID: rand(),
    }
  ]);

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
        shader('light'),
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
        shader('light'),
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
          shader('light'),
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
            shader('light')
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
  
  // red bar part
  const healthBar = add([
    rect(SCALE*6, SCALE/10),
    pos(SCALE*2, SCALE * 9/20),
    color(RED),
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
  
  onKeyDown("w", () => {
    if (player.isGrounded()) {
			player.jump(JUMP_SPEED);
		};
  });

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
  
  onKeyDown('m', () => {
    shake(SCALE);
  })
  
  onKeyPress('space', () => {
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
        wait(0.5 * 5+phase, markAttack);
      } else if (curAttack == 1) {
        // MINI MARK
  
        let airTime = 1;
        
        for (let n = 0; n < 2; n++) {
          let mm = add([
            sprite('miniMark'),
            pos(mark.pos),
            z(Z.player - 2),
            scale(SCALE/500 / 3),
            area(),
            body({ gravityScale: 0, }),
            anchor('center'),
            shader('light'),
            "miniMark",
            {
              xVel: 0,
              spawnDir: n%2==0 ? 1 : -1,
              spawnTime: time(),
              canMove: false,
              health: 2,
              attackedBy: -1,
              forceMove: 'none',
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
      };
    });
    
  };

  wait(1, () => {
    markAttack();
  });
  
  
  onUpdate(() => {

    /////////////////
    // player move //
    /////////////////
    if (!(isKeyDown('a') || isKeyDown('d'))) {
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
      mark.health -= 2;

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
    get('miniMark').forEach((m) => {
      if (m.canMove) {
        if (player.pos.x <= m.pos.x - SCALE || m.forceMove == 'left') { // left
          m.xVel = Math.max(
            -RUN_SPEED * 0.75,
            m.xVel - RUN_SPEED * 0.75 * dt() * (
              m.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
            )
          );
        } else if (player.pos.x >= m.pos.x + SCALE || m.forceMove == 'right') { // right
          m.xVel = Math.min(
            RUN_SPEED / 2,
            m.xVel + RUN_SPEED * 0.75 * dt() * (
              m.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
            )
          );
        } else if (Math.abs(player.pos.x - m.pos.x) < SCALE && Math.abs(player.pos.y - m.pos.y) < SCALE/4) { // slowing
          m.xVel -= m.xVel * dt() * (
            m.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
          );
          if ((player.pos.y > SCALE*4.3 || m.pos.y > SCALE*4.5) && Math.abs(player.pos.y - m.pos.y) > SCALE*0.65) {
            m.forceMove = rand() < 0.5 ? 'left' : 'right';
          };
        };
        // jumping
        if (player.pos.y < m.pos.y - SCALE*0.75 && m.isGrounded()) {
          let mpxs = m.pos.x / SCALE;
          if ( !((1.4 < mpxs && mpxs < 4) || (6 < mpxs && mpxs < 8.5)) ) {
            m.forceMove = 'none';
            m.jump(JUMP_SPEED);
          };
        };

        // removing forcemove
        if (Math.abs(player.pos.y - m.pos.y) < SCALE/10) {
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
        
        clashEffect(clashPos, 1);
        
        if (m.health <= 0) {
          destroy(m);
        };
      };
    });

    
  });
});

go('game');
