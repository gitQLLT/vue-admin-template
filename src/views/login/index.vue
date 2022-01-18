<template>
  <div class="login-container">
    <div class="login-form-layout">
      <span class="login-icon">申亿采购单核对系统</span>
      <div class="login-wel">欢迎您，请登录！</div>
      <el-form
        ref="loginForm"
        auto-complete="on"
        :model="loginForm"
        :rules="loginRules"
        label-position="left"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            name="username"
            type="text"
            auto-complete="on"
            placeholder="用户名/手机号"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            name="password"
            :type="passwordType"
            auto-complete="on"
            placeholder="输入密码"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
        <el-button
          class="submit-btn"
          :loading="loading"
          @click.native.prevent="handleLogin"
        >
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不少于6位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background: url('../../assets/images/back_img.png') no-repeat 100% 100%;
  background-size: cover;
  overflow: hidden;
  .login-form-layout {
    position: absolute;
    left: 50%;
    top: 50%;
    background: #FFFFFF;
    border-radius: 10px;
    padding: 66px 52px 80px;
    box-sizing: border-box;
    width: 400px;
    transform: translate(-50%,-50%);
    .login-icon{
      font-size: 12px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.4);
      line-height: 14px;
      transform: scale(0.83);
      &::before{
        content: '';
        display: inline-block;
        background: url('../../assets/logo.png') no-repeat;
        width: 20px;
        height: 20px;
        vertical-align: top;
        background-size: cover;
        margin-right: 4px;
      }
    }
    .login-wel{
      font-size: 24px;
      font-weight: 400;
      color: #242F57;
      line-height: 36px;
      margin: 11px 0 24px;
    }
    .el-form{
      .el-form-item{
        margin-bottom: 16px;
        ::v-deep .el-form-item__content{
          line-height: 32px;
          .el-input__inner{
            height: 32px;
            line-height: 32px;
          }
        }
      }
      .submit-btn{
        width: 100%;
        background: #44883B;
        font-size: 12px;
        padding: 8px 20px;
        font-weight: 400;
        color: #FFFFFF;
        line-height: 17px;
        margin-top: 8px;
      }
    }
    .show-pwd {
      position: absolute;
      right: 10px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
  }
}
</style>
