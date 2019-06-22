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

function update() {}

const addSelf = (self, playerInfo) => {

  self.pig = self.physics.add.image(playerInfo.x, playerInfo.y, 'pig')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(playerConfig.xSize, playerConfig.ySize);

  playerInfo.team === 'blue' ? self.pig.setTint(playerConfig.blueColor) : self.pig.setTint(playerConfig.redColor);
  self.pig.setDrag(100);
  self.pig.setAngularDrag(100);
  self.pig.setMaxVelocity(200);
}

const addOtherPlayers = (self, playerInfo) => {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(playerConfig.xSize, playerConfig.ySize);
  
  playerInfo.team === 'blue' ? self.pig.setTint(playerConfig.blueColor) : self.pig.setTint(playerConfig.redColor);

  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);

}