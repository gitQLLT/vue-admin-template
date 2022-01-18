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
          <span class="expand-detail text-center cursor float-right" @click="appendSend">合并发货</span>
        </el-form>
      </div>
      <div class="table-container">
        <el-table
          ref="planTable"
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
                <el-table-column type="selection" :selectable="selectInit1" width="75" align="right" />
                <el-table-column prop="seq" label="行号" width="80" align="center" />
                <el-table-column prop="purchaseNumber" label="采购单号" width="160" />
                <el-table-column prop="materialCode" label="物料编码" width="160" />
                <el-table-column prop="materialName" label="物料名称" width="320" />
                <el-table-column prop="brand" label="品牌" width="100" />
                <el-table-column prop="texture" label="材质" width="100" />
                <el-table-column prop="packs" label="包装量" width="100" />
                <el-table-column prop="boxes" label="件数" width="100" />
                <el-table-column prop="unitName" label="单位" width="100" />
                <el-table-column prop="purchaseQuantity" label="采购数量" width="120" />
                <el-table-column prop="planQuantity" label="计划发货数量" />
              </el-table>
            </template>
          </el-table-column>
          <el-table-column type="selection" :selectable="selectInit" width="55" />
          <el-table-column label="序号" type="index" width="60" />
          <el-table-column label="计划编号" width="160" prop="number" />
          <el-table-column label="收货仓库" width="120" prop="address" />
          <el-table-column label="计划日期" width="120">
            <template slot-scope="scope">
              {{ scope.row.sendDate ? scope.row.sendDate.substring(0,10) : '' }}
            </template>
          </el-table-column>
          <el-table-column label="提交日期" width="120">
            <template slot-scope="{row}">
              {{ row.creationDate ? row.creationDate.substring(0,10) : '' }}
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template slot-scope="{row}">
              <p :class="[row.status===0 ? 'srm-red' : '']">
                {{ row.status | status }}
              </p>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60">
            <template slot-scope="scope">
              <p>
                <el-link
                  v-if="scope.row.status === 0"
                  :underline="false"
                  @click.stop="sendOrder(scope.$index, scope.row)"
                >
                  发货
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
  </div>
</template>

