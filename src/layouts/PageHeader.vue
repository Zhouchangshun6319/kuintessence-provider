<template>
	<div class="page-header-content">
		<div class="page-header-title cursor-pointer glass-card glass-card-header" @click="tohome">
			<img class="page-header-title-logo" src="../assets/images/logo.png" />
		</div>

		<div class="page-header-routers">
			<div class="page-header-tab glass-card glass-card-header">
				<div
					v-for="tab in headerTabStore.tabs.filter((tab) => tab.type == TabEnum.tab)"
					:key="tab.path"
					class="page-header-tab-router"
					:class="{
						active: headerTabStore.currentTab && headerTabStore.currentTab.path == tab.path,
					}"
					v-click-ripple="{
						disabled: isDisabled(tab.name),
						call: () => {
							toPage(tab.path);
						},
					}"
					@click="clickTab(tab, $event)"
				>
					<q-icon :name="tab.icon" class="page-header-tab-icon" />
					<span>{{ tab.label }}</span>
					<q-icon name="bi-three-dots" class="page-header-tab-more" v-if="tab.child && tab.child.length" @click.stop="">
						<q-menu auto-close transition-show="jump-down" transition-hide="jump-up">
							<div class="menu-div">
								<q-list>
									<q-item
										clickable
										v-for="(ctab, index) in tab.child"
										:key="index"
										v-click-ripple="{
											disabled: isDisabled(ctab.name),
											call: () => {
												toPage(ctab.path);
											},
										}"
										@click.stop="clickTab(ctab, $event)"
									>
										<q-item-section avatar v-if="ctab.icon">
											<q-icon :name="ctab.icon"></q-icon>
										</q-item-section>
										<q-item-section>
											{{ ctab.label }}
										</q-item-section>
									</q-item>
								</q-list>
							</div>
						</q-menu>
					</q-icon>
				</div>
			</div>
			<div class="page-header-menu-box">
				<div class="page-header-menu">
					<div
						v-for="menu in headerTabStore.tabs.filter((menu) => menu.type == TabEnum.menu)"
						:key="menu.path"
						class="page-header-menu-router glass-card glass-card-header"
						:class="{
							active: headerTabStore.currentTab && headerTabStore.currentTab.path == menu.path,
						}"
						v-click-ripple="{
							disabled: isDisabled(menu.name),
							call: () => {
								toPage(menu.path);
							},
						}"
						@click="clickTab(menu, $event)"
					>
						<q-tooltip v-if="menu.icon">{{ menu.label }}</q-tooltip>
						<q-icon :name="menu.icon" class="page-header-menu-icon" v-if="menu.icon"> </q-icon>
						<span v-else>{{ menu.label }}</span>
						<q-menu touch-position context-menu>
							<q-list>
								<q-item clickable v-close-popup @click="openMenu(menu)">
									<q-item-section side>
										<q-icon size="xs" name="open_in_new" />
									</q-item-section>
									<q-item-section>在新页签打开</q-item-section>
								</q-item>
								<q-item clickable v-close-popup @click="delMenu(menu)">
									<q-item-section side>
										<q-icon size="xs" name="close" />
									</q-item-section>
									<q-item-section>关闭标签页</q-item-section>
								</q-item>
							</q-list>
						</q-menu>
					</div>
				</div>
			</div>
		</div>
		<div class="page-header-btns glass-card glass-card-header">
			<q-icon
				v-for="(btn, index) in headerTabStore.tabs.filter((btn) => btn.type == TabEnum.rbtn)"
				:key="index"
				class="page-header-icon"
				:class="{
					active: headerTabStore.currentTab && headerTabStore.currentTab.path == btn.path,
				}"
				:name="btn.icon"
				v-click-ripple="{
					disabled: isDisabled(btn.name),
					call: () => {
						toPage(btn.path);
					},
				}"
				@click="clickTab(btn, $event)"
			>
				<q-tooltip>{{ btn.label }}</q-tooltip>
			</q-icon>
			<div class="user-div">
				<span class="text">{{ authStore.providerName }}-{{ authStore.userName }}</span>
				<q-menu auto-close transition-show="jump-down" transition-hide="jump-up">
					<div class="menu-div">
						<div class="account-div">
							<q-icon class="account-icon" name="account_box"></q-icon>
							<span class="account-text">{{ authStore.providerName }}-{{ authStore.userName }}</span>
						</div>
						<q-list>
							<q-item clickable v-for="(item, index) in userMenus" :key="index" @click="clickAccountMenu(item.key)">
								<q-item-section>{{ item.label }}</q-item-section>
							</q-item>
						</q-list>
					</div>
				</q-menu>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent } from 'vue';

