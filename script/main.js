var killedEnemy = 0;

function main() {
	let scene = new g.Scene({
		game: g.game,
		assetIds: ["c_06", "e_05", "e_07", "a_01", "b_10", "c_10", "b_12"],
	});
	scene.onLoad.add(function () {
		makeEnemy(scene);
		makeCannon(scene);
	});
	scene.onPointDownCapture.add(function (event) {

		var point = event.point;
		if (event.target) {
			point.x += event.target.x;
			point.y += event.target.y;
		}
		// makeShot(scene, point);
		// makeBall(scene, point);
	});
	scene.onPointMoveCapture.add(function (event) {
		// cannon.x -= 1;
	});
	scene.onUpdate.add(function () {
		if (killedEnemy === 36) {
			gameOver(scene);
			return true; // trueを返すと(`scene.update` から)この関数の登録が解除されます。
		}
	});
	g.game.pushScene(scene);
}

module.exports = main;
function makeEnemy(scene) {
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 10; j++) {
			var movingEnemy = new g.Sprite({
				scene: scene,
				// cssColor: (j < 2 ? "#ff0000" : "#0fffff"),
				src: scene.asset.getImageById("e_05"),
				scaleX: 16 / 32,
				scaleY: 16 / 32,
				x: i * (16 + 4) + 64,
				y: j * (16 + 4) + 30
			});
			movingEnemy.onUpdate.add(function () { // add(func, obj)の形式で呼び出すと、objがfunc呼び出しの際thisとして扱われます。


				if (scene.game.age % scene.game.fps === 0) {
					var tick = Math.round(scene.game.age / scene.game.fps) % 4;
					if (tick === 0 || tick === 1) {
						this.x += 8;
					} else {
						this.x -= 8;
					}
					if (tick === 0 || tick === 2) {
						this.y += 40;
					}
					this.modified();
				}
			}, movingEnemy);
			scene.append(movingEnemy);
		}
	}
	for (var i = 0; i < 4; i++) {
		var stoppedEnemy = new g.Sprite({
			scene: scene,
			// cssColor: "#0000ff",
			src: scene.asset.getImageById("a_01"),
			scaleX: 16 / 32,
			scaleY: 16 / 32,
			x: i * (16 + 4) + 112,
			y: 2
		});
		scene.append(stoppedEnemy);
	}
}
function makeCannon(scene) {
	let cannonX = g.game.width / 2;
	let cannonY = g.game.height - 64;
	var distArrow = 50;
	let speed = 4;
	var cannon = new g.Sprite({
		scene: scene,
		src: scene.asset.getImageById("b_10"),
		x: g.game.width / 2,
		y: cannonY,
		anchorX: 0.5
	});
	cannon.update.add(function () {
		if (cannon.x + speed < 0 || cannon.x + speed >= g.game.width) {
			speed *= -1;
		}
		cannon.x += speed;
		cannon.modified();

		var collisionTarget;
		scene.children.forEach(function (entity) {
			if (cannon === entity)
				return;
			if (g.Collision.intersectAreas(cannon, entity))
				collisionTarget = entity;
		});
		if (!!collisionTarget) {
			cannon.destroy();
			gameOver(scene);
		}
	})
	scene.onPointDownCapture.add(function (ev) {
		makeBall(scene, cannon.x, cannon.y - 50);
	});
	scene.append(cannon);

}
function makeBall(scene, x_, y_) {
	const size = 13;
	let speed = -15;
	var ball = new g.Sprite({
		scene: scene,
		src: scene.asset.getImageById("b_12"),
		anchorX: 0.5,
		anchorY: 0.5,
		x: x_,
		y: y_
	});
	ball.update.add(function () {
		ball.y += speed;
		ball.modified();

		var collisionTarget;
		scene.children.forEach(function (entity) {
			if (ball === entity)
				return;
			if (g.Collision.intersectAreas(ball, entity))
				collisionTarget = entity;
		});
		if (!!collisionTarget) {
			ball.destroy();
			collisionTarget.destroy();
			killedEnemy += 1;
		}

	});
	scene.append(ball);
}

function gameOver(scene) {
	var dfont = new g.DynamicFont({
		fontFamily: "serif",
		size: 80,
		game: scene.game
	});
	var label = new g.Label({
		scene: scene,
		text: "GAME OVER",
		font: dfont,
		fontSize: 40
	});
	label.x = scene.game.width / 2 - label.width / 2;
	label.y = 0;
	label.onUpdate.add(function () {
		if (this.y < scene.game.height / 2 - this.height / 2)
			this.y += 2;
		this.invalidate();
	}, label);
	scene.append(label);
}
