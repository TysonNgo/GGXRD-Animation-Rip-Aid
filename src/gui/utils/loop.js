const Controller = require('./controller');
const buttonConfig = require('./buttonConfig');
class Loop{
	constructor(){
		this.controller = new Controller(buttonConfig);
		this.fps = 60;
		this.now;
		this.then = Date.now();
		this.interval = 1000/this.fps;
		this.delta;
		this.loop = this.loop.bind(this);
	}
	loop() {
		requestAnimationFrame(this.loop);
		this.now = Date.now();
		this.delta = this.now - this.then;
	   
		if (this.delta > this.interval) {
			// force 60 fps
			this.then = this.now - (this.delta % this.interval);

			let i = this.controller.inputs;
			this.controller.pushInput();
			let inputEvent = new CustomEvent('controllerInput', { detail: this.controller.inputFlags });
			let motion = this.controller.inputBuffer.exec();
			dispatchEvent(inputEvent);
			if (motion){
				let motionEvent = new CustomEvent('controllerMotion', {detail: motion});
				dispatchEvent(motionEvent);
			}
		}
	}
}

module.exports = new Loop();