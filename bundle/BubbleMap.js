'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('d3');

require('../lib/d3.geo.tile.v0.min');

require('../lib/d3.geo.zoom');

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _Bubble = require('./Bubble');

var _Bubble2 = _interopRequireDefault(_Bubble);

require('../styles/BubbleMap.less');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

window.$ = _jquery2.default;
window.jQuery = _jquery2.default;

var BubbleMap = function () {
    function BubbleMap(elementId, token, width, height) {
        var _this = this;

        var withGravity = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

        _classCallCheck(this, BubbleMap);

        this.width = 938;
        this.height = 450;
        this.container = (0, _jquery2.default)("#" + elementId);
        this.containerId = elementId;
        this.gravityActive = withGravity;
        this.token = token;
        this.countryList = new Array();
        this.m_width = width || this.container.width();
        this.m_height = height || (0, _jquery2.default)(window).height();

        if (width) {
            this.container.width(this.m_width);
        }

        (0, _jquery2.default)(window).resize(function () {
            if (_this.svg) {
                _this.svg.attr("width", _this.container.width());
                _this.svg.attr("height", _this.m_height);
            }
        });

        this.initializeMap();
    }

    _createClass(BubbleMap, [{
        key: 'initializeMap',
        value: function initializeMap() {

            this.projection = d3.geo.mercator();
            this.path = d3.geo.path();
            this.tile = d3.geo.tile();
            this.svg = d3.select("#" + this.containerId).append("svg");

            this.projection.scale(150).translate([this.width / 2, this.height / 1.45]);

            this.path.projection(this.projection);

            this.tile.scale(this.projection.scale() * 2 * Math.PI).translate(this.projection([0, 0])).zoomDelta((window.devicePixelRatio || 1) + 2.5);

            this.svg.attr("preserveAspectRatio", "xMidYMin").attr("viewBox", "0 0 " + this.width + " " + this.height).attr("width", this.m_width).attr("height", this.m_height);

            this.svg.append("rect").attr("id", "rect-background").attr("class", "background").attr("width", "100%").attr("height", "100%");

            this.g = this.svg.append("g");

            this.loadWorld();
        }
    }, {
        key: 'loadWorld',
        value: function loadWorld() {
            var _this2 = this;

            var worldDataFile = "./json/countries.iso.json";

            d3.json(worldDataFile, function (error, data) {
                if (error) {
                    throw new Error('Error loading json file: ' + error);
                } else {
                    _this2.printWorld(data);
                    _this2.gravity();
                    _this2.renderLogo();
                }
            });
        }
    }, {
        key: 'printWorld',
        value: function printWorld(data) {
            var _this3 = this;

            var tilesUrl = "http://a.tiles.mapbox.com/v4/mapbox.streets/",
                tiles = this.tile();

            this.topodata = topojson.feature(data, data.objects.countries).features;

            this.g.append("g").attr("id", "image-list").attr("clip-path", "url(#clip)").selectAll("image").data(tiles).enter().append("image").attr("xlink:href", function (d) {
                return tilesUrl + d[2] + "/" + d[0] + "/" + d[1] + ".png?access_token=" + _this3.token;
            }).attr("width", tiles.scale + 1).attr("height", tiles.scale + 1).attr("x", function (d) {
                return (d[0] + tiles.translate[0]) * tiles.scale;
            }).attr("y", function (d) {
                return (d[1] + tiles.translate[1]) * tiles.scale;
            });

            this.g.append("clipPath").attr("id", "clip").append("use").attr("xlink:href", "#rect-background");

            this.g.append("g").attr("id", "countries").selectAll("path").data(this.topodata).enter().append("path").attr("id", function (d) {
                return d.id;
            }).attr("d", this.path);
        }
    }, {
        key: 'gravity',
        value: function gravity() {
            var _this4 = this;

            this.force = d3.layout.force().gravity(0).charge(0).nodes([]).size([this.m_width / 2, this.m_height / 2]);

            this.force.on("tick", function (e) {

                var q = d3.geom.quadtree(_this4.countryList),
                    i = 0,
                    n = _this4.countryList.length;

                while (++i < n) {
                    q.visit(collide(_this4.countryList[i]));
                }

                _this4.svg.selectAll("circle").attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")";
                });

                _this4.svg.selectAll(".text-name").attr("dx", function (d) {
                    return d.getNamePosition(d.x, d.y).x;
                }).attr("dy", function (d) {
                    return d.getNamePosition(d.x, d.y).y;
                });

                _this4.svg.selectAll(".text-value").attr("dx", function (d) {
                    return d.getValuePosition(d.x, d.y).x;
                }).attr("dy", function (d) {
                    return d.getValuePosition(d.x, d.y).y;
                });
            });

            function collide(node) {
                var r = node.getBubbleRadius() + 16,
                    nx1 = node.x - r,
                    nx2 = node.x + r,
                    ny1 = node.y - r,
                    ny2 = node.y + r;

                return function (quad, x1, y1, x2, y2) {
                    if (quad.point && quad.point.id !== node.id) {
                        var x = node.x - quad.point.x,
                            y = node.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            _r = node.getBubbleRadius() + quad.point.getBubbleRadius();

                        if (l < _r) {
                            l = (l - _r) / l * .001;
                            node.x -= x *= l;
                            node.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                };
            }

            this.render();
        }
    }, {
        key: 'renderLogo',
        value: function renderLogo() {
            this.g.append("svg:image").attr("xlink:href", "images/mapbox-log.png").style("opacity", ".5").attr("id", "map-logo").style("cursor", "pointer").attr("x", "20").attr("y", "390").attr("width", "50").attr("height", "50").on('click', this.handleGravity.bind(this));
        }
    }, {
        key: 'handleGravity',
        value: function handleGravity() {
            if (this.gravityActive) {
                this.gravityActive = false;
                d3.select(".bubble").remove();
            } else {
                this.force.gravity(0.1);
                this.force.charge(function (d, i) {
                    return -d.getBubbleRadius();
                });
                this.force.start();
                this.gravityActive = true;
            }
        }
    }, {
        key: 'renderBubbles',
        value: function renderBubbles(countries) {
            var attrId = arguments.length <= 1 || arguments[1] === undefined ? 'value' : arguments[1];

            this.countries = countries;
            this.valueId = attrId;

            if (this.topodata) {
                this.force.nodes([]);
                this.countryList = [];
                this.render(false);
            } else {
                var max = 0;
                for (var key in countries) {
                    max = Math.max(max, countries[key][attrId]);
                }
                this.factor = max;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var createBubbles = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            var _loop = function _loop(key) {
                var country = _this5.topodata.find(function (element) {
                    return element.id && element.id == key;
                });
                if (country) {
                    var bubble = new _Bubble2.default(country, _this5.path.centroid);
                    bubble.setValue(_this5.countries[key][_this5.valueId], _this5.factor);
                    _this5.force.nodes().push(bubble);
                    _this5.countryList.push(bubble);
                }
            };

            for (var key in this.countries) {
                _loop(key);
            }
            this.force.start();
            if (createBubbles) {
                this.setBubbles();
            }
        }
    }, {
        key: 'setBubbles',
        value: function setBubbles() {
            var bubbles = this.g.append("g"),
                texts = void 0;

            bubbles.attr("class", "bubbles").selectAll("circle").data(this.countryList).enter().append("circle").attr("class", "bubble").attr("transform", function (d) {
                return "translate(" + d.center + ")";
            }).transition().attr("duration", 1250).attr("r", function (d) {
                return d.getBubbleRadius();
            });

            texts = bubbles.selectAll("text").data(this.countryList).enter();

            // append country names
            texts.append("text").attr("class", "text-name").style("font-size", function (d) {
                return d.nameSize + "px";
            }).transition().attr("duration", 250).text(function (d) {
                return d.name;
            });

            // append values
            texts.append("text").attr("class", "text-value").style("font-size", function (d) {
                return d.valueSize + "px";
            }).transition().attr("duration", 250).text(function (d) {
                return String(d.value);
            });

            this.interval = setInterval(this.updateBubbles.bind(this), 1000);
        }
    }, {
        key: 'updateBubbles',
        value: function updateBubbles() {

            d3.selectAll(".bubble").data(this.countryList).transition().attr("duration", 250).attr("r", function (d) {
                if (d.value === 0) {
                    return 0;
                }
                return d.getBubbleRadius();
            });

            d3.selectAll(".text-name").data(this.countryList).style("font-size", function (d) {
                return d.nameSize + "px";
            }).transition().attr("duration", 250).text(function (d) {
                if (d.value === 0) {
                    return '';
                }
                return d.name;
            });

            d3.selectAll(".text-value").data(this.countryList).style("font-size", function (d) {
                return d.valueSize + "px";
            }).transition().attr("duration", 250).text(function (d) {
                if (d.value === 0) {
                    return '';
                }
                return d.value;
            });
        }
    }, {
        key: 'visitCountry',
        value: function visitCountry(id) {
            var _this6 = this;

            var get_xyz = function get_xyz(d) {
                var bounds = _this6.path.bounds(d),
                    w_scale = (bounds[1][0] - bounds[0][0]) / _this6.width,
                    h_scale = (bounds[1][1] - bounds[0][1]) / _this6.height,
                    scaleValue = .96 / Math.max(w_scale, h_scale),
                    x = (bounds[1][0] + bounds[0][0]) / 2,
                    y = (bounds[1][1] + bounds[0][1]) / 2 + _this6.height / scaleValue / 6;

                return [x, y, scaleValue];
            };

            var zoomIn = function zoomIn(xyz) {
                _this6.g.transition().duration(550).attr("transform", "translate(" + _this6.projection.translate() + ")" + "scale(" + Math.min(6.5, xyz[2]) + ")" + "translate(-" + xyz[0] + ",-" + xyz[1] + ")");
            };

            var zoomOut = function zoomOut(xyz) {
                _this6.g.transition().duration(250).attr("transform", "translate(" + _this6.projection.translate() + ")" + "scale(" + Math.min(6.5, xyz[2]) + ")" + "translate(-" + xyz[0] + ",-" + xyz[1] + ")");
            };

            var d = this.topodata.find(function (e) {
                return e.id == id;
            }),
                actualId = this.actual ? this.actual.id : null;

            if (d && actualId !== d.id) {
                var xyz = get_xyz(d);
                this.actual = d;
                zoomIn(xyz);
            } else {
                var xyz = [this.width / 2, this.height / 1.45, 1];
                this.actual = null;
                zoomOut(xyz, true);
            }
        }
    }]);

    return BubbleMap;
}();

exports.default = BubbleMap;