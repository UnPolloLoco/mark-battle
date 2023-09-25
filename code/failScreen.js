scene('fail', () => {
  setBackground(BLACK);
  usePostEffect('clear');

  // fade in
  add([
    rect(width(), height()),
    pos(0,0),
    color(BLACK),
    lifespan(0, { fade: 0.6 }),
    opacity(1),
    z(10),
  ])

  // main text
  add([
    text('bombastically', { 
      size: SCALE/2,
      font: 'reenieBeanie',
    }),
    pos(SCALE*3, SCALE*1.5),
    color(rgb(150,150,150)),
    anchor('center'),
    rotate(30),
    z(1),
  ]);
  add([
    text('WALLOPED', { 
      size: SCALE,
      font: 'playfair',
    }),
    pos(width()/2, SCALE*2),
    color(WHITE),
    anchor('center'),
    z(0),
  ]);
});
