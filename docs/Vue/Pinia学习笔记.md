# Pinia

<div style="display:flex;justify-content:center;"><img src="/vue-img/pinia-logo.svg" style="width:200px;height:200px"></div>

> 全局状态管理工具
>
> Pinia.js 有如下特点：
>
> - 完整的 TS 的支持
> - 足够轻量，压缩后的体积只有 1kb 左右
> - 去除 mutations，只有 state，getters，actions；
> - actions 支持同步和异步
> - 代码扁平化没有模块嵌套，只有 store 的概念，store 之间可以自由使用，每一个 store 都是独立的
> - 无序手动添加 store，store 一旦创建会自动添加
> - 支持 Vue3 和 Vue2

- 安装

  ```sh
  npm i pinia
  ```

- 引入注册 Vue3

  ```typescript
  import { createApp } from "vue";
  import App from "./App.vue";
  import { createPinia } from "pinia";

  const store = createPinia();
  let app = createApp(App);

  app.use(store);

  app.mount("#app");
  ```

## 初始化仓库 Store

- 在根目录新建一个 store 文件夹并新建一个 index.ts

- 定义仓库

  ```typescript
  import { defineStore } from "pinia";
  const enum Names {
    TEST = "TEST",
  }

  export const useTestStore = defineStore(Names.TEST, {
    state: () => {
      return {
        current: 1,
        name: "小明",
      };
    },
    //类似于computed可以帮助我们去修饰值
    getters: {},
    //可以操作异步 和 同步提交state
    actions: {},
  });
  ```

- 组件使用

  ```html
  <template>
    <div>
      <button @click="Test.current++">add</button>
      <br />
      pinia: {{ Test.current }}--{{ Test.name }}
    </div>
  </template>

  <script setup lang="ts">
    import { useTestStore } from "../store";
    const Test = useTestStore();
    console.log(Test); //Proxy
  </script>
  ```

## State 的修改

- 直接修改

- 批量修改 State 的值

  ```html
  <template>
    <div>
      <button @click="change">change</button>
      <br />
      pinia: {{ Test.current }}--{{ Test.name }}
    </div>
  </template>

  <script setup lang="ts">
    import { useTestStore } from "../store";
    const Test = useTestStore();
    const change = () => {
      Test.$patch({
        current: 200,
        name: "pinia",
      });
    };
  </script>
  ```

- 批量修改（函数形式）

  > 推荐，可以自定义修改逻辑

  ```html
  <template>
    <div>
      <button @click="change">change</button>
      <br />
      pinia: {{ Test.current }}--{{ Test.name }}
    </div>
  </template>

  <script setup lang="ts">
    import { useTestStore } from "../store";
    const Test = useTestStore();
    const change = () => {
      Test.$patch((state) => {
        state.current = 200;
        state.name = "pinia";
      });
    };
  </script>
  ```

- 通过原始对象修改整个实例

  > $state 可以通过将 store 的属性设置为新对象来替换 store 的整个状态，缺点就是必须修改整个对象的所有属性

  ```html
  <template>
    <div>
      <button @click="change">change</button>
      <br />
      pinia: {{ Test.current }}--{{ Test.name }}
    </div>
  </template>

  <script setup lang="ts">
    import { useTestStore } from "../store";
    const Test = useTestStore();
    const change = () => {
      Test.$state = {
        current: 200,
        name: "pinia",
      };
    };
  </script>
  ```

- 通过 actions 修改

  ```typescript
  import { defineStore } from "pinia";
  const enum Names {
    TEST = "TEST",
  }

  export const useTestStore = defineStore(Names.TEST, {
    state: () => {
      return {
        current: 1,
        name: "小明",
      };
    },
    getters: {},
    actions: {
      setCurrent(num: number) {
        this.current = num;
      },
    },
  });
  ```

  ```typescript
  const change = () => {
    Test.setCurrent(999);
  };
  ```

## 解构 Store

> 在 Pinia 是不允许直接解构，会失去响应式
>
> 需要导入 storeToRefs 包裹起来

