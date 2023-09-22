scene('fail', () => {
  setBackground(BLACK);
  
  add([
    text('L bad', { size: SCALE }),
    pos(center()),
    color(WHITE),
    anchor('center'),
  ]);

  debug.log('scene changed');
  console.log('scene changed');
});
