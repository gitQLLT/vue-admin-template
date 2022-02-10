<template>
  <div class="detail-contain">
    <div class="detail-content">
      <div class="detail-header">
        <el-row>
          <el-col :span="8">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/delivery/index' }">交货列表</el-breadcrumb-item>
              <el-breadcrumb-item>交货详情</el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="16" class="text-right">
            <el-button
              :loading="deliLoading"
              class="export-status float-right text-center cursor padding0"
              @click="exportExcel"
            >导出数据</el-button>
            <template v-if="status === 3">
              <div class="option-btn float-right text-center cursor" @click="printFun">打印条码</div>
              <div class="option-btn float-right text-center cursor">打印单据</div>
            </template>
            <!-- <div class="option-btn float-right text-center cursor" @click="saveDelivery">确认交货单</div> -->
          </el-col>
        </el-row>
        <el-row class="bottom-12">
          <el-col class="puchase-num">交货单号：{{ deliveryDetail.number }}
            <span class="mid-text">（发货日期：{{ deliveryDetail.date }}）</span>
          </el-col>
        </el-row>
        <el-row class="bottom-6 pos-relative">
          <el-col :span="5" class="mid-text">客户名称：
            <span class="small-text">{{ deliveryDetail.receiveOrgName }}</span>
          </el-col>
          <el-col :span="5" class="mid-text">收货地点：
            <span class="small-text">{{ deliveryDetail.address }}</span>
          </el-col>
          <el-col :span="5" class="mid-text">收货人：
            <span class="small-text">{{ deliveryDetail.consignee }}</span>
          </el-col>
          <el-col :span="7" class="mid-text">联系电话：
            <span class="small-text">{{ deliveryDetail.receiverTel }}</span>
          </el-col>
          <el-col :span="2" class="litter-text text-right">订单状态</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="mid-text line-28">车牌：
            <span class="small-text">{{ deliveryDetail.carNumber }}</span>
          </el-col>
          <el-col :span="5" class="mid-text line-28">物流单号：
            <span class="small-text">{{ deliveryDetail.trackingNumber }}</span>
          </el-col>
          <el-col :span="9" class="mid-text line-28">司机信息：
            <span class="small-text">{{ deliveryDetail.driverName }}（{{ deliveryDetail.driverTel }}）</span>
          </el-col>
          <el-col :span="5" class="has-send text-right">{{ status | status }}</el-col>
        </el-row>
      </div>
      <div class="detail-table">
        <el-table
          ref="rebateSetTable"
          v-loading="listLoading"
          :data="deliveryDetail.details"
          style="width: 100%"
          cell-class-name="tableRowStyle"
          header-cell-class-name="tableHeaderStyle"
        >
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="采购单号" width="120">
            <template slot-scope="scope">
              <p class="primary-color">
                {{ scope.row.purchaseNumber }}
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="materialCode" label="物料编码" width="120" />
          <el-table-column prop="materialName" label="物料名称" width="320" />
          <el-table-column prop="texture" label="材质" width="80" />
          <el-table-column prop="packs" label="包装量" width="80" />
          <el-table-column prop="unitName" label="单位" width="80" />
          <el-table-column prop="price" label="单价" width="80" />
          <el-table-column prop="boxes" label="件数" width="80" />
          <el-table-column prop="totalPrice" label="金额" width="100" />
          <el-table-column prop="orderDate" label="交货时间" width="120" />
          <el-table-column prop="remarks" label="备注" width="80" />
          <el-table-column prop="purchaseQuantity" label="采购数量" width="80" />
          <el-table-column prop="deliveryQuantity" label="发货数量" width="80" />
          <el-table-column prop="receiveQuantity" label="收货数量" width="80" />
          <el-table-column prop="checkQuantity" label="合格数量" width="80" />
          <el-table-column prop="instockQuantity" label="入库数量" />
          <el-table-column fixed="right" label="操作" width="100">
            <template slot-scope="scope">
              <p>
                <el-link
                  :underline="false"
                  @click.stop="viewProcureDetail(scope.$index, scope.row)"
                >交货详情</el-link>
              </p>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="detail-footer flex flex-between">
        <div class="foot-desc">备注信息：{{ deliveryDetail.remarks }}</div>
        <div class="foot-sum flex">
          <div class="stay-send price-sum">总数量：{{ totalNum }}</div>
          <div class="stay-send price-sum">已发数：{{ sendNum }}</div>
          <div class="stay-send price-sum">待发数：{{ totalNum - sendNum }}</div>
          <div class="stay-send price-sum">合计金额：{{ priceSum }}</div>
          <div class="price-sum">总件数：{{ packNum }}</div>
        </div>
      </div>
    </div>

    <!-- 交货详情弹出框 -->
    <el-dialog title="交货详情" :visible.sync="dialogTableVisible" width="780px">
      <el-table
        :data="gridData"
        cell-class-name="tableRowStyle2"
        header-cell-class-name="tableHeaderStyle2"
      >
        <el-table-column property="orderNumber" label="交货单号" width="160" />
        <el-table-column property="orderDate" label="发货时间" width="160" />
        <el-table-column property="price" label="单价" width="80" />
        <el-table-column property="deliveryQuantity" label="已发数量" width="80" />
        <el-table-column property="receiveQuantity" label="已收数量" width="80" />
        <el-table-column property="checkQuantity" label="合格数量" width="80" />
        <el-table-column property="instockQuantity" label="入库数量" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { deliveryDetail, deliverySave, simpleDetail } from '@/api/procurement/delivery'
