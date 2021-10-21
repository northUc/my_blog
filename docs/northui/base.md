# ui
[[toc]]
- 利用`ts`+`react`+`storybook`
- 打包用ts `"b": "tsc -p tsconfig.json"` 他能生成对应的 ts配置文件
- 运行效果 `"storybook": "start-storybook -p 6006 -s public"`

- 这里用的`ts`+`react`+`styled-components`写组件库,使用的时候不需要额外引入css文件,另外用ts打包同时声明文件一并打包处理好
- 利用`storybook`写我们的dome,具体的语法看下面例子或者官网
## avatar
- 小试牛刀,用`avatar`来试手
- 组件分析: avatar 核心就是 `src`和`size`,那么先定义他的参数
### 实现
- 定义`Avatar`参数类型
```ts
export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
	/** 是否加载中*/
	isLoading?: boolean;
	/** 用户名*/
	username?: string;
	/** 图片地址 */
	src?: null | string;
	/** 头像大小 */
	size?: keyof typeof AvatarSize;
};

export function Avatar(props: AvatarProps) {
}

Avatar.defaultProps = {
	isLoading: false,
	username: "loading",
	src: null,
	size: "medium",
};
```
- avatar 核心骨架
    -   `Image`定义了外层样式
    -   `avatarFigure`定义了内部的`logo`样式 都是通过`props`进行控制
```ts
const Image = styled.div<AvatarProps>`
//   ...........
`;
export function Avatar(props: AvatarProps) {
	const { isLoading, src, username, size } = props;
	const avatarFigure = useMemo(() => {
		// .......
	}, [isLoading, src, username, size]);

	return (
		<Image
			size={size}
			isLoading={isLoading}
			src={src}
			{...props}
			data-testid="avatar-div"
		>
			{avatarFigure}
		</Image>
	);
}
```
### avatar.stories
- `export const knobsAvatar` 作为demo 暴露出去
- `knobsAvatar.args` 是一个配置选项
- `@storybook/addon-knobs` 提供了很多插件 让我们进行调试
- decorators 这里的插件配置
```ts
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from "react";
import { Avatar } from "./index";
import { withKnobs } from "@storybook/addon-knobs";

type ComponentType = ComponentStory<typeof Avatar>
// 核心在这儿 作为demo 暴露出去
// 如果这配置了 args 那么页面dome 会显示 show code 
export const knobsAvatar:ComponentType = (args) => (
	<Avatar
        {...args}
	/>
);

knobsAvatar.args = {
    size:select<AvatarSizeType>(
        "size",
        Object.keys(AvatarSize) as AvatarSizeType[],
        "medium"
    ),
    username:text("username", "yehuozhili"),
    src:text(
        "src",
        "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
    ),
    isLoading:boolean("isLoading", false),
}

export const large = (args) => (
	<div>
		<Avatar isLoading size="large" />
		<Avatar size="large" username="yehuozhili" />
		<Avatar
			size="large"
			username="yehuozhili"
			src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
		/>
	</div>
);

export default {
	title: "Avatar",
	component: Avatar,
	decorators: [withKnobs],
} as ComponentMeta<typeof Avatar>;
```
## Form
- 组件分析: 一般我们使用都是`<Form> </Form>`嵌套`<FormItem></FormItem>`, 每一层`formItem` 又嵌套具体的组件
- 对于 Form 组件的参数:
	- props 接受了几个基本参数, `initialValues`&`onFinish`&`onFinishFailed`,他们都会注入到一个仓库中存储起来,这个仓库的实例会通过 `context Api` 共享到所有的`formItem`中
- 对于 formItem 组建的参数:
	- props 核心的 `name` 和 `reules`, name 主要是和仓库里面的数据进行关联,reules 校验当前组件value
### 实现
### FormItem
- 对于每一个`formItem`包裹标签，其实只是做了一个转发处理,修改原有的`value`指向`form`表单的`data` 对应的`formItem name`值, 而`onchange`则是通过`name`属性修改 `form data`对应的数据
- 下面是对应的核心逻辑,修改原有标签api主要依靠,`React.cloneElement`
```ts
getContrilled = (childrenProps:React.ReactElement) =>{
    const {name} = this.props;
	const {getFieldValue, setFieldValue} = this.context;
	return {
		...childrenProps,
		value:getFieldValue(name),
		onChange:(event:React.ChangeEvent<HTMLFormElement>)=>{
			setFieldValue(name,event.target.value)
		}
	}
}
render(){
	let children = this.props.children;
	return React.cloneElement(
		children as React.ReactElement,
		this.getContrilled((children as React.ReactElement).props))
}
```
### validator
- form 校验主要依靠`async-validator`库
- 前面说过 所有的`formItem` 和 `formData`都会注入到一个仓库中，此时我们阔以拿到 `formIten`的所有`rules`以及`values`进行匹配
	-	`async-validator`针对`form`校验的,在new的时候 传入`rules`,通过调用`validate`进行对值进行校验
	-	`async-validator`写了大致的思路还不完善,仅学习用
