/**
 * Copyright brodydoescode 2012
 */

var IntroScreen = (function () {
    "use strict";

    var IntroScreen = function () {
        this.initialize();
    };

    var p = IntroScreen.prototype = new ScalableContainer();

    p.super_initialize = p.initialize;

    p.initialize = function () {
        this.super_initialize();

        // TODO lineheight & regY

        var titleForgroundText = new Text("Socket To The Zombies!", "46px bold Arial", "#000");
        titleForgroundText.regX = titleForgroundText.getMeasuredWidth() / 2;
        titleForgroundText.percentX = 50;
        titleForgroundText.percentY = 50;
        titleForgroundText.alpha = 1;
        titleForgroundText.alphaDirection = 1;
        titleForgroundText.onTick = function () {
            if (this.alpha >= 1 || this.alpha <= 0.5) {
                this.alphaDirection *= -1;
            }

            this.alpha -= 0.05 * this.alphaDirection;
        };
        this.addChild(titleForgroundText);

        var titleBackgroundText = new Text("Socket To The Zombies!", "46px bold Arial", "#F00");
        titleBackgroundText.regX = titleBackgroundText.getMeasuredWidth() / 2;
        titleBackgroundText.percentX = 50.2;
        titleBackgroundText.percentY = 50.2;
        titleBackgroundText.alpha = 0.7;
        titleBackgroundText.alphaDirection = 1;
        titleBackgroundText.onTick = function () {
            if (this.alpha >= 1 || this.alpha <= 0.5) {
                this.alphaDirection *= -1;
            }
            this.alpha += 0.02 * this.alphaDirection;
        };
        this.addChildAt(titleBackgroundText, 0);
    };

    return IntroScreen;

}());
