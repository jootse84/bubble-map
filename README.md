#Bubble Map

Easy-to-use library to visualize your country data ina world map, using Mapbox tiles, D3 and topojson.  
Allows to zoom-in, zoom-out and life update of your country data.

![Screencast](./images/example.gif)

## Usage

```js
import LabelList from 'BubbleMap/bundle/BubbleMap.js'

let map = new BubbleMap('myElementId', 'my_mapbox_token', 840, 400)
map.renderBubbles({
  "JP": {"value": 62141773},
  "AR": {"value": 1773}
}, "value")
```
