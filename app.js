//app.js
App({
  onLaunch: function(op) {
    this.init()
  },
  globalData: {
    userInfo: null,
    state: 0,
    token: '',
    balance: 0,
    integral: 0,
    latitude: 0,
    longitude: 0,
    globalFormIds: []
  },
  init() {
    if (wx.getStorageSync('httpClient')) {
      this.globalData.state = wx.getStorageSync('httpClient').state;
      this.globalData.userInfo = wx.getStorageSync('httpClient').userInfo;
      this.globalData.balance = wx.getStorageSync('member').balance;
      this.globalData.integral = wx.getStorageSync('member').integral;
    }
    if (wx.getStorageSync('token')) this.globalData.token = wx.getStorageSync('token') 
  }
})