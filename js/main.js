/*
 *  Copyright (c) Sunday, 30th June 2013 Avinash Vadlamudi (avinash.vadlamudi@gmail.com)
 */

var color = d3.scale.category20();
var colorRange = color.range();

$(function () {
    var u = "http://data.cyberfloralouisiana.com/lsu/api/silvercollection.php";

    //lineChart
    var lE = document.getElementById("lineChart");
    var l = new lineChart({
        width: 550,
        height: 250,
        apiUrl: u,
        showkey: true,
        ele: lE
    }).setTimeRange(20, 20123);

    $("#line li, #loadgraph").hover(function () {
        $(this).stop().animate({
            "opacity": 1
        }, 300);
    }, function () {
        $(this).stop().animate({
            "opacity": .5
        }, 200);
    });

    var p = {
        node_type: "Phylum",
        node_value: "monocot"
    };

    $("#line #addLine").bind("click", function () {
        if ($(this).text() == "Add Total Line") {
            l.loadTotalLine("#fff", "data/line_tot.json");
            $(this).text("Add Filter Line");
        } else if ($(this).text() == "Update Filter Line") {
            var c = colorRange[(Math.random() * colorRange.length) >> 0];
            l.loadFilterLine([p], c, p.node_value, "data/line_filter.json");
        } else {
            l.loadFilterLine([p], "#990099", p.node_value, "data/line_filter.json");
            $(this).text("Update Filter Line");
        }
    });

    $("#line #removeLine").bind("click", function () {
        l.removeLine(p.node_value);
        d3.selectAll(".series path.lines").empty() ? $("#line #addLine").text("Add Total Line") : $("#line #addLine").text("Add Filter Line");
    });

    $("#line #removeTotalline").bind("click", function () {
        l.removeTotalLine() && d3.selectAll(".series path.lines").empty() && $("#line #addLine").text("Add Total Line");
    });

    $("#line #removeAllLines").bind("click", function () {
        l.removeAllLines() && $("#line #addLine").text("Add Total Line");
    });

    //circularBarChart
    var cE = document.getElementById("circularBarChart");
    var w = Number(lE.style.width.match(/\d+/) ? lE.style.width.match(/\d+/)[0] : 0);
    var c = new circularBarChart({
        width: window.innerWidth - w,
        height: window.innerHeight < 500 ? 500 : window.innerHeight,
        ele: cE,
        allowDrillDown: true
    }).setUrl(u);

    $("#loadgraph").bind("click", function () {
        $(this).animate({
            "opacity": 0
        }, 100, function () {
            $(this).remove();
            c.onClick("Country", {

            }, "data/circle_countries.json"); //test case, first off all upgrade server XHR configuration :'(
        });
    });
});