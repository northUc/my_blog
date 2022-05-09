# js基础
[[toc]]

## 类型转换
- 三等不转换数据类型,两等转换数据类型
- NaN 谁都不和他相等
- null==undefined null和undefined两个等号相等，三个等号不相等
- 对象 == 字符串 会把对象转成字符串再比较
- 剩余的都转换为数字进行比较
### valueOf&&toString

### +
- 1、两个操作数如果是number则直接相加出结果
- 2、如果其中有一个操作数为string，则将另一个操作数隐式的转换成string,然后在进行字符串拼接出结果
- 3、如果操作的是复杂数据类型,直接将他们转换成字符串,进行拼接
- 4、如果两个操作数是boolean,那么将他们转换成number相加
- 5、比较的时候会转换成数值进行比较
- 几个例子
```js
// 如果操作的是复杂数据类型,直接将他们转换成字符串,进行拼接
console.log([] + []) // '',对象相加 转string
console.log([] + {}) // [object Object],对象相加 转string ([]=>'',{}=>[object Object])  
console.log({} + []) // [object Object],注意js把()中的语句当做一个表达式,因此{}不能被理解为语句块,被理解成一个对象
console.log({} + {}) // [object Object][object Object] 
```
- 布尔
- 比较的时候会转换成数值进行比较
```js
console.log([]==[]) //false 他们比较的是引用地址值的不同
console.log([]==![]) //true [].toString() 转换成值是0,![]=>false=>0
console.log({}=={}) // false 引用地址不一样
console.log({}==!{}) // false  {} => [object Object] 所以不等

```
## script 标签
- 6个属性 async defer charset language src type
- 注意  
  - 1、script 标签内 不能存在</script>字符串 可以加反斜杠转义
  - 2、script标签放到head中 js会等head中的js全部被下载和解析后在执行body
  - 3、所以一般放到 body内 加快显示时间
  - 4、derfer 延迟执行 遇到</html>才会执行,也就是页面都解析完毕后在运行,一般都是先后顺序执行,先于 DOMContentLoad 事件
  - 5、async 异步执行 立即下载 执行顺序不是先后 一定会在load事件前执行 可能会在 DOMContentLoad 事件前后执行
  他们两个只适应外部脚本

## 五种数据类型
- Undefined Null Boolean Number String(typeof 获取类型值)
-  未定义  undefined
-  布尔值  boolean
-  字符串  string
-  数值    number
-  对象和null object
-  函数    function
```js
  // undefined 定义一个变量 没有赋值
  // Null 赋值一个空对象指针
  // 用法 只要意在保存对象的变量还没有真正保存对象 就用null
  // 都是只有一个值的数据类型
```
- Boolean 数据类型转换
```js
  // 数据类型        转换成true       转换成false
  // Boolean          true              false
  // String           非空              空字符串('')
  // Number           非零(包括无穷大)   0和NaN
  // Null             任何对象           null
  // Undefined        没有               Undefined
```
- Number
  - NaN 非数字的特殊值
  - 特点 任何NaN的操作都返回NaN,NaN与任何值都不相等 包括自己
  - isNaN() 将接收的值转换成数值 能返回fasle 否则true
- 转换方式
  - Number()适应任何类型
  - parseInt() 把不同进制的数值(第二个参数,是进制)转换成整数数值
    - 第二个参数 是转换成进制 若转换不了 就返回NAN 默认是10  parseInt(num,1)=>NAN  parseInt(num,2)=>2进制的num转换成整数
  - ParseFloat()
- Number转换
```js
// Boolean值 true/1 false/0
// null  0
// 字符串 
//   '001' => 1
//   ''(空) => 0
//   'asd' => NaN
//   '123aaa' => NaN
// 对象
//     调用valueOf() 和toString()
// ParseInt转换 (第二个参数是进制  默认是10)
//   '0001'=> 1
//   '123aaa' => 123
//   '' => NaN
//   '22.5' => 22
// ParseFloat(没有第二个参数)转换 
//   '1.22.33' => 1.22
```
- String
  - 字符串的特点 一旦被创建 他们的值就不变 要是改变的话 原来的字符串要被销毁 然后再用新字段填充
  - 转换方式
```js
// toString() 返回对应字符串的表现(数值 布尔 对象 字符串),可以传递(2,8,16进制)
//   null 和 undefined 没有这个方法
//   (10).toString(2)  => 1010,toString传入2将数值转换成2进制的数
//   parseInt(1010,2) => 10,parseInt第二个参数传2,就说明把一个二进制的数转换成整数
// String()
//   啥都可以转换(null和undefined 没有toString 但是可以用String进行转换)
//   如果值有toString 则调用
//   String(null)
//   值是null 返回 'null' undefined 返回 'undefined'
```
- object
  - 每个对象都有的方法
  - constructor 保存创建当前对象的函数
  - hasOwnProperty(propertyName) 检查属性在对象实例中(而不是原型链中)
  - toLocaleString() 返回对象的字符串表示 与执行环境有关系
  - toString()
  - ValueOf()
  - in 操作符 对象的属性  不管是实例中还是原型中 ('name' in person)
  - Object.keys(obj),for in 都是用来遍历对象的key(可枚举)
