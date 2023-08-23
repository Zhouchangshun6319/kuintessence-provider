<template>
	<div class="q-px-md">
		<!-- 顶栏 -->
		<q-card square flat>
			<q-card-section class="q-py-sm">
				<div class="row" style="height: 40px; line-height: 40px">
					<q-input rounded outlined dense debounce="300" v-model="filter" placeholder="搜索存储空间" style="width: 200px">
						<template v-slot:append>
							<q-icon name="search" />
						</template>
					</q-input>
					<q-space />
					<q-select dense filled v-model="text" :options="['全部', '济南超算']" class="q-mr-md" style="width: 200px">
						<template v-slot:prepend>
							<span style="font-size: 14px">区域</span>
						</template>
					</q-select>
					<q-select dense filled v-model="text" :options="['全部', '集群A', '集群B']" style="width: 200px">
						<template v-slot:prepend>
							<span style="font-size: 14px">可用集群</span>
						</template>
					</q-select>
				</div>
			</q-card-section>
		</q-card>
		<!-- 进度条 -->
		<q-scroll-area class="q-mt-sm" style="height: calc(100vh - 114px)">
			<div class="row q-mt-sm">
				<q-chip size="xs" color="primary" label=" " class="q-mr-sm" /> 系统占用：{{ storageUsage.system.toFixed(2) }}G
				<q-chip size="xs" color="positive" label=" " class="q-ml-md q-mr-sm" /> 用户使用：{{ storageUsage.user.toFixed(2) }}G
				<q-chip size="xs" color="indigo-1" label=" " class="q-ml-md q-mr-sm" /> 剩余可用：{{ (storageUsage.all - storageUsage.system - storageUsage.user).toFixed(2) }}G
			</div>
			<div class="q-mt-sm bg-indigo-1 row q-mb-md" style="height: 40px; border-radius: 4px">
				<div
					class="bg-primary"
					:style="{
						width: String((storageUsage.system / storageUsage.all) * 100) + '%',
						height: '40px',
						'border-radius': '4px 0 0 4px',
					}"
				/>
				<div
					class="bg-positive"
					:style="{
						width: String((storageUsage.user / storageUsage.all) * 100) + '%',
						height: '40px',
						'border-radius': '0 4px 4px 0',
					}"
				/>
			</div>
			<!-- 内容 -->
			<q-card square flat class="bg-white q-mb-sm" style="width: calc(100vw - 252px)" v-for="i in 10" :key="i">
				<q-card-section>
					<div class="row items-center no-wrap cursor-pointer" @click="expanded[i - 1] = typeof expanded[i - 1] === 'undefined' ? true : !expanded[i - 1]">
						<div class="col">
							<div class="text-h6 ellipsis">用户名称（32.6G）</div>
						</div>
						<div class="col-auto">
							<q-btn color="grey" round flat :icon="typeof expanded[i - 1] === 'undefined' ? 'keyboard_arrow_down' : expanded[i - 1] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" />
						</div>
					</div>
					<q-slide-transition>
						<div v-show="expanded[i - 1]" class="full-width q-pt-md">
							<div class="row q-pb-md" v-for="i in 10" :key="i">
								<div class="col">
									<span class="text-body1 text-weight-medium q-pr-md">文件名称</span>
									<span class="text-body2 ellipsis">TEST.txt</span>
								</div>
								<div class="col">
									<span class="text-body1 text-weight-medium q-px-md">开始时间</span>
									<span class="text-body2 ellipsis">2022/6/23 11:11</span>
								</div>
								<div class="col">
									<span class="text-body1 text-weight-medium q-px-md">文件大小</span>
									<span class="text-body2 ellipsis">16.85GB</span>
								</div>
							</div>
						</div>
					</q-slide-transition>
				</q-card-section>
			</q-card>
		</q-scroll-area>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
	setup() {
		const filter = ref('');
		const expanded: any = ref([true]);
		const text = ref('全部');
		const storageUsage = ref({
			system: 125.46,
			user: 125.46,
			all: 500,
		});

		return { filter, expanded, text, storageUsage };
	},
});
</script>

<style scoped>
.q-card {
	background: transparent;
}
</style>
