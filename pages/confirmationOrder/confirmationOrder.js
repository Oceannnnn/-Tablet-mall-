// pages/confirmationOrder/confirmationOrder.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    goodsList: [],
    coupon: 0,
    coupon_id: '',
    couponBack: 0,
    payMethod:1,
    balance: 0,
    balanceUse: 2,
    addressId: 0
  },
  onLoad(op) {
    this.setData({
      type: op.type
    })
    this.init()
    main.uploadFormIds();
  },
  onShow() {
    if (this.data.couponBack == 1) {
      this.count(this.data.radioValue)
    }
  },
  init() {
    let orderData = wx.getStorageSync('orderData');
    this.setData({
      goodsList: orderData.orderInfo,
      balance: orderData.balance,
      tuan_id: orderData.group_id,
      info: orderData.info
    })
    if (orderData.info != '') {
      this.setData({
        location: orderData.info.address,
        name: orderData.info.name,
        addressId: orderData.info.id,
        phone: orderData.info.mobile
      })
    }
    let goodsList = orderData.orderInfo;
    let orderPrice = 0;
    for (var i = 0; i < goodsList.length; i++) {
      goodsList[i].coupon_sum = 0;
      orderPrice += goodsList[i].status.orderPrice;
      goodsList[i].status.allPrice = goodsList[i].status.orderPrice;
    }
    orderPrice = orderPrice.toFixed(2)
    this.setData({
      allPrice: orderPrice,
      orderPrice: orderPrice,
      goodsList: goodsList
    })

  },
  radioChange(e) {
    let radioValue = e.detail.value;
    this.setData({
      radioValue: radioValue
    })
    this.count(radioValue)
  },
  count(radioValue) {
    let orderPrice = 0;
    let list = this.data.goodsList;
    if (radioValue == 2) {
      for (var i = 0; i < list.length; i++) {
        list[i].status.orderPrice = list[i].status.postage + list[i].status.allPrice - list[i].coupon_sum;
        orderPrice += list[i].status.orderPrice;
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        list[i].status.orderPrice = list[i].status.allPrice - list[i].coupon_sum;
        orderPrice += list[i].status.orderPrice;
      }
    }
    orderPrice = orderPrice.toFixed(2)
    this.setData({
      orderPrice: orderPrice,
      goodsList: list,
      allPrice: orderPrice
    })
  },
  orderAddress(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    wx.navigateTo({
      url: '../myadd/myadd?isChoose=1',
    })
  },
  useCoupon(e) {
    let id = e.currentTarget.dataset.id;
    let price = e.currentTarget.dataset.price;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../useCoupon/useCoupon?price=' + price + '&id=' + id + '&index=' + index
    })
  },
  // calculation(balance) {
  //   let allPrice = this.data.allPrice;
  //   let orderPrice = this.data.allPrice;
  //   let diffPrice = balance - orderPrice;
  //   if (orderPrice < balance) {
  //     allPrice = orderPrice.toFixed(2);
  //   } else {
  //     allPrice = (orderPrice - balance).toFixed(2);
  //   }
  //   this.setData({
  //     allPrice: allPrice,
  //     orderPrice: allPrice
  //   })
  // },
  comfirm(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let radioValue = this.data.radioValue;
    if (!radioValue) {
      wx.showToast({
        title: '请选择你的收获方式',
        icon: 'none',
        duration: 1000
      })
      return
    }
    let address = this.data.addressId;
    if (radioValue == 1) {
      address = 0
    }
    if (radioValue == 2) {
      if (address == 0) {
        wx.showToast({
          title: '请选择你的地址',
          icon: 'none',
          duration: 1000
        })
        return
      }
    }
    let allPrice = Number(this.data.allPrice);
    let balance = Number(this.data.balance);
    this.setData({
      disabled: true
    })
    var token = app.globalData.token;
    // let balance = 0;
    let balanceUse = this.data.balanceUse;
    let list = this.data.goodsList;
    let coupon = [];
    for (var i = 0; i < list.length; i++) {
      let json = {};
      if (list[i].coupon_id == undefined) {
        list[i].coupon_id = 0;
      }
      json.id = list[i].coupon_id;
      json.store_id = list[i].store_id;
      coupon.push(json)
    }
    coupon = JSON.stringify(coupon)
    let json = {
      address: address,
      coupon: coupon,
      type: this.data.radioValue, //2为自提，1为邮寄
      // group_id: this.data.tuan_id
    }
    util.http('order/place', json, 'post', token).then(res => {
      if (res.code == 200) {
        let order_id = res.data.order_id;
        let id = res.data.id;
        this.pay(order_id, id, token)
      }
    })
  },
  pay(order_id, id, token) {
    let that = this;
    let url = "pay/goods_pay";
    util.http(url, {
      order_no: order_id
    }, 'post', token).then(res => {
      let payResults = 0;
      wx.requestPayment({
        'timeStamp': res.timeStamp,
        'nonceStr': res.nonceStr,
        'package': res.package,
        'signType': res.signType,
        'paySign': res.paySign,
        'success': function(res) {
          that.setData({
            disabled: false
          })
          payResults = 1;
          setTimeout(() => {
            wx.reLaunch({
              url: '../payResults/payResults?payResults=' + payResults + '&id=' + id + '&status=' + that.data.type,
            })
          }, 500)
        },
        'fail': function(res) {
          that.setData({
            disabled: false
          })
          payResults = 0;
          setTimeout(() => {
            wx.reLaunch({
              url: '../payResults/payResults?payResults=' + payResults + '&id=' + id + '&status=' + that.data.type,
            })
          }, 500)
        }
      })
    })
  }
})