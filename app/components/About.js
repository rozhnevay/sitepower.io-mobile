module.exports = {
    template: `
        <Page>
             <ActionBar title="О приложении" class="action-bar"><NavigationButton text="Назад" android.systemIcon="ic_menu_back" @tap="$navigateBack"/></ActionBar>
             <FlexboxLayout class="page">
                <StackLayout class="form" orientation="vertical" width="100%">
                      <Image src="~/assets/images/logo-black.png" stretch="none" class="img"></Image>
                      <Label class="text-center">Онлайн-диалоги. v 1.0.2</Label>
                      <Label class="text-center" marginTop="20">Напишите нам: info@sitepower.io</Label>
                </StackLayout>
            </FlexboxLayout>
        </Page>
  `,

};
