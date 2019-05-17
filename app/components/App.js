const application = require("tns-core-modules/application");

module.exports = {
    template: `
        <Page @navigatedTo="redirect" actionBarHidden="true">
             <FlexboxLayout class="page">
                <StackLayout class="form" orientation="vertical" width="100%">
                      <!--<Image src="~/images/logo-black.png" stretch="none" class="img"></Image>-->
                      <!--<Label class="text-center">Онлайн-диалоги. v 1.0.0</Label>-->
                </StackLayout>
            </FlexboxLayout>
        </Page>
  `,
   data() {
       return {
           isLoaded : false
       };
   },
   methods: {
        redirect () {
            this.$store.dispatch('AUTH_USER')
                .then(() => {
                    this.$navigateTo(this.$ChatList,  {clearHistory: true});
                })
                .catch((err) => {
                    this.$navigateTo(this.$Login,  {clearHistory: true});
                })
                .finally(() =>{
                    this.isLoaded = true;
                    this.$loader.hide();
                });
        }
   },
   created() {
        setTimeout(() => {
            if (!this.isLoaded) {
                this.$loader.show(this.$store.getters.INDICATOR_BLACK);
            }
        }, 500);
       application.on(application.resumeEvent, (args ) => {
           try {
               this.$store.dispatch('CHATS_REQUEST');
               this.$store.dispatch('MESSAGES_REQUEST');
               this.$store.dispatch('SOCKET_LOGIN');
               this.$store.dispatch('AUTH_USER')
                   .then(() => {

                   })
                   .catch((err) => {
                       if (this.$store.getters("SCREEN") !== "Login") {
                           this.$navigateTo(this.$Login,  {clearHistory: true});
                       }
                   })
           } catch (e) {
               console.log(e);
           }

       });
   }
};