```html
<template>
  <div>
    <button @click="change">change</button>
    <br />
    pinia: {{ current }}--{{ name }}
  </div>
</template>

<script setup lang="ts">
  import { useTestStore } from "../store";
  import { storeToRefs } from "pinia";
  const Test = useTestStore();
  const { current, name } = storeToRefs(Test);

  const change = () => {
    current.value++;
  };
</script>
```

## actions，getters

- actions（支持同步异步）

  1. 直接调用即可

  ```typescript
  import { defineStore } from "pinia";
  const enum Names {
    TEST = "TEST",
  }

  export const useTestStore = defineStore(Names.TEST, {
    state: () => {
      return {
        current: 1,
        name: "小明",
      };
    },
    getters: {},
    actions: {
      setCurrent(num: number) {
        this.current = num;
      },
    },
  });
  ```

  ```typescript
  const change = () => {
    Test.setCurrent(999);
  };
  ```

  2. 异步，可以结合 async await 修饰

  ```typescript
  import { defineStore } from "pinia";
  const enum Names {
    TEST = "TEST",
  }
  type Result = {
    name: string;
    current: number;
  };

  const User = (): Promise<Result> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: "小柚",
          current: 18,
        });
      }, 3000);
    });
  };

  export const useTestStore = defineStore(Names.TEST, {
    state: () => {
      return {
        name: "小明",
        current: 1,
      };
    },
    getters: {},
    actions: {
      async setCurrent() {
        const result = await User();
        this.name = result.name;
        this.current = result.current;
      },
    },
  });
  ```

  3. 多个 action 互相调用

  ```typescript
  actions: {
          async setCurrent() {
              const result = await User()
              this.name = result.name
              this.current = result.current
              this.changeAge() //相互调用
          },
          changeAge() {
              this.age = 20
          }
      }
  ```

- getters

  > 主要作用类似于 computed 数据修饰并且有缓存

  ```typescript
      getters: {
          newName(): string {
              return `$-${this.name}`
          }
      },
  ```

  然后在模板中直接使用

  ```html
  <template>
    <div>getters:{{ Test.newName }}</div>
  </template>
  ```

## API

1. $reset

   > 重置 store 到他的初始状态

   ```typescript
   const reset = () => {
     Test.$reset();
   };
   ```

   初始状态的数据是：

   ```typescript
   	state: () => {
           return {
               name: "小明",
               current: 1,
               age: 18
           }
       },
   ```

2. 订阅 state 的改变

   > 类似于 Vuex 的 abscribe，只要有 state 的变化就会走这个函数

   ```typescript
   Test.$subscribe((args, state) => {
     console.log(args, state);
   });
   ```

   第二个参数：如果你的组件卸载之后还想继续调用请设置第二个参数

   ```typescript
   Test.$subscribe(
     (args, state) => {
       console.log(args, state);
     },
     {
       detached: true,
     }
   );
   ```

3. 订阅 actions 的调用

   > 只要 actions 被调用就会走这个函数

   ```typescript
   Test.$onAction((args) => {
     console.log(args);
   });
   ```

## pinia 持久化插件

> 页面每次刷新都会丢失状态
>
> 需要写一个 pinia 插件去缓存值到 localStorage

```typescript
import { createApp, toRaw } from "vue";
import Card from "./components/card/index.vue";
import App from "./App.vue";
import { createPinia, PiniaPluginContext } from "pinia";

const __piniaKey__ = "__piniaKey__";

const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getStorage = (key: string) => {
  return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key) as string) : {};
};

//首先定义持久化插件
const piniaPlugin = (context: PiniaPluginContext) => {
  //利用这个PiniaPluginContext来解构出store
  const { store } = context;
  //从localStorage中获取存储的数据

  //这里如果你的仓库有2个以上，那么data就会有两份以上，所以都会持久化的
  const data = getStorage(`${__piniaKey__}-${store.$id}`);

  //监听store的变化,并且把变化的值存到localStorage中
  store.$subscribe(() => {
    //将这个store存到localStorage中，但这是proxy对象，需要转换成普通对象
    setStorage(`${__piniaKey__}-${store.$id}`, toRaw(store.$state));
  });
  //返还接收到的这个对象
  return data;
};

const store = createPinia();

//那么这里就可以使用接收到的data了
store.use(piniaPlugin);

let app = createApp(App);

app.component("Card", Card);
app.use(store);

app.mount("#app");
```
