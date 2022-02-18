# c
- .h 是头文件 代表类型
- .cpp 是执行文件
- A::fn()  :: 代表属于 

- cout >> 'xxx \n'; 输出
- cin >> a; 输入的值用a接受
- ' \n' 是换行
- `<<endl; 也是换行`
```yaml
// 预处理命令
#include <iostream>
// 命名空间 
using  namespace std;
// int 对外界返回一个整数
int main() {
    int a;
    cout << '123';
    cin >> a;
    cout << a;
    return 0;
}
// 联合输入
cin >> a >> b ;
cout << "a=" << a << "b=" << b;
```
## 处理精度问题
- cout << 0.123456678;
- setprecision(6) 函数包括整数(会四舍五入)  6代表位数
- setiosflags(ios::fixed)
```yaml
#include <iostream>
#include <iomanip>
using namespace std;
int main(){
    int a;
    int b;
    cout << 0.12345678 << endl;
    // 0.123457
    cout << setprecision(8) << 0.123456678 << endl;
    // 0.12345668
    return 0;
}
```
## 命名空间 std
- using  namespace std; 命名空间 能识别 cout cin endl;
- 或者用::(属于)
```yaml
#include <iostream>
using namespace std;
int main(){
    int a;
    int b;
    cout << 0.12345678 << endl;
    return 0;
}

或者
#include <iostream>
int main(){
    int a;
    int b;
    std::cout << 0.12345678 << std::endl;
    return 0;
}
```

## 设置宽度
- setw(10) 需要 每次都设置
- `cout<<setiosflags(ios::left);` 靠左对其
- `cout<<resetiosflags(ios::left);` 取消掉
```yaml
#include <iostream>
using namespace std;
int main(){
    int a;
    int b;
    cout << setw(10) << 12345678 << endl;
    return 0;
}
```

## 设置进制
- setbase 需要`<iomanip>`声明
```yaml
#include <iostream>
#include <iomanip>

using namespace std;
int main(){
    int a;
    int b;
    cout<<setbase(8)<<4<<" "<<333 << endl;
    return 0;
}
// 另一种方式
// oct 8进制,  hex 16进制,  dec 10进制;
#include <iostream>
using namespace std;
int main(){
    int a;
    int b;
    // 8进制
    cout<<oct<<4<<" "<<333 << endl;
    // 16进制
    cout<<hex<<4<<" "<<333 << endl;
    // 10进制
    cout<<dec<<4<<" "<<333 << endl;
    return 0;
}
```

## 数据类型
- unsigned 无符号, 下面都是小写不能大写

- 短整型(两字节)
-  short
-  unsigned short 

- 整型(四字节)
-  int
-  unsigned int

- 单精度浮点型(四字节)
-  float

- 双精度浮点型(八字节)
- double

- 字符串
- char
- unsigned char

- 布尔型
- bool   true/false  0/1

- 枚举 enum
- enum level{a,b,c,d}
```yaml

using namespace std;
enum  level{a,b,c,d,e,f};
int main(){
    level my1,my2,my3,my4,my5,my6;
    my1 = a;
    my2 = b;
    my3 = c;
    my4 = d;
    my5 = e;
    my6 = f;
    cout << my1 << my2<< my3<< my4<< my5<< my6;
    // 012345
    return 0;
}
```

## string 也需要使用 std
```yaml
#include <iostream>
#include <string>
using namespace std;
enum  level{a,b,c,d,e,f};
int main(){
    string a="1312321ssdsd大大";
    cout << a << endl;
    // 可以访问单个字符
    cout << a[0] << endl;
    return 0;
}
```

## `# include<time.h>` 处理随机数
- srand(time(0)); 随机数的种子
- 如果没有这个 随机数都是一样的
- srand 
```yaml

#include <iostream>
#include <string>
using namespace std;
enum  level{a,b,c,d,e,f};
int main(){
    srand(time(0));
    int b[6] = {2,3,4,5,6,7};
    cout << b[1] << '=' << rand() << endl;
    cout << b[2] << '=' << rand() << endl;
    cout << b[5] << '=' << rand() << endl;
    return 0;
}
```

