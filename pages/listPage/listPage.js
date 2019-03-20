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
    let id = op.id;
    let isRebate = op.type; //，1天天特价入口,2为分类
    this.setData({
      id: id,
      isRebate: isRebate,
      tabTxt: [{
          name: '销量',
          tab: 0,
          type: "sales"
        },
        {
          name: '价格',
          tab: 1,
          type: "price"
        }
      ]
    })
    this.itemsList(id, 1, "sales");
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
    this.itemsList(this.data.id, 1, type);
  },
  details(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "goodsDetails")
  },
  onReachBottom: function() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.itemsList(this.data.id, this.data.page, this.data.type);
    }
  },
  itemsList(id, page, type) {
    let json = {
      id: id,
      size: 10,
      page: page,
      type: type
    }
    let list = this.data.itemsList;
    let isRebate = this.data.isRebate;
    let url = '';
    if (isRebate == 1) {
      url = "promotion/day_spec";
    } else if (isRebate == 2) {
      url = "category/goods_list";
    } else if (isRebate == 3) {
      url = "goods/goods_list";
    }
    util.http(url, json, 'post').then(res => {
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