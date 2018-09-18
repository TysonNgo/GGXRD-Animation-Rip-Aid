const m = require('./Motions');

class InputBuffer {
    constructor(){
        this.buffer = [];
        this.maxSize = 60;
        this.pkshdHeld = false;
    }
    push(inputFlags){
        this.buffer.push(inputFlags);
        if (this.buffer.length > 60){
            this.buffer.splice(0, 1);
        }
    }
    getPKSHD(input){
        let result = '';
        result += input.has('P') ? 'P' : '';
        result += input.has('K') ? 'K' : '';
        result += input.has('S') ? 'S' : '';
        result += input.has('H') ? 'H' : '';
        result += input.has('D') ? 'D' : '';
        return result;
    }
    exec(){
        let motions = [
            new m.M360(),
            new m.M2424(),
            new m.M2626(),
            new m.M2426(),
            new m.M2624(),
            new m.M6246(),
            new m.M4264(),
            new m.M63214(),
            new m.M41236(),
            new m.M421(),
            new m.M623(),
            new m.M214(),
            new m.M236(),
            new m.M46(),
            new m.M28(),
            new m.M252(),
            new m.M2(),
            new m.M4(),
            new m.M6(),
            new m.M8()
        ];
        for (let i = 0; i < this.buffer.length; i++){
            for (let j = 0; j < motions.length; j++){
                motions[j].feed(this.buffer[i]);
                if (motions[j].canExecute && 
                    (this.buffer[i].has('P') ||
                     this.buffer[i].has('K') ||
                     this.buffer[i].has('S') ||
                     this.buffer[i].has('H') ||
                     this.buffer[i].has('D'))){
                    let result = motions[j].toString()+this.getPKSHD(this.buffer[i]);
                    this.clear();
                    if (this.pkshdHeld){
                        return;
                    }
                    this.pkshdHeld = true;
                    return result;
                }
            }
            if (this.buffer[i].has('P') ||
                this.buffer[i].has('K') ||
                this.buffer[i].has('S') ||
                this.buffer[i].has('H') ||
                this.buffer[i].has('D')){
                let result = '5'+this.getPKSHD(this.buffer[i]);
                this.clear();
                if (this.pkshdHeld){
                    return;
                }
                this.pkshdHeld = true;
                return result;
            } else {
                this.pkshdHeld = false;
            }
        }
    }
    clear(){
        this.buffer.length = 0;
    }
}

class Controller {
    constructor(bindings={ // button: keycode
        87: 'up',    // W
        83: 'down',  // S
        65: 'left',  // A
        68: 'right', // D
        74: 'P',     // J
        85: 'K',     // U
        73: 'S',     // I
        79: 'H',     // O
        76: 'D'      // L
    }) {
        this.buffer = new InputBuffer();
        this.bindings = bindings;
        this.inputFlags = {
            'up': false,
            'down': false,
            'left': false,
            'right': false,
            'P': false,
            'K': false,
            'S': false,
            'H': false,
            'D': false
        };
        document.body.addEventListener('keydown', e => {
            this.inputFlags[this.bindings[e.which]] = true;
        });
        document.body.addEventListener('keyup', e => {
            this.inputFlags[this.bindings[e.which]] = false;
        });
    }
    pushInput(){
        let i = new Set();
        for (let input in this.inputFlags){
            if (this.inputFlags[input]){
                i.add(input);
            }
        }
        this.buffer.push(i);
    }
    setBinding(button, keycode){
        delete this.bindings[keycode];
        let key;
        for (let k in this.bindings){
            if (this.bindings[k] === button){
                key = k;
            }
        }
        delete this.bindings[key];
        this.bindings[keycode] = button;
    }
    set up(keycode) { this.setBinding('up', keycode); }
    set down(keycode) { this.setBinding('down', keycode); }
    set left(keycode) { this.setBinding('left', keycode); }
    set right(keycode) { this.setBinding('right', keycode); }
    set P(keycode) { this.setBinding('P', keycode); }
    set K(keycode) { this.setBinding('K', keycode); }
    set S(keycode) { this.setBinding('S', keycode); }
    set H(keycode) { this.setBinding('H', keycode); }
    set D(keycode) { this.setBinding('D', keycode); }
    get inputs(){
        let result = '';
        let dir = 0;
        dir = (dir << 1) + this.inputFlags['up'];
        dir = (dir << 1) + this.inputFlags['down'];
        dir = (dir << 1) + this.inputFlags['left'];
        dir = (dir << 1) + this.inputFlags['right'];
        let P = this.inputFlags['P'];
        let K = this.inputFlags['K'];
        let S = this.inputFlags['S'];
        let H = this.inputFlags['H'];
        let D = this.inputFlags['D'];

        switch (dir) {
        case 0b1000: result += '⬆'; break;
        case 0b1001: result += '⬈'; break;
        case 0b0001: result += '➡'; break;
        case 0b0101: result += '⬊'; break;
        case 0b0100: result += '⬇'; break;
        case 0b0110: result += '⬋'; break;
        case 0b0010: result += '⬅'; break;
        case 0b1010: result += '⬉'; break;
        }

        if (P) {result += 'P';}
        if (K) {result += 'K';}
        if (S) {result += 'S';}
        if (H) {result += 'H';}
        if (D) {result += 'D';}
        return result;
    }
    get inputBuffer(){
        return this.buffer;
    }
}

module.exports = Controller;