// =====================================================
// ===================== ELEMENTS =====================
// =====================================================
const map = document.getElementById("map");
const playerEl = document.getElementById("player");
const overlayMap = document.getElementById("overlay-map");
const interiorWorld = document.getElementById("interior-world");
const interiorMap = document.getElementById("interior-map");

const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const dialogueChoices = document.getElementById("dialogue-choices");
const typingSfx = document.getElementById("typing-sfx");
const collectSfx = document.getElementById("collect-sfx");
const doorSfx = document.getElementById("door-sfx");
const swordSfx = document.getElementById("sword-sfx");
const eatSfx = document.getElementById("eat-sfx");
const bgMusic = document.getElementById("game-music");


// =====================================================
// ===================== DIM LAYER ====================
// =====================================================

const dimLayer = document.createElement("div");
dimLayer.style.position = "fixed";
dimLayer.style.top = "0";
dimLayer.style.left = "0";
dimLayer.style.width = "100vw";
dimLayer.style.height = "100vh";
dimLayer.style.background = "rgba(0,0,0,0.5)";
dimLayer.style.opacity = "0";
dimLayer.style.pointerEvents = "none";
dimLayer.style.transition = "opacity 0.6s ease";
dimLayer.style.zIndex = 5000;
document.body.appendChild(dimLayer);


// =====================================================
// ===================== CONFIG =======================
// =====================================================
const SPEED = 3;
const ZOOM = 1.5;
const MAP_WIDTH = 3500;
const MAP_HEIGHT = 2930;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;

// =====================================================
// ===================== GAME STATE ====================
// =====================================================
let hasSword = false;
let chestOpened = false;
let savedOutsidePosition = { x: 0, y: 0 };
let hasApple = false;
let hasTouchedBear = false;
let hasTouchedChest = false;



// =====================================================
// INTERIOR COLLISION
// =====================================================
const interiorCollisionCanvas = document.createElement("canvas");
interiorCollisionCanvas.width = MAP_WIDTH;
interiorCollisionCanvas.height = MAP_HEIGHT;
interiorCollisionCanvas.style.display = "none";
document.body.appendChild(interiorCollisionCanvas);
const interiorCollisionCtx = interiorCollisionCanvas.getContext("2d");

// Load interior collision image
const interiorCollisionImage = new Image();
interiorCollisionImage.src = "images/collision2.png";
interiorCollisionImage.onload = () => {
  interiorCollisionCtx.drawImage(interiorCollisionImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);
};


// Optional: debug overlay for interior collision
const interiorCollisionDebug = document.createElement("canvas");
interiorCollisionDebug.width = window.innerWidth;
interiorCollisionDebug.height = window.innerHeight;
interiorCollisionDebug.style.position = "fixed";
interiorCollisionDebug.style.top = "0";
interiorCollisionDebug.style.left = "0";
interiorCollisionDebug.style.zIndex = 9998; // just below outside debug
interiorCollisionDebug.style.pointerEvents = "none";
interiorCollisionDebug.style.opacity = 0;
document.body.appendChild(interiorCollisionDebug);
const interiorDebugCtx = interiorCollisionDebug.getContext("2d");
function isCollidingPointInterior(x, y) {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return true;
  const pixel = interiorCollisionCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
  return pixel[0] === 255 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] > 0;
}

function isCollidingInterior(x, y) {
  const left = x - PLAYER_WIDTH / 2;
  const right = x + PLAYER_WIDTH / 2;
  const top = y - PLAYER_HEIGHT / 2;
  const bottom = y + PLAYER_HEIGHT / 2;

  return (
    isCollidingPointInterior(left, top) ||
    isCollidingPointInterior(right, top) ||
    isCollidingPointInterior(left, bottom) ||
    isCollidingPointInterior(right, bottom)
  );
}

