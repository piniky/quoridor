(function (global) {
    "use strict";
    // Class ------------------------------------------------
    function Render() { }

    // Header -----------------------------------------------
    global.Render = Render;
    global.Render.render = render;
    global.Render.RECT_BOARD = RECT_BOARD;
    global.Render.CELL_SIZE = CELL_SIZE;
    global.Render.WALL_WIDTH = WALL_WIDTH;

    //-------------------------------------
    var COL = 9;
    var RECT_CANV = {
        x: 0,
        y: 50,
        w: 495,
        h: 495
    };
    var RECT_BOARD = {
        x: 0,
        y: 50,
        w: 495,
        h: 495
    };
    var OFFSET = 50;
    var CELL_SIZE = RECT_CANV.w / COL | 0;
    var WALL_WIDTH = 8;
    var COLOR_LINE = "#FFFFFF";
    var COLOR_WHITE = "#FFFFFF";
    var COLOR_BLACK = "#000000";
    var COLOR_SELECT = "#FFFFFF";
    var COLOR_WALL = "#d87523"

    var COLOR_PANEL_4 = "#006400 ";
    var COLOR_PANEL_5 = "#03a803 ";
    var COLOR_PANEL_6 = "#04cb04";

    var state_cache = null;
    var prev_revision = -1;
    var canv_cache = {
        canv_board: null,
        canv_pieaces: null,
        canv_walls: null,
        canv_effect: null,
        canv_text: null
    };

    function render(ctx, state, point) {
        if (prev_revision < 0) {
            canv_cache.canv_board = drawBoard(state);
            canv_cache.canv_pieaces = drawPieceALL(state);
            canv_cache.canv_walls = drawWallALL(state);
            canv_cache.canv_effect = drawEffect(state);
            canv_cache.canv_text = drawText(state);
            Render.RECT_BOARD = RECT_BOARD;
            Render.CELL_SIZE = CELL_SIZE;
            Render.WALL_WIDTH = WALL_WIDTH;
        } else {
            if (state.revision != prev_revision) {
                canv_cache.canv_pieaces = drawPieceALL(state);
                canv_cache.canv_walls = drawWallALL(state);
                canv_cache.canv_text = drawText(state);
            }
            canv_cache.canv_effect = drawEffect(state, point);
        }

        ctx.clearRect(0, 0, RECT_CANV.w, RECT_CANV.h + 100);
        ctx.drawImage(canv_cache.canv_board, RECT_CANV.x, RECT_CANV.y, RECT_CANV.w, RECT_CANV.h);
        ctx.drawImage(canv_cache.canv_pieaces, RECT_CANV.x, RECT_CANV.y, RECT_CANV.w, RECT_CANV.h);
        ctx.drawImage(canv_cache.canv_walls, RECT_CANV.x, RECT_CANV.y, RECT_CANV.w, RECT_CANV.h);
        ctx.drawImage(canv_cache.canv_effect, RECT_CANV.x, RECT_CANV.y, RECT_CANV.w, RECT_CANV.h);
        ctx.drawImage(canv_cache.canv_text, 0, 0, RECT_CANV.w, RECT_CANV.h + 100);
        prev_revision = state.revision;
    }

    function drawBoard(state) {
        if (!canv_cache.canv_board) {
            canv_cache.canv_board = document.createElement("canvas");
            canv_cache.canv_board.width = RECT_CANV.w;
            canv_cache.canv_board.height = RECT_CANV.h;
        }
        var ctx = canv_cache.canv_board.getContext('2d');
        ctx.clearRect(RECT_CANV.x, RECT_CANV.y, RECT_CANV.w, RECT_CANV.h);

        var grad = ctx.createLinearGradient(RECT_CANV.x, RECT_CANV.y, RECT_CANV.w, RECT_CANV.h);
        grad.addColorStop(0, COLOR_PANEL_6);
        grad.addColorStop(0.3, COLOR_PANEL_5);
        grad.addColorStop(1, COLOR_PANEL_4);
        ctx.fillStyle = grad

        for (var x = 0; x < COL; x++) {
            for (var y = 0; y < COL; y++) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = COLOR_LINE;
                ctx.beginPath();
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
        var canv_board2 = document.createElement("canvas");
        var ctx_board2 = canv_board2.getContext('2d');
        canv_board2.width = RECT_CANV.w;
        canv_board2.height = RECT_CANV.h;
        ctx_board2.clearRect(RECT_CANV.x, RECT_CANV.y, RECT_CANV.w, RECT_CANV.h);
        ctx_board2.globalAlpha = 0.07;
        ctx_board2.fillStyle = COLOR_WHITE;
        ctx_board2.beginPath();
        ctx_board2.arc(CELL_SIZE * 1, -3 * CELL_SIZE, 7 * CELL_SIZE, 0, Math.PI * 2, false);
        ctx_board2.fill();
        ctx.drawImage(canv_board2, RECT_CANV.x, RECT_CANV.y, RECT_CANV.w, RECT_CANV.h);


        return canv_cache.canv_board;
    }

    function drawPieceALL(state) {
        if (!canv_cache.canv_pieaces) {
            canv_cache.canv_pieaces = document.createElement("canvas");
            canv_cache.canv_pieaces.width = RECT_CANV.w;
            canv_cache.canv_pieaces.height = RECT_CANV.h;
        }
        var ctx = canv_cache.canv_pieaces.getContext('2d');
        ctx.clearRect(0, 0, RECT_CANV.w, RECT_CANV.h);

        var x = state.map[0] % COL, y = state.map[0] / COL | 0;
        drawPiece(ctx, x * CELL_SIZE, y * CELL_SIZE, 1);
        x = state.map[1] % COL, y = state.map[1] / COL | 0;
        drawPiece(ctx, x * CELL_SIZE, y * CELL_SIZE, -1);

        return canv_cache.canv_pieaces;
    }

    function drawPiece(ctx, x, y, turn) {

        var grad = ctx.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
        var font_color;
        var fill_color;
        if (turn > 0) {
            font_color = COLOR_BLACK;
            fill_color = COLOR_WHITE;
            grad.addColorStop(0, 'rgb(180, 180, 180)');
            grad.addColorStop(0.4, fill_color);
            grad.addColorStop(1, fill_color);
        } else if (turn < 0) {
            font_color = COLOR_WHITE;
            fill_color = COLOR_BLACK;
            grad.addColorStop(0, fill_color);
            grad.addColorStop(0.4, 'rgb(70, 70, 70)');
            grad.addColorStop(1, 'rgb(70, 70, 70)');
        }


        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(0, 0, 0, 1)";
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.fillRect(x + CELL_SIZE / 10 | 0, y + CELL_SIZE / 10 | 0, CELL_SIZE - 1 * CELL_SIZE / 5 | 0, CELL_SIZE - 1 * CELL_SIZE / 5 | 0);

        ctx.shadowColor = "rgba(0, 0, 0, 0)";;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        return ctx;
    }
    function drawWallALL(state) {
        if (!canv_cache.canv_walls) {
            canv_cache.canv_walls = document.createElement("canvas");
            canv_cache.canv_walls.width = RECT_CANV.w;
            canv_cache.canv_walls.height = RECT_CANV.h;
        }
        var ctx = canv_cache.canv_walls.getContext('2d');
        ctx.clearRect(0, RECT_CANV.y, RECT_CANV.w, RECT_CANV.h);

        for (var x = 0; x < COL - 1; x++) {
            for (var y = 0; y < COL - 1; y++) {
                if (state.mapWall[0][y * (COL - 1) + x] != 0) //horizontal
                    drawWall(ctx, x * CELL_SIZE, (y + 1) * CELL_SIZE, state.mapWall[0][y * COL + x], 0);
                if (state.mapWall[1][y * (COL - 1) + x] != 0) //vertical
                    drawWall(ctx, (y + 1) * CELL_SIZE, x * CELL_SIZE, state.mapWall[1][y * COL + x], 1);
            }
        }
        return canv_cache.canv_walls;
    }

    function drawWall(ctx, x, y, number, mapwallindex) {
        var fill_color;
        if (number > 0) {
            fill_color = COLOR_WALL;
        } else {
            fill_color = COLOR_WALL;
        }


        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(0, 0, 0, 1)";
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        ctx.beginPath();
        if (mapwallindex == 0)
            ctx.fillRect(x, y - WALL_WIDTH / 2, 2 * CELL_SIZE, WALL_WIDTH);
        else
            ctx.fillRect(x - WALL_WIDTH / 2, y, WALL_WIDTH, 2 * CELL_SIZE);

        ctx.shadowColor = "rgba(0, 0, 0, 0)";;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        return ctx;
    }
    function drawEffect(state) {
        if (!canv_cache.canv_effect) {
            canv_cache.canv_effect = document.createElement("canvas");
            canv_cache.canv_effect.width = RECT_CANV.w;
            canv_cache.canv_effect.height = RECT_CANV.h;
        }
        var ctx = canv_cache.canv_effect.getContext('2d');
        var x, y, fillwidth, fillheight;

        ctx.clearRect(0, 0, RECT_CANV.w, RECT_CANV.h);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = COLOR_SELECT;
        ctx.lineWidth = 1;
        ctx.beginPath();


        var ww = WALL_WIDTH / 2;
        switch (state.selected.name) {
            case "RECT_BOARD":
                x = (state.selected.value % COL | 0) * CELL_SIZE;
                y = (state.selected.value / COL | 0) * CELL_SIZE;
                fillheight = CELL_SIZE; fillwidth = CELL_SIZE;
                break;
            case "RECT_WALL_H":
                x = (state.selected.value % (COL - 1) | 0) * CELL_SIZE;
                y = ((state.selected.value / (COL - 1) | 0) + 1) * CELL_SIZE - ww;
                fillwidth = CELL_SIZE * 2; fillheight = WALL_WIDTH;
                break;
            case "RECT_WALL_V":
                x = ((state.selected.value / (COL - 1) | 0) + 1) * CELL_SIZE - ww;
                y = (state.selected.value % (COL - 1) | 0) * CELL_SIZE;
                fillheight = CELL_SIZE * 2; fillwidth = WALL_WIDTH;
                break;
            default:

        }
        ctx.fillRect(x, y, fillwidth, fillheight);

        return canv_cache.canv_effect;
    }

    function drawText(state) {
        if (!canv_cache.canv_text) {
            canv_cache.canv_text = document.createElement("canvas");
            canv_cache.canv_text.width = RECT_CANV.w;
            canv_cache.canv_text.height = RECT_CANV.h + 100;
        }
        var ctx = canv_cache.canv_text.getContext('2d');
        var x, y;

        ctx.globalAlpha = 1;
        ctx.fillStyle = "#000000";
        ctx.clearRect(0, 0, RECT_CANV.w, RECT_CANV.h + 100);
        ctx.font = "24px Century Gothic";
        ctx.textAlign = 'center';

        ctx.fillText('先手　' + state.playersName[1], 125, 30, 250);
        ctx.fillText('後手　' + state.playersName[0], 125, 570, 250);

        ctx.fillText('残り壁枚数:' + state.restwall[1] + '枚', 375, 30, 250);
        ctx.fillText('残り壁枚数:' + state.restwall[0] + '枚', 375, 570, 250);

        //turn
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "#FF0000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.fillRect(0, (state.turn == 1 ? 10 : 550), 500, 30);

        return canv_cache.canv_text;
    }

    function objCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }


})((this || 0).self || global);