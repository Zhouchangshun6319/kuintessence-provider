<template>
	<q-layout view="hhh lpr fff" class="main-layout">
		<q-header class="page-header">
			<page-header />
		</q-header>
		<q-page-container class="page-container">
			<router-view v-slot="{ Component }">
				<keep-alive>
					<component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
				</keep-alive>
				<component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive" />
			</router-view>
		</q-page-container>
	</q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageHeader from './PageHeader.vue';
import { useHeaderTabStore, TabInterface, TabEnum } from '../stores/header-tab';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
export default defineComponent({
	name: 'MainLayout',
	components: { PageHeader },
	setup() {
		//监听菜单切换
		const headerTabStore = useHeaderTabStore();
		const route = useRoute();
		function changeCurrentName(route: any) {
			if (route.meta.isMenu) {
				let menu: TabInterface = {
					type: TabEnum.menu,
					name: route.name,
					path: route.path,
					label: route.meta.title || '',
					icon: route.meta.icon || '',
				};
				headerTabStore.addMenu(menu);
			}
			headerTabStore.changeTab(route.path);
		}
		onBeforeRouteUpdate((to: any) => {
			changeCurrentName(to);
		});
		changeCurrentName(route);
		return {};
	},
});
</script>
<style lang="scss">
.main-layout {
	background-image: url(../../public/img/background.webp);
	background-position: center center;
	background-attachment: fixed;
	background-repeat: no-repeat;
	background-size: cover;
}
.page-header {
	background: transparent;
}
.page-container {
	height: 100vh;
	padding-left: 20px;
	padding-right: 20px;
	padding-bottom: 20px;
	overflow: auto;
}
</style>