<script>
import { deliveryPlan } from '@/api/procurement/sendplan'
import { getSelected } from '@/utils/select.js'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'PlanSend', /* 发货计划，需要与路由name一致 */
  components: {
    Pagination
  },
  filters: {
    // 列表状态
    status(val) {
      switch (parseInt(val)) {
        case 0: return '待处理'
        case 1: return '已发货'
        case 2: return '完成'
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
        number: undefined
      },
      total: 0,
      tableData: [],
      options: [
        {
          label: '全部',
          value: ''
        },
        {
          label: '待处理',
          value: '0'
        },
        {
          label: '已发货',
          value: '1'
        },
        {
          label: '完成',
          value: '2'
        }
      ],
      selectListId: []
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
      deliveryPlan(this.searchQuery).then(res => {
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

    /* 点击行数据进入详情 */
    rowClick(row) {
      if (getSelected()) return
      this.$router.push({ path: '/pdetail/plansendDetail', query: { id: row.id, planType: '0' }})
    },

    /* 合并发货 */
    appendSend() {
      if (this.selectListId.length < 1) {
        this.$message({
          message: '请先选择发货计划',
          type: 'warning'
        })
        return false
      }
      const selectable = this.$refs.planTable.selection
      const orderId = selectable[0].id
      const ids = this.selectListId.toString()
      /* orderId用于查询详情头部数据，isMerge区别单行发货和多行发货 */
      this.$router.push({ path: '/pdetail/plansendDetail', query: { ids: ids, orderId, planType: '1', isMerge: true }})
    },

    /* 单行数据发货 */
    sendOrder(index, row) {
      this.$router.push({ path: '/pdetail/plansendDetail', query: { ids: row.id.toString(), orderId: row.id, planType: '1' }})
    },

    // 一级表格勾选
    handleSelectionChange(selection, row) {
      const result = selection.some(item => item.id === row.id) // true-勾选，false-取消勾选
      const indexOf = parseInt(this.tableData.indexOf(row))
      const tempList = row.details
      if (result) {
        if (tempList.length) {
          let reNum = 0
          for (let i = 0; i < tempList.length; i++) {
          // 跳过最后一个元素的比较
            if (i + 1 === tempList.length) {
              continue
            }
            // 判断相邻的元素是否相同
            if (tempList[i].receiveOrgId !== tempList[i + 1].receiveOrgId || tempList[i].settleOrgId !== tempList[i + 1].settleOrgId) {
              reNum += 1
            }
          }
          if (reNum > 0) {
            this.$refs.planTable.toggleRowSelection(row, false)
            this.$message({
              message: '合并发货时供应商、收货组织、结算组织、采购组织必须一致',
              type: 'warning'
            })
            return false
          }
          if (selection.length > 1) {
            if (row.supplierId === selection[0].supplierId && row.purchaseOrgId === selection[0].purchaseOrgId) {
              if (row.details[0].receiveOrgId === selection[0].details[0].receiveOrgId &&
                row.details[0].settleOrgId === selection[0].details[0].settleOrgId) {
                this.$refs.planTable.toggleRowExpansion(row, true)
                this.$nextTick(() => {
                  tempList.forEach(item => {
                    this.selectListId.push(item.id)
                    this.$refs[`tableChild${indexOf}`].toggleRowSelection(item, true)
                  })
                })
              } else {
                this.$refs.planTable.toggleRowSelection(row, false)
                this.$message({
                  message: '合并发货时供应商、收货组织、结算组织、采购组织必须一致',
                  type: 'warning'
                })
              }
            } else {
              this.$refs.planTable.toggleRowSelection(row, false)
              this.$message({
                message: '合并发货时供应商、收货组织、结算组织、采购组织必须一致',
                type: 'warning'
              })
            }
          } else {
            this.$refs.planTable.toggleRowExpansion(row, true)
            this.$nextTick(() => {
              tempList.forEach(item => {
                this.selectListId.push(item.id)
                this.$refs[`tableChild${indexOf}`].toggleRowSelection(item, true)
              })
            })
          }
        }
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

    // 二级表格勾选
    handleChildrenChange(selection, row) {
      const result = selection.some(item => item.id === row.id)
      if (result) {
        this.tableData.forEach((item, index) => {
          if (item.key === row.key) {
            this.$refs.planTable.toggleRowSelection(item, true)
          }
        })
        const _selectData = this.$refs.planTable.selection
        if (_selectData.length > 1) {
          const firstRow = _selectData[0]
          const currenRow = _selectData[_selectData.length - 1]
          const indexOf1 = parseInt(this.tableData.indexOf(firstRow))
          const indexOf = parseInt(this.tableData.indexOf(currenRow))
          const _selectData1 = this.$refs[`tableChild${indexOf1}`].selection
          if (currenRow.supplierId === firstRow.supplierId && currenRow.purchaseOrgId === firstRow.purchaseOrgId) {
            if (row.receiveOrgId === _selectData1[0].receiveOrgId &&
                row.settleOrgId === _selectData1[0].settleOrgId) {
              this.selectListId.push(row.id)
            } else {
              if (selection.length === 1) {
                this.$refs.planTable.toggleRowSelection(currenRow, false)
              }
              this.$refs[`tableChild${indexOf}`].toggleRowSelection(row, false)
              this.$message({
                message: '合并发货时供应商、收货组织、结算组织、采购组织必须一致',
                type: 'warning'
              })
            }
          } else {
            if (selection.length === 1) {
              this.$refs.planTable.toggleRowSelection(currenRow, false)
            }
            this.$refs[`tableChild${indexOf}`].toggleRowSelection(row, false)
            this.$message({
              message: '合并发货时供应商、收货组织、结算组织、采购组织必须一致',
              type: 'warning'
            })
          }
        } else {
          this.$refs.planTable.toggleRowSelection(_selectData[0], true)
          const indexOf = parseInt(this.tableData.indexOf(_selectData[0]))
          if (selection.length > 1) {
            let reNum = 0
            for (let i = 0; i < selection.length; i++) {
              // 跳过最后一个元素的比较
              if (i + 1 === selection.length) {
                continue
              }
              // 判断相邻的元素是否相同
              if (selection[i].receiveOrgId !== selection[i + 1].receiveOrgId || selection[i].settleOrgId !== selection[i + 1].settleOrgId) {
                reNum += 1
                break
              }
            }
            if (reNum > 0) {
              this.$refs[`tableChild${indexOf}`].toggleRowSelection(row, false)
              this.$message({
                message: '合并发货时供应商、收货组织、结算组织、采购组织必须一致',
                type: 'warning'
              })
            } else {
              this.selectListId.push(row.id)
            }
          } else {
            this.selectListId.push(row.id)
          }
        }
      } else {
        const isin = this.selectListId.indexOf(row.id)
        if (isin !== -1) {
          this.selectListId.splice(isin, 1)
        }
        if (!selection.length) {
          this.tableData.forEach((item, index) => {
            if (item.key === row.key) {
              this.$refs.planTable.toggleRowSelection(item, false)
            }
          })
        }
      }
    },

    // 一级全选
    handleAllSelection(selection) {
      this.selectListId = []
      let reNum = 0
      const detailsList = []
      for (let i = 0; i < selection.length; i++) {
        if (reNum > 0) {
          break
        }
        const tempList = selection[i].details
        for (let j = 0; j < tempList.length; j++) {
          detailsList.push(tempList[j])
          if (j + 1 === tempList.length) {
            continue
          }
          if (tempList[j].receiveOrgId !== tempList[j + 1].receiveOrgId || tempList[j].settleOrgId !== tempList[j + 1].settleOrgId) {
            reNum += 1
            break
          }
        }
        // 跳过最后一个元素的比较
        if (i + 1 === selection.length) {
          continue
        }
        // 判断相邻的元素是否相同
        if (selection[i].supplierId !== selection[i + 1].supplierId || selection[i].purchaseOrgId !== selection[i + 1].purchaseOrgId) {
          reNum += 1
          break
        }
      }

      for (let i = 0; i < detailsList.length; i++) {
        if (i + 1 === detailsList.length) {
          continue
        }
        if (detailsList[i].receiveOrgId !== detailsList[i + 1].receiveOrgId ||
          detailsList[i].settleOrgId !== detailsList[i + 1].settleOrgId) {
          reNum += 1
          break
        }
      }
      if (reNum > 0) {
        this.$refs.planTable.clearSelection()
        this.$message({
          message: '列表中有不一致的值，不能全选',
          type: 'warning'
        })
      } else {
        this.tableData.forEach(async(item, index) => {
          await this.$refs.planTable.toggleRowExpansion(item, true)
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
    },

    /* status不满足无法勾选 */
    selectInit(row, index) {
      if (row.status === 0) {
        return true
      } else {
        this.tableData[index].details.forEach(item => {
          item['select'] = 'nocheck'
        })
        return false
      }
    },
    /* 二级表格勾选筛选 */
    selectInit1(row, index) {
      if (row.select !== 'nocheck') {
        return true
      } else {
        return false
      }
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
      .expand-detail{
        width: 88px;
        height: 32px;
        font-size: 13px;
        font-weight: 400;
        color: #FFFFFF;
        line-height: 32px;
        background: #66A3FF;
        margin-right: 8px;
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
