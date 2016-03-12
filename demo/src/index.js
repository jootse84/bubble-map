import BubbleMap from 'bubble-map/bundle/BubbleMap.js'

const token = 'pk.eyJ1Ijoiam9vdHNlODQiLCJhIjoiY2lrandjOTFyMDh5bHUybTZsMnQzZGhzYiJ9.v4EUTBiszBVhvt1wNek2DQ'

let map = new BubbleMap('map', token, 840, 400)
let countries = {
  "BD": {"value": 444},
  "BE": {"value": 11490},
  "BF": {"value": 5},
  "BG": {"value": 1011},
  "BA": {"value": 1150},
  "BB": {"value": 22},
  "BM": {"value": 8},
  "BN": {"value": 97},
  "BO": {"value": 11},
  "JP": {"value": 62773},
  "JM": {"value": 226},
  "IND": {"value": 41773},
  "CN": {"value": 121773},
  "MX": {"value": 41773},
  "BR": {"value": 1773},
  "FIN": {"value": 273},
  "D": {"value": 41773},
  "GB": {"value": 2773},
  "VN": {"value": 41773},
  "AR": {"value": 1773},
  "INDO": {"value": 41773},
  "PE": {"value": 41773},
  "PH": {"value": 773},
  "SA": {"value": 1773}
}

map.renderBubbles(countries, "value")

let inter = setInterval(() => {
    for (let key in countries) {
        countries[key] = {
            value: countries[key].value + 1000
        }
    }
    map.renderBubbles(countries, "value")
}, 2000)

setTimeout(() => {
    map.visitCountry("JP")
}, 8000)

setTimeout(() => {
    map.visitCountry("BE")
}, 14000)

setTimeout(() => {
    map.visitCountry("")
}, 20000)

setTimeout(() => {
    clearInterval(inter)
}, 20000)