import { useRoute, useRouter } from 'vue-router';
import { useHeaderTabStore, TabEnum, TabInterface } from '../stores/header-tab';
import { useAuthStore } from '../stores/auth';
import { $mgr } from 'src/boot/oidc';
export default defineComponent({
	name: 'PageHeader',
	setup() {
		const router = useRouter();

		//用户信息
		const authStore = useAuthStore();
		//user菜单切换
		let user_menu_show = ref(false);
		const userMenus = reactive([
			//   { label: '账号管理', icon: 'ion-person', key: 'account' },
			{ label: '退出登录', icon: 'ion-log-out', key: 'logout' },
		]);

		//主菜单操作
		function delMenu(menu: TabInterface) {
			headerTabStore.delMenu(menu.path);
			let lastTab = headerTabStore.getLastTab();
			if (lastTab?.path == menu.path) {
				router.back();
			}
		}
		function openMenu(menu: TabInterface) {
			window.open(`/#${menu.path}`);
		}
		let headerTabStore = useHeaderTabStore();

		function clickTab(tab: TabInterface) {
			headerTabStore.changeTab(tab.path);
		}
		const route = useRoute();
		function isDisabled(name: string) {
			let is = () => {
				if (route.name == name) return true;
				else return false;
			};
			return is;
		}
		function toPage(path: string) {
			if (!path) return;
			router.push(path);
		}

		//按钮控制
		function tohome() {}
		function toControl() {
			alert('跳转到算力提供者平台或算力运营者平台');
		}

		const clickAccountMenu = (key: string) => {
			switch (key) {
				case 'account':
					router.push('/user');
					break;
				case 'logout':
					return $mgr.signOut();
				default:
			}
		};

		return {
			authStore,
			headerTabStore,
			TabEnum,
			user_menu_show,
			userMenus,
			clickTab,
			tohome,
			toControl,
			clickAccountMenu,
			delMenu,
			openMenu,
			toPage,
			isDisabled,
		};
	},
});
</script>

<style lang="scss" scoped>
.glass-card-header {
	border-radius: 25px;
	padding: 10px 20px;
	transition: all 0.5s;
	&:hover {
		transform: scale(1.1);
	}
}

.page-header-content {
	display: flex;
	flex-direction: row;
	height: $header-height;
	padding: 15px 5vw;
	color: #000;
}
.page-header-title {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	margin-right: 20px;
	.page-header-title-logo {
		width: 160px;
		height: 30px;
	}
	.page-header-title-text {
		font-size: 23px;
		font-weight: 500;
		font-family: STZhongsong;
		color: #154791;
	}
}
.page-header-routers {
	flex: 1;
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	min-width: 420px;
}
.page-header-tab {
	display: inline-flex;
	height: 100%;
	text-align: center;
	justify-content: center;
	align-items: center;
	min-width: 250px;
	.page-header-tab-router {
		height: 100%;
		cursor: pointer;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #000;
		text-decoration: none;
		position: relative;
		&:not(:last-child) {
			margin-right: 15px;
		}

		.page-header-tab-more,
		.page-header-tab-icon {
			display: inline-block;
			color: #636363;
			width: 0;
			opacity: 0;
			transition: all 0.3s;
		}

		&.active {
			font-weight: bold;
			color: #000;
			font-size: 15px;
			.page-header-tab-icon {
				width: auto;
				opacity: 1;
				margin-right: 8px;
			}
		}

		&:hover {
			.page-header-tab-more {
				width: auto;
				opacity: 1;
				margin-left: 8px;
			}
		}
	}
}
.page-header-menu-box {
	margin-right: 20px;
	margin-left: 20px;
}
.page-header-menu {
	display: inline-flex;
	height: 100%;
	text-align: center;
	justify-content: center;
	align-items: center;
	.page-header-menu-router {
		height: 100%;
		cursor: pointer;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		position: relative;
		&:not(:last-child) {
			margin-right: 15px;
		}
		.page-header-menu-icon {
			font-size: 20px;
			color: #636363;
		}
		&.active .page-header-menu-icon {
			font-size: 23px;
			color: #000;
		}
	}
}
.page-header-btns {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	.page-header-icon {
		color: #636363;
		font-size: 20px;
		margin-right: 10px;
		cursor: pointer;
		&.active {
			font-size: 23px;
			color: #000;
		}
	}
}
.user-div {
	cursor: pointer;
}
.account-div {
	display: flex;
	align-items: center;
	border-bottom: 1px solid #eee;
	padding: 5px 10px;
	padding-left: 7px;
	.account-icon {
		font-size: 40px;
		margin-right: 3px;
	}
}
.menu-div {
	border-radius: 16px;
	width: 200px;
}
</style>