// Debug overlay for interior
function updateInteriorCollisionDebug(camX, camY) {
  interiorDebugCtx.clearRect(0, 0, interiorCollisionDebug.width, interiorCollisionDebug.height);
  interiorDebugCtx.drawImage(
    interiorCollisionCanvas,
    camX, camY,
    window.innerWidth / ZOOM, window.innerHeight / ZOOM,
    0, 0,
    window.innerWidth, window.innerHeight
  );
}

// =====================================================
// ===================== COLLISION ====================
// =====================================================
// Actual collision canvas
const collisionCanvas = document.createElement("canvas");
collisionCanvas.width = MAP_WIDTH;
collisionCanvas.height = MAP_HEIGHT;
collisionCanvas.style.display = "none";
document.body.appendChild(collisionCanvas);
const collisionCtx = collisionCanvas.getContext("2d");

// Load collision image
const collisionImage = new Image();
collisionImage.src = "images/collision.png";
collisionImage.onload = () => {
  collisionCtx.drawImage(collisionImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);
};

// Debug overlay canvas
const collisionDebug = document.createElement("canvas");
collisionDebug.width = window.innerWidth;
collisionDebug.height = window.innerHeight;
collisionDebug.style.position = "fixed";
collisionDebug.style.top = "0";
collisionDebug.style.left = "0";
collisionDebug.style.zIndex = 9999;
collisionDebug.style.pointerEvents = "none";
collisionDebug.style.opacity = 0;
document.body.appendChild(collisionDebug);
const debugCtx = collisionDebug.getContext("2d");

// Check a single point in collision map
function isCollidingPoint(x, y) {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return true;
  const pixel = collisionCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
  return pixel[0] === 255 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] > 0;
}

// Check player's hitbox
function isColliding(x, y) {
  const left = x - PLAYER_WIDTH / 2;
  const right = x + PLAYER_WIDTH / 2;
  const top = y - PLAYER_HEIGHT / 2;
  const bottom = y + PLAYER_HEIGHT / 2;

  return (
    isCollidingPoint(left, top) ||
    isCollidingPoint(right, top) ||
    isCollidingPoint(left, bottom) ||
    isCollidingPoint(right, bottom)
  );
}

// Draw debug overlay
function updateCollisionDebug(camX, camY) {
  debugCtx.clearRect(0, 0, collisionDebug.width, collisionDebug.height);
  debugCtx.drawImage(
    collisionCanvas,
    camX, camY,
    window.innerWidth / ZOOM, window.innerHeight / ZOOM,
    0, 0,
    window.innerWidth, window.innerHeight
  );
}


// =====================================================
// ===================== AUDIO ========================
// =====================================================
bgMusic.volume = 0.3;

// Footsteps
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();
let stepBuffer = null;
let stepSource = null;
let wasMoving = false;

fetch("audio/walk.mp3")
  .then(res => res.arrayBuffer())
  .then(data => audioCtx.decodeAudioData(data))
  .then(buffer => stepBuffer = buffer);

function startFootsteps() {
  if (!stepBuffer || stepSource) return;
  stepSource = audioCtx.createBufferSource();
  stepSource.buffer = stepBuffer;
  stepSource.loop = true;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.6;
  stepSource.connect(gain);
  gain.connect(audioCtx.destination);
  stepSource.start(0);
}

function stopFootsteps() {
  if (!stepSource) return;
  stepSource.stop();
  stepSource.disconnect();
  stepSource = null;
}

// Play music on interaction
function playGameMusic() {
  bgMusic.play().catch(err => console.log("Music playback blocked until user interaction"));
  window.removeEventListener("keydown", playGameMusic);
  window.removeEventListener("mousedown", playGameMusic);
}
window.addEventListener("keydown", playGameMusic);
window.addEventListener("mousedown", playGameMusic);


// =====================================================
// ===================== PLAYER =======================
// =====================================================
const outsidePlayer = { x: 1050, y: 1090 };
const interiorPlayer = { x: 955, y: 1185 };

const keys = {};
let facing = "right";

