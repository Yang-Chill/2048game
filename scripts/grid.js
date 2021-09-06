//管理方块Tile的面板对象 Grid
function Grid(size = 4, state) {
    this.size = size; // 长宽
    this.cells = []; // 存储tiles。无格子则为null
    this.init(size);
    if (state){
        this.recover(state);
    }
}

// 面板初始化：按size分配二维数组
Grid.prototype.init = function(size) {
    for (let row = 0; row < size; row++) {
        this.cells.push([]);// 向数组内加入一个数组，创造二维
        for (let column = 0; column < size; column++) {
            this.cells[row].push(null); // 该维数组用null初始化
        }
    }
};

// 添加方块
Grid.prototype.add = function(tile) {
    this.cells[tile.row][tile.column] = tile;
};
// 移除方块
Grid.prototype.remove = function(tile) {
    this.cells[tile.row][tile.column] = null;
};

// 获取所有可用方格的位置
Grid.prototype.availableCells = function() {
    const availableCells = [];
    for (let row = 0; row < this.cells.length; row++) {
        for (let column = 0; column < this.cells[row].length; column++) {
            // 如果当前方格没有内容（为null），则其可用（空闲）
            if (!this.cells[row][column]) {
                availableCells.push({ row, column });
            }
        }
    }
    return availableCells;
};

// 随机获取某个可用方格的位置
Grid.prototype.randomAvailableCell = function() {
    // 获取到所有的空闲方格
    const cells = this.availableCells();
    if (cells.length > 0) {
        // 存在空闲方格，则利用Math.random()随机获取其中的某一个
        return cells[Math.floor(Math.random() * cells.length)];
    }
};

// 获取某个位置的Tile
Grid.prototype.get = function(position) {
    if (this.outOfRange(position)) {
        return null;
    }
    return this.cells[position.row][position.column];
};

// 判断某个位置是否超出边界
Grid.prototype.outOfRange = function(position) {
    return (
        position.row < 0 ||
        position.row >= this.size ||
        position.column < 0 ||
        position.column >= this.size
    );
};
// 缓存数据
Grid.prototype.serialize = function () {
    const cellState = [];
    for (let row = 0; row < this.size; row ++){
        cellState[row] = [];
        for (let column = 0; column < this.size ; column ++){
            cellState[row].push(
                this.cells[row][column] ? this.cells[row][column].serialize() : null
            );
        }
    }
    return {
      size: this.size,
      cells: cellState
    };
}

Grid.prototype.recover = function ({size, cells}) {
   this.size =  size;
    for (let row = 0; row < this.size; row ++){
        for ( let column = 0; column < this.size; column ++){
            const cell = cells[row][column];
            if (cell)
                this.cells[row][column] = new Tile(cell.position, cell.value);
        }
    }

}