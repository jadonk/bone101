/*
 * Canvas provides the drawing surfaces.
 *
 * Use 'var canvas = Canvas.get();' to fetch the canvas.
 * canvas is an object keyed by the layer names.
 * canvas[layer].e is the layer element.
 * canvas[layer].ctx is the layer context.
 */
var Canvas = (function () {
    var canvas;

    function init() {
        canvas = {};

        var layers = {
            'Base': 'layer1', // canvas with bb and other unchanging elements
            'BTN': 'layer2', // canvas that draws buttons and corresponding elements
            'Active': 'layer3', // active canvas, constantly being cleared and redrawn by UI
            'LED0': 'layer4', // separate canvases for LEDs so they can redraw at different rates
            'LED1': 'layer5',
            'LED2': 'layer6',
            'LED3': 'layer7',
            'Bar': 'layer8', // canvas for slider bars
            'Graph': 'layer9' // canvas for base drawings of graph (axis, labels, etc)
        };

        for (var layer in layers) {
            canvas[layer] = {};
            canvas[layer].e = document.getElementById(layers[layer]);
            canvas[layer].ctx = canvas[layer].e.getContext("2d");
        }

        return (canvas);
    }

    function add(id, zIndex) {
        var canvasdiv = document.getElementById('canvasdiv');
        canvas[id] = {};
        canvas[id].e = document.createElement('canvas');
        canvas[id].e.width = canvas.Base.e.width;
        canvas[id].e.height = canvas.Base.e.height;
        canvas[id].e.style.zIndex = zIndex;
        canvas[id].e.style.left = 0;
        canvas[id].e.style.right = 0;
        canvas[id].e.style.top = 0;
        canvas[id].e.style.bottom = 0;
        canvas[id].e.style.margin = 'auto';
        canvas[id].e.style.position = "absolute";
        canvas[id].ctx = canvas[id].e.getContext("2d");
        canvasdiv.appendChild(canvas[id].e);
    }

    return {
        'get': function () {
            if (!canvas) {
                canvas = init();
            }
            return canvas;
        },
        'add': add
    };
})();
//Hardware Functions
var Hardware = (function () {
    var hw;

    function init() {
        hw = {};
        return hw;
    }

    function add(name, category, subCategory) {
        try {
            if (!hw.b) {
                hw.b = require('bonescript');
            }
        } catch (ex) {
            console.log(ex);
        }
        if (!hw.b) return;
        if (category == 'digital') {
            if (subCategory == 'output')
                hw.b.pinMode(name, hw.b.OUTPUT);
            else if (subCategory == 'pwm')
                hw.b.pinMode(name, hw.b.ANALOG_OUTPUT);
            else if (subCategory == 'input')
                hw.b.pinMode(name, hw.b.INPUT);
        }
    }

    function write(pin, callback) {
        try {
            if (!hw.b) {
                hw.b = require('bonescript');
            }
        } catch (ex) {
            console.log(ex);
        }
        if (!hw.b) return;
        if (pin.category == 'led')
            hw.b.digitalWrite(pin.name, pin.state, callback);
        else if (pin.category == 'digital') {
            if (pin.subType == 'output')
                hw.b.digitalWrite(pin.name, pin.state, callback);
            else if (pin.subType == 'pwm')
                hw.b.analogWrite(pin.name, pin.freq * pin.state, 2000, callback);
        }
    }

    function read(pin, callback) {
        try {
            if (!hw.b) {
                hw.b = require('bonescript');
            }
        } catch (ex) {
            console.log(ex);
        }
        if (!hw.b) return;
        if (pin.category == 'analog') {
            if (pin.power == 'on')
                hw.b.analogRead(pin.name, callback);
            else
                callback(null, 0);
        } else if (pin.category == 'thumbwheel')
            hw.b.analogRead('P1_19', callback);
        else if (pin.category == 'digital') {
            if (pin.subType == 'input')
                hw.b.digitalRead(pin.name, callback);
            if (pin.subType == 'pwm')
                callback(null, 3.3 * pin.freq);
        } else
            callback(null, 3.3 * pin.state);
    }

    function RCInit(pin) {
        try {
            if (!hw.b) {
                hw.b = require('bonescript');
            }
        } catch (ex) {
            console.log(ex);
        }
        if (!hw.b) return;
        if (!hw.RCInitialized) {
            hw.b.rcInitialize();
            hw.RCInitialized = true;
        }
        if (pin.category == 'servo') {
            if (!hw.RCServoInitialized && pin.power == 'on') {
                hw.b.rcServo('ENABLE');
                hw.b.rcServo('POWER_RAIL_ENABLE');
                hw.RCServoInitialized = true;
            } else if (hw.RCServoInitialized && pin.power == 'off') {
                hw.b.rcServo('POWER_RAIL_DISABLE');
                hw.b.rcServo('DISABLE');
                hw.RCServoInitialized = false;
            }
        } else if (pin.category == 'motor') {
            if (!hw.RCMotorInitialized && pin.power == 'on') {
                hw.b.rcMotor('ENABLE');
                hw.RCMotorInitialized = true;
            }
        }
    }

    function RCWrite(pin) {
        try {
            if (!hw.b) {
                hw.b = require('bonescript');
            }
        } catch (ex) {
            console.log(ex);
        }
        if (!hw.b) return;
        if (pin.category == 'servo') {
            hw.b.rcServo(Number(pin.name.replace('ch', '')), pin.pulse);
        } else if (pin.category == 'motor') {
            hw.b.rcMotor(Number(pin.name.replace('ch', '')), pin.freq * pin.state)
        }
    }

    return {
        'get': function () {
            if (!hw) {
                hw = init();
            }
            return hw;
        },
        'add': add,
        'write': write,
        'read': read,
        'RCInit': RCInit,
        'RCWrite': RCWrite
    };
})();

/*
 * UI provides the user interface drawing and interaction logic.
 * The events are registered, removed and transitioned by Events to help
 * make it clear what events are currently registered and active.
 *
 * Use 'var ui = UI.get();' to fetch the user interface object.
 */
