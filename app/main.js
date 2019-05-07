import Vue from 'nativescript-vue'
import store from './store';

const App = require('./components/App');
const Login = require('./components/Login');
const ChatBody = require('./components/ChatBody');
const ChatList = require('./components/ChatList');
const About = require('./components/About');

import VueDevtools from 'nativescript-vue-devtools'

if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools)
}
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

Vue.prototype.$Login = Login;
Vue.prototype.$ChatBody = ChatBody;
Vue.prototype.$ChatList = ChatList;
Vue.prototype.$About = About

new Vue({
  store,
  render: h => h('frame', [h(App)])
}).$start()
