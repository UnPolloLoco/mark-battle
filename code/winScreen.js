scene('win', (gameScore) => {
  setBackground(BLACK);

  add([
    text('you won yay', { size: SCALE }),
    pos(center()),
    color(WHITE),
    anchor('center'),
  ]);
});
