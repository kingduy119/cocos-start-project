// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import * as socket from "./socket";
import { get, pick, isEmpty } from "lodash";
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

    id: number = 0;
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
            // pick(this.node, ['x, y']),
        );
    }
    setData (data: any) {
        this.id = get(data, 'id', this.id);
        this.score = get(data, 'score', this.score);
        this.username = get(data, 'username', this.username);
        this.node.x = get(data, 'x', this.node.x);
        this.node.y = get(data, 'y', this.node.y);
        this.accLeft = get(data, 'accLeft', this.accLeft);
        this.accRight = get(data, 'accRight', this.accRight);
        this.accUp = get(data, 'accUp', this.accUp);
        this.accDown = get(data, 'accDown', this.accDown);
        this.accel = get(data, 'accel', this.accel);
    }

    // Update speed of each frame according to the current acceleration direction
    onUpdateMovement(dt: any) {
        // Move X
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

        // Move Y
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
        socket.getSocket().on('game-update', (data: any[]) => {
            let users = get(data, 'users', []);
            if(!isEmpty[users[this.id]]) this.setData(users[this.id]);
        });
    }
    start () {
        console.log(`USER-start-${this.id}`);
        socket.getSocket().on(`user-destroy-${this.id}`, () => {
            this.node.destroy();
        });
    }
    update (dt: any) {
        this.usernameDisplay.string = `${this.username}: ${this.score}`;
        this.onUpdateMovement(dt);
    }

    onDestroy () {
        socket.getSocket().off(`user-destroy-${this.id}`);
    }
}
