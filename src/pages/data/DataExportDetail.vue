<template>
	<div class="table-content">
		<q-card square flat>
			<q-card-section class="q-py-sm">
				<div class="row" style="height: 40px; line-height: 40px">
					<q-btn class="q-pl-sm" icon="keyboard_arrow_left" @click="goBack">返回</q-btn>
				</div>
			</q-card-section>
		</q-card>
		<div class="info">
			<div class="info-content">
				<q-stepper class="step-container" v-model="stepValue" :keep-alive="true" ref="stepper" color="primary" animated flat :header-nav="allDone">
					<q-step :name="step.name" :title="step.title" :prefix="i + 1" :done="step.done" done-color="green" :color="step.done ? 'green' : ''" v-for="(step, i) in steps" :key="step.name">
						<div class="component-container">
							<component :is="step.component" @prev="prevStep" @next="nextStep" @submit="goBack" :info="info"></component>
						</div>
					</q-step>
				</q-stepper>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import EImport from '../../components/manage/data-export/EImport.vue';
import ETransfer from '../../components/manage/data-export/ETransfer.vue';
import EExport from '../../components/manage/data-export/EExport.vue';
import { DataExportService } from '../../service/data-export';
export default defineComponent({
	props: {
		params: {
			type: Object,
		},
	},
	components: { EExport, ETransfer, EImport },
	setup() {
		const router = useRouter();
		const route = useRoute();
		const id = route.params.id;
		const info: any = ref({});
		async function getInfo() {
			let res = await DataExportService.getDetail(id.toString());
			info.value = res;
		}
		getInfo();
		function goBack() {
			router.back();
		}

		const stepValue = ref('export');
		const steps = reactive([
			{
				name: 'export',
				title: '数据导出',
				done: info.value.state >= 1,
				component: 'EExport',
			},
			{
				name: 'transfer',
				title: '数据运输',
				done: info.value.state >= 2,
				component: 'ETransfer',
			},
			{
				name: 'import',
				title: '数据导入',
				done: info.value.state >= 3,
				component: 'EImport',
			},
		]);

		const allDone = computed(() => {
			for (let index = 0; index < steps.length; index++) {
				const step = steps[index];
				if (!step.done) return false;
			}
			return true;
		});
		function prevStep(stepName: string) {
			let cIndex = steps.findIndex((_s: any) => _s.name == stepName);
			if (cIndex != -1) {
				let _prevStep = steps[cIndex - 1];
				if (_prevStep) {
					stepValue.value = _prevStep.name;
				}
			}
		}
		function nextStep(stepName: string) {
			let cIndex = steps.findIndex((_s: any) => _s.name == stepName);
			if (cIndex != -1) {
				steps[cIndex].done = true;
				let _nextStep = steps[cIndex + 1];
				if (_nextStep) {
					stepValue.value = _nextStep.name;
				}
			}
		}
		const autoNext = ref(false);
		return {
			info,
			goBack,
			stepValue,
			steps,
			prevStep,
			nextStep,
			allDone,
			autoNext,
		};
	},
});
</script>

<style lang="scss" scoped>
.table-content {
	height: 100%;
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	.top {
		height: 50px;
		box-shadow: 0px 15px 15px -15px $border-dark-color;
	}
	.info {
		flex: 1;
		padding: 16px;
		overflow: auto;
	}
}
.table-btns {
	display: flex;
	height: 100%;
	padding: 5px 10px;
}
.info-content {
	background-color: rgba(255, 255, 255, 0.5);
	padding: 20px;
	height: 100%;
	border-radius: 16px;
	position: relative;

	.step-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	:deep(.q-stepper__header) {
		padding: 0 100px;
		.q-stepper__tab {
			min-height: auto;
		}
	}
	:deep(.q-stepper__content) {
		flex: 1;
		.q-stepper__step-content {
			width: 100%;
			height: 100%;
		}
		.q-stepper__step-inner {
			padding: 0;
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			.component-container {
				flex: 1;
				.component-inner {
					width: 100%;
					height: 100%;
					display: flex;
					flex-direction: column;
					.component-info {
						flex: 1;
					}
					.component-btns {
						display: flex;
						justify-content: space-between;
					}
				}
			}
		}
	}
}
.q-card,
.q-stepper {
	background: transparent;
}
</style>