// =====================================================
// ===================== CHARACTERS ===================
// =====================================================
const CHARACTERS = {
  uniform: { idle: "images/uniformidle.gif", walk: "images/uniformwalk.gif", idlesw: "images/uniformidlesw.gif", walksw: "images/uniformwalksw.gif", idleap: "images/uniformidleap.gif", walkap: "images/uniformwalkap.gif", idleswap: "images/uniformidleswap.gif", walkswap: "images/uniformwalkswap.gif" },
  chef: { idle: "images/chefidle.gif", walk: "images/chefwalk.gif", idlesw: "images/chefidlesw.gif", walksw: "images/chefwalksw.gif", idleap: "images/chefidleap.gif", walkap: "images/chefwalkap.gif", idleswap: "images/chefidleswap.gif", walkswap: "images/chefwalkswap.gif" },
  casual: { idle: "images/casualidle.gif", walk: "images/casualwalk.gif", idlesw: "images/casualidlesw.gif", walksw: "images/casualwalksw.gif", idleap: "images/chefidleap.gif", walkap: "images/chefwalkap.gif", idleswap: "images/chefidleswap.gif", walkswap: "images/chefwalksw.gif" }
};

let currentCharacter = sessionStorage.getItem("selectedCharacter") || "uniform";
let currentSprite = "idle";

// Set sprite
function setPlayerSprite(type) {
  if (currentSprite === type) return;
  playerEl.src = CHARACTERS[currentCharacter][type];
  currentSprite = type;
}
if (hasSword && hasApple) {
  setPlayerSprite("idleswap");
}
else if (hasSword && !hasApple) {
  setPlayerSprite("idlesw");
}
else if (!hasSword && hasApple) {
  setPlayerSprite("idleap");
}
else {
  setPlayerSprite("idle");
}

function setCharacter(name) {
  if (!CHARACTERS[name]) return;
  currentCharacter = name;
  if (hasSword && hasApple) {
    setPlayerSprite("idleswap");
  }
  else if (hasSword && !hasApple) {
    setPlayerSprite("idlesw");
  }
  else if (!hasSword && hasApple) {
    setPlayerSprite("idleap");
  }
  else {
    setPlayerSprite("idle");
  }

}

// =====================================================
// ===================== DIALOGUE ====================
// =====================================================
let dialogueActive = false;

function showDialogue(message, choices = [], onChoice = null) {
  dialogueActive = true;
  dialogueBox.classList.remove("hidden");
  dialogueText.innerHTML = "";

  // Hide all choice buttons first
  dialogueChoices.classList.add("hidden");
  const choiceYesBtn = document.getElementById("choice-yes");
  const choiceNoBtn = document.getElementById("choice-no");
  choiceYesBtn.style.display = "none";
  choiceNoBtn.style.display = "none";

  let index = 0;

  function typeNextLetter() {
    if (index === 0) {
      typingSfx.currentTime = 0;
      typingSfx.play().catch(() => { });
    }

    if (index < message.length) {
      dialogueText.innerHTML += message[index];
      index++;
      setTimeout(typeNextLetter, 50);
    } else {
      typingSfx.pause();

      if (choices.length > 0) {
        dialogueChoices.classList.remove("hidden");

        // Only 1 choice
        if (choices.length === 1) {
          choiceYesBtn.innerText = choices[0];
          choiceYesBtn.style.display = "inline-block";
          choiceYesBtn.onclick = () => {
            dialogueBox.classList.add("hidden");
            dialogueActive = false;
            if (onChoice) onChoice(choices[0]);
          };
        }

        // 2 choices
        if (choices.length === 2) {
          choiceYesBtn.innerText = choices[0];
          choiceNoBtn.innerText = choices[1];
          choiceYesBtn.style.display = "inline-block";
          choiceNoBtn.style.display = "inline-block";

          choiceYesBtn.onclick = () => {
            dialogueBox.classList.add("hidden");
            dialogueActive = false;
            if (onChoice) onChoice(choices[0]);
          };
          choiceNoBtn.onclick = () => {
            dialogueBox.classList.add("hidden");
            dialogueActive = false;
            if (onChoice) onChoice(choices[1]);
          };
        }
      }
    }
  }

  typeNextLetter();
}




