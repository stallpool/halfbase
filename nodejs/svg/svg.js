(function () {

var SVGNS = 'http://www.w3.org/2000/svg';

function SVG(w, h) {
   this.svg = document.createElementNS(SVGNS, 'svg');
   this.resize(w, h);
}
SVG.prototype = {
   select: function (parent) {
      parent.appendChild(this.svg);
      return this;
   },
   resize: function (w, h) {
      this.attr(this.svg, 'width', w).attr(this.svg, 'height', h);
      this.svg.style.width = w + 'px';
      this.svg.style.height = h + 'px';
   },
   elem: {
      g: function () { return document.createElementNS(SVGNS, 'g'); },
      symbol: function () { return document.createElementNS(SVGNS, 'symbol'); },
      use: function () { return document.createElementNS(SVGNS, 'use'); },
      link: function () { return document.createElementNS(SVGNS, 'link'); },
      view: function () { return document.createElementNS(SVGNS, 'view'); },
      defs: function () { return document.createElementNS(SVGNS, 'defs'); },
      clipPath: function () { return document.createElementNS(SVGNS, 'clipPath'); },
      mask: function () { return document.createElementNS(SVGNS, 'mask'); },
      radialGradient: function () { return document.createElementNS(SVGNS, 'radialGradient'); },
      linearGradient: function () { return document.createElementNS(SVGNS, 'linearGradient'); },
      stop: function () { return document.createElementNS(SVGNS, 'stop'); },
      animate: function () { return document.createElementNS(SVGNS, 'animate'); },
      animateTransform: function () { return document.createElementNS(SVGNS, 'animateTransform'); },
      animateMotion: function () { return document.createElementNS(SVGNS, 'animateMotion'); },
      pattern: function () { return document.createElementNS(SVGNS, 'pattern'); },
      filter: function () { return document.createElementNS(SVGNS, 'filter'); },
      line: function () { return document.createElementNS(SVGNS, 'line'); },
      polyline: function () { return document.createElementNS(SVGNS, 'polyline'); },
      polygon: function () { return document.createElementNS(SVGNS, 'polygon'); },
      rect: function () { return document.createElementNS(SVGNS, 'rect'); },
      ellipse: function () { return document.createElementNS(SVGNS, 'ellipse'); },
      circle: function () { return document.createElementNS(SVGNS, 'circle'); },
      path: function () { return document.createElementNS(SVGNS, 'path'); },
      text: function () { return document.createElementNS(SVGNS, 'text'); },
      tspan: function () { return document.createElementNS(SVGNS, 'tspan'); },
      tref: function () { return document.createElementNS(SVGNS, 'tref'); },
      textPath: function () { return document.createElementNS(SVGNS, 'textPath'); },
      image: function () { return document.createElementNS(SVGNS, 'image'); },
      x: function (name) { return document.createElementNS(SVGNS, name); }
   },
   attr: function (el, key, val) { el.setAttributeNS(null, key, val); return this; }
};

window.SVG = SVG;

})();
