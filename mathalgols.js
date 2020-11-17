"use strict";
//f(x) = 0 Real Root-finding using bisection method. Requires f(x), low x guess, high x guess, and tolerance
function bisectionmethod(fx, xlow, xup, tol=1e-6) {
    var n = Math.ceil(Math.log(Math.abs(xup - xlow) / (2 * tol)) / Math.log(2));
    var xnew = 0;
    var i = 1;
    while (i <= n) {
        xnew = (xlow + xup) / 2;
        if (fx(xnew) === 0 || (xup - xlow) / 2 < tol) {
            return xnew;
        }
        i = i++;
        if (Math.sign(fx(xnew)) === Math.sign(fx(xlow))) {
            xlow = xnew;
        } else {
            xup = xnew;
        }
    }
}
//Round all values in object to x decimal places
function roundtox(obj,x) {
    var i;
    for (i = 0; i < Object.keys(obj).length; i++) {
        let y = obj[Object.keys(obj)[i]];
        let z = parseFloat(y.toFixed(x));
        obj[Object.keys(obj)[i]] = z;
    }
}
//Truncate floating point number
function trunc(x, y) {
    return parseFloat(x.toFixed(y));
}

//RKF45 IVP ODE Solver
function odestepsize(tol, Dt, dfz = undefined, h = undefined) {
    let N, s;
    if (h === undefined && dfz === undefined) {
        N = 10;
        h = Dt / N;
    } else if (h !== undefined && dfz !== undefined) {
        s = (0.5 * tol * h / dfz) ** 0.25;
        h = s * h;
        N = Dt / h;
    }
    return [trunc(h,5), trunc(N,0)];
}
function rkf45eqs(fdot, ti, fi, h, tol) {
    let ti_1 = ti + h;
    let k1 = h * fdot(ti, fi);
    let k2 = h * fdot(ti + 1 / 4 * h, fi + 1 / 4 * k1);
    let k3 = h * fdot(ti + 3 / 8 * h, fi + 3 / 32 * k1 + 9 / 32 * k2);
    let k4 = h * fdot(ti + 12 / 13 * h, fi + 1932 / 2197 * k1 - 7200 / 2197 * k2 + 7296 / 2197 * k3);
    let k5 = h * fdot(ti + h, fi + 439 / 216 * k1 - 8 * k2 + 3680 / 513 * k3 - 845 / 4104 * k4);
    let k6 = h * fdot(ti + 1 / 2 * h, fi - 8 / 27 * k1 + 2 * k2 - 3544 / 2565 * k3 + 1859 / 4104 * k4 - 11 / 40 * k5);
    let fi_1 = fi + 25 / 216 * k1 + 1408 / 2565 * k3 + 2197 / 4101 * k4 - 11 / 40 * k5;
    let zi_1 = fi + 16 / 135 * k1 + 6656 / 12825 * k3 + 28561 / 56430 * k4 - 9 / 50 * k5 + 2 / 55 * k6;
    let dfz = Math.abs(fi_1 - zi_1);
    if (dfz > tol) {
        return ["resize", dfz];
    } else {
        return ["next", trunc(ti_1,5), trunc(fi_1,5)];
    }
}
function rkf45(fdot, t0, tf, f0, tol = 1e-1) {
    let Dt = tf - t0;
    let c = odestepsize(tol, Dt);
    let h = c[0];
    let N = c[1];
    let t = [];
    let f = [];
    t[0] = t0;
    f[0] = f0;
    let i = 1;
    while (i < N + 1) {
        let ti = t[i - 1];
        let fi = f[i - 1];
        let c2 = rkf45eqs(fdot, ti, fi, h, tol);
        let c3 = c2[0];
        console.log(c3);
        if (c3 === "resize") {
            c = odestepsize(tol, Dt, c2[1], h);
            h = c[0];
            N = c[1];
        } else if (c3 === "next") {
            t[i] = c2[1];
            f[i] = c2[2];
            i++;
        }
    }
    return [t, f];
}
//test ODE
function yprime(t, y) {
    //return 1 + y ** 2;
    return -2 * y;
}