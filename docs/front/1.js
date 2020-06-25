let arr =['s','c','xxx']
let obj = {
  'name':'sg',
  "age":'12'
}
for(let [i,k] of Object.entries(obj)){
  console.log(i,k)
}