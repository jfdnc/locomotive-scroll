/**
 * linear interpolation between `start` and `end` values
 * 
 * @param {number} start
 * @param {number} end 
 * @param {number} pct in range 0..1
 * @returns {number} interpolated value
 */
export function lerp(start = 0, end = 0, pct = 0.0) {
    if(pct < 0 || pct > 1) return 0; // handle outside points
    // clamp return value
    return (1 - pct) * start + pct * end;
}
