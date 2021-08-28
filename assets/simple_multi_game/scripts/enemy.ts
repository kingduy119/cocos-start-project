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
    target:any = [];

    getData () {
        return pick(this, ['id', 'username', 'accLeft', 'accRight', 'accUp', 'accDown', 'score'])
    }
    setData (data: any) {
        this.id = get(data, 'id', this.id);
        this.score = get(data, 'score', this.score);
        this.username = get(data, 'username', this.username);
        this.node.x = get(data, 'x', this.node.x);
        this.node.y = get(data, 'y', this.node.y);
        // this.accLeft = get(data, 'accLeft', this.accLeft);
        // this.accRight = get(data, 'accRight', this.accRight);
        // this.accUp = get(data, 'accUp', this.accUp);
        // this.accDown = get(data, 'accDown', this.accDown);
        // this.accel = get(data, 'accel', this.accel);
    }

    // LIFE-CYCLE CALLBACKS:
    onLoad () {

        socket.getSocket().on('game-update', (data: any[]) => {
            let id = get(this, 'id');
            let users = get(data, 'users', []);
            this.target = users[id];
            this.setData(pick(users[id], ["score"]));
        });
    }

    start () {
        socket.getSocket().on(`user-destroy-${this.id}`, () => {
            this.node.destroy();
        });
    }

    update (dt: any) {
        this.usernameDisplay.string = `${this.username}: ${this.score}`;

        if(!isEmpty(this.target)) {
            let x = interpolation(this.node.x, dt, this.target.x, this.target.xSpeed);
            if(!isNaN(x)) this.node.x += x;

            let y = interpolation(this.node.y, dt, this.target.y, this.target.ySpeed);
            if(!isNaN(y)) this.node.y += y;
        }
    }

    onDestroy () {
        socket.getSocket().off(`user-destroy-${this.id}`);
    }
}

function interpolation(start:number , delta:number, end:number, speed:number = 0) {
    let distance = end - start;
    let time = distance / speed;

    let y = delta / (time - delta);
    let x = (y * distance) / (y + 1) ; // <=>  y = x / (distance - x)

    return x;
}