import 'd3'
import 'topojson/build/topojson'
import './d3.geo.tile.v0.min'
import './d3.geo.zoom'
import $ from 'jquery'
import jQuery from 'jquery'
import Bubble from './Bubble'

import '../styles/BubbleMap.less'

window.$ = $
window.jQuery = jQuery

export default class BubbleMap {

    constructor (elementId, token, width, height, withGravity = false) {

        this.width = 938
        this.height = 450
        this.container = $("#" + elementId)
        this.containerId = elementId
        this.gravityActive = withGravity
        this.token = token
        this.countryList = new Array() 
        this.m_width = width || this.container.width()
        this.m_height = height || $(window).height()

        if (width) {
            this.container.width(this.m_width)
        }

        $(window).resize(() => {
            if (this.svg) {
                this.svg.attr("width", this.container.width())
                this.svg.attr("height", this.m_height)
            }
        })

        this.initializeMap()
    }

    initializeMap () {

        this.projection = d3.geo.mercator()
        this.path = d3.geo.path()
        this.tile = d3.geo.tile()
        this.svg = d3.select("#" + this.containerId).append("svg")

        this.projection
            .scale(150)
            .translate([this.width / 2, this.height / 1.45])

        this.path
            .projection(this.projection)

        this.tile
            .scale(this.projection.scale() * 2 * Math.PI)
            .translate(this.projection([0, 0]))
            .zoomDelta((window.devicePixelRatio || 1) + 2.5)

        this.svg
            .attr("preserveAspectRatio", "xMidYMin")
            .attr("viewBox", "0 0 " + this.width + " " + this.height)
            .attr("width", this.m_width)
            .attr("height", this.m_height)

        this.svg
            .append("rect")
            .attr("id", "rect-background")
            .attr("class", "background")
            .attr("width", "100%")
            .attr("height", "100%")

        this.g = this.svg.append("g")

        this.loadWorld()
    }

    loadWorld () {
        const worldDataFile = "./json/countries.iso.json"

        d3.json(worldDataFile, (error, data) => {
            if (error) {
                throw new Error('Error loading json file: ' + error);
            }
            else {
                this.printWorld(data)
                this.gravity()
            }
        })
    }

    printWorld (data) {

        const tilesUrl = "http://a.tiles.mapbox.com/v4/mapbox.streets/",
              tiles = this.tile()

        this.topodata = topojson.feature(data, data.objects.countries).features

        this.g
            .append("g")
            .attr("id","image-list")
            .attr("clip-path", "url(#clip)")
            .selectAll("image")
            .data(tiles)
          .enter()
            .append("image")
            .attr("xlink:href", (d) => {
                return tilesUrl + d[2] + "/" + d[0] + "/" + d[1] +
                  ".png?access_token=" + this.token
            })
            .attr("width", tiles.scale + 1)
            .attr("height", tiles.scale + 1)
            .attr("x", (d) => {
                return (d[0] + tiles.translate[0]) * tiles.scale
            })
            .attr("y", (d) => {
                return (d[1] + tiles.translate[1]) * tiles.scale
            })

        this.g
            .append("clipPath")
            .attr("id", "clip")
            .append("use")
            .attr("xlink:href", "#rect-background")

        this.g
            .append("g")
            .attr("id","countries")
            .selectAll("path")
            .data(this.topodata)
            .enter()
            .append("path")
            .attr("id", (d) => {
                return d.id
            })
            .attr("d", this.path)

    }

