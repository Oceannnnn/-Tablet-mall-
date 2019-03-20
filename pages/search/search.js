// pages/search/search.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    currentId: 0,
    itemsList: [],
    page: 1,
    onBottom: true,
  },
  onLoad(op) {
    this.setData({
      type: "distance",
      tabTxt: [{
        name: '距离',
        tab: 0,
        type: "distance"
      },
      {
        name: '价格',
        tab: 1,
        type: "price"
      },
      {
        name: '已购',
        tab: 2,
        type: "buy"
      }
      ]
    })
    if (op.tf_hours) {
      wx.setNavigationBarTitle({
        title: '24小时',
      })
      this.setData({
        tf_hours:1,
        keywords:''
      })
    }
    if (op.keywords) {
      wx.setNavigationBarTitle({
        title: op.keywords,
      })
      this.setData({
        keywords: op.keywords
      })
    }
    this.setData({
      search_type: op.search_type
    })
    this.itemsList(this.data.keywords, 1, "distance");
  },
  toStore(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "store")
  },
  filterTab(e) {
    let tab = e.currentTarget.dataset.tab;
    let type = e.currentTarget.dataset.type;
    this.setData({
      currentId: tab,
      itemsList: [],
      page: 1,
      onBottom: true,
      type: type
    })
    this.itemsList(this.data.keywords, 1, type);
  },
  onReachBottom() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.itemsList(this.data.keywords, this.data.page, this.data.type);
    }
  },
  itemsList(keywords, page, type) {
    let lat = '',
      lng = '';
    if (wx.getStorageSync('degree')) {
      lat = wx.getStorageSync('degree').latitude;
      lng = wx.getStorageSync('degree').longitude;
    }
    let token = app.globalData.token;
    let json = {
      keywords: keywords,
      size: 10,
      page: page,
      type: type,
      lat: lat,
      lng: lng,
      search_type: this.data.search_type
    }
    let url = 'home/search'
    if (this.data.tf_hours) {
      url = 'store/tf_hours'
    }
    let list = this.data.itemsList;
    util.http(url, json, 'post', token).then(res => {
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
  details(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "goodsDetails")
  }
})