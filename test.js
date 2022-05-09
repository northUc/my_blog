// function fn(arr) {
//     for (let i = 0; i < arr.length; i++) {
//         for (let j = 0; j < arr.length; j++) {
//             if (arr[i] > arr[j]) {
//                 [arr[i], arr[j]] = [arr[j], arr[i]]
//             }
//         }
//     }
//     return arr
// }
// console.log(fn([2, 44, 22, 11, 5, 7, 1,s 3]))

// function fn(arr) {
//     if (arr.length < 2) return arr
//     let arrLength = arr.length
//     let rightData = []
//     let leftData = []
//     let mddileIndex = arr.splice(0, 1)[0]
//     for (let j = 0; j < arr.length; j++) {
//         if (arr[j] > mddileIndex) {
//             rightData.push(arr[j])
//         } else {
//             leftData.push(arr[j])
//         }
//     }
//     return fn(leftData).concat([mddileIndex], fn(rightData))
// }
// console.log(fn([2, 44, 22, 11, 5, 7, 1, 3]))

// function fn(arr) {
//     let len = arr.length
//     for (let i = 0; i < arr.length; i++) {
//         let index = i;
//         for (let j = i + 1; j < arr.length; j++) {
//             if (arr[index] > arr[j]) {
//                 index = j
//             }
//         }
//         [arr[i], arr[index]] = [arr[index], arr[i]]
//     }
//     return arr
// }
// console.log(fn([2, 44, 22, 11, 5, 7, 1, 3]))

// function add(...r) {
//     let arr = [...r];
//     let _add = function(...f) {
//         arr.push(r)
//         return _add
//     }
//     _add.toString = () => arr.reduce((a, b) => a + b);
//     return _add
// }

/*

遍历对象

for in 遍历对象的key 包括原型链 没有symbol

Object.key() 返回对象的自身的key  没有symbol  没有原型链 可枚举

object.getOwnpropertNames  返回对象的自身的key  没有symbol  没有原型链

object.getOwnpropertSymbol  返回对象的自身的key  symbol  没有原型链 

Reflect.ownKey  返回自身的 所有key



*/

let r1 = ()=> new Promise((resolve,reject)=>{
    setTimeout(() => {
        resolve('r1')
    }, 1000);
})

let r2 = ()=>new Promise((resolve,reject)=>{
    setTimeout(() => {
        reject(Promise.resolve('r2'))
    }, 1000);
})

r1().finally(()=>{
    console.log('123')
})

// const a = async()=> {
//     try {
//         let a1 = await r1()
//         console.log(a1)
//         let a2 = await r2()
//         console.log(a2)
//     } catch (error) {
//         console.log('error', error)        
//     }
// }
// a()