/*
 * 以下說明可自行查閱 ES6 語法
 * 1. 修飾字 const 與 let 是用來取代 var 用的
 *  1.1 const
 *     # 這邊建議宣告都以const為主(宣告就要賦值，可以看以下範例)
 * 
 *      const foo;
 *      ====================================================
 *      輸出：
 *      SyntaxError: Missing initializer in const declaration
 * 
 *     # const 不可重新賦值
 * 
 *       const bar = 1;
 *       bar = 2;
 *       ===================================================
 *       輸出：
 *       SyntaxError: Assignment to constant variable.
 *     # 不會產生 global scope 變數(window、global)
 *     # const 只在大括號內有效 
 * 
 *  1.2 let
 *     # 除了字串(string)、數字(number)、布林(Boolean)型別外，建議使用const作為修飾，
 *       並且如果你的字串(string)、數字(number)、布林(Boolean)數值是不會更動的(唯讀)，也建議宣告為const。
 *     # 不會產生 global scope 變數(window、global)
 *     # let 只在大括號內有效(block scope)，
 *       這點是它與var的不同(var為function scope也就是有效變數區域是在最外層的function內，如果在最外層就等於宣告在global scope)
 *       註：nodejs 如果在最外層宣告var並不會變global scope，它會自動使用閉包來限制變數範圍
 * 
 * 2. 箭頭函式 () => {} 
 *    箭頭函式在不考慮this的情況下，以下兩者是相等的：
 *      # function版本
 *        const myfun = (par1,par2) => { some code... }
 *        function myfun(par1,par2) { some code... }
 *      # 匿名函式版本
 *        (par1,par2) => 'return value'   ==> 如果只有一行，不使用return語法回傳
 *        function(par1,par2) { return 'return value'}
 * 
 *    一般常使用在回調函式內使用，如以下express的路由回調匿名函式等等。
 */
// 引入中介軟體
const express = require('express');

// 創建express中介軟體
const app = express();

// 引入http body 的解析函式庫
const bodyParser = require('body-parser');

// 引入設定資料 config.js
const config = require('./config');

// 將 http body JSON 解析器加入中介軟體(加入後將可自動解析JSON格式的字串)
app.use(bodyParser.json());

// 串列資料保存陣列
let tempData = [];

function isEmpty(obj) {
    // 為null 或 undeifned 則為空值
    if ([null,undefined].indexOf(obj) != -1) return true;

    // 型別如果不是 object 則為空值(這邊將淘汰掉string的型別)
    if (typeof obj !== "object") return true;

    // 判斷object 或 array(算是object)是否有值，如沒有則為空
    for (var key in obj)
        if (obj.hasOwnProperty(key))
            return false;
    return true;
}

app.post('/temp', (req, res) => {
    // 如果解析為空，回傳狀態碼400(請求錯誤 => bad request)
    if (isEmpty(req.body)) {
        console.log('Bad request');
        return res.sendStatus(400);
    }
    // 後端印出請求內容
    console.log('POST:', req.body);
    // 將溫度資料存入變數
    tempData.push(req.body.temp);
    // 回傳狀態碼200(代表成功 => ok)
    res.sendStatus(200);
});

// 用於繪圖取得資料
app.get('/temp', (req, res) => res.send(tempData));

// 靜態繪圖URL __dirname變數為當前js檔的路徑
app.get('/', (req, res) => res.sendFile(`${__dirname}/client/html/plot-temp.html`));

// 動態繪圖URL __dirname變數為當前js檔的路徑
app.get('/dynamic', (req, res) => res.sendFile(`${__dirname}/client/html/plot-temp-dynamic.html`));

// 開始監聽
app.listen(config.serverPort, () => {
    console.log(`The node.js server is running at port ${config.serverPort}`)
});
