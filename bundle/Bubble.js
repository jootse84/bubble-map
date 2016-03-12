"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bubble = function () {
    function Bubble(country, centroid) {
        _classCallCheck(this, Bubble);

        this.center = this.getCenter(country, centroid);
        this.x = this.center[0];
        this.y = this.center[1];
        this.name = this.getCountryName(country);
        this.id = country.id;
    }

    _createClass(Bubble, [{
        key: "getCountryName",
        value: function getCountryName(country) {
            switch (country.id) {
                case "AE":
                    return "Emirates";
                case "GB":
                    return "UK";
                case "SA":
                    return "S. Arabia";
                case "CH":
                    return "Suisse";
                case "LA":
                    return "Lao";
                default:
                    return country.properties.name;
            }
        }
    }, {
        key: "getCenter",
        value: function getCenter(country, centroid) {
            var result = centroid(country);
            switch (country.id) {
                case "US":
                    result[0] += 60;
                    result[1] += 40;
                    break;
                case "CA":
                    result[1] += 60;
                    break;
                case "MN":
                    result[1] -= 10;
                    break;
                case "HK":
                    result[0] += 4;
                    break;
                case "MO":
                    result[0] -= 4;
                    break;
                case "BH":
                    result[0] -= 3;
                    break;
                case "F":
                    result[0] += 5;
                    result[1] -= 5;
                    break;
                case "NL":
                    result[0] -= 7;
                    result[1] += 10;
                    break;
                case "CZ":
                    result[1] += 8;
                    break;
                case "GL":
                    result[1] += 40;
                    break;
                case "NO":
                    result[1] += 40;
                    break;
            }
            return result;
        }
    }, {
        key: "setValue",
        value: function setValue(value) {
            var factor = arguments.length <= 1 || arguments[1] === undefined ? 10000 : arguments[1];

            this.value = value;
            this.factor = factor;
            this.nameSize = this.fontSize(this.name);
            this.nameDims = this.size(this.name, ["text-name"]);
            this.valueSize = this.fontSize(String(this.value));
            this.valueDims = this.size(String(this.value), ["text-value"]);
        }
    }, {
        key: "getBubbleRadius",
        value: function getBubbleRadius() {
            var pixels = Math.round(35 * this.value / this.factor);
            console.log('radius ', pixels);
            return Math.max(Math.min(pixels, 35), 3.5);
        }
    }, {
        key: "fontSize",
        value: function fontSize(text) {
            var MAX_FONT_SIZE = 8.5,
                width = this.getBubbleRadius() * 2,
                len = String(text).length + 1,
                w = Math.min(width / len, MAX_FONT_SIZE),
                h = Math.min(width * .25, MAX_FONT_SIZE);

            return Math.max(Math.round(Math.min(w, h) * 10) / 10, 1);
        }
    }, {
        key: "size",
        value: function size(text, classes) {
            var escape = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];


            var size = this.fontSize(text),
                doc = document,
                divElement = void 0,
                dimensions = void 0;

            classes = classes || {};
            classes.push('text');

            divElement = doc.createElement('div');
            divElement.setAttribute('class', classes.join(' '));
            divElement.style.fontSize = size + "px";

            if (escape) {
                $(divElement).text(text);
            } else {
                divElement.innerHTML = text;
            }

            doc.body.appendChild(divElement);
            dimensions = {
                width: $(divElement).outerWidth(),
                height: $(divElement).outerHeight()
            };

            divElement.parentNode.removeChild(divElement);

            return dimensions;
        }
    }, {
        key: "getNamePosition",
        value: function getNamePosition(xpoint, ypoint) {
            return {
                'x': xpoint - this.nameDims.width / 2,
                'y': ypoint
            };
        }
    }, {
        key: "getValuePosition",
        value: function getValuePosition(xpoint, ypoint) {
            return {
                'x': xpoint - this.valueDims.width / 2,
                'y': ypoint + this.valueDims.height + .3
            };
        }
    }]);

    return Bubble;
}();

exports.default = Bubble;