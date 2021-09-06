// 游戏管理模块
function Manager(size = 4, aim = 2048) {
    this.size = size;
    this.aim = aim;
    this.render = new Render();
    this.storage = new Storage();
    let self = this;// 用于监听器内部调用自己
    // 监听回调，事件回调的数据作为每个函数的参数
    this.listener = new Listener({
        move: function(direction) {// moveFn == direction
            self.listenerFn(direction);
        },
        start: function() {
            self.start();
        }
    });
    this.defaultStart();
}

Manager.prototype.defaultStart = function() {
    const state = this.storage.getCellState();
    let bestScore = this.storage.getBestScore();
    if (bestScore) {
        this.bestScore = bestScore;
    } else {
        this.bestScore = 0;
    }
    if (state){
        this.score = state.score;
        this.steps = state.steps;
        this.status = 'DOING';
        this.grid = new Grid(this.size, state.grid);
        this._render();
    } else {
        this.start();
    }
};

// 游戏开始
Manager.prototype.start = function() {
    // 分数、步数、状态初始化
    this.score = 0;
    this.steps = 0;
    this.status = 'DOING';
    // 添加方块管理面板
    this.grid = new Grid(this.size);
    // 随机填入两个方块
    for (let i = 0; i < 2; i++) {
        this.addRandomTile();
    }
    // 渲染
    this._render();
};
// 游戏渲染
Manager.prototype._render = function() {
    // 本地保存记录
    this.storage.setCellState({score: this.score, steps: this.steps, grid: this.grid});
    // 最高分刷新
    if (this.score > this.bestScore){
        this.bestScore = this.score;
        this.storage.setBestScore(this.bestScore);
    }
    // 渲染
    this.render.render(this.grid,
        { score: this.score, bestScore: this.bestScore, status: this.status, steps: this.steps });
};

// 随机添加一个方块
Manager.prototype.addRandomTile = function() {
    const position = this.grid.randomAvailableCell();
    if (position) {
        // 90%概率为2，10%为4
        const value = Math.random() < 0.9 ? 2 : 4;
        // 随机一个方格的位置
        const position = this.grid.randomAvailableCell();
        // 添加到grid中
        this.grid.add(new Tile(position, value));
    }
};

// 移动核心逻辑，监听移动
Manager.prototype.listenerFn = function(direction) {
    // 定义一个变量，判断是否引起移动
    let moved = false;
    // 获取遍历顺序
    const { rowPath, columnPath } = this.getPaths(direction);
    for (let i = 0; i < rowPath.length; i++) {
        for (let j = 0; j < columnPath.length; j++) {
            //获取此位置上的格子
            const position = { row: rowPath[i], column: columnPath[j] };
            const tile = this.grid.get(position);
            // 有格子则进行移动
            if (tile) {
                // 获取目标位置和其后一个位置上的格子
                const { aim, next } = this.getNearestAvailableAim(position, direction);
                // 区分合并和移动，当next格子存在且其值和tile值相同的时候才进行合并
                // next不存在则说明next出界，aim位于边界
                if (next && next.value === tile.value) {
                    // 合并位置是next的位置，合并的value是tile.value * 2
                    const merged = new Tile(
                        {
                            row: next.row,
                            column: next.column
                        },
                        tile.value * 2
                    );
                    // 分数增加
                    this.score += merged.value;
                    //将合并以后节点，加入grid
                    this.grid.add(merged);
                    //在grid中删除原始的节点
                    this.grid.remove(tile);
                    //判断游戏是否获胜
                    if (merged.value === this.aim) {
                        this.status = 'WIN';
                    }
                    merged.mergedTiles = [tile, next];
                    tile.updatePosition({ row: next.row, column: next.column });
                    moved = true;
                } else {
                    // 涉及到格子移动的渲染，无论是否真正移动，都需要进行该函数，否则会渲染出错
                    this.moveTile(tile, aim);
                    // 新位置与旧位置不同，则算作移动
                    if(aim.column !== position.column || aim.row !== position.row) {
                        moved = true;
                    }
                }
            }
        }
    }

    // 移动则进行计步、添加新方块和重新渲染
    if (moved) {
        this.steps += 1;
        this.addRandomTile();
        if (this.checkFailure()) {
            this.status = 'FAILURE';
        }
        // 重新渲染
        this._render();
    }
};

// 移动Tile
Manager.prototype.moveTile = function(tile, aim) {
    // 先将grid中原先位置删除，在添加新位置
    this.grid.cells[tile.row][tile.column] = null;
    tile.updatePosition(aim);
    this.grid.cells[aim.row][aim.column] = tile;
};

// 根据方向，确定遍历格子的顺序
// 同一排或列上的格子，以移动方向为正方向，则位置越大的格子越先移动
Manager.prototype.getPaths = function(direction) {
    let rowPath = [];
    let columnPath = [];
    for (let i = 0; i < this.size; i++) {
        rowPath.push(i);
        columnPath.push(i);
    }

    // 向右的时候，从右向左遍历
    if (direction.column === 1) {
        columnPath = columnPath.reverse();
    }

    // 向下的时候，从下向上遍历
    if (direction.row === 1) {
        rowPath = rowPath.reverse();
    }
    return {
        rowPath,
        columnPath
    };
};

// 从aim位置开始，寻找移动方向上的目标位置
// 目的：就是找到该格子能走到的最后一个空白且不超过边界的方格
Manager.prototype.getNearestAvailableAim = function(aim, direction) {
    // 位置 + 方向向量的计算公式
    function addVector(position, direction) {
        return {
            row: position.row + direction.row,
            column: position.column + direction.column
        };
    }

    // 如果next元素存在（也就是此目标位置已经有Tile），或者是超出游戏边界，则跳出循环。
    aim = addVector(aim, direction);
    let next = this.grid.get(aim);// 获取grid中该位置的元素
    while (!this.grid.outOfRange(aim) && !next) {
        aim = addVector(aim, direction);
        next = this.grid.get(aim);
    }

    // 这时候的aim总是多计算了一步，需还原
    aim = {
        row: aim.row - direction.row,
        column: aim.column - direction.column
    };

    return {
        aim, // 目标位置：该格子能走到的最后一个空白且不超过边界的方格的位置
        next // 目标位置后面一个位置上的格子（为空则说明目标位置在边界，这个next出界为空）
    };
};

// 判断游戏是否失败
Manager.prototype.checkFailure = function() {
    // 获取空闲的Cell
    const emptyCells = this.grid.availableCells();
    // 如果存在空白，则游戏肯定没有失败
    if (emptyCells.length > 0) {
        return false;
    }
    // 根据4个方向，判断临近的Tile的Value值是否相同，相同则仍可继续游戏
    let directions = [
        { row: 0, column: 1 },
        { row: 0, column: -1 },
        { row: 1, column: 0 },
        { row: -1, column: 0 }
    ];
    // 循环遍历判断每个格子的四个方位是否可以合并
    for (let row = 0; row < this.grid.size; row++) {
        for (let column = 0; column < this.grid.size; column++) {
            let now = this.grid.get({ row, column });
            for (let i = 0; i < directions.length; i++) {
                const direction = directions[i];
                const next = this.grid.get({
                    row: row + direction.row,
                    column: column + direction.column
                });
                // 判断Value是否相同
                if (next && next.value === now.value) {
                    return false;
                }
            }
        }
    }
    return true;
};
