# Javascript_ES6 新特性学习

## let 与 const 的用法

1. let 和 var 的区别

   > var 定义的变量没有块级作用域的概念
   >
   > let 定义的变量有块级作用域

   ```javascript
   if (true) {
     let a = 10;
   }
   console.log(a);
   //这时候是可以输出a的，如果换成let，是会报错的，因为受块级作用域的影响，a变成了局部变量
   ```

2. let 和 var 哪个好？

   > let 好，所以放弃使用 var。

3. const 的使用

   > 定义的变量不能被修改，但是如果定义的是对象，那么里面的属性值可以修改，只是不能修改整个对象，同样的还要数组也是一样，然后 const 也是有块级作用域的

   ```javascript
   const PI = 3.1415926; //定义不修改的常量
   const obj = {
   	name:"小明",
   	age:16
   }
   //obj = {name:"小红"}  //会报错
   const.name = "小红"
   console.log(obj) //结果name为小红，属性值被修改
   ```

## 结构赋值

1. 数组的结构赋值

   ```javascript
   let [a, b] = [10, 20]; //实现了赋值，a=10，b=20
   ```

   > 用法：比如实现一个交换，让 a=20，b=10，传统方法会有一个临时变量 temp 进行保存其中一个值，然后进行交换，但如果用结构赋值会简单很多

   ```javascript
   let [a, b] = [10, 20];
   [a, b] = [b, a];
   console.log(a, b); //输出结果：20 10
   ```

2. 对象的结构赋值（常用）

   ```javascript
   let { name, age } = {
     name: "小明",
     age: 16,
     friend: "小红",
   };
   console.log(name); //小明
   console.log(age); //16
   ```

   ```javascript
   function createStudent() {
     let name = "小明";
     let age = 16;
     let friend = "小红";
     return {
       name: name,
       age: age,
       friend: friend,
     };
   }
   //let obj = createStudent();
   //console.log(obj.name) //Es5写法，拿到'name'

   let { name } = createStudent();
   console.log(name); //Es6写法，代码简洁明了
   ```

## 箭头函数的用法

- ()中定义参数，如果只有一个参数，可以不写括号
- {}中写函数体，如果函数体中只有返回值，可以不写 return

```javascript
//const fun1 = x => x; //只有一个参数
//const fun = function(){
//	return 100;
//}

const fun = () => 100;
console.log(fun());
//两者的作用是一样的
```

箭头函数和普通函数的区别：

> this 指向不同
> 普通函数，谁调用这个函数，this 就指向谁
> 箭头函数，在哪里定义函数，this 就指向谁

```javascript
let obj = {
  name: "小明",
  age: 16,
  //  sayName(){
  //		console.log(this.name)//这里this可以输出小明，下面就不能了
  //		setTimeout(function(){
  //			console.log('我是${this.name}')//这个this指向window
  //Es6模板字符串，跟"我是"+this.name相同
  //		},500)
  //	}
  sayName() {
    setTimeout(() => {
      console.log(this.name); //this指向obj，可以输出name
    }, 500);
  },
};
```

## rest 参数

> ES6 引入 rest 参数，用于获取函数的实参，用来代替 arguements

```javascript
//ES5获取实参的方式
function data() {
  console.log(arguments); //这里输出{0:零,1:一,2:二}这个'对象'
}
data("零", "一", "二");
//rest参数
function data(...args) {
  console.log(args); //这里则输出的是数组
}
data("零", "一", "二");

//rest参数必须要放到最后
function fn(a, b, ...args) {
  //如果放前边会报错
  console.log(a); //1
  console.log(b); //2
  console.log(args); //[3,4,5,6]
}
fn(1, 2, 3, 4, 5, 6);
```

## 拓展运算符

1. 介绍

   > '...' 拓展运算符能将 '数组' 转化为逗号分隔的参数序列

2. 作用

   - 数组的合并

     ```javascript
     const one = ["一", "二"];
     const two = ["三", "四"];
     const h = [...one, ...two]; //输出['一','二','三','四']
     ```

   - 数组的克隆

     ```javascript
     const one = ["一", "二", "三"];
     const two = [...one];
     console.log(two);
     //这只是个浅拷贝
     ```

   - 将伪数组转换为真正的数组

     ```javascript
     //比如html有3个div标签
     const divs = document.querySelectorAll("div");
     const divArr = [...divs];
     console.log(divArr);
     //不过有rest参数的存在，没有必要把它作转换
     ```

