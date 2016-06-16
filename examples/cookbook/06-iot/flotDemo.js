setTargetAddress('192.168.7.2', {                           // <1>
    initialized: run
});

function run() {
    var b = require('bonescript');                          // <2>
    var POT = 'P9_36';                                      // <3>

    var container = $("#myplot");                           // <4>
    var totalPoints = container.outerWidth() / 2 || 250;    // <5>
    var data = [];
    var plotOptions = {                                     // <6>
        series: {
            shadowSize: 0
        },
        yaxis: {
            min: 0,
            max: 1
        },
        xaxis: {
            min: 0,
            max: totalPoints,
            show: false
        }
    };
    var plot = $.plot(container, getData(), plotOptions);   // <7>

    drawGraph();                                            // <8>

    function drawGraph() {                                  // <9>
        plot.setData(getData());
        plot.draw();
        b.analogRead(POT, onAnalogRead);
    }

    // Handle data back from potentiometer
    function onAnalogRead(x) {                              
        if (!x.err && typeof x.value == 'number') {
            pushData(x.value);                              // <10>
        }
        setTimeout(drawGraph, 20);                          // <11>
    }

    function pushData(y) {
        if (data.length && (data.length + 1) > totalPoints) {
            data = data.slice(1);
        }
        if (data.length < totalPoints) {
            data.push(y);
        }
    }

    function getData() {
        var res = [];
        for (var i = 0; i < data.length; ++i) {
            res.push([i, data[i]]);
        }
        var series = [{
            data: res,
            lines: {
                fill: true
            }
        }];
        return series;
    }
}