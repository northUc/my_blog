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