// =====================================================
// ===================== OBJECTS ======================
// =====================================================
const objects = [
  { el: document.getElementById("backhouse"), x: 1420, y: 1239, width: 100, height: 100 },
  { el: document.getElementById("tree"), x: 1387, y: 1349, width: 60, height: 60 },
  { el: document.getElementById("tree2"), x: 1728, y: 1295, width: 60, height: 60 },
  { el: document.getElementById("tree3"), x: 2038, y: 1505, width: 60, height: 60 },
  { el: document.getElementById("house"), x: 1186, y: 1080, width: 100, height: 168 },
  { el: document.getElementById("appletree"), x: 1073, y: 1800, width: 120, height: 120 },
  { el: document.getElementById("bear"), x: 1422, y: 524, width: 200, height: 200 },
  { el: document.getElementById("bearap"), x: 1422, y: 524, width: 200, height: 200 },
  { el: document.getElementById("chest"), x: 1972, y: 534, width: 200, height: 200 },
  { el: document.getElementById("ken"), x: 1972, y: 534, width: 200, height: 200 },
  { el: document.getElementById("fence1"), x: 1593, y: 1236, width: 60, height: 60 },
  { el: document.getElementById("fence2"), x: 2030, y: 1712, width: 60, height: 60 },
  { el: document.getElementById("fence3"), x: 1611, y: 1952, width: 60, height: 60 },
  { el: document.getElementById("fence4"), x: 1340, y: 1910, width: 60, height: 60 },
  { el: document.getElementById("fence5"), x: 2193, y: 1952, width: 60, height: 60 },
];
objects.forEach(obj => obj.playerInside = false);

const indoorObjects = [
  { el: document.getElementById("chestt"), x: 0, y: 0, width: 100000, height: 710 },
  { el: document.getElementById("exit"), x: 0, y: 1190, width: 100000, height: 710 }

];
indoorObjects.forEach(obj => obj.playerInside = false);
// Position indoor objects ONCE in interior-map space
indoorObjects.forEach(obj => {
  if (!obj.el) return;
  obj.el.style.position = "absolute";
  obj.el.style.left = obj.x + "px";
  obj.el.style.top = obj.y + "px";
});

// =====================================================
// ===================== SCENES =======================
// ===============da======================================
let cutsceneActive = false;
let currentScene = "outside";

function getActivePlayer() {
  return currentScene === "outside" ? outsidePlayer : interiorPlayer;
}

function Death() {
  location.reload();
}
// =====================================================
// ===================== HOUSE INTERACTION =============
// =====================================================
function isPlayerTouchingObject(player, obj) {
  const hitboxWidth = PLAYER_WIDTH * 0.2;
  const hitboxHeight = PLAYER_HEIGHT * 0.2;
  const playerLeft = player.x - hitboxWidth / 2;
  const playerRight = player.x + hitboxWidth / 2;
  const playerTop = player.y - hitboxHeight / 2;
  const playerBottom = player.y + hitboxHeight / 2;

  const objLeft = obj.x;
  const objRight = obj.x + obj.width;
  const objTop = obj.y;
  const objBottom = obj.y + obj.height;

  return !(playerRight < objLeft || playerLeft > objRight || playerBottom < objTop || playerTop > objBottom);
}