```ts
import Schema from './async-validator';
 /*
descriptor
{
	"username": {
		"required": true,
		"min": 3
	},
	"password": {
		"required": true
	}
}
*/
/*
values
{
	"username": "11",
	"password": "22"
}
*/
new Schema(descriptor).validate(values);
```
### form.stories
- 参考代码
## Carousel
- 组件分析: 组件的左右滑动 一般来说 至少需要三个元素来站坑位(上一张 当前 下一张)
  - 显示元素(非动画): 保存三个元素的坑位[node1,node2,node3],我用hooks写的`const [state, setState] = useState<ReactNode[]>([]);`,可以说 state 是一个元祖结构,显示的时候始终显示中间(`state[1]`的元素),旁边两个用来配合动画
  - 动画部分: 动画同`显示元素`一样 用[num,num,num]元祖来控制,hooks定义的(`const [indexMap, setIndexMap] = useState<[number, number, number]>([-1,-1,-1]);`),`num` 代表 用户输入一组元素的索引,`indexMap`和`state`是一一对应的,默认为-1
  - 组件切换&&动画逻辑: 默认随便显示某一张`[null,currentNode,null] [-1,2,-1]`,随便点击,如果点击的切换的组件,会判断点击的位子和当前`currentNode`的位置进行比较,从而对`indexMap`进行更新。`indexMap[0]`永远在`currentNode`的左边,`indexMap[2]`永远在`currentNode`的右边。页面显示由始至终显示`currentNode`,动画利用`transform`,先挪动`translateX(${.width}px)` 在回到原来的位子 `transform: translateX(0);transition: all ${props.delay / 1000}s ease;`即可
- 组件显示的位子
  - `left: ${-bound?.width!}px,` 代表的了永远只显示中间的元素
```ts
<div
	style={{
		display: "flex",
		width: `${bound?.width! * 3}px`,
		position: "absolute",
		left: `${-bound?.width!}px`,
	}}
>
	{/* state[1] 永远是显示的那个元素 */}
	{state.map((v, i) => (
		<div
			key={i}
			style={{
				height: `${height!}px`,
				width: `${bound?.width}px`,
			}}
		>
			{v}
		</div>
	))}
</div>
```
- 动画的核心逻辑
```ts
const Transition = styled.div<TransitionType>`
	${(props) =>
		!props.animatein &&
		props.direction === "left" &&
		`
	  transform: translateX(${props.width}px);
	  `}
	${(props) =>
		!props.animatein &&
		props.direction === "right" &&
		`
		transform: translateX(${-props.width}px);
	
		`}
	${(props) =>
		props.animatein &&
		props.direction === "left" &&
		`
		transform: translateX(0);
			transition: all ${props.delay / 1000}s ease;
		`}
	${(props) =>
		props.animatein &&
		props.direction === "right" &&
		`
		transform: translateX(0);
		transition: all ${props.delay / 1000}s ease;
		`}
`;
useEffect(() => {
		// 动画 部分。。。。。。。。。。。
		let sign: boolean;
		if (indexMap[0] === -1 && indexMap[2] === -1) {
			//首轮
			return;
		} else if (indexMap[0] === -1) {
			sign = true;
			setAnimation({ animatein: false, direction: "right" });
		} else {
			sign = false;
			setAnimation({ animatein: false, direction: "left" });
		}
		timer = window.setTimeout(() => {
			if (sign) {
				setAnimation({ animatein: true, direction: "right" });
			} else {
				setAnimation({ animatein: true, direction: "left" });
			}
		}, delay!);
	}
	return () => window.clearTimeout(timer);
}, [delay, indexMap, children]);
```
## keepAlive
- 组件分析: 
  - 主要是将组件缓存起来
  - `KeepAliveProvider`外层包裹器和`WithKeepAlive`组件,
  - `WithKeepAlive`这个组件主要保存当前组件,关联对应的缓冲id,保存到`KeepAliveProvider`中
  - `KeepAliveProvider`,当前只有一个,看名字就知道他只是提`供缓存组件和一些操作方法`,在这里我们创建一个`useReducer`用来存取缓存组件
    - 组件显示,拿到所有缓存组件进行便利,这里有个注意的是,如果给原生组件添加了ref,那么当此真实DOM渲染到页之后会执行回调函数
```ts
<CacheContext.Provider value={{cacheStates,dispatch,mount,handleScroll}}>
	{props.children}
	{
		Object.values(cacheStates).filter(cacheState=>cacheState.status!==cacheTypes.DESTROY).map(({cacheId,element})=>(
			<div id={`cache-${cacheId}`} key={cacheId} ref={
				//如果给原生组件添加了ref,那么当此真实DOM渲染到页之后会执行回调函数
				(divDOM)=>{
					let cacheState = cacheStates[cacheId];
					//这个过程是异步的 3 2 
					if(divDOM && (!cacheState.doms)){
						let doms = Array.from(divDOM.childNodes);
						dispatch({type:cacheTypes.CREATED,payload:{cacheId,doms}});
					}
				}
			//divDOM儿子们就是这个reactElement渲染出来的真实DOM
			}>{element}</div>
		))
	}
</CacheContext.Provider>
```