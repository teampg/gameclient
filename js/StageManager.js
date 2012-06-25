/**
 * @author brodydoescode
 */

var StageManager = (function () {
    "use strict";

    var MINIMUM_WIDTH = 450,
        MINIMUM_HEIGHT = 300,
        WINDOW_TO_CANVAS_PERCENT = 0.9;

    var StageManager = function (canvas) {
        this.initialize(canvas);
    };

    // Inherit from EsaelJS Stage.
    var p = StageManager.prototype = new Stage();

    p.addStage = function (stage, name) {
        stage.name = name;  // Set stage name for later look up.

        stage.visible = false;

        this.addChild(stage);
    };

    //TODO maybe have regular removeStage(stage) and removeStageByName(name)
    // for all methods.

    p.removeStage = function (name) {
        var stage = this.getStageByName(name);

        this.removeChild(stage);
    };

    p.showStage = function (name) {
        var stage = this.getStageByName(name);
        stage.visible = true;
    };

    p.hideStage = function (name) {
        var stage = this.getStageByName(name);
        stage.visible = false;
    };

    p.getStageByName = function (name) {
        var i, childStage;

        for (i = 0; i < this.getNumChildren(); i++) {
            childStage = this.getChildAt(i);

            if (childStage.name === name) {
                return childStage;
            }
        }

        throw "StageManager.getStageByName() Contains no stage with name:" + name;
    };

    p.resize = function (width, height) {
        if (width < MINIMUM_WIDTH) {
            this.canvas.width = MINIMUM_WIDTH;
        } else {
            this.canvas.width = width * WINDOW_TO_CANVAS_PERCENT;
        }

        if (height < MINIMUM_HEIGHT) {
            this.canvas.height = MINIMUM_HEIGHT;
        } else {
            this.canvas.height = height * WINDOW_TO_CANVAS_PERCENT;
            this.canvas.style.marginTop = ((height - this.canvas.height) / 2) + "px";
        }

        var i, child;
        for (i = 0; i < this.getNumChildren(); i++) {
            child = this.getChildAt(i);

            if (child instanceof ScalableContainer) {
                child.resize(WINDOW_TO_CANVAS_PERCENT);
            }
        }

        this.update();
    };

    // TODO accept params
    p.toDataURL = function () {
        return this.canvas.toDataURL();
    };

    p.toString = function () {
        return "[StageManager (name=" + this.name + ")]";
    };

    return StageManager;

}());