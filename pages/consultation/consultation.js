// pages/consultation/consultation.js
const app = getApp();
const main = require('../../utils/main.js');
const util = require('../../utils/util.js');
Page({
  data: {
    page: 1,
    onBottom: true,
    article: [],
  },
  onLoad(op) {
    this.article(1)
  },
  article(page) {
    let json = {
      size: 10,
      page: page
    }
    let list = this.data.article;
    let token = app.globalData.token;
    util.http('article/index', json, 'post', token).then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            article: list
          })
        } else {
          if (page > 1) {
            this.data.onBottom = false;
          }
        }
      }
    })
  },
  onReachBottom() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.article(this.data.page);
    }
  },
  bindtapArticle(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "consultationDetails")
  },
})