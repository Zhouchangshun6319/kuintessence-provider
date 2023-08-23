<template>
	<q-popup-proxy>
		<q-card class="popup-card">
			<q-card-section>
				<q-icon :name="icon" color="warning" size="24px" class="q-pr-xs fix-icon" />
				{{ label }}
			</q-card-section>
			<q-card-section align="right" class="q-pt-none">
				<q-btn dense color="white" text-color="black" label="取消" v-close-popup padding="xs sm" class="q-mr-sm" @click="onCancel" />
				<q-btn dense color="primary" label="确定" v-close-popup padding="xs sm" @click="onOk" />
			</q-card-section>
		</q-card>
	</q-popup-proxy>
</template>

<script lang="ts" setup>
defineProps({
	icon: {
		type: String,
	},
	label: {
		type: String,
	},
});
const emit = defineEmits(['onOk', 'onCancel']);

const onOk = () => {
	emit('onOk');
};

const onCancel = () => {
	emit('onCancel');
};
</script>

<style scoped>
.popup-card {
	min-width: 200px;
}
.fix-icon {
	margin-top: -2.91px;
}
</style>