## 数组
- 一维
- `int arr[3] = {1,2,3} `
- 二维
- `int arr[2][2] = {1,2,3,4}; ` 他也是个线性的

## 字符串 
- char
```yaml
#include <iostream>
#include <string>
using namespace std;
enum  level{a,b,c,d,e,f};
int main(){
    //  '\0' 代表char的结束(没有会 乱码) 没有好像也可以
    char str[5] = {'a','b','c','d','\0'};
    cout << str << endl;

    // 这里得到 str 后面只能写 5-1 个字符  因为末尾默认添加了一个\0
    char str[5] = "abcd";
    cout << str << endl;

    // 将后一个字符连接到给前一个后面
    char str1[11] = “12345“;
    char str2[6] = “67890”;
    strcat(str1,str2)
    cout << str << endl;// '1234567890'
    // 将后一个复制给前一个字符
    strcpy(str1,str2)
    cout << str << endl;// '67890'
    // strlen 长度
    int r = strlen(str1);
    cout << r << endl;// '5'
    return 0;
}
```

## 指针 - 字符串
- &代表取地址  指针实际保存的是一个地址
```yaml
#include <iostream>
#include <string>
using namespace std;
enum  level{a,b,c,d,e,f};
int main(){
    int a=1,b=2;
    int *p1,*p2;
    // p1 指针 &代表取地址  指针实际保存的是一个地址
    p1 = &a;
    // 指针的前面加* 表示该地址保存的数值
    cout << *p1 << endl;
    // char 声明的字符串就是一个指针
    return 0;
}
```

## 指针 - 数组
- new  让指针指向新的内存地址
- delete 删除 指针指向的地址
```yaml
int arr[5]
int *p = &arr[0]
// 地址+1 就是p所在的地址 往后推一个数据长度
p+ = 1


#include <iostream>
#include <string>
using namespace std;
enum  level{a,b,c,d,e,f};
int main(){
    int arr[5];
    srand(time(0));
    int i;
    for(i=0;i<5;i++) arr[i] = rand()%50+1;
    cout << "用下标对数组进行遍历: \n";
    for(i=0;i<5;i++) cout << arr[i]<<'\t';
    cout<<endl;
    cout<<"用指针对数组进行遍历: \n";
    int*p = &arr[0];
    for(i=0;i<5;i++)
    {
        cout<<*p<<'\t';
        p++;
    }
    cout<<endl;
    delete []arr;
    return 0;
}
```

- 申请动态一维数组
```yaml
#include <iostream>
#include <string>
using namespace std;
enum  level{a,b,c,d,e,f};
int main(){
    int len;
    cout<< "请输入数组长度："<<endl;
    cin>>len;
    // 动态声明
    int *arr = new int(len);
    for(int i=0; i<len;i++){
        arr[i] = i+1;
    };
    return 0;
}
```
- 申请动态二维数组
- int **arr = new *p


## 函数
```yaml

#include <iostream>
#include <string>
using namespace std;

int  sum(int n,int m){
    return  n+m;
}

int main(){
    int n,m;
    cout<< "请输入数值："<<endl;
    cin>>n;
    cin>>m;
    int num;
    num = sum(n,m);
    cout<< num <<endl;
    return 0;
}
```
### 素数
```yaml

#include <iostream>
#include <string>
using namespace std;
bool isPrime(unsigned int n){
    if(n==0||n==1)return false;
    for(int i=2;i<n;i++){
        if(n%i==0)return false;
    }
    return true;
}

int main(){
    int n;
    cout<< "请输入数值："<<endl;
    cin>>n;
    bool r = isPrime(n);
    if(r) cout<<"是素数:"<<endl;
    if(!r) cout<<"不是素数"<<endl;
    return 0;
}
```