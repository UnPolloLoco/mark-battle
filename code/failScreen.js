scene('fail', (gameScore) => {
  setBackground(BLACK);
 
  let deathScreenEnterTime = time();

  // background
  
  add([
  	rect(width(), height()),
  	pos(0,0),
  	color(BLACK),
  	shader("perishScreenBackground", () => ({
  		"time": time(),
  	})),
    z(-1),
  ]);

  // main text
  
  add([
    text('WALLOPED', { 
      size: SCALE,
      font: 'titillium',
    }),
    pos(width()/2, SCALE*3),
    color(WHITE),
    anchor('bot'),
    z(1),
  ]);

  // scoring

  for (let i = 0; i < 2; i++) {
    let scorerText = [
      `${gameScore.points} points`,
      `${gameScore.completion}% complete`
    ][i];
    let yPosAdd = [SCALE/2, SCALE][i];
    
    add([
      text(scorerText, {
        size: SCALE/4,
        font: 'itim',
        align: 'right'
      }),
      pos(
        width()/2 - SCALE/2, 
        height()/2 + yPosAdd
      ),
      anchor('right'),
      z(1),
      color(rgb(240, 195, 255)),
    ]);
  };

  // home button

  const homeButton = add([
    sprite('failHomeButton'),
    scale(SCALE/500),
    pos(
      width()/2 + SCALE/2, 
      height()/2 + SCALE*3/4
    ),
    anchor('right'),
    z(1),
  ])
  
  // restart button

  const restartButton = add([
    sprite('failRestartButton'),
    scale(SCALE/500),
    pos(
      width()/2 + SCALE*11/6, 
      height()/2 + SCALE*3/4
    ),
    anchor('right'),
    z(1),
  ])

  restartButton.onClick(() => {
    go('game');
  });
  

  usePostEffect('un-perish', () => ({
    'time': 1.6 - (time() - deathScreenEnterTime),
  }));
  
  wait(1.6, () => {
    usePostEffect('clear');
  });
});
