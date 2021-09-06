// 本地缓存
function Storage() {}

const BestScoreKey = '2048BestScore';// 最高分键
const CellStateKey = '2048CellState';// 格子面板键

// 缓存最高分数
Storage.prototype.setBestScore = function(bestScore){
    window.localStorage.setItem(BestScoreKey, bestScore);
}
Storage.prototype.getBestScore = function(){
    return window.localStorage.getItem(BestScoreKey);
}
// 缓存格子面板
Storage.prototype.setCellState = function({score, steps, grid}){
    window.localStorage.setItem(
        CellStateKey,
        // json格式化字符串
        JSON.stringify({
            score,
            steps,
            grid: grid.serialize()
        })
    );
}
Storage.prototype.getCellState = function(){
    const cellState = window.localStorage.getItem(CellStateKey);
    return cellState ? JSON.parse(cellState) : null;// json格式字符串转换为对象
}
