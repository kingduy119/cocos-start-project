// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { get, pick } from "lodash";
import * as socket from "./socket";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property
    pickRadius: number = 0;

    init(data: any) {
        this.id = get(data, 'id', this.id);
        this.node.x = get(data, 'x', this.node.x);
        this.node.y = get(data, 'y', this.node.y);
        this.visible = get(data, 'visible', this.visible);
    }

    getData() {
        return Object.assign({}, 
            pick(this, ['id', 'score']),
            pick(this.node, ['x', 'y'])
        );
    }

    setData(data: any) {
        this.id = get(data, 'id', this.id);
        this.node.x=  get(data, 'x', this.node.x);
        this.node.y=  get(data, 'y', this.node.y);
        this.score = get(data, 'score', this.score);
    }

    getPlayerDistance () {
        // Determine the distance according to the position of the Player node
        var playerPos = this.game.player.getPosition();

        // Calculate the distance between two nodes according to their positions
        var dist = this.node.position.sub(playerPos).mag();
        return dist;
    }

    // LIFE-CYCLE CALLBACKS:
    onLoad () {}
    start () {
        socket.getSocket().on(`onDestroy-item-${this.id}`, () => {
            this.node.destroy();
        })
    }
    onDestroy() {
        socket.getSocket().off(`onDestroy-item-${this.id}`);
    }

    update (dt: any) {
        this.setData(this.game.items[this.id]);
        if (this.getPlayerDistance() < this.pickRadius) {
            // this.node.active = false;
            this.game.gainScore(this.id);
            this.node.destroy();
            return;
        }

        // Update the transparency of the star according to the timer in the Game script
        // var opacityRatio = 1 - this.game.timer/this.game.starDuration;
        // var minOpacity = 50;
        // this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    }

}
