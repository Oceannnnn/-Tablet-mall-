// pages/balance/balance.js
const util = require('../../utils/util.js')
const main = require('../../utils/main.js')
const app = getApp()
Page({
  data: {
    bargainList:[]
  },
  onLoad() {
    main.uploadFormIds();
    this.init()
  },
  init() {
    let token = app.globalData.token;
    util.http('promotion/kan_list', {}, 'get', token).then(res => {
      if (res.code == 200) {
        this.setData({
          banner: res.data.banner,
          bargainList:res.data.list
        })
      }
    })
  },
  details(e){
    main.toDetails(e,"bargainDetails")
  }
})