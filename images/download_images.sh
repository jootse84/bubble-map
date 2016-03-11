#!/bin/bash

err=0
while read line
do
  url=$line
  name=$(echo "$line" | cut -d/ -f6-8 | tr / _)
  name="./tiles/tile_$name"
  echo "Downloading image from file - $url and name - $name"
  wget -O "$name" "$url" || err=1
done < $1
