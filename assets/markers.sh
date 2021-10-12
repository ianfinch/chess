#!/bin/bash

# Create a circle image for indicating possible moves
echo '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' > assets/dot.svg
echo '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' >> assets/dot.svg
echo '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100">' >> assets/dot.svg
echo '  <circle cx="50" cy="50" r="50" style="fill: #006600; stroke: none; opacity: 0.3;" />' >> assets/dot.svg
echo '</svg>' >> assets/dot.svg

# Create a circle image for indicating checks
echo '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' > assets/check.svg
echo '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' >> assets/check.svg
echo '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100">' >> assets/check.svg
echo '  <defs>' >> assets/check.svg
echo '    <radialGradient id="grad">' >> assets/check.svg
echo '      <stop offset="0%" stop-color="#ff0000" stop-opacity="0.0" />' >> assets/check.svg
echo '      <stop offset="50%" stop-color="#ff0000" stop-opacity="0.0" />' >> assets/check.svg
echo '      <stop offset="100%" stop-color="#ff0000" stop-opacity="0.8" />' >> assets/check.svg
echo '    </radialGradient>' >> assets/check.svg
echo '  </defs>' >> assets/check.svg
echo '  <circle cx="50" cy="50" r="50" style="fill: url(#grad); stroke: none;" />' >> assets/check.svg
echo '</svg>' >> assets/check.svg

# Create a circle image for indicating possible captures
echo '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' > assets/capture.svg
echo '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' >> assets/capture.svg
echo '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100">' >> assets/capture.svg
echo '  <defs>' >> assets/capture.svg
echo '    <radialGradient id="grad">' >> assets/capture.svg
echo '      <stop offset="0%" stop-color="#006600" stop-opacity="0.0" />' >> assets/capture.svg
echo '      <stop offset="50%" stop-color="#006600" stop-opacity="0.0" />' >> assets/capture.svg
echo '      <stop offset="100%" stop-color="#006600" stop-opacity="0.6" />' >> assets/capture.svg
echo '    </radialGradient>' >> assets/capture.svg
echo '  </defs>' >> assets/capture.svg
echo '  <circle cx="50" cy="50" r="47" style="fill: url(#grad); stroke: none;" />' >> assets/capture.svg
echo '</svg>' >> assets/capture.svg
