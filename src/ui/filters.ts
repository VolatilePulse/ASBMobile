import Vue from 'vue';


export function inspect(obj: any) {
   let text = JSON.stringify(obj, undefined, 2);
   let lines = text.split('\n');
   lines = lines.map(line => line
      .replace(/,$/, '')
      .replace(/(^[{}]|[{}]$)/g, '')
      .replace(/^  /, '')
      .replace(/"([\w_]+)":/, '$1:')
   );
   lines = lines.filter(line => line.trim());
   text = lines.join('\n');
   return text;
}

// Debug tool to JSON.stringify (cleaned up)
Vue.filter('inspect', inspect);
