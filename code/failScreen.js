scene('fail', () => {
  setBackground(BLACK);
  usePostEffect('clear');

  add([
    rect(width(), height()),
    pos(0,0),
    color(BLACK),
    lifespan(0, { fade: 0.6 }),
    opacity(1),
    z(10),
  ])
  
  add([
    text('WALLOPED', { 
      size: SCALE,
      font: 'playfair',
    }),
    pos(width()/2, SCALE*4),
    color(WHITE),
    anchor('center'),
    z(0),
  ]);
});
