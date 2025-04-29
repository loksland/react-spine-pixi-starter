/*

Usage: 

import { Springer } from '@/anim/utils/springer';

const spring = Springer(0.6, 0.8); // tension, wobble
gsap.fromTo(
  refs['anim-pretrigger-cta'],
  { x: 40.0 },
  {
    x: 0.0,
    ease: spring,
    delay: delay,
    duration: 1.4,
  },
);

*/
function _slicedToArray<T>(arr: Iterable<T> | ArrayLike<T>, i: number): T[] {
  if (Array.isArray(arr)) {
    return arr;
  } else if (typeof arr === 'object' && Symbol.iterator in arr) {
    const result: T[] = [];
    const iterator = (arr as Iterable<T>)[Symbol.iterator]();
    let step: IteratorResult<T>;
    let count = 0;

    try {
      while (!(step = iterator.next()).done) {
        result.push(step.value);
        count++;
        if (i && count === i) break;
      }
    } catch (err) {
      if (iterator.return) {
        iterator.return();
      }
      throw err;
    }

    return result;
  } else {
    return [];
  }
}

const msPerFrame = 16;
const sampleDuration = 10000;
const sampleMsPerFrame = msPerFrame / sampleDuration;

const reusedTuple = [0, 0];

export function Springer(tension: number, wobble: number) {
  const _tension =
    arguments.length > 0 && tension !== undefined ? tension : 0.5;
  const _wobble = arguments.length > 1 && wobble !== undefined ? wobble : 0.5;

  const stiffness = Math.min(Math.max(350 * _tension, 20), 350);
  const damping = Math.min(Math.max(40 - 40 * _wobble, 1), 40);
  const steps: number[] = [];

  let progress = 0;
  let velocity = 0;

  while (progress !== sampleDuration || velocity !== 0) {
    const _stepper = stepper(
      progress,
      sampleDuration,
      velocity,
      stiffness,
      damping,
    );

    const _stepper2 = _slicedToArray(_stepper, 2);

    progress = _stepper2[0];
    velocity = _stepper2[1];

    steps.push(progress / sampleDuration);
  }

  return function (i: number) {
    return steps[Math.ceil(i * (steps.length - 1))];
  };
}

// Inspired by https://github.com/chenglou/react-motion/blob/master/src/stepper.js
function stepper(
  value: number,
  destination: number,
  velocity: number,
  stiffness: number,
  damping: number,
) {
  const spring = -stiffness * (value - destination);
  const damper = -damping * velocity;
  const a = spring + damper;
  const newVelocity = velocity + a * sampleMsPerFrame;
  const newValue = value + newVelocity * sampleMsPerFrame;

  if (Math.abs(newVelocity) < 1 && Math.abs(newValue - destination) < 1) {
    reusedTuple[0] = destination;
    reusedTuple[1] = 0;
    return reusedTuple;
  }

  reusedTuple[0] = newValue;
  reusedTuple[1] = newVelocity;

  return reusedTuple;
}
