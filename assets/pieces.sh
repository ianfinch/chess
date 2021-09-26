#!/bin/bash
#
# Get copies of chess pieces, from:
#
#   https://en.wikipedia.org/wiki/User:Cburnett/GFDL_images/Chess
#
# Author:
#
#   By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499800
#

assets=$( dirname $0 )
wikipedia="https://en.wikipedia.org"
images="$wikipedia/wiki/User:Cburnett/GFDL_images/Chess"

# Get the lightbox page with all images, and look for the transparent ones
curl --silent "$images" | grep -B 2 "on transparent" | while read line ; do
    if [[ $( echo $line | grep 'img' ) != "" ]] ; then

        # Find the page for each piece's image
        page=${wikipedia}$( echo $line | sed 's/^.*<a href="\([^"]*\)".*/\1/' )
        image=https:$( curl --silent $page | grep "Original file" | sed 's/^.*<a href="\([^"]*\)".*/\1/' )

        # Work out which piece this is (format is Chess_{piece}{dark/light}{background})
        target=$( echo $image | sed -e 's/^.*Chess_\([bknpqr]\)\([dl]\).*/\2\u\1.svg/' -e 's/^d/b/' -e 's/^l/w/' )
        # Grab the image and save it
        curl --silent ${image} > ${assets}/${target}
    fi
done
