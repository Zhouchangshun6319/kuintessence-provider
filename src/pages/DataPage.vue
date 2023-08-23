<template>
	<div class="main-content">
		<div class="left glass-card">
			<!-- <div class="blank"></div> -->
			<div class="tree">
				<div v-for="_node in treeNode" class="tree-c tree-1" :key="_node.name">
					<div class="text" :class="{ active: _node.name == componentId }" v-click-ripple="{ disabled: isDisabled(_node.name), call: toPage }" @click="changeNode(_node)">
						<q-icon :name="_node.icon" size="24px" class="q-ml-md q-mr-xs" style="margin-bottom: 2px" />
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

<script lang="ts">
import { ref, defineComponent, onActivated } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
	setup() {
		const treeNode: any = [
			{
				label: '数据导出',
				name: 'DataExport',
				childNames: ['DataExportDetail'],
				icon: 'widgets',
			},
			{
				label: '数据导入',
				name: 'DataImport',
				childNames: ['DataImportDetail'],
				icon: 'inbox',
			},
			{
				label: '数据传输',
				name: 'DataTransfer',
				icon: 'move_to_inbox',
			},
			{
				label: '存储空间',
				name: 'StorageSpace',
				icon: 'construction',
			},
		];

		//理由相关
		const router = useRouter();
		const route = useRoute();

		//动态组件
		const componentId: any = ref('DataExport');
		function changeNode(node: any) {
			componentId.value = node.name;
		}

		onActivated(() => {
			componentId.value = route.name;
		});

		function toPage() {
			router.push({ name: componentId.value });
		}
		function isDisabled(name: string) {
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
			height: 40px;
		}
	}

	.right {
		flex: 1;
		overflow: hidden;
	}
}

.tree {
	width: 220px;
	padding: 20px 0;
	.tree-c {
		padding-top: 8px;

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
			padding: 0 10px;

			&.active {
				color: #ff5722;
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
