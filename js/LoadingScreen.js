/**
 * @author brodydoescode
 */

var LoadingScreen = (function () {
    "use strict";

    var loadingProgressText;

    var LoadingScreen = function () {
        this.initialize();
    };

    var p = LoadingScreen.prototype = new ScalableContainer();

    p.super_initialize = p.initialize;

    p.initialize = function () {
        this.super_initialize();

        // TODO lineheight & regY

        var titleText = new Text("Socket To The Zombies!", "46px bold Arial", "#000");
        titleText.regX = titleText.getMeasuredWidth() / 2;
        titleText.regY = titleText.getMeasuredLineHeight() / 2;
        titleText.percentX = 50;
        titleText.percentY = 45;
        this.addChild(titleText);

        loadingProgressText = new Text("Loading 0%", "26px bold Arial", "#000");
        loadingProgressText.regX = loadingProgressText.getMeasuredWidth() / 2;
        loadingProgressText.percentX = 50;
        loadingProgressText.percentY = 65;
        this.addChild(loadingProgressText);

        var loadingMoverText = new Text("", "52px bold Arial", "#000");
        loadingMoverText.regX = loadingMoverText.getMeasuredWidth() / 2;
        loadingMoverText.percentX = 50;
        loadingMoverText.percentY = 50;
        loadingMoverText.tickCount = 0;
        loadingMoverText.onTick = function () {
            if (this.tickCount >= 40) {
                this.tickCount = 0;
                this.text = "";
                return;
            }

            if ((this.tickCount % 10) === 0) {
                this.text += ".";
                this.regX = this.getMeasuredWidth() / 2;
            }

            this.tickCount++;
        };
        this.addChild(loadingMoverText);
    };

    p.setLoadingProgress = function (percentComplete) {
        loadingProgressText.text = "Loading " + percentComplete + "%";
        loadingProgressText.regX = loadingProgressText.getMeasuredWidth() / 2;
    };

    p.toString = function () {
        return "[LoadingScreen (name=" + this.name + ")]";
    };

    return LoadingScreen;

}());