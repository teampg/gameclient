/**
 * @author brodydoescode
 */

var DebugScreen = (function () {
    "use strict";

    var debugText;

    var DebugScreen = function () {
        this.initialize();
    };

    var p = DebugScreen.prototype = new ScalableContainer();

    p.initialize = function () {
        debugText = new Text("", "10px bold Arial", "#000");
        debugText.percentX = 100;
        debugText.percentY = 3;
        this.addChild(debugText);
    };

    p.clear = function () {
        debugText.text = "";
    };

    p.setText = function (text) {
        debugText.text = text + " ";
        //TODO This is slow.
        debugText.regX = debugText.getMeasuredWidth();
    };

    return DebugScreen;

}());