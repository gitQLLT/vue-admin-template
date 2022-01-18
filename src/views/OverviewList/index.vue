<template>
  <div class="main-contain over-hidden">
    <div class="main-content">
      <div class="search-contain">
        <el-form :inline="true" :model="searchQuery" size="small" label-width="84px">
          <el-form-item>
            <el-input v-model="searchQuery.number" placeholder="请输入关键词" />
          </el-form-item>
          <span class="filter-btn text-center cursor" @click="filterList">搜索</span>
          <div class="option-btn">
            <el-button :loading="exportLoading" class="born-plan text-center cursor padding0" @click="exportView">导出</el-button>
            <el-button class="born-plan1 text-center cursor padding0" @click="importView">导入</el-button>
          </div>
        </el-form>
      </div>
      <div class="table-container">
        <el-table
          ref="overviewTable"
          v-loading="listLoading"
          :data="tableData"
          class="tableList"
          style="width: 100%"
          cell-class-name="tableRowStyle"
          header-cell-class-name="tableHeaderStyle"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="物料名" width="220" prop="materialName" />
          <el-table-column label="品牌" width="120" prop="brand" />
          <el-table-column label="材质" width="120" prop="texture" />
          <el-table-column label="包装量" width="120" prop="packs" />
          <el-table-column width="120" prop="val1">
            <template slot="header" slot-scope="scope">
              <el-checkbox v-model="checked1" @change="check1Change">待交数</el-checkbox>
              <template v-if="scope" />
            </template>
          </el-table-column>
          <el-table-column width="120" prop="val2">
            <template slot="header" slot-scope="scope">
              <el-checkbox v-model="checked2" @change="check2Change">逾期数</el-checkbox>
              <template v-if="scope" />
            </template>
          </el-table-column>
          <el-table-column width="130" prop="val3">
            <template slot="header" slot-scope="scope">
              <el-checkbox v-model="checked3" @change="check2Change">第一周</el-checkbox>
              <template v-if="scope" />
            </template>
          </el-table-column>
          <el-table-column width="130" prop="val4">
            <template slot="header" slot-scope="scope">
              <el-checkbox v-model="checked4" @change="check2Change">第二周</el-checkbox>
              <template v-if="scope" />
            </template>
          </el-table-column>
          <el-table-column width="130" prop="val5">
            <template slot="header" slot-scope="scope">
              <el-checkbox v-model="checked5" @change="check2Change">第三周</el-checkbox>
              <template v-if="scope" />
            </template>
          </el-table-column>
          <el-table-column width="130" prop="val6">
            <template slot="header" slot-scope="scope">
              <el-checkbox v-model="checked6" @change="check2Change">第四周</el-checkbox>
              <template v-if="scope" />
            </template>
          </el-table-column>
          <el-table-column width="130" prop="val7">
            <template slot="header" slot-scope="scope">
              <el-checkbox v-model="checked7" @change="check2Change">下月</el-checkbox>
              <template v-if="scope" />
            </template>
          </el-table-column>
          <el-table-column prop="val8">
            <template slot="header" slot-scope="scope">
              <el-checkbox v-model="checked8" @change="check2Change">下下月</el-checkbox>
              <template v-if="scope" />
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
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'Overview', /* 物料概览，需要与路由name一致 */
  components: {
    Pagination
  },
  data() {
    return {
      listLoading: false,
      exportLoading: false,
      checked1: false,
      checked2: false,
      checked3: false,
      checked4: false,
      checked5: false,
      checked6: false,
      checked7: false,
      checked8: false,
      searchQuery: {
        pageNum: 1,
        pageSize: 10,
        number: undefined
      },
      total: 0,
      tableData: [],
      multipleSelection: []
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
      fetch('https://www.fastmock.site/mock/8f5033d0d4189eefb58ba004bd6733d4/test-01/userlist')
        .then(res => res.json())
        .then(res => {
          if (res.data) {
            this.tableData = res.data.list
            this.total = res.data.total
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

    /* 导入跳转导入页面 */
    importView() {
      this.$router.push('/upload/index')
    },

    // 选中待交数取消其他
    check1Change(val) {
      if (val) {
        this.resetData(true)
      }
    },

    // 选中其他取消待交数
    check2Change(val) {
      if (val) {
        this.checked1 = false
      }
    },

    /* 导出数据 */
    exportView() {
      if (this.multipleSelection.length < 1) {
        this.$message({
          message: '请先选择概览数据',
          type: 'warning'
        })
        return false
      }
      this.exportLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['物料名', '品牌', '材质', '包装量', '发货数']
        const filterVal = ['materialName', 'brand', 'texture', 'packs', 'totalNum']
        const list = this.filterData(this.multipleSelection)
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '物料概览'
        })
        this.$refs.overviewTable.clearSelection()
        this.resetData()
        this.exportLoading = false
      })
    },
    // 列选择数据筛选
    filterData(selectionData) {
      if (this.checked1) {
        selectionData.forEach(item => {
          item.totalNum = item.val1
        })
      } else {
        selectionData.forEach(item => {
          if (!item.totalNum) { item.totalNum = 0 }
          if (this.checked2) { item.totalNum += Number(item.val2) }
          if (this.checked3) { item.totalNum += Number(item.val3) }
          if (this.checked4) { item.totalNum += Number(item.val4) }
          if (this.checked5) { item.totalNum += Number(item.val5) }
          if (this.checked6) { item.totalNum += Number(item.val6) }
          if (this.checked7) { item.totalNum += Number(item.val7) }
          if (this.checked8) { item.totalNum += Number(item.val8) }
        })
      }
      return selectionData
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },

    /* 重置数据 */
    resetData(noone) {
      this.checked1 = false
      this.checked2 = false
      this.checked3 = false
      this.checked4 = false
      this.checked5 = false
      this.checked6 = false
      this.checked7 = false
      this.checked8 = false
      if (noone) {
        this.checked1 = true
      }
    },

    /* 选中列表数据 */
    handleSelectionChange(val) {
      this.multipleSelection = val
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