    gravity () {

        this.force = d3.layout.force()
            .gravity(0)
            .charge(0)
            .nodes([])
            .size([this.m_width / 2, this.m_height / 2])

        this.force.on("tick", (e) => {

            let q = d3.geom.quadtree(this.countryList),
                i = 0,
                n = this.countryList.length

            while (++i < n) {
                q.visit(collide(this.countryList[i]))
            }

            this.svg
                .selectAll("circle")
                .attr("transform", (d) => {
                    return "translate(" + [d.x, d.y] + ")"
                })

            this.svg
                .selectAll(".text-country-circle")
                .attr("dx", (d) => {
                    return d.getNamePosition(d.x, d.y).x
                })
                .attr("dy", (d) => {
                    return d.getNamePosition(d.x, d.y).y
                })

            this.svg
                .selectAll(".text-connections-circle")
                .attr("dx", (d) => {
                    return d.getValuePosition(d.x, d.y).x
                })
                .attr("dy", (d) => {
                    return d.getValuePosition(d.x, d.y).y
                })
        })

        function collide (node) {
            let r = node.getBubbleRadius() + 16,
                nx1 = node.x - r,
                nx2 = node.x + r,
                ny1 = node.y - r,
                ny2 = node.y + r

            return (quad, x1, y1, x2, y2) => {
                if (quad.point && (quad.point.id !== node.id)) {
                    let x = node.x - quad.point.x,
                        y = node.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = node.getBubbleRadius() + quad.point.getBubbleRadius()
                    
                    if (l < r) {
                        l = (l - r) / l * .001
                        node.x -= x *= l
                        node.y -= y *= l
                        quad.point.x += x
                        quad.point.y += y
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1
            }
        }

        this.g.append("svg:image")
          .attr("xlink:href", "images/mapbox-log.png")
          .style("opacity",".5")
          .attr("id","map-logo")
          .style("cursor","pointer")
          .attr("x", "20")
          .attr("y", "390")
          .attr("width", "50")
          .attr("height", "50")
          .on('click', this.handleGravity.bind(this))

        this.render()
    }

    handleGravity () {
        if (this.gravityActive) {
            this.gravityActive = false
            this.force.gravity(0)
                .charge(0)
                .resume()

            this.svg.selectAll("circle")
                .attr("transform", (d) => {
                    return "translate(" + [d.center.x, d.center.y] + ")"
                })
        } else {
            this.force.gravity(0.1)
            this.force.charge((d, i) => {
                return -d.getBubbleRadius()
            })
            this.force.start()
            this.gravityActive = true
        }
    }

    renderBubbles (countries) {
        this.countries = countries
    }

    render () {
        for (let key in this.countries) {
            let country = this.topodata.find((element) => {
                return element.id && element.id == key
            })

            if (country) {
                let bubble = new Bubble(country, this.path.centroid)
                bubble.setValue(this.countries[key].conn)
                bubble.setUid(this.countries[key].uid)
                this.force.nodes().push(bubble)
                this.countryList.push(bubble)
            }
        }

        this.force.start()
        /*this.setMinConnections()
        setInterval(this.goToCountry, 7000)

        setInterval(this.setMinConnections, 3600000)
        setInterval(this.setMaxConnections, 3600000)*/

        this.setBubbles()
    }

    setBubbles () {
        let bubbles = this.g.append("g"),
            texts

        bubbles
            .attr("class", "bubble")
            .selectAll("circle")
            .data(this.countryList)
          .enter()
            .append("circle")
            .attr("class","bubble-circle")
            .attr("transform", (d) => {
                return "translate(" + d.center + ")"
            })
            .transition()
            .attr("duration", 1250)
            .attr("r", (d) => {
                return d.getBubbleRadius()
            })

        texts = bubbles
            .selectAll("text")
            .data(this.countryList)
          .enter()

        // append country names
        texts
            .append("text")
            .attr("dx", (d) => {
                return d.x_country_name
            })
            .attr("dy", (d) => {
                return d.y_country_name
            })
            .attr("class","text-country-circle")
            .style("font-size", (d) => {
                return d.nameSize + "px"
            })
            .transition()
            .attr("duration", 250)
            .text((d) => {
                return d.name
            })

        // append values
        texts
            .append("text")
            .attr("dx", (d) => {
                return d.x_country_connections
            })
            .attr("dy", (d) => {
                return d.y_country_connections
            })
            .attr("class", "text-connections-circle")
            .style("font-size", (d) => {
                return d.valueSize + "px"
            })
            .transition()
            .attr("duration", 250)
            .text((d) => {
                return String(d.value)
            })

        this.interval = setInterval(this.updateBubbles.bind(this), 1000)
    }

    updateBubbles() {

        d3.selectAll(".bubble-circle")
            .data(this.countryList)
            .transition()
            .attr("duration", 250)
            .attr("r", (d) => {
                if(d.value === 0) {
                    return 0
                }
                return d.getBubbleRadius()
            })

        d3.selectAll(".text-country-circle")
            .data(this.countryList)
            .style("font-size", (d) => {
                return d.font_size_country_name + "px"
            })
            .transition()
            .attr("duration", 250)
            .text((d) => {
                if(d.value === 0) {
                    return ''
                }
                return d.name
            })

        d3.selectAll(".text-connections-circle")
            .data(this.countryList)
            .style("font-size", (d) => {
                return d.font_size_country_connections + "px"
            })
            .transition()
            .attr("duration", 250)
            .text((d) => {
                if(d.value === 0) {
                    return ''
                }
                return d.value
            })
    }


    visitCountry (id) {

        const get_xyz = (d) => {
            const bounds = this.path.bounds(d),
                  w_scale = (bounds[1][0] - bounds[0][0]) / this.width,
                  h_scale = (bounds[1][1] - bounds[0][1]) / this.height,
                  scaleValue = .96 / Math.max(w_scale, h_scale),
                  x = (bounds[1][0] + bounds[0][0]) / 2,
                  y = (bounds[1][1] + bounds[0][1]) / 2 + (this.height / scaleValue / 6)

            return [x, y, scaleValue]
        }

        const zoomIn = (xyz) => {
          this.g.transition()
              .duration(550)
              .attr("transform",
                "translate(" + this.projection.translate() + ")" +
                "scale(" + Math.min(6.5, xyz[2]) + ")" +
                "translate(-" + xyz[0] + ",-" + xyz[1] + ")"
              )
        }

        const zoomOut = (xyz) => {
            this.g.transition()
                .duration(250)
                .attr("transform",
                  "translate(" + this.projection.translate() + ")" +
                  "scale(" + Math.min(6.5, xyz[2]) + ")" +
                  "translate(-" + xyz[0] + ",-" + xyz[1] + ")"
                )
        }

        let d = this.topodata.find(function (e) {
            return e.id == id
        })

        if (d && this.actual.id !== d.id) {
            var xyz = get_xyz(d)
            this.actual = d
            zoomIn(xyz)
        } else {
            var xyz = [width / 2, height / 1.45, 1]
            this.actual = null
            zoomOut(xyz, true)
        }

    }
}

