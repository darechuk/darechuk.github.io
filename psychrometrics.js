"use strict";
// Thermodynamic Properties of Moist Air from 2017 ASHRAE Handbook
var Rda = 53.35; //Gas constant for dry air in ft-lbf/lbda-R
var Rw = 85.78; //Gas constant for water vapor in ft-lbf/lbda-R

//U.S. Standard Atmosphere
function ptstdatm(Z) {
    var p = 14.696 * (1 - 6.8754e-6 * Z) ** 5.2559; //p is barometric pressure in psia, Z is altitude in ft
    var t = 59 - 0.0035662 * Z; //t is temperature as a function of altitude in F
    return [p, t];
}
//Water vapor saturation pressure, t in F and pws in psia
function pws(t) {
    var T = t + 459.67;
    var C1 = -1.0214165e4;
    var C2 = -4.8932428;
    var C3 = -5.3765794e-3;
    var C4 = 1.9202377e-7;
    var C5 = 3.5575832e-10;
    var C6 = -9.0344688e-14;
    var C7 = 4.1635019;
    var C8 = -1.0440397e4;
    var C9 = -1.129465e1;
    var C10 = -2.7022355e-2;
    var C11 = 1.289036e-5;
    var C12 = -2.478068e-9;
    var C13 = 6.5459673;
    if (t >= -148 && t <= 32) {
        var fpws = C1 / T + C2 + C3 * T + C4 * T ** 2 + C5 * T ** 3 + C6 * T ** 4 + C7 * Math.log(T);
    } else if (t > 32 && t <= 392) {
        var fpws = C8 / T + C9 + C10 * T + C11 * T ** 2 + C12 * T ** 3 + C13 * Math.log(T);
    } else {
        window.alert("Temperature is out of range");
    }
    return Math.exp(fpws);
}
//Saturation humidity ratio, t in F an p in psia
function Ws(t, p) {
    return 0.621945 * pws(t) / (p - pws(t));
}
//Humidity ratio, t in F an p in psia
function W(p, pw) {
    return 0.621945 * pw / (p - pw);
}
//Relative humidity
function phi(t, p, pw) {
    var mu = W(p, pw) / Ws(t, p);
    return mu / (1 - (1 - mu) * (pws(t) / p));
}
//Specific volume in ft3/lbda
function v(t, p, W) {
    return 0.370486 * (t + 459.67) * (1 + 1.607858 * W) / p;
}
//Enthalpy of moist air in Btu/lbda
function h(t, W) {
    return 0.24 * t + W * (1061 + 0.444 * t);
}
//Dew Point in F
function td(t, pw) {
    var alpha = Math.log(pw);
    var C14 = 100.45;
    var C15 = 33.193;
    var C16 = 2.319;
    var C17 = 0.17074;
    var C18 = 1.2063;
    if (t < 32) {
        return 90.12 + 26.142 * alpha + 0.8927 * alpha ** 2;
    } else {
        return C14 + C15 * alpha + C16 * alpha ** 2 + C17 * alpha ** 3 + C18 * pw ** 0.1984;
    }
}
//Thermodynamic properties given dry-bulb temperature, pressure, relative humidity
function airprops(t, p, phi) {
    var result = {};
    result["Relative Humidity (%)"] = phi * 100;
    result["Sat Water Pressure (psia)"] = pws(t); //Pressure of saturated pure water psia
    result["Sat Humidity Ratio"] = Ws(t, p); //Saturation humidity ratio
    //Equation used to solve humidity ratio numerically when relative humidity is known
    function phzero(mu) {
        return -1 * phi + mu / (1 - (1 - mu) * (result["Sat Water Pressure (psia)"] / p));
    }
    result["Humidity Ratio"] = bisectionmethod(phzero, 0, 1) * result["Sat Humidity Ratio"]; //Humidity ratio
    result["Water Partial Pressure (psia)"] = p / (1 + result["Humidity Ratio"] / 0.621945) * (result["Humidity Ratio"] / 0.621945); //Partial pressure of water in moist air
    result["Specific Volume (ft\u00B3/lb dry air)"] = v(t, p, result["Humidity Ratio"]); //Specific volume
    result["Entallpy Btu/lb dry air"] = h(t, result["Humidity Ratio"]); //Enthalpy
    result["Dew Point Temperature (&#8457)"] = td(t, result["Water Partial Pressure (psia)"]); //Dew point
    //Equation used to solve wet bulb temperature numerically
    function Wzero(twb) {
        var pwsb = pws(twb);
        var Wsb = 0.621945 * pwsb / (p - pwsb);
        if (twb < 32) {
            return -1 * result["Humidity Ratio"] + ((1220 - 0.04 * twb) * Wsb - 0.240 * (t - twb)) / (1220 + 0.444 * t - 0.48 * twb);
        } else {
            return -1 * result["Humidity Ratio"] + ((1093 - 0.556 * twb) * Wsb - 0.240 * (t - twb)) / (1093 + 0.444 * t - twb);
        }
    }
    result["Wet Bulb Temperature (&#8457)"] = bisectionmethod(Wzero, -148, 392); //Wet bulb temperature
    return result;
}
function airprops2(t, p, tdp) {
    function tdpzero(phi) {
        var res = airprops(t, p, phi);
        return tdp - res["Dew Point Temperature (&#8457)"];
    }
    var phi = bisectionmethod(tdpzero, 0, 1);
    return airprops(t,p,phi);
}
function airprops3(t, p, twb) {
    function twbzero(phi) {
        var res = airprops(t, p, phi);
        return twb - res["Wet Bulb Temperature (&#8457)"];
    }
    var phi = bisectionmethod(twbzero, 0, 1);
    return airprops(t, p, phi);
}