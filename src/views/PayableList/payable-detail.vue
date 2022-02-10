<template>
  <div class="detail-contain">
    <div class="invoice-content">
      <div class="invoice-header">
        <el-row>
          <el-col :span="8">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/payable/index' }">应付列表</el-breadcrumb-item>
              <el-breadcrumb-item>应付详情</el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="16" class="text-right">
            <el-button
              :loading="payableLoading"
              class="export-status float-right text-center cursor padding0"
              @click="exportExcel"
            >导出数据</el-button>
            <div class="option-btn float-right text-center cursor" @click="surePayable">确认应付单</div>
            <div class="option-btn float-right text-center cursor" @click="makeOutTick">开票</div>
          </el-col>
        </el-row>
        <el-row class="flex align-center bottom-12">
          <el-col :span="4" class="puchase-num">应付单号：{{ payableDetail.number }}</el-col>
          <el-col :span="4" class="mid-text">入库单号：<span class="small-text">{{ payableDetail.val2 }}</span></el-col>
          <el-col :span="4" class="mid-text">入库日期：<span class="small-text">{{ payableDetail.val3 }}</span></el-col>
          <el-col :span="12" class="mid-text">总金额：<span class="small-text">{{ payableDetail.allAmount }}</span></el-col>
        </el-row>
        <el-row>
          <el-col :span="4" class="mid-text">供应商：<span class="small-text">{{ payableDetail.supplierName }}</span></el-col>
          <el-col :span="20" class="mid-text">类型：<span class="small-text">{{ payableDetail.type }}</span></el-col>
        </el-row>
      </div>
      <div class="invoice-table">
        <el-table
          ref="rebateSetTable"
          v-loading="listLoading"
          :data="payableDetail.details"
          style="width: 100%"
          show-summary
          :summary-method="getSummaries"
          cell-class-name="tableRowStyle"
          header-cell-class-name="tableHeaderStyle"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" type="index" width="60" />
          <el-table-column label="行号" width="80" prop="seq" />
          <el-table-column label="物料编码" width="120" prop="materialCode" />
          <el-table-column label="物料名称" width="320" prop="materialName" />
          <el-table-column label="单位" width="80" prop="unitName" />
          <el-table-column label="单价" width="80" prop="price" />
          <el-table-column label="数量" width="80" prop="quantity" />
          <el-table-column label="含税单价" width="100" prop="taxPrice" />
          <el-table-column label="不含税金额" width="120" prop="excludeTaxPrice" />
          <el-table-column label="税额" width="120" prop="taxAmount" />
          <el-table-column label="价税合计" width="100" prop="allAmount" />
          <el-table-column label="应付金额" width="100" prop="payableAmount" />
          <el-table-column label="状态" prop="status">
            <template slot-scope="scope">
              <p>{{ scope.row.status===0 ? '待确认' : '已确认' }}</p>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template slot-scope="scope">
              <p>
                <el-link
                  v-if="scope.row.status === 1"
                  style="margin-right: 10px"
                  :underline="false"
                  @click.stop="makeInvoice(scope.$index, scope.row)"
                >开票
                </el-link>
                <el-link
                  v-else
                  style="margin-right: 10px"
                  :underline="false"
                  @click.stop="sureOrder(scope.$index, scope.row)"
                >确认
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
        <div class="foot-desc" />
        <div class="price-sum">合计金额：{{ priceSum }}</div>
      </div>
    </div>

    <!-- 开票弹出框 -->
    <el-dialog title="开票" :visible.sync="dialogVisible" width="480px">
      <el-form ref="invoiceForm" :rules="rules" :model="invoiceForm" label-width="80px">
        <el-form-item label="开票金额" prop="amout">
          <el-input v-model="invoiceForm.amount" readonly />
        </el-form-item>
        <el-form-item label="开票单号" prop="number">
          <el-input v-model="invoiceForm.number" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="invoiceForm.remarks" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogInvoice('invoiceForm')">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 交货详情弹出框 -->
    <el-dialog title="交货详情" :visible.sync="dialogTableVisible" width="780px">
      <el-table :data="gridData" cell-class-name="tableRowStyle2" header-cell-class-name="tableHeaderStyle2">
        <el-table-column label="交货单号" width="160">
          <template slot-scope="scope">
            <p class="primary-color">
              {{ scope.row.orderNumber }}
            </p>
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
import { queryDetail, confirmByDetail, payableDetail, invoiceSave } from '@/api/procurement/payable'
export default {
  name: 'PayableDetail', /* 应付详情，需要与路由name一致 */
  data() {
    return {
      listLoading: false,
      payableLoading: false,
      priceSum: 0,
      id: this.$route.query.id || '',
      payableDetail: {},
      selectListId: [],
      multiSelect: [],
      invoiceForm: {
        amount: 0,
        number: '',
        remarks: ''
      },
      rules: {
        number: [
          { required: true, message: '请输入开票单号', trigger: 'blur' }
        ]
      },

      gridData: [],
      dialogVisible: false,
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
      payableDetail({ id: this.id }).then(res => {
        if (res.data) {
          this.payableDetail = res.data
          this.getPriceSum()
        }
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 300)
      }).catch(error => {
        console.log(error)
      })
    },

    /* 确认 */
    sureOrder(index, row) {
      confirmByDetail({ ids: row.id.toString().split() }).then(res => {
        this.$message({
          message: res.message,
          type: 'success'
        })
        this.getList()
      }).catch(error => {
        console.log(error)
      })
    },

    /* 确认应付单 */
    surePayable() {
      if (this.selectListId.length < 1) {
        this.$message({
          message: '请先选择应付订单',
          type: 'warning'
        })
        return false
      }
      if (this.multiSelect.some(item => { return item.status !== 0 })) {
        this.$message({
          message: '请选择未确认应付订单',
          type: 'warning'
        })
        return false
      }
      confirmByDetail({ ids: this.selectListId }).then(res => {
        this.$message({
          message: res.message,
          type: 'success'
        })
        this.getList()
      }).catch(error => {
        console.log(error)
      })
    },

    /* 选择多行开票 */
    makeOutTick() {
      if (this.selectListId.length < 1) {
        this.$message({
          message: '请先选择应付订单',
          type: 'warning'
        })
        return false
      }
      if (this.multiSelect.some(item => { return item.status === 0 })) {
        this.$message({
          message: '请选择已确认应付订单',
          type: 'warning'
        })
        return false
      }
      this.dialogVisible = true
    },

    /* 确认开票 */
    dialogInvoice(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const { amount, number, remarks } = this.invoiceForm
          const invoiceData = {
            'invoice': {
              'amount': amount,
              'date': new Date(),
              'number': number,
              'remarks': remarks
            },
            'payDetailIds': this.selectListId
          }
          invoiceSave(invoiceData).then(res => {
            this.$message({
              message: res.message,
              type: 'success'
            })
            this.dialogVisible = false
            this.$refs[formName].resetFields()
            this.getList()
          })
        } else {
          console.log('请填写开票单号！')
        }
      })
    },

    /* 单行点击开票 */
    makeInvoice(index, row) {
      this.invoiceForm.amount = row.payableAmount
      this.selectListId = row.id.toString().split()
      this.dialogVisible = true
    },

    /* 查看详情 */
    viewProcureDetail(index, row) {
      this.dialogTableVisible = true
      const { deliveryDetailId, planDetailId, purchaseDetailId } = row
      queryDetail({ deliveryDetailId, planDetailId, purchaseDetailId }).then(res => {
        if (res.data) {
          this.gridData = res.data
        }
      }).catch(error => {
        console.log(error)
      })
    },

    /* 表格总计列 */
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0 || index === 2 || index === 3 || index === 6 || index === 12 || index === 13) {
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

    /* 表格底部计算总数 */
    getPriceSum() {
      let sum = 0
      for (let i = 0; i < this.payableDetail.details.length; i++) {
        sum += Number(this.payableDetail.details[i].payableAmount)
      }
      this.priceSum = sum
    },

    /* 导出数据Excel */
    exportExcel() {
      if (this.payableDetail.details?.length) {
        this.payableLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['物料名', '品牌', '材质', '包装量', '待交数', '逾期数', '第一周', '第二周', '第三周', '第四周', '下个月', '下下个月']
          const filterVal = ['materialName', 'brand', 'texture', 'packs', 'val1', 'val2', 'val3', 'val4', 'val5', 'val6', 'val7', 'val8']
          const list = this.payableDetail.details
          const data = this.formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '应付详情列表'
          })
          this.$refs.rebateSetTable.clearSelection()
          this.payableLoading = false
        })
      } else {
        this.$message.error('表格暂无数据')
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },

    /* 选中列表数据 */
    handleSelectionChange(val) {
      this.multiSelect = val
      var ids = []
      let amout = 0
      val.forEach(element => {
        ids.push(element.id)
        amout += Number(element.payableAmount)
      })
      this.selectListId = ids
      this.invoiceForm.amount = amout
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-contain{
  padding: 24px;
  .invoice-content{
    position: relative;
    min-height: calc(100vh - 132px);
    background: #FFFFFF;
    border: 1px solid #D7D8D9;
    .invoice-header{
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
    }
    .invoice-table{
      padding: 16px 0 78px;
      ::v-deep .el-table__footer-wrapper tbody td{
        padding: 0;
        height: 40px;
        background: #F9FCFF;
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
    ::v-deep .el-dialog__body{
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }
    .invoice-input{
      span{
        flex: 0 0 68px;
      }
    }
  }
}
</style>
