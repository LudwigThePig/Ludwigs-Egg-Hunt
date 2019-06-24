const playerConfig = {
  xSize: 100,
  ySize: 50,
  drag: 200,
  angularDrag: 200, 
  maxVelocity: 100000,
}


const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1400,
  height: 600,
  backgroundColor: '#B1EDE8',
  physics: {
      default: 'arcade',
      arcade: {
          debug: false,
          gravity: { y: 0 }
      }
  },
  scene: {
      preload: preload,
    create: create,
      update: update
  }
};

const randomColor = () => {
  const colors = [0xFF6978, 0xfffcf9, 0x6D435A, 0x352d39];
  const randomInt = Math.floor(Math.random() * colors.length)
  return colors[randomInt];
}

const game = new Phaser.Game(config);

function preload() {
  this.load.image('pig', './assets/pig-player.png');
  this.load.image('otherPlayer', './assets/pig-player.png');
  this.load.image('egg', './assets/egg.png')
}

function create() {  
  const self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.cursors = this.input.keyboard.createCursorKeys();

  // Display player count
  this.playersOnline = this.add.text(16, 570, `${this.otherPlayers.getChildren().length} pigs online`, {fontSize: '20px', fill: '#000'})
  const getPlayerCount = () => this.playersOnline.setText(`${this.otherPlayers.getChildren().length + 1  } pigs online`);
  
  // Load current players, map over players and paint.
  this.socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach( id => {
      if (players[id].playerId === self.socket.id) {
        addSelf(self, players[id]);
      } else {
        addOtherPlayers(self, players[id])
      }
    });
    getPlayerCount()
  });


  // When new player, add them to the list of current players
  this.socket.on('newPlayer', playerInfo => {
    addOtherPlayers(self, playerInfo);
    getPlayerCount();
  });


  // When a player disconnects, remove them
  this.socket.on('disconnect', playerId => {
    self.otherPlayers.getChildren().forEach( otherPlayer => {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
    getPlayerCount();
  });
  console.log(self)

  // When other players move, update there position and rotation
  this.socket.on('playerMoved', (playerInfo) => {
    self.otherPlayers.getChildren().forEach( otherPlayer => {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  this.yourPiggy = this.add.text(1150, 16, ``, { fontSize: '24px', fill: '#36393B', fontStyle: 'bold'})

  // Scoreboard
  this.leaderText = this.add.text(16, 16, 'Git sum eggs, oink', { fontSize: '20px', fill: '#69140E', fontStyle: 'bold'} );

  // this is absolutely awful and I am very ashamed that I could not find a better solution...
  this.second = this.add.text(16, 40, '', {fill: '#000', fontStyle: 'bold'});
  this.third = this.add.text(16, 60, '', {fill: '#000', fontStyle: 'bold'});
  this.fourth = this.add.text(16, 80, '', {fill: '#000', fontStyle: 'bold'});
  this.fifth = this.add.text(16, 100, '', {fill: '#000', fontStyle: 'bold'});
  this.sixth = this.add.text(16, 120, '', {fill: '#000', fontStyle: 'bold'});
  this.seventh = this.add.text(16, 140, '', {fill: '#000', fontStyle: 'bold'});
  this.eigth = this.add.text(16, 160, '', {fill: '#000', fontStyle: 'bold'});
  this.nineth = this.add.text(16, 180, '', {fill: '#000', fontStyle: 'bold'});
  this.tenth = this.add.text(16, 200, '', {fill: '#000', fontStyle: 'bold'});

  this.socket.on('scoreUpdate', (scores) => {
    self.yourPiggy.setText(`You are\n${self.pig.name}`)
    self.leaderText.setText(`${scores[0].name} is in the lead with ${scores[0].score} points`);
    self.second.setText(`2. ${scores[1].name}: ${scores[1].score}`);
    self.third.setText(`3. ${scores[2].name}: ${scores[2].score}`);
    self.fourth.setText(`4. ${scores[3].name}: ${scores[3].score}`);
    self.fifth.setText(`5. ${scores[4].name}: ${scores[4].score}`);
    self.sixth.setText(`6. ${scores[5].name}: ${scores[5].score}`);
    self.seventh.setText(`7. ${scores[6].name}: ${scores[6].score}`);
    self.eigth.setText(`8. ${scores[7].name}: ${scores[7].score}`);
    self.nineth.setText(`9. ${scores[8].name}: ${scores[8].score}`);
    self.tenth.setText(`10. ${scores[9].name}: ${scores[9].score}`);
  });


  // New location for our egg
  this.socket.on('eggLocation', (eggLocation) => {
    if (self.egg) {
      self.egg.destroy();
    }
    self.egg = self.physics.add.image(eggLocation.x, eggLocation.y, 'egg')    .setDisplaySize(100, 100);
    self.physics.add.overlap(self.pig, self.egg, () => {
      this.socket.emit('eggCollected');
    }, null, self);
  })

}


function update() {
  let self = this;

  // #################################
  // Handling our own piggy's movement
  // #################################

  if (this.pig) {
    // Handle rotation
    if (this.cursors.left.isDown) {
      this.pig.setAngularVelocity(-150);
    } else if (this.cursors.right.isDown) {
      this.pig.setAngularVelocity(150)
    } else {
      this.pig.setAngularVelocity(0)
    }

    // Handle acceleration
    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(this.pig.rotation, 100, this.pig.body.acceleration);
    } else {
      this.pig.setAcceleration(0);
    }

    // If the pig exits screen, it appears on the other side.
    this.physics.world.wrap(this.pig, 5);

    // ##############################################
    // Emitting our movement for other piggies to see
    // ##############################################

    const x = this.pig.x;
    const y = this.pig.y;
    const r = this.pig.rotation;
    const checkPosChange = () => x !== this.pig.oldPosition.x || y !== this.pig.oldPosition.y || r !== this.pig.oldPosition.rotation;

    if (this.pig.oldPosition && checkPosChange()) {
      this.socket.emit('playerMovement', {
        x: this.pig.x,
        y: this.pig.y,
        rotation: this.pig.rotation
      });
    }

    // set shadow position
    this.shadow.x = this.pig.x;
    this.shadow.y = this.pig.y;
    this.shadow.rotation = this.pig.rotation;

    this.pig.oldPosition = {
      x: this.pig.x,
      y: this.pig.y,
      rotation : this.pig.rotation
    }

  } // END if (this.pig)

  
    // #####################################
    //  Handling Conflict with Other Piggies
    // #####################################
      // Too tricky for an MVP, may revist later
    // this.otherPlayers.getChildren().forEach( otherPlayer => {
    //   this.physics.overlap(self.pig, otherPlayer, () => {
    //     console.log(this.pig)
    //     this.pig.setAcceleration(-100); 
    //   }, null, self);
    // });
}

const addSelf = (self, playerInfo) => {

  // Shadow for the piggy
  self.shadow = self.physics.add.image(playerInfo.x, playerInfo.y, 'pig')
    .setDisplaySize(playerConfig.xSize + 10, playerConfig.ySize + 10);
  self.shadow.alpha = 0.6;
  self.shadow.setTint(0x000000);


  self.pig = self.physics.add.image(playerInfo.x, playerInfo.y, 'pig')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(playerConfig.xSize, playerConfig.ySize);


  self.pig.name = playerInfo.name;
  self.pig.setTint(randomColor());
  self.pig.setDrag(playerConfig.drag);
  self.pig.setAngularDrag(playerConfig.angularDrag);
  self.pig.setMaxVelocity(playerConfig.maxVelocity);
}

const addOtherPlayers = (self, playerInfo) => {
  let otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(playerConfig.xSize, playerConfig.ySize);
  
  otherPlayer.setTint(randomColor());

  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);

}