const app = getApp();
const util = require('../../utils/util.js');
Page({
  data: {},
  onLoad(op) {
    this.init()
  },
  onShow() {
    this.getSetting()
  },
  init() {
    this.setData({
      store_name: '',
      imgbox: [],
      image: {},
      name: '',
      password: '',
      store_status: 3,
      licence_cert: '',
      m_licence: '',
      p_licence: '',
      q_licence: ''
    })
    let token = app.globalData.token;
    util.http('user/has_apply', {}, 'get', token).then(res => {
      if (res.code == 200) {
        this.setData({
          domain: res.data.domain,
          apply_money: res.data.apply_money,
          store_status: res.data.store_status //0是审核中，1是可用，2是关闭，3是未申请
        })
      }
    })
  },
  bindStore_name(e) {
    this.setData({
      store_name: e.detail.value
    })
  },
  bindName(e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindPassword(e) {
    this.setData({
      password: e.detail.value
    })
  },
  bindAddress(e) {
    this.setData({
      store_address: e.detail.value
    })
  },
  bindPhone(e) {
    this.setData({
      store_phone: e.detail.value
    })
  },
  upload(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // console.log(res.tempFilePaths)
        // 返回选定照片的本地文件路径列表，tempFilePat
        let tempFilePaths = res.tempFilePaths;
        that.uploadimg(tempFilePaths, id);
      }
    })
  },
  location() {
    this.getSetting();
    let that = this;
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          store_address: res.address
        })
      }
    })
  },
  getSetting() { //判断是否获得了用户地理位置授权
    let that = this;
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation'])
          that.openConfirm()
      }
    })
  },
  uploadimg(arr, id) {
    let token = app.globalData.token;
    let box = [];
    let image = this.data.image;
    for (var i = 0; i < arr.length; i++) {
      var that = this;
      wx.uploadFile({
        url: util.u + "user/uploads",
        filePath: arr[i],
        name: 'file[]', //这里根据自己的实际情况改,
        formData: {},
        header: {
          "Content-Type": "multipart/form-data",
          token: token
        }, //这里是上传图片时一起上传的数据
        complete: (res) => {
          i++; //这个图片执行完上传后，开始上传下一张
          let data = res.data;
          data = JSON.parse(data);
          let url = data.data;
          image['image'] = url;
          box.push(image);
          image = {};
          that.setData({
            imgbox: [],
            imgbox: box,
          });
          let box_image = box[0].image;
          if (id == 1) {
            that.setData({
              licence_cert: box_image
            });
          } else if (id == 2) {
            that.setData({
              m_licence: box_image
            });
          } else if (id == 3) {
            that.setData({
              p_licence: box_image
            });
          } else if (id == 4) {
            that.setData({
              q_licence: box_image
            });
          }
          if (i >= arr.length) { //当图片传完时，停止调用    
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            })
            return
          } else { //若图片还没有传完，则继续调用函数
            that.uploadimg(arr);
          }
        }
      });
    }
  },
  bindtap(e) {
    var store_name = this.data.store_name,
      name = this.data.name,
      password = this.data.password,
      store_address = this.data.store_address,
      m_licence = this.data.m_licence,
      p_licence = this.data.p_licence,
      q_licence = this.data.q_licence,
      store_phone = this.data.store_phone,
      licence_cert = this.data.licence_cert;
    if (store_name == '') {
      wx.showToast({
        title: '请输入店铺名称',
        icon: 'none'
      })
      return
    }
    if (name == '') {
      wx.showToast({
        title: '请输入登入账号',
        icon: 'none'
      })
      return
    }
    if (password == '') {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }
    if (store_phone == '') {
      wx.showToast({
        title: '请输入电话号码',
        icon: 'none'
      })
      return
    }
    if (store_address == '') {
      wx.showToast({
        title: '请输入店铺地址',
        icon: 'none'
      })
      return
    }
    if (licence_cert == '') {
      wx.showToast({
        title: '请上传营业执照',
        icon: 'none'
      })
      return
    }
    let token = app.globalData.token;
    let json = {
      store_name: store_name,
      name: name,
      password: password,
      store_address: store_address,
      licence_cert: licence_cert,
      m_licence: m_licence,
      p_licence: p_licence,
      q_licence: q_licence,
      store_phone: store_phone
    }
    util.http("user/apply_store", json, 'post', token).then(res => {
      if (res.code == 200) {
        this.pay(res.data)
      }
    })
  },
  pay(order_no) {
    let token = app.globalData.token;
    util.http("pay/stick_pay", {
      order_no: order_no
    }, 'post', token).then(res => {
      wx.requestPayment({
        'timeStamp': res.timeStamp,
        'nonceStr': res.nonceStr,
        'package': res.package,
        'signType': res.signType,
        'paySign': res.paySign,
        'success': function(res) {
          wx.showToast({
            title: '申请成功',
            icon: 'none'
          })
          this.init()
        },
        'fail': function(res) {
          wx.showToast({
            title: '请重新申请',
            icon: 'none'
          })
          this.init()
        }
      })
    })
  }
})