// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import global from "./global";
import * as socket from "./socket";
import { pick, get, isEmpty } from "lodash";
// import Enemy from "./enemy";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    timer: number = 0;
    items: any = [];
    users: any = [];
    scores: any = [];

    @property(cc.Label)
    timerDisplay: cc.Label = null;

    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    
    @property(cc.Prefab)
    enemyPrefab: cc.Prefab = null;

    @property(cc.Node)
    ground: cc.Node = null;

    spawnItem(data: any) {
        let item = cc.instantiate(this.itemPrefab);
        this.node.addChild(item);
        item.getComponent('item').game = this;
        item.getComponent('item').setData(data);
    }
    spawnUser(data: any) {
        var newEnemy = cc.instantiate(this.enemyPrefab);
        this.node.addChild(newEnemy);
        newEnemy.getComponent('enemy').game = this;
        newEnemy.getComponent('enemy').setData(data);
    }

    gainScore (id: number) {
        this.player.getComponent('player').score += 1;
        let user = pick(this.player.getComponent('player'), ['id', 'score']);
        console.log(`score: ${JSON.stringify(user)}`);
        socket.getSocket().emit("game-gainscore", {user, item: id});
    }

    getData () {
        return pick(this, ['scores',  'items', 'users', ])
    }
    setData (data: any) {
        this.timer = get(data, 'timer', this.timer);
        this.scores = get(data, 'scores', this.scores);
        this.items = get(data, 'items', this.items);
        this.users = get(data, 'users', this.users);

        this.timerDisplay.string = `Time: ${get(data, 'timer', this.timer)}`;
    }

    getUser(user: any) { return this.users[user.id]; }
    setUser(user: any) { this.users[user.id] = user; }

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        socket.getSocket().on('game-load', (data: any) => {
            this.setData(data);
            this.users.map((user: any) => { 
                if(!isEmpty(user)) this.spawnUser(user);
            });
            this.items.map((item: any) => {
                if(!isEmpty(item)) this.spawnItem(item);
             });
        })

        socket.getSocket().on('game-update', (data: any[]) => {
            this.setData(data);
        });
        socket.getSocket().on('game-spawn-item', (data: any) => {
            this.spawnItem(data);
        })

        socket.getSocket().on('user-join', (user: any) => {
            this.spawnUser(user);
        })
        socket.getSocket().on('user-ping', () => {
            socket.getSocket().emit("user-ping", global.player);
        })
    }

    start () {
        socket.getSocket().emit("user-join", this.player.getComponent('player').getData());
    }

    update (dt: any) {
        socket.getSocket().emit("game-update", this.getData());
    }
}
