scene('game', () => {
  const Z = {
    bg:            0,
    projectiles: 100,
    mark:        200,
    player:      300,
    effects:     400,
    tiles:       500,
    ui:          600,
  }
  
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
    rect(width(), SCALE),
    pos(0, height()),
    color(rgb(100,100,100)),
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
    shader('light'),
    z(Z.mark),
    area({shape: new Polygon([
      vec2(-140, -220), vec2(65, -220), vec2(210, -150), 
      vec2(260, -80),   vec2(260, 40),  vec2(65, 225),
      vec2(-100, 225),  vec2(-240, 90), vec2(-240, -80),
    ])}),
    {
      health: 1000,
      sliced: false,
    }
  ]); 
  
  // bean
  const player = add([
    sprite('beans'),
    pos(SCALE, SCALE),
    scale(SCALE/500 / 3),
    anchor('center'),
    area(),
    body(),
    shader('light'),
    z(Z.player),
    "player",
    {
      xVel: 0,
      isAttacking: false,
      lastAttack: -123,
    }
  ]);
  player.play('idle');
  
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
    shader('slash'),
  ]);
	
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
  const JUMP_SPEED = SCALE * 9;
  const RUN_SPEED = SCALE * 5;
  const GROUND_FRICTION = 8;
  const AIR_FRICTION = 2;
  
  setGravity(SCALE * 24);
  
  ///////////
  // level //
  ///////////

  const level = [
    '     #####>        #####>     ',
    '                              ',
    '                              ',
    '                              ',
    '##############################',
  ];
  
  const levelConf = {
    tileWidth: SCALE/3,
    tileHeight: SCALE/3,
    pos: vec2(0, SCALE * 13/3),
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
            .add(0, SCALE*13/3)
            .sub(SCALE/50, SCALE/50)
          ),
          z(Z.tiles - 1),
          color(BLACK),
        ]);
        // add the block
        add([
          sprite(obj.style),
          pos(obj.pos.add(0, SCALE*13/3)),
          scale(SCALE/500 / 3),
          z(Z.tiles),
          area(),
          body({ isStatic: true }),
          shader('light'),
        ]);
        // block shadow
        if (obj.pos.y < SCALE) {
          add([
            rect(SCALE/3, SCALE*3),
            pos(obj.pos
              .add(0, SCALE*14/3)
            ),
            z(Z.tiles - 2),
            color(rgb(20,20,20)),
            opacity(0.2),
            shader('light')
          ]);
        };
      // murder the block
      } else {
        destroy(obj);
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
        text('jlkdjfioek', {
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
    
    if (!player.isAttacking && attackDelta >= 0.5) {
      player.isAttacking = true;
      player.lastAttack = time();
      player.gravityScale = 0.4;
     
      slash.flipX = (player.xVel >= 0);
      slash.opacity = 1;
      slash.play('attack');
      
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
  
  //////////////////////
  // animation update //
  //////////////////////
  
  let playerLastYPos = player.pos.y;
  
  loop(0.02, () => {
    let yVelIndex = Math.round((playerLastYPos - player.pos.y) / SCALE * 100);
    playerLastYPos = player.pos.y;
    
    if (/* just took damage */ false) {
      
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
  
  ///////////////
  // on update //
  ///////////////
  
  onUpdate(() => {
    camPos(
      center().add(player.pos.sub(SCALE*5, SCALE*3).scale(2/SCALE))
    );
    
    if (!(isKeyDown('a') || isKeyDown('d'))) {
      player.xVel -= player.xVel * dt() * (
        player.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
      );
    };
    player.move(player.xVel, 0);
    
    healthBar.width = SCALE*6 * mark.health/1000; 
    
    get('attackLines').forEach((a) => {
      a.opacity -= 0.4 * dt();
      a.pos.y += SCALE * 3 * dt();
      if (a.opacity <= 0) { destroy(a); };
    });
    
    if (!mark.sliced && mark.isColliding(slash)) {
      mark.sliced = true;
      mark.health -= 3;
    };
  });
});

go('game');