## 二进制操作符号
- 二进制码:就是二进制数
- 二进制反码:将二进制的0取1,1取0
```js
  // 按位非~ 
  //   计算规则:操作数的负数减一
  //     将1(这里叫：原码)转二进制 ＝ 00000001
  //     按位取反 ＝ 11111110
  //     发现符号位(即最高位)为1(表示负数)，将除符号位之外的其他数字取反 ＝ 10000001
  //     末位加1取其补码 ＝ 10000010
  //     转换回十进制 ＝ -2
  // 按位与(&)  
  //     计算规则:操作数二进制对齐 都是1返回1 其他返回0
  //     010&101=>000
  // 按位或(|)
  //     计算规则:操作数二进制对齐 只要是1返回1 都是0返回0
  //     0110|1001 => 1111
  // 按位异或(^)
  //     计算规则:操作数二进制对齐 只要有一个1就返回1 (00 11)都返回0
  //     (用法:1和0对取)
  //     1^1 =>0
  //     0^1 =>1
  // 左移(<<)
  //     计算规则:所有操作数向左边移动指定的位数(不影响符号)
  //     3<<2  => 12 
  // 右移
  //     有符号,保留符号(>>)
  //       计算规则:所有操作数向右边边移动指定的位数(与左移相反)
  //     没符号,不保留符号(>>>)
  //       (64)>>>5 => 2 这个正常
  //       (-64)>>>5 => 13427726 这个数很大  因为负数的二进制码 当整数的二进制码  一起移动(包括最高位的1)
  
```
- 布尔值
  - 逻辑非!
    - !false => true
    - !0 => true
  - 逻辑与&&
    - 属于短路操作(重点),第一个值能决定就不会执行第二个值(第一个值是false 就不会执行第二个值)
    - true && false => false
  - 逻辑或||
    - 有一个为true即返回true,同样是一个短路操作 第一个参数为true后面不会执行
## 一元操作符
- +(- 同理) 对应非数字会像Number()一样对值进行转换
  - +'01' => 1
  - + 'z' => NaN
  - 加法如果有一个操作数是字符串
    - 2个都是 就拼接起来
    - 只有一个 将另一个转换成字符串在拼接
  - 如果 是别的类型则调toString和valueOf 对于undefined和null 调用String
- 逗号操作符 返回最后一个
  - var num = (1,2,3,4) //num==4
- if() 里面都会调用Boolean()转换
- do{}while() 语句至少会执行一次
- while(){}
- for in 用来枚举对象的属性
- label 语句在代码中添加标签(多个for循环用)
  - break 退出后面的循环
  - continue 退出当前循环
```js
// outermost:
// for(let i=0;i<10;i++){
//   for(let j=0;j<10;j++){
//       if(i==5&&j==5){
//         break outermost,//(55)
//         // continue outermost,//(95)
//       }
//       num++
//   } 
// }
// console.log(num)
```
- with(){} 将代码的作用域 设置到一个特定的对象中
- switch 语句
```js
// switch(i){
//   case '2':
//     // 合并使用(一般备注下)
//   case '3':
//     console.log('3 or 2')
//     break;
//     // case值可以是表达式
//   case '4'+'5':
//     console.log('4'+'5')
//     break;
//   default:
//     break;
// }
```
- 函数的参数
```js
  // function fn(num1,num2){
  // }
  // fn(1,2)

  // 当fn有传递值的情况下 num1,num2 和arguments 值永远保持同步
  // 当fn没有给值的时候 num1,num2 就是undefined,arguments为空没有值  修改任意一个 他们值不同步
```
## 变量作用域
- 检查类型
```js
// typeof 一般用来检查 基本数据类型(最佳的工具)
//   未定义  undefined
//   布尔值  boolean
//   字符串  string
//   数值    number
//   对象和null object
//   函数    function
// 对象(instanceof)
//   obj instanceof Object
// 数组
//   Array.isArray(arr)
//   if(value instanceof Array)// 需要环境
```
- 执行环境定义了变量或函数有权访问其他数据,决定了他们各自的行为,每个执行环境都有一个关联的变量对象
- 在web中,全局执行环境认为是window对象，某个环境中的所有代码执行完成后,该环境被销毁,其中所有变量等 都销毁,全局执行环境直到浏览器关闭才销毁
- 作用域当前访问的权限
- 作用域链保证了对执行环境有权访问所有变量和函数的有序访问
- 作用域在创建的时候 就确定了 不是在执行的时候确定的
### 延迟作用域链
- try-catch 他会创建一个新的变量对象
- with语句 会将执行对象添加到作用域链中
- 这两个语句都会在作用域链的前端添加一个变量对象
### 变量声明 
  - 使用var 声明的变量会自动被添加到最近的环境中,在函数中就是当前函数的局部环境
  - 如果不使用var 则被加到全局环境中
## 引用类型
### 创建对象
```js
// 1、let obj = new Object()
// 2、person={
//     name:'sg'
//   }
// 读取属性
//   person.name/person['name']
```
### 创建数组
```js
// 1、var colors = new Array(20)// 20 代表的是创建length =20的数组 
// 2、var colors = new Array(['red','blue'])
// 利用length属性对数组进行增删
//   var colors = new Array('red','blue')
//   colors.length = 1 // blue就会被删除掉
//   colors.length = 2 // ['red','undefined']
```
- 转换方法
  - toSting()会返回由数组中每个值的字符串形式拼接而成的一个逗号分隔的字符串
  - 也等同 join(',')方法 (join 接收undefined 或者空 和接收',' 是一样的,如果是null 就不一样了)
  - var c = ['red','blue']; c.toString() //red,blue
  - valueOf() 同样返回数组本身
  - alert(c)  同样结论,alert要接收字符串参数 默认会调用toString
