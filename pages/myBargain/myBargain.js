// pages/myBargain/myBargain.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    timer: null,
  },
  onLoad() {
    this.myBargain()
  },
  myBargain() {
    let token = app.globalData.token;
    util.http('user/kan_list', {
      status: 1
    }, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          myBargain1: res.data
        })
        this.myBargainTime(res.data)
      }
      })
    util.http('user/kan_list', {
      status: 3
    }, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          myBargain2: res.data
        })
      }
      })
    util.http('user/kan_list', {
      status: 2
    }, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          myBargain3: res.data
        })
      }
    })
  },
  myBargainTime(list) {
    let myBargain1 = list;
    let timer = this.data.timer;
    timer = setInterval(() => {
      for (let i in myBargain1) {
        let timestamp = myBargain1[i].timestamp;
        timestamp--
        let time = main.countDown(timestamp, 0)
        myBargain1[i].time = time;
        myBargain1[i].timestamp = timestamp;
        this.setData({
          myBargain1: myBargain1
        })
      }
    }, 1000)
    this.setData({
      timer: timer
    })
  },
  toMyBargain3() {
    this.setData({
      show: true
    })
  },
  toconfirmationOrder(e) {
    let id = e.currentTarget.dataset.id;
    let kan_id = e.currentTarget.dataset.kan_id;
    wx.navigateTo({
      url: '../goodsDetails/goodsDetails?id=' + id + ' &kan_id=' + kan_id
    })
  },
  toDetails(e) {
    main.toDetails(e, "bargainDetails")
  },
  onHide() {
    clearInterval(this.data.timer)
  },
})