(function (global) {
    "use strict";
    // Class ------------------------------------------------
    function Ai() { }

    // Header -----------------------------------------------
    global.Ai = Ai;
    global.Ai.canMoveList = canMoveList;
    global.Ai.canPutWall = canPutWall;
    global.Ai.putWallMap = putWallMap;


    //-------------------------------------
    var COL = 9;
    var COLXCOL = COL * COL;

    function canMoveList(map, mapWall, turn) {
        var x = (map[turn == 1 ? 1 : 0] % COL) | 0;
        var y = (map[turn == 1 ? 1 : 0] / COL) | 0;
        var result = [];

        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (i * j != 0 || x + i < 0 || x + i >= COL || y + j < 0 || y + j >= COL || (i == 0 && j == 0)) continue;
                result = result.concat(canMove(map, mapWall, turn, x + i, y + j));
            }
        }

        return result;
    }

    function canMove(map, mapWall, turn, x2, y2) {
        var x1 = (map[turn == 1 ? 1 : 0] % COL) | 0;
        var y1 = (map[turn == 1 ? 1 : 0] / COL) | 0;
        if (x1 == x2 && y1 < y2) { //down
            var existWall = false;
            if (x1 == 0)
                existWall = mapWall[0][y1 * (COL - 1)];
            else if (x1 == COL - 1)
                existWall = mapWall[0][(y1 + 1) * (COL - 1) - 1];
            else
                existWall = mapWall[0][y1 * (COL - 1) + x1 - 1] || mapWall[0][y1 * (COL - 1) + x1];

            if (existWall) return [];

            //other player
            if (map[turn == 1 ? 0 : 1] != y2 * COL + x2) return [y2 * COL + x2];

            //can't jump
            if (y2 == COL - 1) return [];

            if (x1 == 0) existWall = mapWall[0][y2 * (COL - 1)];
            else if (x1 == COL - 1) existWall = mapWall[0][(y2 + 1) * (COL - 1) - 1];
            else existWall = mapWall[0][y2 * (COL - 1) + x1 - 1] || mapWall[0][y2 * (COL - 1) + x1];

            if (!existWall) { //jump straight
                return [(y2 + 1) * COL + x2];
            }

            var res = [];
            if (x1 != 0) { //left wall
                if (y2 == COL - 1) existWall = mapWall[1][x2 * (COL - 1) - 1];
                else existWall = mapWall[1][(x2 - 1) * (COL - 1) + y2] || mapWall[1][(x2 - 1) * (COL - 1) + y2 - 1];
                if (!existWall) res.push(y2 * COL + x2 - 1);
            }
            if (x1 != COL - 1) { //right wall
                if (y2 == COL - 1) existWall = mapWall[1][(x2 + 1) * (COL - 1) - 1];
                else existWall = mapWall[1][x2 * (COL - 1) + y2 - 1] || mapWall[1][x2 * (COL - 1) + y2];
                if (!existWall) res.push(y2 * COL + x2 + 1);
            }

            return res;

        } else if (x1 == x2 && y1 > y2) { //up
            var existWall = false;
            if (x1 == 0)
                existWall = mapWall[0][y2 * (COL - 1)];
            else if (x1 == COL - 1)
                existWall = mapWall[0][(y2 + 1) * (COL - 1) - 1];
            else
                existWall = mapWall[0][y2 * (COL - 1) + x1 - 1] || mapWall[0][y2 * (COL - 1) + x1];

            if (existWall) return [];

            //other player
            if (map[turn == 1 ? 0 : 1] != y2 * COL + x2) return [y2 * COL + x2];

            //can't jump
            if (y2 == 0) return [];

            //jump
            if (x1 == 0) existWall = mapWall[0][(y2 - 1) * (COL - 1)];
            else if (x1 == COL - 1) existWall = mapWall[0][y2 * (COL - 1) - 1];
            else existWall = mapWall[0][(y2 - 1) * (COL - 1) + x1 - 1] || mapWall[0][(y2 - 1) * (COL - 1) + x1];

            if (!existWall) { //jump straight
                return [(y2 - 1) * COL + x2];
            }

            var res = [];
            if (x1 != 0) { //left wall
                if (y1 == COL - 1) existWall = mapWall[1][x2 * (COL - 1) - 1];
                else existWall = mapWall[1][(x2 - 1) * (COL - 1) + y2] || mapWall[1][(x2 - 1) * (COL - 1) + y2 - 1];
                if (!existWall) res.push(y2 * COL + x2 - 1);
            }
            if (x1 != COL - 1) { //right wall
                if (y1 == COL - 1) existWall = mapWall[1][(x2 + 1) * (COL - 1) - 1];
                else existWall = mapWall[1][x2 * (COL - 1) + y2 - 1] || mapWall[1][x2 * (COL - 1) + y2];
                if (!existWall) res.push(y2 * COL + x2 + 1);
            }

            return res;

        } else if (y1 == y2 && x1 < x2) { //right
            var existWall = false;
            if (y1 == 0)
                existWall = mapWall[1][x1 * (COL - 1)];
            else if (y1 == COL - 1)
                existWall = mapWall[1][(x1 + 1) * COL - 1];
            else
                existWall = mapWall[1][x1 * (COL - 1) + y1 - 1] || mapWall[1][x1 * (COL - 1) + y1];

            if (existWall) return [];


            if (map[turn == 1 ? 0 : 1] != y2 * COL + x2) return [y2 * COL + x2];


            if (x2 == COL - 1) return [];

            if (y1 == 0) existWall = mapWall[1][x2 * (COL - 1)];
            else if (y1 == COL - 1) existWall = mapWall[1][(x2 + 1) * (COL - 1) - 1];
            else existWall = mapWall[1][x2 * (COL - 1) + y1 - 1] || mapWall[1][x2 * (COL - 1) + y1];

            if (!existWall) { //jump straight
                return [y2 * COL + x2 + 1];
            }

            var res = [];
            if (y1 != 0) { //up wall
                if (x2 == COL - 1) existWall = mapWall[0][y2 * (COL - 1) - 1];
                else existWall = mapWall[0][(y2 - 1) * (COL - 1) + x2 - 1] || mapWall[0][(y2 - 1) * (COL - 1) + x2];
                if (!existWall) res.push((y2 - 1) * COL + x2);
            }
            if (y1 != COL - 1) { //down wall
                if (x2 == COL - 1) existWall = mapWall[0][(y2 + 1) * (COL - 1) - 1];
                else existWall = mapWall[0][y2 * (COL - 1) + x2 - 1] || mapWall[0][y2 * (COL - 1) + x2];
                if (!existWall) res.push((y2 + 1) * COL + x2);
            }

            return res;
        } else if (y1 == y2 && x1 > x2) { //left
            var existWall = false;
            if (y1 == 0)
                existWall = mapWall[1][x2 * (COL - 1)];
            else if (y1 == COL - 1)
                existWall = mapWall[1][(x2 + 1) * COL - 1];
            else
                existWall = mapWall[1][x2 * (COL - 1) + y1 - 1] || mapWall[1][x2 * (COL - 1) + y1];

            if (existWall) return [];


            if (map[turn == 1 ? 0 : 1] != y2 * COL + x2) return [y2 * COL + x2];



            if (x2 == 0) return [];

            if (y1 == 0) existWall = mapWall[1][(x2 - 1) * (COL - 1)];
            else if (y1 == COL - 1) existWall = mapWall[1][x2 * (COL - 1) - 1];
            else existWall = mapWall[1][(x2 - 1) * (COL - 1) + y1 - 1] || mapWall[1][(x2 - 1) * (COL - 1) + y1];

            if (!existWall) { //jump straight
                return [y2 * COL + x2 - 1];
            }

            var res = [];
            if (y1 != 0) { //up wall
                if (x1 == COL - 1) existWall = mapWall[0][y2 * (COL - 1) - 1];
                else existWall = mapWall[0][(y2 - 1) * (COL - 1) + x2 - 1] || mapWall[0][(y2 - 1) * (COL - 1) + x2];
                if (!existWall) res.push((y2 - 1) * COL + x2);
            }
            if (y1 != COL - 1) { //down wall
                if (x1 == COL - 1) existWall = mapWall[0][(y2 + 1) * (COL - 1) - 1];
                else existWall = mapWall[0][y2 * (COL - 1) + x2 - 1] || mapWall[0][y2 * (COL - 1) + x2];
                if (!existWall) res.push((y2 + 1) * COL + x2);
            }

            return res;

        } else return [];

    }

    function canPutWall(map, mapWall, selected) {
        var x = (selected.value % (COL - 1)) | 0;
        var y = (selected.value / (COL - 1)) | 0;

        if ((selected.name == "RECT_WALL_H" && mapWall[0][selected.value] != 0) || (selected.name == "RECT_WALL_W" && mapWall[1][selected.value] != 0)) {
            return false;
        }

        if (mapWall[selected.name == "RECT_WALL_H" ? 0 : 1][selected.value] != 0) return false; //already exists
        else if (mapWall[selected.name == "RECT_WALL_H" ? 1 : 0][x * (COL - 1) + y] != 0) return false; //cross

        var _mapWall = [];
        _mapWall[0] = mapWall[0].concat();
        _mapWall[1] = mapWall[1].concat();

        _mapWall[selected.name == "RECT_WALL_H" ? 0 : 1][selected.value] = 1;

        var par = new Array(COLXCOL);
        var sizes = new Array(COLXCOL);
        for (var i = 0; i < COLXCOL; i++) {
            par[i] = i;
            sizes[i] = 1;
        }

        for (var i = 0; i < COLXCOL; i++) {
            var existWall = true, x = i % COL, y = i / COL | 0;
            if (y > 0) { //up
                if (x == 0) existWall = _mapWall[0][(y - 1) * (COL - 1)];
                else if (x == COL - 1) existWall = _mapWall[0][y * (COL - 1) - 1];
                else existWall = _mapWall[0][(y - 1) * (COL - 1) + x - 1] || _mapWall[0][(y - 1) * (COL - 1) + x];
                if (!existWall) {
                    UF_unite(par, sizes, i - COL, i);
                    // console.log("united " + i + " " + (i - COL));
                }
            }
            if (x > 0) { //left
                if (y == 0) existWall = _mapWall[1][(x - 1) * (COL - 1)];
                else if (y == COL - 1) existWall = _mapWall[1][x * (COL - 1) - 1];
                else existWall = _mapWall[1][(x - 1) * (COL - 1) + y - 1] || _mapWall[1][(x - 1) * (COL - 1) + y];
                if (!existWall) {
                    UF_unite(par, sizes, i - 1, i);
                    //console.log("united " + i + " " + (i - 1));
                }
            }
        }
        console.log(UF_same(par, 0, 2));
        for (var i = 0; i < COL; i++) {
            if (UF_same(par, COLXCOL - i - 1, map[1]) && UF_same(par, i, map[0])) {
                console.log("OK");
                return true;
            }
        }
        console.log("NG");
        return false;
    }

    function putWallMap(map, mapWall, number, turn, mapwallindex) {
        var _map = mapWall[mapwallindex].concat();
        _map[number] = turn;
        return _map;
    }

    function UF_find(par, x) {
        if (x == par[x]) return x;
        return par[x] = UF_find(par, par[x]);
    }

    function UF_unite(par, sizes, x, y) {
        x = UF_find(par, x);
        y = UF_find(par, y);

        if (x == y) return;
        par[y] = x;
    }

    function UF_same(par, x, y) {
        return UF_find(par, x) == UF_find(par, y);
    }


})((this || 0).self || global);