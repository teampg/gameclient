/**
 * @author brodydoescode
 */

var ScalableContainer = (function () {
    "use strict";

    var ScalableContainer = function () {
        this.initialize();  // super
    };
    var p = ScalableContainer.prototype = new Container();


    p._adjustPosition = function (child) {
        //TODO Return if this.parent.canvas is not yet defined.

        if (child.percentX) {
            child.x = this.parent.canvas.width  * (child.percentX / 100);
        }
        if (child.percentY) {
            child.y = this.parent.canvas.height * (child.percentY / 100);
        }

        //TODO
        // Add scaling options.
        // Add end X and end Y points.
    };


    p.resize = function () {
        this.children.forEach(function (child) {
            this._adjustPosition(child);
        }, this);
    };


    p.toString = function () {
        return "[ScalableContainer (name:" + this.name + ")]";
    };

    return ScalableContainer;

}());