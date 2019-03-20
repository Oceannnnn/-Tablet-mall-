// pages/consultationDetails/consultationDetails.js
const app = getApp();
const util = require('../../utils/util.js');
const WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {},
  onLoad(op) {
    util.http('article/detail', { art_id:op.id}, 'post').then(res => {
      if (res.code == 200) {
        WxParse.wxParse('details', 'html', res.data.content, this, 0)
      }
    })
  },
})