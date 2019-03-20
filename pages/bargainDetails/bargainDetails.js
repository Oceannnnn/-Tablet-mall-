const util = require('../../utils/util.js')
const main = require('../../utils/main.js')
const app = getApp()
Page({
  data: {
    bargainList: [],
    timer: null
  },
  onLoad(op) {
    let kan_id = op.id;
    let id = op.share_id;
    this.setData({
      kan_id: kan_id
    })
    if (id) {
      this.setData({
        id: id
      })
    } else {
      id = ""
    }
    let state = 0;
    if (wx.getStorageSync('httpClient') && wx.getStorageSync('token')) {
      state = wx.getStorageSync('httpClient').state;
    }
    if (state == 1) {
      this.init(kan_id, id)
      main.uploadFormIds();
    } else {
      wx.navigateTo({
        url: '../toLogin/toLogin',
      })
    }
  },
  onReady() {
    var circleCount = 0;
    this.animationMiddleHeaderItem = wx.createAnimation({
      timingFunction: 'linear',
      delay: 100,
      transformOrigin: '50% 50%',
      success: function(res) {}
    });
    setInterval(function() {
      if (circleCount % 2 == 0) {
        this.animationMiddleHeaderItem.scale(1.05).step();
      } else {
        this.animationMiddleHeaderItem.scale(1.0).step();
      }

      this.setData({
        animationMiddleHeaderItem: this.animationMiddleHeaderItem.export()
      });
      circleCount++;
      if (circleCount == 500) {
        circleCount = 0;
      }
    }.bind(this), 500);
  },
  init(kan_id, id) {
    //kan_id  砍价的id   id当前分享出去的id
    let token = app.globalData.token;
    util.http('promotion/kan', {
      kan_id: kan_id,
      id: id
    }, 'post', token).then(res => {
      if (res.code == 200) {
        let data = res.data;
        this.setData({
          info: data.info,
          bargainList: data.list,
          id: data.info.id
        })
        let times = data.timestamp;
        this.countDown(times);
      }
    })
  },
  countDown(times) {
    let _this = this;
    let timer = _this.data.timer;
    timer = setInterval(function() {
      times--
      let time = main.countDown(times, 0)
      let h = time.split(":")[0];
      let m = time.split(":")[1];;
      let s = time.split(":")[2];
      _this.setData({
        h: h,
        m: m,
        s: s
      })
      if (times <= 0) {
        clearInterval(timer);
        wx.showToast({
          title: '本次活动时间结束',
          icon: "none"
        })
        _this.times();
      }
    }, 1000);
    _this.setData({
      timer: timer
    })
  },
  onHide() {
    clearInterval(this.data.timer)
  },
  details(e) {
    let id = e.currentTarget.dataset.id;
    let kan_id = e.currentTarget.dataset.kan_id;
    wx.navigateTo({
      url: '../goodsDetails/goodsDetails?id=' + id + ' &kan_id=' + kan_id
    })
  },
  partake() {
    this.init(this.data.kan_id, '')
  },
  onShareAppMessage(res) {
    let name = this.data.info.nick_name;
    let id = this.data.id;
    let kan_id = this.data.kan_id;
    let title = "[" + name + "@我]砍砍砍,帮忙砍价";
    let path = '/pages/bargainDetails/bargainDetails?share_id=' + id + '&id=' + kan_id;
    if (res.from === 'button') {}
    return {
      title: title,
      path: path
    }
  }
})