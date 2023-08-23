import { LocalStorage } from 'quasar';
import { $mgr } from './oidc';
import { useAuthStore } from 'src/stores/auth';

export default async () => {
	//获取用户信息,判断登录
	if (LocalStorage.getItem('token') && (LocalStorage.getItem('expires_at') ? (LocalStorage.getItem('expires_at') as number) : 0) > Math.round(new Date().getTime() / 1000)) {
		const authStore = useAuthStore();
		await authStore.setUser();
		await $mgr.signInSilent();
		//如果不是管理员，跳走
		if (!(authStore.isAdmin || authStore.isManager)) {
			window.alert('没有管理权限');
			return $mgr.signOut();
		}
		if (!authStore.enabled) {
			window.alert('账号已被禁用');
			return $mgr.signOut();
		}
		if (!authStore.providerId) {
			window.alert('没有提供者数据');
		}
	} else {
		const hash = window.location.hash;
		if (!hash.includes('#/oidc/')) {
			return $mgr.signIn();
		}
	}
};
