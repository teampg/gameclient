/**
 * @author brodydoescode
 */

var GamePlayer = (function () {
    "use strict";

    var _id, _name, _moveX, _moveY, _lastMoveX, _lastMoveY;

    var Player = function () {
        _id = undefined;
        _name = "UnnamedPlayer";
        _moveX = 0;
        _moveY = 0;
        _lastMoveX = 1;
        _lastMoveY = 0;
    };

    Player.prototype.setId = function (newId) {
        _id = newId;
    };

    Player.prototype.getId = function () {
        return _id;
    };

    Player.prototype.setName = function (newName) {
        _name = newName;
    };

    Player.prototype.getName = function () {
        return _name;
    };

    Player.prototype.setMove = function (newX, newY) {
        //_lastMoveX/Y must always be last non-zero vector.
        if (newX === 0 && newY === 0) {
            _lastMoveX = _moveX;
            _lastMoveY = _moveY;
        } else {
            _lastMoveX = newX;
            _lastMoveY = newY;
        }

        _moveX = newX;
        _moveY = newY;
    };

    Player.prototype.getMoveX = function () {
        return _moveX;
    };

    Player.prototype.getMoveY = function () {
        return _moveY;
    };

    Player.prototype.getLastX = function () {
        return _lastMoveX;
    };

    Player.prototype.getLastY = function () {
        return _lastMoveY;
    };

    return Player;

}());