- 数组方法  
  - 栈方法(后进先出)
    - push 将参数逐个添加到数组末尾,修改数组长度
    - pop  删除末尾最后一项 减少length
  - 队列方法(先进先出)
    - shift 
    - unshift
  - 重排序方法
    - reverse 倒序
    - sort
      - sort((a,b)=>a-b) 返回负值位子不变,返回正值调换位子,返回0位子不变(第一个值位于第二个值前面 返回负数 第二个值位于第一个值前面返回正数)
  - 操作方法
    - concat 连接 返回新的数组 原数组不变
    - slice('startNumber','endNumber') 包前不包后 返回新的数组 原数组不变
    - splice 
      - 删除 (0,2)从第0项开始 删除2个
      - 插入 (2,0,'item','item1') 第二项开始,删除0个,插入item和item1
      - 返回删除后的内容  原数组变化
  - 位置方法
    - indexOf()和lastIndexOf()
    - 返回查找到的项在数组中的位置,没有查找到就返回-1,查找会用全等去比较
    - 第一个参数是要查找的值  第二个参数是查找的起始位置
  - 迭代方法
    - every
    - some
    ```js  
      var num = [1,2,3,4,5]
      var everyRs = num.every((item,index,arrary)=>item>2) =>false
      var someRs = num.some((item,index,arrary)=>item>2) =>true
    ```
  - filter
    ```js
      var num = [1,2,3,4,5]
      var filterRs = num.filter((item,index,array)=> item>2) => [3,4,5]
    ```
  - forEach
    ```js
      var num = [1,2,3]
      num.forEach((item,index,array)=>{//执行某些操作})
    ```
  - map
    ```js
      var num = [1,2,3]
      var mapRs = num.map((item,index,array)=> item*2) => [2,4,6]
    ```
  - 归并方法
    reduce&&reduceRight
      他们接收4个参数:前一项,当前项,索引,数组对象
    ```js
      var num = [1,2,3,4,5]
      num,reduce((pre,cur,index,array)=>{
        //若传递了第二个参数 即index从0开始 pre就是第一个  否则从1开始 cur就是第一个
      },{})
    ```
### Date 
- Date.parse() 接收的是字符串不能是number
```js
// 格式 
//  月/日/年 => 6/13/2004
//  2004-05-25T00:00:00 
//  Date.parse('日期')这个等同于new Date('日期')
```
- Date.UTC()
- Date.UTC(年,月，日，时，分，秒) 表示返回当前的毫秒数
```js
// 参数  返回时间戳
//  年分,基于0月开始(0是一月,1是二月),小时基于0到23 
//  年月是必须的
```
- new Date 接收的参数与Date.UTC 一样
- Date.now() 表示返回当前的毫秒数 ，返回的都是毫秒数
- toLocaleString,toString,valueOf方法
- toLocaleString 和toString大致一样的效果 返回时间
- valueOf方法 返回日期的毫秒数 可以用操作符来比较日期值
```js
// var date1 = new Date(2007,0,1)
// var date2 = new Date(2007,1,1)
// alert(date1>date2) // false
```
- 日期格式化
```js
// toDateString 显示星期几、月、日、年
// toTimeString 时分秒和时区
// toUTCString 实现格式化完整的UTC日期
```
- 方法
```js
// getTime/setTime  同valueOf 返回毫秒数/设置毫秒数
// getFullYear/setFullYear 取得4位数的年份
// getMonth/setMonth 设置月份0开始 11表示十二月/设置超过11则增加年份
// getDate/setDate  设置日1开始 / 设置超过31则增加月份
// getDay/setDay 设置星期几
// getHours/setHours 返回日期的小时数0-23
// getMinutes/setMinutes 返回分0-59 
// getSeconds/setSeconds 返回秒
// getTimezoneOffset 返回本地时间与UTC时间相差分钟数
```
### 正则
- 创建 
```js
// 1、
// var pattern1 = /cat/g
// var pattern2 = new RegExp('cat','g')
// 注意给RegExp 传递的是字符串,需要对特殊字符进行双重转义
//               new 对象里面传递的是字符串  直接写不是字符串
//   字面量模式         等价的字符串(即用RegExp创建的参数)
// /\[bc\]at/  =>  "\\[bc\\]at"
// /\d.\d{1,2}/  =>  "\\d.\\d{1,2}"
// /\\hello/   => '\\\\hello'

// 2、
// let path = '/user/:uid/:name';
// let reg1 = /\:\w+/g
//   console.log(reg.source) => \:\w+
  
// // 这里注意 \\w  我们要他的\  里所有的第一个\代表转义 最终我们要得到(\w) 所以就是\\  
// let reg2 = new RegExp('\:\\w+', 'g')

// let name = '/user/:uid/:name'.match(reg)
```
- 标志
  - g:表示应用所有字符串,而非在发现第一个匹配后立即停止
  - i:表示不区分大小写
  - m:表示多行模式,即在到达一行文本末尾时还会继续查找下一行中是否存在与模式匹配的项
- 元字符
  - 所有的元字符都需要转义
- 实例属性
```js
  // global 布尔值,表示是否设置了g标志
  // ignoreCase 布尔值,表示是否设置了i标志
  // lastIndex 整数,表示开始搜索下一个匹配项的字符位置,从0开始(带g才有效果 不然每次都是从头开始)
  // multiline 布尔值 表示是否设置了m表示
  // source 正则表达式的字符串表示

  // var pattern = /\[bc\]at/i;
  // console.lo(pattern.global) => false
  // console.lo(pattern.ignoreCase) => true
  // console.lo(pattern.multiline) => false 
  // console.lo(pattern.lastIndex) => 0
  // console.lo(pattern.source) => "\[bc\]at"
```
- 实例方法
```js
  // exec 接收一个字符串参数 返回匹配的内容，或者没有匹配项情况下返回null
  // 返回的是array实例,记住不能随便加空格,没有捕获组则该数组只包含一项,捕获组就是中括号
  //   index 表示匹配项在字符串中的位置
  //   input 正则表达式的字符串
  //     let text = "mom and dad and bady"
  //     var p = /mom( and dad (and bady)?)?/gi
  //     var p1 = /nd/gi
  //     var ma = p.exec(text)
  // 若是不加g他每次只返回一个匹配项,每次调用exec则都会在字符串中继续查找新的匹配项索引的第一个就是匹配到的值
  // 若正则匹配项里面加()(即捕获组)则匹配所有满足的  如果带g他的index会有变化
  // test 接收一个字符串参数 匹配到内容就返回true 否则就fasle
  //   toString方法 
  //   RegExp 和 字面量创建的 toString方法都返回正则表达式的字面量
  // valueOf 返回正则表达式的本身 是一个对象
```
-  静态属性 (基于最近一次正则表达式操作而变化)
```js
// RegExp 上的方法
// $n n代表()内匹配数据
// input($_) 最近一次要匹配的字符串
// lastMatch($&) 最近一次匹配的结果
// lastParent($+) 最近一次匹配的捕获组
// leftContext($`) 匹配结果之前的数据
// rightContext($') 匹配结果之后的数据
// multiline($*) 布尔 表示是否所有表达式都使用多行模式
```
###  函数
-  内部属性
  - this 看执行环境
  - caller 这个是属性保存着调用当前函数的引用
```js
// function outer(){
//   inner() 
// }
// function inner(){
//   alert(inner.caller)
//   //console.log(arguments.callee.caller)

