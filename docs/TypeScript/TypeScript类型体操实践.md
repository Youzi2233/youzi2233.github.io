# TypeScript 类型体操实践

各位大佬好，本次分享我会给大家讲讲我平时在开发项目中使用到的那些 Ts 类型体操的一些点，以及谈谈自己对于这部分知识的理解，文中多数观点均属个人理解，如有错误还请各位大佬纠错指正，一起共勉。

文章所涉及到的例子均来自工作项目中的使用，以便大家对于学习 TS 类型体操理解到底有什么用，以及什么时候去用。

## 为什么要使用 TS 类型体操

> 结论：为了使封装的公共方法类型更**具体**，更透彻的去利用 Ts 检查机制帮助我们在编码阶段就能看到某些错误并更正。

举一个简单的例子：

比如这里有一个简单的处理对象的函数，要求是将对象键的值不为`number`类型的给剔除出去，先看看不使用到泛型的实现：

```ts
function handleToNumberObj(obj: Record<string, any>) {
  const newObj: Record<string, number> = {};
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "number") {
      newObj[key] = val;
    }
  }
  return newObj;
}

const sourceObj = {
  a: 1,
  b: "2",
  c: false,
};

const resultObj = handleToNumberObj(sourceObj);
console.log(resultObj); // { a: 1 }
```

注意：如果不使用泛型，只是简单给函数参数以及返回值显式的声明成 Record<string, number>，那后续调用 resultObj 就不会有更具体的类型提示跟类型检查了，这里理想的类型其实应该是`{a: number}`这样更具体的一个类型。

接下来，我们利用泛型去写一下这个函数的**声明**

```ts
function handleToNumberObj<T extends object>(obj: T): Pick<T, SelectKeys<T, number>>;
```

这里`SelectKeys<T, number>`意思是查找类型 T 中值为 number 的 key 的联合类型，实现：

```ts
type SelectKeys<O, E> = {
  [P in keyof O]: O[P] extends E ? P : never;
}[keyof O];
```

思路很简单，就是通过表达式中`in`、`keyof`、`extends`几个关键字的运用得到新的对象类型，这里对象的 key 我们需要借助`in`关键字**迭代**对象类型 O 的 key 的联合类型，而值如果满足 extends 三目表达式的保留，不满足的用`never`（这个在类型体操中很有用），最后取索引`[keyof O]`拿到**该对象类型的所有 value**的联合类型，类似`Object.values(obj)`。

> 为什么要用到`never`，因为它本身就表示**“什么都没有”**，所以它跟`number`联合也还是`number`。
>
> ![image-20240609225929337](/ts-img\image-20240609225929337.png)

最后以这个对象为例，测试一下目标结果是否符合预期

```ts
const sourceObj = {
  a: 1,
  b: "2",
  c: false,
};
type FromType = typeof sourceObj;
type TargetType = Pick<FromType, SelectKeys<FromType, number>>;
```

![FromHandleNumberObj](/ts-img\FromHandleNumberObj.png)

## 不同传参对应不同的返回值

> 比如后端定义了一个查询设备在**云端**的配置信息的接口，传不同的设备类型的 index：1，2，3 得到的返回值也就不同，因此我们需要根据请求值的类型决定返回值的类型。有人会问后端为什么不分成多个接口而这样设计，其实也正常，像这种与硬件相关的，后端一般会分很多服务平台，它们之间各自互相调用，你对接的后端也许只是做参数透传，然后把结果返回给你。

这边我以 H5 与 flutter 应用交互的 webview 插件：flutter_inappwebview 为例，它第一个参数需要传原生定义的函数名，第二个则传需要传给原生的参数，可以知道调用原生不同的函数要传的参数以及返回值肯定不同，所以需要利用类型体操去编写一个工具类型构造这种映射关系。对这个 flutter_inappwebview 不熟悉也没关系，它跟你去调接口思路大致差不多，我们主要学习 TS。

```ts
// 不需要callBack, flutter_inappwebview.callHandler反的是Promise，可以直接await拿到原生的返回值
export const callNativeApi = <T extends NativeFnType>(functionName: T, params?: NativeApiParams<T>) => {
  const map = {
    ...params,
  };
  const stringParams = JSON.stringify(map);
  return window?.flutter_inappwebview?.callHandler(functionName, stringParams);
};
```