import Print from '@/utils/print'
export default {
  name: 'DeliveryDetail', /* 交货详情，需要与路由name一致 */
  filters: {
    status(val) {
      switch (parseInt(val)) {
        case 0: return '已发货'
        case 1: return '已收货'
        case 2: return '待确认'
        case 3: return '已确认'
      }
    }
  },
  data() {
    return {
      listLoading: false,
      deliLoading: false,

      deliveryId: this.$route.query.id,
      deliveryDetail: {},

      totalNum: 0, // 总数量
      sendNum: 0, // 已发数
      priceSum: 0, // 总金额
      packNum: 0, // 总件数

      gridData: [],
      dialogTableVisible: false
    }
  },

  computed: {
    status() { // 订单状态
      return parseInt(this.deliveryDetail.status)
    }
  },

  activated() {
    this.getList()
    this.$store.dispatch('app/hideSideBar') // 详情页收起菜单
  },

  methods: {
    /* 获取列表数据 */
    getList() {
      this.listLoading = true
      deliveryDetail({ id: this.deliveryId }).then(res => {
        if (res.data) {
          this.deliveryDetail = res.data
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

    /* 发货详情 */
    viewProcureDetail(index, row) {
      this.dialogTableVisible = true
      simpleDetail({ deliveryDetailId: row.id }).then(res => {
        if (res.data) {
          this.gridData = res.data
        }
      })
    },

    /* 确认交货单 */
    saveDelivery() {
      const details = []
      this.deliveryDetail.details.forEach((item, index) => {
        const { packs, planDetailId, price, purchaseDetailId, quantity, remarks } = item
        details[index] = { packs, planDetailId, price, purchaseDetailId, quantity, remarks }
      })
      const { address, carNumber, consignee, date, driverName, driverTel, logisticsName, logisticsTel,
        number, purchaseOrgId, purchaserId, receiveOrgId, receiverTel, remarks, settleOrgId,
        supplierId, trackingNumber } = this.deliveryDetail

      const saveData = { address, carNumber, consignee, date, details, driverName,
        driverTel, logisticsName, logisticsTel, number, purchaseOrgId, purchaserId,
        receiveOrgId, receiverTel, remarks, settleOrgId, supplierId, trackingNumber }

      deliverySave(saveData).then(res => {
        this.$message({
          message: res.message,
          type: 'success'
        })
      }).catch(error => {
        console.log(error)
      })
    },

    /* 导出数据Excel */
    exportExcel() {
      if (this.deliveryDetail.details?.length) {
        this.deliLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['采购单号', '物料编码', '物料名称', '材质', '包装量', '单位', '单价', '件数', '金额', '交货时间', '备注', '采购数量',
            '发货数量', '收货数量', '合格数量', '入库数量']
          const filterVal = ['purchaseNumber', 'materialCode', 'materialName', 'texture', 'packs', 'unitName', 'price', 'boxes', 'totalPrice', 'orderDate', 'remarks', 'purchaseQuantity', 'deliveryQuantity', 'receiveQuantity', 'checkQuantity', 'instockQuantity']
          const list = this.deliveryDetail.details
          const data = this.formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '交货详情列表'
          })
          this.$refs.rebateSetTable.clearSelection()
          this.deliLoading = false
        })
      } else {
        this.$message.error('表格暂无数据')
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },

    /* 打印 */
    printFun() {
      Print(this.$refs.rebateSetTable)
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-contain{
  padding: 24px;
  .detail-content{
    position: relative;
    min-height: calc(100vh - 132px);
    background: #FFFFFF;
    border: 1px solid #D7D8D9;
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
      .option-btn{
        width: 90px;
        height: 32px;
        background: #FFFFFF;
        border: 1px solid rgba(0, 0, 0, 0.15);
        font-size: 13px;
        font-weight: 400;
        color: #666666;
        line-height: 32px;
        margin-right: 12px;
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
