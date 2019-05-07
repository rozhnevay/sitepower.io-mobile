const store = require('../store');
const utilsModule = require("tns-core-modules/utils/utils");


module.exports = {
    data() {
        return {
            email : 'rozhnevay@gmail.com',
            password : '1',
            loginError : ''
        };
    },
    template: `
    <Page actionBarHidden="true">
        <FlexboxLayout class="page">
            <StackLayout class="form" orientation="vertical" width="100%">
                  <Image src="~/assets/images/logo-black.png" stretch="none" class="img"></Image>
                  <StackLayout class="input-field" marginLeft="15">
                    <!--<Label v-if="email" text="Email" class="label font-weight-bold m-b-5" width="90%" />-->
                    <TextField class="input" hint="Email" width="90%" keyboardType="email" autocorrect="false" autocapitalizationType="none" v-model="email" borderBottomColor="gray" borderBottomWidth="0.5"></TextField>
                  </StackLayout>
                    
                  <StackLayout class="input-field" marginLeft="15">
                    <!--<Label v-if="password" text="Password" class="label font-weight-bold m-b-5" width="90%" />-->
                    <TextField class="input" width="90%" hint="Password" secure="true" v-model="password" borderBottomColor="gray" borderBottomWidth="0.5"></TextField>
                    <FlexboxLayout flexDirection="row" justifyContent="flex-end" @tap="clickForget" marginRight="10">
                        <Label text="Восстановить пароль "></Label>
                        <Image src="~/assets/images/external-link.png" height="10" width="10"></Image>
                    </FlexboxLayout>
                  </StackLayout>
                <Button text="Вход" class="btn btn-primary btn-rounded-sm" @tap="clickLogin"></Button>
                <Label v-model="loginError" class="text-center text-danger"></Label>
                
                
                <FlexboxLayout flexDirection="row" justifyContent="center" @tap="clickRegister">
                    <Label text="Зарегистрироваться " class="text-center"></Label>
                    <Image src="~/assets/images/external-link.png" height="10" width="10"></Image>
                </FlexboxLayout>
                                
            </StackLayout>
            
        </FlexboxLayout>
    </Page>
  `,
   methods: {
       clickLogin() {
            if (this.email && this.password) {

                store.dispatch('AUTH_LOGIN', {email: this.email, password: this.password})
                    .then(() => this.$navigateTo(this.$ChatList,  {clearHistory: true}))
                    .catch(err => {
                        this.loginError = (err.response && err.response.status === 400) ? "Неверное имя пользователя или пароль" : "Ошибка сервера"
                    });

            }
        },
       clickRegister() {
           utilsModule.openUrl("https://app.sitepower.io/registration");
       }
       ,
       clickForget() {
           utilsModule.openUrl("https://app.sitepower.io/reset");
       }
   }
};
