var slides = $('#slides').children();
document.onkeydown = onkd;

var timeout = setTimeout(slideNext, 60000);

function onkd(event) {
    var e = event.keyCode;
    
    switch(e) {
        case 37:
            slidePrev();
            break;
        case 39:
            slideNext();
            break;
        default:
            break;
    }
}

function testSlide() {
    var now = $('#slides').children(':visible');
    var duration = now.attr('duration');
    timeout = setTimeout(slideNext, duration*5000);
}

function slidePrev() {
    if(timeout) clearTimeout(timeout);
    var now = $('#slides').children(':visible');
    var last = $('#slides').children(':last');
    var prev = now.prev();
    prev = prev.index() == -1 ? last : prev;
    now.fadeOut(100, function() {
        prev.fadeIn(100, 'swing', testSlide);
    });
}

function slideNext() {
    if(timeout) clearTimeout(timeout);
    var now = $('#slides').children(':visible');
    var first = $('#slides').children(':first');
    var next = now.next();
    next = now.next();
    next = next.index() == -1 ? first : next;
    now.fadeOut(100, function() {
        next.fadeIn(100, 'swing', testSlide);
    });
}