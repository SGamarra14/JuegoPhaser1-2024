class Scene1 extends Phaser.Scene 
{
    constructor() {
        super({
            key: 'scene1'
        });
    }

    preload() {
        this.load.image('fondo', 'https://i.ibb.co/4SMbvGv/fondo.png');
    }

    create() {
        this.add.image(150, 250, 'fondo');

        this.add.text(0, 100, 'Presiona ESPACIO', { fontSize: '29px', fill: '#fff' });

        this.add.text(0, 130, 'para iniciar', { fontSize: '29px', fill: '#fff' });
        
        this.input.keyboard.on('keydown-SPACE', this.iniciarJuego, this);
    }

    iniciarJuego() {
        setTimeout(() => {
            this.scene.start('scene2');
        }, 100); 
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

class Scene2 extends Phaser.Scene
{
    constructor(){
        super('scene2');
      }

    player;
    platform;
    cursors;
    ground;
    enemies;

    preload ()
    {
        this.load.image('fondo', 'https://i.ibb.co/4SMbvGv/fondo.png');
        this.load.image('ground', 'https://i.ibb.co/8x22dTS/suelo.png');
        this.load.image('plataforma', 'https://i.ibb.co/bWTHZc6/plataforma.png');
        this.load.image('bullet', 'https://i.ibb.co/5R1ZJKm/bala-Player.png');
        this.load.spritesheet('dude', 'https://i.ibb.co/JHYWnHp/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('enemigo', 'https://i.ibb.co/7Rmzbtn/enemigo.png', { frameWidth: 30, frameHeight: 30 });        
        //this.load.audio('shotSound', '');
        //this.load.audio('enemyKill', '');
    }

    create ()
    {
        //MAPA
        this.add.image(150, 250, 'fondo');

        this.ground = this.physics.add.staticImage(150, 452, 'ground').refreshBody();

        this.platform = this.physics.add.image(150, 340, 'plataforma');

        this.platform.setImmovable(true);
        this.platform.body.allowGravity = false;

        //JUGADOR
        this.player = this.physics.add.sprite(150, 380, 'dude');

        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(this.player, this.platform);
        this.physics.add.collider(this.player, this.ground);

        //ENEMIGO
        this.enemies = this.physics.add.group({
            key: 'enemigo',
            frameQuantity: 20,
            maxSize: 9,
            active: false,
            visible: false,
            enable: false,
            collideWorldBounds: true,
            bounceX: 1
        });

        for (var y = 1; y < 4; y++) {
            for (var x = 1; x < 4; x++) {
                const enemigo = this.enemies.get();
                enemigo
                    .enableBody(true, y*40, x*50, true, true)
                    .setVelocity(50 + x*5, 0);
                enemigo.body.allowGravity = false;
            }
        }

        this.anims.create({
            key: 'fren',
            frames: this.anims.generateFrameNumbers('enemigo', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        //CONTROLES
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update ()
    {
        //REPRODUCIR ANIMACION DEL ENEMIGO
        this.enemies.getChildren().forEach(enemigo => {
            enemigo.play('fren', true);
        });

        //MOVIMIENTO Y ANIMACIONES DEL JUGADOR
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-180);

            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(180);

            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-250);
        }

        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('SPACE'))) {
            this.disparar();
            //this.sound.play('shotSound');
        }
    }

    disparar() {
        const bullet = this.physics.add.image(this.player.x, this.player.y, 'bullet');

        if (bullet) {
            bullet.enableBody(true, this.player.x, this.player.y, true, true);
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityY(-400);
            bullet.body.allowGravity = false;

            // Escucha la colisión de las balas con las plataformas
            this.physics.add.collider(bullet, this.platform, this.destroyBullet, null, this);
            this.physics.add.collider(bullet, this.ground, this.destroyBullet, null, this);
            this.physics.add.collider(bullet, this.enemies, this.bulletEnemyCollision, null, this);
        }
    }

    destroyBullet(bullet) {
        bullet.destroy();
    }

    bulletEnemyCollision(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
        //this.sound.play('enemyKill');
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

const config = {
    type: Phaser.AUTO,
    width: 300,
    height: 500,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: false
        }
    },
    scene: [Scene1, Scene2]
};

const game = new Phaser.Game(config);