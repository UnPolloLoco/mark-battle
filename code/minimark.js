import * from '_start.js';

export function minimarkAI() {
  get('miniMark').forEach((m) => {
      if (m.canMove) {
        if (player.pos.x <= m.pos.x - SCALE || m.forceMove == 'left') { // left
          m.xVel = Math.max(
            -RUN_SPEED * 0.75,
            m.xVel - RUN_SPEED * 0.75 * dt() * (
              m.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
            )
          );
        } else if (player.pos.x >= m.pos.x + SCALE || m.forceMove == 'right') { // right
          m.xVel = Math.min(
            RUN_SPEED / 2,
            m.xVel + RUN_SPEED * 0.75 * dt() * (
              m.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
            )
          );
        } else if (Math.abs(player.pos.x - m.pos.x) < SCALE && Math.abs(player.pos.y - m.pos.y) < SCALE/4) { // slowing
          m.xVel -= m.xVel * dt() * (
            m.isGrounded() ? GROUND_FRICTION : AIR_FRICTION
          );
          if ((player.pos.y > SCALE*4.3 || m.pos.y > SCALE*4.5) && Math.abs(player.pos.y - m.pos.y) > SCALE*0.65) {
            m.forceMove = rand() < 0.5 ? 'left' : 'right';
          };
        };
        // jumping
        if (player.pos.y < m.pos.y - SCALE*0.75 && m.isGrounded()) {
          let mpxs = m.pos.x / SCALE;
          if ( !((1.4 < mpxs && mpxs < 4) || (6 < mpxs && mpxs < 8.5)) ) {
            m.forceMove = 'none';
            m.jump(JUMP_SPEED);
          };
        };

        // removing forcemove
        if (Math.abs(player.pos.y - m.pos.y) < SCALE/10) {
          m.forceMove = 'none';
        };
      
        m.move(m.xVel, 0);
      // cant move yet
      } else if (m.spawnTime + 2 < time()) {
        m.canMove = true;
      };

      // MINIMARK TAKES DAMAGE
      if (slash.isColliding(m) && m.attackedBy != slash.attackID && player.isAttacking) {
        m.attackedBy = slash.attackID;
        m.health--;

        let clashPos = m.pos.add(
      		(m.pos.sub(player.pos))
      		.unit().scale(-SCALE / 3)
      	);
        
        clashEffect(clashPos, 1);
        
        if (m.health <= 0) {
          destroy(m);
        };
      };
    });
};
