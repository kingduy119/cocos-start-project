// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import * as socket from "./socket";
import { get, pick } from "lodash";
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

    getData () {
        return Object.assign({},
            pick(this, ['id', 'accLeft', 'accRight', 'accUp', 'accDown', 'accel', 'score', 'username']),
            {
                x: this.node.x,
                y: this.node.y,
            }
        );
    }

    runJumpAction () {
        var jumpUp = cc.tween().by(this.jumpDuration, {y: this.jumpHeight}, {easing: 'sineOut'});
        var jumpDown = cc.tween().by(this.jumpDuration, {y: -this.jumpHeight}, {easing: 'sineIn'});

        // Create a easing
        var tween = cc.tween()
                        // perform actions in the order of "jumpUp", "jumpDown"
                        .sequence(jumpUp, jumpDown)
                        // Add a callback function to invoke the "playJumpSound()" method we define after the action is finished
                        .call(this.playJumpSound, this);
                        
        return cc.tween().repeatForever(tween);
    }

    playJumpSound () {
        // Invoke sound engine to play the sound
        cc.audioEngine.playEffect(this.jumpAudio, false);
    }

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

    // Update speed of each frame according to the current acceleration direction
    onUpdateMovement(dt: any) {
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } 
        else if(!this.accLeft && this.xSpeed < 0) {
            this.xSpeed += this.accel * dt;
        }
        else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }
        else if(!this.accRight && this.xSpeed > 0) {
            this.xSpeed -= this.accel * dt;
        }

        if(this.accUp) {
            this.ySpeed += this.accel * dt;
        }
        else if(!this.accUp && this.ySpeed > 0) {
            this.ySpeed -= this.accel * dt;
        }
        else if(this.accDown) {
            this.ySpeed -= this.accel * dt;
        }
        else if(!this.accDown && this.ySpeed < 0) {
            this.ySpeed += this.accel * dt;
        }

        // Restrict the movement speed of the main character to the maximum movement speed
        // If speed reach limit, use max speed with current direction
        if ( Math.abs(this.xSpeed) > this.maxMoveSpeed ) {
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }
        if ( Math.abs(this.ySpeed) > this.maxMoveSpeed ) {
            this.ySpeed = this.maxMoveSpeed * this.ySpeed / Math.abs(this.ySpeed);
        }

        // Update the position of the main character according to the current speed
        this.node.x += this.xSpeed * dt;
        this.node.y += this.ySpeed * dt;
    }

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.id = get(global.player, "id", this.id);
        this.username = get(global.player, "username", this.username);

        // Initialize the keyboard input listening
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }
    onDestroy () {
        // Cancel keyboard input monitoring
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    // start () {}
    update (dt: any) {
        this.usernameDisplay.string = `${this.username}: ${this.score}`;
        this.onUpdateMovement(dt);
        socket.getSocket().emit("user-update", this.getData());
    }
}
