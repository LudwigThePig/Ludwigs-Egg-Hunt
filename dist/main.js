const playerConfig = {
  xSize: 100,
  ySize: 50,
  blueColor: 0xFCD7DE,
  redColor: 0x89cff0,
  drag: 100,
  angularDrag: 100,
  maxVelocity: 200,
}


const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  backgroundColor: '#7EC0EE',
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

const game = new Phaser.Game(config);

function preload() {
  this.load.image('pig', './assets/pig-player.png');
}

function create() {  
  const self = this;
  this.socket = io();
  this.cursors = this.input.keyboard.createCursorKeys();

  // Load current players, map over players and paint.
  this.socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach( id => {
      if (players[id].playerId === self.socket.id) {
        addSelf(self, players[id]);
      } else {
        addOtherPlayers(self, players[id])
      }
    });
  });


  // When new player, add them to the list of current players
  this.socket.on('newPlayer', playerInfo => {
    addOtherPlayers(self, playerInfo);
  });

  // When a player disconnects, remove them
  this.socket.on('discconect', playerId => {
    self.otherPlayers.getChildren().forEach( otherPlayer => {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

}

function update() {

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
      this.physics.velocityFromRotation(this.pig.rotation + 1.5, 100, this.pig.body.acceleration);
    } else {
      this.pig.setAcceleration(0);
    }

    // If the pig exits screen, it appears on the other side. Wrap is not a function though. So, I do not know how to reslves this...
    // this.physics.world.wrap(this.pig, 5);

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

    this.pig.oldPosition = {
      x: this.pig.x,
      y: this.pig.y,
      rotation : this.pig.rotation
    }
    
  } // END if (this.pig)
}

const addSelf = (self, playerInfo) => {

  self.pig = self.physics.add.image(playerInfo.x, playerInfo.y, 'pig')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(playerConfig.xSize, playerConfig.ySize);

  playerInfo.team === 'blue' ? self.pig.setTint(playerConfig.blueColor) : self.pig.setTint(playerConfig.redColor);
  self.pig.setDrag(playerConfig.drag);
  self.pig.setAngularDrag(playerConfig.angularDrag);
  self.pig.setMaxVelocity(playerConfig.maxVelocity);
}

const addOtherPlayers = (self, playerInfo) => {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(playerConfig.xSize, playerConfig.ySize);
  
  playerInfo.team === 'blue' ? self.pig.setTint(playerConfig.blueColor) : self.pig.setTint(playerConfig.redColor);

  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);

}