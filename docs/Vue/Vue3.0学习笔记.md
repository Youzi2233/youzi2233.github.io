# 常用 Composition API

## 1. setup

1. 理解：Vue3.0 中一个新的配置项，值为一个函数
2. setup 是所有<font color="red">Composition API（组合 API）</font><i style="color:gray;font-weight:bold">表演的舞台”</i>
3. 组件中所用到的：数据、方法等等，均要配置在 setup 中。
4. setup 函数的两种返回值：
   1. 若返回一个对象，则对象中的属性、方法，在模板中均可以使用
   2. <span style="color:#aad">若返回一个渲染函数：则可以自定义渲染内容。（了解）</span>
5. 注意：
   1. 尽量不要与 Vue2.x 配置混用
      - Vue2.x 配置（data、methods、computed...）中可以访问到 setup 中的属性、方法。
      - 但在 setup 中不能访问到 Vue2.x 配置
      - 如有重名，setup 优先
   2. setup 不能是一个 async 函数，因为返回值不再是 return 的对象，而是 promise，模板看不到 return 对象中的属性。

## 2. ref 函数

- 作用：定义一个响应式的数据
- 语法：`let xxx = ref(initValue)`
  - 创建一个包含响应式数据的<span style="color:red">引用对象（referece 对象，简称 ref 对象）</span>
  - JS 中操作数据：`xxx.value`
  - 模板中读取数据：不需要.value，直接`<div>{{xxx}}</div>`
- 备注：
  - 接收的数据可以是：基本类型、也可以是对象类型
  - 基本类型的数据：响应式依然是靠`Object.defineProperty()`的 get 与 set 完成的。
  - 对象类型的数据：内部 <i style="color:gray;font-weight:bold">“求助‘</i> 了 Vue3.0 中的一个新函数——`reactive`函数

## 3. reactive 函数

- 作用：定义一个对象或数组类型的响应式数据（基本类型不要用它，要用`ref`函数）

- 语法：`const 代理对象 = reactive(源对象)`接收一个对象（或数组），返回一个<span style="color:red">Proxy 的实例对象</span>

- reactive 定义的响应式数据是“深层次的”

- 内部基于 ES6 的 Proxy 实现，通过代理对象操作源对象内部数据进行操作。

  ```js
  setup(){
      //数据
      let person = reactive({
          name:'张三',
          age:18,
          job:{
              type:'前端工程师',
              salary:'10K',
              a:{
                  b:{
                      c:666
                  }
              }
          },
          hobby:['学习','打游戏','干饭']
      })

      //方法
      function changeInfo(){
          person.name = '李四'
          person.job.salary = '15K'
          person.a.b.c = 999
          hobby[1] = '睡觉'
      }
      return{
          person,
          changeInfo
      }
  }
  ```

## 4. Vue3.0 中的响应式原理

### Vue2.x 的响应式

- 实现原理：

  - 对象类型：通过`Object.defineProperty()`对属性的读取，修改进行拦截（数据劫持）。

  - 数组类型：通过重写更新数组的一系列方法来实现拦截。（对数组的变更方法进行了包裹）。

    ```js
    Object.defineProperty(data, "count", {
      get() {},
      set() {},
    });
    ```

- 存在问题：

  - 新增属性、删除属性，界面不会更新（Vue 通过 Vue.set()、Vue.delete()方法解决）
  - 直接通过下标修改数组，界面不会自动更新

### Vue3.0 的响应式

- 实现原理：

  - 通过 Proxy（代理）：拦截对象中任意属性的变化，包括属性值的读写、属性的添加、修改、删除等。

  - 通过 Reflect（反射）：对源对象的属性进行操作。

    ```js
    let person = {
      name: "张三",
      age: 18,
    };

    //模拟Vue3中实现响应式
    const p = new Proxy(person, {
      get(target, propName) {
        console.log(`有人读取了p身上的${propName}属性`);
        //return target[propName]
        return Reflect.get(target, propName);
      },
      set(target, propName, value) {
        console.log(`有人修改了p身上的${propName}属性，我要去更新页面了`);
        //return target[propName] = value
        return Reflect.set(target, propName, value);
      },
      deleteProperty(target, propName) {
        console.log(`有人删除了p身上的${propName}属性，我要去更新页面了`);
        //return delete target[propName]
        return Reflect.deleteProperty(target, propName);
      },
    });
    ```

## 5.reactive 对比 ref

- 从定义数据角度对比：
  - ref 用来定义：<strong style="color:#DD5145">基本类型数据</strong>。
  - reactive 用来定义：<strong style="color:#DD5145">对象（或数组）类型数据</strong>。
  - 备注：ref 也可以用来定义<strong style="color:#DD5145">对象（或数组）类型数据</strong>, 它内部会自动通过`reactive`转为<strong style="color:#DD5145">代理对象</strong>。
