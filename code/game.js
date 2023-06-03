scene('game', () => {
  const mark = add([
    sprite('mark'),
    pos(SCALE*3, SCALE*3),
    scale((SCALE/640) * 3), // SCALE divided by sprite width, multiplied by the size change
    rotate(0),
    anchor('center'),

  ]);

  onUpdate(() => {
    mark.angle += dt()*150;
    mark.pos = mousePos();
  });
});

go('game');