首先我们需要为`window`对象拓展一个`flutter_inappwebview`属性，这个是原生 flutter 应用的 webview 会给我们的`window`注入的一个属性。我们之间的通信主要靠这个。需要利用`interface`在同一模块中会将所有定义**同名**的类型进行交叉的这一特性，需要在项目某个地方建一个`global.d.ts`，然后让`tsconfig.json`的`include`加上这个文件的路径识别就可以了。我们访问的`window`这些全局变量都属于 global 模块，如果你的`global.d.ts`不是一个模块的话就不太方便覆盖第三方库的某些类型，比如`axios`，所以建议末尾写一个`export {}`，或者顶部有`import`什么东西，这个大家初学 TS 的时候应该了解过。

```ts
// global.d.ts

declare global {
  interface Window {
    flutter_inappwebview: {
      callHandler: <T = any>(...p: any) => Promise<T>;
    };
  }
}

declare module "axios" {
  interface AxiosInstance {
    <T = any, D = any>(config: AxiosRequestConfig<D>): Promise<T>;
    <T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;
  }
  interface AxiosRequestConfig {
    withToken?: boolean;
    isRefreshToken?: boolean;
  }
}

export {};
```

- 这里使用 interface 分别对 axios 中的实例方法进行重载，因为我们一般会在响应拦截器中返回 axios 自带的那一层 data，所以它自己给的类型架子并不好用，另一个是对请求函数拓展额外的参数，比如下面这样可以直接给 request 函数传后端返回值的类型，大家常用的应该是给 demoFn 显式声明成`()=>Promise<DemoFnRes>`，也可以，不过写多了挺烦的。

![image-20240710221414569](/ts-img\image-20240710221414569.png)

- 对应的 axios 封装，这里只是演示 TS 类型，没封装什么东西。这里我们解构出拓展的两个属性，剩下的 config 就是原 axios 请求拦截器自带的，所以直接返回 config 并不会有类型不符合的报错。

![image-20240710221757761](/ts-img\image-20240710221757761.png)

OK 回到正题，针对前面封装的`callNativeApi`通信方法，看看其中的类型定义的实现

```ts
interface CallPhoneNumberParams {
  phoneNumber: string;
}

// 原生定义方法枚举
export enum NativeApiFnEnum {
  CallPhoneNumber = "callPhoneNumber",
  Logout = "logout",
}

// 原生定义传参类型枚举
type ParamsTypeMap = {
  callPhoneNumber: CallPhoneNumberParams;
};

export type NativeFnType = NativeApiFnEnum;

// 枚举传参类型映射
export type NativeApiParams<T extends NativeFnType> = T extends keyof ParamsTypeMap ? ParamsTypeMap[T] : never;
```

在传不同的函数名时，第二个参数就会对应不同的类型

```ts
// app内嵌的h5直跳可能会失效，所以调用原生定义的跳转拨号页面方法，并传递号码
callNativeApi(NativeApiFnEnum.CallPhoneNumber, { phoneNumber });
// 当h5接口token失效后，调用原生定义的退出登录方法，不需要传参
callNativeApi(NativeApiFnEnum.Logout);
```

这个实现比较简单，主要是靠定义的`ParamsTypeMap`构成函数名关联对应传参的对象类型，再定义一个`NativeFnType`接收泛型参数为定义的函数名的联合类型，也就是枚举。为啥要用枚举是防止原生那边改动函数名以后我这边就只改这个文件就可以了，不用在多个地方一个个改。接着去找对应的传参类型，找不到就说明这个函数不需要传参也就是`never`，比如 h5 的 token 过期后只需要调用原生写好的退出登录方法返回原生的登录页面，不需要传啥参数。

## 协变、逆变的实践

在我们开发中使用 Js 本身提供的一些方法比如`Object.keys()`，尤其是 Ts 开启了严格模式的项目中，你可能会前一秒拿某个对象的 key 的数组再去拿它的 item 索引原对象的时候会报错：`string类型不能索引sourceObj`，这时候你红温了，大喊：不是，这不有病吗？？？

![image-20240610004937619](/ts-img\image-20240610004937619.png)

原因我们可以追溯它源代码中对于这个方法类型的定义，是这样的

![image-20240610005054328](/ts-img\image-20240610005054328.png)

我们知道了它的数组的 item 的类型并不是我们理想的`keyof typeof obj` ，而是很干脆的 string。而 string 去索引你定义的对象因为范围比较广，所以 ts 不让你赋值。

