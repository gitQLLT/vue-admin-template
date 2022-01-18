<template>
  <div class="main-contain over-hidden">
    <div class="main-content">
      <div class="info-contain">
        <div class="info-header flex flex-between">
          <div class="info-tip">
            <div class="my-info">我的消息</div>
            <div class="delay-info">待处理消息：12条</div>
          </div>
          <div class="info-filter">
            <el-select v-model="searchQuery.value" placeholder="请选择" @change="filterList">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <div v-for="(item,index) in infoList" :key="index" class="info-item flex flex-between align-center">
          <div class="info-content">
            <div class="info-title">{{ item.title }}</div>
            <div class="flex info-desc">
              <div class="info-date">{{ item.date }}</div>
              <div class="view-btn text-center">{{ item.status === 1?'已查看':'未查看' }}</div>
            </div>
          </div>
          <div :class="{hasDel: item.status === 1}" class="option-btn text-center cursor">{{ item.status === 1?'已处理':'前往处理' }}</div>
        </div>
      </div>
      <div class="pagination-container">
        <pagination v-show="total>0" :total="total" :page.sync="searchQuery.pageNum" :limit.sync="searchQuery.pageSize" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'MineInfo', /* 我的消息，需要与路由name一致 */
  components: {
    Pagination
  },
  data() {
    return {
      infoList: [],
      searchQuery: {
        pageNum: 1,
        pageSize: 20,
        value: ''
      },
      total: 0,
      options: [{
        value: '',
        label: '全部'
      }, {
        value: 1,
        label: '已处理'
      }, {
        value: 0,
        label: '未处理'
      }]
    }
  },

  activated() {
    this.getList()
    this.$store.dispatch('app/openSideBar') // 列表页展开菜单
  },

  methods: {
    /* 获取列表数据 */
    getList() {
      this.listLoading = true
      fetch('https://www.fastmock.site/mock/8f5033d0d4189eefb58ba004bd6733d4/test-01/myInfo')
        .then(res => res.json())
        .then(res => {
          this.infoList = res.data.list
          this.total = res.data.total
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 300)
        }).catch(error => {
          console.log(error)
        })
    },

    /* 选择数据状态筛选 */
    filterList() {
      this.searchQuery.page = 1
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.main-contain{
  margin-top: 1px;
  .main-content{
    overflow: hidden;
    padding: 24px;
    transition: all 0.5s ease;
    .info-contain{
      background: #FFFFFF;
      border-radius: 4px;
      padding: 16px;
      min-height: calc(100vh - 164px);
      .info-header{
        .info-tip{
          .my-info{
            font-size: 18px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.85);
            line-height: 28px;
          }
          .delay-info{
            font-size: 13px;
            font-weight: 400;
            color: #8C8C8C;
            line-height: 36px;
          }
        }
        ::v-deep .info-filter{
          .el-input__inner{
            width: 90px;
            height: 32px;
            line-height: 32px;
          }
          .el-input__icon{
            line-height: 32px;
          }
        }
      }
    }
    .info-item{
      padding: 16px 0;
      border-bottom: 1px solid #E9E9E9;
      &:hover{
        .info-content{
          .info-title{
              color: #33A3FF;
          }
        }
      }
      .info-content{
          max-width: 80%;
        .info-title{
          font-size: 13px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
          line-height: 18px;
          margin-bottom: 12px;
        }
        .info-desc{
          .info-date{
            font-size: 12px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.5);
            line-height: 18px;
            margin-right: 24px;
          }
          .view-btn{
            width: 64px;
            height: 22px;
            background: #F5F5F5;
            border-radius: 2px;
            border: 1px solid #D9D9D9;
            font-size: 12px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.65);
            line-height: 22px;
          }
        }
      }
      .option-btn{
        font-size: 12px;
        font-weight: 400;
        color: #FFFFFF;
        line-height: 32px;
        background: #008CFF;
        border-radius: 2px;
        height: 32px;
        width: 88px;
        &.hasDel{
          background: #F5F5F5;
          color: #A6A6A6;
        }
      }
    }
  }
}
.pagination-container{
  padding: 16px;
  background: #FBFBFB;
  border: 1px solid #E8E8E8;
  text-align: right;
  .el-pagination{
    padding: 0;
  }
}
</style>
