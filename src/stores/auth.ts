import { defineStore } from 'pinia';
import { mgr } from 'src/boot/oidc';
import { UserService } from 'src/service/user';

//超管角色
export enum ROLES {
	admin = 2,
	manager = 1,
	user = 0,
}

export const useAuthStore = defineStore('authStore', {
	state: () => ({
		userId: '',
		userName: '',
		token: '',
		lastName: '',
		firstName: '',
		email: '',
		authTime: +new Date(),

		nickName: '',
		userLogo: '',
		userPhone: '',

		displayName: '',

		//权限
		isAdmin: false, //超级管理员
		isManager: false, //普通管理员

		//提供者
		providerId: '',
		providerName: '',
		//账号状态
		enabled: false,
		//可管理集群
		manageClusters: { regions: [], zones: [], clusters: [], queues: [] },
		useClusters: { regions: [], zones: [], clusters: [], queues: [] },
	}),
	actions: {
		// 获取用户信息
		async setUser() {
			const oidcUser = await mgr.getUser();

			const profile = oidcUser?.profile;
			//默认字段，不允许修改
			this.token = oidcUser?.access_token || '';
			this.userId = profile?.sub || '';
			this.userName = profile?.preferred_username || '';
			this.email = profile?.email || '';
			this.authTime = profile?.auth_time ? profile.auth_time : +new Date();

			//自定义字段允许修改
			const userInfo = await UserService.getOidcUserInfo();
			this.lastName = userInfo?.lastName || '';
			this.firstName = userInfo?.firstName || '';
			this.nickName = userInfo.attributes.nickName || '';
			this.userLogo = userInfo.attributes.userLogo;
			this.userPhone = userInfo.attributes.userPhone;

			//显示名称
			this.displayName = this.nickName || `${this.lastName}${this.firstName}` || this.userName || '';

			//获取提供者
			const provider = await UserService.getProvider(this.userId);
			this.providerId = provider?.provider_list?.id;
			this.providerName = provider?.provider_list?.name;
			this.isAdmin = provider?.role == ROLES.admin;
			this.isManager = provider?.role == ROLES.manager;
			this.enabled = provider?.enabled || false;
			this.manageClusters = provider?.manage_cluster;
			this.useClusters = provider?.use_cluster;

			console.log('超管：', this.isAdmin);
			console.log('管理员：', this.isManager);
		},
	},
});