function enterHouse() {
  // save current outside position
  savedOutsidePosition.x = outsidePlayer.x;
  savedOutsidePosition.y = outsidePlayer.y;
  doorSfx.play().catch(() => { });
  cutsceneActive = true;
  playerEl.style.opacity = "1";
  playerEl.style.zIndex = 1000;
  const player = getActivePlayer();
  dimLayer.style.opacity = "1";
  map.style.display = "none";
  overlayMap.style.display = "none";
  objects.forEach(obj => obj.el.style.display = "none");
  indoorObjects.forEach(obj => obj.el.style.display = "block");

  setTimeout(() => {
    currentScene = "interior";
    interiorWorld.style.display = "block";
    interiorPlayerEl.src = playerEl.src;
    interiorPlayerEl.style.left = interiorPlayer.x + "px";
    interiorPlayerEl.style.top = interiorPlayer.y + "px";
    cutsceneActive = false;
    dimLayer.style.opacity = "0";
  }, 600);

  setTimeout(() => {
    dimLayer.style.opacity = "0";
    cutsceneActive = false;
    console.log("Enter house finished");
  }, 900);
}


function exitHouse() {
  cutsceneActive = true;
  doorSfx.play().catch(() => { });
  // restore saved position
  outsidePlayer.x = savedOutsidePosition.x;
  outsidePlayer.y = savedOutsidePosition.y;

  currentScene = "outside";

  // hide interior, show exterior
  interiorWorld.style.display = "none";

  playerEl.style.zIndex = 2;
  interiorMap.style.display = "block"; // or hide if not needed
  map.style.display = "block";
  overlayMap.style.display = "block";
  objects.forEach(obj => {
    if (!obj.el) return;

    if (obj.el.id === "bearap") {
      obj.el.style.display = hasTouchedBear ? "block" : "none";
      return;
    }

    if (obj.el.id === "bear") {
      obj.el.style.display = hasTouchedBear ? "none" : "block";
      return;
    }

    obj.el.style.display = "block";
  });


  indoorObjects.forEach(obj => obj.el.style.display = "none");

  playerEl.style.display = "block";

  cutsceneActive = false;
}
function checkInteractions() {
  const player = getActivePlayer();

  if (currentScene === "outside") {
    objects.forEach(obj => {
      const touching = isPlayerTouchingObject(player, obj);

      if (touching && !obj.playerInside) {
        obj.playerInside = true;

        if (obj.el.id === "house") {
          console.log("Touched House");
          showDialogue(
            "You are at the entrance of the house. Do you want to go inside?",
            ["Enter", "No"],
            choice => {
              if (choice === "Enter") enterHouse();
            }
          );
        }

        if (obj.el.id === "appletree") {
          console.log("Touched Apple Tree");
          showDialogue(
            "You are at the apple tree. Do you want to pick an apple?",
            ["Pick", "No"],
            choice => {
              if (choice === "Pick") {
                collectSfx.play().catch(() => { });
                showDialogue(
                  "Do you want to eat it?",
                  ["Yes", "Leave in Inventory"],
                  choice => {
                    if (choice === "Leave in Inventory") {
                      hasApple = true;
                      showDialogue(
                        "Apple Acquired!",
                        ["Continue"]);
                      console.log("Apple acquired");
                    } else {eatSfx.play().catch(() => { });}
                  }
                );
              }
            }
          );
        }

        if (!hasTouchedBear) {
          if (obj.el.id === "bear") {
            console.log("Touched Bear");

            // Initialize hasApple / hasSword if undefined
            if (typeof hasApple === "undefined") hasApple = false;
            if (typeof hasSword === "undefined") hasSword = false;

            let options = [];

            // Determine first choice options
            if (hasApple && hasSword) options = ["Yes", "No"];
            else if (hasApple && !hasSword) options = ["Yes", "No"];
            else if (!hasApple && hasSword) options = ["Yes", "No"];
            else options = ["Yes", "No"]; // no apple, no sword

            showDialogue(
              "You are in front of a dangerous bear, do you wish to approach it?",
              options,
              choice => {
                if (choice !== "Yes") return;

                // Determine bear action choices
                if (hasApple && hasSword) {
                  showDialogue(
                    "The bear is Angry! Choose an Action",
                    ["Fight with a Sword", "Give an Apple"],
                    action => {
                      if (action === "Fight with a Sword") {
                        showDialogue(
                          "You died.. Lara is too weak to fight a bear head on...",
                          ["Restart"],
                          choice => {
                            if (choice === "Restart") {
                              Death();
                            }
                          }
                        );
                      }
                      else {
                        showDialogue(
                          "The bear was just hungry and you became friends!",
                          ["Continue"]
                        );
                        hasTouchedBear = true;
                        bear.style.display = "none"
                        bearap.style.display = "block"

                        hasApple = false;
                        console.log("Player is Wins");
                      }
                    }
                  );
                } else if (hasApple && !hasSword) {
                  showDialogue(
                    "The bear is Angry! Choose an Action",
                    ["Run", "Give an Apple"],
                    action => {
                      if (action === "Give an Apple") {
                        showDialogue(
                          "The bear was just hungry and you became friends!",
                          ["Continue"]
                        );
                        hasTouchedBear = true;
                        bear.style.display = "none"
                        bearap.style.display = "block"
                        hasApple = false;
                        console.log("Player is Wins");
                      }
                      else {
                        showDialogue(
                          "You died.. Obviously, Lara can't outrun a bear...",
                          ["Restart"],
                          choice => {
                            if (choice === "Restart") {
                              Death();
                            }
                          }
                        ); ("Player is Dead");
                      }
                    }
                  );
                } else if (!hasApple && hasSword) {
                  showDialogue(
                    "The bear is Angry! Choose an Action",
                    ["Fight with a Sword", "Run"],
                    action => {
                      if (action === "Fight with a Sword") {
                        showDialogue(
                          "You died.. Lara is too weak to fight a bear head on...",
                          ["Restart"],
                          choice => {
                            if (choice === "Restart") {
                              Death();
                            }
                          }
                        ); ("Player is Dead");
                      } else {
                        {
                          showDialogue(
                            "You died.. Obviously, Lara can't outrun a bear...",
                            ["Restart"],
                            choice => {
                              if (choice === "Restart") {
                                Death();
                              }
                            }
                          ); ("Player is Dead");
                        }
                      }
                    }
                  );
                } else {
                  // no apple, no sword
                  showDialogue(
                    "The bear is Angry! Choose an Action",
                    ["Run", "Hug the Bear"],
                    action => {
                      if (action === "Hug the Bear") {
                        showDialogue(
                          "You died.. That honestly wasn't a good idea...",
                          ["Restart"],
                          choice => {
                            if (choice === "Restart") {
                              Death();

                            }
                          }
                        ); console.log("Player is Dead");
                      } else {
                        showDialogue(
                          "You died.. Obviously, Lara can't outrun a bear...",
                          ["Restart"],
                          choice => {
                            if (choice === "Restart") {
                              Death();
                            }
                          }
                        ); ("Player is Dead");
                      }

                    }
                  );
                }
              }
            );
          }
        }

        if (!hasTouchedChest) {
          if (obj.el.id === "chest") {
            console.log("Touched Chest");
            showDialogue(
              "Open Chest?",
              ["Yes", "No"],
              choice => {
                if (choice === "Yes") {
                  hasTouchedChest = true;
                  chest.style.display = "none"
                  ken.style.display = "block"
                  showDialogue(
                    "Hi Lara! You found me!! Actually I..",
                    ["Continue"],
                    choice => {
                      if (choice === "Continue") {
                        showDialogue(
                          "I just wanted to say that you mean sooo much to me..",
                          ["Continue"],
                          choice => {
                            if (choice === "Continue") {
                              showDialogue(
                                "and Lara, may I humbly ask you..",
                                ["Continue"],
                                choice => {
                                  if (choice === "Continue") {
                                    showDialogue(
                                      "Can I be your Valentine Date?",
                                      ["Yes", "No"],
                                      choice => {
                                        if (choice === "Yes") {
                                          showDialogue(
                                            "Omfg thank you!, Well now uhmm..", ["Continue"],
                                            choice => {
                                              if (choice === "Continue") {
                                                showDialogue(
                                                  "Let's Have Lunch, around 10AM onwards on February 14..", ["Continue"],
                                                  choice => {
                                                    if (choice === "Continue") {
                                                      showDialogue(
                                                        "Venue is at Emilia's if that's fine with you",
                                                        ["Continue"],
                                                        choice => {
                                                          if (choice === "Continue") {
                                                            showDialogue(
                                                              "I'm still thinking of what clothes we should wear, sorry huhu", ["done"],
                                                            );
                                                          }
                                                        }
                                                      );
                                                    }
                                                  }
                                                );
                                              }
                                            }
                                          );
                                        }
                                      }
                                    );
                                  }
                                }
                              );
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      }
      if (!touching && obj.playerInside) obj.playerInside = false;
    });
  }

  // ---------------- INTERIOR ----------------
  if (currentScene === "interior") {
    indoorObjects.forEach(obj => {
      // Use chest **exact size** for hitbox, not offsetWidth (offsetWidth may be huge)
      const chestHitbox = {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height
      };

      const touching = isPlayerTouchingObject(player, chestHitbox);

      if (touching && !obj.playerInside) {
        obj.playerInside = true;


        if (obj.el.id === "chestt") {
          console.log("Touched Chest");

          // Already opened
          if (chestOpened) {
            showDialogue("The chest is empty.", ["Lol", "Leave"]);
            return;
          }

          // First interaction
          showDialogue(
            "You found a chest, Open it?",
            ["Open", "Leave"],
            choice => {
              if (choice === "Open") {
                showDialogue(
                  "You found a sword! Take it?",
                  ["Get", "Leave"],
                  choice => {
                    if (choice === "Get") {
                      chestOpened = true;
                      hasSword = true;
                      swordSfx.play().catch(() => { });
                      showDialogue(
                        "Sword Acquired!",
                        ["Continue"]);
                      obj.el.classList.add("opened");
                      // optional visual
                      console.log("Sword acquired");
                    }

                    // If Leave → do nothing, chest stays unopened
                  }
                );
                console.log("Sword acquired");
              }

              // If Leave → do nothing, chest stays unopened
            }
          );
        }

        if (obj.el.id === "exit") {
          console.log("Exit");
          showDialogue(
            "Do you want to leave the house?",
            ["Yes", "No"],
            choice => {
              if (choice === "Yes") exitHouse();
            }
          );
        }


      }

      if (!touching && obj.playerInside) obj.playerInside = false;
    });
  }
}




// =====================================================
// ===================== MOVEMENT =====================
// =====================================================
function handleMovement() {
  const player = getActivePlayer();
  if (dialogueActive || cutsceneActive) {
    stopFootsteps();
    wasMoving = false;
    if (hasSword && hasApple) {
      setPlayerSprite("idleswap");
    }
    else if (hasSword && !hasApple) {
      setPlayerSprite("idlesw");
    }
    else if (!hasSword && hasApple) {
      setPlayerSprite("idleap");
    }
    else {
      setPlayerSprite("idle");
    }

    return;
  }

  let moving = false;
  let newX = player.x;
  let newY = player.y;

  let collisionActive = false;
  let collidingFunc = null;

  if (currentScene === "outside") {
    collisionActive = true;
    collidingFunc = isColliding;
  } else if (currentScene === "interior") {
    collisionActive = true;
    collidingFunc = isCollidingInterior;
  }

  // HORIZONTAL
  if (keys["ArrowLeft"] || keys["a"]) {
    const nextX = player.x - SPEED;
    if (!collisionActive || !collidingFunc(nextX, player.y)) {
      newX = nextX;
      moving = true;
    }
  }
  if (keys["ArrowRight"] || keys["d"]) {
    const nextX = player.x + SPEED;
    if (!collisionActive || !collidingFunc(nextX, player.y)) {
      newX = nextX;
      moving = true;
    }
  }

  // VERTICAL
  if (keys["ArrowUp"] || keys["w"]) {
    const nextY = player.y - SPEED;
    if (!collisionActive || !collidingFunc(newX, nextY)) {
      newY = nextY;
      moving = true;
    }
  }
  if (keys["ArrowDown"] || keys["s"]) {
    const nextY = player.y + SPEED;
    if (!collisionActive || !collidingFunc(newX, nextY)) {
      newY = nextY;
      moving = true;
    }
  }

  player.x = newX;
  player.y = newY;

  if (hasSword && hasApple) {
    if (moving) setPlayerSprite("walkswap");
    else setPlayerSprite("idleswap");
  } else if (!hasSword && hasApple) {
    if (moving) setPlayerSprite("walkap");
    else setPlayerSprite("idleap");
  } else if (hasSword && !hasApple) {
    if (moving) setPlayerSprite("walksw");
    else setPlayerSprite("idlesw");
  } else {
    if (moving) setPlayerSprite("walk");
    else setPlayerSprite("idle");
  }

  if (moving && !wasMoving) { audioCtx.resume(); startFootsteps(); }
  if (!moving && wasMoving) stopFootsteps();
  wasMoving = moving;
}




// =====================================================
// ===================== CAMERA =======================
// =====================================================
function updateCamera() {
  const player = getActivePlayer();
  if (cutsceneActive) return;

  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const camX = player.x - screenW / (2 * ZOOM);
  const camY = player.y - screenH / (2 * ZOOM);


  if (currentScene === "outside") {
    map.style.width = MAP_WIDTH * ZOOM + "px";
    map.style.height = MAP_HEIGHT * ZOOM + "px";
    map.style.transform = `translate(${-camX * ZOOM}px, ${-camY * ZOOM}px)`;

    overlayMap.style.width = MAP_WIDTH * ZOOM + "px";
    overlayMap.style.height = MAP_HEIGHT * ZOOM + "px";
    overlayMap.style.transform = `translate(${-camX * ZOOM}px, ${-camY * ZOOM}px)`;
    updateCollisionDebug(camX, camY);
  } else if (currentScene === "interior") {

    // Move interior map along with player
    interiorMap.style.width = MAP_WIDTH * ZOOM + "px";
    interiorMap.style.height = MAP_HEIGHT * ZOOM + "px";

    interiorMap.style.transform = `translate(${-camX * ZOOM}px, ${-camY * ZOOM}px)`;
    updateCollisionDebug(camX, camY);
  }
}

function updateObjects() {
  const player = getActivePlayer();
  if (!objects || objects.length === 0) return;

  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const camX = player.x - screenW / (2 * ZOOM);
  const camY = player.y - screenH / (2 * ZOOM);

  objects.forEach(obj => {
    if (!obj.el) return;
    const screenX = (obj.x - camX) * ZOOM;
    const screenY = (obj.y - camY) * ZOOM;
    obj.el.style.left = screenX + "px";
    obj.el.style.top = screenY + "px";
    obj.el.style.zIndex = 30;
  });
}


// =====================================================
// ===================== KEY EVENTS ===================
// =====================================================
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if ((e.key === "ArrowLeft" || e.key === "a") && facing !== "left") {
    playerEl.style.transform = "translate(-50%, -50%) scaleX(-1)";
    facing = "left";
  }
  if ((e.key === "ArrowRight" || e.key === "d") && facing !== "right") {
    playerEl.style.transform = "translate(-50%, -50%) scaleX(1)";
    facing = "right";

  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  if ((e.key === "e" || e.key === "E") && currentScene === "interior") exitHouse();
});


// =====================================================
// ===================== GAME LOOP ====================
// =====================================================
function update() {
  if (currentScene === "outside") {
    handleMovement();
    checkInteractions();
    updateCamera();
    updateObjects();
  } else if (currentScene === "interior") {
    handleMovement();
    updateCamera();
    checkInteractions();
  }
  requestAnimationFrame(update);
}

// START GAME
update();
