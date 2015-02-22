/* 
 * Canvas provides the drawing surfaces.
 *
 * Use 'var canvas = Canvas.get();' to fetch the canvas.
 * canvas is an object keyed by the layer names.
 * canvas[layer].e is the layer element.
 * canvas[layer].ctx is the layer context.
 */
var Canvas = (function() {
    var canvas;

    function init() {
        canvas = {};
        
        var layers = { 
            'Base':     'layer1',   // canvas with bb and other unchanging elements
            'BTN':      'layer2',   // canvas that draws buttons and corresponding elements
            'Active':   'layer3',   // active canvas, constantly being cleared and redrawn by UI
            'LED0':     'layer4',   // separate canvases for LEDs so they can redraw at different rates
            'LED1':     'layer5',
            'LED2':     'layer6',
            'LED3':     'layer7',
            'Bar':      'layer8',   // canvas for slider bars
            'Graph':    'layer9'    // canvas for base drawings of graph (axis, labels, etc)
        };
        
        for(var layer in layers) {
            canvas[layer] = {};
            canvas[layer].e = document.getElementById(layers[layer]);
            canvas[layer].ctx = canvas[layer].e.getContext("2d");
        }
        
        return(canvas);
    }

    return {
        'get': function () {
            if (!canvas) {
                canvas = init();
            }
            return canvas;
        }
    };
})();

/* 
 * UI provides the user interface drawing and interaction logic.
 * The events are registered, removed and transitioned by Events to help
 * make it clear what events are currently registered and active.
 *
 * Use 'var ui = UI.get();' to fetch the user interface object.
 */
