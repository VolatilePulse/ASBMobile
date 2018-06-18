import Vue from 'vue';


// Debug tool to JSON.stringify (cleaned up)
Vue.filter('inspect', (obj: any) => {
   let text = JSON.stringify(obj, undefined, 2);
   let lines = text.split('\n');
   lines = lines.map(line => line.replace(/(^[{}]|[{}]$)/g, '').replace(/,$/, '').replace(/^  /, ''));
   lines = lines.filter(line => line.trim());
   text = lines.join('\n');
   return text;
});
