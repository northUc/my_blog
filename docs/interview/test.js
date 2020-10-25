let p = new Promise((resolve,reject)=>{
  setTimeout(()=>{
    reject('222')
  },1000)
  console.log('start')
  // resolve('111')
})

let p1 =  p.then((data)=>{
  console.log('success',data)
  throw '123'
  // return '11as'
},(data)=>{
  console.log('err',data)
})
.then()
.then((data)=>{
  console.log('==>',data)
},(err)=>{
  console.log(err)
})