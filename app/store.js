const Vue = require('nativescript-vue');
const Vuex = require('vuex');
const axios = require('axios/dist/axios');
const appSettings = require("application-settings");
const cookie = require('cookie-parse');
const SocketIO = require('nativescript-socketio').SocketIO;
const formdata = require('nativescript-http-formdata');

let socketIO;

//axios.defaults.baseURL = 'https://sitepower.herokuapp.com';

if(TNS_ENV !== 'production') {
  axios.defaults.baseURL = 'http://10.0.2.2:3000';
} else {
  axios.defaults.baseURL = 'https://sitepower.herokuapp.com';
}

Vue.use(Vuex);

module.exports = new Vuex.Store({
  state: {
    userInfo: {
      isLoggedIn: false,
      isSignedUp: false,
      name: '',
      id:'',
      authStatus : ""
    },
    systemInfo: {
      chats: {},
      messages:[],
      chatsStatus : "",
      chatsError : "",
      activeChatId: "",
      activeChatPrintingTm: "",
      uploadStatus: "",
      uploadError: ""
    }
  },

  getters: {
    USER_LOGGED_IN: state => {
      return state.userInfo.isLoggedIn;
    },
    USER_NAME: state => {
      return state.userInfo.name;
    },
    USER_ID: state => {
      return state.userInfo.id;
    },
    AUTH_STATUS: state => {
      return state.userInfo.authStatus;
    },
    CHATS_STATUS: state => state.systemInfo.chatsStatus,
    CHATS: state => {
      return state.systemInfo.chats
    },
    MESSAGES: state => {
      return state.systemInfo.messages
    },
  },
  mutations: {
    ACTIVE_CHAT_ID: (state, id) => {
      state.systemInfo.activeChatId = id;
      state.systemInfo.activeChatPrintingTm = "";
    },
    AUTH_STATUS: (state, status, error) => {
      state.userInfo.authStatus = status;
      state.userInfo.authError = error;
    },
    USER_LOGGED_IN: (state, isUserLoggedIn) => state.userInfo.isLoggedIn = isUserLoggedIn,
    USER_NAME:      (state, name) => state.userInfo.name = name,
    USER_ID:        (state, id) => state.userInfo.id = id,
    CHATS_STATUS:   (state, status, error) => {
      state.systemInfo.chatsStatus = status;
      state.systemInfo.chatsError = error;
    },
    CHATS: (state, chats) => state.systemInfo.chats = chats,
    MESSAGES_STATUS:   (state, status, error) => {
      state.systemInfo.chatsStatus = status;
      state.systemInfo.chatsError = error;
    },
    MESSAGES: (state, messages) => state.systemInfo.messages = messages,
    UPLOAD_STATUS: (state, status, error) => {
      state.systemInfo.uploadStatus = status;
      state.systemInfo.uploadError = error;
    },
  },
  actions: {
    SEND: ({commit, state, dispatch}, msg) => {
      return new Promise((resolve, reject) => {
        if (!msg) return;
        let sendMessage = {};

        sendMessage.direction = "from_user";
        sendMessage.recepient_id = state.systemInfo.activeChatId;
        sendMessage.body = msg;
        sendMessage.type = "text";
        if (!socketIO) reject(new Error("No socket IO!!!"));
        socketIO.emit("send", sendMessage);
        resolve();
      })
    },
    SEND_LINK: ({commit, state, dispatch}, msg) => {
          return new Promise((resolve, reject) => {
              if (!msg) return;
              let sendMessage = {};

              sendMessage.direction = "from_user";
              sendMessage.recepient_id = state.systemInfo.activeChatId;
              sendMessage.body = msg.filename;
              sendMessage.link = msg.link;
              sendMessage.type = "link";
              if (!socketIO) reject(new Error("No socket IO!!!"));
              socketIO.emit("send", sendMessage);
              resolve();
          })
      },
    MESSAGES_REQUEST: ({commit, state, dispatch}, props) => {
      return new Promise((resolve, reject) => {
        commit('MESSAGES', []);
        commit('MESSAGES_STATUS', "Loading");
        axios.get("/api/chat/" + state.systemInfo.activeChatId)
            .then(res => {
              commit('MESSAGES_STATUS', "Success");
              commit('MESSAGES', res.data);
            }).catch(err => {
          commit('MESSAGES_STATUS', "Error", err.message);
        })
      })
    },
    CHATS_REQUEST: ({commit, state, dispatch}, props) => {
      commit('CHATS_STATUS', "Loading");
      return new Promise((resolve, reject) => {
        axios.get("/api/chats")
        .then(res => {
          commit('CHATS_STATUS', "Success");
          commit('CHATS', res.data.chats);
        }).catch(err => {
          commit('CHATS_STATUS', "Error", err.message);
        })
      });
    },
    SOCKET_LOGIN:({commit, state, dispatch}, props) => {
      /*start socket.io*/
      const cookies =  cookie.parse(appSettings.getString("sitepower"));
      Object.keys(cookies).forEach(key => {
        if (key.split('.')[0] === "sitepower"){
          socketIO = new SocketIO(axios.defaults.baseURL, {path:'/socket.io', query: 'session_id=' +  cookies[key].split('.')[0].split(':')[1]}/*headers: {'Cookie': appSettings.getString("sitepower")}*/);

          socketIO.connect();
          // console.log("connect");
          socketIO.on("receive",(receive_msg) => {
            // console.log("receive");
            // console.log(receive_msg);

            const msg = receive_msg.msg;
            const chat = receive_msg.chat;
            if (!msg || !chat) return;

            let chatItem, chatId;
            chatId = msg.direction === "to_user" ? msg.sender_id : msg.recepient_id;
            chatItem = state.systemInfo.chats[chatId];
            if (chatItem) {
              // 1. Если это активный чат - пушаем в него сообщение
              chatId === state.systemInfo.activeChatId ? state.systemInfo.messages.push(msg) : null;
              // 2. Обновляем состояние чата
              Object.assign(chatItem, chat);
            } else {
              dispatch('CHATS_REQUEST');
            }
          })
        }
      });
    },
    AUTH_LOGIN: ({commit, state, dispatch}, props) => {
      return new Promise((resolve, reject) => {
        commit('AUTH_STATUS', "Loading");
        axios.post("/api/login", props).then((res) => {
          commit('AUTH_STATUS', "Success")
          commit('USER_LOGGED_IN', true);
          commit('USER_NAME', res.data.name);
          commit('USER_ID', res.data.id);
          appSettings.setString("sitepower", res.headers['set-cookie'].toString());
          dispatch('SOCKET_LOGIN');


          resolve();
        }).catch((err) => {
          commit('AUTH_STATUS', "Error")
          commit('USER_LOGGED_IN', false);
          commit('USER_NAME', "");
          commit('USER_ID', "");
          reject(err);
        });
      });
    },
    AUTH_LOGOUT: ({commit, state, dispatch}) => {
      return new Promise((resolve, reject) => {
        commit('AUTH_STATUS', "Loading");
        axios.get("/api/logout").then((res) => {
          commit('AUTH_STATUS', "Success")
          commit('USER_LOGGED_IN', false);
          commit('USER_NAME', "")
          commit('USER_ID', "");
          if (!socketIO) reject(new Error("No socket IO!!!"));
          socketIO.emit("exit");
          appSettings.setString("sitepower", "");

          resolve();
        }).catch((err) => {
          commit('AUTH_STATUS', "Error")
          reject(err);
        });
      });
    },
    AUTH_USER: ({commit, state, dispatch}, props) => {
      return new Promise((resolve, reject) => {
        commit('AUTH_STATUS', "Loading");
        axios.get("/api/user").then((res) => {
          commit('AUTH_STATUS', "Success")
          commit('USER_LOGGED_IN', true);
          commit('USER_NAME', res.data.user.name);
          commit('USER_ID', res.data.id);
          dispatch('SOCKET_LOGIN');
          resolve();
        }).catch((err) => {
          commit('AUTH_STATUS', "Error")
          commit('USER_LOGGED_IN', false);
          commit('USER_NAME', "");
          commit('USER_ID', "");
          reject(err);
        });
      });
    },
    UPLOAD: ({commit, state, dispatch}, imgBinary) => {
      return new Promise((resolve, reject) => {
        commit('UPLOAD_STATUS', "Loading");
        let fd = new formdata.TNSHttpFormData();
        fd.post(axios.defaults.baseURL + "/api/upload", [{data: imgBinary,contentType: 'image/png',fileName: 'image.png',parameterName: 'file1'}], {headers: {test1: "test1 value","x-version-no": "2.0"}})
            .then(response => {
              dispatch('SEND_LINK', {filename:response.body.file, link:response.body.url})
                  .then(() => {
                    commit('UPLOAD_STATUS', "Success")
                    resolve()
                  })
                  .catch(() => {
                    commit('UPLOAD_STATUS', "Error")
                    reject(err)
                  });
        }).catch(err => {
          reject(err)
        });

      });
    }
  },

})

axios.interceptors.request.use(config => {
  config.headers['Cookie'] = appSettings.getString("sitepower");
  return Promise.resolve(config);
},
(error) => {
  return Promise.reject(error);
});
