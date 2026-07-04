import { Animation } from '@animation/Animation.js';
import { registerAnimation } from '@animation/AnimationRegistry.js';
import { getPhotoPathAsc } from '@utils/getPhotoPathAsc.js';
import { setResource } from '@resource/ResourceList.js';

const frames = getPhotoPathAsc('assets/images/zombie/walk', 4);
frames.forEach(f => setResource(f));

registerAnimation('zombieWalk', new Animation({
    frames,
    frameTime: 0.10,
    loop: true,
}));
