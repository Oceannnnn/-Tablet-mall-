// pages/searchPage/searchPage.js
Page({
  data: {
    currentId: 1,

  },
  onLoad(options) {
    this.setData({
      HeaderList: [{
        name: "商品",
        id: 1
      }, {
        name: "店铺",
        id: 2
      }]
    })

  },
  toList(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      currentId: id,
    })
  },
  bindconfirm(e) {
    let value = e.currentTarget.dataset.value;
    if (value) {
      this.setData({
        searchValue: value
      })
    }
    this.bindsearch()
  },
  bindsearch() {
    let searchValue = this.data.searchValue;
    if (searchValue != '' && searchValue != undefined) {
      wx.navigateTo({
        url: '../search/search?keywords=' + searchValue + '&search_type=' + this.data.currentId
      })
    } else {
      wx.showToast({
        title: '请输入内容',
        icon: "none"
      })
    }
  },
  searchValue(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
})