import { formatDisplayValue } from '@/ark';
import Vue from 'vue';


export function inspect(obj: any) {
   let text = JSON.stringify(obj, undefined, 2);
   let lines = text.split('\n');
   lines = lines.map(line => line
      .replace(/,$/, '')
      .replace(/(^[{}]|[{}]$|\{\}$)/g, '')
      .replace(/^  /, '')
      .replace(/"([\w_]+)":/, '$1:')
   );
   lines = lines.filter(line => line.trim());
   text = lines.join('\n');
   return text;
}

// Debug tool to JSON.stringify (cleaned up)
Vue.filter('inspect', inspect);

Vue.filter('display', (value: number, statIndex: number = 1, places?: number) => formatDisplayValue(value, statIndex, places));

Vue.filter('pct', (value: number) => formatDisplayValue(value, -2));