var UI = (function () {
    var ui;

    function init() {
        ui = {};
        var hw = Hardware.get();
        var canvas = Canvas.get();

        // initialize global positions of some elements, all other elements based on these
        // positions
        var BBposX = 283;
        var BBposY = 120;
        var axisStartY = BBposY + 65;
        var axisStartX = BBposX + 240;
        var rect = {
            x: 0,
            y: BBposY - 70,
            w: canvas.Base.e.width,
            h: 523
        };
        var rectInner = {
            x: rect.x + 20,
            y: rect.y + 15,
            w: 420,
            h: 510
        };
        //the position of the probe inside the graph
        var snapProbe = {
            x: rect.x + 28,
            y: rect.y + 25
        };
        //the position of colored lines of each probe beside axis
        var graphLinePos = BBposY - 60;

        // mousedown on a button state
        ui.down = false;

        // major buttons
        ui.button = (function () {
            var button = {};

            // global buttons
            var btnX = BBposX - 250;
            var btnY = BBposY - 90;

            var buttons = {
                analog: {
                    x: btnX + 156,
                    y: btnY,
                    endX: btnX + 231,
                    endY: btnY + 15,
                    color: 'rgb(51,153,255)',
                    text: "analog",
                    s: 19,
                    offColor: 'rgb(0,51,102)',
                    warn: "Do not supply more that 1.8 V to Analog Input pins",
                    article: "an analog pin",
                    graphColors: ['rgb(0,0,255)', 'rgb(0,01,53)', 'rgb(0,102,204)', 'rgb(0,51,102)'],
                    category: "main"
                },
                digital: {
                    x: btnX + 234,
                    y: btnY,
                    endX: btnX + 309,
                    endY: btnY + 15,
                    color: 'rgb(102,204,51)',
                    text: "digital",
                    s: 19,
                    category: "main"
                },
                ground: {
                    x: btnX,
                    y: btnY,
                    endX: btnX + 75,
                    endY: btnY + 15,
                    color: 'rgb(64,64,64)',
                    text: "ground",
                    s: 19,
                    category: "main"
                },
                power: {
                    x: btnX + 78,
                    y: btnY,
                    endX: btnX + 153,
                    endY: btnY + 15,
                    color: 'rgb(255,51,51)',
                    text: "power",
                    s: 19,
                    category: "main"
                },
                led: {
                    x: btnX + 312,
                    y: btnY,
                    endX: btnX + 387,
                    endY: btnY + 15,
                    color: 'rgb(255,153,51)',
                    text: "usr leds",
                    s: 15,
                    offColor: 'rgb(102,0,0)',
                    barColor: 'rgb(255,204,153)',
                    article: "a user led",
                    graphColors: ['rgb(255,128,0)', 'rgb(164,60,0)', 'rgb(255,99,71)', 'rgb(255,69,0)'],
                    category: "main"
                },
                input: {
                    x: btnX + 234,
                    y: btnY + 20,
                    endX: btnX + 309,
                    endY: btnY + 35,
                    color: 'rgb(0,153,0)',
                    text: "input",
                    s: 22,
                    offColor: 'rgb(0,81,36)',
                    warn: "Do not supply more that 3.3 V to Digital Input pins",
                    article: "a digital pin",
                    graphColors: ['rgb(0,51,0)', 'rgb(0,204,0)', 'rgb(51,102,0)', 'rgb(0,255,0)', 'rgb(128,255,0)'],
                    category: "digital"
                },
                output: {
                    x: btnX + 234,
                    y: btnY + 40,
                    endX: btnX + 309,
                    endY: btnY + 55,
                    color: 'rgb(0,153,153)',
                    text: "output",
                    s: 19,
                    offColor: 'rgb(0,85,85)',
                    barColor: 'rgb(153,255,255)',
                    article: "a digital pin",
                    warn: "Do not draw more that 4 mA from Digital Output Pins",
                    graphColors: ['rgb(60,179,113)', 'rgb(0,153,153)', 'rgb(0,255,255)', 'rgb(0,102,102)'],
                    category: "digital"
                },
                pwm: {
                    x: btnX + 234,
                    y: btnY + 60,
                    endX: btnX + 309,
                    endY: btnY + 75,
                    color: 'rgb(153,0,153)',
                    text: "pwm",
                    s: 23,
                    offColor: 'rgb(51,0,102)',
                    barColor: 'rgb(229,204,255)',
                    warn: "Do not draw more that 4 mA from Digital Output Pins",
                    article: "a pwm pin",
                    graphColors: ['rgb(102,0,102)', 'rgb(204,0,204)', 'rgb(255,102,255)', 'rgb(51,0,51)'],
                    category: "digital"
                },
                miscbtn1: {
                    x: btnX + 532,
                    y: btnY,
                    endX: btnX + 607,
                    endY: btnY + 15,
                    color: 'rgb(76,25,81)',
                    text: "rgb LED",
                    s: 15,
                    offColor: 'rgb(102,0,0)',
                    barColor: 'rgb(255,204,153)',
                    article: "rgb led",
                    graphColors: ['rgb(102,0,204)', 'rgb(0,1,53)', 'rgb(0,51,102)', 'rgb(151,0,120)'],
                    category: "main",
                    disabled: true
                },
                miscbtn2: {
                    x: btnX + 612,
                    y: btnY,
                    endX: btnX + 712,
                    endY: btnY + 15,
                    color: 'rgb(4,32,76)',
                    text: "ThumbWheel",
                    s: 5,
                    offColor: 'rgb(2,16,38)',
                    barColor: 'rgb(255,204,153)',
                    article: "thumbwheel",
                    graphColors: ['rgb(0,01,53)', 'rgb(0,102,204)', 'rgb(0,51,102)', 'rgb(151,0,120)'],
                    category: "main",
                    disabled: true
                },
                onOff: {
                    x: snapProbe.x + 85,
                    y: snapProbe.y,
                    endX: snapProbe.x + 135,
                    endY: snapProbe.y + 15,
                    s: 6,
                    e: 28
                },
                plus: {
                    x: axisStartX + 54,
                    y: axisStartY + 240,
                    endX: axisStartX + 66,
                    endY: axisStartY + 252 + 2,
                    text: "+",
                    category: "graph"
                },
                minus: {
                    x: axisStartX + 36,
                    y: axisStartY + 240,
                    endX: axisStartX + 48,
                    endY: axisStartY + 252 + 3,
                    text: "-",
                    category: "graph"
                },
                stop: {
                    x: axisStartX + 18,
                    y: axisStartY + 240,
                    endX: axisStartX + 30,
                    endY: axisStartY + 252,
                    status: "none",
                    text: "stop",
                    category: "graph"
                },
                play: {
                    x: axisStartX,
                    y: axisStartY + 240,
                    endX: axisStartX + 12,
                    endY: axisStartY + 252,
                    status: "none",
                    text: "play",
                    category: "graph"
                },
                exit: {
                    x: canvas.Base.e.width / 2 + 250,
                    y: canvas.Base.e.height / 4 + 13,
                    endX: canvas.Base.e.width / 2 + 258,
                    endY: canvas.Base.e.height / 4 + 25,
                    category: "welcome"
                },
                digitalMenu: {
                    // in the range of the digital buttons, but not on one
                    x: btnX + 234,
                    y: btnY,
                    endX: btnX + 309,
                    endY: btnY + 75,
                    category: "digitalMenu"
                },
                beaglebone: {
                    x: btnX + 252,
                    y: btnY + 430,
                    endX: btnX + 342,
                    endY: btnY + 445,
                    color: 'rgb(22,79,15)',
                    text: "BB Green",
                    s: 15,
                    state: 'green',
                    offColor: 'rgb(102,0,0)',
                    barColor: 'rgb(255,204,153)',
                    article: "Beaglebone Black",
                    graphColors: ['rgb(255,128,0)', 'rgb(164,60,0)', 'rgb(255,99,71)', 'rgb(255,69,0)'],
                    category: "main"
                },
                beagleblue: {
                    x: btnX + 252,
                    y: btnY + 450,
                    endX: btnX + 342,
                    endY: btnY + 465,
                    color: 'rgb(0,40,104)',
                    text: "BB Blue",
                    s: 15,
                    offColor: 'rgb(102,0,0)',
                    barColor: 'rgb(255,204,153)',
                    article: "Beaglebone Blue",
                    graphColors: ['rgb(255,128,0)', 'rgb(164,60,0)', 'rgb(255,99,71)', 'rgb(255,69,0)'],
                    category: "main"
                },
                pocketbeagle: {
                    x: btnX + 352,
                    y: btnY + 430,
                    endX: btnX + 465,
                    endY: btnY + 445,
                    color: 'rgb(81,49,2)',
                    text: "PocketBeagle",
                    s: 15,
                    offColor: 'rgb(102,0,0)',
                    barColor: 'rgb(255,204,153)',
                    article: "PocketBeagle",
                    graphColors: ['rgb(255,128,0)', 'rgb(164,60,0)', 'rgb(255,99,71)', 'rgb(255,69,0)'],
                    category: "main"
                },
                baconbits: {
                    x: btnX + 352,
                    y: btnY + 450,
                    endX: btnX + 465,
                    endY: btnY + 465,
                    color: 'rgb(22,79,15)',
                    text: "BaconBits",
                    s: 25,
                    offColor: 'rgb(102,0,0)',
                    barColor: 'rgb(255,204,153)',
                    article: "BaconBits",
                    graphColors: ['rgb(255,128,0)', 'rgb(164,60,0)', 'rgb(255,99,71)', 'rgb(255,69,0)'],
                    category: "main"
                }
            };

            button.test = function (event) {
                var coords = Position(event);
                var x = coords[0];
                var y = coords[1];
                //console.log("x: " + x , ", y: " + y );

                for (var b in buttons) {
                    var minX = buttons[b].x;
                    var minY = buttons[b].y;
                    var maxX = buttons[b].endX;
                    var maxY = buttons[b].endY;
                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                        //console.log("button = " + b);
                        return b;
                    }
                }
                //console.log("button = none");
                return ("none");
            };

            //highlight analog, digital, power, ground, led buttons
            button.highlight = function (highlightButton) {
                canvas.Active.ctx.fillStyle = 'rgba(255,255,255,0.7)';
                for (var b in buttons) {
                    if (buttons[b].category == "main") {
                        button.draw(b, canvas.Active.ctx, (highlightButton == b));
                    }
                }
            };

            //highlight input, output, pwm buttons
            button.highlightDigital = function (highlightButton) {
                canvas.Active.ctx.fillStyle = 'rgba(255,255,255,0.7)';
                for (var b in buttons) {
                    if (buttons[b].category == "digital") {
                        button.draw(b, canvas.Active.ctx, (highlightButton == b));
                    }
                }
            };

            button.highlightPlus = function (flag) {
                if (flag)
                    canvas.Graph.ctx.fillStyle = "#FF4500";
                else
                    canvas.Graph.ctx.fillStyle = "#000000";
                canvas.Graph.ctx.font = 'bold 20pt Lucinda Grande';
                canvas.Graph.ctx.fillText("+", buttons.plus.x, buttons.plus.endY);
            };

            button.highlightMinus = function (flag) {
                if (flag)
                    canvas.Graph.ctx.fillStyle = "#FF4500";
                else
                    canvas.Graph.ctx.fillStyle = "#000000";
                canvas.Graph.ctx.font = '30pt Lucinda Grande';
                canvas.Graph.ctx.fillText("-", buttons.minus.x, buttons.minus.endY);
            };

            button.highlightStop = function (flag) {
                if (flag)
                    canvas.Graph.ctx.fillStyle = "#FF4500";
                else
                    canvas.Graph.ctx.fillStyle = "#000000";
                canvas.Graph.ctx.beginPath();
                canvas.Graph.ctx.moveTo(buttons.stop.x, buttons.stop.y);
                canvas.Graph.ctx.lineTo(buttons.stop.x + 12, buttons.stop.y);
                canvas.Graph.ctx.lineTo(buttons.stop.x + 12, buttons.stop.y + 12);
                canvas.Graph.ctx.lineTo(buttons.stop.x, buttons.stop.y + 12);
                canvas.Graph.ctx.fill();
            };

            button.highlightPlay = function (flag) {
                if (flag)
                    canvas.Graph.ctx.fillStyle = "#FF4500";
                else
                    canvas.Graph.ctx.fillStyle = "#000000";
                canvas.Graph.ctx.beginPath();
                canvas.Graph.ctx.moveTo(buttons.play.x, buttons.play.y);
                canvas.Graph.ctx.lineTo(buttons.play.x + 10, buttons.play.y + 7);
                canvas.Graph.ctx.lineTo(buttons.play.x, buttons.play.y + 14);
                canvas.Graph.ctx.fill();
            };

            /*
            the draw function is used to draw the main buttons and probes.
            use highlight = true when dragging a button into graph otherwise the highlight is false.
            */
            button.draw = function (b, context, highlight, x, y) {
                var radius = 1;
                var btn = buttons[b];
                if (btn.disabled) return;
                var endX, endY;
                if (!x || !y) {
                    x = btn.x;
                    y = btn.y;
                    endX = btn.endX;
                    endY = btn.endY;
                } else {
                    endX = x + (btn.endX - btn.x);
                    endY = y + (btn.endY - btn.y);
                }
                var color = btn.color;
                var text = btn.text;
                var s = btn.s;
                context.beginPath();
                context.lineWidth = "1";
                context.moveTo(x + radius, y);
                context.lineTo(endX - radius, y);
                context.quadraticCurveTo(endX, y, endX, y + radius);
                context.lineTo(endX, endY - radius);
                context.quadraticCurveTo(endX, endY, endX - radius, endY);
                context.lineTo(x + radius, endY);
                context.quadraticCurveTo(x, endY, x, endY - radius);
                context.lineTo(x, y + radius);
                context.quadraticCurveTo(x, y, x + radius, y);
                if (highlight === true) {
                    context.strokeStyle = color;
                    context.stroke();
                    context.fillStyle = 'white';
                    context.fill();
                    context.fillStyle = color;
                } else {
                    context.strokeStyle = color;
                    context.stroke();
                    context.fillStyle = color;
                    context.fill();
                    context.fillStyle = 'white';
                }
                context.font = '10pt Andale Mono';
                context.fillText(text, x + s, y + 12);
            };

            button.createOutput = function () {
                button.push('output', true);
                var probes = Object.keys(buttons);
                probeName = probes[probes.length - 22];
                probe = buttons[probeName];
                probe2 = buttons[probes[probes.length - 23]]
                ui.wire.link(probe2, probe);
                probe.input = "on";
                canvas.Active.ctx.fillStyle = 'red';
                canvas.Active.ctx.font = '12pt Andale Mono';
                canvas.Active.ctx.fillText("select " + probe.article, BBposX + 10, BBposY - 25);
            };

            //draw play, stop, zooming buttons
            button.drawGraphbtn = function (b, context) {
                var btn = buttons[b];
                // zoom in
                if (btn.text == "+") {
                    context.font = 'bold 20pt Lucinda Grande';
                    context.fillText(btn.text, btn.x, btn.endY);
                    context.save();
                }

                // zoom out
                else if (btn.text == "-") {
                    context.font = '30pt Lucinda Grande';
                    context.fillText(btn.text, btn.x, btn.endY);
                    context.save();
                }

                // play button
                else if (btn.text == "play") {
                    context.beginPath();
                    context.moveTo(btn.x, btn.y);
                    context.lineTo(btn.x + 10, btn.y + 7);
                    context.lineTo(btn.x, btn.y + 14);
                    context.fill();
                    context.restore();
                    context.save();
                }

                // stop button
                else {
                    context.beginPath();
                    context.moveTo(btn.x, btn.y);
                    context.lineTo(btn.x + 12, btn.y);
                    context.lineTo(btn.x + 12, btn.y + 12);
                    context.lineTo(btn.x, btn.y + 12);
                    context.fill();
                    context.restore();
                }
            };

            var probeIndex = 0
            button.push = function (b, output) {
                buttons[probeIndex] = {};
                for (var prop in buttons[b]) {
                    if (buttons[b].hasOwnProperty(prop)) {
                        buttons[probeIndex][prop] = buttons[b][prop];
                    }
                }
                buttons[probeIndex].name = b;
                buttons[probeIndex].x = snapProbe.x;
                buttons[probeIndex].y = snapProbe.y;
                buttons[probeIndex].endX = snapProbe.x + 75;
                buttons[probeIndex].endY = snapProbe.y + 15;
                buttons[probeIndex].status = "probe";
                if (b == 'miscbtn2' && ui.pin.board == 'baconbits')
                    buttons[probeIndex].endX += 24;
                //ui.probe.push(buttons[probeIndex]);

                //output is true if the input button selected.
                if (output === true) {
                    buttons[probeIndex].x = snapProbe.x + 75;
                    buttons[probeIndex].endX = snapProbe.x + 150;
                    button.draw(probeIndex, canvas.Base.ctx, false, snapProbe.x + 75, snapProbe.y);
                } else {
                    button.draw(probeIndex, canvas.Base.ctx, false);
                }
                snapProbe.y += 22;
                if (b == 'miscbtn1' && ui.pin.board == 'baconbits')
                    snapProbe.y += 44;
                probeIndex++;
            };

            //removing a button and resetting snapProbe position.
            button.pop = function () {
                snapProbe.y -= 22;
                probeIndex--;
                var button = buttons[probeIndex];
                delete buttons[probeIndex];
                return button;
            };

            button.get = function () {
                return buttons;
            }

            //draw initial buttons to the canvas
            for (var b in buttons) {
                if (buttons[b].category == "main") {
                    button.draw(b, canvas.Base.ctx, false);
                } else if (buttons[b].category == "graph") {
                    button.drawGraphbtn(b, canvas.Graph.ctx);
                }
            }

            return button;
        })();

        ui.bar = (function () {
            var bar = {};
            var bars = [];

            // slider bar properties, not necessarily connected to led
            bar.create = function (probe, pin) {
                var bar = {
                    color: probe.color,
                    outline: probe.color,
                    height: 15,
                    length: 70,
                    locX: probe.endX + 70,
                    locY: probe.y,
                    btn: probe,
                    move: "off",
                    pin: pin,
                    sliderX: 0,
                    sliderY: 0,
                    frequency: 0,
                    setSliderX: function () {
                        this.sliderX = this.locX + 2;
                    },
                    setSliderY: function () {
                        this.sliderY = this.locY + 2;
                    },
                    setFrequency: function () {
                        this.frequency = this.sliderX - this.locX - 2;
                    },
                    text: "0 s",
                    type: probe.name
                };

                bar.setSliderX();
                bar.setSliderY();
                bar.setFrequency();
                if (bar.pin.category == 'servo')
                    bar.text = '-1.5';
                else if (probe.name === "pwm" || probe.pinNum.category == 'motor') {
                    bar.text = bar.frequency.toString();
                } else {
                    bar.text = (bar.frequency.toString() + ' s');
                };

                bars.push(bar);
                return bars;
            };
            bar.createRGBBar = function (probe, pin) {
                //Red Bar
                var barR = {
                    color: 'rgb(255,0,0)',
                    outline: 'rgb(255,0,0)',
                    height: 15,
                    length: 70,
                    locX: probe.endX + 70,
                    locY: probe.y,
                    btn: probe,
                    move: "off",
                    pin: pin,
                    sliderX: 0,
                    sliderY: 0,
                    frequency: 0,
                    setSliderX: function () {
                        this.sliderX = this.locX + 2;
                    },
                    setSliderY: function () {
                        this.sliderY = this.locY + 2;
                    },
                    setFrequency: function () {
                        this.frequency = this.sliderX - this.locX - 2;
                    },
                    text: "0 s",
                    type: 'rgbr'
                };

                barR.setSliderX();
                barR.setSliderY();
                barR.setFrequency();
                barR.text = barR.frequency.toString();

                var barG = {
                    color: 'rgb(0,255,0)',
                    outline: 'rgb(0,255,0)',
                    height: 15,
                    length: 70,
                    locX: probe.endX + 70,
                    locY: probe.y + 18,
                    btn: probe,
                    move: "off",
                    pin: pin,
                    sliderX: 0,
                    sliderY: 0,
                    frequency: 0,
                    setSliderX: function () {
                        this.sliderX = this.locX + 2;
                    },
                    setSliderY: function () {
                        this.sliderY = this.locY + 2;
                    },
                    setFrequency: function () {
                        this.frequency = this.sliderX - this.locX - 2;
                    },
                    text: "0 s",
                    type: 'rgbg'
                };

                barG.setSliderX();
                barG.setSliderY();
                barG.setFrequency();
                barG.text = barG.frequency.toString();

                var barB = {
                    color: 'rgb(0,0,255)',
                    outline: 'rgb(0,0,255)',
                    height: 15,
                    length: 70,
                    locX: probe.endX + 70,
                    locY: probe.y + 36,
                    btn: probe,
                    move: "off",
                    pin: pin,
                    sliderX: 0,
                    sliderY: 0,
                    frequency: 0,
                    setSliderX: function () {
                        this.sliderX = this.locX + 2;
                    },
                    setSliderY: function () {
                        this.sliderY = this.locY + 2;
                    },
                    setFrequency: function () {
                        this.frequency = this.sliderX - this.locX - 2;
                    },
                    text: "0",
                    type: 'rgbb'
                };

                barB.setSliderX();
                barB.setSliderY();
                barB.setFrequency();
                barB.text = barB.frequency.toString();

                bars.push(barR);
                bar.draw();
                bars.push(barG);
                bar.draw();
                bars.push(barB);
                bar.draw();
                return bars;
            };

            bar.draw = function (index) {
                var len = bars.length;
                if (typeof index == 'undefined') index = len - 1;
                //canvas.Bar.ctx.clearRect(0,0,canvas.Bar.e.width,canvas.Bar.e.height);
                canvas.Bar.ctx.fillStyle = 'rgb(205,205,205)';
                canvas.Bar.ctx.fillRect(bars[index].locX, bars[index].locY, bars[index].length, bars[index].height);
                canvas.Bar.ctx.fillStyle = bars[index].barColor;
                canvas.Bar.ctx.fillRect(bars[index].locX, bars[index].locY, bars[index].sliderX - bars[index].locX, 15);
                canvas.Bar.ctx.fillStyle = 'rgb(30,30,30)';
                canvas.Bar.ctx.fillRect(bars[index].sliderX - 2, bars[index].sliderY - 2, 14, 15); //width and height of slider
                canvas.Bar.ctx.strokeStyle = bars[index].outline;
                canvas.Bar.ctx.lineWidth = 2;
                canvas.Bar.ctx.strokeRect(bars[index].locX, bars[index].locY, bars[index].length, bars[index].height);
                canvas.Bar.ctx.fillStyle = 'black';
                canvas.Bar.ctx.strokeStyle = 'rgb(225,225,225)';
                canvas.Bar.ctx.lineWidth = 6;
                canvas.Bar.ctx.font = '8pt Andale Mono';
                canvas.Bar.ctx.clearRect(bars[index].locX + bars[index].length + 3, bars[index].locY, 50, 15);
                canvas.Bar.ctx.strokeText(bars[index].text, bars[index].length + bars[index].locX + 5,
                    bars[index].height + bars[index].locY - 2);
                canvas.Bar.ctx.fillText(bars[index].text, bars[index].length + bars[index].locX + 5,
                    bars[index].height + bars[index].locY - 2);
            };

            bar.move = function (event) {
                var coord = Position(event);
                var x = coord[0];
                var y = coord[1];
                var i;
                var len = bars.length;
                for (i = 0; i < len; i++) {
                    if (bars[i].move === 'on') {
                        bars[i].sliderX = x - 5;
                        if (bars[i].sliderX < bars[i].locX + 2) {
                            bars[i].sliderX = bars[i].locX + 2;
                            if (bars[i].pin.category == 'servo')
                                bars[i].frequency = -1.5
                            else
                                bars[i].frequency = 0;
                        } else if (bars[i].sliderX > bars[i].length + bars[i].locX - 12) {
                            bars[i].sliderX = bars[i].length + bars[i].locX - 12;
                            if (bars[i].type === "pwm" || bars[i].type.indexOf('rgb') >= 0 || bars[i].pin.category == 'motor') {
                                bars[i].frequency = 1;
                            } else if (bars[i].pin.category == 'servo') {
                                bars[i].frequency = 1.5;
                            } else {
                                bars[i].frequency = 10;
                            }
                        } else {
                            if (bars[i].type === "pwm" || bars[i].type.indexOf('rgb') >= 0 || bars[i].pin.category == 'motor') {
                                bars[i].frequency = ((bars[i].sliderX - bars[i].locX - 2) / 60).toPrecision(2);
                            } else if (bars[i].pin.category == 'servo') {
                                bars[i].frequency = ((bars[i].sliderX - bars[i].locX - 31) / 20).toPrecision(2);
                            } else {
                                bars[i].frequency = ((bars[i].sliderX - bars[i].locX - 2) / 6).toPrecision(2);
                            }
                        }
                        if (bars[i].type === "pwm" || bars[i].type.indexOf('rgb') >= 0 || bars[i].pin.category == 'servo' || bars[i].pin.category == 'motor') {
                            bars[i].pin.freq = bars[i].frequency;
                            bars[i].text = bars[i].frequency.toString();
                        } else {
                            bars[i].pin.freq = bars[i].frequency * 1000;
                            bars[i].text = bars[i].frequency.toString() + ' s';
                        }
                        bar.draw(i);
                        if (bars[i].type.indexOf('rgb') >= 0) {
                            if (bars[i].type === "rgbr") {
                                bars[i].pin.red = bars[i].pin.freq;
                            } else if (bars[i].type === "rgbg") {
                                bars[i].pin.green = bars[i].pin.freq;
                            } else if (bars[i].type === "rgbb") {
                                bars[i].pin.blue = bars[i].pin.freq;
                            }
                            ui.pin.rgb(bars[i].pin);
                            ui.pin.rgbgradientLight(bars[i].pin);
                        } else if (bars[i].pin.category == 'servo') {
                            bars[i].pin.pulse = bars[i].pin.freq * bars[i].pin.state;
                            Hardware.RCWrite(bars[i].pin);
                        } else if (bars[i].pin.category == 'motor') {
                            Hardware.RCWrite(bars[i].pin);
                        } else if (bars[i].pin.freq != 0 && bars[i].pin.power === 'on' && pin.subType != 'pwm') {
                            ui.pin.blink(bars[i].pin);
                        }
                        //calling socket; this should be done with Hardware object.
                        else if (bars[i].pin.power === 'on') {
                            clearInterval(bars[i].pin.blinking);
                            ui.pin.blink(bars[i].pin);
                        }
                    }
                }
            };

            bar.off = function () {
                var len = bars.length;
                for (i = 0; i < len; i++) {
                    if (bars[i].move === 'on') {
                        bars[i].move = 'off';
                    }
                }
            };

            //returns the black square slider in slider bar.
            bar.sliderTest = function (event) {
                var coord = Position(event);
                var x = coord[0];
                var y = coord[1];
                var i;
                var len = bars.length;
                bar.off();
                for (i = 0; i < len; i++) {
                    if (x <= (bars[i].sliderX + 12) && x >= bars[i].sliderX - 2 && y >= bars[i].sliderY - 2 && y <= (bars[i].sliderY + 13)) {
                        bars[i].move = 'on';
                        return "slider";
                    }
                }
            };

            //returns the whole slider bar.
            bar.test = function (event) {
                var coords = Position(event);
                var x = coords[0];
                var y = coords[1];
                for (var i = 0; i < bars.length; i++) {
                    var minX = bars[i].locX;
                    var minY = bars[i].locY;
                    var maxX = minX + bars[i].length;
                    var maxY = minY + bars[i].height;
                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                        console.log("bar = " + bars[i]);
                        return "slider";
                    }
                }
                //console.log("button = none");
                return ("none");
            };

            return bar;
        })();

        ui.onOff = (function () {
            var onOff = {};
            var onOffs = [];
            var buttons = ui.button.get();
            // onOff button properties
            onOff.create = function (probe, pin) {
                var Onoff = {
                    locX: probe.x + 85,
                    locY: probe.y,
                    height: 15,
                    width: 50,
                    probe: probe,
                    pin: pin,
                    type: probe.name
                };
                if (probe.text == 'thumbwheel')
                    Onoff.locX += 24;
                onOffs.push(Onoff);
                onOff.on()
                return onOffs;
            };

            onOff.on = function (index) {
                var len = onOffs.length;
                if (typeof index == 'undefined')
                    index = len - 1;
                var probe = onOffs[index].probe;
                probe.pinNum.power = "on";
                probe.pinNum.state = 1;
                if (ui.pin.board == 'beagleblue') {
                    Hardware.RCInit(probe.pinNum);
                    Hardware.RCWrite(probe.pinNum);
                } else
                    ui.pin.blink(onOffs[index].pin);
                var btn = buttons['onOff'];
                var x = onOffs[index].locX;
                var y = onOffs[index].locY;
                var color = probe.color;
                var offColor = probe.offColor;
                var s = btn.s;
                var e = btn.e;
                var w = 50;
                var h = 15;
                var r = probe.endX + 60;
                var b = probe.endY;
                var radius = 1;

                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.lineWidth = "1";
                canvas.BTN.ctx.moveTo(x + radius, y);
                canvas.BTN.ctx.lineTo(r - radius, y);
                canvas.BTN.ctx.quadraticCurveTo(r, y, r, y + radius);
                canvas.BTN.ctx.lineTo(r, y + h - radius);
                canvas.BTN.ctx.quadraticCurveTo(r, b, r - radius, b);
                canvas.BTN.ctx.lineTo(x + radius, b);
                canvas.BTN.ctx.quadraticCurveTo(x, b, x, b - radius);
                canvas.BTN.ctx.lineTo(x, y + radius);
                canvas.BTN.ctx.quadraticCurveTo(x, y, x + radius, y);
                canvas.BTN.ctx.strokeStyle = color;
                canvas.BTN.ctx.stroke();
                canvas.BTN.ctx.fillStyle = color;
                canvas.BTN.ctx.fill()
                canvas.BTN.ctx.fillStyle = 'white';
                canvas.BTN.ctx.font = '10pt Andale Mono';
                if (probe.category == 'miscbtn2' && ui.pin.board == 'beagleblue')
                    canvas.BTN.ctx.fillText('F', x + s, y + 12);
                else
                    canvas.BTN.ctx.fillText('on', x + s, y + 12);
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(x + w / 2, y);
                canvas.BTN.ctx.lineTo(r - radius, y);
                canvas.BTN.ctx.quadraticCurveTo(r, y, r, y + radius);
                canvas.BTN.ctx.lineTo(r, y + h - radius);
                canvas.BTN.ctx.quadraticCurveTo(r, b, r - radius, b);
                canvas.BTN.ctx.lineTo(x + w / 2, b);
                canvas.BTN.ctx.fillStyle = offColor;
                canvas.BTN.ctx.fill()
                canvas.BTN.ctx.fillStyle = 'black';
                canvas.BTN.ctx.font = '10pt Andale Mono';
                if (probe.category == 'miscbtn2' && ui.pin.board == 'beagleblue')
                    canvas.BTN.ctx.fillText('R', x + e, y + 12);
                else
                    canvas.BTN.ctx.fillText('off', x + e, y + 12);
            };

            onOff.off = function (index) {
                var len = onOffs.length;
                if (typeof index == 'undefined')
                    index = len - 1;
                var probe = onOffs[index].probe;
                onOffs[index].pin.power = "off";
                if (probe.category == 'miscbtn2' && ui.pin.board == 'beagleblue')
                    onOffs[index].pin.state = -1;
                else
                    onOffs[index].pin.state = 0;
                if (ui.pin.board == 'beagleblue') {
                    Hardware.RCInit(probe.pinNum);
                    Hardware.RCWrite(probe.pinNum)
                } else
                    ui.pin.blink(onOffs[index].pin);
                var btn = buttons['onOff'];
                var x = onOffs[index].locX;
                var y = onOffs[index].locY;
                var color = probe.color;
                var offColor = probe.offColor;
                var s = btn.s;
                var s = btn.s;
                var e = btn.e;
                var w = 50;
                var h = 15;
                var r = probe.endX + 60;
                var b = probe.endY;
                var radius = 1;

                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.lineWidth = "1";
                canvas.BTN.ctx.moveTo(x + radius, y);
                canvas.BTN.ctx.lineTo(r - radius, y);
                canvas.BTN.ctx.quadraticCurveTo(r, y, r, y + radius);
                canvas.BTN.ctx.lineTo(r, y + h - radius);
                canvas.BTN.ctx.quadraticCurveTo(r, b, r - radius, b);
                canvas.BTN.ctx.lineTo(x + radius, b);
                canvas.BTN.ctx.quadraticCurveTo(x, b, x, b - radius);
                canvas.BTN.ctx.lineTo(x, y + radius);
                canvas.BTN.ctx.quadraticCurveTo(x, y, x + radius, y);
                canvas.BTN.ctx.strokeStyle = color;
                canvas.BTN.ctx.stroke();
                canvas.BTN.ctx.fillStyle = color;
                canvas.BTN.ctx.fill()
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(x + w / 2, b);
                canvas.BTN.ctx.lineTo(x + radius, b);
                canvas.BTN.ctx.quadraticCurveTo(x, b, x, b - radius);
                canvas.BTN.ctx.lineTo(x, y + radius);
                canvas.BTN.ctx.quadraticCurveTo(x, y, x + radius, y);
                canvas.BTN.ctx.lineTo(x + w / 2, y);
                canvas.BTN.ctx.fillStyle = offColor;
                canvas.BTN.ctx.fill();
                canvas.BTN.ctx.fillStyle = 'black';
                canvas.BTN.ctx.font = '10pt Andale Mono';
                if (probe.category == 'miscbtn2' && ui.pin.board == 'beagleblue')
                    canvas.BTN.ctx.fillText('F', x + s, y + 12);
                else
                    canvas.BTN.ctx.fillText('on', x + s, y + 12);
                canvas.BTN.ctx.fillStyle = 'white';
                canvas.BTN.ctx.font = '10pt Andale Mono';
                if (probe.category == 'miscbtn2' && ui.pin.board == 'beagleblue')
                    canvas.BTN.ctx.fillText('R', x + e, y + 12);
                else
                    canvas.BTN.ctx.fillText('off', x + e, y + 12);
            };

            //returns the on or off button.
            onOff.test = function (event) {
                var coords = Position(event);
                var x = coords[0];
                var y = coords[1];
                for (var i = 0; i < onOffs.length; i++) {
                    var minXOn = onOffs[i].locX;
                    var minY = onOffs[i].locY;
                    var maxXOn = minXOn + onOffs[i].width / 2;
                    var minXOff = maxXOn;
                    var maxXOff = minXOff + onOffs[i].width / 2;
                    var maxY = minY + onOffs[i].height;
                    if (x >= minXOn && x <= maxXOn && y >= minY && y <= maxY) {
                        onOff.on(i);
                        ui.pin.getVoltage(onOffs[i].pin)
                        return "probeon";
                    } else if (x >= minXOff && x <= maxXOff && y >= minY && y <= maxY) {
                        onOff.off(i);
                        return "probeoff";
                    }
                }
                return ("none");
            };
            return onOff;
        })();

        //wire object is responsible for drawing all wires in graph
        // wires are drawn in BTN canvas
        ui.wire = (function () {
            var wire = {};
            var btnHeight = 15;

            wire.led = function (pin, probe) {
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(probe.x + 75, probe.y + btnHeight * 0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 143, probe.y + btnHeight * 0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 143, rect.y + 10);
                canvas.BTN.ctx.lineTo(pin.x + pin.w / 2, rect.y + 10);
                canvas.BTN.ctx.lineTo(pin.x + pin.w / 2, pin.y);
                canvas.BTN.ctx.strokeStyle = pin.color;
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.stroke();
            };

            wire.analog = function (pin, probe) {
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(probe.x + 75, probe.y + btnHeight * 0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 140, probe.y + btnHeight * 0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 140, pin.y + pin.h / 2);
                canvas.BTN.ctx.lineTo(pin.x + pin.w / 2, pin.y + pin.h / 2);
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.strokeStyle = pin.color;
                canvas.BTN.ctx.stroke();
            };
            wire.rgbled = function (pin, probe) {
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(probe.x + 75, probe.y + btnHeight * 0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 140, probe.y + btnHeight * 0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 140, pin.y + pin.h / 2);
                canvas.BTN.ctx.lineTo(pin.x + pin.w / 2, pin.y + pin.h / 2);
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.strokeStyle = pin.color;
                canvas.BTN.ctx.stroke();
            };
            wire.thumbwheel = function (pin, probe) {
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(probe.x + 95, probe.y + btnHeight * 0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 140, probe.y + btnHeight * 0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 140, pin.y + pin.h / 2);
                canvas.BTN.ctx.lineTo(pin.x + pin.w / 2, pin.y + pin.h / 2);
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.strokeStyle = pin.color;
                canvas.BTN.ctx.stroke();
            };

            wire.digital = function (pin, probe) {
                canvas.BTN.ctx.beginPath();
                if (pin.subType == "input") {
                    var s = -2;
                } else if (pin.subType == "output") {
                    var s = -6;
                } else {
                    var s = -4;
                }
                canvas.BTN.ctx.strokeStyle = pin.color;
                canvas.BTN.ctx.moveTo(probe.x + 75, probe.y + btnHeight * 0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 141 + s, probe.y + btnHeight * 0.5);
                canvas.BTN.ctx.lineTo(rectInner.w - 141 + s, pin.y + pin.h / 2);
                canvas.BTN.ctx.lineTo(pin.x + pin.w / 2, pin.y + pin.h / 2);
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.stroke();
            };

            wire.link = function (btn1, btn2) {
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(btn1.endX / 2 + 15, btn1.y + btnHeight);
                canvas.BTN.ctx.lineTo(btn1.endX / 2 + 15, btn2.y + btnHeight * 0.5);
                canvas.BTN.ctx.lineTo(btn2.x, btn2.y + btnHeight * 0.5);
                canvas.BTN.ctx.strokeStyle = 'rgb(0,153,110)';
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.stroke();
            };

            wire.drawToGraph = function (pin) {
                canvas.BTN.ctx.beginPath();
                canvas.BTN.ctx.moveTo(rectInner.w + 40, graphLinePos);
                canvas.BTN.ctx.lineTo(rectInner.w + 70, graphLinePos);
                canvas.BTN.ctx.strokeStyle = pin.color;
                canvas.BTN.ctx.lineWidth = 2;
                canvas.BTN.ctx.stroke();
                graphLinePos += 4;
            };

            return wire;
        })();

        ui.pin = (function () {
            var pin = {};
            var pins;
            pin.initialize = function (board) {
                board = typeof board == 'undefined' ? 'beaglebone' : board;
                pin.board = board;
                BBpins = [
                    // P9
                    {
                        name: 'GND',
                        category: 'ground'
                    }, {
                        name: 'GND',
                        category: 'ground'
                    }, {
                        name: 'VDD 3.3V',
                        category: 'power'
                    }, {
                        name: 'VDD 3.3V',
                        category: 'power'
                    }, {
                        name: 'VDD 5V',
                        category: ''
                    }, {
                        name: 'VDD 5V',
                        category: ''
                    }, {
                        name: 'SYS 5V',
                        category: ''
                    }, {
                        name: 'SYS 5V',
                        category: ''
                    }, {
                        name: 'PWR_BUT',
                        category: 'reset'
                    }, {
                        name: 'SYS_RESETn',
                        category: 'reset'
                    }, {
                        name: 'P9_11',
                        category: 'digital'
                    }, {
                        name: 'P9_12',
                        category: 'digital'
                    }, {
                        name: 'P9_13',
                        category: 'digital'
                    }, {
                        name: 'P9_14',
                        category: 'digital',
                        PWM: true
                    }, {
                        name: 'P9_15',
                        category: 'digital'
                    }, {
                        name: 'P9_16',
                        category: 'digital',
                        PWM: true
                    }, {
                        name: 'P9_17',
                        category: 'digital'
                    }, {
                        name: 'P9_18',
                        category: 'digital'
                    }, {
                        name: 'P9_19',
                        category: 'i2c'
                    }, {
                        name: 'P9_20',
                        category: 'i2c'
                    }, {
                        name: 'P9_21',
                        category: 'digital',
                        PWM: true
                    }, {
                        name: 'P9_22',
                        category: 'digital',
                        PWM: true
                    }, {
                        name: 'P9_23',
                        category: 'digital'
                    }, {
                        name: 'P9_24',
                        category: 'digital'
                    }, {
                        name: 'P9_25',
                        category: 'digital'
                    }, {
                        name: 'P9_26',
                        category: 'digital'
                    }, {
                        name: 'P9_27',
                        category: 'digital'
                    }, {
                        name: 'P9_28',
                        category: ''
                    }, {
                        name: 'P9_29',
                        category: ''
                    }, {
                        name: 'P9_30',
                        category: 'digital'
                    }, {
                        name: 'P9_31',
                        category: ''
                    }, {
                        name: 'P9_32',
                        category: ''
                    }, {
                        name: 'P9_33',
                        category: 'analog'
                    }, {
                        name: 'P9_34',
                        category: ''
                    }, {
                        name: 'P9_35',
                        category: 'analog'
                    }, {
                        name: 'P9_36',
                        category: 'analog'
                    }, {
                        name: 'P9_37',
                        category: 'analog'
                    }, {
                        name: 'P9_38',
                        category: 'analog'
                    }, {
                        name: 'P9_39',
                        category: 'analog'
                    }, {
                        name: 'P9_40',
                        category: 'analog'
                    }, {
                        name: 'P9_41',
                        category: 'digital'
                    }, {
                        name: 'P9_42',
                        category: 'digital',
                        PWM: true
                    }, {
                        name: 'GND',
                        category: 'ground'
                    }, {
                        name: 'GND',
                        category: 'ground'
                    }, {
                        name: 'GND',
                        category: 'ground'
                    }, {
                        name: 'GND',
                        category: 'ground'
                    },
                    // P8
                    {
                        name: 'GND',
                        category: 'ground'
                    }, {
                        name: 'GND',
                        category: 'ground'
                    }, {
                        name: 'P8_3',
                        category: ''
                    }, {
                        name: 'P8_4',
                        category: ''
                    }, {
                        name: 'P8_5',
                        category: ''
                    }, {
                        name: 'P8_6',
                        category: ''
                    }, {
                        name: 'P8_7',
                        category: 'digital'
                    }, {
                        name: 'P8_8',
                        category: 'digital'
                    }, {
                        name: 'P8_9',
                        category: 'digital'
                    }, {
                        name: 'P8_10',
                        category: 'digital'
                    }, {
                        name: 'P8_11',
                        category: 'digital'
                    }, {
                        name: 'P8_12',
                        category: 'digital'
                    }, {
                        name: 'P8_13',
                        category: 'digital',
                        PWM: true
                    }, {
                        name: 'P8_14',
                        category: 'digital'
                    }, {
                        name: 'P8_15',
                        category: 'digital'
                    }, {
                        name: 'P8_16',
                        category: 'digital'
                    }, {
                        name: 'P8_17',
                        category: 'digital'
                    }, {
                        name: 'P8_18',
                        category: 'digital'
                    }, {
                        name: 'P8_19',
                        category: 'digital',
                        PWM: true
                    }, {
                        name: 'P8_20',
                        category: ''
                    }, {
                        name: 'P8_21',
                        category: ''
                    }, {
                        name: 'P8_22',
                        category: ''
                    }, {
                        name: 'P8_23',
                        category: ''
                    }, {
                        name: 'P8_24',
                        category: ''
                    }, {
                        name: 'P8_25',
                        category: ''
                    }, {
                        name: 'P8_26',
                        category: 'digital'
                    }, {
                        name: 'P8_27',
                        category: ''
                    }, {
                        name: 'P8_28',
                        category: ''
                    }, {
                        name: 'P8_29',
                        category: ''
                    }, {
                        name: 'P8_30',
                        category: ''
                    }, {
                        name: 'P8_31',
                        category: ''
                    }, {
                        name: 'P8_32',
                        category: ''
                    }, {
                        name: 'P8_33',
                        category: ''
                    }, {
                        name: 'P8_34',
                        category: ''
                    }, {
                        name: 'P8_35',
                        category: ''
                    }, {
                        name: 'P8_36',
                        category: ''
                    }, {
                        name: 'P8_37',
                        category: ''
                    }, {
                        name: 'P8_38',
                        category: ''
                    }, {
                        name: 'P8_39',
                        category: ''
                    }, {
                        name: 'P8_40',
                        category: ''
                    }, {
                        name: 'P8_41',
                        category: ''
                    }, {
                        name: 'P8_42',
                        category: ''
                    }, {
                        name: 'P8_43',
                        category: ''
                    }, {
                        name: 'P8_44',
                        category: ''
                    }, {
                        name: 'P8_45',
                        category: ''
                    }, {
                        name: 'P8_46',
                        category: ''
                    },
                    // LEDs
                    {
                        name: 'USR3',
                        category: 'led'
                    }, {
                        name: 'USR2',
                        category: 'led'
                    }, {
                        name: 'USR1',
                        category: 'led'
                    }, {
                        name: 'USR0',
                        category: 'led'
                    }
                ];
                PBpins = [
                    // P1
                    {
                        name: 'P1_1',
                        category: ''
                    }, {
                        name: 'P1_2',
                        category: 'digital'
                    }, {
                        name: 'P1_3',
                        category: 'digital'
                    }, {
                        name: 'P1_4',
                        category: 'digital'
                    }, {
                        name: 'P1_5',
                        category: ''
                    }, {
                        name: 'P1_6',
                        category: 'digital'
                    }, {
                        name: 'P1_7',
                        category: ''
                    }, {
                        name: 'P1_8',
                        category: 'digital'
                    }, {
                        name: 'P1_9',
                        category: 'reset'
                    }, {
                        name: 'P1_10',
                        category: 'digital'
                    }, {
                        name: 'P1_11',
                        category: ''
                    }, {
                        name: 'P1_12',
                        category: 'digital'
                    }, {
                        name: 'P1_13',
                        category: ''
                    }, {
                        name: 'P1_14',
                        category: 'power'
                    }, {
                        name: 'P1_15',
                        category: ''
                    }, {
                        name: 'P1_16',
                        category: 'ground'
                    }, {
                        name: 'P1_17',
                        category: 'aref'
                    }, {
                        name: 'P1_18',
                        category: 'aref'
                    }, {
                        name: 'P1_19',
                        category: 'analog'
                    }, {
                        name: 'P1_20',
                        category: 'digital'
                    }, {
                        name: 'P1_21',
                        category: 'analog'
                    }, {
                        name: 'P1_22',
                        category: 'ground'
                    }, {
                        name: 'P1_23',
                        category: 'analog'
                    }, {
                        name: 'P1_24',
                        category: 'power'
                    }, {
                        name: 'P1_25',
                        category: 'analog'
                    }, {
                        name: 'P1_26',
                        category: 'digital'
                    }, {
                        name: 'P1_27',
                        category: 'analog'
                    }, {
                        name: 'P1_28',
                        category: 'digital'
                    }, {
                        name: 'P1_29',
                        category: 'digital'
                    }, {
                        name: 'P1_30',
                        category: 'digital'
                    }, {
                        name: 'P1_31',
                        category: 'digital'
                    }, {
                        name: 'P1_32',
                        category: 'digital'
                    }, {
                        name: 'P1_33',
                        category: 'digital',
                        PWM: true
                    }, {
                        name: 'P1_34',
                        category: 'digital'
                    }, {
                        name: 'P1_35',
                        category: 'digital'
                    }, {
                        name: 'P1_36',
                        category: 'digital',
                        PWM: true
                    },
                    // P2
                    {
                        name: 'P2_1',
                        category: 'digital',
                        PWM: true
                    }, {
                        name: 'P2_2',
                        category: 'digital'
                    }, {
                        name: 'P2_3',
                        category: 'digital',
                        PWM: true
                    }, {
                        name: 'P2_4',
                        category: 'digital'
                    }, {
                        name: 'P2_5',
                        category: 'digital'
                    }, {
                        name: 'P2_6',
                        category: 'digital'
                    }, {
                        name: 'P2_7',
                        category: 'digital'
                    }, {
                        name: 'P2_8',
                        category: 'digital'
                    }, {
                        name: 'P2_9',
                        category: 'digital'
                    }, {
                        name: 'P2_10',
                        category: 'digital'
                    }, {
                        name: 'P2_11',
                        category: 'digital'
                    }, {
                        name: 'P2_12',
                        category: ''
                    }, {
                        name: 'P2_13',
                        category: 'power'
                    }, {
                        name: 'P2_14',
                        category: ''
                    }, {
                        name: 'P2_15',
                        category: 'ground'
                    }, {
                        name: 'P2_16',
                        category: ''
                    }, {
                        name: 'P2_17',
                        category: 'digital'
                    }, {
                        name: 'P2_18',
                        category: 'digital'
                    }, {
                        name: 'P2_19',
                        category: 'digital'
                    }, {
                        name: 'P2_20',
                        category: 'digital'
                    }, {
                        name: 'P2_21',
                        category: 'ground'
                    }, {
                        name: 'P2_22',
                        category: 'digital'
                    }, {
                        name: 'P2_23',
                        category: 'power'
                    }, {
                        name: 'P2_24',
                        category: 'digital'
                    }, {
                        name: 'P2_25',
                        category: 'digital'
                    }, {
                        name: 'P2_26',
                        category: ''
                    }, {
                        name: 'P2_27',
                        category: 'digital'
                    }, {
                        name: 'P2_28',
                        category: 'digital'
                    }, {
                        name: 'P2_29',
                        category: 'digital'
                    }, {
                        name: 'P2_30',
                        category: 'digital'
                    }, {
                        name: 'P2_31',
                        category: 'digital'
                    }, {
                        name: 'P2_32',
                        category: 'digital'
                    }, {
                        name: 'P2_33',
                        category: 'digital'
                    }, {
                        name: 'P2_34',
                        category: 'digital'
                    }, {
                        name: 'P2_35',
                        category: 'digital'
                    }, {
                        name: 'P2_36',
                        category: 'analog'
                    },
                    // LEDs
                    {
                        name: 'USR0',
                        category: 'led'
                    }, {
                        name: 'USR1',
                        category: 'led'
                    }, {
                        name: 'USR2',
                        category: 'led'
                    }, {
                        name: 'USR3',
                        category: 'led'
                    }
                ];
                if (board == 'beaglebone') {
                    pins = BBpins
                    // initialize positions
                    for (var i = 0; i < 92; i++) {
                        var x, y;
                        // only compute base x/y on initial/even iterations
                        if ((i % 2) === 0) {
                            y = BBposY + 83.5 + 9.12 * ((i % 46) / 2);
                            x = BBposX + 5;
                            // P8
                            if (i >= 46) {
                                x += 177.5;
                            }
                        }
                        // offset x on odd iterations
                        else {
                            x += 9.5;
                        }
                        pins[i].x = x;
                        pins[i].y = y;
                        pins[i].w = 5;
                        pins[i].h = 5;
                        pins[i].s = 18;
                        pins[i].select = "off";
                    }
                    for (var i = 92; i < 96; i++) {
                        // var LEDpositions = [230.5, 241.75, 253, 264.25];
                        var LEDpositions = [151.5, 158.5, 165.5, 171.5];
                        pins[i].x = BBposX + LEDpositions[i - 92];
                        pins[i].y = BBposY + 18;
                        pins[i].w = 5;
                        pins[i].h = 10;
                        pins[i].s = 18;
                        pins[i].select = "off";
                    }
                } else if (board == 'pocketbeagle') {
                    pins = PBpins;
                    // initialize positions
                    for (var i = 0; i < 72; i++) {
                        var x, y;
                        // only compute base x/y on initial/even iterations
                        if ((i % 2) === 0) {
                            y = BBposY + 34.50 + 15.18 * ((i % 36) / 2);
                            x = BBposX + 16.95;
                            // P2
                            if (i >= 36) {
                                x += 147;
                            }
                        }
                        // offset x on odd iterations
                        else {
                            x += 15;
                        }
                        pins[i].x = x;
                        pins[i].y = y;
                        pins[i].w = 8;
                        pins[i].h = 8;
                        pins[i].s = 18;
                        pins[i].select = "off";
                    }
                    for (var i = 72; i < 76; i++) {
                        // var LEDpositions = [230.5, 241.75, 253, 264.25];
                        var LEDpositions = [58.5, 44.5, 30.5, 17];
                        pins[i].x = BBposX + 52.5;
                        pins[i].y = BBposY + LEDpositions[i - 72];
                        pins[i].w = 10;
                        pins[i].h = 5;
                        pins[i].s = 18;
                        pins[i].select = "off";
                    }
                } else if (board == 'baconbits') {
                    pins = PBpins;
                    pins.push({
                        name: 'thumbwheel',
                        category: 'thumbwheel'
                    })
                    pins.push({
                        name: 'rgbled',
                        category: 'rgbled'
                    })
                    // initialize positions
                    for (var i = 0; i < 72; i++) {
                        var x, y;
                        // only compute base x/y on initial/even iterations
                        if ((i % 2) === 0) {
                            y = BBposY + 51.50 + 13.72 * ((i % 36) / 2) - 0.03 * Math.pow(i % 36 / 2, 1.08);;
                            x = BBposX + 14.95;
                            // P2
                            if (i >= 36) {
                                x += 147.5;
                            }
                        }
                        // offset x on odd iterations
                        else {
                            x += 15;
                        }
                        pins[i].x = x;
                        pins[i].y = y;
                        pins[i].w = 8;
                        pins[i].h = 8;
                        pins[i].s = 18;
                        pins[i].select = "off";
                    }
                    for (var i = 72; i < 76; i++) {
                        // var LEDpositions = [230.5, 241.75, 253, 264.25];
                        var LEDpositions = [68.5, 54.5, 40.5, 27];
                        pins[i].x = BBposX + 52.5;
                        pins[i].y = BBposY + LEDpositions[i - 72];
                        pins[i].w = 10;
                        pins[i].h = 5;
                        pins[i].s = 18;
                        pins[i].select = "off";
                    }
                    //initialize position of ThumbWheel
                    pins[76].x = BBposX + 107.5;
                    pins[76].y = BBposY + 274;
                    pins[76].w = 50;
                    pins[76].h = 60;
                    pins[76].s = 18;
                    pins[76].select = "off";
                    //initialize position of RGB LED
                    pins[77].x = BBposX + 89.5;
                    pins[77].y = BBposY + 195;
                    pins[77].w = 30;
                    pins[77].h = 30;
                    pins[77].s = 18;
                    pins[77].select = "off";
                } else if (board == 'beaglegreen') {
                    pins = BBpins
                    // initialize positions
                    for (var i = 0; i < 92; i++) {
                        var x, y;
                        // only compute base x/y on initial/even iterations
                        if ((i % 2) === 0) {
                            y = BBposY + 85.5 + 9.02 * ((i % 46) / 2);
                            x = BBposX + 12.5;
                            // P8
                            if (i >= 46) {
                                x += 162.5;
                            }
                        }
                        // offset x on odd iterations
                        else {
                            x += 9.5;
                        }
                        pins[i].x = x;
                        pins[i].y = y;
                        pins[i].w = 5;
                        pins[i].h = 5;
                        pins[i].s = 18;
                        pins[i].select = "off";
                    }
                    for (var i = 92; i < 96; i++) {
                        // var LEDpositions = [230.5, 241.75, 253, 264.25];
                        var LEDpositions = [153.5, 160.5, 167.5, 174.5];
                        pins[i].x = BBposX + LEDpositions[i - 92];
                        pins[i].y = BBposY + 34;
                        pins[i].w = 5;
                        pins[i].h = 10;
                        pins[i].s = 18;
                        pins[i].select = "off";
                    }
                } else if (board == 'beagleblue') {
                    pins = [{
                            name: 'GREEN',
                            category: 'led'
                        }, {
                            name: 'RED',
                            category: 'led'
                        }, {
                            name: 'USR0',
                            category: 'led'
                        }, {
                            name: 'USR1',
                            category: 'led'
                        }, {
                            name: 'USR2',
                            category: 'led'
                        }, {
                            name: 'USR3',
                            category: 'led'
                        },
                        {
                            name: 'ch1',
                            category: 'servo'
                        }, {
                            name: 'ch2',
                            category: 'servo'
                        }, {
                            name: 'ch3',
                            category: 'servo'
                        }, {
                            name: 'ch4',
                            category: 'servo'
                        }, {
                            name: 'ch5',
                            category: 'servo'
                        }, {
                            name: 'ch6',
                            category: 'servo'
                        }, {
                            name: 'ch7',
                            category: 'servo'
                        }, {
                            name: 'ch8',
                            category: 'servo'
                        }, {
                            name: 'ch1',
                            category: 'motor'
                        }, {
                            name: 'ch2',
                            category: 'motor'
                        }, {
                            name: 'ch3',
                            category: 'motor'
                        }, {
                            name: 'ch4',
                            category: 'motor'
                        }
                    ];
                    //LED positions
                    for (var i = 0; i < 6; i++) {
                        // var LEDpositions = [230.5, 241.75, 253, 264.25];
                        var LEDpositions = [83.5, 90.5, 97.5, 104.5, 111.5, 118.5];
                        pins[i].x = BBposX + 22.5;
                        pins[i].y = BBposY + LEDpositions[i];
                        pins[i].w = 10;
                        pins[i].h = 5;
                        pins[i].s = 18;
                        pins[i].select = "off";
                    }
                    // Servo Positions
                    for (var i = 6; i < 14; i++) {
                        var Servopositions = [116.5, 125, 133.5, 142, 151.5, 160, 169.5, 178];
                        pins[i].x = BBposX + Servopositions[i - 6] - 14;
                        pins[i].y = BBposY + 257;
                        pins[i].w = 6;
                        pins[i].h = 24;
                        pins[i].s = 18;
                        pins[i].select = "off";
                    }
                    //Motor positions
                    for (var i = 14; i < 18; i++) {
                        var MotorpositionsX = [47.5, 47.5, 65.5, 65.5];
                        var MotorpositionsY = [303.5, 289.5, 289.5, 303.5];
                        pins[i].x = BBposX + MotorpositionsX[i - 14];
                        pins[i].y = BBposY + MotorpositionsY[i - 14];
                        pins[i].w = 16;
                        pins[i].h = 12;
                        pins[i].s = 18;
                        pins[i].select = "off";
                    }
                }
            }

            pin.highlight = function (button, digitalHighlight) {
                //the related pins for digital buttons is true by Default, except for hoverButton event.
                if (digitalHighlight == undefined) {
                    digitalHighlight = true;
                }
                if (button == "none") return;

                var category = button;
                var pwm = false;
                if (category == "input" && digitalHighlight == true) category = "digital";
                if (category == "output" && digitalHighlight == true) category = "digital";
                if (category == "miscbtn1") {
                    if (pin.board == 'baconbits')
                        category = "rgbled";
                    else if (pin.board == 'beagleblue')
                        category = "servo"
                }
                if (category == "miscbtn2") {
                    if (pin.board == 'baconbits')
                        category = "thumbwheel";
                    else if (pin.board == 'beagleblue')
                        category = "motor"
                }

                for (var i = 0; i < pins.length; i++) {
                    if (category == "pwm" && digitalHighlight == true) pwm = pins[i].PWM;
                    if (category == pins[i].category || pwm) {
                        var p = pins[i];
                        if (p.select !== "on") {
                            if (pin.board == 'beaglebone' || pin.board == 'pocketbeagle' || pin.board == 'beagleblue')
                                canvas.Active.ctx.fillStyle = 'RGBA(0,255,0,0.5)';
                            else
                                canvas.Active.ctx.fillStyle = 'RGBA(255,0,255,0.7)';
                            canvas.Active.ctx.fillRect(p.x, p.y, p.w, p.h);
                            canvas.Active.ctx.save();
                        }
                    }
                }
            };

            //change the pin color to light grey on hivering
            pin.hover = function (pin) {
                Canvas.get().Active.ctx.fillStyle = 'RGBA(255,255,255,.5)';
                Canvas.get().Active.ctx.fillRect(pin.x, pin.y, pin.w, pin.h);
            }
            //animate the pin when active
            pin.gradientLight = function (pin) {
                if (ui.pin.board == 'beagleblue') return;
                var x1 = pin.x + pin.w / 2; // x of 1. circle center point
                var y1 = pin.y + pin.h / 2; // y of 1. circle center point
                var r1 = 0.1; // radius of 1. circle
                var x2 = x1; // x of 2. circle center point
                var y2 = y1; // y of 2. circle center point
                var r2 = 10; // radius of 2. circle
                context = Canvas.get().LED0.ctx;
                if (!pin.state)
                    context.clearRect(pin.x - 0.1 * pin.w, pin.y - 0.6 * pin.h, pin.w * 1.2, pin.h * 1.8);
                else {
                    var radialGradient = context.createRadialGradient(x1, y1, r1, x2, y2, r2);
                    context.save();
                    context.translate(x1, y1);
                    context.scale(1, 2);
                    context.translate(-x1, -y1);
                    radialGradient.addColorStop(0, 'rgba(0,  225, 255, 1)');
                    radialGradient.addColorStop(.3, 'rgba(0,  125, 255, .7)');
                    radialGradient.addColorStop(.5, 'rgba(0,  0, 255, .5)');
                    radialGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
                    context.fillStyle = radialGradient;
                    context.fillRect(pin.x, pin.y, pin.w, pin.h);
                    context.restore();
                }
            };

            pin.rgbgradientLight = function (pin) {
                var red = pin.red * 255;
                var green = pin.green * 255;
                var blue = pin.blue * 255;
                var basecolor = 'rgba(' + red + ',' + green + ',' + blue + ',';
                var shade1 = basecolor + '1)';
                var shade2 = basecolor + '0.7)';
                var shade3 = basecolor + '0.5)';
                var shade4 = basecolor + '0)';
                var x1 = pin.x + pin.w / 2; // x of 1. circle center point
                var y1 = pin.y + pin.h / 2; // y of 1. circle center point
                var r1 = 0.1; // radius of 1. circle
                var x2 = x1; // x of 2. circle center point
                var y2 = y1; // y of 2. circle center point
                var r2 = 25; // radius of 2. circle
                context = Canvas.get().LED0.ctx;
                context.clearRect(x1 - pin.w, y1 - pin.h, 2 * pin.w, 2 * pin.h);
                var radialGradient = context.createRadialGradient(x1, y1, r1, x2, y2, r2);
                context.save();
                context.translate(x1, y1);
                context.scale(1, 2);
                context.translate(-x1, -y1);
                radialGradient.addColorStop(0, shade1);
                radialGradient.addColorStop(.3, shade2);
                radialGradient.addColorStop(.5, shade3);
                radialGradient.addColorStop(1, shade4);
                context.fillStyle = radialGradient;
                context.fillRect(pin.x, pin.y + pin.h / 4, pin.w, pin.h / 2);
                context.restore();
            };

            pin.test = function (event) {
                var coords = Position(event);
                var x = coords[0];
                var y = coords[1];

                for (var p in pins) {
                    if (x >= pins[p].x && x <= pins[p].x + pins[p].w && y >= pins[p].y &&
                        y <= pins[p].y + pins[p].h) {
                        //console.log("pin = " + pins[p].name);
                        return pins[p];
                    }
                }
                return ("none");
            };

            pin.getVoltage = function (pin) {
                if (pin.category == 'rgbled' || pin.category == 'servo' || pin.category == 'motor') return;
                if (!pin.getVoltage)
                    pin.getVoltage = setInterval(function () {
                        Hardware.read(pin, ongetVoltage)
                    }, 100 / 3);

                function ongetVoltage(x, value) {
                    if (typeof x == 'object' && typeof value == 'undefined')
                        value = x.value;
                    if (pin.category == 'analog' || pin.category == 'thumbwheel')
                        value *= 1.8;
                    else if (pin.subType == 'pwm')
                        value *= pin.state;
                    if (ui.xyAxis.playing) {
                        if (ui.xyAxis.properties.currTime < 3.3)
                            ui.xyAxis.properties.currTime += 0.03;
                        else {
                            ui.xyAxis.properties.currTime = 0;
                            ui.xyAxis.properties.interval += 300;
                            ui.xyAxis.draw();
                        }
                        if (ui.xyAxis.properties.currTime <= 0.3)
                            pin.prevPoint = [ui.xyAxis.properties.axisStartX, value];
                        ui.xyAxis.plot(ui.xyAxis.properties.currTime - 0.3, value, pin);
                    }
                }
            };

            pin.blink = function (pin) {
                pin.freq = typeof pin.freq == 'undefined' ? 0 : pin.freq;
                if (pin.category == 'led')
                    ui.pin.gradientLight(pin);
                if (pin.freq != 0 && pin.subType != 'pwm') {
                    clearInterval(pin.blinking);
                    pin.blinking = setInterval(function () {
                        HWwrite(pin);
                        if (pin.category == 'led')
                            ui.pin.gradientLight(pin);
                        pin.state = !(pin.state);
                    }, pin.freq);
                } else
                    HWwrite(pin);

                function HWwrite(pin) {
                    Hardware.write(pin, function (x) {
                        if (pin.power == "off") {
                            clearInterval(pin.blinking);
                            pin.state = 0;
                        }
                    })
                };
            };
            pin.rgb = function (pin) {
                pinRed = {
                    name: "P2_1",
                    category: "digital",
                    subType: "pwm",
                    freq: pin.red,
                    state: pin.state
                };
                pinGreen = {
                    name: "P1_33",
                    category: "digital",
                    subType: "pwm",
                    freq: pin.green,
                    state: pin.state
                };
                pinBlue = {
                    name: "P1_36",
                    category: "digital",
                    subType: "pwm",
                    freq: pin.blue,
                    state: pin.state
                }
                Hardware.write(pinRed, function (x) {
                    if (pin.power == "off") {
                        clearInterval(pin.blinking);
                        pin.state = 0;
                    }
                });
                Hardware.write(pinGreen, function (x) {
                    if (pin.power == "off") {
                        clearInterval(pin.blinking);
                        pin.state = 0;
                    }
                });
                Hardware.write(pinBlue, function (x) {
                    if (pin.power == "off") {
                        clearInterval(pin.blinking);
                        pin.state = 0;
                    }
                });
            };
            pin.initialize();
            return pin;
        })();



        // each inserted element is a 'probe'
        ui.probe = (function () {
            var probe = {};
            var probes = [];

            var add = {};
            add.type = 'none';

            probe.push = function (button) {
                probes.push(button);
            };

            probe.addStart = function (type) {
                add.type = type;
            };

            //add new probe not the button object
            probe.addTest = function (event) {
                if (add.type == 'none') return ('none');
                var coords = Position(event);
                var x = coords[0];
                var y = coords[1];
                if (x < rectInner.x || x > rectInner.x + rectInner.w ||
                    y < rectInner.y || y > rectInner.y + rectInner.h) {
                    return ('cancelled');
                }
                ui.button.push(add.type);
                return ('hoverPin');
            };

            //draw a button while dragging, and keep it highlighted.
            probe.dragButton = function (event) {
                ui.loop.clear();
                var coords = Position(event);
                var x = coords[0] - 50;
                var y = coords[1] - 7.5;
                ui.button.draw(add.type, canvas.Active.ctx, true, x, y);
                ui.pin.highlight(add.type);
            };

            //clears the duplicate button after dragging button to graph.
            probe.clearDrag = function (event) {
                var coords = Position(event);
                var x = coords[0] - 50;
                var y = coords[1] - 7.5;
                canvas.Active.ctx.clearRect(x - 1, y - 1, ui.button.get()[add.type].endX, ui.button.get()[add.type].endY);
                canvas.Active.ctx.save();
            };

            probe.selectText = function () {
                canvas.Active.ctx.fillStyle = 'red';
                canvas.Active.ctx.font = '12pt Andale Mono';
                canvas.Active.ctx.fillText("select " + ui.button.get()[add.type].article, BBposX + 10, BBposY - 25);
                canvas.Active.ctx.fillStyle = 'blue';
                canvas.Active.ctx.font = '8pt Andale Mono';
                if (ui.button.get()[add.type].warn != undefined)
                    canvas.Active.ctx.fillText(ui.button.get()[add.type].warn, BBposX + 240, BBposY - 75);
                canvas.Active.ctx.save();

                add.type = 'none';
            };

            probe.add = function (pin) {
                ui.graph.add(pin.name);
            };

            probe.test = function (event) {
                var coords = Position(event);
                var x = coords[0];
                var y = coords[1];
                var buttons = ui.button.get();

                for (var b in buttons) {
                    var minX = buttons[b].x;
                    var minY = buttons[b].y;
                    var maxX = buttons[b].endX;
                    var maxY = buttons[b].endY;
                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                        return buttons[b].name;
                    }
                }

                return ("none");
            };

            return probe;
        })();

        ui.loop = (function () {
            var loop = {};

            loop.clear = function () {
                canvas.Active.ctx.clearRect(0, 0, canvas.Active.e.width, canvas.Active.e.height);
            };

            //to remove probe if not connected to pin.
            loop.clearProbe = function () {
                var btn = ui.button.pop();
                canvas.Base.ctx.clearRect(btn.x - 1, btn.y - 1, btn.endX, btn.endY);
            };

            loop.clearBB = function () {
                canvas.Active.ctx.clearRect(283, 120, canvas.Active.e.width, canvas.Active.e.height);
            };

            loop.welcome = function (button) {
                var color = (button == 'exit') ? 'black' : 'white';
                var ctx = canvas.Active.ctx;
                var width = canvas.Active.e.width;
                var height = canvas.Active.e.height;
                ctx.fillStyle = 'rgba(255,255,255,0.25)';
                ctx.fillRect(0, 0, width - 10, height);
                ctx.fillStyle = 'rgba(0,102,204,0.85)';
                ctx.fillRect(width / 3.75, height / 4, width / 1.8, height / 2.85);
                ctx.fillStyle = color;
                ctx.font = '12pt Arial';
                ctx.fillText('X', width / 2 + 250, height / 4 + 25);
                ctx.fillStyle = 'white';
                ctx.font = '14pt Arial';
                ctx.fillText('Welcome to the beaglebone user interface!', width / 3.75 + 20, height / 4 + 30);
                ctx.font = '10pt Arial';
                ctx.fillText('This interface allows you to play with analog to digital converters,', width / 3.75 + 25, height / 4 + 55);
                ctx.fillText('digital pins (including inputs, outputs, and pwms), and the user leds', width / 3.75 + 25, height / 4 + 70);
                ctx.fillText('located at the top of the board. Hovering over the buttons indicates', width / 3.75 + 25, height / 4 + 85);
                ctx.fillText('which pins correspond to what type. Click and drag the button within', width / 3.75 + 25, height / 4 + 100);
                ctx.fillText('the white rectangle and select a pin. The input button requires both an', width / 3.75 + 25, height / 4 + 115);
                ctx.fillText('input and an output. The graph to the right will display the voltage', width / 3.75 + 25, height / 4 + 130);
                ctx.fillText('of the corresponding pin. Use the zoom in or zoom out to alter the graph,', width / 3.75 + 25, height / 4 + 145);
                ctx.fillText('stop to stop recording voltages, and play again to reset. Enjoy!', width / 3.75 + 25, height / 4 + 160);
            };

            loop.clear();
            loop.welcome('white');

            return loop;
        })();

        ui.base = (function () {
            var base = {};
            var beagleBone = new Image();
            beagleBone.src = base_url + '/static/images/beaglebone.png';
            beagleBone.onload = function () {
                canvas.Base.ctx.clearRect(BBposX, BBposY, beagleBone.width * 0.70, beagleBone.height * 0.70);
                canvas.Base.ctx.drawImage(beagleBone, BBposX, BBposY, beagleBone.width * 0.65, beagleBone.height * 0.65);
            };
            base.changeBoard = function (board) {
                beagleBone.src = base_url + '/static/images/' + board + '.png';
                beagleBone.onload();
            }
            return base;
        })();

        ui.graph = (function () {
            var graph = {};
            var bg = {
                x: 0,
                y: BBposY - 70,
                w: canvas.Base.e.width,
                h: 540
            };

            // draw gray background, buttons, and graph
            //drawGraph(canvas, uiElements);
            canvas.Base.ctx.fillStyle = 'rgb(225,225,225)';
            canvas.Base.ctx.fillRect(bg.x, bg.y, bg.w, bg.h);
            canvas.Base.ctx.strokeStyle = 'rgb(255,255,255)';
            canvas.Base.ctx.lineWidth = 3;
            canvas.Base.ctx.strokeRect(bg.x + 20, bg.y + 15, 250, 440);
            //drawButtons(canvas, uiElements);

            graph.add = function (pin) {
                Canvas.add(pin + ' Graph', 10);

            };

            return graph;
        })();

        // time & volt axis
        ui.xyAxis = (function () {
            var xyAxis = {};

            //all graph properties
            var graph = {
                xWidth: 360,
                yWidth: 297,
                zeroX: axisStartX,
                zeroY: axisStartY + 200,
                interval: 0,
                zoomVal: [1 / 3, 2 / 3, 1],
                currTime: 0,
                zoomIndex: 2,
                zoom: function () {
                    return this.zoomVal[this.zoomIndex];
                }
            }
            xyAxis.properties = graph;
            // time-x axis
            xyAxis.draw = function () {
                canvas.Graph.ctx.clearRect(graph.zeroX - 50, graph.zeroY - graph.yWidth - 50, graph.zeroX + graph.xWidth, graph.zeroY)
                canvas.Graph.ctx.beginPath();
                canvas.Graph.ctx.moveTo(graph.zeroX, graph.zeroY);
                canvas.Graph.ctx.lineTo(graph.zeroX + graph.xWidth, graph.zeroY);
                canvas.Graph.ctx.strokeStyle = "#354b60";
                canvas.Graph.ctx.lineWidth = 2;
                canvas.Graph.ctx.stroke();
                canvas.Graph.ctx.strokeStyle = "black";
                canvas.Graph.ctx.font = '10pt Lucinda Grande';
                canvas.Graph.ctx.fillText('Time [s]', axisStartX + 130, graph.zeroY + 50);
                canvas.Graph.ctx.save();

                // voltage-y axis
                canvas.Graph.ctx.beginPath();
                canvas.Graph.ctx.moveTo(graph.zeroX, graph.zeroY + 5);
                canvas.Graph.ctx.lineTo(graph.zeroX, graph.zeroY - graph.yWidth - 10);
                canvas.Graph.ctx.strokeStyle = "black";
                canvas.Graph.ctx.lineWidth = 2;
                canvas.Graph.ctx.stroke();
                canvas.Graph.ctx.save();

                canvas.Graph.ctx.strokeStyle = "black";
                canvas.Graph.ctx.font = '10pt Lucinda Grande';
                canvas.Graph.ctx.fillText('Voltage [v]', graph.zeroX - 30, graph.zeroY - graph.yWidth - 20);

                //x ticks
                var x = 0;
                var countX = 0;
                var xnum = 95;
                var time = 1;
                var prec = Math.ceil(Math.log(Math.abs(graph.interval) / 100 + 1.1) / Math.LN10) + 1;
                canvas.Graph.ctx.strokeStyle = "black";
                while (x <= graph.xWidth + graph.interval) {
                    if (graph.zeroX + x - graph.interval >= graph.zeroX) {
                        if (countX % 10 === 0) {
                            canvas.Graph.ctx.beginPath();
                            canvas.Graph.ctx.moveTo(graph.zeroX + x - graph.interval, graph.zeroY - 5);
                            canvas.Graph.ctx.lineTo(graph.zeroX + x - graph.interval, graph.zeroY + 10);
                            canvas.Graph.ctx.lineWidth = 2;
                            canvas.Graph.ctx.stroke();
                        } else {
                            canvas.Graph.ctx.beginPath();
                            canvas.Graph.ctx.moveTo(graph.zeroX + x - graph.interval, graph.zeroY - 5);
                            canvas.Graph.ctx.lineTo(graph.zeroX + x - graph.interval, graph.zeroY + 5);
                            canvas.Graph.ctx.lineWidth = 2;
                            canvas.Graph.ctx.stroke();
                        }
                    }
                    x += 10;
                    countX += 1;
                }
                canvas.Graph.ctx.fillStyle = "black";
                canvas.Graph.ctx.font = '8pt Lucinda Grande';
                while (xnum <= graph.xWidth + graph.interval) {
                    if (axisStartX + xnum - graph.interval >= graph.zeroX) {
                        canvas.Graph.ctx.fillText(time.toPrecision(prec).toString(),
                            axisStartX + xnum - graph.interval, graph.zeroY + 20);
                    }
                    xnum += 100;
                    time = (xnum + 3) / 100;

                }

                //y ticks
                var y = 0;
                var countY = 0;
                var ynum = 0;
                var volt = 3.3;
                var text;
                while (y <= graph.yWidth) {
                    if (countY % 3 === 0) {
                        canvas.Graph.ctx.beginPath();
                        canvas.Graph.ctx.moveTo(graph.zeroX - 10, graph.zeroY - y);
                        canvas.Graph.ctx.lineTo(graph.zeroX + 5, graph.zeroY - y);
                        canvas.Graph.ctx.lineWidth = 2;
                        canvas.Graph.ctx.stroke();
                    } else {
                        canvas.Graph.ctx.beginPath();
                        canvas.Graph.ctx.moveTo(graph.zeroX - 5, graph.zeroY - y);
                        canvas.Graph.ctx.lineTo(graph.zeroX + 5, graph.zeroY - y);
                        canvas.Graph.ctx.lineWidth = 2;
                        canvas.Graph.ctx.stroke();
                    }
                    if (countY > 53)
                        y += 9;
                    else
                        y += 3;
                    countY += 1;
                };
                canvas.Graph.ctx.fillStyle = "black";
                canvas.Graph.ctx.font = '8pt Lucinda Grande';
                while (ynum <= graph.yWidth && volt >= 0) {
                    text = (volt * graph.zoom()).toFixed(1).toString();
                    if (text == "0.0") {
                        canvas.Graph.ctx.fillText(text, graph.zeroX - 30, graph.zeroY - graph.yWidth + ynum + 5);
                    } else {
                        if (text == "1.8" || text == "3.3") {
                            canvas.Graph.ctx.fillStyle = "blue";
                            canvas.Graph.ctx.font = '10pt Lucinda Grande';
                        } else {
                            canvas.Graph.ctx.fillStyle = "black";
                            canvas.Graph.ctx.font = '8pt Lucinda Grande';
                        }
                        canvas.Graph.ctx.fillText(text, graph.zeroX - 30, graph.zeroY - graph.yWidth + ynum + 2);
                    }
                    ynum += 27;
                    volt -= 0.3;
                };
            }
            // plot the given point
            xyAxis.plot = function (xPoint, yPoint, pin) {
                var coord = scale(xPoint, yPoint);
                var x = graph.zeroX + coord[0];
                var y = graph.zeroY - coord[1];
                canvas.Graph.ctx.beginPath();
                canvas.Graph.ctx.moveTo(pin.prevPoint[0], pin.prevPoint[1]);
                canvas.Graph.ctx.lineTo(x, y);
                canvas.Graph.ctx.strokeStyle = pin.color;
                canvas.Graph.ctx.lineWidth = 2;
                canvas.Graph.ctx.stroke();
                pin.prevPoint = [x, y];
            };
            // scale the point to reflect zoom
            function scale(x, y) {
                var xPoint = x * 100;
                var yPoint = y * 90 / graph.zoom();
                var coord = [xPoint, yPoint];
                return coord;
            };
            xyAxis.draw();
            xyAxis.playing = true;
            return xyAxis;
        })();

        function Position(event) {
            var rect = canvas.Base.e.getBoundingClientRect();
            var coords = [];
            // find position of mouse
            if (event.x !== undefined && event.y !== undefined) {
                coords[0] = event.x;
                coords[1] = event.y;
            } else // Firefox method to get the position
            {
                coords[0] = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                coords[1] = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            //console.log("Position = " + [x, y]);
            //console.log("Offset = " + [rect.left, rect.top]);
            coords[0] -= rect.left;
            coords[1] -= rect.top;

            return (coords);
        };

        return ui;
    } // end of ui's init()


    return {
        get: function () {
            if (!ui) {
                ui = init();
            }
            return ui;
        }
    };
})();


