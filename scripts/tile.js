// 方格对象Tile
function Tile(position, value) {
    //位置 position(row,column)
    this.row = position.row;
    this.column = position.column;
    //值 value
    this.value = value;
    // 新增prePosition属性
    this.prePosition = null;
    // 存储merged两个Tile
    this.mergedTiles = null;
}
// 位置更新
Tile.prototype.updatePosition = function(position) {
    // 更新的时候，先将当前位置，保存为prePosition
    this.prePosition = { row: this.row, column: this.column };
    // 再进行位置更新
    this.row = position.row;
    this.column = position.column;
};

Tile.prototype.serialize = function() {

    return {
        position: {
            row: this.row,
            column: this.column
        },
        value: this.value
    };

};