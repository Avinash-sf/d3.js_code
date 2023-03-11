/*
 *  Copyright (c) Sunday, 30th June 2013 Avinash Vadlamudi (avinash.vadlamudi@gmail.com)
 */

function lineChart(a) {
    this.width = a.width;
    this.height = a.height;
    this.apiUrl = a.apiUrl;
    this.showkey = a.showkey;
    this.ele = a.ele;
    this.lines = [];
    return this;
};
lineChart.prototype = {
    init: function (year1, year2) {
        this.left = 20;
        this.right = 40;
        this.top = 10;
        this.bottom = 10;
        var lw = this.width + this.left + this.right;
        var lh = this.height + this.top + this.bottom;
        this.ele.style.width = lw + "px";
        this.ele.style.height = lh + "px";
        this.years = [];
        for (var i = year1; i <= year2; i++) this.years.push(i);
        var yearScale = d3.scale.linear()
            .domain([year1, year2])
            .range([0, this.width]);
        var yearAxis = d3.svg.axis()
            .scale(yearScale)
            .orient("top")
            .ticks(this.width / 70)
            .tickSize(10, 5, this.height)
            .tickSubdivide(4)
            .tickPadding(5)
            .tickFormat(function (d) {
                return d;
            });
        var ds1Scale = d3.scale.linear()
            .domain([0, 5000])
            .range([this.height, 0]);
        var ds1Axis = d3.svg.axis()
            .scale(ds1Scale)
            .orient("right")
            .ticks(this.height / 40)
            .tickSize(10, 3, 0)
            .tickSubdivide(4)
            .tickPadding(2)
            .tickFormat(function (d) {
                return d;
            });
        this.line = d3.svg.line()
            .interpolate("monotone")
            .x(function (d) {
                return yearScale(d.name);
            })
            .y(function (d) {
                return ds1Scale(d.ds1);
            });
        var svg = d3.select(this.ele)
            .append("svg").attr({
                "width": lw,
                "height": lh
            });
        var chart = svg.append("g")
            .attr({
                "class": "chart",
                "transform": "translate(" + this.left + "," + this.top + ")"
            });
        var series = chart
            .append("g")
            .attr("class", "series");
        this.labels = series
            .append("g")
            .attr({
                "class": "labels",
                "transform": "translate(50, 0)"
            });
        this.showKey();
        var year_axis = chart
            .append("g")
            .attr({
                "class": "yearAxis",
                "transform": "translate(0" + "," + this.height + ")"
            });
        var ds1_axis = chart
            .append("g")
            .attr({
                "class": "ds1Axis",
                "transform": "translate(" + this.width + "," + "0)"
            });
        year_axis.call(yearAxis) && ds1_axis.call(ds1Axis);
        return this.setUrl(this.apiUrl);
    },
    setUrl: function (url) {
        this.url = (url != null ? url : this.apiUrl);
        return this;
    },
    setTimeRange: function (year1, year2) {
        var now = new Date().getFullYear();
        if (year1 == null || year1 <= 1800) year1 = 1800;
        if (year2 == null || year2 >= now) year2 = now;
        this.year1 = year1 >= year2 ? 1800 : year1;
        this.year2 = year2 <= year1 ? now : year2;
        return this.init(this.year1, this.year2);
    },
    loadFilterLine: function (filter, color, id, url) {
        this.filter = "[" + (filter.length ? encodeURIComponent(JSON.stringify(filter[0])) : '') + "]";
        this.key = (filter.length ? filter[0].node_value : "All Records");
        this.color = color;
        this.id = id;
        this.removeLine(this.id) && this.lines.push(this.id);
        var query_list = {
            browse: this.filter,
            cmd: "stats-by-allyears",
            year: this.year1,
            year2: this.year2,
            filter: ""
        };
        var url = /*this.url*/ url; //allow cross domain XHR to the api server and comment out "this.url"
        url = serialize(url, query_list); //console.log(url);
        var that = this;
        overlay("#overlay", true);
        d3.json(url, function (err, data) {
            if (err) return err;
            overlay("#overlay", false, function () {
                var cache = data.results;
                that.years.forEach(function (val, i) {
                    cache[i] && cache[i].hasOwnProperty("name") && cache[i].name != val && cache.splice(i, 0, {
                        name: val,
                        ds1: 0
                    });
                });
                d3.select("g .series")
                .append("path")
                .attr({
                    "class": "lines " + that.id,
                    "d": that.line(cache),
                    "fill": "none"
                }).style({
                    "stroke": that.color
                });
                var pos = 15 * that.lines.length + that.top;
                var g = that.labels.append("g").attr({
                    "class": that.id,
                    "transform": "translate(0," + pos + ")"
                });
                g.append("circle").attr({
                    "cx": 5,
                    "r": 5,
                    "fill": that.color
                });
                g.append("text").attr({
                    "x": 15,
                    "fill": that.color
                }).text(that.key);
            });
        });
        return this;
    },
    loadTotalLine: function (color, url) {
        color = (color != null) ? color : "#000";
        return this.loadFilterLine([], color, "total", url);
    },
    removeLine: function (id) {
        !id.length && d3.selectAll(".series path.lines").remove() && d3.selectAll(".labels g").remove();

        var line = this.lines.indexOf(id);
        (line > -1) && this.lines.splice(line, 1) && !d3.selectAll("path." + id).empty() && d3.selectAll("path." + id).remove() && d3.selectAll("g." + id).remove();
        return this;
    },
    removeTotalLine: function () {
        return this.removeLine("total");;
    },
    removeAllLines: function () {
        return this.removeLine(this.lines = []);
    },
    showKey: function () {
        this.showkey ? this.labels.style("visibility", "visible") : this.labels.style("visibility", "hidden");
        return this;
    }
};