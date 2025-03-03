# TypeScript 装饰器学习

> 随着 TypeScript 和 ES6 中类的引入，现在存在某些需要额外功能来支持注释或修改类和类成员的场景。装饰器提供了一种为类声明和成员添加注释和元编程语法的方法。
>
> 要使用装饰器先到`tsconfig.json`中将`experimentalDecorators`选项和`emitDecoratorMetadata`都置为`true`，后者是使用装饰器时会默认为某些数据定义元数据，反射篇会讲到这个，仅学习装饰器也可以先关掉。可以对比一下打开及禁用这个属性以后`tsc`编译的`js`代码内容的变化。

TS 装饰器官网文档：https://www.typescriptlang.org/docs/handbook/decorators.html#introduction

## 什么是装饰器？

> 引用官方：装饰器是一种特殊的声明，可以附加到[类声明](https://www.typescriptlang.org/docs/handbook/decorators.html#class-decorators)、[方法](https://www.typescriptlang.org/docs/handbook/decorators.html#method-decorators)、[访问器](https://www.typescriptlang.org/docs/handbook/decorators.html#accessor-decorators)、[属性](https://www.typescriptlang.org/docs/handbook/decorators.html#property-decorators)或[参数](https://www.typescriptlang.org/docs/handbook/decorators.html#parameter-decorators)。装饰器使用形式`@expression`，其中`expression`必须计算为一个函数，该函数将在运行时使用有关装饰声明的信息进行调用。

例如，给定装饰器`@Controller`，我们可以编写如下的`Controller`函数：

```ts
const Controller: ClassDecorator = (target) => {
  // do something with 'target' ...
};

@Controller
class UserController {
  constructor() {}
}
```

## 装饰器工厂

> 如果我们想定制如何将装饰器应用于声明，我们可以编写一个装饰器工厂。装饰器工厂只是一个函数，它返回装饰器在运行时调用的表达式

可以这样写：

```ts
const Controller = (value: string): ClassDecorator => {
  console.log(value);
  return (target) => {
    // do something with 'target' ...
  };
};

@Controller("/user")
class UserController {
  constructor() {}
}
```

### 装饰器组成

多个装饰器可以应用到同一个声明，例如在一行中：

```ts
@f @g x
```

也可以是多行

```ts
@f
@g
x
```

当在 TS 的单个声明上评估多个装饰器时，执行一下步骤：

1. 每个装饰器的**表达式**都是从上到下计算的
2. 然后将结果作为函数从下到上调用

如果我们要使用装饰器工厂，可以看下面的例子观察输出顺序：

```ts
const Controller1 = (value: string): ClassDecorator => {
  console.log("CO1 value:", value);
  return (target) => {
    console.log("CO1 target:", target);
  };
};
const Controller2 = (value: string): ClassDecorator => {
  console.log("CO2 value:", value);
  return (target) => {
    console.log("CO2 target:", target);
  };
};

@Controller1("/co1")
@Controller2("/co2")
class UserController {
  constructor() {}
}
```

那么控制台将打印：

```ts
CO1 value: /co1
CO2 value: /co2
CO2 target: [class UserController]
CO1 target: [class UserController]
```

## 各类装饰器

### 类装饰器（ClassDecorator）

字如其意，类装饰器就是在类声明之前声明。可用于观察、修改或替换类定义。类装饰器的表达式将在运行时作为一个函数调用，装饰器的构造函数作为其唯一的参数。

如果类装饰器有返回值，它将用提供的构造函数替换类声明。

在文章开头及装饰器工厂中演示的便是类装饰器：

```ts
const Controller1 = (value: string): ClassDecorator => {
  console.log("CO1 value:", value); // CO1 value: /co1
  return (target) => {
    console.log("CO1 target:", target); // CO1 value: [class UserController]
  };
};
const Controller2 = (value: string): ClassDecorator => {
  console.log("CO2 value:", value); // CO2 value: /co1
  return (target) => {
    console.log("CO2 target:", target); // CO2 value: [class UserController]
  };
};

@Controller1("/co1")
@Controller2("/co2")
class UserController {
  constructor() {}
}
```

我们可以使用`tsc`命令去编译文件中的几行代码，编译后的代码夹杂了下一篇文章要提及的反射`Reflect`，这里我们不介入，我会将代码简化一下并加上注释。

```js
var __decorate = function (decorators, target, key, desc) {
  var c = arguments.length; // 获取传入的参数的数量，这里是c = 2
  var r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc; // 这里r = UserController
  var d;
  for (var i = decorators.length - 1; i >= 0; i--) {
    // 倒序去运行装饰器函数
    if ((d = decorators[i])) {
      // 赋值给d，并且确保不为null和undefined才运行if内部逻辑
      r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      // 如果装饰器函数没有返回值，则r= undefined || r，r还是原来的UserController，否则给r赋值装饰器返回值，需要注意循环哦
    }
  }
  return c > 3 && r && Object.defineProperty(target, key, r), r; // 先执行逗号左边表达式然后返回r
};

const Controller1 = (value) => {
  console.log("CO1 value:", value);
  return (target) => {
    console.log("CO1 target:", target);
  };
};
const Controller2 = (value) => {
  console.log("CO2 value:", value);
  return (target) => {
    console.log("CO2 target:", target);
  };
};

let UserController = class UserController {
  constructor() {}
};
UserController = __decorate([Controller1("/co1"), Controller2("/co2")], UserController);
```

根据编译后的代码可以看出输出的顺序符合在装饰器工厂提到的运行顺序，先从上到下执行`Controller1`和`Controller2`内部的函数体，由于内部`for`循环是倒序遍历的，所以返回的装饰器函数是从下到上执行的。

### 方法装饰器（MethodDecorator）

方法装饰器在类中的方法上声明，装饰器应用于方法的属性描述符，可用于观察、修改或替换方法定义。方法装饰器的表达式将在运行时作为函数调用，具有以下三个参数：1. 类的原型，2. 函数的名称，3. 函数的属性描述符。

如果方法装饰器有返回一个值，它将被用作方法的属性描述符。

下面看看使用方法装饰器后，会打印出什么数据：

```ts
const Get = (value: string): MethodDecorator => {
  console.log(value); // /add
  return (target, propertyKey, descriptor) => {
    console.log("Get target:", target); // UserController.prototype
    console.log("Get propertyKey:", propertyKey); // hello
    console.log("Get descriptor:", descriptor);
  };
};

class UserController {
  constructor() {}

  @Get("/add")
  hello() {
    console.log("UserController hello");
  }
}
```

对第三个参数很陌生可以去 MDN 了解一下`Object.getOwnPropertyDescriptors()`这个 API，不需要将这个知识与装饰器挂钩给自己添加心智负担，分开去学，`descriptor`输出结果

```js
{
  value: [Function: hello], // 与属性关联的值（仅限数据描述符）。
  writable: true, // 当且仅当与属性关联的值可以更改时，为 true（仅限数据描述符）。
  enumerable: false, // 当且仅当此属性在相应对象的属性枚举中出现时，为 true。
  configurable: true // 当且仅当此属性描述符的类型可以更改且该属性可以从相应对象中删除时，为 true。
}
```

可以观察`tsc`编译后，`__decorate`函数的传参：

```js
// 与上方类装饰器代码一致，此处代码省略...

__decorate([Get("/add")], UserController.prototype, "hello", null);
```

### 属性装饰器（PropertyDecorator）

属性装饰器可以声明在类中属性上。属性装饰器的表达式在运行时作为函数调用，具有一下两个参数：

1. 该类的原型
2. 属性名称

比如这样：

```ts
const PrimaryGeneratedColumn = (): PropertyDecorator => {
  return (target, propertyKey) => {
    console.log(target === UserEntity.prototype); // true
    console.log(propertyKey); // id
  };
};

class UserEntity {
  @PrimaryGeneratedColumn()
  id: string;
}
```

可以观察`tsc`编译后，`_decorate`函数的传参：

```js
// 与上方类装饰器代码一致，此处代码省略...

__decorate([PrimaryGeneratedColumn()], UserEntity.prototype, "id", void 0);
```



### 参数装饰器

参数装饰器声明在类的方法中接收的参数之前，参数装饰器的表达式将在运行时作为函数调用，具有一下三个参数：

1. 类的原型
2. 方法的名称
3. 该参数在这个方法的第几个位置(index)

一个参数装饰器如果有返回值则被忽略，没有任何作用

下面看看参数装饰器调用后，将会打印的信息：

```ts
const Param = (): ParameterDecorator => {
  return (target, fnName, parameterIndex) => {
    console.log(target === UserController.prototype); // true
    console.log(fnName); // findUserById
    console.log(parameterIndex); // 0
  };
};

class UserController {
  constructor() {}

  findUserById(@Param() id: string) {
    return id;
  }
}
```

可以观察`tsc`编译后，`_decorate`函数的传参：

```js
// 与上方类装饰器代码一致，此处代码省略...

var __param = function (paramIndex, decorator) {
    return function (target, key) { // 返回了一个装饰器，并且这个装饰器没有返回值
      decorator(target, key, paramIndex);
    };
};

__decorate([__param(0, Param())], UserController.prototype, "findUserById", null);
```



## 结尾

要想让装饰器发挥其最大的作用，还需要学习 Metadata 元数据相关知识，在下一篇章中我会举详细的例子去体会使用装饰器的便捷之处。

