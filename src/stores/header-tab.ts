import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

export enum TabEnum {
	tab = 'tab',
	menu = 'menu',
	rbtn = 'right-btn',
	router = 'router',
}
export interface TabInterface {
	type: TabEnum;
	name: string;
	path: string;
	label: string;
	icon?: string;
	child?: Array<TabInterface>;
}
export interface CurrentTabInterface extends TabInterface {
	activeChildTab?: TabInterface;
}

function initTabs() {
	const tabs: TabInterface[] = [
		{
			name: 'IndexPage',
			path: '/index',
			label: '仪表盘',
			type: TabEnum.tab,
			icon: 'dashboard',
		},
		{
			name: 'ClusterPage',
			path: '/cluster/queue-list',
			label: '集群',
			type: TabEnum.tab,
			icon: 'computer',
		},

		{
			name: 'WorkflowPage',
			path: '/workflow/running-instance',
			label: '作业',
			type: TabEnum.tab,
			icon: 'schedule',
			child: [
				{
					type: TabEnum.tab,
					name: 'RunningInstance',
					path: '/workflow/running-instance',
					label: '实时作业',
				},
				{
					type: TabEnum.tab,
					name: 'HistoryInstance',
					path: '/workflow/history-instance',
					label: '历史作业',
				},
			],
		},

		// {
		// 	name: 'MessagePage',
		// 	path: '/message',
		// 	label: '消息',
		// 	type: TabEnum.rbtn,
		// 	icon: 'message'
		// }
	];


	return tabs;
}
export const useHeaderTabStore = defineStore('headerTabStore', {
	state: () => ({
		tabs: initTabs(),
		currentTab: <CurrentTabInterface>initTabs()[0],
	}),
	actions: {
		changeTab(_tabpath: string) {
			const lastTab = this.getLastTab();
			if (lastTab?.path == _tabpath) return false;
			let currentTab: CurrentTabInterface | null = null;
			const find = (tab: TabInterface, parentTab?: CurrentTabInterface) => {
				if (tab.path == _tabpath) {
					if (parentTab) {
						currentTab = {
							...parentTab,
							activeChildTab: tab,
						};
					} else {
						currentTab = { ...tab };
					}
				} else {
					tab.child?.forEach((ctab) => {
						let _parentTab: CurrentTabInterface;
						if (parentTab) {
							_parentTab = {
								...parentTab,
								activeChildTab: tab,
							};
						} else {
							_parentTab = tab;
						}
						find(ctab, _parentTab);
					});
				}
			};
			this.tabs.forEach((tab) => {
				find(tab);
			});
			if (!currentTab) {
				return false;
			}
			this.currentTab = currentTab;
			return true;
		},
		getLastTab(): CurrentTabInterface | null {
			if (!this.currentTab) return null;
			let lastTab: CurrentTabInterface | null = null;
			const gettab = (tab: CurrentTabInterface) => {
				if (tab.activeChildTab) {
					gettab(tab.activeChildTab);
				} else {
					lastTab = tab;
				}
			};
			gettab(this.currentTab);
			return lastTab;
		},
		addMenu(menu: TabInterface) {
			const _menu: any = this.tabs.find((_t: TabInterface) => _t.path == menu.path);
			!_menu && this.tabs.push(menu);
		},
		delMenu(_menupath: string) {
			const _menuIndex: number = this.tabs.findIndex((_t: TabInterface) => _t.path == _menupath);
			if (_menuIndex != -1) this.tabs.splice(_menuIndex, 1);
		},
	},
});
