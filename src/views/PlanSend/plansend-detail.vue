<template>
  <div class="detail-contain">
    <div class="detail-content">
      <div class="detail-header">
        <el-row>
          <el-col :span="8">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/plansend/index' }">发货计划</el-breadcrumb-item>
              <el-breadcrumb-item>{{ planType === '1'?'按计划发货':'交货详情' }}</el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="16" class="text-right">
            <div
              v-if="planType === '1'"
              class="export-status float-right text-center cursor"
              @click="savePlan"
            >保存提交</div>
            <div
              v-if="planType === '0'"
              class="export-status float-right text-center cursor"
              @click="routeDelivery"
            >发货</div>
            <el-button
              :loading="planLoading"
              class="option-btn float-right text-center cursor padding0"
              @click="exportExcel"
            >导出数据</el-button>
          </el-col>
        </el-row>
        <el-row class="bottom-12 pos-relative">
          <el-col :span="5" class="mid-text">客户名称：
            <span class="small-text">{{ planDetail.purchaseOrgName }}</span>
          </el-col>
          <el-col :span="5" class="mid-text">收货地点：
            <span class="small-text">{{ planDetail.address }}</span>
          </el-col>
          <el-col :span="5" class="mid-text">收货人：
            <span class="small-text">{{ planDetail.consignee }}</span>
          </el-col>
          <el-col :span="5" class="mid-text">联系电话：
            <span class="small-text">{{ planDetail.receiverTel }}</span>
          </el-col>
        </el-row>
        <el-form
          v-if="planType === '1'"
          ref="ruleForm"
          label-position="left"
          :inline="true"
          :model="formInline"
          class="demo-form-inline"
        >
          <el-row>
            <el-col :span="5">
              <el-form-item label="车牌：" prop="carNum" class="order-input mid-text flex align-center" required>
                <el-input v-model="formInline.carNum" class="flex-1" placeholder="请输入" />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="物流名称：" prop="logisticsName" class="order-input mid-text flex align-center" required>
                <el-input v-model="formInline.logisticsName" class="flex-1" placeholder="请输入" />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="物流电话：" prop="logisticsTel" class="order-input mid-text flex align-center" required>
                <el-input v-model="formInline.logisticsTel" class="flex-1" placeholder="请输入" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="5">
              <el-form-item label="物流单号：" prop="trackNum" class="order-input mid-text flex align-center" required>
                <el-input v-model="formInline.trackNum" class="flex-1" placeholder="请输入" />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="司机姓名：" prop="driverName" class="order-input mid-text flex align-center" required>
                <el-input v-model="formInline.driverName" class="flex-1" placeholder="请输入姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="司机电话：" prop="driverTel" class="order-input mid-text flex align-center" required>
                <el-input v-model="formInline.driverTel" class="flex-1" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="detail-table">
        <!-- 发货 -->
        <el-table
          v-if="planType === '1'"
          ref="tableList"
          :key="0"
          v-loading="listLoading"
          :data="planDetail.details"
          style="width: 100%"
          show-summary
          :summary-method="getSummaries"
          cell-class-name="tableRowStyle"
          header-cell-class-name="tableHeaderStyle"
        >
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column :label="isMerge?'采购单号':'计划单号'" width="140">
            <template slot-scope="scope">
              <p class="primary-color">
                {{ scope.row.purchaseNumber }}
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="materialCode" label="物料编码" width="120" />
          <el-table-column prop="materialName" label="物料名称" width="320" />
          <el-table-column prop="texture" label="材质" width="80" />
          <el-table-column prop="boxes" label="件数" width="80" />
          <el-table-column prop="unitName" label="单位" width="80" />
          <el-table-column prop="price" label="单价" width="80" />
          <el-table-column label="包装量" width="100">
            <template slot-scope="scope">
              <template v-if="scope.row.edit">
                <el-input-number v-model="scope.row.packs" :controls="false" :min="0" class="edit-input" size="small" />
              </template>
              <span v-else>{{ scope.row.packs }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="purchaseQuantity" label="采购数量" width="100" />
          <el-table-column prop="planQuantity" label="计划发货数量" width="120" />
          <el-table-column label="待发数量" width="100">
            <template slot-scope="scope">
              {{ scope.row.tobeSend }}
            </template>
          </el-table-column>
          <el-table-column label="发货数量">
            <template slot-scope="{row}">
              <template v-if="row.edit">
                <el-input-number v-model="row.authQuantity" :controls="false" :max="row.tobeSend" :min="0" class="edit-input" size="small" />
              </template>
              <span v-else>{{ row.authQuantity }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140">
            <template slot-scope="scope">
              <p>
                <el-link
                  v-if="scope.row.authQuantity !== scope.row.tobeSend"
                  :underline="false"
                  style="color: #4C8CEB!important;margin-right: 10px"
                  @click.stop="oneHandle(scope.$index, scope.row)"
                >一次性
                </el-link>
                <el-link
                  :underline="false"
                  @click.stop="viewProcureDetail(scope.$index, scope.row)"
                >交货详情
                </el-link>
              </p>
            </template>
          </el-table-column>
        </el-table>

        <!-- 详情 -->
        <el-table
          v-if="planType === '0'"
          ref="tableList"
          :key="1"
          v-loading="listLoading"
          :data="planDetail.details"
          style="width: 100%"
          show-summary
          :summary-method="getSummaries"
          cell-class-name="tableRowStyle"
          header-cell-class-name="tableHeaderStyle"
        >
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="采购单号" width="140">
            <template slot-scope="scope">
              <p class="primary-color">
                {{ scope.row.purchaseNumber }}
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="materialCode" label="物料编码" width="120" />
          <el-table-column prop="materialName" label="物料名称" width="320" />
          <el-table-column prop="brand" label="品牌" width="80" />
          <el-table-column prop="texture" label="材质" width="80" />
          <el-table-column prop="packs" label="包装量" width="100" />
          <el-table-column prop="boxes" label="件数" width="80" />
          <el-table-column prop="unitName" label="单位" width="80" />
          <el-table-column prop="purchaseQuantity" label="采购数量" width="100" />
          <el-table-column prop="planQuantity" label="计划发货数量" width="120" />
          <el-table-column label="待发数量">
            <template slot-scope="scope">
              {{ Number(scope.row.purchaseQuantity) - Number(scope.row.deliveryQuantity) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-link
                :underline="false"
                @click.stop="viewProcureDetail(scope.$index, scope.row)"
              >交货详情
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="detail-footer flex flex-between">
        <div class="foot-desc">备注信息：{{ planDetail.remarks }}</div>
        <div class="price-sum">合计金额：{{ priceSum }}</div>
      </div>
    </div>

    <!-- 交货详情弹出框 -->
    <el-dialog title="交货详情" :visible.sync="dialogTableVisible" width="780px">
      <el-table
        :data="gridData"
        cell-class-name="tableRowStyle2"
        header-cell-class-name="tableHeaderStyle2"
      >
        <el-table-column property="orderNumber" label="发货单号" width="160" />
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
import { planDetail, listDetail } from '@/api/procurement/sendplan'
import { simpleDetail, deliverySave } from '@/api/procurement/delivery'
export default {
  name: 'PlansendDetail', /* 交货详情，需要与路由name一致 */
  data() {
    return {
      listLoading: false, // 列表数据加载loading
      planLoading: false, // 导出loading
      formInline: { // 根据计划进行发货填写数据
        carNum: '',
        trackNum: '',
        logisticsName: '',
        logisticsTel: '',
        driverName: '',
        driverTel: ''
      },

      isMerge: this.$route.query.isMerge || false,
      orderId: this.$route.query.orderId || '',
      planId: this.$route.query.id || '',
      planIds: this.$route.query.ids ? this.$route.query.ids.split(',') : '',
      planType: this.$route.query.planType || '', // 1-发货，0-详情
      planDetail: {},

      priceSum: 0,
      gridData: [],
      dialogTableVisible: false
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
      if (this.planId) {
        planDetail({ id: this.planId }).then(res => {
          if (res.data) {
            this.planDetail = res.data
            const details = res.data.details
            let sum = 0
            details.forEach(item => {
              sum += Number(item.totalPrice)
            })
            this.priceSum = sum
          }
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 300)
        }).catch(error => {
          console.log(error)
        })
      } else {
        planDetail({ id: this.orderId }).then(res => {
          if (res.data && res.data.details) {
            const { purchaseOrgId, purchaserId, remarks, supplierId,
              purchaseOrgName, address, consignee, receiverTel } = res.data
            const { receiveOrgId, settleOrgId } = res.data.details[0]
            this.planDetail = { purchaseOrgId, receiveOrgId, settleOrgId, purchaserId,
              remarks, supplierId, purchaseOrgName, address, consignee, receiverTel }
          }
        }).then(() => {
          listDetail({ ids: this.planIds }).then(res => {
            if (res.data) {
              let sum = 0
              /* 循环列表赋值待发数和计划发货数 */
              res.data.forEach(item => {
                item['edit'] = true
                item['tobeSend'] = Number(item.purchaseQuantity) - Number(item.deliveryQuantity)
                item['authQuantity'] = item['tobeSend']

                sum += Number(item.totalPrice)
              })
              this.planDetail.details = res.data
              this.priceSum = sum
            }
            setTimeout(() => {
              this.listLoading = false
            }, 300)
          })
        }).catch(error => {
          console.log(error)
        })
      }
    },

    /* 交货详情 */
    viewProcureDetail(index, row) {
      this.dialogTableVisible = true
      simpleDetail({ planDetailId: row.id }).then(res => {
        if (res.data) {
          this.gridData = res.data
        }
      })
    },

    /* 一次性发货 */
    oneHandle(index, row) {
      row.authQuantity = row.tobeSend
    },

    /* 保存提交 */
    savePlan() {
      const details = []
      this.planDetail.details.forEach((item, index) => {
        const { packs, planDetailId, price, purchaseDetailId, quantity, remarks } = item
        details[index] = { packs, planDetailId, price, purchaseDetailId, quantity, remarks }
      })
      const { address, consignee, purchaseOrgId, purchaserId, receiveOrgId,
        receiverTel, remarks, settleOrgId, supplierId } = this.planDetail
      const { carNum, trackNum, logisticsName, logisticsTel, driverName, driverTel } = this.formInline

      const saveData = { address, carNumber: carNum, consignee, date: new Date(), details, driverName,
        driverTel, logisticsName, logisticsTel, purchaseOrgId, purchaserId, receiveOrgId, receiverTel,
        remarks, settleOrgId, supplierId, trackingNumber: trackNum }

      deliverySave(saveData).then(res => {
        this.$message({
          message: res.message,
          type: 'success'
        })
        this.$refs['ruleForm'].resetFields() // 重置表单
        this.getList()
      }).catch(error => {
        console.log(error)
      })
    },

    /* 计划详情跳转发货 */
    routeDelivery() {
      this.$router.push({ path: '/pdetail/plansendDetail', query: { ids: this.planId.toString(), orderId: this.planId, planType: '1' }})
    },

    /* 表格底部行数据统计 */
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0 || index === 2 || index === 7) {
          sums[index] = ''
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          sums[index] += ''
        } else {
          sums[index] = ''
        }
      })
      return sums
    },

    /* 导出数据Excel */
    exportExcel() {
      if (this.planDetail.details?.length) {
        this.planLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['采购单号', '物料编码', '物料名称', '品牌', '材质', '包装量', '件数', '单位', '采购数量', '计划发货数量']
          const filterVal = ['purchaseNumber', 'materialCode', 'materialName', 'brand', 'texture', 'packs', 'boxes', 'unitName', 'purchaseQuantity', 'planQuantity']
          const list = this.planDetail.details
          const data = this.formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '计划详情列表'
          })
          this.$refs.tableList.clearSelection()
          this.planLoading = false
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
        background: #008CFF;
        font-size: 13px;
        font-weight: 400;
        color: #FFFFFF;
        line-height: 32px;
      }
      .order-input{
        margin-right: 40px;
        ::v-deep .el-input{
          .el-input__inner{
            height: 32px;
            line-height: 32px;
          }
          .el-input__icon{
            line-height: 32px;
          }
        }
      }
      ::v-deep .el-form.el-form--inline{
        .el-form-item {
            margin-bottom: 0;
        }
        .el-form-item__label{
          font-size: 13px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.85);
          line-height: 40px;
          min-width: 86.06px;
        }
        .el-form-item__error{
          display: none;
        }
      }
    }
    .detail-table{
      padding: 16px 0 78px;
      ::v-deep .el-table__footer-wrapper tbody td{
        padding: 0;
        height: 40px;
        background: #F9FCFF;
      }
      ::v-deep .edit-input{
        &.el-input-number--small{
          width: 65px;
        }
        .el-input__inner{
          padding: 0 3px;
          height: 23px;
          line-height: 23px;
          width: 65px;
          text-align: left;
        }
      }
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
      .price-sum{
        font-size: 13px;
        font-weight: 400;
        color: #000000;
        line-height: 22px;
      }
    }
  }
  ::v-deep .el-dialog{
    .el-dialog__header{
      padding: 16px 22px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
    .el-dialog__body{
      padding-top: 10px;
    }
  }
}
</style>
