/**
 * @author brodydoescode
 */

var GameScreen = (function () {
    "use strict";

    var spriteMap, spriteSheet,
        map = new Container(),
        BLOCK_SIZE = 20,
        SPRITE_SIZE = 20;

    function scaleSprite(sprite) {
        sprite.scaleX = BLOCK_SIZE / SPRITE_SIZE;
        sprite.scaleY = BLOCK_SIZE / SPRITE_SIZE;
    }

    spriteMap = Object.freeze({
        "wall"              : "wall",
        "grass"             : "grass",
        "player"            : "pizzaPal_Orange",
        "opponent"          : "pizzaPal_Green",
        "spawn_shrine"      : "oven",
        "wanderer"          : "flamingo",
        "enemy"             : "slime_face",
        "pushable_block"    : "pushable_block",
        "bullet"            : "bullet",
        "corpse"            : "poop",
        "enemy_spawner"     : "slime_bucket"
    });

    spriteSheet = new SpriteSheet({
        images: ["assets/sprites.png"],
        frames: {width: SPRITE_SIZE, height: SPRITE_SIZE},
        animations: {
            pizza: 0,
            wall: 1,
            flamingo: 2,
            grass: 3,
            pizzaPal_Orange: 4,
            pizzaPal_Green: 5,
            wholePizza_minusSlice: 6,
            palmTree: 7,
            oven: 8,
            burntSlice: 9,
            slime_face: 10,
            pushable_block: 11,
            bullet: 12,
            poop: 13,
            slime_bucket: 14
        }
    });


    var GameScreen = function () {
        // TODO add Icon for chat and options.
        //        this.initialize();
    };
    var p = GameScreen.prototype = new ScalableContainer();



    p.newMap = function (newX, newY) {
        var i, j, grass,
            canvas = this.parent.canvas;

        if (newX > canvas.width || newY > canvas.height) {
            throw "GameScreen.newMap(): The map is bigger than the canvas. This is not yet supported.";
        }

        map.regX = newX * BLOCK_SIZE / 2;
        map.regY = newY * BLOCK_SIZE / 2;
        map.percentX = 50;
        map.percentY = 50;

        grass = new BitmapAnimation(spriteSheet);

        for (i = 0; i < newX; i++) {
            for (j = 0; j < newY; j++) {
                grass = grass.clone();
                grass.gotoAndStop("grass");

                scaleSprite(grass);
                grass.x = i * BLOCK_SIZE;
                grass.y = j * BLOCK_SIZE;

                map.addChild(grass);
            }
        }

        this.addChild(map);

    };

    p.addEntity = function (type) {
        var sprite = new BitmapAnimation(spriteSheet),
            image  = spriteMap[type];

        if (!image) {
            throw "GameScreen.addEntity(): Unknown key for spriteMap: " + type;
        }

        scaleSprite(sprite);
        sprite.gotoAndStop(image);
        map.addChild(sprite);

        return sprite;
    };

    p.getBlockSize = function () {
        return BLOCK_SIZE;
    };

    return GameScreen;

}());
