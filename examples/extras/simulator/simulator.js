$(document).ready(function() {
    $('.bonecard').css("cursor", "pointer");
    for (var i = 0; i < 46; i++) {
        var pin = '<div class="pin" id="P8_';
        pin += '' + (i + 1);
        pin += '" style="left:';
        pin += ((Math.floor(i / 2) * 25) + 200).toFixed(0);
        pin += 'px;top:';
        pin += '' + (((i % 2) * 25) + 5).toFixed(0);
        pin += 'px;"></div>';
        $('.bonecard').append(pin);
    }
    for (var i = 0; i < 46; i++) {
        var pin = '<div class="pin" id="P9_';
        pin += '' + (i + 1);
        pin += '" style="left:';
        pin += ((Math.floor(i / 2) * 25) + 200).toFixed(0);
        pin += 'px;top:';
        pin += (((i % 2) * 25) + 490).toFixed(0);
        pin += 'px;"></div>';
        $('.bonecard').append(pin);
    }
});