- 从原理角度对比：
  - ref 通过`Object.defineProperty()`的`get`与`set`来实现响应式（数据劫持）。
  - reactive 通过使用<strong style="color:#DD5145">Proxy</strong>来实现响应式（数据劫持）, 并通过<strong style="color:#DD5145">Reflect</strong>操作<strong style="color:orange">源对象</strong>内部的数据。
- 从使用角度对比：
  - ref 定义的数据：操作数据<strong style="color:#DD5145">需要</strong>`.value`，读取数据时模板中直接读取<strong style="color:#DD5145">不需要</strong>`.value`。
  - reactive 定义的数据：操作数据与读取数据：<strong style="color:#DD5145">均不需要</strong>`.value`。

## 6.setup 的两个注意点

- setup 执行的时机
  - 在 beforeCreate 之前执行一次，this 是`undefined`
- setup 的参数
  - props：值为对象，包含：组件外部传递过来，且组件内部声明接收了的属性。
  - context：上下文对象
    - attrs：值为对象，包含：组件外部传递过来，但没有在 props 配置中声明的参数
    - slots：收到的插槽内容，相当于`this.$slots`
    - emit：分发自定义事件的函数，相当于`this.$emit`

## 7. 计算属性与监视

### 1. computed 函数

- 与 Vue 中的 computed 配置功能一致

- 写法：

  ```js
  import {computed} from 'vue'

  setup(){
      ...
      //计算属性——简写
      let fullName = computed(()=>{
          return person.firstName + '-' + person.lastName
      })
      //计算属性——完整
      let fullName = computed({
          get(){
              return person.firstName + '-' + person.lastName
          },
          set(value){
              const nameArr = value.split('-')
              person.firstName = nameArr[0]
              person.lastName = nameArr[1]
          }
      })
  }
  ```

### 2. watch 函数

- 与 Vue2.x 中 watch 配置功能一致

- 两个小“坑”：

  - 监视 reactive 定义的响应式时：oldValue 无法正确获取、强制开启了深度监视
  - 监视 reactive 定义的响应式数据中某个属性时：deep 配置有效

  ```js
  import { reactive, ref, watch } from "vue";
  ...
  setup() {
      let sum = ref(0);
      let msg = ref("你好");
      let person = reactive({
        name: "张三",
        age: 18,
        job: {
          a: {
            salary: 20,
          },
        },
      });
      //情况一：监视ref定义的响应式数据
      watch(
        sum,(newValue, oldValue) => {
          console.log("sum变了", newValue, oldValue);
        },
        { immediate: false }
      );

  	//情况二：监视多个ref定义的响应式数据
      watch(
        [sum, msg],
        (newValue, oldValue) => {
          console.log("sum或msg变了", newValue, oldValue);
        },
        { immediate: false }
      );

      //情况三：监视reactive定义的响应式数据(整个对象)
      //oldValue有bug
      watch(person, (newValue, oldValue) => {
        console.log("person某个属性变了", newValue, oldValue);
      });

      //情况四：监视reactive定义的响应式数据中的某个属性
      watch(
        () => person.age,
        (newValue, oldValue) => {
          console.log("person的age属性变了", newValue, oldValue);
        }
      );

      //情况五：监视reactive定义的响应式数据中的某些属性
      watch([() => person.name, () => person.age], (newValue, oldValue) => {
        console.log("person部分信息变了", newValue, oldValue);
      });

      //情况六：监视reactive定义的响应式数据中的对象，需开启深度
      // oldValue有bug
      watch(
        () => person.job,
        (newValue, oldValue) => {
          console.log("涨薪了", newValue, oldValue);
        },
        { deep: true }
      );
      return {
        sum,
        person,
        msg,
      };
    },
  ```

### 3. watchEffect 函数

- watch 的套路是：既要指明监视的属性，也要指明监视的回调

- watchEffect 的套路是：不用指明监视哪个属性，监视的回调中用到哪个就监视哪个属性

- watchEffect 有点像 computed：

  - 但 computed 注重的是计算出来的值（回调函数的返回值），所以必须要写返回值
  - 而 watchEffect 更注重的是过程（回调函数的函数体），所以不用写返回值

  ```js
  //watchEffect所指定的回调用到的数据只要发送变化，则直接重新执行回调
  watchEffect(() => {
    const x1 = sum.value;
    const x2 = person.age;
    console.log("watchEffect配置的回调执行了");
  });
  ```

- 清除副作用

  > 就是在触发监听之前会调用一个函数可以处理你的逻辑如防抖

  ```typescript
  import { watchEffect, ref } from "vue";
  let message = ref<string>("");
  watchEffect((oninvalidate) => {
    //console.log('message', message.value);
    oninvalidate(() => {});
    console.log("message", message.value);
  });
  ```