// }
// outer()
```
- arguments 类数组 包含传入函数中所有的参数
- arguments.callee callee是一个指针 指向拥有这个arguments对象的函数
```js
function factorial(num){
  if(num<-1)
    {
      return 1;
    } 
  else {
    retrun factorial(num-1)
    // 或者argumeng.callee(num-1)
  }
} 
```
- 函数的属性
  - length 表示函数希望接收的命名参数的个数
  - prototype 属性不可枚举
  - call/apply/bind    
  - 阶乘 arguments.callee代表的当前的行数
```js
  // function factorial(num){
  //   if(num<=1){
  //     return 1;
  //   }else{
  //     return num*arguments.callee(num-1)
  //   }
  
  // }
```
- Number
```js
// 方法 (四舍五入)
// toFixed(num)
// let rs = 10 
// console.log(rs.toFixed(2))//10.00
```
- string
```js
// 方法 访问字符串中特定的方法
//   charAt()/charCodeAt() 都接收一个参数
//   或者 用中括号加数字
// 操作方法
//   concat() 连接 可接受多个参数 进行拼接
//   slice/substr/substring
//     slice和substring 2个参数起始位置
//     substr 开始位子和个数
//     负值
//       slice会将负值与字符串长度相加
//       substr 第一个加长度 第二个转换为0
//       substring 负值变成0 然后 0和领一个数值换位子 从小到大
//     返回操作后的数字 原不变,若第二个不传 则将字符串末尾作为结束位置
//   trim 删除前置及后缀的所有空格,然后返回结果,原数组不变
//     非标准trimLeft和trimRight
//   toLowerCase(转换成小写)和toUpperCase(转换成大写)/toLocalLowerCase和toLacalCase(针对特定的地区实现)
//   localeCompare 比较2个字符串
//     如果字符串在字母表中应该排在字符串参数之前,返回负数
//     如果字符串等于另一个字符串,返回负数
//     如果字符串在字母表中应该排在字符串参数之后,返回正数
//   indexOf('') lastIndexOf('') 查找返回字符的索引 第二个参数从哪个位子开始找
// 字符串匹配的方法
//   match
//     与exec参数啥都一样
//     区别 
//       match带g将匹配到的数组放在数组内返回(带不带捕获组都一样)
//       exec带g只是index会有变化
//   search
  
//   replace(字符串/正则,字符串/函数)
//     var text = "cat,bat,sat,fat"
//     var rs = text.repalce("at","ond")
//     // "cond,bat,sat,fat"
//     var rs = text.repalce(/at/g,"ond")
//     // "cond,bond,sond,fond"
//   参数 
//     第一个参数:字符串或者正则
//     第二个参数:字符串或者函数
//         函数参数说明
//           参一 要匹配的内容,与replace的第一个参数一样
//           参二 要匹配的内容对应的位子下标(如果有使用()分组 就返回分组的值,对应的下标就到参数三或者往后排)
//           参三 原字符串
//           注意:这个函数必须要有一个返回值,否则的话它就会拿undefined替换掉原来的内容
//   返回:替换后的新字符串,原来的字符串没有变化
    
