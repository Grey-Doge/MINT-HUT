Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log(getApp().page.onLoad(this, options));
        getApp().page.onLoad(this, options);
    },

    getUserInfo: function (res) {
        var page = this;
        console.log(res);
        if (res.detail.errMsg != 'getUserInfo:ok') {
            return;
        }
        getApp().core.login({
            success: function (login_res) {
              console.log(getApp().core.login);
                var code = login_res.code;
                page.unionLogin({
                    code: code,
                    user_info: res.detail.rawData,
                    encrypted_data: res.detail.encryptedData,
                    iv: res.detail.iv,
                    signature: res.detail.signature
                });
            },
            fail: function (res) {
              console.log(res);
             
            },
        });

    },

    //支付宝小程序登录
    myLogin: function () {
        var page = this;
        if (getApp().platform !== 'my')
            return;
        my.getAuthCode({
            scopes: 'auth_user',
            success: function (res) {
                page.unionLogin({
                    code: res.authCode
                });
            }
        });
    },

    unionLogin: function (data) {
        getApp().core.showLoading({
            title: "正在登录",
            mask: true,
        });
        getApp().request({
            url: getApp().api.passport.login,
            method: 'POST',
            data: data,
            success: function (res) {
                if (res.code == 0) {
                    getApp().setUser(res.data);
                    getApp().core.setStorageSync(getApp().const.ACCESS_TOKEN, res.data.access_token);
                    getApp().trigger.run(getApp().trigger.events.login);
                    var login_pre_page = getApp().core.getStorageSync(getApp().const.LOGIN_PRE_PAGE);
                    if (!login_pre_page || !login_pre_page.route) {
                        getApp().core.redirectTo({
                            url: '/pages/index/index',
                        });
                    } else {
                        getApp().core.redirectTo({
                            url: '/' + login_pre_page.route + '?' + getApp().helper.objectToUrlParams(login_pre_page.options),
                        });
                    }
                } else {
                    getApp().core.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                    });
                }
            },
            complete: function () {
                getApp().core.hideLoading();
            }
        });
    }

});