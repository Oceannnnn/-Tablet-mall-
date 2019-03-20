//index.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
const WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    redrnvelopesClose: false,
    timer: null
  },
  onLoad(op) {
    this.init();
    this.location();
  },
  onShow() {
    this.getTokenFromServer();
  },
  location() {
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        wx.setStorage({
          key: "degree",
          data: {
            latitude: latitude,
            longitude: longitude
          },
        })
      }
    })
  },
  init() {
    this.setData({
      qudao_num:0,
      imgUrls: [],
      textList: [],
      xianList: [],
      itemsList: [],
      hasSecKill: 0,
      page: 1,
      onBottom: true,
      animPlus: {}, //旋转动画
      animCollect: {}, //item位移,透明度
      animTranspond: {}, //item位移,透明度
    })
    util.http('home/info', {}, 'get').then(res => {
      if (res.code == 200) {
        if (res.data.banners) {
          this.setData({
            imgUrls: res.data.banners
          })
        }
      }
    })
    util.http('home/nav', {}, 'get').then(res => {
      if (res.code == 200) {
        this.setData({
          navicon: res.data
        })
      }
    })
    util.http('home/article', {}, 'get').then(res => {
      if (res.code == 200) {
        this.setData({
          article: res.data
        })
      }
    })
    util.http('home/recommend_goods', {}, 'get').then(res => {
      if (res.code == 200) {
        this.setData({
          recommend_goods: res.data
        })
      }
    })
    util.http('home/notice', {}, 'get').then(res => {
      if (res.code == 200) {
        this.setData({
          textList: res.data
        })
      }
    })
    util.http('about/index', {}, 'get').then(res => {
      if (res.code == 200) {
        WxParse.wxParse('details', 'html', res.data.content, this, 0)
      }
    })
  },
  bindtapDetails(e) {
    this.bindsubmit(e);
    main.toDetails(e, "goodsDetails")
  },
  bindtapArticle(e) {
    this.bindsubmit(e);
    main.toDetails(e, "consultationDetails")
  },
  clicktoggle_qudao(e) {
    this.setData({
      qudao_num: e.target.dataset.num
    })
  },
  listPage(e) { //折扣商品
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    let name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: '../listPage/listPage?id=' + id + '&type=' + type + '&name=' + name
    })
    this.bindsubmit(e);
  },
  bindsubmit(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
  },
  bindNotice(e) {
    main.toDetails(e, "adNotice")
  },
  consumer(e) {
    this.setData({
      isConsumer: 1
    })
    wx.navigateTo({
      url: '../consumer/consumer?currentId=3'
    })
  },
  // getCompanyConfig() {
  //   let token = app.globalData.token;
  //   util.http('about/index', {}, 'get', token).then(res => {
  //     if (res.code == 200) {
  //       let info = res.data;
  //       app.globalData.address = info.address;
  //       app.globalData.latitude = info.latitude;
  //       app.globalData.longitude = info.longitude;
  //       app.globalData.name = info.name;
  //       app.globalData.phone = info.mobile;
  //       app.globalData.logo = info.logo;
  //     }
  //   })
  // },
  getTokenFromServer(callBack) {
    var that = this;
    let token = "";
    wx.login({
      success: function(res) {
        wx.setStorageSync('code', res.code);
        util.http('login/getToken', {
          code: res.code
        }, 'post', token).then(data => {
          wx.setStorageSync('token', data.token);
          callBack && callBack(data.token);
          app.globalData.token = data.token;
        })
      }
    })
  },
  goTop() { //回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  // 获取滚动条当前位置 
  onPageScroll(e) {
    if (e.scrollTop > 300) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },
  onShareAppMessage() {
    return {
      title: '分享不仅仅是一种生活，更是收获',
      path: '/pages/index/index'
    }
  },
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.init()
    //模拟加载
    setTimeout(function() {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  }
})