//   例子
//       let str = '123wqeqw123qweqq3232we'
//       let r = /(\d+)\w/g
//       let rs = str.replace(r,(r1,r2,r3)=>{
//         console.log('=====',r1,r2,r3)
//       })
//   正则表达式 字符串内有一些特殊的字符
//     他们是RegExp 对象上的静态方法
//     $$  $
//     $&  匹配模式的子字符串 与RegExp.lastMatch 的值相同 (lastMatch 最后匹配的值)
//       你不能使用属性访问器(RegExp.$&)来使用简写的别名，因为解析器在这里会将 "&" 看做表达式，并抛出 SyntaxError 。使用 方括号符号来访问属性。
//     $n  匹配第n个捕获组的子字符串 n(0-9),如果正则表达式没有定义捕获组 则使用空字符串
//     $nn 匹配第nn个捕获组的子字符串 nn(00-99)
```
## Global对象
- URI 
```js
//  encodeURI 和 decodeURI 对URI进行编译 有效的URI不能包括空格  而他们就是对空格进行编码和解析(他会对% 空格 等进行转义)
//  encodeURIComponent 和 decodeURIComponent 则对任何非标准字符串进行编码
// var uri = "http://www.baidu.com/a b";
// console.log(encodeURI(uri)) // http://www.baidu.com/a%20b 
// console.log(encodeURIComponent(uri)) // http%3A%2F%2Fwww.baidu.com/a%20b 
```
-  eval 是一个js解析器 接收一个参数 即要执行的js字符串
```js
// eval("alert('hi')")
// eval 中创建的任何变量或函数都不会被提升
// 但是在strict严格模式下 eval不能被赋值 && 外部访问不到eval中创建的任何变量
```
- 对象的属性
```js
// undefined/NaN/infinity  
// Object/Array/Date/Error/RegExp
// String
// Number
// Boolean
// Function 
// js明确禁止给 undefined/NaN/infinity 赋值
```
- Math
```js
// min&&max 方法用于确定一组数值的最大值和最小值
//   var max = Math.max(3,5,1,22)
//   console.log(max) // 22
// 借助 apply
//   var values = [3,5,1,22]
//   var max = Math.max.apply(Math,apply)
// 舍入方法
//   Math.ceil(25.9) //26 向上舍入
//   Math.floor(25.1) //25 向下舍入
//   Math.round(25.9) //26 四舍五入
// random方法 返回0到1之间的数
//   //获取2个数之间的任意数
//   function selectFrom(lowerValue,upperValue){
//     let choices = upperValue - lowerValue
//     return Math.floor(Math.random()*choices + lowerValue)
//   }
//   selectFrom(2,10)
//   //这个函数很有用 可以在数组中随机取一项
//   let arr = ['red','green','blue','black']
//   var color = arr[selectFrom(0,arr.length-1)]
```
- 面向对象
  - 属性类型:数据类型和访问属性
```js
// 数据属性
//     configurable 表示能否通过delete 删除 默认是true
//     Enumerable 表示能否通过for-in循环 默认true
//     Writable 表示能否修改属性的值 默认true
//     Value 读写都要经过这儿 默认是undefined
//   要修改属性的默认特征 必须用Object.defineProperty ('属性所在的对象','属性的名字','一个描述符对象')方法, 描述符即上面数据属性(可设置一个或者多个)
//   configurable 值一旦被修改成 false 就不能在设置true 会报错的
//   如果通过 Object.defineProperty 创建的新属性 如果不指定的情况下 configurable Enumerable Writable 都是false
// 访问器属性
//   不包含数据值 也就是上面的value,它包含getter和setter
//   特征
//     configurable 表示能否通过delete 删除 默认是true
//     Enumerable 表示能否通过for-in循环 默认true
//     get 读取值调用的函数
//     set 设置值调用的函数
//     var book = {
//       _year:2004,
//       edition:1
//     }
//     Object.defineProperty(book,'year',{
//       get:function(){
//         return this._year
//       },
//       set:function(val){
//         if(val > 2004){
//           this._year = val
//           this.edition + = val-2004
//         }
//       }
//     })
//     book.year = 2005
//     console.log(book.edition)
// Object.defineProperties('对象',{
//   'key1':{},
//   'key2':{}
// })
```
- 读取属性特征
  - Object.getOwnPropertyDescriptor('对象','属性') 可以获取属性的特征 也就是上面的配置
## 创建对象
- new Object(null) 不会产生原型链，{} 会产生
- 1、字面量
```js
//   let obj = new Object()
//   缺点:产生大量重复的代码
```
- 2、工场模式
```js
//   function createObj(){
//     let obj = new Object()
//     return obj
//   } 
  
//   var a1 = createObj()
//   var a2 = createObj()
//   缺点:没有解决对象识别问题(怎样知道一个对象的类型)
```
- 3、构造函数
```js
//   function Person(name){
//     this.name = name
//     this.sayName = ()=>{}
//   }
//   // this.sayName = ()=>{} 等同于 this.sayName = new Function()
//   var a1 = new Person('sg')
//   缺点:每个方法都要再实例上面重新创建一次
//     可以修改
//     function Person(name){
//       this.name = name
//       this.sayName = fn
//     }
//     function fn(){}
//   缺点 每个实例确实只创建了一次fn 但是fn成了全局的了
```

- 4、原型模式
```js
//   function Person(){
//     this.arr = []
//   }
//   Person.prototype.name = 'sg'
//   Person.prototype.fn = ()=>{}
//   缺点:问题就是数据共存,SubType的实例都能都是拥有公共的arr
// 原型中的方法 (person 是 Person直接new出来的)
    // __proto__ 指向 isPrototypeOf 方法的对象 返回true
    //   Person.prototype.isPrototypeOf(person) //true/false
    //   Object.getPrototypeOf() 获取__proto__
    //   Object.getPrototypeOf(person) == Person.prototype
    // 对象的constructor属性是用来标识对象类型的  判断实例是否是某构造函数直接生成
    //   person.constructor
    // 对象的所有实例 
    //   person instanceof Object // true
    //   person instanceof Person // true
  ```

- 5、构造函数和原型模式组合
```js
    //   function Person(name){
    //       this.name = name
    //   }
    //   Person.prototype = {
    //     constructor:Person
    //     sayName:function(){
    //         return this.name
    //     }
    //   }
```
## 继承
- 1、原型链
```js
//   function SuperType(){
//     this.arr = []
//   }
//   function SubType(){}
//   SubType.prototype = new SuperType()
//   缺点:问题就是数据共存,SubType new出来的 实例都能都是拥有公共的arr
```
- 2、借用构造函数(call/apply)
```js
//   function SuperType(){
//     this.arr = []
//   }
//   function subType(){
//     superType.call(this)
//     this.fn = ()=>{}
//   }
//   缺点:方法在构造函数中 无法复用 每次都是重新创建
```

- 3、组合(借用构造函数和原型链)
```js
//   function SuperType(name){
//     this.name = name
//     this.arr = []
//   }
//   SuperType.prototype.fn = ()=>{}
//   //继承
//   function SubType(name){
//     // 属性继承
//     SuperType.call(this,name)
//   }
//     // 方法继承 
//   SubType.prototype = new SuperType()
//   SubType.prototype.constructor = SubType
//   SubType.prototype.fn1 = ()=>{}
//   // 缺点 SuperType 会执行2次
```

- 4、原型式继承
```js
//   条件 必须要有一个对象可以作为另一个对象的数据, 通过 Object.create() 函数 
//       第一个是接受的对象 第二个是对对象属性的描述(与Object.defineProperties()第二个参数一样)
//   let person = {
//     name:'sg',
//     age:18
//   }
//   // Object.create用法 可以接受2个参数
//   let obj = Object.create(person,{
//     name:{
//       values:'xxx'
//     }
//   })
//   使用场景  让一个对象跟另一个对象保持相似的情况下
```

- 5、寄生组合式继承
```js
//   function fn(subType,superType){
//     var p = Object(subType.protoType)
//     p.constructor = subType
//     subType.prototype = p
//   }
//   function Super(){}
//   S.prototype.sayName = ()=>{}
  
