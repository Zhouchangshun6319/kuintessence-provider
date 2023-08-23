<template>
	<div class="main-content">
		<div class="left glass-card">
			<div class="blank">系统管理</div>
			<div class="tree">
				<div v-for="_node in treeNode" class="tree-c tree-1" :key="_node.name">
					<div class="text" :class="{ active: _node.name == componentId }" v-click-ripple="{ disabled: isDisabled(_node.name), call: toPage }" @click="changeNode(_node)">
						<q-icon :name="_node.icon" size="24px" class="q-ml-md q-mr-xs" style="margin-bottom: 2px" v-if="_node.icon" />
						{{ _node.label }}
					</div>
				</div>
			</div>
		</div>
		<div class="right glass-card">
			<router-view v-slot="{ Component }">
				<keep-alive>
					<component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
				</keep-alive>
				<component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive" />
			</router-view>
		</div>
	</div>
</template>

<script>
import { ref, defineComponent, onActivated } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
	setup() {
		const treeNode = [
			{
				label: '成员管理',
				name: 'OrgList',
			},
		];

		//理由相关
		const router = useRouter();
		const route = useRoute();

		//动态组件
		const componentId = ref('OrgList');
		function changeNode(node) {
			componentId.value = node.name;
		}

		onActivated(() => {
			componentId.value = route.name;
		});

		function toPage() {
			router.push({ name: componentId.value });
		}
		function isDisabled(name) {
			let is = () => {
				if (route.name == name) return true;
				else return false;
			};
			return is;
		}
		return {
			treeNode,
			componentId,
			changeNode,
			isDisabled,
			toPage,
		};
	},
});
</script>

<style lang="scss" scoped>
.main-content {
	display: flex;
	flex-direction: row;
	height: 100%;

	.left {
		margin-right: 20px;
		.blank {
			padding: 20px;
			font-size: 20px;
		}
	}

	.right {
		flex: 1;
		overflow: hidden;
	}
}

.tree {
	width: 220px;
	.tree-c {
		.text {
			cursor: pointer;
			color: $font-color;
			line-height: 50px;

			&:hover:not(.active) {
				background: $bg-dark-color;
			}
		}
	}

	.tree-1 {
		.text {
			padding: 0 30px;

			&.active {
				background: #fff;
				color: #2a82e4;
			}
		}
	}

	.tree-2 {
		.text {
			padding: 0 10px;
			padding-left: 30px;

			&.active {
				background: $primary-light-color;
				color: $primary-color;
			}
		}
	}
}
</style>
