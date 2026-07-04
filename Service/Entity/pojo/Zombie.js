import { Entity } from '@entity/Entity.js';
import { EntityType } from '@entity/EntityType.js';

export class Zombie extends Entity {
    type = EntityType.ENEMY;
    speed = 50;
    w = 60;
    h = 60;
    state = 'walk';

    update(dt) {
        this.x -= this.speed * dt;
    }
}
