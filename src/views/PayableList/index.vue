<template>
  <div class="main-contain over-hidden">
    <div class="main-content">
      <div class="search-contain">
        <el-form :inline="true" :model="searchQuery" size="small" label-width="84px">
          <el-form-item>
            <el-date-picker
              v-model="searchQuery.beginDate"
              value-format="yyyy/MM/dd"
              size="small"
              :clearable="false"
              type="date"
              placeholder="开始日期"
            />
            <span>至</span>
            <el-date-picker
              v-model="searchQuery.endDate"
              value-format="yyyy/MM/dd"
              size="small"
              :clearable="false"
              type="date"
              placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchQuery.status" placeholder="全部" clearable>
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="searchQuery.number" placeholder="请输入关键词" />
          </el-form-item>
          <span class="filter-btn text-center cursor" @click="filterList">搜索</span>
          <el-form-item label="搜索物料">
            <el-input v-model="searchQuery.materialCode" placeholder="请输入" readonly @focus="materialSearch">
              <template slot="suffix">
                <img class="cursor mt-8" :src="require('@/assets/icon/search-icon.png')" alt="" @click="keySearch">
              </template>
            </el-input>
          </el-form-item>
          <div class="option-btn">
            <span class="born-plan text-center cursor" @click="confirmPay">确认</span>
            <span class="born-plan1 text-center cursor" @click="selMakeVoice">选择开票</span>
          </div>
        </el-form>
      </div>
      <div class="table-container">
        <el-table
          ref="payableTable"
          v-loading="listLoading"
          :data="tableData"
          class="tableList"
          style="width: 100%"
          cell-class-name="tableRowStyle"
          header-cell-class-name="tableHeaderStyle"
          @row-click="rowClick"
          @expand-change="expandChange"
          @select="handleSelectionChange"
          @select-all="handleAllSelection"
        >
          <!-- 展开表格 -->
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-table
                :ref="'tableChild' + props.$index"
                :data="props.row.details"
                style="width: 100%"
                cell-class-name="tableRowStyle1"
                header-cell-class-name="tableHeaderStyle1"
                :border="false"
                @select="handleChildrenChange"
              >
                <el-table-column type="selection" width="75" align="right" />
                <el-table-column prop="seq" label="行号" width="80" align="center" />
                <el-table-column prop="materialCode" label="物料编码" width="160" />
                <el-table-column prop="materialName" label="物料名称" width="320" />
                <el-table-column prop="unitName" label="单位" width="100" />
                <el-table-column prop="price" label="单价" width="100" />
                <el-table-column prop="quantity" label="数量" width="100" />
                <el-table-column prop="taxPrice" label="含税单价" width="120" />
                <el-table-column prop="excludeTaxPrice" label="不含税金额" width="120" />
                <el-table-column prop="taxAmount" label="税额" width="120" />
                <el-table-column prop="allAmount" label="价税合计" width="120" />
                <el-table-column prop="payableAmount" label="应付金额" />
              </el-table>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" type="index" width="60" />
          <el-table-column label="单号" width="120" prop="number" />
          <el-table-column label="除税金额" width="120" prop="excludeTaxAmount" />
          <el-table-column label="总金额" width="120" prop="allAmount" />
          <el-table-column label="税额" width="120" prop="taxAmount" />
          <el-table-column label="已确认金额" width="120" prop="taxAmount" />
          <el-table-column label="类型" width="120" prop="val8" />
          <el-table-column label="状态" width="100" prop="status">
            <template slot-scope="scope">
              <p>{{ scope.row.status | status }}</p>
            </template>
          </el-table-column>
          <el-table-column label="业务日期" width="120">
            <template slot-scope="scope">
              {{ scope.row.date ? scope.row.date.substring(0,10) : '' }}
            </template>
          </el-table-column>
          <el-table-column label="到期日">
            <template slot-scope="scope">
              {{ scope.row.dueDate ? scope.row.dueDate.substring(0,10) : '' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="110">
            <template slot-scope="scope">
              <p>
                <el-link
                  :underline="false"
                  style="margin-right:10px"
                  @click.stop="payableDetail(scope.$index, scope.row)"
                >详情
                </el-link>
                <el-link
                  v-if="scope.row.status === 1"
                  :underline="false"
                  @click.stop="makeInvoice(scope.$index, scope.row)"
                >开票
                </el-link>
                <el-link
                  v-if="scope.row.status === 0"
                  :underline="false"
                  @click.stop="sureOrder(scope.$index, scope.row)"
                >确认
                </el-link>
              </p>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <pagination v-show="total>0" :total="total" :page.sync="searchQuery.pageNum" :limit.sync="searchQuery.pageSize" @pagination="getList" />
      </div>
    </div>

    <!-- 开票弹出框 -->
    <el-dialog title="开票" :visible.sync="dialogVisible" width="480px">
      <el-form
        ref="invoiceForm"
        :rules="rules"
        :model="invoiceForm"
        label-width="80px"
      >
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

    <material-search :show.sync="showVisible" />
  </div>
</template>

<script>
import { payableOrder, confirmByOrder, confirmByDetail, invoiceSave } from '@/api/procurement/payable'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import MaterialSearch from '@/components/MaterialSearch'
import { getSelected } from '@/utils/select.js'
export default {
  name: 'Payable', /* 应付列表，需要与路由name一致 */
  components: {
    Pagination,
    MaterialSearch
  },
  filters: {
    status(val) {
      switch (parseInt(val)) {
        case 0: return '待确认'
        case 1: return '已确认'
        case 2: return '部分确认'
      }
    }
  },
  data() {
    return {
      listLoading: false,
      searchQuery: {
        pageNum: 1,
        pageSize: 10,
        beginDate: undefined,
        endDate: undefined,
        status: undefined,
        number: undefined,
        materialCode: undefined
      },

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

      total: 0,
      tableData: [],
      options: [
        {
          label: '全部',
          value: ''
        },
        {
          label: '待确认',
          value: '0'
        },
        {
          label: '已确认',
          value: '1'
        },
        {
          label: '部分确认',
          value: '2'
        }
      ],
      selectListId: [],
      multiSelect: [],
      selectDetailId: [],
      dialogVisible: false,
      showVisible: false
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
      payableOrder(this.searchQuery).then(res => {
        if (res.data) {
          this.tableData = res.data.list
          this.total = res.data.total
          // 处理数据加key值,用于二级选择
          this.tableData.forEach(item => {
            const key = item.id + item.number
            item['key'] = key
            item.details.forEach(item1 => {
              item1['key'] = key
            })
          })
        }
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 300)
      }).catch(error => {
        console.log(error)
      })
    },

    /* 列表筛选 */
    filterList() {
      this.searchQuery.page = 1
      this.getList()
    },

    /* 物料搜索 */
    materialSearch() {
      this.showVisible = true
    },

    /* 关键字搜索 */
    keySearch() {
      this.searchQuery.page = 1
      this.getList()
    },

    /* 展开时判断子表选中 */
    expandChange(row, expandRows) {
      const result1 = expandRows.some(item => item.id === row.id) // 是否展开本行
      if (result1) {
        this.$nextTick(() => {
          const tempList = row.details
          const indexOf = parseInt(this.tableData.indexOf(row))
          if (this.selectListId.length) {
            tempList.forEach((item, index) => {
              if (this.selectListId.indexOf(item.id) > -1) {
                this.$refs[`tableChild${indexOf}`].toggleRowSelection(item, true)
              } else {
                this.$refs[`tableChild${indexOf}`].toggleRowSelection(item, false)
              }
            })
          }
        })
      }
    },

    /* 选中列表行数据 */
    rowClick(row) {
      if (getSelected()) return
      this.$refs.payableTable.toggleRowExpansion(row)
    },

    /* 确认应付 */
    confirmPay() {
      if (this.selectListId.length < 1) {
        this.$message({
          message: '请先选择应付订单',
          type: 'warning'
        })
        return false
      }
      this.multiSelect = this.$refs.payableTable.selection
      if (this.multiSelect.some(item => { return item.status !== 0 })) {
        this.$message({
          message: '请选择未确认应付订单',
          type: 'warning'
        })
        return false
      }
      const ids = []
      this.multiSelect.forEach(item => {
        ids.push(item.id)
      })
      confirmByOrder({ ids }).then(res => {
        this.$message({
          message: res.message,
          type: 'success'
        })
        this.getList()
      }).catch(error => {
        console.log(error)
      })
    },

    /* 选择开票 */
    selMakeVoice() {
      if (this.selectListId.length < 1) {
        this.$message({
          message: '请先选择应付订单',
          type: 'warning'
        })
        return false
      }
      this.multiSelect = this.$refs.payableTable.selection
      if (this.multiSelect.some(item => { return item.status === 0 })) {
        this.$message({
          message: '请选择已确认应付订单',
          type: 'warning'
        })
        return false
      }
      let amount = 0
      this.multiSelect.forEach(item => {
        amount += Number(item.allAmount)
      })
      this.invoiceForm.amount = amount
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

    /* 跳转应付详情 */
    payableDetail(index, row) {
      this.$router.push({ path: '/pdetail/payableDetail', query: { id: row.id }})
    },

    /* 应付开票 */
    makeInvoice(index, row) {
      this.invoiceForm.amount = row.allAmount
      this.dialogVisible = true
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

    /* 选中列表数据 */
    handleSelectionChange(selection, row) {
      const result = selection.some(item => item.id === row.id) // true-勾选，false-取消勾选
      const indexOf = parseInt(this.tableData.indexOf(row))
      const tempList = row.details
      if (result) {
        this.$refs.payableTable.toggleRowExpansion(row, true)
        this.$nextTick(() => {
          tempList.forEach(item => {
            this.selectListId.push(item.id)
            this.$refs[`tableChild${indexOf}`].toggleRowSelection(item, true)
          })
        })
      } else {
        tempList.forEach(item => {
          const isin = this.selectListId.indexOf(item.id)
          if (isin !== -1) {
            this.selectListId.splice(isin, 1)
          }
        })
        if (this.$refs[`tableChild${indexOf}`]) { this.$refs[`tableChild${indexOf}`].clearSelection() }
      }
    },

    /* 二级表格勾选 */
    handleChildrenChange(selection, row) {
      const result = selection.some(item => item.id === row.id)
      if (result) {
        this.tableData.forEach((item, index) => {
          if (item.key === row.key) {
            this.$refs.payableTable.toggleRowSelection(item, true)
          }
        })
        this.selectListId.push(row.id)
      } else {
        const isin = this.selectListId.indexOf(row.id)
        if (isin !== -1) {
          this.selectListId.splice(isin, 1)
        }
        if (!selection.length) {
          this.tableData.forEach((item, index) => {
            if (item.key === row.key) {
              this.$refs.payableTable.toggleRowSelection(item, false)
            }
          })
        }
      }
    },

    /* 表格全选 */
    handleAllSelection(selection) {
      this.tableData.forEach(async(item, index) => {
        await this.$refs.payableTable.toggleRowExpansion(item, true)
        // 判断取消还是勾选--取消清空选择数据
        if (selection.length) {
          item.details.forEach(item => {
            this.selectListId.push(item.id)
          })
          this.$refs[`tableChild${index}`].clearSelection()
          this.$refs[`tableChild${index}`].toggleAllSelection()
        } else {
          this.$refs[`tableChild${index}`].clearSelection()
        }
      })
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
    .search-contain{
      margin-bottom: 16px;
      background: #FFFFFF;
      border: 1px solid #D7D8D9;
      ::v-deep .el-form{
        padding: 14px;
        .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
          margin-bottom: 0;
        }
      }
      .option-btn{
        float: right;
        .born-plan{
          display: inline-block;
          width: 90px;
          height: 32px;
          background: #66A3FF;
          border: 1px solid rgba(0, 0, 0, 0.15);
          font-size: 13px;
          font-weight: 400;
          color: #FFFFFF;
          line-height: 32px;
          margin-right: 18px;
        }
        .born-plan1{
          display: inline-block;
          width: 90px;
          height: 32px;
          color: #66A3FF;
          border: 1px solid rgba(0, 0, 0, 0.15);
          font-size: 13px;
          font-weight: 400;
          background: #FFFFFF;
          line-height: 32px;
        }
      }
    }
  }
}
::v-deep .el-table.tableList{
  min-height: calc(100vh - 278px);
  .el-table__expand-icon{
    height: 52px;
  }
  .el-table__expanded-cell{
    padding: 0 0 0 30px;
    thead{
      .el-table-column--selection{
        .el-checkbox{
          display: none;
        }
      }
    }
  }
}

.pagination-container {
  padding: 16px;
  background: #fbfbfb;
  border: 1px solid #e8e8e8;
  text-align: right;
  .el-pagination {
    padding: 0;
  }
}
</style>
