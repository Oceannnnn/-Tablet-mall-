// pages/goodsDetails/goodsDetails.js
const app = getApp();
const WxParse = require('../../wxParse/wxParse.js');
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    info: false, //商品选择
    currentId: 1,
    isSeckill: true,
    imgUrls: [],
    commentrList: [],
    collageList: [],
    num: 1,
    page: 1,
    onBottom: true,
    timer: null
  },
  onLoad(op) {
    this.setData({
      swipercurrent: 0,
      imgheights: [],
      good_id: op.id,
      HeaderList: [{
        name: "详情信息",
        id: 1
      }, {
        name: "说明书",
        id: 3
      }, {
        name: "用户评论",
        id: 2
      }]
    })
    this.init(op.id)
    main.uploadFormIds();
  },
  init(good_id) {
    let token = app.globalData.token
    util.http('goods/info', {
      id: good_id
    }, 'post', token).then(res => {
      if (res.code == 200) {
        let goods = res.data.goods;
        this.setData({
          // commodityAttr: goods.spec,
          shopStock: goods.stock,
          imgUrls: goods.banner,
          collect: goods.is_collect,
          collectstore: res.data.store.is_collect,
          status: goods.type, //0表示普通，2表示拼团,1表示秒杀/4积分兑换
          tuanNum: goods.groupNum,
          pro_info: goods,
          store: res.data.store,
          store_collect: res.data.store.store_collect,
          coupon: res.data.coupon
        })
        if (goods.type == 1) this.times(goods.timestamp);
        if (goods.type == 2) this.collageList(); //拼团倒计时
      }
    })
    this.commentrList(good_id, 1)
  },
  imageLoad(e) {
    //获取图片真实宽度
    var imgwidth = e.detail.width,
      imgheight = e.detail.height;
    var ratio = imgwidth / imgheight;
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowWidth: res.windowWidth
        })
      }
    })
    //计算的高度值
    let windowWidth = this.data.windowWidth;
    var viewHeight = windowWidth / ratio;
    var imgheight = viewHeight
    var imgheights = this.data.imgheights
    //把每一张图片的高度记录到数组里
    imgheights.push(imgheight)
    this.setData({
      imgheights: imgheights,
    })
  },
  bindchange(e) {
    this.setData({
      swipercurrent: e.detail.current
    })
  },
  times(times) { //秒杀倒计时
    let _this = this;
    let timer = _this.data.timer;
    timer = setInterval(function() {
      times--
      let time = main.countDown(times, 0)
      _this.setData({
        times: time
      })
      if (times <= 0) {
        clearInterval(timer);
        wx.showToast({
          title: '本次抢购结束',
          icon: "none"
        })
      }
    }, 1000);
    _this.setData({
      timer: timer
    })
  },
  collageList() {
    let token = app.globalData.token;
    util.http('goods/group_order', {
      id: this.data.good_id
    }, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          collageList: res.data
        })
        this.collageTime(res.data)
      }
    })
  },
  collageTime(collage) {
    let collageList = collage;
    setInterval(() => {
      for (let i in collageList) {
        let time = collageList[i].time;
        time--
        let times = main.countDown(time, 0)
        collageList[i].date = times
        collageList[i].time = time
        this.setData({
          collageList: collageList
        })
      }
    }, 1000)
  },
  commentrList(good_id, page) { //评论
    let json = {
      size: 10,
      page: page,
      id: good_id
    }
    let list = this.data.commentrList;
    util.http('comment/index', json, 'post').then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            commentrList: list
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
    if (this.data.currentId == 2) {
      let page = this.data.page + 1;
      this.setData({
        page: page
      })
      if (this.data.onBottom) {
        this.commentrList(this.data.good_id, this.data.page)
      }
    }
  },
  toList(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      currentId: id,
    })
  },
  collect(e) {
    if (app.globalData.userInfo) {
      let token = app.globalData.token;
      let collect = e.currentTarget.dataset.collect;
      this.setData({
        collect: !this.data.collect
      })
      util.http('goods/collect', {
        id: this.data.good_id
      }, 'post', token).then(res => {})
    } else {
      main.goLogin(1)
    }
  },
  collageSore(e) {
    if (app.globalData.userInfo) {
      let token = app.globalData.token;
      let collect = e.currentTarget.dataset.collectstore;
      let id = e.currentTarget.dataset.id;
      let store_collect = this.data.store_collect
      this.setData({
        collectstore: !this.data.collectstore
      })
      if (collect == 1) {
        store_collect = store_collect - 1
      } else {
        store_collect = store_collect + 1
      }
      this.setData({
        store_collect: store_collect
      })
      util.http('store/collect', {
        id: id
      }, 'post', token).then(res => {})
    } else {
      main.goLogin(1)
    }
  },
  close() {
    this.setData({
      info: !this.data.info
    })
  },
  contentBtn(e) {
    let fromid = e.currentTarget.dataset.fromid;
    let toid = e.currentTarget.dataset.toid;
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../chat/chat?id=' + id + '&fromid=' + fromid + '&toid=' + toid
    })
  },
  toConsumer(e) {
    main.toDetails(e, "consumer")
  },
  buy(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let isTuan = e.currentTarget.dataset.istuan;
    let order_id = e.currentTarget.dataset.order_id;
    let cart = e.currentTarget.dataset.cart;
    let status = this.data.status;
    if (status == 4) {
      let integral_enough = this.data.pro_info.integral_enough;
      if (!integral_enough) {
        wx.showToast({
          title: '您的积分不够',
          icon: 'none'
        })
        return
      }
    }
    let comfirmistuan = 0;
    let comfirmOrderId = "";
    let comfirmCart = 0;
    let arr = this.data.commodityAttr;
    if (isTuan == 1) {
      comfirmistuan = isTuan
    }
    if (order_id) {
      comfirmOrderId = order_id
    }
    if (cart) {
      comfirmCart = cart
    }
    this.setData({
      comfirmistuan: comfirmistuan,
      comfirmCart: comfirmCart,
      comfirmOrderId: comfirmOrderId
    })
    this.close();
  },
  addtion(e) { //加法
    let num = e.currentTarget.dataset.num;
    let maxNum = this.data.shopStock;
    if (num < maxNum) {
      num++
    }
    this.setData({
      num: num
    })
  },
  //减法
  subtraction(e) {
    var num = e.currentTarget.dataset.num
    //当1件时，点击移除
    if (num == 1) {
      return
    } else {
      num--
    }
    this.setData({
      num: num
    })
  },
  toStore(e) {
    main.toDetails(e, "store")
  },
  comfirm(e) {
    if (app.globalData.userInfo) {
      if (this.data.shopStock < 1) {
        wx.showToast({
          title: '库存不足',
          icon: "none",
          duration: 1000
        })
        return
      }
      this.comfirmBtn(e);
    } else {
      main.goLogin(1)
    }
  },
  comfirmBtn(e) {
    let token = app.globalData.token;
    let comfirmistuan = e.currentTarget.dataset.comfirmistuan;
    let num = this.data.num;
    let store_id = this.data.store.store_id;
    let id = this.data.good_id;
    let jsonArr = [{
      goods_id: id,
      count: num,
      store_id: store_id
    }];
    jsonArr = JSON.stringify(jsonArr);
    if (comfirmistuan == 1) { //拼团
      let json = {
        group_order_id: this.data.comfirmOrderId, //与别人拼团时需要的参数
        goods: jsonArr,
        order_type: 1
      }
      util.http('order/add', json, 'post', token).then(res => {
        if (res.code == 200) {
          wx.removeStorageSync('orderData');
          wx.setStorage({
            key: "orderData",
            data: res.data
          })
          wx.navigateTo({
            url: '../confirmationOrder/confirmationOrder?type=2',
          })
        }
      })
    } else {
      let carJson = {
        id: id,
        num: num
      }
      let comfirmCart = this.data.comfirmCart;
      if (comfirmCart == 1) {
        util.http('goods/add_cart', carJson, 'post', token).then(res => {
          if (res.code == 200) {
            if (res.data.enough == 2) {
              wx.showToast({
                title: '添加成功',
                icon: "success",
                duration: 1000
              })
            } else {
              wx.showToast({
                title: '当前购物车已满！',
                icon: "none",
                duration: 1000
              })
            }
            this.close();
          }
        })
      } else {
        let json = {
          goods: jsonArr,
          order_type: ""
        }
        util.http('order/add', json, 'post', token).then(res => {
          if (res.code == 200) {
            wx.removeStorageSync('orderData');
            wx.setStorage({
              key: "orderData",
              data: res.data
            })
            wx.navigateTo({
              url: '../confirmationOrder/confirmationOrder?type=0'
            })
          }
        })
      }
    }
  },
  onHide() {
    clearInterval(this.data.timer);
  },
  onShareAppMessage(ops) {
    let invite_code = ""
    if (wx.getStorageSync("invite_code")) {
      invite_code = wx.getStorageSync("invite_code");
    }
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let url = "/" + currentPage.route;
    if (ops.from === 'button') {}
    return {
      title: '超级推荐' + this.data.pro_info.name,
      path: url + '?id=' + this.data.good_id + '&invite_code=' + invite_code
    }
  },
})