import { Directive } from 'vue';

const rippleCss = require('./ripple.css');

export const clickRipple: { name: string; directive: Directive } = {
	name: 'click-ripple',
	directive: {
		mounted(el, binding) {
			el.onclick = (event: PointerEvent) => {
				const disabled = binding.value?.disabled;
				if (disabled && disabled()) return;
				const call = binding.value?.call;

				//上个动画还没完成先删除上个动画
				const lastClickRippleDiv = document.getElementById('ClickRippleDiv');
				if (lastClickRippleDiv) lastClickRippleDiv.remove();

				//创建节点
				const ClickRippleDiv = document.createElement('div');
				const css = document.createElement('style');

				//2s内如果没完成动画视为动画监听结束错误，直接去掉动画
				const timer = setTimeout(() => {
					document.removeEventListener('animationend', animateEnd);
					call && call();
					ClickRippleDiv.remove();
					css.remove();
				}, 2000);

				//监听动画结束：跳转路由
				const animateEnd = (e: { target: any; animationName: string }) => {
					clearTimeout(timer);
					if (e?.target?.id === 'ClickRippleDiv') {
						//第一阶段动画完成，跳转路由
						if (e.animationName == 'animate1') {
							ClickRippleDiv.className = 'click-ripple-div animate2';
							call && call();
						} else {
							//整个动画完成，去掉动画
							ClickRippleDiv.remove();
							css.remove();
							document.removeEventListener('animationend', animateEnd);
						}
					}
				};
				document.removeEventListener('animationend', animateEnd);
				document.addEventListener('animationend', animateEnd);

				//根据勾股定理，计算出能覆盖屏幕的圆的直径
				const clientX = event.clientX;
				const clientY = event.clientY;
				const width = clientX < window.innerWidth / 2 ? window.innerWidth - clientX : clientX;
				const height = clientY < window.innerHeight / 2 ? window.innerHeight - clientY : clientY;
				const clickRippleRadius = parseInt(String(Math.sqrt(width * width + height * height) * 2));
				//添加css
				document.documentElement.style.setProperty('--click-ripple-radius', `${clickRippleRadius}px`);
				css.innerHTML = rippleCss;
				document.body.appendChild(css);

				//赋值动画位置,开始动画
				ClickRippleDiv.setAttribute('id', 'ClickRippleDiv');
				ClickRippleDiv.className = 'click-ripple-div animate1';
				ClickRippleDiv.style.left = `${clientX}px`;
				ClickRippleDiv.style.top = `${clientY}px`;
				document.body.appendChild(ClickRippleDiv);
			};
		},
	},
};
