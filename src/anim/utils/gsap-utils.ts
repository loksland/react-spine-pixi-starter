import gsap from 'gsap';
import { Container } from 'pixi.js';

// import { THREE.Object3D } from 'three';

// import * as THREE from 'three';

// Usage: import * as gsapUtils from '/gsapUtils'
/*
Note: 
Will not work when animating a property:
```ts
 gsap.fromTo(
  sphere.position,
  { x: 10.0 },
  {
    x: -10.0,
    ...
  },
);
```
This can be worked around by adding data: {ref: %parent%}
```ts
 gsap.fromTo(
  sphere.position,
  { x: 10.0 },
  {
    x: -10.0,
    data: {ref:sphere} <--
    ...
  },
);
```
If THREE  then better to use: killChildTweensOfThreeObj instead.
*/

// GSAP 3
export function killChildTweensOf(
  parent: gsap.TweenTarget | gsap.TweenTarget[] | undefined,
  complete: boolean = false, // Whether to complete the tweens
) {
  if (!parent) {
    return;
  }
  const parents: gsap.TweenTarget[] = gsap.utils.toArray(parent);
  let i = parents.length;
  let j: number;
  let tweens: (gsap.core.Tween | gsap.core.Timeline)[] = [];
  let targets: gsap.TweenTarget[];
  if (i > 1) {
    while (--i > -1) {
      if (parents[i]) {
        killChildTweensOf([parents[i]], complete);
      }
    }
    return;
  }
  parent = parents[0];
  tweens = gsap.globalTimeline.getChildren(true, true, false); // Get all the tweens

  for (i = 0; i < tweens.length; i++) {
    const ref = tweens[i].data?.ref;
    if (ref && _isDescendant(ref, parent)) {
      if (complete) {
        tweens[i].totalProgress(1);
      }
      tweens[i].kill();
    }
    targets = tweens[i].targets();
    for (j = 0; j < targets.length; j++) {
      if (_isDescendant(targets[j], parent)) {
        if (complete) {
          tweens[i].totalProgress(1);
        }
        tweens[i].kill();
      }
    }
  }
}

const _isDescendant = function (
  element: gsap.TweenTarget,
  parent: gsap.TweenTarget,
) {
  if (element) {
    while (element) {
      if (element instanceof Container) {
        element = element.parent;
        // if (element instanceof THREE.Object3D) {
        //   element = element.parent;
      } else if (element instanceof HTMLElement) {
        element = element.parentNode;
      } else {
        break;
      }
      if (element === parent) {
        return true;
      }
    }
  } else {
    return false;
  }
};