var UI = (function() {
    var ui;

    function init() {
        ui = {};
        var canvas = Canvas.get();

        // initialize global positions of some elements, all other elements based on these 
        // positions
        var BBposX = 460;
        var BBposY = 60;
        var axisStartY = BBposY + 40;
        var axisStartX = BBposX + 375;
        var bg = {
            x: 0,
            y: BBposY - 20,
            w: canvas.Base.e.width,
            h: 540
        };
        
        // major buttons
        ui.button = (function() {
            var button = {};
            
            // global buttons
            var btnX = BBposX - 425;
            var btnY = BBposY - 40;
    
            var buttons = {
                analog: {
                    x: btnX,
                    y: btnY,
                    endX: btnX + 75,
                    endY: btnY + 15,
                    color: 'rgb(51,153,255)',
                    text: "analog",
                    s: 13,
                    offColor: 'rgb(0,51,102)',
                    article: "an analog pin",
                    graphColors: ['rgb(0,0,255)', 'rgb(0,01,53)', 'rgb(0,102,204)', 'rgb(0,51,102)']
                },
                digital: {
                    x: btnX + 78,
                    y: btnY,
                    endX: btnX + 153,
                    endY: btnY + 15,
                    color: 'rgb(102,204,51)',
                    text: "digital",
                    s: 10 
                },
                ground: {
                    x: btnX + 156,
                    y: btnY,
                    endX: btnX + 231,
                    endY: btnY + 15,
                    color: 'rgb(64,64,64)',
                    text: "ground",
                    s: 12
                },
                power: {
                    x: btnX + 234,
                    y: btnY,
                    endX: btnX + 309,
                    endY: btnY + 15,
                    color: 'rgb(255,51,51)',
                    text: "power",
                    s: 17
                },
                led: {
                    x: btnX + 312,
                    y: btnY,
                    endX: btnX + 387,
                    endY: btnY + 15,
                    color: 'rgb(255,153,51)',
                    text: "usr leds",
                    s: 7,
                    offColor: 'rgb(102,0,0)',
                    barColor: 'rgb(255,204,153)',
                    article: "a user led",
                    graphColors: ['rgb(255,128,0)', 'rgb(164,60,0)', 'rgb(255,99,71)', 'rgb(255,69,0)']
                },
                input: {
                    x: btnX + 78,
                    y: btnY + 20,
                    endX: btnX + 153,
                    endY: btnY + 35,
                    color: 'rgb(0,153,0)',
                    text: "input",
                    s: 17,
                    offColor: 'rgb(0,81,36)',
                    article: "a digital pin",
                    graphColors: ['rgb(0,51,0)', 'rgb(0,204,0)', 'rgb(51,102,0)', 'rgb(0,255,0)', 'rgb(128,255,0)']
                },
                output: {
                    x: btnX + 78,
                    y: btnY + 40,
                    endX: btnX + 153,
                    endY: btnY + 55,
                    color: 'rgb(0,153,153)',
                    text: "output",
                    s: 13,
                    offColor: 'rgb(0,85,85)',
                    barColor: 'rgb(153,255,255)',
                    article: "a digital pin",
                    graphColors: ['rgb(60,179,113)', 'rgb(0,153,153)', 'rgb(0,255,255)', 'rgb(0,102,102)']
                },
                pwm: {
                    x: btnX + 78,
                    y: btnY + 60,
                    endX: btnX + 153,
                    endY: btnY + 75,
                    color: 'rgb(153,0,153)',
                    text: "pwm",
                    s: 25,
                    offColor: 'rgb(51,0,102)',
                    barColor: 'rgb(229,204,255)',
                    article: "a pwm pin",
                    graphColors: ['rgb(102,0,102)', 'rgb(204,0,204)', 'rgb(255,102,255)', 'rgb(51,0,51)']
                },
                plus: {
                    x: axisStartX + 10,
                    y: axisStartY + 451,
                    endX: axisStartX + 25,
                    endY: axisStartY + 451
                },
                minus: {
                    x: axisStartX - 10,
                    y: axisStartY + 453,
                    endX: axisStartX + 5,
                    endY: axisStartY + 451
                },
                stop: {
                    x: axisStartX - 29,
                    y: axisStartY + 437,
                    endX: axisStartX - 17,
                    endY: axisStartY + 451
                },
                play: {
                    x: axisStartX - 48,
                    y: axisStartY + 436,
                    endX: axisStartX - 34,
                    endY: axisStartY + 451
                },
                exit: {
                    x: canvas.Base.e.width * 6 / 8 - 20,
                    y: canvas.Base.e.height / 4 - 20,
                    endX: canvas.Base.e.width * 6 / 8,
                    endY: canvas.Base.e.height / 4
                }
            };
            
            button.test = function(event) {
                var coord = Position(event);
                var x = coord[0];
                var y = coord[1];
                for(var button in buttons) {
                    var minX = buttons[button].x;
                    var minY = buttons[button].y;
                    var maxX = buttons[button].endX;
                    var maxY = buttons[button].endY;
                    if(x >= minX && x <= maxX && y >= minY && y <= maxY) {
                        return(button);
                    }
                }
                return("none");
            };
            
            button.highlight = function(highlightButton) {
                canvas.Active.ctx.fillStyle = 'rgba(255,255,255,0.7)';
                for (var b in ["analog", "digital", "ground", "power", "led"]) {
                    var btn = buttons[b];
                    roundRect(btn, 75, 15, 1, canvas.Active.ctx, (highlightButton == b));
                }
            };
    
            button.highlightDigital = function(highlightButton) {
                canvas.Active.ctx.fillStyle = 'rgba(255,255,255,0.7)';
                for (var b in ["input", "output", "pwm"]) {
                    var btn = buttons[b];
                    roundRect(btn, 75, 15, 1, canvas.Active.ctx, (highlightButton == b));
                }
            };
            
            button.highlightPlus = function() {
                canvas.Graph.ctx.fillStyle = "#FF4500";
                canvas.Graph.ctx.font = '20pt Lucinda Grande';
                canvas.Graph.ctx.fillText("+", buttons.plus.x, buttons.plus.y);
            };

            button.highlightMinus = function() {
                canvas.Graph.ctx.fillStyle = "#FF4500";
                canvas.Graph.ctx.font = '30pt Lucinda Grande';
                canvas.Graph.ctx.fillText("-", buttons.minus.x, buttons.minus.y);
            };
            
            button.highlightStop = function() {
                canvas.Graph.ctx.fillStyle = "#FF4500";
                canvas.Graph.ctx.beginPath();
                canvas.Graph.ctx.moveTo(buttons.stop.x, buttons.stop.y);
                canvas.Graph.ctx.lineTo(buttons.stop.x + 12, buttons.stop.y);
                canvas.Graph.ctx.lineTo(buttons.stop.x + 12, buttons.stop.y + 12);
                canvas.Graph.ctx.lineTo(buttons.stop.x, buttons.stop.y + 12);
                canvas.Graph.ctx.fill();
            };
            
            button.highlightStop = function() {
                canvas.Graph.ctx.fillStyle = "#FF4500";
                canvas.Graph.ctx.beginPath();
                canvas.Graph.ctx.moveTo(buttons.play.x, buttons.play.y);
                canvas.Graph.ctx.lineTo(buttons.play.x + 10, buttons.play.y + 7);
                canvas.Graph.ctx.lineTo(buttons.play.x, buttons.play.y + 14);
                canvas.Graph.ctx.fill();
            };
            
            return button;
        })();

        // each inserted element is a 'probe'
        ui.probe = (function() {
            var probe = {};
            probe.n = [];
            
            var add = {};
            add.status = 'unactive';
            add.type = 'none';
            
            var width = 100;
            var height = 15;
    
            probe.addTest = function(event) {
                // if new pin selected and now connected to led
                if (add.status === 'active') {
                    add.status = 'unactive';
                }
            };
    
            probe.addStart = function(type) {
                add.status = "active";
                add.type = type;
            };
                    
            return probe;
        })();
    
        ui.ActiveClear = function() {
            canvas.Active.ctx.clearRect(0, 0, canvas.Active.e.width, canvas.Active.e.height);
        };
    
        ui.highlightPins = function(button) {
            if (button == "none") return;
            for (var i = 0; i < 96; i++) {
            }
        };
    
        ui.welcomeMessage = function(button) {
            var color = (button=='exit') ? 'black' : 'white';
            var ctx = canvas.Active.ctx;
            var width = canvas.Active.e.width;
            var height = canvas.Active.e.height;
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(0,102,204,0.85)';
            ctx.fillRect(width / 4, height / 4, width / 2, height / 2);
            ctx.fillStyle = color;
            ctx.font = '12pt Andale Mono';
            ctx.fillText('X', width * 6 / 8 - 20, height / 4 + 20);
            ctx.fillStyle = 'white';
            ctx.font = '13pt Andale Mono';
            ctx.fillText('Welcome to the beaglebone user interface!', width / 4 + 20, height / 4 + 25);
            ctx.font = '10pt Andale Mono';
            ctx.fillText('This interface allows you to play with analog to digital converters,', width / 4 + 25, height / 4 + 55);
            ctx.fillText('digital pins (including inputs, outputs, and pwms), and the user leds', width / 4 + 25, height / 4 + 70);
            ctx.fillText('located at the top of the board. Hovering over the buttons indicates', width / 4 + 25, height / 4 + 85);
            ctx.fillText('which pins correspond to what type. Click and drag the button within', width / 4 + 25, height / 4 + 100);
            ctx.fillText('the white rectangle and select a pin. The input button requires both an', width / 4 + 25, height / 4 + 115);
            ctx.fillText('input and an output. The graph to the right will display the voltage', width / 4 + 25, height / 4 + 130);
            ctx.fillText('of the corresponding pin. Use the zoom in or zoom out to alter the graph,', width / 4 + 25, height / 4 + 145);
            ctx.fillText('stop to stop recording voltages, and play again to reset. Enjoy!', width / 4 + 25, height / 4 + 160);
        };
        
        // draw beaglebone
        var beagleBone = new Image();
        beagleBone.src = 'beaglebone.png';
        beagleBone.onload = function() {
            canvas.Base.ctx.drawImage(beagleBone, BBposX, BBposY);
        };

        // draw gray background, buttons, and graph
        //drawGraph(canvas, uiElements);
        canvas.Base.ctx.fillStyle = 'rgb(225,225,225)';
        canvas.Base.ctx.fillRect(bg.x, bg.y, bg.w, bg.h);
        canvas.Base.ctx.strokeStyle = 'rgb(255,255,255)';
        canvas.Base.ctx.lineWidth = 3;
        canvas.Base.ctx.strokeRect(bg.x + 20, bg.y + 15, 420, 510);
        //drawButtons(canvas, uiElements);
        ui.welcomeMessage('white');
        
        return ui;
    } // end of ui's init()

    // find position of mouse
    function Position(event) {
        var canvas = Canvas.get();
        var x;
        var y;
    
        if (event.x !== undefined && event.y !== undefined) {
            x = event.x;
            y = event.y;
        }
        else // Firefox method to get the position
        {
            x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
    
        x -= canvas.Base.e.offsetLeft;
        y -= canvas.Base.e.offsetTop;
        var coord = [x, y];
        return coord;
    }
    
    function hover(canvas, x, y, w, h) {
        canvas.Active.ctx.fillStyle = 'RGBA(255,255,255,0.5)';
        canvas.Active.ctx.fillRect(x, y, w, h);
    }
    
    function roundRect(btn, w, h, radius, context, stroke) {
        var x = btn.x;
        var y = btn.y;
        var color = btn.color;
        var text = btn.text;
        var s = btn.s;
        var r = x + w;
        var b = y + h;
        context.beginPath();
        context.lineWidth = "1";
        context.moveTo(x + radius, y);
        context.lineTo(r - radius, y);
        context.quadraticCurveTo(r, y, r, y + radius);
        context.lineTo(r, y + h - radius);
        context.quadraticCurveTo(r, b, r - radius, b);
        context.lineTo(x + radius, b);
        context.quadraticCurveTo(x, b, x, b - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        if (stroke === true) {
            context.strokeStyle = color;
            context.stroke();
            context.fillStyle = 'white';
            context.fill();
            context.fillStyle = color;
        }
        else {
            context.strokeStyle = color;
            context.stroke();
            context.fillStyle = color;
            context.fill();
            context.fillStyle = 'white';
        }
        context.font = '10pt Andale Mono';
        context.fillText(text, x + s, y + 12);
    }

    return {
        get: function () {
            if (!ui) {
                ui = init();
            }
            return ui;
        }
    };
})();

var Hardware = (function() {
    var hw;

    function init() {
        return hw;
    }

    return {
        get: function () {
            if (!hw) {
                hw = init();
            }
            return hw;
        }
    };
})();

var Events = (function() {
    var e;

    function init() {
        e = {};
        e.ui = UI.get();
        e.hw = Hardware.get();
        e.listeners = {};
        e.start = function() {
            listen(true, 'exit');
            listen(true, 'exitHover');
        };
        return e;
    }

    function listen(enable, description) {
        var events = {
            'exit': { event: 'click', func: exit },
            'exitHover': { event: 'mousemove', func: exitHover },
            'activateBtn': { event: 'mousemove', func: activateBtn },
            'digitalMenu': { event: 'mousemove', func: digitalMenu },
            'btnInfo': { event: 'mousemove', func: btnInfo },
            'selectPin': { event: 'mousemove', func: selectPin },
            'clicked': { event: 'click', func: clicked },
            'clickDown': { event: 'mousedown', func: clickDown },
            'clickDownDigital': { event: 'mousedown', func: clickDownDigital },
            'slideBar': { event: 'mousemove', func: slideBar },
            'zooming': { event: 'mouseup', func: zooming },
            'stop': { event: 'mouseup', func: stop },
            'record': { event: 'mouseup', func: record },
            'pinSelected': { event: 'click', func: pinSelected },
            'release': { event: 'mouseup', func: release }
        };
        console.log((enable?"Enabling listener ":"Disabling listener ")+description);
        
        if(!(description in events)) {
            console.log("Listener for " + description + " doesn't exist");
            return;
        }
        if((description in e.listeners) && enable) {
            console.log("Listener " + description + " already enabled");
            return;
        }
        if(!(description in e.listeners) && !enable) {
            console.log("Listener " + description + " was not previously enabled");
            return;
        }
        if(enable) e.listeners[description] = true;
        else delete e.listeners[description];
        
        var ev = events[description].event;
        var func = events[description].func;
        if(enable) document.addEventListener(ev, func, false);
        else document.removeEventListener(ev, func, false);
    }

    function exit(event) {
        var button = e.ui.button.test(event);
        if(button == "exit") {
            e.ui.ActiveClear();
            listen(false, 'exit');
            listen(false, 'exitHover');
            listen(true, 'clickDown');
            listen(true, 'release');
            listen(true, 'clicked');
            listen(true, 'btnInfo');
        }
    }
    
    function exitHover(event) {
        var button = e.ui.button.test(event);
        e.ui.ActiveClear();
        e.ui.welcomeMessage(button);
    }
    
    function btnInfo(event) {
        e.ui.ActiveClear();
        var button = e.ui.button.test(event);
        e.ui.pins.highlight(button);
        e.ui.button.highlight(button);
        switch(button) {
            case "digital":
                listen(true, 'digitalMenu');
                break;
            default:
                break;
        }
    }
    
    function digitalMenu(event) {
        var button = e.ui.button.test(event);
        e.ui.button.highlightDigital(button);
        switch(button) {
            case "digital":
            case "input":
            case "output":
            case "pwm":
                listen(true, 'clickDownDigital');
                break;
            default:
                listen(false, 'digitalMenu');
                listen(false, 'clickDownDigital');
                break;
        }    
    }
    
    // if click on/off button or pin while active
    function clicked(event) {
        e.ui.probe.addTest(event);
        e.ui.probe.onOffTest(event);
    }

    // if clicked on global button, slider, or graph button    
    function clickDown(event) {
        var button = e.ui.button.test(event);
        if(button == "none") button = e.ui.probe.sliderTest(event);
        if(button == "none") button = e.ui.graph.test(event);
        switch(button) {
            case "analog":
            case "led":
                e.ui.probe.addStart(button);
                listen(true, 'activateBtn');
                break;
            case "plus":
                listen(true, 'zooming');
                e.ui.graph.zoomChange("in");
                e.ui.button.highlightPlus();
                break;
            case "minus":
                listen(true, 'zooming');
                e.ui.graph.zoomChange("out");
                e.ui.button.highlightMinus();
                break;
            case "stop":
                listen(true, 'stop');
                e.ui.button.highlightStop();
                break;
            case "play":
                listen(true, 'record');
                e.ui.button.highlightPlay();
                break;
            case "slider":
                listen(true, 'slideBar');
                break;
            default:
                break;
        }
    }
    
    function clickDownDigital(event) {
        var button = e.ui.button.test(event);
        switch(button) {
            case "input":
            case "output":
            case "pwm":
                e.ui.probe.addStart(button);
                listen(true, 'activateBtn');
                break;
            default:
                break;
        }
        listen(false, 'digitalMenu');
    }
    
    function activateBtn(event) {
        listen(false, 'btnInfo');
        listen(false, 'clickDownDigital');
        listen(false, 'clickDown');
    }
    
    function slideBar(event) {
        
    }
    
    function zooming(event) {
        
    }
    
    function stop(event) {
        
    }
    
    function record(event) {
        
    }
    
    function selectPin(event) {
        
    }
    
    function pinSelected(event) {
        
    }
    
    function release(event) {
        
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
    var e = Events.get();
    e.start();
}