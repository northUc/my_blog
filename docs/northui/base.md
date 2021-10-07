# ui
[[toc]]
- 利用`ts`+`react`+`storybook`
- 打包用ts `"b": "tsc -p tsconfig.json"` 他能生成对应的 ts配置文件
- 运行效果 `"storybook": "start-storybook -p 6006 -s public"`
## avatar
- 这里用的`ts`+`react`+`styled-components`写组件库,使用的时候不需要额外引入css文件,另外用ts打包同时声明文件一并打包处理好
- 利用`storybook`写我们的dome,具体的语法看下面例子或者官网
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
- decorators 这里的插件配置
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
- props 接受了几个基本参数, `initialValues`&`onFinish`&`onFinishFailed`,他们都会注入到一个仓库中存储起来,这个仓库的实例会通过 `context Api` 共享到所有的formItem中
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