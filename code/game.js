scene('game', () => {
  const mark = add([
    sprite('mark'),
    pos(SCALE*5, SCALE*2),
    scale(SCALE/640 * 2),
    rotate(0),
    anchor('center'),
    {
      health: 1000,
    }
  ]); 
  
  const player = add([
    sprite('player'),
    pos(SCALE, SCALE),
    scale(SCALE/640 / 3),
    anchor('center'),
    area(),
    body(),
    "player",
    {
      xVel: 0,
    }
  ]);
	
  for (let i = 0; i < 2; i++) {
    add([
      rect(SCALE, SCALE*10),
      pos(-SCALE + 11*i*SCALE, -SCALE*3),
      color(BLACK),
      area(),
      body({ isStatic: true }),
	    "border",
    ]);
  };

  const JUMP_SPEED = SCALE * 9;
  const RUN_SPEED = SCALE * 5;
  const GROUND_FRICTION = 8;
  const AIR_FRICTION = 2;
  
  setGravity(SCALE * 24);

  const level = [
    '     <====>        <====>     ',
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
        sprite('bottomBlock'),
        area(),
        body({ isStatic: true }),
        anchor('topleft'),
        scale(SCALE/640 / 3),
      ],
      "<": () => [
        sprite('leftBlock'),
        area(),
        body({ isStatic: true }),
        anchor('topleft'),
        scale(SCALE/640 / 3),
      ],
      "=": () => [
        sprite('middleBlock'),
        area(),
        body({ isStatic: true }),
        anchor('topleft'),
        scale(SCALE/640 / 3),
      ],
      ">": () => [
        sprite('rightBlock'),
        area(),
        body({ isStatic: true }),
        anchor('topleft'),
        scale(SCALE/640 / 3),
      ],
    },
  };
  
  const levelObject = addLevel(level, levelConf);
  
  for (let i = 1; i <= 3; i++) {
    add([
      rect(SCALE*6 + SCALE/60*i, SCALE/10 + SCALE/60*i),
      pos(SCALE*5, SCALE/2),
      anchor('center'),
      color(BLACK),
      opacity(0.18),
    ]);
  };
  
  add([
    rect(SCALE*6, SCALE/10),
    pos(SCALE*5, SCALE * 1/2),
    anchor('center'),
    color(rgb(25,25,25)),
  ]);
  
  const healthBar = add([
    rect(SCALE*6, SCALE/10),
    pos(SCALE*2, SCALE * 9/20),
    color(RED),
  ]);
  
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
          font: 'noto',
        }),
        pos(SCALE*5 + textPos.x*j, SCALE * 1/2 + textPos.y*j),
        anchor('center'),
        color(textColor),
        opacity(textOpacity),
      ]);
    };
  };
	
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
  
  onCollide('player', 'border', (p,b) => {
    p.xVel *= -0.8;
    player.move(p.xVel/10, 0);
  });
  
  onUpdate(() => {
    mark.angle += dt()*360;
    mark.health--;
    
    if (!(isKeyDown('a') || isKeyDown('d'))) {
      player.xVel -= player.xVel * dt() * (
        player.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
      );
    };
    player.move(player.xVel, 0);
    
    healthBar.width = SCALE*6 * mark.health/1000; 
  });
});

go('game');
