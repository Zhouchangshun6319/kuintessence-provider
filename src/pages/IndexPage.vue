<template>
	<div class="q-pb-md q-px-md card-container">
		<!-- 个人信息 -->
		<q-card class="card card-full card-user glass-card">
			<q-card-section class="row full-height items-center">
				<q-item class="user-info card-hover">
					<q-item-section top avatar>
						<q-avatar color="primary" text-color="white" size="118px" font-size="52px" icon="bi-person"> </q-avatar>
					</q-item-section>
					<q-item-section class="q-pl-md">
						<q-item-label class="text-h5 q-pb-sm">欢迎 {{ useStore.userName }}</q-item-label>
						<q-item-label class="q-pb-xs" v-if="useStore.isAdmin">权限：超级管理员</q-item-label>
						<q-item-label class="q-pb-xs" v-else>权限：管理员</q-item-label>
						<q-item-label>时间：{{ date.formatDate(Date.now(), 'YYYY-MM-DD HH:MM') }}</q-item-label>
					</q-item-section>
				</q-item>
			</q-card-section>
		</q-card>
		<div class="empty-card" v-for="i in 10" :key="i"></div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';
import { date } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
export default defineComponent({
	name: 'PanelPage',
	setup() {
		const useStore = useAuthStore();
		const router = useRouter();
		function toPage() {
			router.push('/message');
		}
		return {
			date,
			toPage,
			useStore,
		};
	},
});
</script>

<style lang="scss" scoped>
.card-container {
	min-width: 920px;
	max-width: 1620px;
	margin: 0 auto;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
}
.card-hover {
	border-radius: 16px;
	&:hover {
		background-color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
	}
}
.card {
	margin-bottom: 20px;
	margin-right: 20px;
}
.empty-card {
	min-width: 450px;
	max-width: 800px;
	height: 0;
	margin-right: 20px;
	visibility: hidden;
}
.card-half {
	min-width: 450px;
	max-width: 800px;
	height: 250px;
	display: flex;
	flex-direction: column;
	.card-title {
		text-align: center;
		padding: 10px;
	}
	.card-content {
		flex: 1;
		padding: 10px;
	}
}
.card-full {
	width: 920px;
	min-height: 250px;
}
.card-map {
	border-radius: 16px;
	overflow: hidden;
}
.card-user {
	.user-info {
		width: 386px;
		height: 160px;
		padding: 16px;
		transition: background 0.3s ease-in-out;
	}
	.content {
		width: 140px;
		height: 160px;
		padding: 16px;
		transition: background 0.3s ease-in-out;
		.circle {
			width: 60px;
			height: 60px;
			line-height: 60px;
			margin-left: auto;
			margin-right: auto;
			margin-bottom: 16px;
			border-radius: 50%;
			color: white;
		}
	}
}
.main-content {
	overflow: auto;
}
</style>
