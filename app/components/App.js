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
    methods: {
        redirect () {
            this.$store.dispatch('AUTH_USER')
                .then(() => {
                    this.$navigateTo(this.$ChatList,  {clearHistory: true});
                })
                .catch((err) => {
                    this.$navigateTo(this.$Login,  {clearHistory: true});
                });
        }
    }
};
