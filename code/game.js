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
  ]);
  
  const JUMP_SPEED = SCALE * 10;
  const RUN_SPEED = SCALE * 4;
  
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
  
  onKeyPress("space", () => {
    if (player.isGrounded()) {
			player.jump(JUMP_SPEED);
		};
  });

	onKeyDown("left", () => {
		player.move(-RUN_SPEED, 0)
	})

	onKeyDown("right", () => {
		player.move(RUN_SPEED, 0)
	})
  
  onUpdate(() => {
    mark.angle += dt()*150;
  });
});

go('game');
