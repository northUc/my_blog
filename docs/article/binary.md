# 二进制

## 十进制转二进制
- 整数部分:除2取余,直到商为0,最先得到的余数是最低位,最后的余数是高位
- 小数部分:乘2取整,直到积为0或者精确度要求为止,最先得到的整数是高位
- (3.5)10 = (11.1)2 
- 原码:二进制数,3个bit能表示8个数 +0+1+2+3-0-1-2-3,4正4负(最高位1即为负数,0为正数)
- 反码:正数不变,负数的除符号外其他位数取反
- 补码:正数不变,负数在反码的基础上加1(最高位要舍掉)
- 计算机 只有补码 一种,正数+他负数的补码=0,计算机中通过补码进行计算
<img :src="$withBase('/img/file.jpg')" >

## ArrayBuffer
- 8位 == 1个字节,ArrayBuffer字节数组(每个都是8位),他里面存放的就是字节
```js
// 8个字节*8个位 = 64位
let buffer = new ArrayBuffer(8)
```
## TypedArray 类型数据
```js
let buffer = new ArrayBuffer(8);// 8个字节的ArrayBuffer
const int8Array = new Int8Array(buffer)// 1个整数占据8个位 
console.log(int8Array.length)//  元素的长度8,1个字节占据8个位

console.log(int8Array.buffer === buffer)// true

const int16Array = new Int16Array(buffer)// 1个整数占据16个位 
console.log(int16Array.length)// 元素的长度4,1个字节占据16个位
```
## DataView 对象
- DataView 视图是一个可以从二进制ArrayBuffer对象中读写多种数值类型的底层接口
- setInt8()从DataView起始位置以byte为计数的指定偏移量(byteOffset)处储存一个8-bit数(一个字节)
- getInt8()从DataView起始位置以byte为计数的指定偏移量(byteOffset)处获取一个8-bit数(一个字节)
- DataView和TypeArray 内部都引用了buffer,buffer不能直接用
<img :src="$withBase('/img/DataView.jpg')" >

```js
const buffer = new ArrayBuffer(8);
// 创建一个8字节的 arrayBuffer
console.log(buffer.byteLength);//8个字节
const view1 = new DataView(buffer);
// 第一个 整数为8个字节 值为1
view1.setInt8(0, 1); // 0 是开始位子 存入1
console.log(view1.getInt8(0));//1
// 第二个 整数为8个字节 值为1
view1.setInt8(1, 2); // 1 是开始位子 跳过8个字节 存入2
// 读取第二个字节的时候  二进制位 0000 0010 为2
console.log(view1.getInt8(1));//2

// 读取 16位的时候 把图上面的2个二进制拼接上去  得到的是258
console.log(view1.getInt16(0));//258

console.log(view1.buffer === buffer)
```
## 字符&&base64
- window.btoa && window.atob
- 将字符串转成base64 
```js
let rs =  btoa('xxx')
// rs 是一个base64字符串

let s = atob(rs)
// atob 把base64转成字符串 s==='xxx'
```
