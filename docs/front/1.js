/**
 * js控制ajax并发请求: 当一个请求结束以后自动添加新的请求到队列中
 * @param {*} urls 
 * @param {*} maxNum 
 */
 function multiRequest(urls = [], maxNum) {
    const len = urls.length
    const result = []
    const count = 0
    return new Promise((resolve, reject) => {
        // 一次性发送maxNum
        while(count <= maxNum) {
            next()
        }
        // next函数保证具体发送请求，最后一个请求resolve结果
        function next() {
            const current = count++
            // 控制最后完成继续next以后就进行resolve
            if (current >= len) {
                !result.includes(false) && resolve(result)
            }
            const url = urls[current]
            fetch(url)
            .then((res) => {
                result.push(res)
                if (current < len) {
                    next()
                }
            })
            .catch((err) => {
                result.push(err)
                if (current < len) {
                    next()
                }
            })
        }
    })
}