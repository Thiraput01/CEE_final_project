import { updateInstance, getInstance } from "./api.js";
import { BACKEND_URL } from "./config.js";

const params = new URLSearchParams(window.location.search);
const roomId = params.get("roomId");
const userId = params.get("userId");

let game, lastFetchTime, fetchInterval;
if (!roomId) {
  alert("No room id provided.");
} else if (!userId) {
  alert("No player id provided.");
} else {
  // Phaser Game
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: true,
      },
    },
    scene: {
      preload,
      create,
      update,
    },

    scale: {
      mode: Phaser.Scale.FIT,
      parent: 'game-container',
    } 
  };
  game = new Phaser.Game(config);
  lastFetchTime = 0;
  fetchInterval = 5000; // Fetch data every 5 seconds
}

let background;
let boundary;
let obstacles;
let levelData;
let myPlayer;
let players = {};
let turnIndex = new Array(4);
let hole;
let arrow = null;
let mode = 1;
let currentLevel = 1;
let angle;
let power;
let downTime;
let inputPressed;
let currentPlayerIdx = 0; // index 
let inHole = 0;

function preload() {
  this.load.image("grass", "../assets/grass.png");
  this.load.image("wooden_v", "../assets/wooden_v.png");
  this.load.image("wooden_h", "../assets/wooden_h.png");
  this.load.image("ball1", "../assets/ball.png");
  this.load.image("ball2", "../assets/ball.png");
  this.load.image("ball3", "../assets/ball.png");
  this.load.image("ball4", "../assets/ball.png");
  this.load.image("hole", "../assets/hole.png");
  this.load.image("arrow", "../assets/arrow.png");

  // Load obstacles JSON
  this.load.json("levels", "../assets/levels.json");
}

function loadLevel(levelNumber) {
  // Destroy previous arrow and hole
  if (arrow) {
    arrow.destroy();
  }
  if (hole) {
    hole.destroy();
  }
  // Destroy previous obstacles
  obstacles.clear(true, true);
  // Get obstacles data for the current level
  const obstaclesData = levelData[(levelNumber - 1) % 3].obstacles;
  const holeData = levelData[(levelNumber - 1) % 3].hole;
  // Create obstacles
  obstaclesData.forEach((obstacle) => {
    obstacles
      .create(obstacle.x, obstacle.y, obstacle.type)
      .setScale(obstacle.scaleX, obstacle.scaleY)
      .refreshBody();
  });
  // Create hole
  hole = this.physics.add
    .image(holeData.x, holeData.y, holeData.type)
    .setScale(holeData.scale);
  hole.setSize(hole.width * 0.2, hole.height * 0.2);

  // Init all players
  initAllPlayers.call(this).then(() => {
    this.physics.add.overlap(myPlayer, hole, scored, null, this);
    setMode.call(this, 1);
  });
}

function create() {
  // Load background.
  background = this.add.image(400, 300, "grass");
  background.setScale(1.6, 1.2);
  levelData = this.cache.json.get("levels");
  obstacles = this.physics.add.staticGroup();
  // Create boundary
  boundary = this.physics.add.staticGroup();
  boundary.create(18, 18, "wooden_v").setScale(3.1, 0.07).refreshBody(); // top horizontal
  boundary.create(18, 18, "wooden_h").setScale(0.07, 3.1).refreshBody(); // left vertical
  boundary.create(782, 582, "wooden_v").setScale(3.1, 0.07).refreshBody(); // bottom horizontal
  boundary.create(782, 582, "wooden_h").setScale(0.07, 3.1).refreshBody(); // right vertical
  loadLevel.call(this, 1);
  inputPressed = false;
  downTime = 0;

  /* // Add timer
  let countdownValue = 11;
  const countdownText = this.add.text(100, 18, '', { fontSize: '35px', color: '#ffffff' });
  const timeOutText = this.add.text(400, 300, '', { fontSize: '35px', color: '#ffffff' });
  countdownText.setOrigin(0.5);

  const updateCountdown = () => {
    countdownValue--; // Decrease countdown value
    countdownText.setText('Time: ' + countdownValue); // Update the text
    if (countdownValue <= 0) {
        // Timer has reached zero, handle game over or other logic
        //clearInterval(countdownInterval); // Stop the countdown
        countdownValue = 11
      
    }
  };
  
  // Update the countdown timer every second (1000 milliseconds)
  const countdownInterval = setInterval(updateCountdown, 1000); */

  // Initialize countdown timer variables
  let countdownValue = 10; // Initial countdown value in seconds
  let countdownText = this.add.text(100, 18, '', { fontSize: '35px', color: '#ffffff' });
  let screenText = this.add.text(400, 300, '', { fontSize: '48px', color: '#ffffff' })
  screenText.setOrigin(0.5);
  countdownText.setOrigin(0.5);

  // Function to update the countdown timer
  const updateCountdown = () => {
      countdownValue--; // Decrease countdown value
      countdownText.setText('Time: ' + countdownValue); // Update the text

      // If countdown reaches zero
      if (countdownValue <= 0) {
          clearInterval(countdownInterval); // Stop the countdown
          countdownText.setText(''); 
          screenText.setText('Time out!')// Show "Time out!" message
          setTimeout(() => {
              screenText.setText('Next player turn!'); // Show "Next player turn" message after 2 seconds
              setTimeout(() => {
                  // Reset countdown and start again
                  countdownValue = 10;
                  countdownText.setText('Time: ' + countdownValue);
                  screenText.setText('');
                  countdownInterval = setInterval(updateCountdown, 1000);
              }, 2000);
          }, 2000);
      }
  };

  // Update the countdown timer every second (1000 milliseconds)
  let countdownInterval = setInterval(updateCountdown, 1000);
}