> 知道原因以后，我们想去重载一个`Object.keys`的类型

同样在`global.d.ts`文件用于写同名的类型去交叉

![image-20240610025259673](/ts-img\image-20240610025259673.png)

这时候再回去看就不报错了，因为这里 keys 函数名相同，同名函数交叉的话 TS 会认为是函数的重载，并且由于 TS 对于函数重载是从最后一个签名进行推断哪个满足当前的调用，引用 TS 官方：

**![image-20240610025833842](/ts-img\image-20240610025833842.png)**

当然可能有人会说这个`(keyof T)[]`类型不太严谨，比如得到`("a" | "b" | "c")[]`，那`["a", "a"]`也算啊，那确实，如果要更严谨的话应该是一个元组类型`["a", "b", "c"]`才对，其实日常开发上面那个类型就够用了，没事，接触更深才能进步，我继续带大家看看联合类型转元组类型的实现，后续就需要涉及协变跟逆变的知识，如果不熟悉可以去其他文章了解一下，这里不再赘述。

了解过协变跟逆变的知识都知道具有父子关系的多个类型在通过某种构造关系得到新的类型以后，如果还具有父子关系就是协变，如果关系发生逆转，则是逆变。并且官方也说明了`infer`这个关键字在协变、逆变中使用所具有的两个特性：

![image-20240610025916415](/ts-img\image-20240610025916415.png)

我们可以通过`keyof T`拿到对象 key 的联合类型，所以问题主要在于如何将联合类型转为元组类型，那么就可以利用上面`infer`的特性去实现，思路大概就是先将联合类型比如`"a" | "b" | "c"`转换成`()=>"a" | ()=>"b" | ()=>"c"`这样的函数联合类型，接着转换为交叉类型`()=>"a" & ()=>"b" & ()=>"c"`，也就是函数重载，然后递归提取最后一个存到一个数组里。

- 第一步很简单，利用 extends 分发的特性就能直接实现

  ```ts
  type TransformFnUnion<T> = T extends T ? () => T : never;
  ```

- 第二步，将联合类型转为交叉类型，可以利用函数参数的逆变配置 infer 提取相同的类型得到交叉类型

  ```ts
  type UnionToIntersection<U> = (U extends U ? (x: U) => any : never) extends (x: infer R) => any ? R : never;
  ```

  > 比如`UnionToIntersection<"a" | "b" | "c">`，会先被 extends 分发为：`(x: "a")=>any | (x:"b")=>any | (x:"c")=>any`，继续 extends 分发，后面利用`infer R`提取，后面的 extends 同样会被分发，结果就是提取了 3 个相同类型的 R："a"、"b"、"c"进行交叉"a"&"b"&"c"，不过字符串交叉没有意义，这里只是演示过程，实际要换成上面的函数的联合类型。

- 最后就是利用之前就提到的函数重载是从最后一个签名进行推断的，所以用 infer 直接就能提取到最后一个，然后用 Exclude 排除到提取过的类型

  ```ts
  type UnionToTuple<T> = UnionToIntersection<TransformFnUnion<T>> extends () => infer ReturnType ? [...UnionToTuple<Exclude<T, ReturnType>>, ReturnType] : [];
  ```

大家可能会疑惑，递归的最后一步，`Exclude<"a","a">`结果为`never`，不是应该被前面的`TransformFnUnion<never>`转化为`()=>never`这样会一直递归下去，其实 never 作为泛型参数传递时，并不会参与 extends 表达式的计算，所以`TransformFnUnion<never>`结果直接就是 never，以解构空数组完成递归。

当然还要考虑一些情况，当一个变量被显示声明成`type Obj = Record<string,never>`的时候，`keyof Obj`并不是一个联合类型，所以还要判断是不是联合类型，这里利用元组包一下不让它分发，再判断就可以了

```ts
export type IsUnion<A, B = A> = A extends A ? ([B] extends [A] ? false : true) : never;
```

还有就是`Object.kes()`并不会返回 symbol 类型的 key，这个情况也要排除，所以完整的是这样的（也可能还没考虑全，还请指正）：

```ts
interface ObjectConstructor {
  keys<T extends object>(obj: T): IsUnion<keyof T> extends false ? (keyof T)[] : UnionToTuple<Exclude<keyof T, symbol>>;
}
```