- 更多的配置项

  |          | pre            | sync                 | post           |
  | -------- | -------------- | -------------------- | -------------- |
  | 更新时机 | 组件更新前执行 | 强制效果始终同步触发 | 组件更新后执行 |

  > 副作用刷新时机 flush 一般使用 post

  ```typescript
  import { watchEffect, ref } from "vue";
  let message = ref<string>("");
  let message2 = ref<string>("");
  watchEffect(
    (oninvalidate) => {
      //console.log('message', message.value);
      oninvalidate(() => {});
      console.log("message2", message2.value);
    },
    {
      flush: "post",
      onTrigger() {},
    }
  );
  ```

## 8. 生命周期

- Vue3.0 中可以继续使用 Vue2.x 中的生命周期钩子，但有有两个被更名：

  - `beforeDestroy`改名为 `beforeUnmount`
  - `destroyed`改名为 `unmounted`

- Vue3.0 也提供了 Composition API 形式的生命周期钩子，与 Vue2.x 中钩子对应关系如下：

  > **(没有对应的 API 放入 setup，setup 就相当于 beforeCreate 和 created)**

  - `beforeCreate`===>`setup()`
  - `created`=======>`setup()`
  - `beforeMount` ===>`onBeforeMount`
  - `mounted`=======>`onMounted`
  - `beforeUpdate`===>`onBeforeUpdate`
  - `updated` =======>`onUpdated`
  - `beforeUnmount` ==>`onBeforeUnmount`
  - `unmounted` =====>`onUnmounted`

## 9. 自定义 hock 函数

- 什么是 hook？—— 本质是一个函数，把 setup 函数中使用的 Composition API 进行了封装。

- 类似于 vue2.x 中的 mixin。

- 自定义 hook 的优势: 复用代码, 让 setup 中的逻辑更清楚易懂。

## 10. toRef

- 作用：创建一个 ref 对象，其 value 值指向另一个对象中的某个属性
- 语法：`const name = toRef(person,'name')`
- 应用：要将响应式对象中的某个属性单独提供给外部使用时
- 拓展：`toRefs`与`toRef`功能一致，但可以批量创建多个 ref 对象，语法：`toRefs(person)`

# 三、其它 Composition API

## 1.shallowReactive 与 shallowRef

- shallowReactive：只处理对象最外层属性的响应式（浅响应式）。
- shallowRef：只处理基本数据类型的响应式, 不进行对象的响应式处理。

- 什么时候使用?
  - 如果有一个对象数据，结构比较深, 但变化时只是外层属性变化 ===> shallowReactive。
  - 如果有一个对象数据，后续功能不会修改该对象中的属性，而是生新的对象来替换 ===> shallowRef。

## 2.readonly 与 shallowReadonly

- readonly: 让一个响应式数据变为只读的（深只读）。
- shallowReadonly：让一个响应式数据变为只读的（浅只读）。
- 应用场景: 不希望数据被修改时。

## 3.toRaw 与 markRaw

- toRaw：
  - 作用：将一个由`reactive`生成的<strong style="color:orange">响应式对象</strong>转为<strong style="color:orange">普通对象</strong>。
  - 使用场景：用于读取响应式对象对应的普通对象，对这个普通对象的所有操作，不会引起页面更新。
- markRaw：
  - 作用：标记一个对象，使其永远不会再成为响应式对象。
  - 应用场景:
    1. 有些值不应被设置为响应式的，例如复杂的第三方类库等。
    2. 当渲染具有不可变数据源的大列表时，跳过响应式转换可以提高性能。

## 4.customRef

- 作用：创建一个自定义的 ref，并对其依赖项跟踪和更新触发进行显式控制。

- 实现防抖效果：

  ```vue
  <template>
    <input type="text" v-model="keyword" />
    <h3>{{ keyword }}</h3>
  </template>

  <script>
  import { ref, customRef } from "vue";
  export default {
    name: "Demo",
    setup() {
      // let keyword = ref('hello') //使用Vue准备好的内置ref
      //自定义一个myRef
      function myRef(value, delay) {
        let timer;
        //通过customRef去实现自定义
        return customRef((track, trigger) => {
          return {
            get() {
              track(); //告诉Vue这个value值是需要被“追踪”的
              return value;
            },
            set(newValue) {
              clearTimeout(timer);
              timer = setTimeout(() => {
                value = newValue;
                trigger(); //告诉Vue去更新界面
              }, delay);
            },
          };
        });
      }
      let keyword = myRef("hello", 500); //使用程序员自定义的ref
      return {
        keyword,
      };
    },
  };
  </script>
  ```

## 5.provide 与 inject

- 作用：实现<strong style="color:#DD5145">祖与后代组件间</strong>通信

