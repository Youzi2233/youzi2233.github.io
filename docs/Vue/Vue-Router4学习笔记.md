# Vue-Router4

## 入门

- 安装：

  ```typescript
  npm i vue-router@4   //vue3，vue2需要用3版本
  ```

- 初始化

  > 在 src 目录下新建一个 router 文件夹，并新建 index.ts

  ```typescript
  //引入路由对象
  import { createRouter, createWebHistory, createWebHashHistory, createMemoryHistory, RouteRecordRaw } from "vue-router";

  //路由数组的类型 RouteRecordRaw
  // 定义一些路由
  // 每个路由都需要映射到一个组件。
  const routes: Array<RouteRecordRaw> = [
    {
      //默认
      path: "/",
      component: () => import("../components/Pinia.vue"),
    },
    {
      path: "/cart",
      component: () => import("../components/cart.vue"),
    },
  ];

  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  //导出router
  export default router;
  ```

- 在 main.ts 挂载

  ```typescript
  import { createApp } from "vue";
  import App from "./App.vue";
  import router from "./router";

  let app = createApp(App);

  app.use(router);
  app.mount("#app");
  ```

- 在组件中使用

  > 这里与 vue2 用法一致

  ```html
  <template>
    <h1>Router</h1>
    <router-link to="/">Pinia</router-link>
    <router-link to="/cart">Cart</router-link>
    <hr />
    <router-view></router-view>
  </template>

  <script setup lang="ts"></script>

  <style>
    a {
      text-decoration: none;
      margin-right: 10px;
    }
  </style>
  ```

## 编程式导航

- 字符串模式

  ```html
  <template>
    <h1>Router</h1>
    <!-- <router-link to="/">Pinia</router-link>
    <router-link to="/cart">Cart</router-link> -->
    <button @click="toPage('/')">Pinia</button>
    <button @click="toPage('/cart')" style="margin-left: 10px;">Cart</button>
    <hr />
    <router-view></router-view>
  </template>

  <script setup lang="ts">
    //使用官方的hock
    import { useRouter } from "vue-router";

    const router = useRouter();
    const toPage = (url: string) => {
      router.push(url);
    };
  </script>
  ```

- 对象模式

  ```typescript
  //使用官方的hock
  import { useRouter } from "vue-router";

  const router = useRouter();
  const toPage = (url: string) => {
    router.push({
      path: url,
    });
  };
  ```

- 命名式路由模式

  ```typescript
  //使用官方的hock
  import { useRouter } from "vue-router";

  const router = useRouter();
  const toPage = () => {
    router.push({
      name: "cart",
    });
  };
  ```

- a 标签跳转

  > 直接通过 a href 也可以跳转，但是会刷新页面

  ```html
  <a href="/">Home</a>
  ```

## 历史记录

- replace 的使用

  > 采用 replace 进行页面的跳转同样也会渲染新的 Vue 组件，但是在 history 中不会重复保存记录，而是替换原有的 vue 组件；

  - router-link 使用方法

    ```html
    <router-link replace to="/cart">Cart</router-link>
    ```

  - 编程式导航

    ```typescript
    //使用官方的hock
    import { useRouter } from "vue-router";

    const router = useRouter();
    const toPage = (url: string) => {
      router.replace(url);
    };
    ```

- 前进-后退

  ```html
  <button @click="next">前进</button> <button @click="prev">后退</button>
  ```

  ```typescript
  const next = () => {
    //前进 数量不限于1
    router.go(1);
  };

  const prev = () => {
    //后退
    router.back();
    //router.go(-1)
  };
  ```

## 路由传参

> 首先是下面代码所用到的数据：

```json
{
  "data": [
    {
      "id": 1,
      "name": "小明",
      "age": 20
    },
    {
      "id": 2,
      "name": "小红",
      "age": 21
    },
    {
      "id": 3,
      "name": "小黑",
      "age": 22
    }
  ]
}
```

- query 路由传参

  > 编程式路由导航，使用 router push 或者 replace 的时候，改为对象形式新增 query，必须传入一个对象

  ```typescript
  <script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { data } from '../data/testList.json'
  const router = useRouter()
  type item = {
      id: number,
      name: string,
      age: number
  }

  const toDetail = (item: item) => {
      router.push({
          //这里也可以是name
          path: '/detail',
          query: item
      })
  }
  </script>
  ```

  - 接收参数，使用 useRoute 的 query

    ```html
    <template>
      <button @click="router.back()">返回</button>
      <h3>我是详情页面</h3>
      <div>
        <p>姓名：{{ route.query.name }}</p>
        <p>年龄：{{ route.query.age }}</p>
      </div>
    </template>

    <script setup lang="ts">
      import { useRouter, useRoute } from "vue-router";
      const router = useRouter();
      const route = useRoute();
    </script>
    ```

  - 此时地址栏：

    - `http://localhost:3000/detail?id=1&name=小明&age=20`

