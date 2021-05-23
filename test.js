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

console.log(add(1, 2, 3, 4, 5)); //15
console.log(add(1)(2, 3)(4, 5) + ''); //15
console.log(add(1)(2)(3)(4)(5) + ''); //15