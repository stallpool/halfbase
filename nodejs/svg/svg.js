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
   g: function () { return document.createElementNS(SVGNS, 'g'); },
   defs: function () { return document.createElementNS(SVGNS, 'defs'); },
   linearGradient: function () { return document.createElementNS(SVGNS, 'linearGradient'); },
   stop: function () { return document.createElementNS(SVGNS, 'stop'); },
   animateMotion: function () { return document.createElementNS(SVGNS, 'animateMotion'); },
   textPath: function () { return document.createElementNS(SVGNS, 'textPath'); },
   rect: function () { return document.createElementNS(SVGNS, 'rect'); },
   circle: function () { return document.createElementNS(SVGNS, 'circle'); },
   path: function () { return document.createElementNS(SVGNS, 'path'); },
   text: function () { return document.createElementNS(SVGNS, 'text'); },
   attr: function (el, key, val) { el.setAttributeNS(null, key, val); return this; }
};

window.SVG = SVG;

})();
