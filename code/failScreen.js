scene('fail', () => {
  setBackground(BLACK);
  usePostEffect('clear');
  
  add([
    text('WALLOPED', { 
      size: SCALE,
      font: 'playfair',
    }),
    pos(center()),
    color(WHITE),
    anchor('center'),
  ]);
});
