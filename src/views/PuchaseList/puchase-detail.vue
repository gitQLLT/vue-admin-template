<template>
  <div class="detail-contain">
    <div class="detail-content">
      <div class="detail-header">
        <el-row>
          <el-col :span="8" class="bottom-12">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/puchase/index' }">采购列表</el-breadcrumb-item>
              <el-breadcrumb-item>{{ status===3 ? '订单发货' : '采购详情' }}</el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="16" class="text-right">
            <template v-if="status===1">
              <div class="export-status float-right text-center cursor" @click="acceptOrder">接受订单</div>
              <div class="option-btn float-right text-center cursor" @click="rejectOrder">拒绝订单</div>
            </template>
            <template v-if="status===3">
              <div class="export-status float-right text-center cursor" @click="saveOrder">保存提交</div>
              <el-button
                :loading="puchaseLoading"
                class="option-btn float-right text-center cursor padding0"
                @click="exportExcel"
              >导出数据</el-button>
            </template>
          </el-col>
        </el-row>
        <el-row v-if="status!==3" class="bottom-12">
          <el-col class="puchase-num">采购单号：{{ puchaseDetail.number }}
            <span class="mid-text">（采购日期：{{ puchaseDetail.purchaseDate }}）</span>
          </el-col>
        </el-row>
        <el-row v-if="status!==3" class="bottom-6">
          <el-col :span="5" class="mid-text">采购组织名：<span class="small-text">{{ puchaseDetail.purchaseOrgName }}</span></el-col>
          <el-col :span="5" class="mid-text">采购员名：<span class="small-text">{{ puchaseDetail.purchaserName }}</span></el-col>
          <el-col :span="5" class="mid-text">合同号：<span class="small-text">{{ puchaseDetail.contractNumber }}</span></el-col>
          <el-col :span="9" class="litter-text text-right">订单状态</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="mid-text line-28">税额：<span class="small-text">{{ puchaseDetail.taxAmount }}</span></el-col>
          <el-col :span="5" class="mid-text line-28">不含税金额：<span class="small-text">{{ puchaseDetail.excludeTaxAmount }}</span></el-col>
          <el-col :span="5" class="mid-text line-28">价税总计：<span class="small-text">{{ puchaseDetail.allAmount }}</span></el-col>
          <el-col v-if="status!==3" :span="9" class="has-send text-right">{{ status | status }}</el-col>
        </el-row>
        <el-form v-if="status===3" ref="ruleForm" label-position="left" :inline="true" :model="formInline" class="demo-form-inline">
          <el-row>
            <el-col :span="5">
              <el-form-item label="收货人：" prop="consignVal" class="order-input mid-text flex align-center" required>
                <el-input v-model="formInline.consignVal" placeholder="请输入" class="flex-1" />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="收货人电话：" prop="receiverTel" class="order-input mid-text flex align-center" required>
                <el-input v-model="formInline.receiverTel" placeholder="请输入" class="flex-1" />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="仓库：" prop="addressVal" class="order-input mid-text flex align-center" required>
                <el-select v-model="formInline.addressVal" placeholder="全部" clearable style="width: 96px">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="车牌：" prop="carNum" class="order-input mid-text flex align-center" required>
                <el-input v-model="formInline.carNum" class="flex-1" placeholder="请输入" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
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
          </el-row>
          <el-row>
            <el-col :span="5">
              <el-form-item label="司机电话：" prop="driverTel" class="order-input mid-text flex align-center" required>
                <el-input v-model="formInline.driverTel" class="flex-1" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="detail-table">
        <!-- 已发、待发货 -->
        <el-table
          v-if="status!==0 && status!==3"
          ref="tableList"
          v-loading="listLoading"
          :data="puchaseDetail.details"
          style="width: 100%"
          cell-class-name="tableRowStyle"
          header-cell-class-name="tableHeaderStyle"
        >
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column prop="materialCode" label="物料编码" width="120" />
          <el-table-column prop="materialName" label="物料名称" width="320" />
          <el-table-column prop="texture" label="材质" width="80" />
          <el-table-column prop="packs" label="包装量" width="80" />
          <el-table-column prop="unitName" label="单位" width="80" />
          <el-table-column prop="price" label="单价" width="80" />
          <el-table-column prop="totalPrice" label="金额" width="120" />
          <el-table-column prop="boxes" label="件数" width="80" />
          <el-table-column prop="orderDate" label="交货时间" width="120" />
          <el-table-column prop="remarks" label="备注" width="80" />
          <el-table-column prop="purchaseQuantity" label="采购数量" width="80" />
          <el-table-column prop="deliveryQuantity" label="发货数量" width="80" />
          <el-table-column prop="receiveQuantity" label="收货数量" width="80" />
          <el-table-column prop="checkQuantity" label="合格数量" width="80" />
          <el-table-column prop="instockQuantity" label="入库数量" />
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <!-- 已发或者已完成显示交货详情 -->
              <p v-if="status===4 || status===9">
                <el-link
                  :underline="false"
                  @click.stop="viewProcureDetail(scope.$index, scope.row)"
                >交货详情
                </el-link>
              </p>
            </template>
          </el-table-column>
        </el-table>

        <!-- 新订单 -->
        <el-table
          v-if="status===0"
          ref="tableList"
          v-loading="listLoading"
          :data="puchaseDetail.details"
          style="width: 100%"
          cell-class-name="tableRowStyle"
          header-cell-class-name="tableHeaderStyle"
        >
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column prop="materialCode" label="物料编码" width="120" />
          <el-table-column prop="materialName" label="物料名称" width="320" />
          <el-table-column prop="packs" label="包装量" width="80" />
          <el-table-column prop="texture" label="材质" width="80" />
          <el-table-column prop="boxes" label="件数" width="80" />
          <el-table-column prop="unitName" label="单位" width="80" />
          <el-table-column prop="price" label="单价" width="80" />
          <el-table-column prop="purchaseQuantity" label="采购数量" />
        </el-table>

        <!-- 部分发货 -->
        <el-table
          v-if="status===3"
          ref="tableList"
          v-loading="listLoading"
          :data="puchaseDetail.details"
          style="width: 100%"
          show-summary
          :summary-method="getSummaries"
          cell-class-name="tableRowStyle"
          header-cell-class-name="tableHeaderStyle"
        >
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="采购单号" width="140">
            <template slot-scope="scope">
              <p class="primary-color">{{ scope.row.purchaseNumber }}</p>
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
          <el-table-column prop="purchaseQuantity" label="采购数量" width="80" />
          <el-table-column prop="receiveQuantity" label="已收数量" width="80" />
          <el-table-column prop="deliveryQuantity" label="已发数量" width="80" />
          <el-table-column label="待发数量" width="80">
            <template slot-scope="scope">
              {{ scope.row.tobeSend }}
            </template>
          </el-table-column>
          <el-table-column label="发货数量" width="100">
            <template slot-scope="{row}">
              <template v-if="row.edit">
                <el-input-number v-model="row.authQuantity" :controls="false" :max="row.tobeSend" :min="0" class="edit-input" size="small" />
              </template>
              <span v-else>{{ row.authQuantity }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="orderDate" label="交货时间" />
          <el-table-column label="操作" width="140">
            <template slot-scope="scope">
              <p>
                <!-- 待发数不等于填写的发货数时显示 -->
                <el-link
                  v-if="scope.row.authQuantity !== scope.row.tobeSend"
                  style="color: #4C8CEB!important;margin-right:10px"
                  :underline="false"
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
      </div>
      <div class="detail-footer flex flex-between">
        <div class="foot-desc">备注信息：{{ puchaseDetail.remarks }}</div>
        <div v-if="status!==3" class="foot-sum flex">
          <div class="stay-send price-sum">总数量：{{ totalNum }}</div>
          <div class="stay-send price-sum">已发数：{{ sendNum }}</div>
          <div class="stay-send price-sum">待发数：{{ totalNum - sendNum }}</div>
          <div class="stay-send price-sum">合计金额：{{ priceSum }}</div>
          <div class="price-sum">总件数: {{ packNum }}</div>
        </div>
        <div v-if="status===3" class="price-sum">合计金额：{{ priceSum }}</div>
      </div>
    </div>

    <!-- 交货详情弹出框 -->
    <el-dialog title="交货详情" :visible.sync="dialogTableVisible" width="780px">
      <el-table :data="gridData" cell-class-name="tableRowStyle2" header-cell-class-name="tableHeaderStyle2">
        <el-table-column label="交货单号" width="160">
          <template slot-scope="scope">
            <p class="primary-color">{{ scope.row.orderNumber }}</p>
          </template>
        </el-table-column>
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
import { purchaseDetail, purchaseAccept, purchaseRefuse, puchaseListDetail } from '@/api/procurement/puchase'
import { simpleDetail, deliverySave } from '@/api/procurement/delivery'
export default {
  name: 'PuchaseDetail', /* 采购详情，需要与路由name一致 */
  filters: {
    status(val) {
      switch (parseInt(val)) {
        case -2: return '供应商拒单'
        case -1: return '采购员取消'
        case 0: return '待确认'
        case 1: return '已确认，待接单'
        case 2: return '已接单'
        case 3: return '部分发货'
        case 4: return '发货完成'
        case 9: return '订单完成'
      }
    }
  },
  data() {
    return {
      listLoading: false, // 列表数据加载loading
      puchaseLoading: false, // 导出按钮loading
      formInline: { // 发货填写数据
        consignVal: '',
        receiverTel: '',
        addressVal: '',
        carNum: '',
        logisticsName: '',
        logisticsTel: '',
        trackNum: '',
        driverName: '',
        driverTel: ''
      },

      orderId: this.$route.query.orderId || '',
      puchaseId: this.$route.query.id || '',
      puchaseIds: this.$route.query.ids ? this.$route.query.ids.split(',') : [],
      puchaseDetail: {},

      totalNum: 0, // 总数量
      sendNum: 0, // 已发数
      priceSum: 0, // 总金额
      packNum: 0, // 总件数

      options: [
        {
          label: '全部',
          value: ''
        },
        {
          label: '长沙仓',
          value: '0'
        },
        {
          label: '上海仓',
          value: '1'
        }
      ],
      gridData: [],
      detailIds: [], // 详情列表id数组,
      dialogTableVisible: false
    }
  },

  computed: {
    status() { // 订单状态
      return parseInt(this.puchaseDetail.status)
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
      if (this.puchaseId) { // 查询详情
        purchaseDetail({ id: this.puchaseId }).then(res => {
          if (res.data) {
            this.puchaseDetail = res.data
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
      } else {
        // 部分发货详情，可以进行保存发货
        Promise.all([
          purchaseDetail({ id: this.orderId }).then(res => {
            if (res.data && res.data.details) {
              const { purchaseOrgId, purchaserId, remarks, supplierId, status,
                taxAmount, excludeTaxAmount, allAmount } = res.data
              const { receiveOrgId, settleOrgId } = res.data.details[0]
              this.puchaseDetail = { purchaseOrgId, receiveOrgId,
                settleOrgId, purchaserId, remarks, supplierId, status,
                taxAmount, excludeTaxAmount, allAmount }
            }
          }).catch(error => {
            console.log(error)
          }),
          puchaseListDetail({ ids: this.puchaseIds }).then(async res => {
            if (res.data) {
              let sum = 0
              /* 循环列表赋值待发数和计划发货数 */
              await res.data.forEach(item => {
                item['edit'] = true
                item['tobeSend'] = Number(item.purchaseQuantity) - Number(item.deliveryQuantity)
                item['authQuantity'] = item['tobeSend']

                sum += Number(item.totalPrice)
              })
              this.puchaseDetail.details = res.data
              this.priceSum = sum
            }
          }).catch(error => {
            console.log(error)
          })
        ]).then(() => {
          setTimeout(() => {
            this.listLoading = false
          }, 300)
        })
      }
    },

    /* 查看交货详情 */
    viewProcureDetail(index, row) {
      this.dialogTableVisible = true
      simpleDetail({ purchaseDetailId: row.id }).then(res => {
        if (res.data) {
          this.gridData = res.data
        }
      }).catch(error => {
        console.log(error)
      })
    },

    /* 新订单接受 */
    acceptOrder() {
      purchaseAccept({ ids: this.puchaseId.toString().split() }).then(res => {
        this.$message({
          message: res.message,
          type: 'success'
        })
        this.getList()
      }).catch(error => {
        console.log(error)
      })
    },

    /* 新订单拒绝 */
    rejectOrder() {
      this.$prompt('请输入拒绝意见', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea'
      }).then(({ value }) => {
        purchaseRefuse({ ids: this.puchaseId.toString().split() }).then(res => {
          this.$message({
            message: res.message,
            type: 'success'
          })
          this.getList()
        }).catch(error => {
          console.log(error)
        })
      }).catch(() => {
        console.log('取消')
      })
    },

    /* 供应商保存提交 */
    saveOrder() {
      const details = []
      this.puchaseDetail.details.forEach((item, index) => {
        const { packs, planDetailId, price, purchaseDetailId, quantity, remarks } = item
        details[index] = { packs, planDetailId, price, purchaseDetailId, quantity, remarks }
      })
      const { purchaseOrgId, purchaserId, receiveOrgId, remarks, settleOrgId, supplierId } = this.puchaseDetail
      const { consignVal, receiverTel, addressVal, logisticsName, logisticsTel,
        carNum, trackNum, driverName, driverTel } = this.formInline

      const saveData = { address: addressVal, carNumber: carNum, consignee: consignVal,
        date: new Date(), details, driverName, driverTel, logisticsName, logisticsTel,
        purchaseOrgId, purchaserId, receiveOrgId, receiverTel, remarks, settleOrgId,
        supplierId, trackingNumber: trackNum }

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

    /* 一次性发货 */
    oneHandle(index, row) {
      row.authQuantity = row.tobeSend
    },

    /* 获取底部数据 */
    getComputeData(details) {
      let sum = 0
      let sum1 = 0
      let sum2 = 0
      let sum3 = 0
      details.forEach(item => {
        this.detailIds.push(item.id)
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

    /* 表格总计行 */
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
      if (this.puchaseDetail.details?.length) {
        this.puchaseLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['采购单号', '物料编码', '物料名称', '材质', '件数', '单位', '单价', '包装量', '采购数量', '已收数量', '已发数量', '待发数量']
          const filterVal = ['purchaseNumber', 'materialCode', 'materialName', 'texture', 'boxes', 'unitName', 'price', 'packs', 'purchaseQuantity', 'receiveQuantity', 'deliveryQuantity', 'tobeSend']
          const list = this.puchaseDetail.details
          const data = this.formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '采购详情列表'
          })
          this.$refs.tableList.clearSelection()
          this.puchaseLoading = false
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
      .has-send{
        font-size: 20px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.85);
        line-height: 28px;
      }
      .order-input{
        margin-right: 40px;
        ::v-deep .el-input{
          .el-input__inner{
            height: 32px;
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
