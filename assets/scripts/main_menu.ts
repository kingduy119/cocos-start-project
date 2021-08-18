// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import global from "./global";
import * as io from "./socket";
import { get } from "lodash";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    gameMenu: cc.Node = null;
    @property(cc.EditBox)
    usernameInput: cc.EditBox = null;

    @property(cc.Node)
    gameLobby: cc.Node = null;

    showMenu () {
        this.gameMenu.active = true;
        this.gameMenu.opacity = 0;
        this.gameMenu.scale = 0.2;
        cc.tween(this.gameMenu)
        .to(0.5, {scale: 1, opacity: 255}, { easing: "quartInOut" })
        .start();
    }
    hideMenu () {
        cc.tween(this.gameMenu)
        .to(0.5, {scale: 0.2, opacity: 0}, {easing: "quartInOut"})
        .call(() => { this.gameMenu.active = false; })
        .start();

        global.player = {...global.player, username: this.usernameInput.string}
    }

    showLobby () {
        this.gameLobby.active = true;
        this.gameLobby.opacity = 0;
        this.gameLobby.scale = 0.2;
        cc.tween(this.gameLobby)
        .to(0.5, {scale: 1, opacity: 255}, { easing: "quartInOut" })
        .start();
    }
    hideLobby () {
        cc.tween(this.gameLobby)
        .to(0.5, {scale: 0.2, opacity: 0}, {easing: "quartInOut"})
        .call(() => { this.gameLobby.active = false; })
        .start();
    }

    // loadNextSence () {
    //     cc.tween(this.node)
    //     .to(1, { position: cc.v3(640, 360) }, {easing: "cubicInOut"})
    //     .call(() => this.loadGameSence() )
    //     .to(1, { position: cc.v3(-640, -360) }, {easing: "cubicInOut"})
    //     .start();
    // }

    loadGameSence () { cc.director.loadScene("game"); }

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        io.getSocket().on("connected", (id: any) => { 
            global.player = {...global.player, id };
        })
        io.getSocket().on("lobby-user", (total: number) => {
            this.gameLobby.getComponent("users_label").string = `Users in game: ${total}`;
        })
    }

    start () {
        this.hideLobby();
        this.showMenu();
    }

    // update (dt: any) { }
}
