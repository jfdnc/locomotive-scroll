// should be able to handle this with compile time tools
export function transform(el, transformValue) {
    el.style.webkitTransform = transformValue;
    el.style.msTransform = transformValue;
    el.style.transform = transformValue;
}

// and this?
export function getTranslate(el) {
    const translate = {};

    const style = getComputedStyle(el);
    const transform = style.transform || style.webkitTransform || style.mozTransform;

    //HMMMM
    let mat = transform.match(/^matrix3d\((.+)\)$/);
    if (mat) {
        translate.x = mat ? parseFloat(mat[1].split(', ')[12]) : 0;
        translate.y = mat ? parseFloat(mat[1].split(', ')[13]) : 0;
    } else {
        mat = transform.match(/^matrix\((.+)\)$/);
        translate.x = mat ? parseFloat(mat[1].split(', ')[4]) : 0;
        translate.y = mat ? parseFloat(mat[1].split(', ')[5]) : 0;
    }
    return translate;
}
