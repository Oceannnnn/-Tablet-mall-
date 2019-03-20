// pages/listPage/listPage.js// index/list.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    currentId: 0,
    itemsList: [],
    page: 1,
    onBottom: true,
    type: ""
  },
  onLoad(op) {
    this.setData({
      tabTxt: [{
        name: '销量',
        tab: 0,
        type: ""
      },
      {
        name: '积分排序',
        tab: 1,
        type: "integral_desc"
      }
      ]
    })
    this.itemsList(1, "");
  },
  filterTab(e) {
    let tab = e.currentTarget.dataset.tab;
    let triangle = this.data.triangle;
    let type = e.currentTarget.dataset.type;
    let tabTxt = this.data.tabTxt;
    if (tab == 1) {
      this.setData({
        triangle: 0,
      })
      tabTxt[1].type = "integral_asc";
      if (triangle == 0) {
        triangle = 1;
        tabTxt[1].type = "integral_desc";
      } else {
        triangle = 0;
        tabTxt[1].type = "integral_asc";
      }
    } else {
      triangle = 3;
    }
    this.setData({
      tabTxt: tabTxt,
      currentId: tab,
      triangle: triangle,
      itemsList: [],
      page: 1,
      onBottom: true,
      type: type
    })
    this.itemsList(1, type);
  },
  details(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "goodsDetails")
  },
  onReachBottom: function () {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.itemsList(this.data.page, this.data.type);
    }
  },
  itemsList(page, type) {
    let json = {
      size: 10,
      page: page,
      type: type
    }
    let list = this.data.itemsList;
    util.http("promotion/integral_list", json, 'post').then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            itemsList: list
          })
        } else {
          if (page > 1) {
            this.data.onBottom = false;
          }
        }
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
  }
})