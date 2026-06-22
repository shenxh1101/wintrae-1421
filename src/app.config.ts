export default defineAppConfig({
  pages: [
    'pages/hall/index',
    'pages/pets/index',
    'pages/schedule/index',
    'pages/records/index',
    'pages/wallet/index',
    'pages/sitter-setting/index',
    'pages/order-detail/index',
    'pages/pet-detail/index',
    'pages/pet-add/index',
    'pages/record-add/index',
    'pages/review-reply/index',
    'pages/regular-pets/index',
    'pages/bill-detail/index',
    'pages/withdraw/index',
    'pages/wallet-setting/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ff7a45',
    navigationBarTitleText: '宠物寄养管家',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#9c8c7e',
    selectedColor: '#ff7a45',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/hall/index',
        text: '接单大厅'
      },
      {
        pagePath: 'pages/pets/index',
        text: '宠物档案'
      },
      {
        pagePath: 'pages/schedule/index',
        text: '入住日程'
      },
      {
        pagePath: 'pages/records/index',
        text: '照护记录'
      },
      {
        pagePath: 'pages/wallet/index',
        text: '钱包'
      }
    ]
  }
})
