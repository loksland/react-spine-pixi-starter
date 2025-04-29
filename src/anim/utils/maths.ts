/**
 * Converts angle from degrees to radians.
 * @param {number} angleDegrees - Angle in degrees.
 * @returns {number} angleRadians - Angle in radians.
 */
export function degToRad(deg: number) {
  return (deg / 180.0) * Math.PI;
}

/**
 * Converts angle from radians to degrees.
 * @param {number} angleRadians - Angle in radians.
 * @returns {number} angleDegrees - Angle in degrees.
 */
export function radToDeg(rad: number) {
  return (rad / Math.PI) * 180.0;
}

/**
 * Returns the distance between 2 vector points.
 * @param {vector} pointA - An object with `x` and `y` properties.
 * @param {vector} pointB - An object with `x` and `y` properties.
 * @returns {number} distance
 */
export function distanceBetweenPts(
  ptA: { x: number; y: number },
  ptB: { x: number; y: number },
) {
  const dx = ptA.x - ptB.x;
  const dy = ptA.y - ptB.y;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Returns the angle in radians between 2 points.
 * @param {vector} originPoint - An object with `x` and `y` properties.
 * @param {vector} destinationPoint - An object with `x` and `y` properties.
 * @returns {number} angleRadians - The angle in radians.
 */
export function angleBetweenPoints(
  ptA: { x: number; y: number },
  ptB: { x: number; y: number },
) {
  return Math.atan2(ptB.y - ptA.y, ptB.x - ptA.x);
}

/**
 * Projects from a point at a given radian angle and distance.
 * @param {vector} originPoint - An object with `x` and `y` properties.
 * @param {number} angleRadians - The rotation angle, in radians.
 * @param {number} distance - The distance to project.
 * @returns {PIXI.Point} projectedPoint - A new point object.
 */
export function projectAngleFromPoint(
  pt: { x: number; y: number },
  angleRads: number,
  dist: number,
) {
  return {
    x: pt.x + dist * Math.cos(angleRads),
    y: pt.y + dist * Math.sin(angleRads),
  };
}

/**
 * Rotates one point around another a given angle (in radians)
 * @param {vector} centerPoint - An object with `x` and `y` properties.
 * @param {vector} subjectPoint - An object with `x` and `y` properties.
 * @param {number} angleRadians - The rotation angle, in radians.
 * @param {boolean} overwrite - If true: `subjectPoint` will be updated with the result. If false: a new PIXI.Point object will be returned.
 * @returns {vector|null} result - The resulting coordinate.
 */
export function rotatePtAroundPt(
  centerPt: { x: number; y: number },
  pt: { x: number; y: number },
  angRads: number,
) {
  return {
    x:
      Math.cos(angRads) * (pt.x - centerPt.x) -
      Math.sin(angRads) * (pt.y - centerPt.y) +
      centerPt.x,
    y:
      Math.sin(angRads) * (pt.x - centerPt.x) +
      Math.cos(angRads) * (pt.y - centerPt.y) +
      centerPt.y,
  };
}

/**
 * Return the shortest angular offset (in radians) from a source angle (in radians) to a target angle (in radians).
 * <br>The result may be negative.
 * @param {number} sourceAngleRadians - The source angle in radians.
 * @param {number} targetAngleRadians - The target angle in radians.
 * @returns {number} offsetAngleRadians - The offset in radians.
 */
export function angularDeltaBetweenAngles(
  sourceAngRads: number,
  targetAngRads: number,
) {
  return Math.atan2(
    Math.sin(targetAngRads - sourceAngRads),
    Math.cos(targetAngRads - sourceAngRads),
  );
}
