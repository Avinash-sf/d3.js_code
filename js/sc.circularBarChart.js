/*
 *  Copyright (c) Sunday, 30th June 2013 Avinash Vadlamudi (avinash.vadlamudi@gmail.com)
 */

function circularBarChart(b) {
    this.width = b.width;
    this.height = b.height;
    this.ele = b.ele;
    this.allowDrillDown = b.allowDrillDown;
    this.history = [];
    this.future = [];
    return this;
};
circularBarChart.prototype = {
    init: function () {
        var w_2 = this.width >> 1;
        var h_2 = this.height >> 1;
        var r = 100;
        this.oR = r + 5;
        this.ele.style.width = this.width + "px";
        this.ele.style.height = this.height + "px";
        var that = this;
        this.tooltip = $("#tooltip");
        var svg = d3.select(this.ele)
            .append("svg")
            .attr({
                "width": this.width,
                "height": this.height
            });
        var circle = svg.append("g")
            .attr({
                "class": "circle",
                "transform": "translate(" + w_2 + "," + h_2 + ")"
            });
        circle.append("circle")
            .style({
                "stroke-width": .3,
                "stroke": "#555"
            })
            .attr({
                "transform": "translate(0,0)",
                "r": r,
                "fill": "none"
            });
        circle.append("text")
            .attr({
                "class": "text",
                "transform": "translate(0" + "," + -15 + ")"
            })
            .style({
                "text-anchor": "middle",
                "fill": "#fff"
            })
            .text("D3JS");
        circle.append("line")
            .style({
                "stroke": "#fff",
                "stroke-width": .05
            })
            .attr({
                "class": "center-line",
                "transform": "translate(0, 0)",
                "x1": -r + 5,
                "y1": 0,
                "x2": r - 5,
                "y2": 0
            });
        circle.append("text")
            .attr({
                "class": "dir prev",
                "transform": "translate(0" + "," + 15 + ")"
            })
            .style("text-anchor", "middle")
            .text("<<")
            .on("click", function () {
                var q = null;
                if (q = that.goBack()) {
                    var url = "data/circle_countries.json";
                    that.tooltip.html("No. of Previous Queries :  <b style='color:#f00;'>%</b>".replace(/\%/, that.history.length));
                    that.onClick(q.nodeApi, q.filter, url);
                }
            })
            .on("mousemove", function (d) {
                that.tooltip.css({
                    'display': 'block',
                    'left': d3.event.clientX - that.tooltip.width() / 2 + 'px',
                    'top': d3.event.clientY + 15 + 'px'
                }).html("No. of Previous Queries :  <b style='color:#f00;'>%</b>".replace(/\%/, that.history.length));
            })
            .on("mouseout", function (d) {
                that.tooltip.stop().animate({
                    "opacity": 0
                 }, 200, function () {
                    $(this).css({
                        'left': -100,
                        "top": -100,
                        'opacity': 1
                     });
                });
            });
        this.lines = svg.append("g")
            .attr("transform", "translate(" + w_2 + "," + h_2 + ")")
            .attr("class", "linesholder");
        return this;
    },
    setUrl: function (url) {
        this.url = (url != null ? url : "http://data.cyberfloralouisiana.com/lsu/api/silvercollection.php");
        return this.init();
    },
    loadGraph: function (nodeApi, filter, url) {
        this.nodeApi = nodeApi;
        this.filter = filter;
        var bar = [];
        var cache = [];
        var bars = [];
        var maxBarHeight = 50;
        var that = this;

        function angle(i, ln) {
            return Math.PI * ((i - 1) << 1) / ln - Math.PI / 2;
        }
        var query_list = {
            "cmd": "browse",
            "filter": encodeURIComponent(JSON.stringify(this.filter)),
            "nodeApi": this.nodeApi,
            "nodeValue": ""
        };
        var url = /*this.url*/ url; //allow cross domain XHR to the api server and comment out "this.url"
        url = serialize(url, query_list); //console.log(url)
        overlay("#overlay", true);
        d3.json(url, function (err, data) {
            if (err) return err;
            var bar_size = d3.scale.linear()
                .domain([0, 3000])
                .range([0, maxBarHeight]);
            cache = data.results;
            var ln = cache.length;
            for (var i = 0; i < ln; ++i) {
                bar = cache[i]
                bar.id = i;
                bars[i] = bar;
            }
            overlay("#overlay", false, function () {
                d3.selectAll("g.linesholder line.line").remove() && d3.select(".circle text.text").text(that.nodeApi);
                that.lines.selectAll("line.line")
                    .data(bars)
                    .enter()
                    .append("line")
                    .attr("class", function (d) {
                        return "line " + d.nodeValue;
                    })
                    .attr('x1', function (d) {
                        return that.oR * Math.cos(angle(d.id, ln));
                    })
                    .attr('y1', function (d) {
                        return that.oR * Math.sin(angle(d.id, ln));
                    })
                    .attr('x2', function (d) {
                        return (that.oR + bar_size(d.specimenCount)) * Math.cos(angle(d.id, ln));
                    })
                    .attr('y2', function (d) {
                        return (that.oR + bar_size(d.specimenCount)) * Math.sin(angle(d.id, ln));
                    })
                    .attr({
                        'stroke': "#693",
                        "stroke-width": 4,
                        "cursor": "pointer"
                    })
                    .on("click", function (d) {
                        that.history.push({
                                filter: that.filter,
                                nodeApi: that.nodeApi
                            }) && that.onClick(d.nodeApi, d.filter, "data/circle_region.json");
                    })
                    .on("mousemove", function (d) {
                        that.tooltip.css({
                            "left": d3.event.clientX - that.tooltip.width() / 2,
                            "top": d3.event.clientY + 5,
                            "opacity": 0
                        })
                        .stop().animate({
                            "opacity": 1,
                            'display': 'block',
                            'left': d3.event.clientX - that.tooltip.width() / 2,
                             'top': d3.event.clientY + 15
                        }, 100).text(d.nodeValue)
                    })
                    .on("mouseout", function (d) {
                        that.tooltip.stop().animate({
                            'left': d3.event.clientX - that.tooltip.width() / 2,
                            "top": d3.event.clientY + 5,
                            "opacity": 0
                        }, 100, function () {
                            $(this).css({
                                'left': -100,
                                "top": -100,
                                'opacity': 1
                             });
                        });
                    });
            });
        });
        return this;
    },
    goBack: function () {
        if (this.history.length) {
            this.future.push(this.history.pop());
            return this.future[this.future.length - 1];
        }
        return false;
    },
    onClick: function (nodeApi, filter, url) {
        return this.loadGraph(nodeApi, filter, url);
    }
};