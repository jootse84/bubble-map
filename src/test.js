import BubbleMap from './BubbleMap'

const token = 'pk.eyJ1Ijoiam9vdHNlODQiLCJhIjoiY2lrandjOTFyMDh5bHUybTZsMnQzZGhzYiJ9.v4EUTBiszBVhvt1wNek2DQ'
let map = new BubbleMap('map', token)

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
  "JM": {"uid": 395, "conn": 226}
})