- params 路由传参

  > 编程式导航，使用 router.push 或者 replace 的时候改为对象形式，并且只能使用 name，path 无效，然后传入 params

  ```typescript
  const toDetail = (item: item) => {
    router.push({
      name: "detail",
      params: item,
    });
  };
  ```

  - 接收参数，使用 useRoute 的 params

    ```html
    <template>
      <button @click="router.back()">返回</button>
      <h3>我是详情页面</h3>
      <div>
        <p>姓名：{{ route.params.name }}</p>
        <p>年龄：{{ route.params.age }}</p>
      </div>
    </template>

    <script setup lang="ts">
      import { useRouter, useRoute } from "vue-router";
      const router = useRouter();
      const route = useRoute();
    </script>
    ```

  - 此时地址栏：

    - `http://localhost:3000/detail`
    - 刷新会丢失数据

- 动态路由传参

  > 很多时候，我们需要将给定匹配模式的路由映射到同一个组件进行渲染，在 Vue Router 中，我们可以在路径中使用一个动态字段来实现，我们称之为 路径参数

  <p style="color:red;font-weight:600;">路径参数用冒号 : 表示。当一个路由被匹配时，它的params的值将在每个组件</p>

  ```typescript
  const routes: Array<RouteRecordRaw> = [
    {
      path: "/",
      component: () => import("../components/Table.vue"),
    },
    {
      //动态路由参数
      path: "/detail/:id",
      name: "detail",
      component: () => import("../components/Detail.vue"),
    },
  ];
  ```

  ```html
  <script setup lang="ts">
    import { useRouter } from "vue-router";
    import { data } from "../data/testList.json";
    const router = useRouter();
    type item = {
      id: number;
      name: string;
      age: number;
    };

    const toDetail = (item: item) => {
      router.push({
        name: "detail",
        params: {
          //这里对应上动态路由的参数id，地址栏会响应改变
          id: item.id,
        },
      });
    };
  </script>
  ```

  - 此时地址栏：
    - `http://localhost:3000/detail/1`

  ```html
  <template>
    <button @click="router.back()">返回</button>
    <h3>我是详情页面</h3>
    <div>
      <p>ID：{{ route.params.id }}</p>
      <p>姓名：{{ person.name }}</p>
      <p>年龄：{{ person.age }}</p>
    </div>
  </template>

  <script setup lang="ts">
    import { data } from "../data/testList.json";
    import { useRouter, useRoute } from "vue-router";
    const router = useRouter();
    const route = useRoute();

    //数组的find方法会返回找到的对象
    const person = data.find((item) => item.id === Number(route.params.id));
  </script>
  ```

## 命名视图

> ​ 命名视图可以在同一级（同一个组件）中展示更多的路由视图，而不是嵌套显示。 命名视图可以让一个组件中具有多个路由渲染出口，这对于一些特定的布局组件非常有用。 命名视图的概念非常类似于“具名插槽”，并且视图的默认名称也是 default。
>
> ​ 一个视图使用一个组件渲染，因此对于同个路由，多个视图就需要多个组件。确保正确使用 components 配置 (带上 s)

```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    components: {
      default: () => import("../components/layout/menu.vue"),
      header: () => import("../components/layout/header.vue"),
      content: () => import("../components/layout/content.vue"),
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

对应 Router-view 通过 name 对应组件

```html
<div>
  <router-view></router-view>
  <router-view name="header"></router-view>
  <router-view name="content"></router-view>