## 迭代器

> 迭代器(iterator)是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要部署 iterator 接口，就可以完成遍历操作。
>
> 1）ES6 创造了一种新的遍历命令 for...of 循环，iterator 主要供 for...of 消费
>
> 2）原生具备 iterator 接口的数据（可用 for...of 遍历）
>
> 1. Array
> 2. Arguments
> 3. Set
> 4. Map
> 5. String
> 6. TypeArray
> 7. NodeList
>
> 3）工作原理
>
> 1. 创建一个指针对象，指向当前数据结构的起始位置
> 2. 第一次调用对象的 next 方法，指针自动指向数据结构的第一个成员
> 3. 接下来不断调用 next 方法，指针一直往后移动，直到指向最后一个成员

```javascript
const xiyou = ["唐僧", "孙悟空", "猪八戒", "沙僧"];
console.log(xiyou); //往下翻，里面会有一个Symbol.iterator方法
let iterator = xiyou[Symbol.iterator]();
//调用对象的next方法
console.log(iterator.next());
//{value:'唐僧',done:false}
console.log(iterator.next());
//{value:'孙悟空',done:false}
console.log(iterator.next());
//{value:'猪八戒',done:false}
console.log(iterator.next());
//{value:'沙僧',done:false}
console.log(iterator.next());
//{value:undefined,done:true}
```

应用-自定义遍历数据(迭代器原理)

```javascript
//声明一个对象
const banji = {
  name: "终极一班",
  stus: ["xiaoming", "xiaoning", "xiaotian", "knight"],
  [Symbol.iterator]() {
    //索引变量
    let index = 0;
    _this = this; //也可以用箭头函数
    return {
      next: function () {
        if (index < _this.stus.length) {
          const result = { value: _this.stus[index], done: false };
          //下标自增
          index++;
          return result;
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  },
};
//banji.stus.forEach()可以得到，但是不符合面向对象的思想
for (let v of banji) {
  console.log(v);
}
```

## 生成器

1. 函数声明与调用

   ```javascript
   //生成器其实就是一个特殊的函数
   //异步编程 纯回调函数 node fs ajax mongodb
   function* gen() {
     console.log("hello generator");
   }
   let iterator = gen();
   iterator.next(); //这样才能console.log上面的内容
   ```

   - 函数代码分隔符 yield

     ```javascript
     function* gen() {
       console.log(111);
       yield "一只没有耳朵";
       console.log(222);
       yield "一只没有尾巴";
       console.log(333);
       yield "真奇怪";
       console.log(444);
     }
     let iterator = gen();
     iterator.next(); //111
     iterator.next(); //222
     iterator.next(); //333
     iterator.next(); //444

     for (let v of gen()) {
       console.log(v);
     }
     ```

2. 生成器函数的参数传递

   ```javascript
   function* gen(arg) {
     console, log(arg); //AAA
     let one = yield 111;
     console.log(one); //BBB
     let two = yield 222;
     console.log(one); //CCC
     let three = yield 333;
     console.log(one); //DDD
   }
   //执行获取迭代器对象
   let iterator = gen("AAA");
   console.log(iterator.next());
   //next方法可以传入实参
   console.log(iterator.next("BBB"));
   作为第1个yield的整体返回值;
   console.log(iterator.next("CCC"));
   作为第2个yield的整体返回值;
   console.log(iterator.next("DDD"));
   作为第3个yield的整体返回值;
   ```

3. 生成器实例

   ```javascript
   //异步编程
   //1s后控制台输出111 2s后输出222
   function one() {
     setTimeout(() => {
       console.log(111);
       iterator.next(); //接着向下遍历实现实例
     }, 1000);
   }
   function two() {
     setTimeout(() => {
       console.log(111);
     }, 2000);
   }
   function* gen() {
     yield one();
     yield two();
   }
   //调用生成器函数
   let iterator = gen();
   iterator.next();
   ```

   ## 第七种数据类型，Symbol()

