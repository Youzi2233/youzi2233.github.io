# 记录自己的第一个PR被Merge
> 相关issue:
> - [#743思维链组件的受控模式失效](https://github.com/ant-design/x/issues/743)
> - [1.2.0版本ThoughtChain合并代码问题](https://github.com/ant-design/x/issues/780)
> 
> 相关PR:
> - [fix: thought-chain is not controlled (#743)](https://github.com/ant-design/x/pull/752)

## 背景
在AI时代下了解AIGC项目开发是有必要的，所以选取了Ant Design X组件库进行学习

## 学习仓库

1. 首先将`ant-design/x`仓库fork到自己的`github`仓库，然后`git clone`到自己的电脑本地仓库
2. 打开项目安装依赖，`pnpm start`启动，根据代码结构去`components`中找到自己学习的组件，里面有官方文档中的demo示例代码，可以随意修改跟debugger看看怎么用的，内部实现大概是什么样的

## 发现issue问题并修改

在浏览`ant-design/x`仓库的issues时，发现了一个有趣的问题，也就是外面只传入了`expandedKeys`时，思维链组件节点依然可以展开收起，传入`value`应为受控模式，不更改这个`value`按理说不应该展开收起的。

查看代码发现在使用外部的`expandedKeys`传入`useMergedState`时仅将其作为默认值，没有给`value`，这是一个很明显的不受控问题原因

> `useMergedState`是rc-util中的一个hook，作用是如果给了value就使用value，如果没有则内部基于传入的默认值进行维护state状态
>
> ```ts
> function useMergedState<T, R = T>(
>   defaultStateValue: T | (() => T),
>   option?: {
>     defaultValue?: T | (() => T);
>     value?: T;
>     onChange?: (value: T, prevValue: T) => void;
>     postState?: (value: T) => T;
>   }
> ): [R, Updater<T>] 
> ```
>
> antd在[贡献指南](https://ant.design/docs/react/contributing-cn)中也提到大部分组件都是基于`react-component`，你可以在其`util`仓库下找到

发现问题后就`git checkout -b fix-thoughtChain`分支，修改代码后提交到自己的fork仓库，然后会出现`compare pull request`合并到`main`分支，根据ant-design提供的固定PR模板，写好自己解决的是什么问题、背景解决方案、相关issue，然后就是等待大佬的review修改意见&approve

![PR解决方案](/anything-img/first-pr-solution.png)

![大佬意见](/anything-img/pr-afc163-comment.png)


大佬让我补充一个测试用例，因为我的解决方案考虑到了外面仅传一个`expandedKeys`而不`setExpandedKeys`，那么`onExpand`事件中接受的参数应该始终依赖于外部的这个`expandedKeys`

期间发现上一个可控模式的用例写的并不完整，仅仅写了一个外部传递`["test2"]`的`keys`时判断展开项只有一个，这并不足以支撑这个用例，就像论文一样没法论证。于是会考虑不传`setKeys`时通过`jest`的点击事件，点击思维链节点后，应还是有一个展开项，至于我自己的用例可以去`PR`查看记录

由
```ts
it('ThoughtChain component work with controlled mode', async () => {
    const App = () => {
      const [expandedKeys] = React.useState<string[]>(['test2']);
      return (
        <ThoughtChain
          items={items}
          collapsible={{
            expandedKeys,
          }}
        />
      );
    };
    const { container } = render(<App />);

    const expandBodyElements = container.querySelectorAll<HTMLDivElement>(
      '.ant-thought-chain-item-content-box',
    );
    expect(expandBodyElements).toHaveLength(1);
});
```
改成
```ts
it('ThoughtChain component work with controlled mode', async () => {
    const onExpand = jest.fn();
    const App = () => {
      const [expandedKeys] = React.useState<string[]>(['test1']);
      return (
        <ThoughtChain
          items={items}
          collapsible={{
            expandedKeys,
            onExpand: (keys) => {
              onExpand(keys);
            },
          }}
        />
      );
    };
    const { container } = render(<App />);

    const expandBodyBeforeElements = container.querySelectorAll<HTMLDivElement>(
      '.ant-thought-chain-item-content-box',
    );
    expect(expandBodyBeforeElements).toHaveLength(1);

    const itemHeaderElement = container.querySelectorAll<HTMLDivElement>(
      '.ant-thought-chain-item-header-box',
    )[0];
    fireEvent.click(itemHeaderElement as Element);
    expect(onExpand).toHaveBeenCalledWith([]);

    // click again
    fireEvent.click(itemHeaderElement as Element);
    expect(onExpand).toHaveBeenCalledWith([]);

    const expandBodyAfterElements = container.querySelectorAll<HTMLDivElement>(
      '.ant-thought-chain-item-content-box',
    );
    expect(expandBodyAfterElements).toHaveLength(1);
});
```

## 后续问题
在我的代码合并到`main`后，因为还有`feature`分支(新增功能)也要合并，导致把我的demo跟测试用例的代码冲掉了，不过好在核心逻辑还在，于是提了issue，在ant-design/x发布的1.2.0版本的CHANGELOG中，发现虽然提到了我进行了PR，但是github连接并不是我，哈哈哈有点尴尬，也一起提了