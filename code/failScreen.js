scene('fail', () => {
  setBackground(BLACK);

  let deathScreenEnterTime = time();

  // main text
  /*add([
    text('bombastically', { 
      size: SCALE/2,
      font: 'reenieBeanie',
    }),
    pos(SCALE*2.6, SCALE*1.3),
    color(rgb(150,150,150)),
    anchor('center'),
    rotate(-10),
    z(1),
  ]);*/
  
  add([
    text('WALLOPED', { 
      size: SCALE * 1.4,
      font: 'nerko',
    }),
    pos(width()/2, SCALE*1.7), // prev 2
    color(WHITE),
    anchor('center'),
    z(1),
  ]);

  // scoring

  add([
    text('Score: 1234', {
      size: SCALE/2,
      font: 'reenieBeanie',
    }),
    pos(SCALE*2, height()/2),
    anchor('left'),
    z(1)
  ]);

  add([
    text('Completion: 123%', {
      size: SCALE/2,
      font: 'reenieBeanie',
    }),
    pos(width()/2, height()/2),
    anchor('left'),
    z(1)
  ]);

  // buttons

  add([
    rect(SCALE*6, SCALE*0.5),
    pos(SCALE*2, SCALE*3.5),
    color(GREEN),
    z(0),
  ]);

  add([
    rect(SCALE*6, SCALE*0.5),
    pos(SCALE*2, SCALE*4.5),
    color(RED),
    z(0),
  ]);

  

  usePostEffect('un-perish', () => ({
    'time': 1.6 - (time() - deathScreenEnterTime),
  }));
  
  wait(1.6, () => {
    usePostEffect('clear');
  });
});
