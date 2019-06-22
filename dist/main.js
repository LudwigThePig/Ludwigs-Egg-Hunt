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
  this.socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach( id => {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      }
    })
  })
}

function update() {}

const addPlayer = (self, playerInfo) => {
  self.pig = self.physics.add.image(playerInfo.x, playerInfo.y, 'pig').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  playerInfo.team === 'blue' ? self.pig.setTint(0x0000ff) : self.pig.setTint(0xff0000);
  self.pig.setDrag(100);
  self.pig.setAngularDrag(100);
  self.pig.setMaxVelocity(200);
}