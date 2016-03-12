import BubbleMap from 'BubbleMap/bundle/BubbleMap.js'

const token = 'pk.eyJ1Ijoiam9vdHNlODQiLCJhIjoiY2lrandjOTFyMDh5bHUybTZsMnQzZGhzYiJ9.v4EUTBiszBVhvt1wNek2DQ'
let map = new BubbleMap('map', token, 840, 400)

map.renderBubbles({
  "BD": {"uid": 623, "conn": 444},
  "BE": {"uid": 14554, "conn": 11490},
  "BF": {"uid": 32, "conn": 5},
  "BG": {"uid": 963, "conn": 1011},
  "BA": {"uid": 364, "conn": 1150},
  "BB": {"uid": 171, "conn": 22},
  "BM": {"uid": 61, "conn": 8},
  "BN": {"uid": 379, "conn": 97},
  "BO": {"uid": 226, "conn": 11},
  "JP": {"uid": 235600, "conn": 62141773},
  "JM": {"uid": 395, "conn": 226},
  "IND": {"uid": 235600, "conn": 62141773},
  "E": {"uid": 235600, "conn": 641773},
  "CN": {"uid": 235600, "conn": 12141773},
  "MX": {"uid": 235600, "conn": 41773},
  "BR": {"uid": 235600, "conn": 1773},
  "FIN": {"uid": 235600, "conn": 2141773},
  "D": {"uid": 235600, "conn": 41773},
  "GB": {"uid": 235600, "conn": 2773},
  "VN": {"uid": 235600, "conn": 41773},
  "AR": {"uid": 235600, "conn": 1773},
  "INDO": {"uid": 235600, "conn": 41773},
  "PE": {"uid": 235600, "conn": 41773},
  "PH": {"uid": 235600, "conn": 773},
  "SA": {"uid": 235600, "conn": 1773}
})

setTimeout(() => {
    map.visitCountry("JP")
}, 8000)

setTimeout(() => {
    map.visitCountry("BE")
}, 14000)

setTimeout(() => {
    map.visitCountry("")
}, 20000)
