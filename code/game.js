scene('game', () => {
  const mark = add([
    sprite('mark'),
    pos(SCALE*3, SCALE*3),
    scale(SCALE/640 * 2),
    rotate(0),
    anchor('center'),
  ]); 
  
  const player = add([
    sprite('player'),
    pos(SCALE, SCALE),
    scale(SCALE/640 * 0.5),
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
  const AIR_FRICTION = 4;
  
  setGravity(SCALE * 24);

  const level = [
    '   ####      ####   ',
    '                    ',
    '                    ',
    '####################',
  ];
  
  const levelConf = {
    tileWidth: SCALE/2,
    tileHeight: SCALE/2,
    pos: vec2(0, SCALE*4),
    tiles: {
      "#": () => [
        sprite('mark'),
        area(),
        body({ isStatic: true }),
        anchor('topleft'),
        scale(SCALE/640 / 2),
      ],
    },
  };
  
  const levelObject = addLevel(level, levelConf);
	
  onKeyPress('0', () => {
    debug.inspect = !debug.inspect; 
  });
  
  onKeyPress("w", () => {
    if (player.isGrounded()) {
			player.jump(JUMP_SPEED);
		};
  });

	onKeyDown("a", () => {
    player.xVel = Math.max(
      -RUN_SPEED,
      player.xVel - RUN_SPEED * dt() * GROUND_FRICTION,
    );
	});

	onKeyDown("d", () => {
    player.xVel = Math.min(
      RUN_SPEED,
      player.xVel + RUN_SPEED * dt() * GROUND_FRICTION,
    );
	});
  
  onCollide('player', 'border', (p,b) => {
    p.xVel *= -0.8;
    player.move(p.xVel/10, 0);
  });
  
  onUpdate(() => {
    mark.angle += dt()*150;
    
    if (!(isKeyDown('a') || isKeyDown('d'))) {
      player.xVel -= player.xVel * dt() * (
        player.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
      );
    };
    player.move(player.xVel, 0);
  });
});

go('game');
