const ipc = require('electron').ipcRenderer;
const loop = require('./utils/loop');
const net = require('net');
const config = require('../../config');
const path = require('path');
const fs = require('fs');
const client = net.createConnection({ port: config.port }, () => {
	console.log('connected to server!');

loop.loop();

let startToggle = true;

HTMLElement.prototype.toggleClass = function (classname){
	if (this.hasClass(classname)){
		this.removeClass(classname);
	} else {
		this.addClass(classname);
	}
}

HTMLElement.prototype.hasClass = function(className) {
  if (this.classList)
    return this.classList.contains(className)
  else
    return !!this.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

HTMLElement.prototype.addClass = function(className) {
  if (this.classList)
    this.classList.add(className)
  else if (!hasClass(this, className)) this.className += " " + className
}

HTMLElement.prototype.removeClass = function(className) {
  if (this.classList)
    this.classList.remove(className)
  else if (hasClass(this, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    this.className=this.className.replace(reg, ' ')
  }
}


class CropItem{
	constructor(name, element, x1, y1, x2, y2){
		this.prev = null;
		this.next = null;
		this.name = name;
		this.x1 = x1 || null;
		this.y1 = y1 || null;
		this.x2 = x2 || null;
		this.y2 = y2 || null;
		this.frameStart = null;
		this.frameEnd = null;
		this.element = element;
	}
	setXY(x1, y1, x2, y2){
		let x = [x1, x2]
		let y = [y1, y2]
		this.x1 = Math.min(...x);
		this.y1 = Math.min(...y);
		this.x2 = Math.max(...x);
		this.y2 = Math.max(...y);
		this.drawCropBox();
	}
	drawCropBox(){
		if (this.x1 !== null || 
			this.y1 !== null ||
			this.x2 !== null ||
			this.y2 !== null
			){
			let cropBox = document.getElementById('crop-box');
			let preview = document.getElementById('preview');
			cropBox.style.left = preview.offsetLeft + this.x1 + 'px';
			cropBox.style.top = preview.offsetTop + this.y1 + 'px';
			cropBox.style.width = this.x2 - this.x1 + 'px';
			cropBox.style.height = this.y2 - this.y1 + 'px';
			cropBox.style.display = 'block';
		} else {
			let cropBox = document.getElementById('crop-box');
			cropBox.style.left = null;
			cropBox.style.top = null;
			cropBox.style.width = null;
			cropBox.style.height = null;
			cropBox.style.display = 'none';
		}
	}
	drawFrameCapture(){
		let carousel = document.getElementById('screenshot-carousel');
		for (let i = 0; i < carousel.children.length; i++){
			if (i >= this.frameStart && i <= this.frameEnd){
				carousel.children[i].addClass('frame-capture');
			} else {
				carousel.children[i].removeClass('frame-capture');
			}
		}
	}
}

class CropList{
	constructor(){
		this.first = null;
		this.last = null;
		this.length = 0;
		this.__activeCropItem = null;
	}
	push(cropItem){
		if (this.length === 0){
			this.first = cropItem;
			this.last = cropItem;
		} else{
			cropItem.prev = this.last;
			this.last.next = cropItem;
			this.last = cropItem;
		}
		this.length++;
	}
	set activeCropItem(cropItem){
		if (this.__activeCropItem){
			this.__activeCropItem.element.style.background = 'none';
		}
		if (cropItem){
			cropItem.element.style.background = '#c9c9c9';
			if (cropItem.frameStart !== null){
				let carousel = document.getElementById('screenshot-carousel')
				let ci = carousel.children[cropItem.frameStart]
				ci.scrollIntoViewIfNeeded();
				ci.click();
				cropItem.drawFrameCapture();
			} else {
				let carousel = document.getElementById('screenshot-carousel');
				for (let i = 0; i < carousel.children.length; i++){
					carousel.children[i].removeClass('frame-capture');
				}
			}
			cropItem.drawCropBox();
			cropItem.element.scrollIntoViewIfNeeded()
		}
		this.__activeCropItem = cropItem;
	}
	get activeCropItem(){
		return this.__activeCropItem;
	}
	activeCropItemPrevious(){
		if (this.length <= 1) return;
		if (this.activeCropItem === this.first){
			this.activeCropItem = this.last;
		} else {
			this.activeCropItem = this.activeCropItem.prev;	
		}
	}
	activeCropItemNext(){
		if (this.length <= 1) return;
		if (this.activeCropItem === this.last){
			this.activeCropItem = this.first;
		} else {
			this.activeCropItem = this.activeCropItem.next;	
		}
	}
	export(client){
		let ci = this.first;
		let payload = {
			event: 'export_gifs',
			gifs: []
		};
		let preview = document.getElementById('preview');
		let w = preview.clientWidth;
		let h = preview.clientHeight;
		for (let i = 0; i < this.length; i++){
			if (ci.frameStart !== null || ci.frameEnd !== null){
				payload.gifs.push({
					character: document.getElementById('character').value,
					filename: ci.name + '.gif',
					bbox: [
						ci.x1 / preview.clientWidth,
						ci.y1 / preview.clientHeight,
						ci.x2 / preview.clientWidth,
						ci.y2 / preview.clientHeight
					],
					frame_start: ci.frameStart,
					frame_end: ci.frameEnd
				})
			}
			ci = ci.next;
		}
		document.getElementById('modal').style.display = 'block';
		document.getElementById('progress').style.display = 'block';
		client.write(payload);
	}
	remove(cropItem){
		if (this.length === 0) return;
		let cIPrev = cropItem.prev;
		let cINext = cropItem.next;

		if (cIPrev && cINext){
			cIPrev.next = cINext;
			cINext.prev = cIPrev;
			if (cropItem === this.activeCropItem){
				this.activeCropItem = cIPrev;
			}
		} else if (!cIPrev && cINext){
			this.first = cINext;
			cINext.prev = null;
			if (cropItem === this.activeCropItem){
				this.activeCropItem = cINext;
			}
		} else if (!cINext && cIPrev){
			this.last = cIPrev;
			cIPrev.next = null;
			if (cropItem === this.activeCropItem){
				this.activeCropItem = cIPrev;
			}
		} else {
			this.activeCropItem = null;
			this.first = null;
			this.last = null;
		}

		cropItem.element.remove();
		this.length--;
	}
}

class AnimationManager{
	constructor(){
		this.crops = document.getElementById('screenshot-crops');
		this.carousel = document.getElementById('screenshot-carousel');
		this.preview = document.getElementById('preview');
		this.cropList = new CropList();
		this.createCropList();
		this.activeCarouselItem = null;
		this.cropboxStore = {
			x1: null,
			y1: null,
			x2: null,
			y2: null
		};
	}
	createCropList(){
		let moves = [
			// normals
			'5P', '5K', 'c.S', 'f.S', '5H', '5D',
			'6P', '6K', '6S', '6H', '6D',
			'2P', '2K', '2S', '2H', '2D',
			'j.P', 'j.K', 'j.S', 'j.H', 'j.D'
		]
		/*
		moves.appendMoves = (function(arr){
			return (motion) => {
				arr.push(...[
					motion+'P',
					motion+'K',
					motion+'S',
					motion+'H',
					motion+'D',
				]);
			}
		})(moves);
		moves.appendMoves('252');
		moves.appendMoves('[2]8');
		moves.appendMoves('[4]6');
		moves.appendMoves('236');
		moves.appendMoves('214');
		moves.appendMoves('623');
		moves.appendMoves('421');
		moves.appendMoves('41236');
		moves.appendMoves('412364');
		moves.appendMoves('63214');
		moves.appendMoves('632146');
		moves.appendMoves('2363214');
		moves.appendMoves('2141236');
		moves.appendMoves('236236');
		moves.appendMoves('214214');
		*/

		for (let i = 0; i < moves.length; i++){
			this.createCropItem(moves[i]);
		}
		this.cropList.activeCropItem = this.cropList.first;
	}
	createCropItem(name, x1, y1, x2, y2){
		let tr = document.createElement('tr');
		let move = document.createElement('td');
		move.title = name;
		move.innerText = name;

		let remove = document.createElement('td');
		let removeButton = document.createElement('button');
		removeButton.innerText = '🗙';
		remove.appendChild(removeButton);

		tr.appendChild(move);
		tr.appendChild(remove);

		this.crops.appendChild(tr);
		let cropItem = new CropItem(name, tr);

		removeButton.onclick = () => {
			this.cropList.remove(cropItem);
			let ci = this.cropList.first;
			for (let i = 0; i < this.cropList.length; i++){
				ci = ci.next;
			}
		};
		move.onclick = () => {
			let c = this.cropboxStore;
			({x1, y1, x2, y2} = this.cropList.activeCropItem);
			c.x1 = x1;
			c.y1 = y1;
			c.x2 = x2;
			c.y2 = y2;
			this.cropList.activeCropItem = cropItem;
		}

		this.cropList.push(cropItem);
		return cropItem;
	}
	setStart(){
		let cropItem = this.cropList.activeCropItem;
		if (cropItem === null || !this.preview.style.backgroundImage) return;
		let start = Number(/(\d+)\.png\?\d+"\)/.exec(this.preview.style.backgroundImage)[1]);
		cropItem.frameStart = start;
		if (cropItem.frameEnd < start || cropItem.frameEnd === null){
			cropItem.frameEnd = start
		}
		cropItem.drawFrameCapture();
	}
	setEnd(){
		let cropItem = this.cropList.activeCropItem;
		if (cropItem === null || !this.preview.style.backgroundImage) return;
		let end = Number(/(\d+)\.png\?\d+"\)/.exec(this.preview.style.backgroundImage)[1]);
		cropItem.frameEnd = end;
		if (cropItem.frameStart > end || cropItem.frameStart === null){
			cropItem.frameStart = end
		}
		cropItem.drawFrameCapture();
	}
	setPreview(img){
		let file = img.style.backgroundImage;
		this.preview.style.backgroundImage = file;
		this.preview.dataset.number = img.dataset.number;
	}
	appendImage(data){
		/*
		data: {
			file:
			width:
			height:
		}
		*/
		let img = document.createElement('div');

		img.dataset.number = /(\d+\.png)/i.exec(data.file)[1];
		img.addClass('img');
		img.style.backgroundSize = 'cover';
		img.style.width = data.width * 0.05 + 'px';
		img.style.height = data.height * 0.05 + 'px';

		data.file = `url('${data.file.replace(/\\/g, '/')}?${+new Date()}')`;
		img.style.backgroundColor = 'black';
		img.style.backgroundImage = data.file;
		img.onwheel = e => {
			e = {
				deltaY: e.deltaY,
				target: this.carousel,
				preventDefault: () => {}
			}
			horizontalScroll(e);
		};
		img.style.cursor = 'pointer';
		img.onclick = e => {
			this.setPreview(e.target);
			if (this.activeCarouselItem){
				this.activeCarouselItem.removeClass('carousel-img-active');
			}
			img.addClass('carousel-img-active');
			img.scrollIntoViewIfNeeded();
			this.activeCarouselItem = img;
		};

		this.carousel.appendChild(img);
		Array.from(this.carousel.children).sort((a, b) => {
			let nRe = /^\d+/
			let aData = nRe.exec(a.dataset.number);
			let bData = nRe.exec(b.dataset.number);
			aData = aData ? Number(aData[0]) : 0;
			bData = bData ? Number(bData[0]) : 0;
			return aData < bData ? -1 : aData > bData ? 1 : 0;
		}).forEach(i => {
			this.carousel.append(i);
		})
	}
	reloadImages(){
		let char = document.getElementById('character').value;
		let dir = path.join(__dirname, '..', '..', 'screenshots', char);
		try{
			if (!fs.statSync(dir).isDirectory()) return;
		} catch (e){}

		// get screenshot paths
		let imgs = [];
		let imgRe = /(\d+)\.png$/;
		fs.readdirSync(dir).forEach(file => {
			if (imgRe.test(file)){
				imgs.push(file);
			}
		})
		imgs.sort((a, b) => {
			let aD = Number(imgRe.exec(a)[1]);
			let bD = Number(imgRe.exec(b)[1]);
			return aD < bD ? -1 : aD > bD ? 1 : 0;
		})

		// get width and height of screenshots
		if (imgs.length === 0) return;
		new Promise((resolve, reject) => {
			let img = new Image();
			img.onload = function(){
				let {width, height} = this;
				resolve({width: width, height: height});
			}
			img.src = `file:///${path.join(dir, imgs[0])}`;
		})
			.then(d => {
				while (this.carousel.children.length){
					this.carousel.children[0].remove();
				}
				this.activeCarouselItem = null;

				let i = 0;
				let interval = setInterval(() => {
					if (i === imgs.length) clearInterval(interval);
					else {
						let f = path.join(dir, imgs[i]);
						this.appendImage({
							file: f,
							width: d.width,
							height: d.height
						});
					}
					i++;
				}, 1);
			});

	}
	clear(){
		let cl = this.cropList.first;
		for (let i = 0; i < this.cropList.length; i++){
			cl.x1 = null;
			cl.y1 = null;
			cl.x2 = null;
			cl.y2 = null;
			cl.frameStart = null;
			cl.frameEnd = null;
			cl = cl.next;
		}
		while (this.carousel.children.length){
			this.carousel.children[0].remove();
		}
		this.activeCarouselItem = null;
		document.getElementById('crop-box').style = null;
		document.getElementById('crop-box').style.display = 'none';
	}
}
let AM = new AnimationManager();

function start(e){
	if (startToggle){
		AM.clear();
		startToggle = false;
		e.target.disabled = true;
		client.write({
			event: 'start',
			character: document.getElementById('character').value
		})
	}
};

let currX;
let currY;
function mouseWithinElement(element){
	let {x, right, y, bottom} = element.getBoundingClientRect()
	return (currX >= x && currX <= right) && (currY >= y && currY <= bottom);
}
document.onmousemove = e => {
	currX = e.clientX;
	currY = e.clientY;
}
document.oncontextmenu = e => {
	if (mouseWithinElement(AM.preview)){
		e.preventDefault();
		({x1, y1, x2, y2} = AM.cropboxStore);
		AM.cropList.activeCropItem.setXY(x1, y1, x2, y2);
	}
}
document.onclick = (function(){
	let clicks = 0;
	let coords = {
		x0: null,
		x1: null,
		y0: null,
		y1: null
	};
	return e => {
		if (mouseWithinElement(AM.preview) && AM.preview.style.opacity < 1){
			switch(clicks){
				case 0:
				case 1:
					coords['x'+clicks] = e.clientX - AM.preview.offsetLeft
					coords['y'+clicks] = e.clientY - AM.preview.offsetTop
					clicks++;
			}
			if (clicks > 1){
				let ci = AM.cropList.activeCropItem;
				if (ci){
					ci.setXY(
						coords.x0,
						coords.y0,
						coords.x1,
						coords.y1
					);
				}
				clicks = 0;
				coords.x0 = null;
				coords.y0 = null;
				coords.x1 = null;
				coords.y1 = null;
				AM.preview.style.opacity = 1;
			} else {
				let cropBox = document.getElementById('crop-box');
				let preview = document.getElementById('preview');
				cropBox.style.left = preview.offsetLeft + coords.x0 + 'px';
				cropBox.style.top = preview.offsetTop + coords.y0 + 'px';
				cropBox.style.height = 0;
				cropBox.style.width = 0;
				cropBox.style.display = 'block';
			}
		}
	}
})()

function cropSelect(e){
	if (AM.cropList.activeCropItem){
		AM.preview.style.opacity = 0.4;	
	}
}

function horizontalScroll(e){
	e.target.scrollLeft += e.deltaY;
	e.preventDefault();
};
document.getElementById('screenshot-carousel').oncontextmenu = () => {
	AM.reloadImages();
}
document.getElementById('screenshot-carousel').onwheel = horizontalScroll;
document.getElementById('start').onclick = e => {
	e.target.blur();
	start(e);
}
document.getElementById('first-frame').onclick = e => {
	e.target.blur();
	AM.setStart();
}
document.getElementById('crop').onclick = e => {
	e.target.blur();
	cropSelect();
};
document.getElementById('last-frame').onclick = e => {
	e.target.blur();
	AM.setEnd();
}
document.getElementById('export-gifs').onclick = e => {
	e.target.blur();
	AM.cropList.export(client);
}
document.getElementById('add-crop-button').onclick = () => {
	document.getElementById('modal').style.display = 'block';
	document.getElementById('menu').style.display = 'block';
};
document.getElementById('add-move').onclick = () => {
	let move = document.getElementById('move').value;
	if (move){
		AM.cropList.activeCropItem = AM.createCropItem(move);
	}
};
document.getElementById('close-modal').onclick = () => {
	document.getElementById('modal').style.display = 'none';
	document.getElementById('menu').style.display = 'none';
};
addEventListener('controllerInput', e => {
	if (document.activeElement === document.getElementById('move')) return;
	let stick = document.getElementById('stick-ball');
	let inputFlags = e.detail;
	let dir = 0;
	dir = (dir << 1) + inputFlags.up;
	dir = (dir << 1) + inputFlags.down;
	dir = (dir << 1) + inputFlags.left;
	dir = (dir << 1) + inputFlags.right;
	switch (dir){
		case 0b0110: stick.style.top = '54px'; stick.style.left = '-6px'; break; // 1
		case 0b0100: stick.style.top = '54px'; stick.style.left = ''; break; // 2
		case 0b0101: stick.style.top = '54px'; stick.style.left = '54px'; break; // 3
		case 0b0010: stick.style.top = '24px'; stick.style.left = '-6px'; break; // 4
		case 0b0000: stick.style.top = '24px'; stick.style.left = '24px'; break; // 5
		case 0b0001: stick.style.top = '24px'; stick.style.left = '54px'; break; // 6
		case 0b1010: stick.style.top = '-6px'; stick.style.left = '-6px'; break; // 7
		case 0b1000: stick.style.top = '-6px'; stick.style.left = '24px'; break; // 8
		case 0b1001: stick.style.top = '-6px'; stick.style.left = '54px'; break; // 9
	}
	for (let input in inputFlags){
		if (input.length === 1){
			let PKSHD = document.getElementById(input);
			if (inputFlags[input]){
				PKSHD.addClass('active')
			} else {
				PKSHD.removeClass('active')
			}		
		}
	}
})
addEventListener('controllerMotion', e => {
	if (document.activeElement === document.getElementById('move')) return;
	document.getElementById('move').value = e.detail;
})

// keyboard shortcuts
let frameSetHeld = false;
document.body.onkeydown = e => {
	let ssCrops = document.getElementsByClassName('screenshot-crops-container')[0];
	let ssCarousel = document.getElementById('screenshot-carousel');
	if (mouseWithinElement(ssCrops) || mouseWithinElement(ssCarousel)){
		return;
	}
	let frame = /\d+/.exec(AM.preview.dataset.number);
	if (frame) frame = Number(frame[0]);
	switch (e.which){
		case 38: // UP
			AM.cropList.activeCropItemPrevious();
			break;
		case 40: // DOWN
			AM.cropList.activeCropItemNext();
			break;
		case 37: // LEFT
			if (frame === null) break;
			for (let i = 0; i < ssCarousel.children.length; i++){
				if (i === frame-1){
					ssCarousel.children[i].click();
				}
			}
			break;
		case 39: // RIGHT
			if (frame === null) break;
			for (let i = 0; i < ssCarousel.children.length; i++){
				if (i === frame+1){
					ssCarousel.children[i].click();
				}
			}
			break;
		case 32: // SPACE
			cropSelect();
			break;
		case 27: // ESC
			if (document.getElementById('modal').style.display === 'block'){
				document.getElementById('modal').style.display = 'none';
				document.getElementById('menu').style.display = 'none';
			}
			break;
		case 13: // ENTER
			if (document.getElementById('modal').style.display === 'block'){
				document.getElementById('add-move').click();
			}
			break;
		//e.preventDefault();
	}
	if (e.ctrlKey && (e.which === 17 || e.which === 37 || e.which === 39)){ // 17 - CTRL
		if (!frameSetHeld){
			AM.setStart();
			AM.setEnd();
			frameSetHeld = true;	
		} else {
			if (e.which === 37) AM.setStart();
			if (e.which === 39) AM.setEnd();
		}
	}
}

document.body.onkeyup = e => {
	if (frameSetHeld && e.which === 17){
		frameSetHeld = false;
	}
}

document.getElementById('character').focus();


client.write = (function(write){
	return function (data){
		if (typeof data === 'object'){
			data = JSON.stringify(data);
		}
		write.apply(this, arguments)
	}
})(client.write);

ipc.send('ready');

client.on('end', data => {
	console.log('disconnected from server');
});

client.on('data', (data) => {
	data = JSON.parse(data);
	if (data.event === 'stop'){
		startToggle = true;
		document.getElementById('start').disabled = false;
	} else if (data.event === 'new_file'){
		AM.appendImage(data);
	} else if (data.event === 'export_progress'){
		let progress = document.getElementById('progress');
		progress.dataset.progress = data.message;
		progress.style.width = (data.progress/data.complete*522) + 'px';
		if (data.progress >= data.complete){
			progress.style.display = 'none';
			document.getElementById('modal').style.display = 'none';
			progress.dataset.progress = '';
			progress.style.width = 0;
		}
	} else if (data.event === 'error'){
		console.error(data.error);
	}
});

ipc.on('start', () => {
	let e = {
		target: document.getElementById('start')
	}
	start(e);
});


});