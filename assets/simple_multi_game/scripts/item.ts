// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { get, pick } from "lodash";
import * as socket from "./socket";
import global from "./global";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property
    pickRadius: number = 0;
    id: any;
    game: any;

    init(data: any) {
        this.id = get(data, 'id', this.id);
        this.node.x = get(data, 'x', this.node.x);
        this.node.y = get(data, 'y', this.node.y);
    }

    getData() {
        return pick(this, ['id', 'score']);
    }

    setData(data: any) {
        this.id = get(data, 'id', this.id);
        this.node.x=  get(data, 'x', this.node.x);
        this.node.y=  get(data, 'y', this.node.y);
    }

    getPlayerDistance () {
        // Determine the distance according to the position of the Player node
        var playerPos = this.game.player.getPosition();

        // Calculate the distance between two nodes according to their positions
        var dist = this.node.position.sub(playerPos).mag();

        return dist;
    }

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        
    }

    start () {
        socket.getSocket().on(`destroy-item-${this.id}`, () => {
            console.log(`destroy-item-${this.id}`)
            this.node.destroy();
        });
    }

    onDestroy () {
        socket.getSocket().off(`destroy-item-${this.id}`);
    }

    update (dt: any) {
        if (this.getPlayerDistance() < this.pickRadius) {
            socket.getSocket().emit("item-collect", {item: this.getData(), user: global.player});
            this.node.destroy();
            return;
        }
    }

}
