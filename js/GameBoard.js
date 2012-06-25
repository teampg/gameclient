/**
 * @author brodydoescode
 */

var GameBoard = (function () {
    "use strict";

    var _boardX, _boardY,
        _board = {},
        _entityDefinitions = [];

    function _isNumber(value) {
        return typeof value === 'number' && isFinite(value);
    }

    var GameBoard = function (inBoardX, inBoardY) {
        if (!_isNumber(inBoardX) || !_isNumber(inBoardY)
                || inBoardX <= 0 || inBoardY <= 0) {
            throw "GameBoard takes to integers > 0.";
        }

        var i, j;

        for (i = 0; i < inBoardX; i++) {
            _board[i] = [];

            for (j = 0; j < inBoardY; j++) {
                _board[i][j] = {
                    id: undefined,
                    stageEntity: undefined
                };
            }
        }

        _boardX = inBoardX;
        _boardY = inBoardY;
    };

    GameBoard.prototype.addEntity = function (entityID, attributes) {
        _entityDefinitions[entityID] = attributes;
    };

    GameBoard.prototype.getEntity = function (entityID) {
        var entity = _entityDefinitions[entityID];

        if (!entity) {
            throw "ERROR: GameBoard.getEntity(). Entity does not exist. id=" + entityID;
        }

        return entity;
    };

    GameBoard.prototype.removeEntity = function (entityID) {
        _entityDefinitions[entityID] = undefined;
    };

    GameBoard.prototype.getEntityType = function (id) {
        var entity = _entityDefinitions[id];

        if (!entity) {
            throw "ERROR: GameBoard.getEntityType(). Entity id does not exist. id=" + id;
        }

        return entity.entity_type;
    };

    GameBoard.prototype.setPosition = function (entity, position) {
        _board[position.x][position.y] = entity;
    };

    GameBoard.prototype.getAtPosition = function (position) {
        var entity = _board[position.x][position.y];

        if (!entity) {
            throw "ERROR: GameBoard.getAtPosition(). Entity at position does not exist. x:" + position.x + " | y: " + position.y;
        }

        return entity;
    };

    GameBoard.prototype.getPlayerName = function (id) {
        var entity = _entityDefinitions[id];

        if (!entity) {
            throw "ERROR: GameBoard.getPlayerName(). Entity does not exist. id=" + id;
        }

        return entity.attr.name;
    };

    GameBoard.prototype.getPlayerList = function () {
        var entityKey, entity, playerList = [];

        for (entityKey in _entityDefinitions) {
            if (_entityDefinitions.hasOwnProperty(entityKey)) {
                entity = _entityDefinitions[entityKey];

                if (entity && (entity.entity_type === "player" || entity.entity_type === "opponent")) {
                    playerList.push(entity.attr.name);
                }
            }
        }

        return playerList;
    };

    return GameBoard;

}());