</div>
```

## 重定向，别名

- 重定向：redirect

  - 字符串形式配置，访问 / 重定向到 /user1

    ```typescript
    const routes: Array<RouteRecordRaw> = [
      {
        path: "/",
        component: () => import("../components/root.vue"),
        redirect: "/user1",
        children: [
          {
            path: "/user1",
            components: {
              default: () => import("../components/A.vue"),
            },
          },
          {
            path: "/user2",
            components: {
              bbb: () => import("../components/B.vue"),
              ccc: () => import("../components/C.vue"),
            },
          },
        ],
      },
    ];
    ```

  - 对象形式配置

    ```js
    redirect: { path: '/user1' },
    ```

  - 函数模式（可以传参）

    ```js
    redirect: (to) => {
        return {
            path: '/user1',
            query: to.query
        }
    },
    ```

- 别名：alias

  - 将 / 别名为 /root，意味着当用户访问 /root 时，和访问 / 的资源是一样的

    ```typescript
    path: '/',
    component: () => import('../components/root.vue'),
    alias:["/root","/root2","/root3"],
    ```

## 导航守卫

- 全局前置守卫

  ```
  router.beforeEach((to,form,next)=>{
  	console.log(to,form);
  	next()
  })
  ```

  > to: 即将要进入的路由对象；
  > from: 当前导航正要离开的路由对象；
  > next(): 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是 confirmed (确认的)。
  > next(false): 中断当前的导航。如果浏览器的 URL 改变了 (可能是用户手动或者浏览器后退按钮)，那么 URL 地址会重置到 from 路由对应的地址。
  > next('/') 或者 next({ path: '/' }): 跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。

  - 例：权限判断

    ```typescript
    const whileList = ["/"];

    router.beforeEach((to, from, next) => {
      let token = localStorage.getItem("token");
      //白名单 有值 或者登陆过存储了token信息可以跳转 否则就去登录页面
      if (whileList.includes(to.path) || token) {
        next();
      } else {
        next({
          path: "/",
        });
      }
    });
    ```

- 全局后置守卫

  ```js
  router.afterEach((to, from) => {});
  ```

- 路由元信息

  - 通过路由记录的 meta 属性可以定义路由的元信息。使用路由元信息可以在路由中附加自定义数据，例如：
    - 权限效验标识
    - 路由组件的过渡名称
    - 路由组件持久化缓存（keep-alive）的相关配置
    - 标题名称
  - 我们可以在导航守卫或者是路由对象中访问路由的元信息数据

  ```js
  declare module 'vue-router'{
      interface RouteMeta{
          title:string,
          transition:string,
      }
  }


  const routes: Array<RouteRecordRaw> = [
      {
          path: "/",
          component: () => import('../components/Table.vue'),
          meta:{
              title:'首页',
  			transition:'animate__fadeInUp'
          }
      },
      {
          path: "/detail/:id",
          name: 'detail',
          component: () => import('../components/Detail.vue'),
          meta:{
              title:'详情',
              transition:'animate__bounceIn'
          }
      }
  ]
  ```

  ```js
  let title = document.title;
  router.beforeEach((to, from, next) => {
    console.log(to);
    document.title = title + `${to.meta.title ?? ""}`;
    next();
  });
  ```

- 路由过渡动效

  - 想要在你的路径组件上使用转场，并对导航进行动画处理，你需要使用 v-slot：

    ```html
    <router-view #default="{route,Component}">
      <transition :enter-active-class="`animate__animated ${route.meta.transition}`">
        <component :is="Component"></component>
      </transition>
    </router-view>
    ```

## 滚动行为

> 使用前端路由，当切换到新路由时，想要页面滚到顶部或者是保持原先的滚动位置，就像重新加载页面那样。vue-router 可以自定义路由切换时页面如何滚动。

- 当创建一个 Router 实例，你可以提供一个 scrollBehavior 方法

  ```js
  const router = createRouter({
    history: createWebHistory(),
    //保持上次滚动的位置
    scrollBehavior: (to, from, savedPosition) => {
      console.log(savedPosition);
      if (savedPosition) {
        return savedPosition;
      } else {
        top: 0;
      }
    },
    routes,
  });
  ```

  也可以是一个异步操作

  ```js
  const router = createRouter({
      history: createWebHistory(),
      scrollBehavior: (to,from,savedPosition)=>{
          return new Promise((resolve)=>{
  		 setTimeout(()=>{
  			resolve({
                  top:9999
              })
           },2000)
          })
      }
      routes
  })
  ```

## 动态路由

> 我们一般使用动态路由都是后台会返回一个路由表，前端通过调接口拿到后处理，主要使用的方法就是 router.addRoute

- 添加路由

  - ‘动态路由主要通过两个函数实现。router.addRoute()和 router.removeRoute()。它们只注册一个新的路由，也就是说，如果新增加的路由与当前位置相匹配，就需要你用 router.push()或 router.replace()来手动导航，才能显示该新路由

    ```js
    const router = useRouter();
    router.addRoute({
      path: "/about",
      component: About,
    });
    ```

- 删除路由

  - 有几种不同的方法来删除现有的路由：

    - 通过添加一个名称冲突的路由。如果添加与现有途径名称相同的途径，会先删除路由，再添加路由：

      ```js
      router.addRoute({ path: "/about", name: "about", component: About });
      // 这将会删除之前已经添加的路由，因为他们具有相同的名字且名字必须是唯一的
      router.addRoute({ path: "/other", name: "about", component: Other });
      ```

    - 通过调用 router.addRoute()返回的回调：

      ```js
      const removeRoute = router.addRoute(routeRecord);
      removeRoute(); //删除路由如果存在的话
      ```

      当路由没有名称时，这很有用

    - 通过使用 router.removeRoute() 按名称删除路由

      ```js
      router.addRoute({
        path: "/about",
        name: "about",
        component: About,
      });
      router.removeRoute("about");
      ```

      需要注意的是，如果你想使用这个功能，又想避免名字的冲突，可以在路由中使用 Symbol 作为名字。

      当路由被删除时，所有的别名和子路由也会被同时删除。

- 查看现有路由

  Vue Router 提供了两个功能来查看现有的路由：

  - router.hasRoute()：检查路由是否存在
  - router.getRoutes()：获取一个包含所有路由记录的数组
