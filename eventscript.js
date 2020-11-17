"use strict";
var button = document.getElementById("calcbutton");
var inputs = document.getElementById("inputs");
var valid = false;
var pick3 = "RH";
var radios = document.getElementById("radios");
var precis = document.getElementById("precislide");
var precision = 4;

function inputvalidate() {
    var t = parseFloat(document.getElementById("tempbox").value);
    var p = parseFloat(document.getElementById("pressbox").value);
    var rh = parseFloat(document.getElementById("rhbox").value) / 100;
    if (t >= -148 && t <= 392 && rh >= 0 && rh <= 1 && p > 0) {
        button.disabled = false;
        valid = true;
    } else {
        button.disabled = true;
        valid = false;
    }
}

radios.addEventListener("change", function () {
    document.getElementById("rhbox").value="";
    if (pick3 == "RH") {
        document.getElementById("rhlabel").innerHTML = "Relative Humidity (%)";
    } else if (pick3 == "TDP") {
        document.getElementById("rhlabel").innerHTML = "Dew Point Temperature (&#8457)";
    } else if (pick3 == "TWB") {
        document.getElementById("rhlabel").innerHTML = "Wet Bulb Temperature (&#8457)";
    }
});
inputs.addEventListener("input", inputvalidate);
inputs.addEventListener("change", inputvalidate);
inputs.addEventListener("keyup", function (e) {
    if (e.keyCode === 13 & valid === true) {
        getresults();
    }
});
precis.addEventListener("input", function () {
    precision = parseFloat(precis.value);
})

function getresults() {
    var t = parseFloat(document.getElementById("tempbox").value);
    var p = parseFloat(document.getElementById("pressbox").value);
    var rh, result;
    if (pick3 == "RH") {
        rh = parseFloat(document.getElementById("rhbox").value) / 100;
        result = airprops(t, p, rh);
    } else if (pick3 == "TDP") {
        rh = parseFloat(document.getElementById("rhbox").value);
        result = airprops2(t, p, rh);
    } else if (pick3 == "TWB") {
        rh = parseFloat(document.getElementById("rhbox").value);
        result = airprops3(t, p, rh);
    }
    roundtox(result, precision);
    document.getElementById("reshead").innerHTML = ""
    document.getElementById("reshead").innerHTML = "<tr><th>Property</th><th>Value</th></tr>"
    var outputtbl = document.getElementById("results");
    outputtbl.innerHTML = "";
    var row, cell, cell2;
    var i, j;
    for (i = 0; i < Object.keys(result).length; i++) {
        row = document.createElement("tr");
        cell = document.createElement("td");
        cell.innerHTML = Object.keys(result)[i];
        cell2 = document.createElement("td");
        cell2.innerHTML = result[Object.keys(result)[i]];
        row.appendChild(cell);
        row.appendChild(cell2);
        outputtbl.appendChild(row);
    }
}

function getradiovalue(e) {
    pick3 = e.value;
}