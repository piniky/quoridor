(function (global) {
    "use strict";
    // Class ------------------------------------------------
    function Game() { }

    // Header -----------------------------------------------
    global.Game = Game;
    global.Game.initGame = initGame;

    // ------------------------------------------------------
    var COL = 9;
    var myInfo = { name: "名無し", rand: 1234 };
    var playersInfo = [];
    var ctx;
    var evented = false;
    var state = {}
    var point = {
        x: 0,
        y: 0
    }
    var init_state = {
        room: "1111",
        action: "move",
        map: [76, 4],
        mapWall: [[0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0
        ],
        [0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0
        ]],
        mode: 0,
        turn: 1,
        revision: 0,
        selected: {
            name: "",
            value: 0
        },
        restwall: [10, 10],
        playersName: ["", ""]
    };

    function initGame(_ctx, roomnum) {
        myInfo["name"] = $("#playerName").val();
        myInfo["rand"] = Math.floor(Math.random() * 10000);

        var pusher = new Pusher('KEY', {
            cluster: 'ap1',
            encrypted: true
        });

        if (roomnum == "") {
            roomnum = Math.floor(Math.random() * 9000) + 1000;
            appendLog("部屋番号" + roomnum + "を作成しようとしています。");

        } else {
            appendLog("部屋" + roomnum + "に入室しようとしています。");
        }
        var channel = pusher.subscribe("quo" + roomnum);
        console.log("joined " + roomnum);
        //send join
        sendPush("join", { "name": myInfo["name"], rand: myInfo["rand"], room: roomnum });
        setTimeout(function () {
            if (state.mode == 0) {
                //appendLog("部屋" + roomnum + "にはまだ誰もいないようです。");
            }
        }, 2000);


        channel.bind('move', function (data) {
            //appendLog(playersInfo[state.turn * -1] + "さんが移動しました。あなたのターンです。");
            state = JSON.parse(data);
            Render.render(ctx, state, point);
            if ((state.turn > 0 && state.map[0] < 9) || (state.turn < 0 && state.map[1] > 71)) {
                alert(state.playersName[state.turn * -1 == 1 ? 1 : 0] + "さんの勝ちです。");
                appendLog(state.playersName[state.turn * -1 == 1 ? 1 : 0] + "さんの勝ちです。");
                state.mode = 0;
            }
        });
        channel.bind('wall', function (data) {
            state = JSON.parse(data);
            Render.render(ctx, state, point);
        });
        channel.bind('modify', function (data) {
            obj = JSON.parse(data);
            state = JSON.parse(obj.state);
            Render.render(ctx, state, point);
            //appendLog("盤面を修正しました。" + state.playersName[state.turn == 1 ? 1 : 0] + "さんのターンです。");
        });


        channel.bind('join', function (data) {
            var obj = JSON.parse(data);
            if (obj["name"] == myInfo.name) return;

            if (state.mode != 0) {
                sendPush("joinres", { room: roomnum, result: "NG" });
                appendLog(obj["name"] + "さんが見学モードで入室しました。");
            } else {
                sendPush("joinres", { room: roomnum, result: "OK", name: myInfo.name, rand: myInfo.rand });
                appendLog(obj["name"] + "さんが入室しました。");
                
                //先後決め
                if (obj["rand"] < myInfo["rand"]) {
                    state.playersName[1] = obj["name"];
                    state.playersName[0] = myInfo["name"];
                } else {
                    state.playersName[0] = obj["name"];
                    state.playersName[1] = myInfo["name"];
                }
                state.mode = 1;
                appendLog("ゲームを開始します。先攻：" + state.playersName[1] + "さん");
            }
        });
        channel.bind('joinres', function (data) {
            var obj = JSON.parse(data);
            if (obj.name == myInfo.name) return;

            if (obj["result"] == "OK") {
                if (obj["rand"] < myInfo["rand"]) {
                    state.playersName[1] = obj["name"];
                    state.playersName[0] = myInfo["name"];
                } else {
                    state.playersName[0] = obj["name"];
                    state.playersName[1] = myInfo["name"];
                }
                appendLog("部屋" + roomnum + "に入室成功しました。相手プレーヤーは" + obj["name"] + "さんです。");
                appendLog("ゲームを開始します。先攻：" + state.playersName[1] + "さん");
                state.mode = 1;
            } else {

                appendLog("部屋" + roomnum + "は既に満員だったので、見学モードで入室しました。");
            }
        });


        ctx = _ctx;
        state = objCopy(init_state);
        state.room = roomnum;
        if (!evented) {
            evented = true;
            setEvents();
        }
        Render.render(ctx, state, point);
    }
    function setEvents() {
        var isTouch;
        if ('ontouchstart' in window) {
            isTouch = true;
        } else {
            isTouch = false;
        }
        if (isTouch) {
            ctx.canvas.addEventListener('touchstart', ev_mouseClick)
        } else {
            ctx.canvas.addEventListener('mousemove', ev_mouseMove)
            ctx.canvas.addEventListener('mouseup', ev_mouseClick)
        }
    }

    function ev_mouseMove(e) {
        getMousePosition(e);
        state.selected = hitTest(point.x, point.y);
        Render.render(ctx, state, point);
    }

    function ev_mouseClick(e) {
        if (state.playersName[state.turn == 1 ? 1 : 0] != myInfo.name) return;

        var selected = hitTest(point.x, point.y);
        console.log(selected.name + " : " + selected.value);
        if (state.mode == 0) return;

        if (selected.name === "RECT_BOARD") {
            if (state.mode == 1) {
                var list = Ai.canMoveList(state.map, state.mapWall, state.turn);
                console.log("turn : " + state.turn + " -> " + list);
                var flag = false;
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == selected.value) {
                        flag = true;
                        break;
                    }
                }

                if (flag) {
                    state.map[state.turn == 1 ? 1 : 0] = selected.value;
                    state.turn = -1 * state.turn;
                    state.revision += 1;
                    sendPush("move", state);
                    Render.render(ctx, state, point);
                    
                }
            }

        } else if (selected.name === "RECT_WALL_H") {
            if (state.restwall[state.turn == 1 ? 1 : 0 ] > 0 && Ai.canPutWall(state.map, state.mapWall, selected) === true) {
                state.mapWall[0] = Ai.putWallMap(state.map, state.mapWall, selected.value, state.turn, 0);
                state.restwall[state.turn == 1 ? 1 : 0] -= 1;
                state.turn = -1 * state.turn;
                state.revision += 1;
                Render.render(ctx, state, point);
                sendPush("wall", state);

            }
        } else if (selected.name === "RECT_WALL_V") {
            if (state.restwall[state.turn == 1 ? 1 : 0] > 0 && Ai.canPutWall(state.map, state.mapWall, selected) === true) {
                state.mapWall[1] = Ai.putWallMap(state.map, state.mapWall, selected.value, state.turn, 1);
                state.restwall[state.turn == 1 ? 1 : 0] -= 1;
                state.turn = -1 * state.turn;
                state.revision += 1;
                Render.render(ctx, state, point);
                sendPush("wall", state);

            }
        }

    }

    function sendPush(action, obj) {
        var url = "push.php";
        obj.action = action;
        var JSONdata = obj;
        console.log("sendPush : " + action + " : " + JSON.stringify(JSONdata));
        $.ajax({
            type: 'post',
            url: url,
            data: JSON.stringify(JSONdata),
            contentType: 'application/JSON',
            dataType: 'JSON',
            scriptCharset: 'utf-8',
            success: function (data) {
                //appendLog("送信しました");
            },
            error: function () {
                //appendLog("送信に失敗しました");
            }
        });
    }


    function appendLog(str) {
        $("#log").append(str + '\n');
        $("#log").scrollTop($("#log")[0].scrollHeight);
    }

    function getMousePosition(e) {
        if (!e.clientX) { //SmartPhone
            if (e.touches) {
                e = e.originalEvent.touches[0];
            } else if (e.originalEvent.touches) {
                e = e.originalEvent.touches[0];
            } else {
                e = event.touches[0];
            }
        }
        var rect = e.target.getBoundingClientRect();
        point.x = e.clientX - rect.left;
        point.y = e.clientY - rect.top;
    }

    function hitTest(x, y) {
        var objects = [Render.RECT_BOARD];
        var click_obj = null;
        var selected = {
            name: "",
            value: 0
        }
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].w >= x && objects[i].x <= x && objects[i].h + objects[i].y >= y && objects[i].y <= y) {
                if (y > Render.WALL_WIDTH + objects[i].y && y < objects[i].h - Render.WALL_WIDTH + objects[i].y
                    && ((y - objects[i].y) % Render.CELL_SIZE > Render.CELL_SIZE - Render.WALL_WIDTH || (y - objects[i].y) % Render.CELL_SIZE < Render.WALL_WIDTH)) {
                    selected.name = "RECT_WALL_H";
                    if (x < (Render.CELL_SIZE / 2) | 0) x += (Render.CELL_SIZE / 2) | 0;
                    else if (x > objects[i].w - ((Render.CELL_SIZE / 2) | 0)) x -= (Render.CELL_SIZE / 2) | 0;
                    break;
                } else if (x > Render.WALL_WIDTH && x < objects[i].w - Render.WALL_WIDTH
                    && (x % Render.CELL_SIZE > Render.CELL_SIZE - Render.WALL_WIDTH || x % Render.CELL_SIZE < Render.WALL_WIDTH)) {
                    selected.name = "RECT_WALL_V";
                    if ((y - objects[i].y) < Render.CELL_SIZE / 2) y += (Render.CELL_SIZE / 2) | 0;
                    else if ((y + objects[i].y) > objects[i].h - Render.CELL_SIZE / 2) y -= Render.CELL_SIZE / 2;
                    break;
                } else {
                    selected.name = "RECT_BOARD";
                    break;
                }
            }
        }
        switch (true) {
            case selected.name === "RECT_BOARD":
                selected.name = "RECT_BOARD";
                selected.value = Math.floor((y - objects[i].y) / Render.CELL_SIZE) * COL + Math.floor(x / Render.CELL_SIZE);
                break;
            case selected.name === "RECT_WALL_H":
                x -= Render.CELL_SIZE / 2 | 0; y -= Render.WALL_WIDTH;
                selected.name = "RECT_WALL_H";
                selected.value = Math.floor((y - objects[i].y) / Render.CELL_SIZE) * (COL - 1) + Math.floor(x / Render.CELL_SIZE);
                break;
            case selected.name === "RECT_WALL_V":
                x -= Render.WALL_WIDTH; y -= Render.CELL_SIZE / 2;
                selected.name = "RECT_WALL_V";
                selected.value = Math.floor(x / Render.CELL_SIZE) * (COL - 1) + Math.floor((y - objects[i].y) / Render.CELL_SIZE);
                break;
        }
        return selected;
    }

    function objCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

})((this || 0).self || global);