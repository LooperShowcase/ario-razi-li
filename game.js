kaboom({
  global: true,
  fullscreen: true,
  clearColor: [0, 0.6, 0.9, 1],
  debug: true,
  scale: 2,
});

loadRoot("./sprites/");
loadSprite("ground", "ground.png");
loadSprite("grass", "grass.png");
loadSprite("surprise", "surprise.png");
loadSprite("pipe_up", "pipe_up.png");
loadSprite("mario", "mario.png");
loadSprite("coin", "coin.png");
loadSprite("e_m", "evil_mushroom.png");
loadSprite("castle", "castle.png");
loadSprite("pipe", "pipe_up.png");
loadSprite("z", "z.png");
loadSprite("suprise", "surprise.png");
loadSprite("unboxed", "unboxed.png");
loadSprite("cloud", "cloud.png");
loadSprite("mushroom", "mushroom.png");
loadSound("gameSound", "gameSound.mp3");
loadSprite("flag", "flag.png");
loadSound("gameOverSound", "gameOverSound.mp3");
loadSound("jumpSound", "jumpSound.mp3");
loadSprite("loop", "loopLogo.png");

scene("over", () => {});

go("begin");

scene("begin", () => {
  add([
    text("WELCOME TO SUPER MARION\n \n PRESS ENTER TO START", 30),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  add([
    keyPress("enter", () => {
      go("game");
    }),
  ]);
});

scene("GAME OVER", (score) => {
  add([
    text(
      "GAME OVER!\n \nU SUCK\n \nPRESS R TO RESTART\n \nUR SCORE IS " + score,
      40
    ),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  add([
    keyPress("r", () => {
      go("begin");
    }),
  ]);
  play("gameOverSound");
  go("begin");
});

scene("win", (score) => {
  add([
    text("GG WP\n \nU WIN\n \nUR SCORE IS " + score, 50),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  add([sprite("loop"), pos(80, 40), origin("center")]);
});

scene("game", () => {
  const jumpForce = 150;
  const speed = 120;
  let isJumping = false;
  let goombaSpeed = 20;
  layers(["bg", "obj", "ui"], "obj");
  const theme = play("gameSound");
  let score = 0;
  const scoreLabel = add([
    text("score: " + score),
    pos(50, 10),
    layer("ui"),
    {
      value: score,
    },
  ]);

  const key = {
    width: 20,
    height: 20,
    "=": [sprite("ground"), solid(), scale(1.3)],
    c: [sprite("cloud"), scale(2), layer("bg")],
    "*": [sprite("grass"), layer("bg")],
    n: [sprite("castle"), layer("bg")],
    f: [sprite("flag"), layer("bg"), scale(8)],
    "?": [sprite("surprise"), solid(), "surprise-coin"],
    "!": [sprite("surprise"), solid(), "surprise-mushroom"],
    "&": [sprite("mushroom"), body(), "mushroom"],
    $: [sprite("coin"), "coin"],
    "%": [sprite("z"), "z"],
    x: [sprite("unboxed"), solid()],
    p: [sprite("pipe_up"), solid()],
    "^": [sprite("e_m"), solid(), body(), "goomba"],
  };

  const map = [
    "              c                                                                                                        ",
    "                                                                                                                      ",
    "                                                                                                                    ",
    "                                                                                                                      ",
    "           =?=                                                                                                        ",
    "                                                            =?                                                        ",
    "                  #                    ===                                  f                                       ",
    "                            ^    =?=                            ^     ===                                            ",
    "       ===!===     ?==      ===                           =====                                                       ",
    "                                              ==?==                                n                                 ",
    "                                    ^                                                                               ",
    "        *              p                                               *                                               ",
    "                                                                                                                      ",
    "==========================================   =========================================================================",
    "==========================================   =========================================================================",
    "==========================================%%%=========================================================================",
  ];
  const player = add([
    sprite("mario"),
    solid(),
    pos(48, 0),
    body(),
    origin("bot"),
    big(jumpForce),
  ]);
  const gameLevel = addLevel(map, key);

  keyDown("d", () => {
    player.move(speed, 0);
  });

  keyDown("a", () => {
    if (player.pos.x > 10) {
      player.move(-speed, 0);
    }
  });

  let jumps = 0;
  keyDown("w", () => {
    if ((player.grounded() && jumps == 0) || jumps < 20) {
      isJumping = true;
      player.jump(jumpForce);
      jumps++;
      play("jumpSound");
    }
  });
  player.on("headbump", (obj) => {
    if (obj.is("surprise-coin")) {
      gameLevel.spawn("$", obj.gridPos.sub(0, 1));
      gameLevel.spawn("x", obj.gridPos);
      destroy(obj);
    }
    if (obj.is("surprise-mushroom")) {
      gameLevel.spawn("&", obj.gridPos.sub(0, 1));
      gameLevel.spawn("x", obj.gridPos);
      destroy(obj);
    }
  });

  player.collides("castle", (x) => {
    go("win", score);
  });

  player.collides("coin", (x) => {
    destroy(x);
    scoreLabel.value += 5;
    scoreLabel.text = "score: " + scoreLabel.value;
  });
  player.collides("mushroom", (x) => {
    destroy(x);
    player.biggify(7);
  });

  action("mushroom", (mush) => {
    mush.move(50, 0);
  });

  action("goomba", (gege) => {
    gege.move(-goombaSpeed, 0);
  });

  player.collides("goomba", (x) => {
    if (isJumping) {
      destroy(x);
      scoreLabel.value += 10;
      scoreLabel.text = "score: " + scoreLabel.value;
    } else {
      if (player.isBig()) {
        player.smallify();
        destroy(x);
      } else {
        destroy(player);
        go("GAME OVER", scoreLabel.value);
        theme.pause();
      }
    }
  });

  player.collides("z", (z) => {
    destroy(player);
    go("GAME OVER", scoreLabel.value);
    theme.pause();
  });

  player.action(() => {
    if (player.grounded()) {
      jumps = 0;
    }
    if (player.pos.x >= 1698.7791999999984) {
      go("win", scoreLabel.value);
    }
    camPos(player.pos.x, 150);
    scoreLabel.pos.x = player.pos.x;
    if (player.grounded()) {
      isJumping = false;
    } else {
      isJumping = true;
    }
    console.log("We are here", player.pos.x, player.pos.y);
  });
  loop(5, () => {
    goombaSpeed = goombaSpeed * -1;
  });
});
start("game");