- 套路：父组件有一个 `provide` 选项来提供数据，后代组件有一个 `inject` 选项来开始使用这些数据

- 具体写法：

  1. 祖组件中：

     ```js
     setup(){
     	......
         let car = reactive({name:'奔驰',price:'40万'})
         provide('car',car)
         ......
     }
     ```

  2. 后代组件中：

     ```js
     setup(props,context){
     	......
         const car = inject('car')
         return {car}
     	......
     }
     ```

## 6.响应式数据的判断

- isRef: 检查一个值是否为一个 ref 对象
- isReactive: 检查一个对象是否是由 `reactive` 创建的响应式代理
- isReadonly: 检查一个对象是否是由 `readonly` 创建的只读代理
- isProxy: 检查一个对象是否是由 `reactive` 或者 `readonly` 方法创建的代理

# 四、新的组件

## 1.Fragment

- 在 Vue2 中: 组件必须有一个根标签
- 在 Vue3 中: 组件可以没有根标签, 内部会将多个标签包含在一个 Fragment 虚拟元素中
- 好处: 减少标签层级, 减小内存占用

## 2.Teleport

- 什么是 Teleport？—— `Teleport` 是一种能够将我们的<strong style="color:#DD5145">组件 html 结构</strong>移动到指定位置的技术。

  ```vue
  <teleport to="移动位置">
  	<div v-if="isShow" class="mask">
  		<div class="dialog">
  			<h3>我是一个弹窗</h3>
  			<button @click="isShow = false">关闭弹窗</button>
  		</div>
  	</div>
  </teleport>
  ```

## 3.Suspense

- 等待异步组件时渲染一些额外内容，让应用有更好的用户体验

- 使用步骤：

  - 异步引入组件

    ```js
    import { defineAsyncComponent } from "vue";
    const Child = defineAsyncComponent(() => import("./components/Child.vue"));
    ```

  - 使用`Suspense`包裹组件，并配置好`default` 与 `fallback`

    ```vue
    <template>
      <div class="app">
        <h3>我是App组件</h3>
        <Suspense>
          <template v-slot:default>
            <Child />
          </template>
          <template v-slot:fallback>
            <h3>加载中.....</h3>
          </template>
        </Suspense>
      </div>
    </template>
    ```

# 五、其他

## 1.全局 API 的转移

- Vue 2.x 有许多全局 API 和配置。

  - 例如：注册全局组件、注册全局指令等。

    ```js
    //注册全局组件
    Vue.component('MyButton', {
      data: () => ({
        count: 0
      }),
      template: '<button @click="count++">Clicked {{ count }} times.</button>'
    })

    //注册全局指令
    Vue.directive('focus', {
      inserted: el => el.focus()
    }
    ```

- Vue3.0 中对这些 API 做出了调整：

  - 将全局的 API，即：`Vue.xxx`调整到应用实例（`app`）上

    | 2.x 全局 API（`Vue`）    | 3.x 实例 API (`app`)                        |
    | ------------------------ | ------------------------------------------- |
    | Vue.config.xxxx          | app.config.xxxx                             |
    | Vue.config.productionTip | <strong style="color:#DD5145">移除</strong> |
    | Vue.component            | app.component                               |
    | Vue.directive            | app.directive                               |
    | Vue.mixin                | app.mixin                                   |
    | Vue.use                  | app.use                                     |
    | Vue.prototype            | app.config.globalProperties                 |

## 2.其他改变

- data 选项应始终被声明为一个函数。

- 过度类名的更改：

  - Vue2.x 写法

    ```css
    .v-enter,
    .v-leave-to {
      opacity: 0;
    }
    .v-leave,
    .v-enter-to {
      opacity: 1;
    }
    ```

  - Vue3.x 写法

    ```css
    .v-enter-from,
    .v-leave-to {
      opacity: 0;
    }

    .v-leave-from,
    .v-enter-to {
      opacity: 1;
    }
    ```

- <strong style="color:#DD5145">移除</strong>keyCode 作为 v-on 的修饰符，同时也不再支持`config.keyCodes`

- <strong style="color:#DD5145">移除</strong>`v-on.native`修饰符

  - 父组件中绑定事件

    ```vue
    <my-component v-on:close="handleComponentEvent" v-on:click="handleNativeClickEvent" />
    ```

  - 子组件中声明自定义事件

    ```vue
    <script>
    export default {
      emits: ["close"],
    };
    </script>
    ```

- <strong style="color:#DD5145">移除</strong>过滤器（filter）

  > 过滤器虽然这看起来很方便，但它需要一个自定义语法，打破大括号内表达式是 “只是 JavaScript” 的假设，这不仅有学习成本，而且有实现成本！建议用方法调用或计算属性去替换过滤器。

- ......
