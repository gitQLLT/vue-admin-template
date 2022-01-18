<template>
  <div class="detail-contain">
    <div class="detail-content">
      <div class="detail-header">
        <el-row>
          <el-col :span="8">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/return/index' }">退货列表</el-breadcrumb-item>
              <el-breadcrumb-item>退货详情</el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="16" class="text-right">
            <el-button
              :loading="returnLoading"
              class="export-status float-right text-center cursor padding0"
              @click="exportExcel"
            >导出数据</el-button>
          </el-col>
        </el-row>
        <el-row class="bottom-12">
          <el-col class="puchase-num">退货单号：{{ returnDetail.number }}
            <span class="mid-text">（发货日期：{{ returnDetail.date }}）</span>
          </el-col>
        </el-row>
        <el-row class="bottom-6">
          <el-col :span="5" class="mid-text">
            公司名称：<span class="small-text">{{ returnDetail.val3 }}</span>
          </el-col>
          <el-col :span="5" class="mid-text">
            收货地点：<span class="small-text">{{ returnDetail.val4 }}</span>
          </el-col>
          <el-col :span="5" class="mid-text">
            收货人：<span class="small-text">{{ returnDetail.val5 }}</span>
          </el-col>
          <el-col :span="7" class="mid-text">
            联系电话：<span class="small-text">{{ returnDetail.val6 }}</span>
          </el-col>
          <el-col :span="2" class="litter-text text-right">订单状态</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="mid-text line-28">车牌：
            <span class="small-text">{{ returnDetail.val7 }}</span>
          </el-col>
          <el-col :span="5" class="mid-text line-28">物流单号：
            <span class="small-text">{{ returnDetail.val8 }}</span>
          </el-col>
          <el-col :span="12" class="mid-text line-28">司机信息：
            <span class="small-text">{{ returnDetail.val9 }}</span>
          </el-col>
          <el-col :span="2" class="has-send text-right">{{ status | status }}</el-col>
        </el-row>
      </div>
      <div class="detail-table">
        <el-table
          ref="rebateSetTable"
          v-loading="listLoading"
          :data="returnDetail.details"
          style="width: 100%"
          cell-class-name="tableRowStyle"
          header-cell-class-name="tableHeaderStyle"
        >
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column prop="purchaseNumber" label="采购单号" width="160">
            <template slot-scope="scope">
              <p class="primary-color">
                {{ scope.row.purchaseNumber }}
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="materialCode" label="物料编码" width="160" />
          <el-table-column prop="materialName" label="物料名称" width="320" />
          <el-table-column prop="brand" label="品牌" width="80" />
          <el-table-column prop="texture" label="材质" width="80" />
          <el-table-column prop="packs" label="包装量" width="80" />
          <el-table-column prop="unitName" label="单位" width="80" />
          <el-table-column prop="price" label="单价" width="80" />
          <el-table-column prop="boxes" label="件数" width="80" />
          <el-table-column prop="totalPrice" label="金额" width="120" />
          <el-table-column prop="date" label="退货时间" width="120" />
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <p>{{ scope.row.status | status }}</p>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="退货数量" />
        </el-table>
      </div>
      <div class="detail-footer flex flex-between">
        <div class="foot-desc">备注信息：{{ returnDetail.remarks }}</div>
        <div class="foot-sum flex">
          <div class="stay-send price-sum">总数量：{{ totalNum }}</div>
          <div class="stay-send price-sum">已发数：{{ sendNum }}</div>
          <div class="stay-send price-sum">待发数：{{ totalNum - sendNum }}</div>
          <div class="stay-send price-sum">合计金额：{{ priceSum }}</div>
          <div class="price-sum">总件数：{{ packNum }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { deliveryDetail } from '@/api/procurement/delivery'
export default {
  name: 'ReturnDetail', /* 退货详情，需要与路由name一致 */
  filters: {
    status(val) {
      switch (parseInt(val)) {
        case 0:
          return '未发'
        case 1:
          return '已发'
      }
    }
  },
  data() {
    return {
      listLoading: false,
      returnLoading: false,
      returnId: this.$route.query.id,
      returnDetail: {},

      totalNum: 0, // 总数量
      sendNum: 0, // 已发数
      priceSum: 0, // 总金额
      packNum: 0 // 总件数
    }
  },

  computed: {
    status() { // 订单状态
      return parseInt(this.returnDetail.status)
    }
  },

  activated() {
    this.getList()
    this.$store.dispatch('app/hideSideBar') // 详情页收起菜单
  },

  methods: {
    /* 获取列表数据 */
    getList() {
      this.listLoading = false
      deliveryDetail({ id: this.returnId }).then(res => {
        if (res.data) {
          this.returnDetail = res.data
          // 获取详情列表id数组
          this.getComputeData(res.data.details)
        }
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 300)
      }).catch(error => {
        console.log(error)
      })
    },

    /* 获取底部数据 */
    getComputeData(details) {
      let sum = 0
      let sum1 = 0
      let sum2 = 0
      let sum3 = 0
      details.forEach(item => {
        sum += Number(item.totalPrice)
        sum1 += Number(item.boxes)
        sum2 += Number(item.purchaseQuantity)
        sum3 += Number(item.deliveryQuantity)
      })
      this.priceSum = sum
      this.packNum = sum1
      this.totalNum = sum2
      this.sendNum = sum3
    },

    /* 导出数据Excel */
    exportExcel() {
      if (this.returnDetail.details?.length) {
        this.returnLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['采购单号', '物料编码', '物料名称', '品牌', '材质', '包装量', '单位', '单价', '件数', '金额', '退货时间', '状态', '退货数量']
          const filterVal = ['purchaseNumber', 'materialCode', 'materialName', 'brand', 'texture', 'packs', 'unitName', 'price', 'boxes', 'totalPrice', 'date', 'status', 'quantity']
          const list = this.returnDetail.details
          const data = this.formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '退货详情列表'
          })
          this.$refs.rebateSetTable.clearSelection()
          this.returnLoading = false
        })
      } else {
        this.$message.error('表格暂无数据')
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-contain{
  padding: 24px;
  .detail-content{
    position: relative;
    background: #FFFFFF;
    border: 1px solid #D7D8D9;
    min-height: calc(100vh - 132px);
    .detail-header{
      padding: 24px 24px 15px 24px;
      border-bottom: 1px solid #E8E8E8;
      .mid-text{
        font-size: 13px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.85);
        line-height: 18px;
      }
      .small-text{
        font-size: 13px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.65);
        line-height: 18px;
      }
      .litter-text{
        font-size: 13px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.45);
        line-height: 18px;
      }
      .puchase-num{
        font-size: 18px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        line-height: 28px;
      }
      .export-status{
        width: 90px;
        height: 32px;
        background: #FFA033;
        font-size: 13px;
        font-weight: 400;
        color: #FFFFFF;
        line-height: 32px;
      }
      .has-send{
        font-size: 20px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.85);
        line-height: 28px;
      }
    }
    .detail-table{
      padding: 16px 0 78px;
    }
    .detail-footer{
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 17px 24px 17px 19px;
      background: #FBFBFB;
      border: 1px solid #E8E8E8;
      box-sizing: border-box;
      .foot-desc{
        font-size: 13px;
        font-weight: 400;
        color: #000000;
        line-height: 22px;
      }
      .stay-send{
        margin-right: 24px;
      }
      .price-sum{
        font-size: 13px;
        font-weight: 400;
        color: #000000;
        line-height: 22px;
      }
    }
  }
}
</style>