//   function Sub(name,age){
//     Super.call(this)
//     this.age = age
//   }
//   // 将原型挂载上去
//   p(Sub,Super)
//   Sub.prototype.fn1 = ()=>{}
```
## 函数
- 有两种方式定义:函数声明和函数表达式
  - 函数声明 特征 函数声明提升(函数表达式不会)
- 递归 
  - 这种情况下要回调函数自身,如果是匿名函数可以通过 arguments.callee(指向的就是当前函数),严格模式下报错,可以用函数表达式
## 闭包
- 定义:指有权访问另一个函数作用域的变量的函数
## this
- this对象是在运行时基于函数的执行环境绑定,但是匿名函数的执行环境具有全局性,指向的是window 
- 例子 非严格模式下
```js
  // 1、  var name = 'the window'
  //   var obj = {
  //     name:'my obj'
  //     fn:function(){
  //       return this.name
  //     }
  //   }
  //   obj.fn() //'my obj'
  //   obj.fn = obj.fn //'the window'
  // 2、var name = 'the window'
  // var obj = {
  //   name : 'my obj',
  //   fn:function(){
  //     return function(){
  //       return this.name
  //     }
  //   }
  // }
  // obj.fn()() //the window  
```
## window
- 它作为全局对象的根 所有的全局变量和方法都放在他下面
- delete
> 能删除 window.a = 'xx'(或者 a = 'xx') ;delete window.a  a=>undefined  因为window 属性有个[[configurable]] 为false 
  但是不能删除 var a = '1'; delete window.a  a=>1 

- 窗口位置
> screentX/screentY screentLeft/screentTop   

- 窗口大小
```js
// outerHeight/outerWidth 浏览器所有的宽高(包括边框等能看到的东西)
// innerHeight/innerWidth 浏览器可视区的宽高
// window.open($1,$2,$3)
//   $1
//     url
//   $2 
//     _blank - URL加载到一个新的窗口。这是默认
//     _parent - URL加载到父框架
//     _self - URL替换当前页面
//     _top - URL替换任何可加载的框架集
//     name - 窗口名称
//   $3 窗口的大小 当有值的时候 _blank 在新的页面中打开
//     height/width/top/left 等 
//   注意 let w = window.open($1,$2,$3)  要将w.opener=null 因为新窗口的opener 指向当前window 
//       a 标签也是也有问题 处理：添加noopener 属性
//       通过 window.opener.location = newURL 来修改原来网页的url    
```
-  系统对话框
```js
// alert() 弹出框
// confirm() 显示 确认 和 取消 有返回值
// prompt() 显示 确认 和 取消 自带一个输入框 有返回值
```
-  location 
```js
// window.location和document.location 应用的是同一个对象
//     hash      '#xxxx'
//     host      'www.xxx.com:80'
//     hostname  'wwww.xxx.com'
//     href      'http://www.xxx.com'  完整的url  location.toString 也返回这个
//     pathname  '/xxx/'
//     port      '8080'
//     protocol  'http:'
//     search    '?q=x'    
//     操作 
//       下面3个方法 都一样 跳转URL
//       location.assign('xxxx')  window.location='xx'  location.href='xx' 
//     以上操作 除了hash 其他的设置修改 都会触发浏览器的重新加载
//     以上所有操作都会产生一条记录  但是使用replace('只接受一个参数') 不会产生记录
//     location.reload() //重新加载 (可能走缓存) 
//     location.reload(true) //重新加载 (从服务器重新加载) \
```
-  navigator
  - 记录浏览器的信息
  - 1、检查插件 主要plugins 每个里面的name(IE不支持,书上有暂时不记录了)
  - navigator.plugins
```js
// function hasPlugin(name){
//   name = name.toLowerCase();
//   for(let i=0;i<navigator.plugins.length;i++){
//     if(navigator.plugins[i].name.toLowerCase().indexOf(name)>-1){
//       return true
//     }
//   }
// }
// hasPlugin('Flash')
```
  - 2、浏览器信息 
  -  navigator.userAgent 
```js
// screen 显示了一堆浏览器的数据(具体看书)
// history 书上介绍的少
//   length 属性保存着历史记录  设置为0  即情况历史记录
//   go('xx') 页面跳转
//   back()   向后
//   forward()向前
```
## DOM
- html 元素通过元素节点来表示,节点类型一起12个
- dom.nodeType(1 元素, 2属性, 3 文本,8 注释,9 跟节点)
- dom.nodeName 元素的标签名 只有元素节点才有
### 节点关系
- dom.parentNode 
- dom.childNodes
- dom.previousSibling
- dom.nextSibling 
- dom.firstChild
- dom.lastChild  (父元素下的第一个节点(节点和元素 是2个东西)
- dom.ownerDocument (指向当前的document(每个节点都有))
### 节点操作
- parentNode.appendChild(node)  往父节点内插入一个节点
- parentNode.insertBefore(node,flagNode) 一个参数 插入到第二个 目标元素 之前(若为空 效果等同于appendChild,必须有2个参数)
- parentNode.replaceChild(node1,node2) 第一个节点 替换 第二个节点
- parentNode.removeChild('node') 要移除那个节点
- 以上4个操作 都是在父节点下使用,同时必须要有子节点,否则会报错(文本节点就不行)
- clone(false) 浅拷贝  
  - clone(true) 浅拷贝  拷贝的时候要注意id
### document
- body 属性 直接指向document.body
- doctype 属性来访问 <!DOCTYPE html> 实体
- URL  === location.href 获取完整的url
- domain === location.hostname 获取域名
- referrer 获取来源页面的URL 
- 特例:
  - document.domain 阔以处理同不同页面  共同主域的页面跨域
- 1、以上只有domain 可以设置值 由于跨域的考虑 只能设置URL 包含的域
  - (例如 url: p2p.xx.com(紧绷型)  => 只能设置成xx.com(松散型))
- 2、domain 一开始是松散型 就不能设置成紧绷型 过来阔以
### 查找元素
- getElementById()  id区别大小写 
- getElementsByTagName('标签名或者*') 标签名不区分大小写 * 是匹配所有的标签(html标签也会返回,按顺序放在数组内) 动态获取的(随着标签变化)
- getElementsByName('xss') 获取name值是xss 的节点
- 特例
  - document.anchors 所有带name特性的 a标签
  - document.forms === document.getElementByTagName('form')
  - document.images === document.getElementByTagName('img')
  - document.links 所有带 href的 a标签
  - 写入
  - write()/writeln()  都接收一个字符串 后者会默认添加一个\n
    - 还阔以 动态写入 script 标签
  - open()/close() 分别用于打开和关闭网页的流输出
### Element 
- 属性 id/class/title/lang/dir
- dir 值ltr(从左到右) rtl(从右到左)
-  getAttribute()  不区分大小写 
>  获取元素的属性  自定义的也可以
    另外 dom.属性 不能获取到自定义 也不区分大小写
    属性获取和getAttribute方法获取 两个特例会不同
    
>  1、style 属性获取返回一个对象  方法获取会返回只返回内联样式设置的
   2、onclick 属性获取的是函数    方法获取的是一个onclick里面的字符串 
- setAttribute()
>  设置属性 属性或者setAttribute 增加的自定义属性 双方都不能获取到
  方法设置的属性 会显示在html 结构中,属性增加的不会
  方法设置的 不管大小写 都统一转成 小写
-  removeAttribute()
  -  删除属性
>   attributes 获取元素所有的属性 返回的是一个集合
    nodeValue nodeName 某一个属性的 key和value
    createElement 方法创建一个元素  不区分大小写
### 文本
  - appendData('zz') 将text添加到节点的末尾
  - deleteData(offset,count) 删除指定位子的 个数
  - insertData(offset,text)
  - replaceData(offset,count,text)
  - splitText(offset) 分隔文本节点
  - createTextNode 创建文本节点
### 动态脚本
  - 创建的脚本 阔以放到body也阔以放到head中
```js
  let script = document.createElement('script');
  script.type = 'text/javascript'
  let code = "function sayHi(){alert('hi')}; sayHi()"
  script.appendChild(document.createTextNode(code))
  document.body.appendChild(script)