4. 基础语法

   > js 的数据类型：数值，字符串，布尔，对象，null，undefined，Symbol
   > symbol 可以当做对象的属性名，对象：key value 对

   ```javascript
   //const level1 = Symbol("level");
   //const level2 = Symbol("level");
   //console.log(level1 === level2) //false，下面可以简写
   const student = {
     name: "小明",
     age: 16,
     //	[level]:"优秀" //es6新特性：变量当key要加[]
     [Symbol("level")]: "优秀",
     [Symbol("level")]: "有钱",
   };
   ```

   - symbol 属性不能被 for...in 获取

   - 以及 Object.keys()，Object.getOwnPropertyNames()

   ```javascript
   for (let pro in student) {
     console.log(pro); //只输出两个key：name和age
   }
   //下面俩都是输出[name,age]这个数组
   console.log(Objcet.keys(student));

   let pros = Object.getOwnPropertyNames(student);
   console.log(pros);
   ```

5. 如何拿到 Symbol 的值

   - 通过 Object.getOwnPropertySymbols()拿到 Symbol 属性名
   - 再通过 for...of 得到每个属性名

   ```javascript
   let symList = Object.getOwnPropertySymbols(student);
   //symList:[Symbol("level"),Symbol("level")]
   for (let i of symList) {
     console.log(student[pro]); //优秀，有点
   }
   ```

6. 内置值

   - Symbol.iterator：对象被 for...of 循环时，会调用 Symbol.iterator 方法，返回该对象的默认遍历器

   ```javascript
   const list = [1, 2, 3, 4, 5, 6];
   console.log(student[Symbol.iterator]); //undefined
   console.log(list[Symbol.iterator]); //f values(){[native code]}
   //如果对象有Symbol.iterator这个属性
   //这个对象就可以被for...of遍历

   for (let item of student) {
     console.log(item); //报错，student is not a iterator
   }
   for (let item of list) {
     console.log(item); //1,2,3,4,5,6
   }
   ```

## 回调地狱与 Promise

### 回调地狱

```javascript
//获取奶茶,火锅的方法
function getTea(fn) {
  setTimeout(() => {
    fn("奶茶");
  }, 1000);
}
function getHotpot(fn) {
  setTimeout(() => {
    fn("火锅");
  }, 2000);
}
//调用获取奶茶的方法，回调函数获取数据值
//getTea(function(data){
//	  console.log(data);
//})
//要求：先吃火锅，然后喝奶茶(顺序)
getHotpot(function (data) {
  console.log(data);
  getTea(function (data) {
    console.log(data);
  });
});
//实现第2秒吃火锅，再过1秒喝奶茶
//需要层层嵌套，以后数据多了，维护性很差，这叫回调地狱
```

### Promise

1. Promise 是一个构造函数
   - 我们可以创建 Promise 的实例 const p = new Promise()
   - new 出来的 Promise 实例对象，代表一个异步操作
2. Promise.prototype 上包含一个.then()方法
   - 每一次 new Promise()构造函数得到的实例对象
   - 都可以通过原型链的方式访问到.then()方法，例如 p.then()
3. .then()方法用来预先指定成功和失败的回调函数
   - p.then(成功的回调函数, 失败的回调函数)
   - p.then(result =>{ }, error =>{ })
   - 调用.then()方法时，成功的回调函数是必选的，失败的回调函数是可选的

#### Promise 的状态

> 实例对象中的一个属性 [PromiseState]
>
> - pending 未决定的
> - resolved / fullfilled 成功
> - rejected 失败

#### Promise 对象的值

> 实例对象中的另一个属性[PromiseResult]，保存着对象【成功/失败】的结果
>
> - resolve
> - reject

```javascript
//resolve可以把异步数据传递出来
let p = new Promise(function (resolve) {
  resolve("hello world");
});
//通过then拿到异步数据
p.then(function (data) {
  console.log(data); //hello world
});
```

那么就可以改造刚刚的函数了

```javascript
//获取奶茶,火锅的方法
function getTea() {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve("奶茶");
    }, 1000);
  });
}
function getHotpot() {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve("火锅");
    }, 2000);
  });
}
//先吃火锅，再喝奶茶
getHotpot()
  .then(function (data) {
    console.log(data);
    return getTea(); //再return一个Promise对象
  })
  .then(function (data) {
    console.log(data);
  });
```

async 函数(ES8)

> 虽然 promise 解决了回调地狱的通点，好了很多，但还是不友好，那么用 async 函数就可以更好的解决啦

```javascript
async function getData() {
  //直接获取resolve传递出来的异步数据
  let hotPot = await getHotpot();
  console.log(hotPot);
  let tea = await getTea();
  console.log(tea);
  //这两个函数还是刚刚改造好的，返回的是Promise对象
  //这样看起来就跟同步代码一样，更清爽了
}
```
