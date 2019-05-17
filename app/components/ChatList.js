const moment = require('moment');
const utilsModule = require("tns-core-modules/utils/utils");


module.exports = {
    template: `
    <Page @navigatedTo="onNavigated">
        <ActionBar title="Онлайн-диалоги" class="action-bar">
            
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
            <RadListView class="chats" for="chat in chats" @itemTap="openChat"  pullToRefresh="true" @pullToRefreshInitiated="onPullToRefreshInitiated">
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
            </RadListView>
        </StackLayout>
        <StackLayout v-else class="form" orientation="vertical" width="100%">
            <Image src="~/assets/images/happy.png" stretch="aspectFit" class="img" alignSelf="center" width="50%" height="50%"></Image>
            <Label class="text-center" textWrap="true">Как только у Вас появится активный диалог,</Label>
            <Label class="text-center" textWrap="true">он отобразится на этом экране</Label>
        </StackLayout>
    </Page>
  `,
   computed: {
       chats() {
           let chatsArr = [];
           Object.keys(this.$store.getters.CHATS).forEach(key => {
               this.$store.getters.CHATS[key].id = key;
               chatsArr.push(this.$store.getters.CHATS[key]);
           });
           return chatsArr;
       }
   },
   methods: {
       onNavigated() {
           this.$store.commit('SCREEN', "ChatList");
       },
       onPullToRefreshInitiated({ object }) {
           this.$store.dispatch('CHATS_REQUEST')
               .catch((err) => {
                   this.$errorHandler(err);
               })
               .finally(() => {
                   object.notifyPullToRefreshFinished();
               });
       },
       openChat(event){
           this.$store.commit('ACTIVE_CHAT_ID', event.item.sitepower_id);
           setTimeout(() => {
               if (this.$store.getters.MESSAGES_STATUS === "Loading") {
                   this.$loader.show(this.$store.getters.INDICATOR_WHITE);
               }
           }, 500);

           this.$store.dispatch('MESSAGES_REQUEST')
               .then(() => {
                   this.$navigateTo(this.$ChatBody,  {props: {chat: this.$store.getters.CHATS[event.item.sitepower_id]}});
               })
               .catch(err => {
                   this.$errorHandler(err);
               })
               .finally(() => {
                   this.$loader.hide();
               })
           ;
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
           this.$store.dispatch('AUTH_LOGOUT').then(() => {
               this.$navigateTo(this.$Login, {clearHistory: true});
           }).catch(err => {
               this.$errorHandler(err)
           });
       },
       goto() {
           utilsModule.openUrl("https://sitepower.io");
       },
       about() {
           this.$navigateTo(this.$About);
       }
   },
   mounted() {
       setTimeout(() => {
           if (this.$store.getters.CHATS_STATUS === "Loading") {
               this.$loader.show(this.$store.getters.INDICATOR_WHITE);
           }
       }, 500);

       this.$store.dispatch('CHATS_REQUEST')
           .catch((err) => {
               this.$errorHandler(err)
           })
           .finally(() => {
               this.$loader.hide();
           })
       ;
   }
};
