/*
 *  Copyright (c) Sunday, 30th June 2013 Avinash Vadlamudi (avinash.vadlamudi@gmail.com)
 */

function overlay(ele, t, cb) {
    t ? $(ele).css("display", "block") : (function () {
        $(ele).stop().animate({
           "opacity": 0
        }, 500, function () {
            $(this).css({
               "display": "none",
               "opacity": 0.8
              }) && cb && typeof cb === "function" && cb();
        });
    })();
}