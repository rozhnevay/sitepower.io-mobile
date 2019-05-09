const store = require('../store');
const moment = require('moment');
const utilsModule = require("tns-core-modules/utils/utils");


module.exports = {
    template: `
    <Page >
        <ActionBar title="Онлайн-диалоги" class="action-bar" @swipe="onSwipe">
            
             <ActionItem @tap="goto"
                  ios.position="popup"
                  text="Перейти на sitepower.io" android.position="popup"></ActionItem>
             <ActionItem @tap="about"
                  ios.position="popup"
                  text="О приложении" android.position="popup"></ActionItem>         
             <ActionItem @tap="logout"
                   ios.position="popup"
                  text="Выход" android.position="popup"></ActionItem>     
                  
         </ActionBar>
         
         <StackLayout v-if="chats.length > 0" orientation="vertical" width="100%" >
            <!--<ActivityIndicator v-if="busy" :busy="busy" color="black" class="left"/>-->
            <ListView class="chats" for="chat in chats" @itemTap="openChat"  @swipe="onSwipe">
                <v-template>
                    <GridLayout class="item" columns="2*,7*,2*,1*" rows="75" width="100%">
                        <AbsoluteLayout row="0" col="0" class="left"><Image left="17%" top="15%" width="100%" height="50%" class="img" src="~/assets/images/logo-lightning.png" stretch="none" ></Image></AbsoluteLayout>
                        <FlexboxLayout flexDirection="column" row="0" col="1" class="text">
                            <Label class="title">{{chat.name}}</Label>
                            <Label class="message">{{chat.last_msg_body}}</Label>
                        </FlexboxLayout>
                        <FlexboxLayout justifyContent="center" flexDirection="column" row="0" col="2" class="time">
                            <Label>{{chatTime(chat)}}</Label>
                        </FlexboxLayout>
                        <FlexboxLayout justifyContent="center" v-show="chat.cnt_unanswered > 0" flexDirection="column" row="0" col="3" class="status">
                            <Label class="badge-danger">{{chat.cnt_unanswered}}</Label>
                        </FlexboxLayout>
                    </GridLayout>
                </v-template>
            </ListView>
        </StackLayout>
        <StackLayout v-else class="form" orientation="vertical" width="100%">
            <Image src="~/assets/images/happy.png" stretch="aspectFit" class="img" alignSelf="center" width="50%" height="50%"></Image>
            <Label class="text-center" textWrap="true">Пока у Вас нет ни одного сообщения.</Label>
            <Label class="text-center" textWrap="true">Как только у Вас появится активный диалог,</Label>
            <Label class="text-center" textWrap="true">он отобразится на этом экране</Label>
        </StackLayout>
    </Page>
  `,
   computed: {
       chats() {
           let chatsArr = [];
           Object.keys(store.getters.CHATS).forEach(key => {
               store.getters.CHATS[key].id = key;
               chatsArr.push(store.getters.CHATS[key]);
           });
           return chatsArr;
       },
       busy() {
           if (store.getters.CHATS_STATUS === "Loading") {
               return true;
           }
           return false;
       }
   },
   methods: {
       onSwipe(args) {
           console.log("SWIPE")
           console.log(args.direction)
           if (args.direction === 8){
               store.dispatch('CHATS_REQUEST');
           }
       },
       openChat(event){
           store.commit('ACTIVE_CHAT_ID', event.item.sitepower_id);
           store.dispatch('MESSAGES_REQUEST');
           this.$navigateTo(this.$ChatBody,  {props: {chat: store.getters.CHATS[event.item.sitepower_id]}});

       },
       chatTime(chat) {
           return moment(chat.last_msg_created).locale('ru').calendar(null, {
               sameDay: 'Сегодня', lastDay : 'Вчера', lastWeek: 'D MMMM', sameElse: function() {
                   if (this.year() === new Date().getFullYear()) {
                       return 'D MMMM'
                   } else {
                       return 'DD.MM.YYYY';
                   }
               }
           });
       },
       logout() {
           store.dispatch('AUTH_LOGOUT').then(() => {
               this.$navigateTo(this.$Login, {clearHistory: true});
           }).catch(err => {
               // console.log("Error on logout");
               // console.log(err);
           });


       },
       goto() {
           utilsModule.openUrl("https://sitepower.io");
       },
       about() {
           this.$navigateTo(this.$About);       }
   },
   mounted() {
       store.dispatch('CHATS_REQUEST', {/*ти запроса*/}).then().catch(/*err => console.log(err.message)*/);
   }
};
