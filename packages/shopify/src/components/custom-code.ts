import { component } from '../constants/components';

export const CustomCode = component({
  name: 'Custom Code',
  component: block => {
    const { options } = block.component!;

    return `
      <div class="builder-custom-code">\n${options.code || ''}\n</div>
    `;
  },
});
