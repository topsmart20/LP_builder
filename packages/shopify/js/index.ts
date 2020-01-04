import { Context, Liquid as LLiquid, Expression } from 'liquidjs';
import { toValue } from './utils/async';

const liquid = new LLiquid();

liquid.registerFilter('money', value => {
  const str = String(value);
  // TODO: locales
  return ('$' + str.slice(0, -2) + '.' + str.slice(-2)).replace('..', '.');
});

const tempNoopFilters = ['img_url', 't'];
for (const tempNoopFilter of tempNoopFilters) {
  liquid.registerFilter(tempNoopFilter, value => value);
}

interface State {
  [key: string]: any;
}

// Ugly temporary workaround

export default class Shopify {
  state: State;
  liquid: Liquid;

  constructor(state: State) {
    this.state = state;
    this.liquid = new Liquid(state);
  }

  toJSON() {
    return null;
  }
}

export class Liquid {
  state: State;

  constructor(state: State) {
    this.state = state;
  }

  // TODO: preparse and split out for better perf
  render(str: string, state = this.state) {
    // TODO: what if has partials or other aysnc things? may be rare...
    // TODO: separate parse and render to memoise the parsing
    // TODO: use expression and parse cache?

    // TODO: fix the toValue in liquidjs
    return liquid.parseAndRenderSync(str, state);
  }

  condition(str: string, state = this.state) {
    let useStr = str.replace(/selected_or_first_available_variant/g, 'variants[0]');
    const result = toValue(new Expression(useStr).value(new Context(state, undefined, true)));
    return result;
  }

  get(str: string, state = this.state) {
    // TODO: better solution e.g. with proxies
    let useStr = str.replace(/selected_or_first_available_variant/g, 'variants[0]');
    // TODO: warn for errors
    return liquid.evalValueSync(useStr, new Context(state, undefined, true));
    // const result = toValue(new Expression(useStr).value(new Context(state, undefined, true)));
    // return result;
  }

  // TODO: handle `t` filter at compile time in assign
  assign(str: string, state = this.state) {
    const re = /^\s*([^=\s]+)\s*=(.*)/;
    let useStr = str.replace(/selected_or_first_available_variant/g, 'variants[0]');
    const match = useStr.match(re)!;
    const key = match[1].trim();
    const value = match[2];
    // const result = liquid.evalValueSync(value, new Context(state, undefined, true));
    const result = toValue(new Expression(value).value(new Context(state, undefined, true)));
    state[key] = result;
  }
}