function scored(player, hole) {
  // Check if the player is moving slow enough to enter the hole
  if (player.body.velocity.length() <= 250) {
    setMode.call(this,2)
    player.disableBody(true, true);
    inHole++; 
   
  
    hole.disableBody(true, true);
    currentLevel++;
    loadLevel.call(this, currentLevel);
    
   /*  hole.disableBody(true, true);
    currentLevel++;
    loadLevel.call(this, currentLevel); */
  }
}

function powerCalc() {
  return Math.abs(((this.time.now - downTime + 500) % 1000) - 500);
}

function setMode(newMode) {
  mode = newMode;
  if (newMode === 0) {
    if (arrow) {
      arrow.destroy();
    }
  } else if (newMode === 1) {
    // set ball velocity to 0
    myPlayer.setVelocity(0, 0);
    createArrow.call(this);

    getInstance(roomId, userId)
    .then(response => {
      const data = response.data;
      console.log(data)
      updateInstance(roomId, {
        player: userId,
        current_swings: data.current_swings + 1,
        total_swings: data.total_swings + 1,
        current_position: {
          posX: myPlayer.x,
          posY: myPlayer.y,
        },
      });
    });
  //mode when ball fall in ahole
  }else if (newMode === 2){
    if (arrow) {
      arrow.destroy();
    }
  }
}

function createArrow() {
  arrow = this.add.image(myPlayer.x, myPlayer.y, "arrow").setScale(0.15, 0.15);
  arrow.setOrigin(0, 0.5);
}

function update() {
  if (mode === 0) {
    // if the ball is moving, ball should not be able to be controlled
    this.input.off("pointermove");
    this.input.off("pointerdown");
    this.input.off("pointerup");
    // check if the ball is moving so slow that we can make it stop completely and change the mode
    if (myPlayer.body.velocity.length() < 10) {
      setMode.call(this, 1);
    }
  } else if (mode === 1) {
    // check if ball is mode 1 and the player turn is userId
    this.input.on("pointermove", (pointer) => {
      angle = Phaser.Math.Angle.BetweenPoints(myPlayer, pointer);
      arrow.rotation = angle;
      myPlayer.rotation = angle;

      //console.log(typeof(angle))
    
    });
    this.input.on("pointerdown", (pointer) => {
      inputPressed = true;
    });
    this.input.on("pointerup", (pointer) => {
      inputPressed = false;
    });
    if (inputPressed) {
      if (downTime === 0) {
        downTime = this.time.now;
      } else {
        arrow.scaleX = 0.15 + (powerCalc.call(this) / 500) * 0.2;
      }
    } else if (downTime !== 0 && myPlayer.body && myPlayer.body.velocity) {
      power = powerCalc.call(this) * 1.5;
      // console.log(angle, power, myPlayer.body.velocity)
      console.log(players)
      this.physics.velocityFromRotation(angle, power, myPlayer.body.velocity);
      
      downTime = 0;
      setMode.call(this, 0);
    }
  } else if (mode === 2){
    //when score is called
    this.input.off("pointermove");
    this.input.off("pointerdown");
    this.input.off("pointerup");
  }
}

async function initAllPlayers() {
  const response = await fetch(`${BACKEND_URL}/api/room/${roomId}`);
  const data = await response.json();
  let idx = 0;

  data.data.Instance.map((instance, index) => {
    if (instance.player !== userId) {
      if (players[instance.player]){
        players[instance.player].destroy()
      }
      let player = this.physics.add
        .image(
          instance.current_position.posX, 
          instance.current_position.posY,
          `ball${index + 1}`
        )
        .setScale(0.015);
      player.setBounce(0.5);
      player.setDamping(true);
      player.setDrag(0.65);
      this.physics.add.collider(player, obstacles);
      this.physics.add.collider(player, boundary);
      this.physics.add.collider(player, myPlayer);
      players[instance.player] = player;
      turnIndex[idx] = instance.player;
      idx++;
    } else {
      if (myPlayer){
        myPlayer.destroy()
      }
      myPlayer = this.physics.add
        .image(
          600,
          400,
          `ball${index + 1}`
        )
        .setScale(0.015);
      myPlayer.setBounce(0.5);
      myPlayer.setDamping(true);
      myPlayer.setDrag(0.65);
      myPlayer.setDepth(1);
      this.physics.add.collider(myPlayer, obstacles);
      this.physics.add.collider(myPlayer, boundary);
      players[userId] = myPlayer;
      turnIndex[idx] = userId;
      idx++;
    }
    
  });

  // Add colliders between all players
  for (const playerId1 in players) {
    for (const playerId2 in players) {
      if (playerId1 !== playerId2) {
        this.physics.add.collider(players[playerId1], players[playerId2]);
      }
    }
  }
  // Resolve the promise to indicate that initialization is complete
  return Promise.resolve();
}
