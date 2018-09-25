const bitCount = require('./bitCount');

class Motion {
    constructor(){
        this.canExecute = false;
        this.frameBufferN = 10;
        this.frameBuffer = this.frameBufferN;
        this.i = 0;
    }
    getDirBits(i){
        let dir = 0;
        dir = (dir << 1) + i.has('up');
        dir = (dir << 1) + i.has('down');
        dir = (dir << 1) + i.has('left');
        dir = (dir << 1) + i.has('right');
        return dir;
    }
    isUp(i){ return this.getDirBits(i) === 0b1000; }
    isDown(i){ return this.getDirBits(i) === 0b0100; }
    isLeft(i){ return this.getDirBits(i) === 0b0010; }
    isRight(i){ return this.getDirBits(i) === 0b0001; }
    // override this
    feed(input){}
}
// names are derived using numpad notation for the
// motion of the input
// 7 8 9   ⬉ ⬆ ⬈
// 4 5 6   ⬅ N ➡
// 1 2 3   ⬋ ⬇ ⬊
//----------------------------------------------
// overdrive motions
class M360 extends Motion {
    constructor(){
        super();
        this.dirs = [];
    }
    validRoute(){
        let updown = [0b1000, 0b0100];
        let leftright = [0b0010, 0b0001];
        let goUpDown = true;
        let dirs = this.dirs;
        for (let i = 0; i < dirs.length; i++){
            if (i === 0){
                let ud = updown.indexOf(dirs[i]);
                let lr = leftright.indexOf(dirs[i]);
                if (~ud){
                    updown.splice(ud, 1);
                    goUpDown = false;
                }
                if (~lr){
                    leftright.splice(lr, 1);
                    goUpDown = true;
                }
            } else {
                if (goUpDown){
                    let ud = updown.indexOf(dirs[i]);
                    if (~ud){
                        updown.splice(ud, 1);
                        goUpDown = false;
                    } else {
                        return false;
                    }
                } else {
                    let lr = leftright.indexOf(dirs[i]);
                    if (~lr){
                        leftright.splice(lr, 1);
                        goUpDown = true;
                    } else {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    toString(){
        return '360';
    }
    feed(input){
        if (this.dirs.length === 4 && this.frameBuffer > 0){
            this.canExecute = true;
        } else if (this.frameBuffer === 0){
            this.canExecute = false;
            this.frameBuffer = this.frameBufferN;
            this.dirs.length = 0;
        } else {
            let dir = this.getDirBits(input);
            if (bitCount(dir) === 1){
                if (this.dirs[this.dirs.length-1] !== dir){
                    this.dirs.push(dir);
                }
                if (!this.validRoute()){
                    this.dirs.length = 0;
                }
                this.frameBuffer = this.frameBufferN;
            } else {
                this.frameBuffer--;
            }
        }
        this.frameBuffer--;
    }
}
class M2424 extends Motion {
    toString(){
        return '214214';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.isLeft(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 2:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 3:
            if (this.isLeft(input) && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
class M2626 extends Motion {
    toString(){
        return '236236';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.isRight(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 2:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 3:
            if (this.isRight(input) && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
class M2426 extends Motion {
    toString(){
        return '2141236';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.isLeft(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 2:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 3:
            if (this.isRight(input) && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
class M2624 extends Motion {
    toString(){
        return '2363214';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.isRight(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 2:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 3:
            if (this.isLeft(input) && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
class M6246 extends Motion {
    toString(){
        return '632146';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isRight(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 2:
            if (this.isLeft(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 3:
            if (this.isRight(input) && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
class M4264 extends Motion {
    toString(){
        return '412364';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isLeft(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 2:
            if (this.isRight(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 3:
            if (this.isLeft(input) && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
// special motions
class M63214 extends Motion {
    constructor(){
        super();
        this.is6214 = false;
    }
    toString(){
        return '63214';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isRight(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.getDirBits(input) === 0b0101 || this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            if (this.isDown(input)){
                this.is6214 = true;
            }
            break;
        case 2:
            if ((this.is6214 && this.getDirBits(input) === 0b0110) || this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 3:
            if (this.isLeft(input) && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
class M41236 extends Motion {
    constructor(){
        super();
        this.is4236 = false;
    }
    toString(){
        return '41236';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isLeft(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.getDirBits(input) === 0b0110 || this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            if (this.isDown(input)){
                this.is4236 = true;
            }
            break;
        case 2:
            if ((this.is4236 && this.getDirBits(input) === 0b0101) || this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 3:
            if (this.isRight(input) && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
class M421 extends Motion {
    toString(){
        return '421';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isLeft(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 2:
            if (this.getDirBits(input) === 0b0110 && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
class M623 extends Motion {
    toString(){
        return '623';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isRight(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 2:
            if (this.getDirBits(input) === 0b0101 && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
class M214 extends Motion {
    toString(){
        return '214';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.getDirBits(input) === 0b0110){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 2:
            if (this.isLeft(input) && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
class M236 extends Motion {
    toString(){
        return '236';
    }
    feed(input){
        switch(this.i){
        case 0:
            if (this.isDown(input)){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 1:
            if (this.getDirBits(input) === 0b0101){
                this.i++;
                this.frameBuffer = this.frameBufferN;
            }
            break;
        case 2:
            if (this.isRight(input) && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.i = 0;
                this.frameBuffer = this.frameBufferN;
            }
        }
        this.frameBuffer--;
    }
}
class M46 extends Motion {
    constructor(){
        super();
        this.charge = 0;
        this.chargeMax = 30;
    }
    toString(){
        return '[4]6';
    }
    feed(input){
        if (this.charge > this.chargeMax &&
            this.isRight(input) &&
            this.frameBuffer > 0){
            this.canExecute = true;
        } else if (input.has('left')){
            this.charge++;
        } else if (this.frameBuffer === 0){
            this.canExecute = false;
            this.frameBuffer = this.frameBufferN;
            this.charge = 0;
        } else {
            this.frameBuffer--;
        }
    }
}
class M28 extends Motion {
    constructor(){
        super();
        this.charge = 0;
        this.chargeMax = 30;
    }
    toString(){
        return '[2]8';
    }
    feed(input){
        if (this.charge > this.chargeMax &&
            input.has('up') &&
            this.frameBuffer > 0){
            this.canExecute = true;
        } else if (input.has('down')){
            this.charge++;
        } else if (this.frameBuffer === 0){
            this.canExecute = false;
            this.frameBuffer = this.frameBufferN;
            this.charge = 0;
        } else {
            this.frameBuffer--;
        }
    }
}
class M252 extends Motion {
    toString(){
        return '252';
    }
    feed(input){
        switch (this.i) {
        case 0:
            if (this.isDown(input)){
                this.i++;
            }
            break;
        case 1:
            if (!(input.has('up') || input.has('down'))){
                this.i++;
            }
            break;
        case 2:
            if (this.isDown(input) && this.frameBuffer > 0){
                this.canExecute = true;
            } else if (this.frameBuffer === 0){
                this.canExecute = false;
                this.frameBuffer = this.frameBufferN;
                this.i = 0;
            } else {
                this.frameBuffer--;
            }
        }
    }
}
class M2 extends Motion {
    toString(){
        return '2';
    }
    feed(input){
        if (input.has('down')){
            let left = input.has('left'),
                right = input.has('right');
            if ((left ^ right) || !(left & right) ){
                return this.canExecute = true;
            }
        }
        return this.canExecute = false;
    }
}
class M4 extends Motion {
    toString(){
        return '4';
    }
    feed(input){
        if (this.isLeft(input)){
            return this.canExecute = true;
        }
        return this.canExecute = false;
    }
}
class M6 extends Motion {
    toString(){
        return '6';
    }
    feed(input){
        if (this.isRight(input)){
            return this.canExecute = true;
        }
        return this.canExecute = false;
    }
}
// this will represent a jumping state
class M8 extends Motion {
    toString(){
        return 'j.'
    }
    feed(input){
        if (input.has('up')){
            let left = input.has('left'),
                right = input.has('right');
            if ((left ^ right) || !(left & right) ){
                return this.canExecute = true;
            }
        }
        return this.canExecute = false;
    }
}

module.exports = {
    Motion: Motion,
    M360: M360,
    M2424: M2424,
    M2626: M2626,
    M2426: M2426,
    M2624: M2624,
    M6246: M6246,
    M4264: M4264,
    M63214: M63214,
    M41236: M41236,
    M421: M421,
    M623: M623,
    M214: M214,
    M236: M236,
    M46: M46,
    M28: M28,
    M252: M252,
    M2: M2,
    M4: M4,
    M6: M6,
    M8: M8
};