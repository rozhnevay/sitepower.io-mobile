import Vue from 'nativescript-vue'
import store from './store';

const App = require('./components/App');
const Login = require('./components/Login');
const ChatBody = require('./components/ChatBody');
const ChatList = require('./components/ChatList');
const About = require('./components/About');
const indicator = require("nativescript-loading-indicator").LoadingIndicator;

import VueDevtools from 'nativescript-vue-devtools'
import RadListView from 'nativescript-ui-listview/vue';



if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools)
}
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')
Vue.prototype.$Login = Login;
Vue.prototype.$ChatBody = ChatBody;
Vue.prototype.$ChatList = ChatList;
Vue.prototype.$About = About;
Vue.prototype.$loader = new indicator();
Vue.prototype.$errorHandler = function (err) {
  if (err.response.status === 401) {
    this.$navigateTo(this.$Login,  {clearHistory: true})
  } else {
    console.log(err.message);
    alert('Ошибка при загрузке сообщений. Повторите позже');
  }
};
Vue.prototype.$store = store

Vue.use(RadListView);

new Vue({
  store,
  render: h => h('frame', [h(App)])
}).$start();


