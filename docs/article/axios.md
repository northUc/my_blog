# axios
[[toc]]
## 请求的核心原理,依靠`XMLHttpRequest`
```js
 dispatchRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return new Promise<AxiosResponse<T>>(function (resolve, reject) {
            let { method, url, params, headers, data, timeout } = config;
            let request = new XMLHttpRequest();
            if (params) {
                params = qs.stringify(params);
                url += ((url!.indexOf('?') == -1 ? '?' : '&') + params);
            }
            request.open(method!, url!, true);
            request.responseType = 'json';
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status != 0) {
                    if (request.status >= 200 && request.status < 300) {
                        let response: AxiosResponse<T> = {
                            data: request.response ? request.response : request.responseText,
                            status: request.status,
                            statusText: request.statusText,
                            //content-type=xx; content-length=42=>content-type:xx,content-length:42}
                            headers: parseHeaders(request.getAllResponseHeaders()),
                            config,
                            request
                        }
                        if (config.transformResponse) {
                            response = config.transformResponse(response);
                        }
                        resolve(response);
                    } else {
                        reject(`Error: Request failed with status code ${request.status}`);
                    }
                }
            }
            if (headers) {
                for (let key in headers) {
                    if (key === 'common' || allMethods.includes(key)) {
                        if (key === 'common' || key === config.method) {
                            for (let key2 in headers[key])
                                request.setRequestHeader(key2, headers[key][key2]);
                        }
                    } else {
                        request.setRequestHeader(key, headers[key]);
                    }
                }
            }
            let body: string | null = null;
            if (data) {
                body = JSON.stringify(data);
            }
            // 网络异常处理
            request.onerror = function(){
              reject('net::ERR_INTERNET_DISCONNECTED')
            }
            if(timeout){
            // 设置超时
              request.timeout = timeout
              request.ontimeout = function() {
                reject(`Error: timeout of ${timeout}ms exceeded`)
              }
            }
            if (config.cancelToken) {
                config.cancelToken.then((message: string) => {
                    request.abort();
                    reject(message);
                });
            }
            request.send(body);
        });
    }
```
## 错误处理
- request 是`new XMLHttpRequest`实例
### 网络异常
- 可以监控他的onerror事件,`request.onerror()=>{.....}`
```js
  request.onerror = () => { //网络异常
    reject(new Error('Network Error'));
  }
```
### 超时异常
- 分两步，第一步设置request.timeout为当前的timeout
- 第二步 监控ontimeout,`request.ontimeout=()=>{}`
```js
if(timeout){
  // 设置超时
  request.timeout = timeout
  request.ontimeout = function() {
    reject(`Error: timeout of ${timeout}ms exceeded`)
  }
}
```

### 错误状态码
- 当状态码 不在200-300之间 就返回报错
```js
if(request.readyState === 4 && request.status !== 0){
  if(request.status>= 200 && request.status<300){
    let response:AxiosResponse<T> = {
      data:request.response?request.response:request.responseText,
      status:request.status,
      statusText:request.statusText,
      // content-type=xx; context-length=42
      // parseHeaders转换成对象 {content-type:xx,context-length:42}
      headers:parseHeaders(request.getAllResponseHeaders()),
      config,
      request
    }
    resolve(response)
  }else{
    reject(`Error: Request failed with status code ${request.status}`)
  }
}
```
## 拦截器
- 主要是对request和response做拦截,他们3这件的顺序,有一个数组来维护[request,send,response]依次执行。
- request.use添加是数组unshift方法,先添加后执行。
- response.use添加的是数组push,先添加先执行
- 用法
```js
// import axios,{AxiosResponse,AxiosRequestConfig} from 'axios'
import axios from './axios'
import {AxiosResponse, AxiosRequestConfig} from './axios/types'
const baseUrl = 'http://localhost:8080';

// 它指的是服务器返回的对象;
interface User{
  name:string,
  password:string
}

let user:User = {
  name:'xx',
  password:'123456'
}


console.time('cost')
// 请求拦截器先加的后执行
axios.interceptors.request.use((config:AxiosRequestConfig):AxiosRequestConfig=>{
console.timeEnd('cost')
config.headers.name += '1';
  return config
},(error:any):any => Promise.reject(error))
let request = axios.interceptors.request.use((config:AxiosRequestConfig):AxiosRequestConfig=>{
  config.headers.name += '2';
  return config
})
axios.interceptors.request.use((config:AxiosRequestConfig):AxiosRequestConfig|Promise<AxiosRequestConfig>=>{
  return new Promise(function (resolve){
    setTimeout(()=>{
      config.headers.name += '3'
      resolve(config)
    },3000)
  })
})
// 弹出哪一个
axios.interceptors.request.eject(request)


// 响应拦截器
axios.interceptors.response.use((response: AxiosResponse) => {
  response.data.name += 1
  return response 
})

let response = axios.interceptors.response.use((response: AxiosResponse) => {
  response.data.name += 2
  return response 
})

axios.interceptors.response.use((response: AxiosResponse) => {
  response.data.name += 3
  return response 
})
// 弹出哪一个
axios.interceptors.response.eject(response)

axios({
  method:'post',//方法名
  url:baseUrl + '/post',// 访问路径
  // params:user, // 查询参数对象,它会换成查询字符串在?的后面
  headers:{
    'content-type':'application/json',
    'name':'sg'
  },
  data:user
}).then((response:AxiosResponse<User>) => {
  console.log('response',response.data)//{name:sg123}
  return response.data
}).catch((err:any) => {
  console.log(err)
})
```
```js
this.interceptors.request.interceptors.forEach((interceptor: Interceptor<AxiosRequestConfig> | null) => {
    interceptor && chain.unshift(interceptor);
})

this.interceptors.response.interceptors.forEach((interceptor: Interceptor<AxiosResponse<T>> | null) => {
    interceptor && chain.push(interceptor)
})
let promise= Promise.resolve(config);
    while (chain.length) {
        const { onFulfilled, onRejected } = chain.shift()!;
        promise = promise.then(onFulfilled, onRejected);
    }
    return promise;
}
```
## 任务取消
```js
import { AxiosResponse, AxiosRequestConfig } from './axios';
interface User {
    username: string;
    password: string;
}
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
axios({
    method: 'post',
    baseURL: 'http://localhost:8080',
    url: '/post_timeout?timeout=2000',
    timeout: 3000,
    cancelToken: source.token
}).then((response: AxiosRequestConfig | AxiosResponse<User>) => {
    console.log(response);
    return response.data as User;
}).then((data: User) => {
    console.log(data);
}).catch(function (error: any) {
    if (axios.isCancel(error)) {
        console.log('请求取消', error);
    } else {
        console.log('error', error);
    }
});
source.cancel('用户取消请求');
```