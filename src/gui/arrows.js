/**
 * Draw an arrow from one square to another
 */
const drawArrow = (from, to) => {

    const box = createArrowBox(from, to);
    createArrowSvg(box);
};

/**
 * Create the DIV which will contain the arrow
 */
const createArrowBox = (from, to) => {

    // Get our geometries
    const fromRect = document.getElementsByClassName("square-" + from)[0].getBoundingClientRect();
    const toRect = document.getElementsByClassName("square-" + to)[0].getBoundingClientRect();

    // Create a DIV to hold our arrow
    const arrowDiv = document.createElement("DIV");
    arrowDiv.setAttribute("class", "arrow");

    // Set the size of the arrow box
    let left = 0;
    let width = 0;
    if (fromRect.left < toRect.left) {
        width = toRect.right - fromRect.left;
        left = fromRect.left;
    } else {
        width = fromRect.right - toRect.left;
        left = toRect.left;
    }

    let top = 0;
    let height = 0;
    if (fromRect.bottom < toRect.bottom) {
        height = toRect.bottom - fromRect.top;
        top = fromRect.top;
    } else {
        height = fromRect.bottom - toRect.top;
        top = toRect.top;
    }

    // Apply the dimensions to the arrow box
    arrowDiv.style.left = left + "px";
    arrowDiv.style.top = top + "px";
    arrowDiv.style.width = width + "px";
    arrowDiv.style.height = height + "px";

    // Attach our arrow to the container for the board
    document.getElementById("container").appendChild(arrowDiv);

    // What is the direction of the arrow?
    let lToR = null;
    if (fromRect.left < toRect.left) {
        lToR = "r";
    } else if (fromRect.left === toRect.left) {
        lToR = "";
    } else {
        lToR = "l";
    }

    let tToB = null;
    if (fromRect.bottom < toRect.bottom) {
        tToB = "b";
    } else if (fromRect.bottom === toRect.bottom) {
        tToB = "";
    } else {
        tToB = "t";
    }

    const direction = tToB + lToR;
    const margin = fromRect.width / 2;

    return { arrowDiv, width, height, margin, direction };
};

/**
 * Draw the actual arrow
 */
const createArrowSvg = ({ arrowDiv, width, height, margin, direction }) => {

    let x1, y1, x2, y2;

    if (direction === "t" || direction === "tr") {
        x1 = margin;
        y1 = height - margin;
        x2 = width - margin;
        y2 = margin;
    } else if (direction === "r" || direction === "br") {
        x1 = margin;
        y1 = margin;
        x2 = width - margin;
        y2 = height - margin;
    } else if (direction === "b" || direction === "bl") {
        x1 = width - margin;
        y1 = margin;
        x2 = margin;
        y2 = height - margin;
    } else if (direction === "l" || direction === "tl") {
        x1 = width - margin;
        y1 = height - margin;
        x2 = margin;
        y2 = margin;
    }

    const arrow = `
<svg width="${width}" height="${height}">
  <defs>
    <marker id="arrowhead" viewBox="0 0 20 40"
            refX="1" refY="20"
            markerUnits="strokeWidth" markerWidth="3" markerHeight="3" orient="auto">
      <path d="M 0 0 L 20 20 L 0 40 z" fill="steelblue" />
    </marker>
  </defs>
  <_circle cx="${x1}" cy="${y1}" r="${margin * 0.8}" fill="steelblue" opacity="0.7" />
  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
        stroke="steelblue" stroke-linecap="round" stroke-width="12" marker-end="url(#arrowhead)" opacity="0.7" />
</svg>
    `.trim();

    const template = document.createElement("template");
    template.innerHTML = arrow;

    const svg = template.content.firstChild;
    arrowDiv.appendChild(svg);
};

const clear = () => {
    [...document.getElementsByClassName("arrow")].forEach(elem => elem.remove());
};

export default {
    clear,
    drawArrow
};
