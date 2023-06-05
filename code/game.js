scene('game', () => {
  const mark = add([
    sprite('mark'),
    pos(SCALE*5, SCALE*2),
    scale(SCALE/640 * 2),
    rotate(0),
    anchor('center'),
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
    '     ######        ######     ',
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
        sprite('mark'),
        area(),
        body({ isStatic: true }),
        anchor('topleft'),
        scale(SCALE/640 / 3),
      ],
    },
  };
  
  const levelObject = addLevel(level, levelConf);
  
  add([
    rect(SCALE*6, SCALE/10),
    pos(SCALE*5, SCALE * 1/2),
    anchor('center'),
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
      textColor = BLACK;
      textOpacity = 0.1;
    };
    add([
      text('MARK', {
        size: SCALE/2,  
        textAlign: 'center',
        font: 'noto',
      }),
      pos(SCALE*5 + textPos.x, SCALE * 1/2 + textPos.y),
      anchor('center'),
      color(textColor),
      opacity(textOpacity),
    ]);
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
    
    if (!(isKeyDown('a') || isKeyDown('d'))) {
      player.xVel -= player.xVel * dt() * (
        player.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
      );
    };
    player.move(player.xVel, 0);
  });
});

go('game');
