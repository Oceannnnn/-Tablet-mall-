// pages/my/my.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    hasUserInfo: false,
    state: 0,
    no_read_num: 0,
    page: 1,
    onBottom: true,
    integral: "0.00"
  },
  onLoad() {
    this.init()
  },
  onShow() {
    this.info()
  },
  info() {
    let token = app.globalData.token;
    util.http('user/info', {}, 'get', token).then(res => {
      if (res.code == 200) {
        this.setData({
          integral: res.data.integral
        })
      }
    })
  },
  allorder(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let data = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../allorder/allorder?id=' + data.id + '&type=' + data.type + '&allorder=' + data.allorder,
    })
  },
  chatList(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    wx.navigateTo({
      url: '../chatList/chatList'
    })
  },
  collection(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "collection")
  },
  coupons(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    wx.navigateTo({
      url: '../coupons/coupons'
    })
  },
  myadd(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    wx.navigateTo({
      url: '../myadd/myadd'
    })
  },
  adshop(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    wx.navigateTo({
      url: '../adShop/adShop'
    })
  },
  getUserInfo(e) {
    let that = this;
    wx.login({
      success: function(res) {
        let code = res.code
        wx.getSetting({
          success(res) {
            if (res.authSetting['scope.userInfo']) {
              wx.getUserInfo({
                success: msg => {
                  let encryptedData = msg.encryptedData;
                  let iv = msg.iv;
                  let token = '';
                  let json = {
                    code: code,
                    encryptedData: encryptedData,
                    iv: iv
                  }
                  json = JSON.stringify(json)
                  util.http('login/login', json, 'post', token).then(data => {
                    if (data.code == 200) {
                      main.getTokenFromServer();
                      app.globalData.userInfo = e.detail.userInfo;
                      app.globalData.state = 1;
                      that.setData({
                        state: 1,
                        hasUserInfo: true,
                        userInfo: e.detail.userInfo
                      })
                      wx.setStorage({
                        key: "httpClient",
                        data: {
                          state: 1,
                          userInfo: e.detail.userInfo
                        }
                      })
                      wx.showToast({
                        title: '登录成功',
                        icon: 'success',
                        duration: 1000
                      })
                    }
                  })
                }
              })
            } else {
              wx.showToast({
                title: '授权才能登录哦！',
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }
    })
  },
  init() {
    this.setData({
      state: app.globalData.state,
      order: [{
        name: "待付款",
        icon: "daifukuan",
        allorder: "daifukuan",
        id: 1
      }, {
        name: "待发货",
        icon: "icon-test",
        allorder: "deliver",
        id: 2
      }, {
        name: "待收货",
        icon: "daishouhuo",
        allorder: "receive",
        id: 3
      }, {
        name: "待评价",
        icon: "daipingjia",
        allorder: "evaluate",
        id: 4
      }, {
        name: "退款售后",
        icon: "servicewuyoutuihuanhuo",
        allorder: "refund",
        id: 5
      }]
    })
    if (app.globalData.state == 1) {
      this.setData({
        state: 1,
        userInfo: app.globalData.userInfo
      })
    }
  },
})