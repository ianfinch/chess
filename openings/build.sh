#!/bin/sh
#
# Download openings from:
#
#       https://github.com/niklasf/chess-openings

dir=$( dirname $0 )

curl -L https://github.com/niklasf/chess-openings/raw/master/dist/a.tsv > $dir/openings.tsv
curl -L https://github.com/niklasf/chess-openings/raw/master/dist/b.tsv >> $dir/openings.tsv
curl -L https://github.com/niklasf/chess-openings/raw/master/dist/c.tsv >> $dir/openings.tsv
curl -L https://github.com/niklasf/chess-openings/raw/master/dist/d.tsv >> $dir/openings.tsv
curl -L https://github.com/niklasf/chess-openings/raw/master/dist/e.tsv >> $dir/openings.tsv

node $dir/build-tree.js
