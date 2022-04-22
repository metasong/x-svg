import { SVGBase } from "./svg-base.js";
/**
    <pie-chart width="100">
      <slice size="90" stroke="green">HTML</slice>
      <slice size="1" stroke="red">JavaScript</slice>
      <slice size="9" stroke="blue">CSS</slice>
    </pie-chart>
 */
class PieChartBase extends SVGBase {
  createSVGCircle({ ...args }) {
    // calc circle size
    const circleSize = this.pieSize / 2;
    const pathLength = 100;
    const slice = this.element({
      tag: "circle",
      attributes: {
        pathLength: pathLength, // 100 for a 100% Pie
        size: args.size || pathLength,
        "stroke-dasharray":
          args.dashArray || args.size + " " + (pathLength - args.size),
        "stroke-dashoffset": args.offset || 0,
        "stroke-width": args.strokeWidth || circleSize,
        stroke: args.stroke || "black",
        fill: args.fill || "none",
        // center point can be declared in multiple notations:
        cx: args.cx || (args.point && args.point.x) || this.width / 2,
        cy: args.cy || (args.point && args.point.y) || this.height / 2,
        r: args.r || circleSize / 2,
      },
    });


    // function on EACH slice so config parameters are re-used
    // default getPointAt( .5 , config.size/2 ) is the SLICE middle point
    slice.getPointAt = (
      distance = 0.5, // 0=CIRCLE center , .5=middle , 1=circle outer edge
      offset = slice.size / 2 // 0=start slice , size/2=middle slice , size=end slice
    ) => {
      // need to create a temporary DOM element
      // so the default .getPointAtLength and .getTotalLength functions can be used
      const tempPt = this.svg.appendChild(
        this.createSVGCircle({
          //...config, // use same circle settings
          ...slice.attributes,
          // but a different radius
          r: circleSize * distance,
        })
      );
      // calculate startoffset relative to the start of the slice
      let len = offset - args.offset;
      if (len < 0) len = pathLength + len;
      const point = tempPt.getPointAtLength(
        (len * tempPt.getTotalLength()) / pathLength
      );
      // got point(x,y) now, remove the temp circle from the DOM
      tempPt.remove();
      return point;
    };
    // return SVG <circle> element
    return slice;
  }

  // draw a circle on the SVG
  addSVGPoint(position, fill = "white", stroke = "black", r = 4, strokeWidth = 2) {
    this.svg.append(
      this.createSVGCircle({
        point: position,
        r,
        fill,
        stroke,
        strokeWidth,
      })
    );
  }

}

customElements.define(
  "pie-chart",
  class extends PieChartBase {
    connectedCallback() {
      // fires on the OPENING <pie-chart> tag
      setTimeout(() =>
        // so we wait till all innerHTML is parsed
        this.renderPieChart({
          pieSize: 200, // try different sizes, see what happens (the font-size is relative to the pieSize/viewBox)
          padding: 20,
        })
      );
    }

    renderPieChart({ pieSize = 200, padding = 0 }) {
      this.pieSize = pieSize;
      this.height = pieSize + padding;
      this.width = pieSize + padding;

      // offset: 0 - 100 , 0 = pie chart starts at top
      this.sliceTopOffset = Number(this.getAttribute("slice-offset")) || 0;
      this.labelPosition = this.getAttribute("label-position") || 0.8;

      this.svg = this.element({
        tag: "svg",
        attributes: {
          width: this.width,
          height: this.height,
          viewBox: `0 0 ${this.width} ${this.height}`,
        },
        // SVG doesn't do CSS background:color, a <filter> does the job
        innerHTML: `<defs><filter x="0" y="0" width="1" height="1" id="label">
<feFlood flood-color="#222" flood-opacity="0.4"/>
<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
</filter></defs>`,
        append: this.createSlicesWithCircles(),
      });

      // replace <pie-chart> with our <svg>
      this.replaceWith(this.svg);

      this.addSliceLabels();
    }

    addSliceLabels() {
      this.slices.forEach((slice) => {
        const sliceMiddlePoint = slice.getPointAt(this.labelPosition);
        //this.addSVGPoint(sliceMiddlePoint);
        this.svg.append(
          this.element({
            tag: "text",
            attributes: {
              x: sliceMiddlePoint.x,
              y: sliceMiddlePoint.y - 0,
              fill: "white",
              "font-size": 10, // in viewBox pieSize units
              "text-anchor": "middle",
              "font-family": "arial",
              filter: "url(#label)", // grey background color with opacity
            },
            innerHTML: slice.label + " " + slice.size + "%",
          })
        );
      });
    }

    createSlicesWithCircles() {
      // offset=25 pie-slice starts at the top of the circle
      let offset = 25 - this.sliceTopOffset;
      // get all <slice> elements in lightDOM
      const slices = [...this.querySelectorAll("slice")];
      // return an array of circles/slices
      this.slices = slices.map((slice) => {
        const size = parseFloat(slice.getAttribute("size"));
        let circle = this.createSVGCircle({
          size,
          offset,
          stroke: slice.getAttribute("stroke"),
        });
        // save the label and size (because the slice element itself is removed)
        circle.size = size;
        circle.label = slice.innerHTML;
        // calculate offset for NEXT slice
        offset -= size;
        return circle;
      });
      return this.slices;
    }
  }
); 
