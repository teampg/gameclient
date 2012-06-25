/** @author brodydoescode */

module("GameBoard");


test("Constructor bounds checking.", function (){
    var gb;
    
    // Check bounds of new board.
    try {
        gb = new GameBoard(0, 0);
        ok(false, "GameBoard constructor input must be greater than zero. -- FAIL");
    } catch (e) {
        ok(true, "GameBoard constructor input must be greater than zero.");
    }
    
    try {
        gb = new GameBoard(-1, -1);
        ok(false, "GameBoard constructor input must be greater than zero. -- FAIL");
    } catch (e) {
        ok(true, "GameBoard constructor input must be greater than zero.");
    }
    
    try {
        gb = new GameBoard();
        ok(false, "GameBoard constructor takes two parameters - zero given. -- FAIL");
    } catch (e) {
        ok(true, "GameBoard constructor takes two parameters - zero given.");
    }

    try {
        gb = new GameBoard(1);
        ok(false, "GameBoard constructor takes two parameters - one given. -- FAIL");
    } catch (e) {
        ok(true, "GameBoard constructor takes two parameters - one given.");
    }

    //TODO What about non numeral input?

});


//TODO what should getPlayerName do if type isn't "player"?
test("add/get/removeEntity() single", function () {
    var gb = new GameBoard(2, 2);

    var ent = {"id": 0, "entity_type": "player", "attr": {name: "pizza"}};

    gb.addEntity(ent.id, ent);
    strictEqual(gb.getEntity(ent.id), ent, "getEntity() failed to retrieve entity.");
    strictEqual(gb.getPlayerName(ent.id), "pizza", "getPlayerName() failed to retrieve player name.");
    strictEqual(gb.getEntityType(ent.id), "player", "getEntityType() failed to retrieve entity type.");

    //TODO setPosition
    var twoArraysEqual = function(a1, a2) {
        if (a1.length !== a2.length) {
            return false;
        }
        
        var i;
        
        for (i = 0; i < a1; i++) {
            if (a1[i] !== a2[i]) {
                return false;
            }
        }
        
        return true;
    }

    ok(twoArraysEqual(gb.getPlayerList(), ["pizza"]), "getPlayerList() failed to retrieve the player list.");
    
    gb.removeEntity(ent.id);
    try {
        gb.getEntity(ent.id);
        ok(false, "getEntity() retrieved an entity that was previously removed. -- FAIL");
    } catch (e) {
        ok(true, "getEntity() retrieved an entity that was previously removed.");
    }
    try {
        gb.getPlayerName(ent.id);
        ok(false, "getPlayerName() retrieved a name from an entity that was previously removed. -- FAIL");
    } catch (e) {
        ok(true, "getPlayerName() retrieved a name from an entity that was previously removed.");
    }
    try {
        gb.getEntityType(ent.id);
        ok(false, "getEntityType() retrieved a type from an entity that was previously removed. -- FAIL");
    } catch (e) {
        ok(true, "getEntityType() retrieved a type from an entity that was previously removed.");
    }
   
    ok(twoArraysEqual(gb.getPlayerList(), []), "getPlayerList() retrieved a non empty player list.");
    
    //TODO get at position
});


//TODO test position setting and getting & player list
test("remove entity from middle.", function () {
    var gb, i, ent,
        entities = [],
        REMOVED_INDEX = 1;
    
    gb = new GameBoard(2, 2);
    
    // Set up board.
    for (i = 0; i < 4; i++) {
        ent = {"id": i, "entity_type": "player", "attr": {name: "pizza" + i}};
        entities[i] = ent;

        gb.addEntity(ent.id, ent);

        strictEqual(gb.getEntity(ent.id), ent, "getEntity() failed to retrieve entity.");
        strictEqual(gb.getPlayerName(ent.id), "pizza" + i, "getPlayerName() failed to retrieve player name.");
        strictEqual(gb.getEntityType(ent.id), "player", "getEntityType() failed to retrieve entity type.");
    }

    gb.removeEntity(entities[REMOVED_INDEX].id);
    
    // Check board.
    for (i = 0; i < 4; i++) {
        ent = entities[i];
        
        if (i === REMOVED_INDEX) {

            try {
                gb.getEntity(ent.id);
                ok(false, "getEntity() retrieved an entity that was previously removed. -- FAIL");
            } catch (e) {
                ok(true, "getEntity() retrieved an entity that was previously removed.");
            }
            try {
                gb.getPlayerName(ent.id);
                ok(false, "getPlayerName() retrieved a name from an entity that was previously removed. -- FAIL");
            } catch (e) {
                ok(true, "getPlayerName() retrieved a name from an entity that was previously removed.");
            }
            try {
                gb.getEntityType(ent.id);
                ok(false, "getEntityType() retrieved a type from an entity that was previously removed. -- FAIL");
            } catch (e) {
                ok(true, "getEntityType() retrieved a type from an entity that was previously removed.");
            }

            continue;
        }

        strictEqual(gb.getEntity(ent.id), ent, "getEntity() failed to retrieve entity.");
        strictEqual(gb.getPlayerName(ent.id), "pizza" + i, "getPlayerName() failed to retrieve player name.");
        strictEqual(gb.getEntityType(ent.id), "player", "getEntityType() failed to retrieve entity type.");        
    }

});
//TODO test for change entity attr and placing them over eachother.
//TODO setting position must do bounds checking. throw exception if bad.