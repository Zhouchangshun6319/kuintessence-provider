import { boot } from 'quasar/wrappers';
import { directives } from '../directive';
import { Directive } from 'vue';

export default boot(({ app }) => {
	directives.forEach((directive: { name: string; directive: Directive }) => {
		app.directive(directive.name, directive.directive);
	});
});
