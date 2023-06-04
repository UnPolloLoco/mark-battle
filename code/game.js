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
    pos(0,0),
    scale(SCALE/640 * 0.5),
    anchor('center')
  ]);

  const level = [
    '   ####     ####    ',
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
  
  
  onUpdate(() => {
    mark.angle += dt()*150;
    player.pos = mousePos();
  });
});

go('game');
