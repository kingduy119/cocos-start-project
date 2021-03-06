// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import * as socket from "./socket";
import { get, isEmpty, pick } from "lodash";
import global from "./global";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Label)
    usernameDisplay: cc.Label = null;
    
    @property
    jumpHeight: number = 0;

    @property
    jumpDuration: number = 0;

    @property
    maxMoveSpeed: number = 0;

    @property
    accel: number = 0;

    @property(cc.AudioClip)
    jumpAudio: cc.AudioClip = null;

    id: string = "";
    username: string = "";
    score: number = 0;
    accLeft: boolean = false;
    accRight: boolean = false;
    accUp: boolean = false;
    accDown: boolean = false;
    xSpeed: number = 0;
    ySpeed: number = 0;
    target:any = [];

    getData () {
        // return Object.assign({},
        //     ,
        // );
        return pick(this, ['id', 'accLeft', 'accRight', 'accUp', 'accDown', 'accel', 'score', 'username'])
    }
    setData(data: any) {
        this.id = get(data, "id", this.id);
        this.username = get(data, "username", this.username);
        this.score = get(data, "score", this.score);
        this.node.x = get(data, 'x', this.node.x);
        this.node.y = get(data, 'y', this.node.y);
    }
    // runJumpAction () {
    //     var jumpUp = cc.tween().by(this.jumpDuration, {y: this.jumpHeight}, {easing: 'sineOut'});
    //     var jumpDown = cc.tween().by(this.jumpDuration, {y: -this.jumpHeight}, {easing: 'sineIn'});

    //     // Create a easing
    //     var tween = cc.tween()
    //                     // perform actions in the order of "jumpUp", "jumpDown"
    //                     .sequence(jumpUp, jumpDown)
    //                     // Add a callback function to invoke the "playJumpSound()" method we define after the action is finished
    //                     .call(this.playJumpSound, this);
                        
    //     return cc.tween().repeatForever(tween);
    // }

    // playJumpSound () {
    //     // Invoke sound engine to play the sound
    //     cc.audioEngine.playEffect(this.jumpAudio, false);
    // }

    onKeyDown (event: any) {
        // Set a flag when key pressed
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                this.accLeft = true;
                break;
            case cc.macro.KEY.d:
                this.accRight = true;
                break;
            case cc.macro.KEY.w:
                this.accUp = true;
                break;
            case cc.macro.KEY.s:
                this.accDown = true;
                break;
        }
    }
    onKeyUp (event: any) {
        // Unset a flag when key released
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                this.accLeft = false;
                break;
            case cc.macro.KEY.d:
                this.accRight = false;
                break;
            case cc.macro.KEY.w:
                this.accUp = false;
                break;
            case cc.macro.KEY.s:
                this.accDown = false;
                break;
        }
    }

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        // this.id = get(global.player, "id", this.id);
        this.username = get(global.player, "username", this.username);

        // Initialize the keyboard input listening
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        socket.getSocket().on("player-init", (data: any) => {
            this.setData(data);
            global.player.id = this.id;
        })
        socket.getSocket().on("player-ping", (data: any) => {
            socket.getSocket().emit("player-ping", data);
        })

        socket.getSocket().on('game-update', (data: any[]) => {
            let id = get(this, 'id');
            let users = get(data, 'users', []);
            this.target = users[id];
            this.setData(pick(users[id], ["score"]));
            console.log("GAME_UPDATE");
        });
        

        socket.getSocket().emit("player-request-init", pick(this, "username"));
    }

    onDestroy () {
        // Cancel keyboard input monitoring
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    start() {}

    // start () {}
    update (dt: any) {
        Object.assign(global.player, pick(this, ['username', 'score']));
        this.usernameDisplay.string = `${this.username}: ${this.score}`;
        
        if(!isEmpty(this.target)) {
            let x = interpolation(this.node.x, dt, this.target.x, this.target.xSpeed);
            if(!isNaN(x)) this.node.x += x;

            let y = interpolation(this.node.y, dt, this.target.y, this.target.ySpeed);
            if(!isNaN(y)) this.node.y += y;
        }
        
        socket.getSocket().emit("player-update", this.getData());
    }
}

function interpolation(start:number , delta:number, end:number, speed:number = 0) {
    let distance = end - start;
    let time = distance / speed;

    let y = delta / (time - delta);
    let x = (y * distance) / (y + 1) ; // <=>  y = x / (distance - x)

    return x;
}
