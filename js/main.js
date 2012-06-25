(function () {
    // TODO add "use strict"; Just check that it doesn't break anything.

/**
 * @author brodydoescode
 */

function ActionIDCounter() {
	"use strict";

	var id = 1;	// Must start greater than zero

	this.get = function () {
		return id++;
	};
}
// The server needs this for some actions. Client does nothing with it.
var ACT_ID = new ActionIDCounter();

var HOST_SERVER = "ws://localhost:9252";

var Player;

var GameStates = Object.freeze({
	"INIT"					: "INIT",
	"PRELOAD"				: "PRELOAD",
	"CONNECTING"			: "CONNECTING",
	"UNJOINED"				: "UNJOINED",
	"JOINED"				: "JOINED",
	"PLAYING_CHAT_FOCUSED"	: "PLAYING_CHAT_FOCUSED",
	"PLAYING_GAME_FOCUSED"	: "PLAYING_GAME_FOCUSED",
	"DISCONNECTED"			: "DISCONNECTED"
});

var stageManager;
var chatScreen;
var gameScreen;

var IS_CHAT_FOCUSED;


var IS_DEBUGGING = false;

var GAME_STATE;	// Game state.

var Socket;		// Connection to server.
var Board;		// Store entities and their attributes.
var PreloadQueue;

var ActiveSounds = [];

var PRELOAD_MANIFEST = [
	{"src": "assets/welcome.ogg", "id": "welcome"},
	{"src": "assets/squawk-bird1.ogg", "id": "squawk1"}
];

var Canvas;

var ChatIn;	// For checking focus of chatin vs. game (body). //-

var PLAYER_MOVEMENT = false;
var PLAYER_MOVE_RATE = 100;
var REVERSE_BULLETS = false;

function movePlayer(x, y) {
	"use strict";

	Socket.send(
		JSON.stringify({
			"type": "move",
			"act_id": ACT_ID.get(),
			"params": {
				"x_vector": x,
				"y_vector": y
			}
		})
	);
}


function playerMoveLoop() {
	"use strict";

	if ((Player.getMoveX() === 0) && (Player.getMoveY() === 0)) {
		return;
	}

	movePlayer(Player.getMoveX(), Player.getMoveY());
}

function playerShoot() {
	"use strict";

	var x = Player.getLastX(),
		y = Player.getLastY();

	if (REVERSE_BULLETS) {
		x *= -1;
		y *= -1;
	}

	Socket.send(
		JSON.stringify({
			"type": "shoot",
			"act_id": ACT_ID.get(),
			"params": {
				"x_vector": x,
				"y_vector": y
			}
		})
	);
}

function keyPressGame(e) {
	"use strict";

	e = e || window.event;

	var unicode = e.charCode || e.keyCode,
		key = String.fromCharCode(unicode);

	if (key === '`' || key === '~') {
		chatScreen.show();
		return true;
	}
	if (unicode === 32) {	// Spacebar
		playerShoot();
		return false;
	}

	return true;
}


function keyDownGame(e) {
	"use strict";

	e = e || window.event;

	var unicode = e.charCode || e.keyCode,
		key = String.fromCharCode(unicode);

	if (key === 'w' || key === 'W' || unicode === 38) { // Uparrow
		movePlayer(0, 1);
		Player.setMove(0, 1);
		return false;
	}
	if (key === 's' || key === 'S' || unicode === 40) { // Downarrow
		movePlayer(0, -1);
		Player.setMove(0, -1);
		return false;
	}
	if (key === 'a' || key === 'A' || unicode === 37) { // Leftarrow
		movePlayer(-1, 0);
		Player.setMove(-1, 0);
		return false;
	}
	if (key === 'd' || key === 'D' || unicode === 39) { // Rightarrow
		movePlayer(1, 0);
		Player.setMove(1, 0);
		return false;
	}

	if (unicode === 16) {	// Shift
		REVERSE_BULLETS = true;
	}

	return true;
}

function keyUpGame(e) {
	"use strict";

	e = e || window.event;

	var unicode = e.charCode || e.keyCode,
		key = String.fromCharCode(unicode);

	if (key === 'w' || key === 'W' || unicode === 38) { // Uparrow
		Player.setMove(0, 0);
		return false;
	}
	if (key === 's' || key === 'S' || unicode === 40) { // Downarrow
		Player.setMove(0, 0);
		return false;
	}
	if (key === 'a' || key === 'A' || unicode === 37) { // Leftarrow
		Player.setMove(0, 0);
		return false;
	}
	if (key === 'd' || key === 'D' || unicode === 39) { // Rightarrow
		Player.setMove(0, 0);
		return false;
	}

	if (unicode === 16) {	// Shift
		REVERSE_BULLETS = false;
	}

	return true;
}



function keyPressChat(e) {
	"use strict";

	e = e || window.event;

	var unicode = e.charCode || e.keyCode,
		key = String.fromCharCode(unicode);

	if (key === "`" || key === "~") {
		e.preventDefault();
		chatScreen.hide();
		return;
	}
	if (e.keyCode === 13) {
		e.preventDefault();
		chatScreen.submit();
		return;
	}
}


function sendChat(message) {
	"use strict";

	Socket.send(
		JSON.stringify({
			"type": "say",
			"act_id": ACT_ID.get(),
			"params": {
				"text": message
			}
		})
	);
}


function removeSpriteFromBoard(update) {
	var entityToRemove = Board.getAtPosition({"x": update.x, "y": update.y});

	entityToRemove.id = undefined;

	if (!entityToRemove.image) {
//		console.log("entityToRemove.image is falsy.", entityToRemove);
		return;
	}
	entityToRemove.image.parent.removeChild(entityToRemove.image);
	entityToRemove.image = undefined;
}

function boardChanges(results) {
	"use strict";

	var update, key, section, entityAttr, entityImage;

	section = results.board_changes;
	for (key in section) {
		if (!section.hasOwnProperty(key)) {
			continue;
		}

		update = section[key];

//		console.log("board_change received. ", update);

		// Add "empty" by removing sprite.
		if (Board.getEntityType(update.entity_id) === "empty") {
			removeSpriteFromBoard(update);
			continue;
		}

		var entityAtPos = Board.getAtPosition({"x": update.x, "y": update.y});

		if (!Util.isEmpty(entityAtPos)) {
			removeSpriteFromBoard(update);
		}

		//- Uber hack.
		entityAttr = Board.getEntity(update.entity_id);

		if (!entityAttr) {
			console.log("ERROR: Couldn't get entityAttr.", update);
			continue;
		}

		if (entityAttr.entity_type === "player" && entityAttr.id !== Player.getId()) {
			entityAttr.entity_type = "opponent";
		}

//		try {
//			entityImage = oldGameStage.addEntity(entityAttr.entity_type);
//		} catch (e) {
//			console.log(e, "entityAttr: ", entityAttr);
//			continue;
//		}
		entityImage = gameScreen.addEntity(entityAttr.entity_type);

        // Hacky. This should be hidden away. And GameScreen.getBlockSize() should be removed or be private.
		entityImage.x = update.x * gameScreen.getBlockSize();
		entityImage.y = update.y * gameScreen.getBlockSize();

		Board.setPosition(
			{"id": update.entity_id, "image": entityImage},
			{"x": update.x, "y": update.y}
		);

//		console.log("board_change completed properly.");
	}
}




function onMessage(event) {
	"use strict";

	var updateKey, update, results, entityAttr, entityImage,
		key, section, i, length, name;

	try {
		results = JSON.parse(event.data);
	} catch (e) {
		console.log(e, " ", event.data);
	}


//	console.log(results);

	/* new_board */
	if (!Util.isEmpty(results.new_board)) {
		if (Board instanceof GameBoard) {
			throw "ERROR: new_board may only be received once.";
		}

		update = results.new_board;

//		console.log("new_board received: ", update);

		Board = new GameBoard(update.width, update.height);

		stageManager.getStageByName("gameScreen").newMap(update.width, update.height);
		// Adjust position of map.
        stageManager.resize(window.innerWidth, window.innerHeight);
	}


	/* action_changes */
	section = results.action_changes;
	length = section.length;

	for (i = 0; i < length; i++) {
		update = section[i];

		if (update.type === "join") {
//			console.log("Joined with id: " + update.attr.avatar, " ", update);

			Player.setId(update.attr.avatar);
			Player.setName(update.attr.name);
			chatScreen.setPlayerName(update.attr.name);
			chatScreen.out("Welcome, " + update.attr.name + ".", "Console");
			chatScreen.setSubmitCallback(sendChat);

            /////////////////////////////////////
			//  IMPORTANT: Changes GAME_STATE  //
			/////////////////////////////////////
			GAME_STATE = GameStates.JOINED;
			continue;
		}

		console.log("Unknown action_changes.type: ", update);
		throw "Unknown action_changes.type";
	}


//TODO not yet fully  tested.
	//remove_entity_changes
	section = results.remove_entity_changes;
	length = section.length;

	for (i = 0; i < length; i++) {
		update = section[i];

//		console.log("remove_entity_changes received: ", update);

		var entityType = Board.getEntityType(update.id);

		if (entityType === "player" || entityType === "opponent") {
			name = Board.getPlayerName(update.id);
			chatScreen.out(name + " has left.", "Console");
		}

		var entityToRemove = Board.getEntity(update.id);
//		console.log("remove_entity_changes: Entity to remove:", entityToRemove);

		Board.removeEntity(update.id);
	}


	/* add_entity_changes */
	section = results.add_entity_changes;
	length = section.length;

	for (i = 0; i < length; i++) {
		update = section[i];

//		console.log("add_entity received. ", update);

		Board.addEntity(update.id, update);

		if (update.entity_type === "player" && update.id !== Player.getId()) {
			chatScreen.out(update.attr.name + " is playing.", "Console");
		}
	}

	/* entity_changes */
	section = results.entity_changes;
	length = section.length;

	for (i = 0; i < length; i++) {
		update = section[i];

		console.log("ERROR: entity_changes not yet implemented.", update);
		throw "ERROR: entity_changes not yet implemented.";
	}

	/* board_changes */
	boardChanges(results);

	/* received_messages */
	section = results.received_messages;
	length = section.length;

	for (i = 0; i < length; i++) {
		update = section[i];
		chatScreen.out(update.text, Board.getPlayerName(update.from));
	}
}




function gameLoop() {
	"use strict";

	// Socket readyStates: CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3
	switch (GAME_STATE) {

	case undefined:
		// Catches when GAME_STATE = GameStates.propertyItDoesNotHave and
		// there is a case that is GameStates.anyPropertyItDoesNotHave.
		throw "ERROR: Game state is undefined.";

	case GameStates.INIT:
        chatScreen.out("Connecting to server...", "Console");
        chatScreen.show();
        
		GAME_STATE = GameStates.PRELOAD;
		break;

	case GameStates.PRELOAD:
		// Add isLoaded property myself. Because 'load' didn't work.
		if (PreloadQueue.isLoaded) {		// and SoundJS.isReady/////////////////////////////////////////////////////////////////
			stageManager.hideStage("loadingScreen");
            stageManager.showStage("introScreen");

			var welcomeMusic = SoundJS.play("welcome", SoundJS.INTERRUPT_ANY, 0, 0, -1, 0.7, 0);
			welcomeMusic.uniqueId = "welcomeMusic";
			ActiveSounds["welcomeMusic"] = welcomeMusic;

			GAME_STATE = GameStates.CONNECTING;
		}

		break;

	case GameStates.CONNECTING:
		// CLOSING or CLOSED
		if (Socket.readyState === 2 || Socket.readyState === 3) {
            chatScreen.out("Could not connect to server.", "Console");
			GAME_STATE = GameStates.DISCONNECTED;
			break;
		}

		if (Socket.readyState === 1) {
			chatScreen.out("Connected to server.", "Console");
			chatScreen.out("Enter your name:",     "Console");

			chatScreen.setSubmitCallback(function (playerName) {
				playerName = playerName.trim().replace(/\s+/g, '_');

                // TODO Pretty sure the server does this now.
				if (playerName.toLowerCase() === "console") {
					playerName = "Asshat";
				}

				Socket.send(
					JSON.stringify({
						"type": "join",
						"act_id": ACT_ID.get(),
						"params": {
							"name": playerName
						}    // // Set game loop.
    // oldGameStage.addOnTickListener(gameLoop);
					})
				);

                // Only send the name once.
				chatScreen.setSubmitCallback(function () {});
			});

			GAME_STATE = GameStates.UNJOINED;
		}
		break;

	case GameStates.UNJOINED:
		// CLOSING or CLOSED
		if (Socket.readyState === 2 || Socket.readyState === 3) {
			chatScreen.out("Disconnected from server.", "Console");
			GAME_STATE = GameStates.DISCONNECTED;
			break;
		}

    	// Maybe GameBoard can have a .isJoined property.
    
    	/////////////////
    	//  IMPORTANT  //
        /////////////////
    	// onMessage()->ActionChange->join
    	// Sets: GAME_STATE = GameStates.JOINED;
		break;

	case GameStates.JOINED:
		// Stop welcome music here.
		ActiveSounds["welcomeMusic"].stop();

        stageManager.hideStage("introScreen");
        stageManager.showStage("gameScreen");

		chatScreen.out("Press ` or click on the game/chat window to change focus. Type /help for help.", "Console");

		GAME_STATE = GameStates.PLAYING_CHAT_FOCUSED;

		break;

	case GameStates.PLAYING_CHAT_FOCUSED:
		if (Socket.readyState === 2 || Socket.readyState === 3) {
			chatScreen.out("Disconnected from server.", "Console");
			GAME_STATE = GameStates.DISCONNECTED;
			break;
		}

        if (!chatScreen.IS_SHOWING) {
			document.onkeypress = keyPressGame;
			document.onkeydown = keyDownGame;
			document.onkeyup = keyUpGame;

			GAME_STATE = GameStates.PLAYING_GAME_FOCUSED;
		}

		break;

	case GameStates.PLAYING_GAME_FOCUSED:
		if (Socket.readyState === 2 || Socket.readyState === 3) {
			Chat.out("Disconnected from server.", "Console");
			GAME_STATE = GameStates.DISCONNECTED;
			break;
		}


		if (chatScreen.IS_SHOWING) {
			document.onkeypress = keyPressChat;
			document.onkeydown = null;
			document.onkeyup = null;

			GAME_STATE = GameStates.PLAYING_CHAT_FOCUSED;
		}

		break;

	case GameStates.DISCONNECTED:
		// Maybe try to reconnect.
		break;

	default:
        throw "Unknown game state \"" + GAME_STATE + "\"";
	}

    stageManager.update();


    if (IS_DEBUGGING) {
        stageManager.getStageByName("debugScreen").setText(
            "FPS: " + Ticker.getMeasuredFPS().toFixed(2) + "\n" +
            "GAME_STATE: " + GAME_STATE
        );
    } else {
        stageManager.getStageByName("debugScreen").setText(
            "FPS: " + Ticker.getMeasuredFPS().toFixed(2)
        );
    }

	/***** DEBUGGING *****/
	// if (IS_DEBUGGING) {
		// var focus;
		// if (document.activeElement === ChatIn) {
			// focus = "chatIn";
		// } else {
			// focus = "body";
		// }
// 
		// document.getElementById("debug").innerHTML = "FPS: " + oldGameStage.getFPS()
			// + "<br>Focus: "		+ focus
			// + "<br>GAME_STATE: "	+ GAME_STATE
			// + "<br>Player move x:" + Player.getMoveX() + ", y:" + Player.getMoveY()
			// + "<br>Player last x:" + Player.getLastX() + ", y:" + Player.getLastY()
			// + "<br>Player id:"	+ Player.getId() + ", name:" + Player.getName();
	// }
}


function playSound(soundId) {
	"use strict";
	var instance = SoundJS.play(soundId, SoundJS.INTERRUPT_ANY, 0, 0, 0, 1, 0);

	instance.onPlayFailed = function () {
		console.log("Sound failed: " + this);
	};
}


/**
 * Initialize game.
 */
window.onload = function () {
	"use strict";

	// Initialize Globals
	GAME_STATE = GameStates.INIT;

	Player = new GamePlayer();

	Socket = new WebSocket(HOST_SERVER);

	Canvas = document.getElementById("gameCanvas");
	ChatIn = document.getElementById("chatIn");


/******************************************************************************/

    gameScreen = new GameScreen();
    chatScreen = new ChatScreen();
    // Chat components are visible by default.

    stageManager = new StageManager(Canvas);

    stageManager.addStage(new LoadingScreen(), "loadingScreen");
    stageManager.addStage(new IntroScreen(), "introScreen");
    stageManager.addStage(new GameScreen(), "gameScreen");
    stageManager.addStage(chatScreen, "chatScreen");
    stageManager.addStage(new DebugScreen(), "debugScreen");

    stageManager.showStage("loadingScreen");
    stageManager.showStage("debugScreen");

    // Adjusts everything initially and calls update().
    stageManager.resize(window.innerWidth, window.innerHeight);

    // TODO Change to addListener because it plays nicer.
    window.onresize = function () {
        stageManager.resize(window.innerWidth, window.innerHeight);
    };

    PreloadQueue = new PreloadJS();
    PreloadQueue.installPlugin(SoundJS);
    PreloadQueue.onFileError = function (event) {
        console.log("ERROR: File load error.", event);
    };
    PreloadQueue.onProgress = function () {
        var progressPercent = this.progress.toFixed(2) * 100;

        stageManager.getStageByName("loadingScreen").setLoadingProgress(progressPercent);
        console.log("Loading: " + progressPercent + "%");
    };
    PreloadQueue.onComplete = function () {
        // TODO Use this newly added property
        PreloadQueue.isLoaded = true;        // I added this property myself

        console.log("Loading complete.");
    };
    PreloadQueue.loadManifest(PRELOAD_MANIFEST, true);

    Socket.onopen = function (event) {
        console.log("Connected to server.");
    };
    Socket.onmessage = function (event) {
        onMessage(event);
    };
    Socket.onerror = function (event) {
        console.log("Websocket error: ", event);
    };
    Socket.onclose = function (event) {
        console.log("Disconnected from server. Code:", event.code,
            " | Reason: ",  event.reason, " | wasClean:", event.wasClean);
    };


    Ticker.addListener(gameLoop);

    // Set player movement loop.
    PLAYER_MOVEMENT = setInterval(playerMoveLoop, PLAYER_MOVE_RATE);


	// Setting up event listeners.
	document.onkeypress = keyPressChat;


	// Register commands.
	// Chat.registerCommand("clear", function () {
		// Chat._output.value = "";
		// return {"out": false, "submit": false};
	// });
// 
	// Chat.registerCommand("part", function () {
		// var args, partingMessage, messageIndex;
// 		
		// args = Array.prototype.slice.call(arguments);
		// Chat.out(args.join(" "), Player.getName());
// 
		// Socket.close();
// 
        // partingMessage = [
            // "Zombies, they come.",
            // "You didn't socket it to them.",
            // "HTML5 rules.",
            // "BRRRAAAAAIIINS"
        // ];
// 
        // messageIndex = Math.randomIntRange(0, partingMessage.lno canvas yetength - 1);
// 
		// Chat.out("You have left the game. " + partingMessage[messageIndex], "Console");
// 
		// return {"out": false, "submit": false};
	// });
// 
	// Chat.registerCommand("playerlist", function () {
        // var playerList,
            // args = Array.prototype.slice.call(arguments);
// 
		// // If not joined, can't show player list.
        // if (!(Board instanceof GameBoard)) {
            // Chat.out(args.join(" "), Player.getName());
            // Chat.out("You must join the game to view the player list.", "Players:")
            // return {"out": false, "submit": false};
        // }
// 
		// playerList = Board.getPlayerList();	
// 
        // Chat.out(args.join(" "), Player.getName());
		// Chat.out(playerList.join(", "), "Players");
// 
        // return {"out": false, "submit": false};
	// });
// 
	// Chat.registerCommand("mute", function () {
		// if (this.isMuted) {
			// SoundJS.setMute(false);
			// this.isMuted = false;
// 
		// } else {
			// SoundJS.setMute(true);
			// this.isMuted = true;
		// }
// 
		// return {"out": true, "submit": false};
	// });
// 
	// Chat.registerCommand("volume", function () {
		// var args = Array.prototype.slice.call(arguments),
			// volume;
// 
		// if (arguments.length < 2) {
			// Chat.out(args.join(" "), Player.getName());
			// Chat// 
    // document.getElementById("chatOut").onfocus = function () {   //- Tres hacky.
        // Chat.focus();
    // };.out("/volume requires a level. Try: /volume <level>", "Console");
			// return {"out": false, "submit": false};
		// }
		// volume = arguments[1];
		// if (volume < 0 || volume > 1) {
			// Chat.out(args.join(" "), Player.getName());
			// Chat.out("Level must range from 0 - 1.", "Console");
			// return {"out": false, "submit": false};
		// }
// 
		// SoundJS.setMasterVolume(volume);
		// return {"out": true, "submit": false};
	// });
// 	
	// Chat.registerCommand("credits", function () {
        // var args, credits;
//         
        // args = Array.prototype.slice.call(arguments);
        // Chat.out(args.join(" "), Player.getName());
//         
        // credits = "Team Pizza Gut:\n  JustChin\n  JWill\n  BrodyDoesCode"
        // Chat.out(credits, "A game by"); 
// 
        // return {"out": false, "submit": false};
	// });
// 	
	// Chat.registerCommand("help", function () {
	    // var args, help;
// 	    
	    // args = Array.prototype.slice.call(arguments);
        // Chat.out(args.join(" "), Player.getName());
// 	    
	    // help = "\n" +
	       // "  /help        Help\n" +
	       // "  /clear       Clear chat window\n" +
	       // "  /// 
    // document.getElementById("chatOut").onfocus = function () {   //- Tres hacky.
        // Chat.focus();
    // };mute        Mute all sounds\n" +
	       // "  /volume X    Adjust volume where 0 <= X =< 1\n" +
	       // "  /playerlist  List all connected players\n" +
	       // "  /part        Disconnect from server\n" +
	       // "  /credits     Development credits";
	    // Chat.out(help, "Help");
// 	    
	    // return {"out": false, "submit": false};
	// });
// 
	// // Easter eggs :) Shhh. Don't tell.
	// Chat.registerCommand("twitchy", function () {
		// if (this.isTwitching) {
			// oldGameStage.removeBackground();
			// this.isTwitching = false;
// 
		// } else {
			// oldGameStage.setBackground("assets/red-background.png", function () {
				// if (this.visible) {
					// this.visible = false;
				// } else {
					// this.visible = true;
				// }
			// });
// 
			// this.isTwitching = true;
		// }
// 
		// return {"out": true, "submit": false};
	// });

	// Chat.registerCommand("birdy", function () {
		// playSound("squawk1");
		// oldGameStage.birdybird();
		// return {"out": true, "submit": false};no canvas yet
	// });
//
//
	// /***** DEBUGGING *****/
	// Chat.registerCommand("debug", function () {
		// if (IS_DEBUGGING) {
			// IS_DEBUGGING = false;
			// document.getElementById("debug").innerHTML = "";
		// } else {
			// IS_DEBUGGING = true;
		// }
		// return {"out": true, "submit": false};
	// });

};

}());