/* Events draw in a bit of logic to enable/disable event listeners, so it is stateful.
 *
 * Use 'e.ui' to fetch UI objects
 * New events should be defined with a type and function in events variable
 * refer to state diagram for event sequence at http://jadonk.github.io/bone101/Support/bone101/UI/fsm/
 *
 */
var Events = (function () {
    var e;

    //to use any object method inside events
    function init() {
        e = {};
        e.ui = UI.get();
        e.listeners = {};
        e.start = function () {
            listen(true, 'clickExit');
            listen(true, 'hoverExit');
        };
        e.start();
        return e;
    }

    function listen(enable, description) {
        var events = {
            'clickExit': {
                event: 'click',
                func: clickExit
            },
            'hoverExit': {
                event: 'mousemove',
                func: hoverExit
            },
            'hoverAddProbe': {
                event: 'mousemove',
                func: hoverAddProbe
            },
            'hoverDigital': {
                event: 'mousemove',
                func: hoverDigital
            },
            'hoverButton': {
                event: 'mousemove',
                func: hoverButton
            },
            'hoverPin': {
                event: 'mousemove',
                func: hoverPin
            },
            'clickPin': {
                event: 'click',
                func: clickPin
            },
            'clickDown': {
                event: 'mousedown',
                func: clickDown
            },
            'clickDownDigital': {
                event: 'mousedown',
                func: clickDownDigital
            },
            'hoverSlider': {
                event: 'mousemove',
                func: hoverSlider
            },
            'release': {
                event: 'mouseup',
                func: release
            }
        };

        if (!(description in events)) {
            //console.log("Listener for " + description + " doesn't exist");
            return;
        }
        if ((description in e.listeners) && enable) {
            //console.log("Listener " + description + " already enabled, but requested to enable again");
            return;
        }
        if (!(description in e.listeners) && !enable) {
            //console.log("Listener " + description + " was not previously enabled, but requested to disable again");
            return;
        }
        //console.log((enable ? "Enabling listener " : "Disabling listener ") + description);

        if (enable) e.listeners[description] = true;
        else delete e.listeners[description];

        var ev = events[description].event;
        var func = events[description].func;
        if (enable) document.addEventListener(ev, func, false);
        else document.removeEventListener(ev, func, false);
    }

    function clickExit(event) {
        var button = e.ui.button.test(event);
        if (button == "exit") {
            e.ui.loop.clear();
            listen(false, 'clickExit');
            listen(false, 'hoverExit');
            listen(true, 'clickDown');
            listen(true, 'release');
            listen(true, 'hoverButton');
        }
    }

    function hoverExit(event) {
        var button = e.ui.button.test(event);
        //console.log("hoverExit: button = " + button);
        e.ui.loop.clear();
        e.ui.loop.welcome(button);
    }

    //on button hover, highlight button and coressponding pins.
    function hoverButton(event) {
        e.ui.loop.clear();
        //e.ui.pin.test(event);
        var button = e.ui.button.test(event);
        e.ui.button.highlight(button);
        e.ui.pin.highlight(button, false);
        switch (button) {
        case "digital":
            listen(true, 'hoverDigital');
            listen(true, 'clickDownDigital');
            break;
        default:
            break;
        }
    }

    function hoverDigital(event) {
        var button = e.ui.button.test(event);
        e.ui.button.highlightDigital(button);
        e.ui.pin.highlight(button);
        switch (button) {
        case "digital":
        case "input":
        case "output":
        case "pwm":
        case "digitalMenu":
            break;
        default:
            listen(false, 'hoverDigital');
            listen(false, 'clickDownDigital');
            break;
        }
    }

    // if clicked on global button, slider, graph, or probe-on/off button
    function clickDown(event) {
        var button = e.ui.button.test(event);
        if (button == "none" || button == "onOff") button = e.ui.onOff.test(event);
        if (button == "none") button = e.ui.bar.sliderTest(event);
        if (button == "none") button = e.ui.graph.test(event);
        miscbtn1 = e.ui.button.get().miscbtn1
        miscbtn2 = e.ui.button.get().miscbtn2
        switch (button) {
        case "analog":
        case "led":
        case "miscbtn1":
        case "miscbtn2":
            e.ui.probe.addStart(button);
            listen(true, 'hoverAddProbe');
            listen(false, 'hoverButton');
            listen(false, 'clickDownDigital');
            listen(false, 'clickDown');
            break;
        case "beaglebone":
            miscbtn1.disabled = true;
            miscbtn2.disabled = true;
            bbButton = e.ui.button.get().beaglebone
            if (bbButton.state == 'green') {
                e.ui.base.changeBoard('beaglegreen');
                e.ui.pin.initialize('beaglegreen');
                bbButton.state = 'black';
                bbButton.text = 'BB Black'
                bbButton.color = 'rgb(50,50,50)'
            } else if (bbButton.state == 'black') {
                e.ui.base.changeBoard('beaglebone');
                e.ui.pin.initialize('beaglebone');
                bbButton.state = 'green';
                bbButton.text = 'BB Green'
                bbButton.color = 'rgb(22,79,15)'
            }
            break;
        case "pocketbeagle":
            miscbtn1.disabled = true;
            miscbtn2.disabled = true;
            e.ui.base.changeBoard('pocketbeagle');
            e.ui.pin.initialize('pocketbeagle');
            break;
        case "baconbits":
            miscbtn1.text = 'RGB led';
            miscbtn1.article = 'rgb led';
            miscbtn1.s = 10;
            miscbtn2.text = 'Thumbwheel';
            miscbtn2.text = 'thumbwheel';
            miscbtn2.s = 6;
            miscbtn1.disabled = false;
            miscbtn2.disabled = false;
            e.ui.base.changeBoard('baconbits');
            e.ui.pin.initialize('baconbits');
            break;
        case "beagleblue":
            miscbtn1.text = 'Servo';
            miscbtn1.article = 'servo';
            miscbtn1.s = 17;
            miscbtn2.text = 'Motor';
            miscbtn2.article = 'Motor';
            miscbtn2.s = 20;
            miscbtn1.disabled = false;
            miscbtn2.disabled = false;
            e.ui.base.changeBoard('beagleblue');
            e.ui.pin.initialize('beagleblue');
            break;
        case "plus": //graph zoom in
            e.ui.button.highlightPlus(true);
            if (e.ui.xyAxis.properties.zoomIndex < 2)
                e.ui.xyAxis.properties.zoomIndex++;
            e.ui.xyAxis.draw();
            break;
        case "minus": //graph zoom out
            e.ui.button.highlightMinus(true);
            if (e.ui.xyAxis.properties.zoomIndex > 0)
                e.ui.xyAxis.properties.zoomIndex--;
            e.ui.xyAxis.draw();
            break;
        case "stop":
            e.ui.xyAxis.playing = false;
            e.ui.button.highlightStop(true);
            break;
        case "play":
            e.ui.xyAxis.playing = true;
            e.ui.button.highlightPlay(true);
            break;
        case "slider":
            //e.ui.state.down = "slider";
            listen(true, 'hoverSlider');
            break;
        case "onOff":
            break;
        default:
            break;
        }
    }

    function clickDownDigital(event) {
        var button = e.ui.button.test(event);
        switch (button) {
        case "input":
        case "output":
        case "pwm":
            e.ui.probe.addStart(button);
            listen(true, 'hoverAddProbe');
            listen(false, 'hoverButton');
            listen(false, 'clickDownDigital');
            listen(false, 'clickDown');
            break;
        default:
            break;
        }
        listen(false, 'hoverDigital');
    }

    //drawing a button instance while dragging it to the graph
    function hoverAddProbe(event) {
        e.ui.probe.dragButton(event);
    }

    function release(event) {
        var probeMode = e.ui.probe.addTest(event);
        var button = e.ui.button.test(event);
        if (probeMode == 'hoverPin') {
            e.ui.probe.clearDrag(event);
            listen(false, 'hoverAddProbe');
            listen(true, 'hoverPin');
            e.ui.probe.selectText();
            var probe = e.ui.probe.test(event);
            e.ui.pin.highlight(probe);
            listen(true, 'clickDown');
        } else if (probeMode == 'cancelled') {
            listen(false, 'hoverAddProbe');
            listen(true, 'hoverButton');
            listen(true, 'clickDown');
        }
        switch (button) {
        case 'plus':
            e.ui.button.highlightPlus();
            break;
        case 'minus':
            e.ui.button.highlightMinus();
            break;
        case 'play':
            e.ui.button.highlightPlay();
            break;
        case 'stop':
            e.ui.button.highlightStop();
            break;
        }
        //e.ui.bar.off();
        listen(false, 'hoverSlider');
    }

    function hoverPin(event) {
        e.ui.loop.clearBB();
        listen(true, 'clickPin');
        pin = e.ui.pin.test(event);
        var probes = Object.keys(e.ui.button.get());
        probeName = probes[probes.length - 22];
        probe = e.ui.button.get()[probeName];
        e.ui.pin.highlight(probe.name);
        probe.category = probe.name;
        if (probe.name == 'input' || probe.name == 'output') {
            probe.category = 'digital';
        }
        pwm = false;
        if (probe.name == "pwm") pwm = pin.PWM;
        if ((pin.category == probe.category || pwm) && pin.select == 'off') {
            probe.text = pin.name;
            e.ui.button.draw(probeName, Canvas.get().Active.ctx, false);
            e.ui.pin.hover(pin);
        } else {
            Canvas.get().Active.ctx.clearRect(probe.x, probe.y, probe.endX, probe.endY);
        }
    }

    function clickPin(event) {
        listen(false, 'hoverPin');
        listen(false, 'clickPin');
        var probes = Object.keys(e.ui.button.get());
        probeName = probes[probes.length - 22];
        probe = e.ui.button.get()[probeName];
        pin = e.ui.pin.test(event);
        //if pin isn't selected -> clear probe and activate menus
        if (pin.name === undefined) {
            if (probe.input !== "on") {
                e.ui.loop.clearProbe();
                listen(true, 'hoverButton');
            } else {
                listen(true, 'hoverPin');
                listen(true, 'clickPin');
            }
        }
        //check probe type and draw corresponding objects and wires.
        else {
            if (probe.name == "pwm") pwm = pin.PWM;
            if ((pin.category == probe.category || pwm) && pin.select == 'off') {
                e.ui.loop.clear();
                probe.text = pin.name;
                e.ui.button.draw(probeName, Canvas.get().BTN.ctx, false);
                e.ui.pin.hover(pin);
                pin.select = 'on';
                pin.power = 'on';
                pin.state = 1;
                e.ui.probe.add(pin);
                probe.pinNum = pin;
                pin.prevPoint = [e.ui.xyAxis.properties.zeroX + 100 * (e.ui.xyAxis.properties.currTime - 0.3), e.ui.xyAxis.properties.zeroY - 297];

                //LEDs
                if (probe.name === "led" && pin.select == 'on') {
                    pin.color = probe.graphColors[0];
                    probe.graphColors.splice(0, 1);
                    e.ui.wire.led(pin, probe);
                    e.ui.onOff.create(probe, pin);
                    //e.ui.button.off(probe);
                    e.ui.bar.create(probe, pin);
                    e.ui.bar.draw();
                    listen(true, 'hoverButton');
                }

                //Analog
                else if (probe.name === "analog" && pin.select == 'on') {
                    pin.color = probe.graphColors[0];
                    probe.graphColors.splice(0, 1);
                    e.ui.wire.analog(pin, probe);
                    e.ui.onOff.create(probe, pin);
                    pin.prevPoint = [e.ui.xyAxis.properties.zeroX + 100 * (e.ui.xyAxis.properties.currTime - 0.3), e.ui.xyAxis.properties.zeroY - 160];
                    //e.ui.button.off(probe);
                    listen(true, 'hoverButton');
                }

                //Digital
                else {
                    pin.subType = probe.name;
                    if (probe.name === "input") {
                        pin.color = probe.graphColors[0];
                        probe.graphColors.splice(0, 1);
                        e.ui.wire.digital(pin, probe);
                        e.ui.onOff.create(probe, pin);
                        //e.ui.button.off(probe);
                        e.ui.button.createOutput();
                        listen(true, 'hoverPin');
                        listen(true, 'clickPin');
                    } else if (probe.name === "output") {
                        pin.color = probe.graphColors[0];
                        probe.graphColors.splice(0, 1);
                        e.ui.wire.digital(pin, probe);
                        //output button for input probe.
                        if (probe.input === "on") {
                            listen(true, 'hoverButton');
                        }
                        //output probe.
                        else {
                            e.ui.onOff.create(probe, pin);
                            pin.input = "none";
                            e.ui.bar.create(probe, pin);
                            e.ui.bar.draw();
                            listen(true, 'hoverButton');
                        }
                    } else {
                        pin.color = probe.graphColors[0];
                        probe.graphColors.splice(0, 1);
                        e.ui.wire.digital(pin, probe);
                        e.ui.onOff.create(probe, pin);
                        //e.ui.button.off(probe);
                        e.ui.bar.create(probe, pin);
                        e.ui.bar.draw();
                        listen(true, 'hoverButton');
                    }
                }
                //draw wire line of current probe beside axis graph
                e.ui.wire.drawToGraph(pin);
                e.ui.pin.getVoltage(pin);
                Hardware.add(pin.name, pin.category, pin.subType)
            } else if (probe.name == "miscbtn1" && pin.select == "off") {
                e.ui.loop.clear();
                probe.text = pin.name;
                e.ui.button.draw(probeName, Canvas.get().BTN.ctx, false);
                e.ui.pin.hover(pin);
                pin.select = 'on';
                pin.power = 'on';
                pin.red = 0;
                pin.green = 0;
                pin.blue = 0;
                pin.state = 1;
                e.ui.probe.add(pin);
                probe.pinNum = pin;
                if (e.ui.pin.board == 'baconbits') {
                    pin.color = probe.graphColors[0];
                    probe.graphColors.splice(0, 1);
                    e.ui.wire.rgbled(pin, probe);
                    e.ui.onOff.create(probe, pin);
                    e.ui.bar.createRGBBar(probe, pin);
                    pin.prevPoint = [e.ui.xyAxis.properties.zeroX + 100 * (e.ui.xyAxis.properties.currTime - 0.3), e.ui.xyAxis.properties.zeroY - 160];
                    Hardware.add('P2_1', 'digital', 'pwm');
                    Hardware.add('P1_33', 'digital', 'pwm');
                    Hardware.add('P1_36', 'digital', 'pwm');
                    listen(true, 'hoverButton');
                } else if (e.ui.pin.board == 'beagleblue') {
                    pin.color = probe.graphColors[0];
                    probe.graphColors.splice(0, 1);
                    e.ui.wire.rgbled(pin, probe);
                    e.ui.onOff.create(probe, pin);
                    e.ui.bar.create(probe, pin);
                    e.ui.bar.draw();
                    Hardware.RCInit(pin);
                    listen(true, 'hoverButton');
                }
            } else if (probe.name == "miscbtn2" && pin.select == "off") {
                e.ui.loop.clear();
                probe.text = pin.name;
                e.ui.button.draw(probeName, Canvas.get().BTN.ctx, false);
                e.ui.pin.hover(pin);
                pin.select = 'on';
                pin.power = 'on';
                pin.state = 1;
                e.ui.probe.add(pin);
                probe.pinNum = pin;
                if (e.ui.pin.board == 'baconbits') {
                    pin.color = probe.graphColors[0];
                    probe.graphColors.splice(0, 1);
                    e.ui.wire.thumbwheel(pin, probe);
                    e.ui.onOff.create(probe, pin);
                    pin.prevPoint = [e.ui.xyAxis.properties.zeroX + 100 * (e.ui.xyAxis.properties.currTime - 0.3), e.ui.xyAxis.properties.zeroY - 160];
                    e.ui.wire.drawToGraph(pin);
                    e.ui.pin.getVoltage(pin);
                    Hardware.add('P1_1', 'analog')
                    listen(true, 'hoverButton');
                } else if (e.ui.pin.board == 'beagleblue') {
                    pin.color = probe.graphColors[0];
                    probe.graphColors.splice(0, 1);
                    e.ui.wire.rgbled(pin, probe);
                    e.ui.onOff.create(probe, pin);
                    e.ui.bar.create(probe, pin);
                    e.ui.bar.draw();
                    Hardware.RCInit(pin);
                    listen(true, 'hoverButton')
                }
            }
            //if user select a pin not related to the probe
            else {
                if (probe.input !== "on") {
                    e.ui.loop.clearProbe();
                    listen(true, 'hoverButton');
                } else {
                    listen(true, 'hoverPin');
                }
            }
        }
    }

    function hoverSlider(event) {
        e.ui.bar.move(event);
    }

    function zooming(event) {

    }

    function stop(event) {

    }

    function record(event) {

    }

    return {
        'get': function () {
            if (!e) {
                e = init();
            }
            return e;
        }
    };
})();

function bbui() {
    Events.get();
}