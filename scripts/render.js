//渲染管理
function Render() {
    // 棋盘上的棋格集合
    this.tileContainer = document.querySelector('.tile-container');
    // 当前分数
    this.scoreContainer = document.querySelector('.now .value');
    // 结算界面（胜利或失败）
    this.statusContainer = document.querySelector('.status');
    // 最佳分数
    this.bestScoreContainer = document.querySelector('.best .value');
    // 已走步数
    this.stepsContainer = document.querySelector('.steps .value');
}

// 渲染整个grid
Render.prototype.render = function(grid, { score, bestScore, status, steps }) {
    this.empty();
    this.renderScore(score, bestScore);
    this.renderStatus(status);
    this.renderSteps(steps);
    for (let row = 0; row < grid.size; row++) {
        for (let column = 0; column < grid.size; column++) {
            // 如果grid中某个cell不为空，则渲染这个cell
            if (grid.cells[row][column]) {
                this.renderTile(grid.cells[row][column]);
            }
        }
    }
};
// 渲染分数
Render.prototype.renderScore = function(score, bestScore) {
    // 填入当前分数和最小分数
    this.scoreContainer.innerHTML = score;
    this.bestScoreContainer.innerHTML = bestScore;
};
// 渲染步数
Render.prototype.renderSteps = function(steps) {
    // 填入当前步数
    this.stepsContainer.innerHTML = steps;
};
// 渲染状态界面
Render.prototype.renderStatus = function(status) {
    // 游戏过程，结算界面隐藏
    if (status === 'DOING') {
        this.statusContainer.style.display = 'none';
        return;
    }
    // 游戏结束，结算界面显示
    this.statusContainer.style.display = 'flex';
    // 内容根据胜负显示
    this.statusContainer.querySelector('.content').innerHTML =
        status === 'WIN' ? 'You Win!' : 'Game Over!';
};

// 清空方块集合tileContainer
Render.prototype.empty = function() {
    this.tileContainer.innerHTML = '';
};

// 渲染单个tile
Render.prototype.renderTile = function(tile) {
    // 创建一个tile-inner数值块，包裹数值
    const tileInner = document.createElement('div');
    // 添加类名用于css选择器
    tileInner.setAttribute('class', 'tile-inner');
    // 填入值
    tileInner.innerHTML = tile.value;

    // 创建一个tile块，包裹整个格子
    const tileDom = document.createElement('div');
    let classList = [
        'tile',
        `tile-${tile.value}`,
        `tile-position-${tile.row + 1}-${tile.column + 1}`
    ];
    // 如果该格有先前的位置
    if (tile.prePosition) {
        // 先设置之前的位置
        classList[2] = `tile-position-${tile.prePosition.row + 1}-${tile.prePosition
            .column + 1}`;
        // 延迟设置当前的位置
        setTimeout(function() {
            classList[2] = `tile-position-${tile.row + 1}-${tile.column + 1}`;
            tileDom.setAttribute('class', classList.join(' '));
        }, 16);
    } else if (tile.mergedTiles) {
        classList.push('tile-merged');
        //如果有mergedTiles，则渲染mergedTile的两个Tile
        tileDom.setAttribute('class', classList.join(' '));
        for (let i = 0; i < tile.mergedTiles.length; i++) {
            this.renderTile(tile.mergedTiles[i]);
        }
    } else {
        classList.push('tile-new');
    }
    // 设置类名
    tileDom.setAttribute('class', classList.join(' '));
    // 格子块内加入数值块
    tileDom.appendChild(tileInner);
    // 格子集合加入格子块
    this.tileContainer.appendChild(tileDom);
    /*填入的格子块标签格式如下
    <div className="tile tile-2 tile-position-1-1">
        <div className="tile-inner">2</div>
    </div>
    */
};
