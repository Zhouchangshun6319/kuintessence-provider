<template>
	<div class="column" style="height: 100%">
		<!-- 顶栏 -->
		<q-card square flat>
			<q-card-section class="q-py-sm">
				<div class="row" style="height: 40px; line-height: 40px">
					<q-input rounded outlined dense debounce="300" v-model="filter" placeholder="搜索数据传输" style="width: 200px">
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
		<!-- 内容 -->
		<q-scroll-area class="q-mt-sm" style="flex: 1; padding: 0 20px">
			<q-card square flat class="glass-card-block q-mb-sm" v-for="i in 10" :key="i">
				<q-card-section>
					<div class="row items-center no-wrap cursor-pointer" @click="expanded[i - 1] = typeof expanded[i - 1] === 'undefined' ? true : !expanded[i - 1]">
						<div class="col">
							<div class="text-h6 ellipsis"><q-chip dense square color="negative" text-color="white" label="紧急" /> 文件名称</div>
							<div class="text-subtitle2 q-pt-sm ellipsis"><span class="text-primary">用户</span> 于 <span class="text-primary">2022-01-11 12:20</span> 申请</div>
						</div>
						<div class="col-auto">
							<q-btn color="grey" round flat :icon="typeof expanded[i - 1] === 'undefined' ? 'keyboard_arrow_down' : expanded[i - 1] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" />
						</div>
					</div>
					<q-slide-transition>
						<div v-show="expanded[i - 1]">
							<div class="row q-pt-md">
								<div class="col-auto text-body1 text-weight-medium q-pr-md">文件描述</div>
								<div class="col text-body1 ellipsis-2-lines">
									下面我们会从不同维度来分析一下APP的社交分享功能设计，看看这里面有哪些值得探讨之处。现在很多AP...下面我们会从不同维度来分析一下APP的社交分享功能设计，看看这里面有哪些值得探讨之处。现在很多AP...
								</div>
							</div>
							<div class="row q-pt-sm">
								<div class="col-auto text-body1 text-weight-medium q-pr-md">传输方式</div>
								<div class="col text-body1 ellipsis">顺丰快递(123123123123)</div>
							</div>
						</div>
					</q-slide-transition>
				</q-card-section>
			</q-card>
		</q-scroll-area>
		<div class="page-div flex justify-center">
			<q-pagination v-model="currentPage" :max="5" input />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
	setup() {
		const filter = ref('');
		const expanded: any = ref([true]);
		const text = ref('全部');
		const currentPage = ref(1);
		return { filter, expanded, text, currentPage };
	},
});
</script>

<style scoped>
.q-card {
	background: transparent;
}
</style>
