// 监听模块
function Listener({ move: moveFn, start: startFn }) {
    // 键盘监听
    window.addEventListener('keyup', function(e) {
        switch (e.keyCode) {
            case 38:
                // 使用监听回调，其回调参数数据将回传给listener，再到达manager模块
                moveFn({ row: -1, column: 0 });
                break;
            case 37:
                moveFn({ row: 0, column: -1 });
                break;
            case 39:
                moveFn({ row: 0, column: 1 });
                break;
            case 40:
                moveFn({ row: 1, column: 0 });
                break;
        }
    });
    // 按钮响应事件
    const buttons = document.querySelectorAll('button');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function() {
            startFn();
        });
    }
}