```
### 动态样式
>  只有link和style标签能够把css样式包含到html中
  必须将link标签添加到head中而不是body
  加载外部样式文件的过程是异步的

### 选择符
```js
// document.querySelector('选择符') 静态获取的 不会随着元素多少而变化
// document.querySelectorAll('选择符')
// document.childElementCount 返回子元素的个数
// getElementsByClassName('') 传入class 返回目标元素 动态获取的
// dom.classList 获取所有的class 是一个集合 同时阔以对他设置(传入的也是数组或者集合)
//   他有一系列操作方法
//   add(value) 添加列表中 值存在了就不添加了
//   contains(value) 列表中是否存在
//   remove(value) 从列表中删除
//   toggle(value) 如果列表中有值就删除,没有就添加
```
### 焦点
  - document.activeElement === 触发焦点的元素
### readyState 属性
>   他来实现一个指示文档已经加载完成的指示器
    loading 正在加载文档
    complete 加载完文档完 配合onload 事件 
### 浏览器模式(document.compatMode)
```js
  // 标准模式值 'CSS1Compat' (<!DOCTYPE html>)
  // 混杂模式 'BackCompat'
```
###  标签自定义属性
```js
// 添加 格式 data-xxx(data-开头)
// 访问 dataset.xxx
```
###  插入标记
- innerHTML 
```js
  // 只读模式:返回元素所有的子节点
  // 写模式:插入的内容 会覆盖原有的子节点
  // 插入 script标签(暂时没有成功)
  // 插入 style标签
  // dom1.innerHTML = '<style type=\"text/css">body{background-color:red}</style>'
```
- outerHTML 
  - 相对innerHTML 会把自身加上去
- insertAdjacentHTML(位子,插入的文本)
  - beforebegin 在当前元素之前插入一个紧邻的同辈元素
  - afterbegin 在当前元素之下插入一个新的子元素
  - beforeend 在当前元素之下插入一个新的子元素
  - afterend 在当前元素之后插入一个紧邻的同辈元素
### scrollIntoView() 作用于每一个元素 
  - 可以让元素滑动 与浏览器顶部(true 默认)或者底部对齐(false) 聊天界面用它
  - dom1.scrollIntoView(false);
### children 返回元素元素的子节点 文本会过滤掉
  - 与childNodes比较(childNodes 什么节点都会返回 children只会返回元素的子节点)
### contains() 被检测的节点是后代子节点
  - document.documentElement.contains(document.body)//true
### compareDocumentPosition 返回节点间的位子关系
```js
  // 1   无关
  // 2   居前 给定节点在DOM树中位于参考节点之前
  // 4   居后 给定节点在DOM树中位于参考节点之后
  // 8   包含 给定节点是参考节点的祖先
  // 16  被包含 给定节点是参考节点的后代
  // 关系值阔以叠加(2 8,4 16 一般都是一类)
