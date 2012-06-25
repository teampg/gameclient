/**
 * @author brodydoescode
 */

var ChatScreen = (function () {
    "use strict";

    var commands = {},
        chatIn = document.getElementById("chatIn"),
        chatInInput = chatIn.children[0],
        chatOut = document.getElementById("chatOut"),
        // TODO Move all skim into own object.
        chatSkim = document.getElementById("chatSkim"),
        SKIM_OVERFLOW = 8,
        SKIM_COUNT = 0,
        appendToSkim = function (str) {
            //TODO This is far to minimum.
            if (SKIM_COUNT === SKIM_OVERFLOW) {
                SKIM_COUNT = 0;
                chatSkim.innerHTML = "";
            }

            SKIM_COUNT++;
            chatSkim.innerHTML += str;
        },
        addBlankToSkim = function () {
            appendToSkim("");
        },
        // Clears skim
        // TODO Loop up proper way to sending parameter to setInterval callback.
        skimTick = setInterval(addBlankToSkim, 1000),
        playerName = "UnnamedPlayer";

    var ChatScreen = function () {

    };

    var p = ChatScreen.prototype = new ScalableContainer();

    p.setPlayerName = function (inPlayerName) {
        playerName = inPlayerName;
    };

    p.out = function (message, speaker) {
        var str = speaker + ": " + message + "<br>";

        chatOut.innerHTML += str;
        chatOut.scrollTop = chatOut.scrollHeight;

        appendToSkim(str);
    };

    // Your chat is showing...
    p.IS_SHOWING = true;

    // TODO stageManager should do this.
    p.show = function () {
        chatOut.style.display = "block";
        chatIn.style.display = "block";
        this.IS_SHOWING = true;
    };

    // TODO stageManager should do this.
    p.hide = function () {
        chatOut.style.display = "none";
        chatIn.style.display = "none";
        this.IS_SHOWING = false;
    };

    p._submitCallback = function () {};

    p.setSubmitCallback = function (callback) {
        this._submitCallback = callback;
    };

    p.submit = function () {
        var cmdResult,
            str = chatInInput.value.trim();

        chatInInput.value = "";

        if (!str) {
            return;
        }

        cmdResult = this._parseCmd(str);

        if (cmdResult.out) {
            this.out(str, playerName);
        }

        if (cmdResult.submit) {
            this._submitCallback(str);
        }
    };

    p.super_resize = p.resize;

    p.resize = function (windowCanvasPercent) {
        p.super_resize();

        // TODO Minimum sizes. Or just set StageManager to never let these get too small.
        // TODO Make pretty.

        var canvas = this.parent.canvas;

        chatOut.style.width = (canvas.width * 3 / 4) + "px";
        chatOut.style.height = (canvas.height / 2) + "px";
        chatOut.style.top = ((canvas.height / 6) + Number(canvas.style.marginTop.replace("px", ""))) + "px";
        chatOut.style.left = ((canvas.width / 6) + ((window.innerWidth - canvas.width) / 2)) + "px";

        chatSkim.style.width = (canvas.width / 2.5) + "px";
        chatSkim.style.height = (canvas.height / 2.5) + "px";
        chatSkim.style.top = canvas.style.marginTop;
        chatSkim.style.left = ((window.innerWidth - canvas.width) / 2) + "px";

        chatIn.style.width = (canvas.width * 0.98) + "px";
        // TODO adjust with padding... JQuery is your friend.
        chatIn.style.top = window.innerHeight - (window.innerHeight - canvas.height) - 4 + "px";
        chatIn.style.left = (((window.innerWidth - canvas.width) / 2) + (canvas.width - (canvas.width * 0.99))) + "px";
    };

    // Commands must always return {"out": boolean, "submit": boolean};
    // to mark if the command invocation should be sent to the output or
    // submitCallback.
    p.registerCommand = function (name, fn) {
        commands[name] = fn;
    };

    p.removeCommand = function (name) {
        delete commands[name];
    };

    p._parseCmdArgs = function (cmd) {
        return cmd.split(" ");
    };

    p._parseCmd = function (cmd) {
        // Not a command.
        if (cmd.charAt(0) !== "/") {
            return {"out": true, "submit": true};
        }

        // Remove '/' character.
        var args = this._parseCmdArgs(cmd),
            name = args[0].substring(1);

        if (commands.hasOwnProperty(name)) {
            return commands[name].apply(this, args);
        }

        // Print mal-typed commands.
        return {"out": true, "submit": true};
    };

    p.clearOutput = function () {
        chatOut.innerHTML = "";
    };

    return ChatScreen;

}());