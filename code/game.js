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
    {
      xVel: 0,
    }
  ]);
  
  const JUMP_SPEED = SCALE * 8;
  const RUN_SPEED = SCALE * 5;
  
  setGravity(SCALE * 23);

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
  
  onKeyPress("w", () => {
    if (player.isGrounded()) {
			player.jump(JUMP_SPEED);
		};
  });

	onKeyDown("a", () => {
    player.xVel -= RUN_SPEED * dt() * 2;
		player.move(-RUN_SPEED, 0)
	})

	onKeyDown("d", () => {
		player.move(RUN_SPEED, 0)
	})
  
  onUpdate(() => {
    mark.angle += dt()*150;
    
    if (!(isKeyDown('a') || isKeyDown('d'))) {
      
    };
  });
});

go('game');