```
###  插入文本
```js
// innerText 包裹子文档树中的文本 读取时候 他会按照浅入深的顺序
//   写入值时,结果会删除元素的所有节点 插入节点
// outerText 读取值的时候同上
//   写入值时, 会把自己替换掉
```
## DOM2
### style 变化
  - dom.style 对象下面 有很多属性
  - 不包含与外部样或者嵌入样式层叠表(只有js设置 和 style 有效)
  - 访问元素 带-  变成驼峰大小写 
    - dom.style.color
    - dom.style.backgroundImage
  - 设置值的是 一般要给px(单位)
  - cssText 设置 访问style的css 值是字符串
  - length 属性是自己设置的style 属性值 阔以通过dom.style[i] 访问到属性
  - getPropertyValue 通过prop 获取value值
### 计算样式  
  - document.defaultView.getComputedStyle(dom,null)
  - // 等同window.getComputedStyle(dom,null)
  - 第二参数处理伪元素的 null即没有 若有可以设置为':after'等
  - 获取元素最后的css 属性值 只读不支持修改
### 操作样式表
  - 检查 知否支持 DOM2
  - document.implementation.hasFeature('styleSheets','2.0')
  - 获取样式
    - document.styleSheets 集合获取所有的
    - styleDom.sheet  获取style的css属性
  - 修改
    - 直接对 styleDom.sheet 里面的值进行修改
  - 创建
    - style.sheet.insertRule(`.div{ color:blue}`)
  - 删除  
    - sheet.deleteRule(0)
### 元素大小
- 偏移量
  - offsetHeight:元素垂直方向上占用的空间大小（包括边框）
  - offsetWidth:元素水平方向上占用的空间大小（包括边框）
  - offsetLeft:与父级左边框之间的距离（getElementLeft() 值相同）
  - offsetTop:与父级右边框之间的距离（getElementTop() 值相同）
  - clientWidth/clientHeight(不含边框的宽高)
- 滚动大小(body自带滚动,元素要加overflow)
  - scrollHeight/scrollWidth 在没有滚动时 就等于元素本身,最小值就是元素本身,主要用来确定元素内容的大小
    - 带滑动的页面，高度就是documentElement.scrollHeight
  - scrollLeft/scrollTop 被隐藏左右边的像素 可以设置值 
```js
  // 延时处理 不然不生效  不加单位
  document.documentElement.scrollTop  = '100'
  document.documentElement.scrollLeft  = '0'
```
- dom.getBoundingClientRect() 获取元素的位子信息
### 遍历
- NodeIterator
  - document.createNodeIterator(root,whatToShow,filter,entityReferenceExpansion) 下面的遍历的用法 实际参数参考书籍
  - NodeIterator 类型中只要是 nextNode()和previousNode()进行遍历,他是深度优先遍历
```html
  <div id="div1">
    <p><b>122</b> world!</p>
    <ul>
      <li>List item 1
        <span>1111111</span>
      </li>
      <li>List item 2</li>
      <li>List item 3</li>
    </ul>
  </div>

  <script>
    let dom = document.querySelector('#div1')
    var filter = function(node){
      // FILTER_ACCEPT 显示当前的信息 
      // FILTER_SKIP 过滤当前的信息
      return node.tagName.toLowerCase() === 'li'? NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP
    }
    let iterator = document.createNodeIterator(dom,NodeFilter.SHOW_ELEMENT,filter,false)
    let rs = iterator.nextNode()
    while(rs){
      console.log(rs.tagName)
      rs = iterator.nextNode()
    }
  </script>
```
- TreeWalker 比 NodeIterator 高级用法参数一样,但是多了几个api
  - 除了 nextNode 和 previousNode 方法之外
  - parentNode
  - firstChild 
  - lastChild
  - nextSibling
  - previousSibling
## 事件
- 事件流，'DOM2级事件'规定的事件包括三个阶段,事件捕获阶段,处理目标和事件冒泡阶段
- 传播流程:1、目标在捕获开始,但是不会接收到事件。2、处于目标阶段，事件处理。3、冒泡阶段,事件又传播会文档
### UI事件
- load 
  - 1、当页面完全加载(所有资源),就会触发window上的load事件
  - 2、图片加载完成也会触发img上的load事件(注意,事件要在src赋值之前指定)
  - 3、script 动态加载js文件是否加载完毕(注意,事件和src顺序没有关系)
- resize事件/scroll事件
  - resize，浏览器窗口调整新的高度和宽度,浏览器窗口最大小化，就会触发resize,绑定在window上(一般浏览器窗口变化了1px像素才会触发)
  - scroll，浏览器滑动触发
### 焦点事件(还有其他的不常用具体看书)
- blur事件 失去焦点时候发出,不会冒泡
- focus事件 聚集焦点,不会冒泡
### 鼠标事件(具体的看书)
- click 鼠标和enter键都可以触发
- dblclick 双击 (注意 click 和dblclick 依赖于mousedown和mouseup事件触发而触发,mousedown和mouseup不依赖别的)
- mousedown 鼠标按下任意键
- mouseenter/mouseleave 进入离开 不会冒泡
- mousemove 移入
- mouseover/mouseout 进去移除  会冒泡
- mouseup 鼠标抬起
### 键盘事件
- keydown/keypress 按下任意键 都会触发 可重复触发
- 文本事件 textInput 处理文件输入框的事件,在文本变化前面触发(e.data获取输入的值)
### h5事件
- DOMContentLoaded事件 等待dom树形成之后就会触发,load 事件是等所有资源和dom形成之后触发
- readyStatechange事件 指元素或者文档加载状态 (只要支持他的 都有一个readyState事件,有5个阶段从促使化到加载完成具体看书)
- hashchange 事件window下的事件,只要url#后的参数变化 就会触发
### 事件委托
- 利用事件冒泡,指定一个事件处理程序,管理某一类型的所有事件