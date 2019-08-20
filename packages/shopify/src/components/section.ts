import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { style } from '../functions/style';
import { blockToLiquid } from '../functions/block-to-liquid';

export const Section = (block: BuilderElement, renderOptions: Options) => {
  const { options } = block.component!;

  return `
    <div style="${style({
      height: '100%',
      width: '100%',
      alignSelf: 'stretch',
      flexGrow: '1',
      boxSizing: 'border-box',
      maxWidth: (options.maxWidth || 1200) + 'px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      marginLeft: 'auto',
      marginRight: 'auto',
    })}">
      ${block.children && block.children.map(child => blockToLiquid(child, renderOptions))}
    </div>
  `;
};
