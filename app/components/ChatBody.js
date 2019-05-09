const store = require('../store');
const moment = require('moment');
const imageSourceModule = require("tns-core-modules/image-source");

const utilsModule = require("tns-core-modules/utils/utils");
const mPicker = require("nativescript-mediafilepicker");
const platform = require("tns-core-modules/platform");
const dialogs = require("tns-core-modules/ui/dialogs");

module.exports = {
    data() {
        return {
            msg: ""
        };
    },
    template: `
    <Page class="chat" >
        <ActionBar :title="chat.name" class="action-bar"><NavigationButton text="Назад" android.systemIcon="ic_menu_back" @tap="$navigateBack"/>
         <ActionItem @tap="onShare"
              ios.systemIcon="9" ios.position="left"
              android.systemIcon="ic_dialog_email" android.position="actionBar"></ActionItem>
          <ActionItem @tap="onDelete"
              ios.systemIcon="16" ios.position="right"
              text="Удалить" android.systemIcon="ic_menu_delete" android.position="actionBar">
          </ActionItem>
        </ActionBar>
        <FlexboxLayout flexDirection="column" justifyContent="flex-end" height="100%" class="messages">
            <ScrollView ref="scrollView"> 
                <FlexboxLayout flexDirection="column" justifyContent="flex-end" >
                            <!--<FlexboxLayout v-if="dateSeparator(msg, index)" flexDirection="row" row="0" col="0" justifyContent="center" flexWrap="wrap">-->
                                <!--<Label textWrap="true" alignSelf="stretch" height="30" width="100" class="date">{{dateSeparator(msg, index)}}</Label>-->
                            <!--</FlexboxLayout>-->
                            <FlexboxLayout v-for="(msg, index) in messages" flexDirection="column" justifyContent="flex-end">
                                <Label v-if="dateSeparator(msg, index)" height="auto" alignSelf="center" textWrap="true" >{{dateSeparator(msg, index)}}</Label>
                                <FlexboxLayout v-if="ownerSeparator(msg, index)" flexDirection="row" :justifyContent="[ msg.direction == 'from_user' ?  'flex-end' : 'flex' ]" >
                                    <Label textWrap="true" class="text-muted">{{ownerSeparator(msg, index)}}</Label>
                                </FlexboxLayout>
                                <FlexboxLayout flexDirection="row" :justifyContent="[ msg.direction == 'from_user' ?  'flex-end' : 'flex' ]" >
                                    <GridLayout columns="auto,auto" rows="auto" width="auto" :class="[ msg.direction == 'from_user' ?  'admin' : 'client' ]">
                                        <FlexboxLayout flexDirection="row" row="0" col="0" justifyContent="center" flexWrap="wrap" class="msg" alignContent="stretch" >
                                            
                                            <Label v-if="msg.type=='text'" :width="msg.body && msg.body.length < 40 ? 'auto' : 250" textWrap="true" alignSelf="stretch">{{msg.body}}</Label>
                                            <!-- Отображение значка для скачивания вложения -->
                                            <FlexboxLayout @tap="imageTap(msg)" v-if="msg.type=='link'" flexDirection="column" justifyContent="center" alignContent="center" flexWrap="wrap" width="100" height="100">
                                                <Image src="~/assets/images/download.png" height="70" width="100"></Image>
                                                <Label textWrap="true" alignSelf="stretch" height="30" width="100" class="download">{{msg.body}}</Label>
                                            </FlexboxLayout>
                                        </FlexboxLayout>
                                        <FlexboxLayout flexDirection="column" row="0" col="1" justifyContent="flex-end" class="time">
                                            <Label :text="msgTime(msg)"></Label>
                                        </FlexboxLayout>
                                    </GridLayout>
                                </FlexboxLayout>
                            </FlexboxLayout>
                </FlexboxLayout>
            </ScrollView >
            <FlexboxLayout flexDirection="row" height="auto" minHeight="60" width="100%" class="input">
                    <TextView class="text" hint="Напишите сообщение..." v-model="msg" width="80%"></TextView>
                    <Image src="~/assets/images/send.png" height="35" width="25" @tap="send"></Image>
                    <Image class="attachment" src="~/assets/images/image.png" height="35" width="25" @tap="selectFile"></Image>
            <FlexboxLayout>
        </FlexboxLayout>
    </Page>
  `,
    computed: {
        messages() {
            return store.getters.MESSAGES;
        },
    },
    props: ['chat'],
    methods: {
        onDelete() {
            let that = this;
            dialogs.prompt({
                title: "",
                message: "Удалить диалог?",
                okButtonText: "Удалить",
                neutralButtonText: "В СПАМ!",
                cancelButtonText: "Отмена"
            }).then(function (res) {
                console.log("Dialog closed!");
                console.log(res);

                if (res.result) {
                    store.dispatch('ACTIVE_CHAT_DELETE', "DELETED").then(() => {
                        store.dispatch('CHATS_REQUEST').then(() => {
                            console.log("qqq");
                            that.$navigateTo(that.$ChatList, {clearHistory: true})
                        }).catch(err => console.log(err.message))
                    }).catch(err => console.log(err.message));
                } else if (res.result === undefined) {
                    store.dispatch('ACTIVE_CHAT_DELETE', "SPAM").then(() => {
                        store.dispatch('CHATS_REQUEST').then(() => that.$navigateTo(that.$ChatList, {clearHistory: true})).catch(err => console.log(err.message))
                    }).catch(err => console.log(err.message));
                }
            });
        },
        onShare() {
            dialogs.confirm({
                title: "",
                message: "Отправить диалог на Ваш email?",
                okButtonText: "Ок",
                cancelButtonText: "Отмена"
            }).then(function (result) {
                console.log("Dialog closed!");
                if (result) {
                    store.dispatch('ACTIVE_CHAT_SEND');
                }
            });
        },
        msgTime(msg) {
            return moment(msg.created).format('HH:mm');
        },
        dateSeparator(msg, index){
            const prevMsg = this.messages[index-1]
            const prevMsgDate = prevMsg ? moment(prevMsg.created, "YYYYMMDD") : moment("1970-01-01")
            const msgDate = moment(msg.created, "YYYYMMDD")
            if (msgDate > prevMsgDate){
                return moment(msgDate).locale('ru').calendar(null, {
                    sameDay: 'Сегодня', lastDay : 'Вчера', lastWeek: 'D MMMM', sameElse: function() {
                        if (this.year() === new Date().getFullYear()) {
                            return 'D MMMM'
                        } else {
                            return 'D MMMM YYYY';
                        }
                    }
                });
            }


            return null;
        },
        ownerSeparator(msg, index){
            const prevMsg = this.messages[index-1]

            let prevMsgOwner;
            if (!prevMsg) prevMsgOwner = "NONE";
            else if (prevMsg.operator_name) prevMsgOwner = prevMsg.operator_id === store.getters.USER_ID ? "Вы" : prevMsg.operator_name;
            else prevMsgOwner = "Посетитель";
            const msgOwner = msg.operator_name ? msg.operator_id === store.getters.USER_ID ? "Вы" : msg.operator_name : "Посетитель";
            if (msgOwner !== prevMsgOwner) return msgOwner;

            return null;
        },
        send() {
            store.dispatch('SEND', this.msg).then(()=> this.msg = "").catch(/*err => console.log(err.message)*/);
        },
        messageTap(msg) {
            if (msg.link ==="") return;
            msg.link = msg.link.replace("localhost", "10.0.2.2"); /*TODO: убрать*/
            utilsModule.openUrl(msg.link);
        },
        selectFile() {
            let options = {
                android: {
                    isCaptureMood: false,
                    isNeedCamera: true,
                    maxNumberFiles: 3,
                    isNeedFolderList: true
                }, ios: {
                    isCaptureMood: false,
                    maxNumberFiles: 3
                }
            };

            let mediafilepicker = new mPicker.Mediafilepicker();
            mediafilepicker.openImagePicker(options);

            mediafilepicker.on("getFiles", function (res) {
                res.object.get('results').forEach(item => {
                    const img = imageSourceModule.fromFile(item.file);
                    const base64String = img.toBase64String("png");
                    if (platform.isIOS) {
                        alert("Добавление изображений для iOS пока не реализовано");
                    }

                    const imgBinary = android.util.Base64.decode(base64String, android.util.Base64.DEFAULT);
                    store.dispatch('UPLOAD', imgBinary).then(() => console.log("OK")).catch(err => console.log(err))

                })
            });
            mediafilepicker.on("error", function (res) {
                alert("Ошибка загрузки изображения");
            });
        },
        scrollDown() {
            const that = this;
            setTimeout(()=>{
                const mScroller = this.$refs.scrollView;
                mScroller.nativeView.scrollToVerticalOffset(99999, false)
                if (platform.isAndroid) {
                    mScroller.nativeView.android.setVerticalScrollBarEnabled(false);
                }
            },150);
        }
    },
    watch: {
        messages: function () {
            this.scrollDown();
        }
    },
    mounted(){
        this.scrollDown();
    }
};
