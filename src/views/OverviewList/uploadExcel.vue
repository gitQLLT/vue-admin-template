<template>
  <div class="main-contain over-hidden">
    <div class="main-content">
      <el-row>
        <el-col :span="7">
          <div class="search-contain">
            <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
          </div>
        </el-col>
        <el-col :span="15">
          <div class="table-container">
            <el-table
              v-loading="listLoading"
              :data="tableData"
              class="tableList"
              style="width: 100%"
              cell-class-name="tableRowStyle"
              header-cell-class-name="tableHeaderStyle"
            >
              <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item" />
            </el-table>
          </div>
        </el-col>
        <el-col :span="2">
          <div class="btn-contain">
            <div class="born-plan text-center cursor">保存</div>
          </div>
        </el-col>
      </el-row>
      <div class="pagination-container">
        <pagination :total="total" :page.sync="searchQuery.pageNum" :limit.sync="searchQuery.pageSize" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'UploadExcel',
  components: {
    UploadExcelComponent,
    Pagination
  },
  data() {
    return {
      listLoading: false,
      searchQuery: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      excelData: [],
      tableHeader: []
    }
  },

  computed: {
    tableData() {
      const start = (this.searchQuery.pageNum - 1) * 10
      return this.excelData.slice(start, start + this.searchQuery.pageSize)
    }
  },

  methods: {
    getList() {},
    /* 导入数据 */
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1
      if (isLt1M) {
        return true
      }
      this.$message({
        message: 'Please do not upload files larger than 1m in size.',
        type: 'warning'
      })
      return false
    },

    handleSuccess({ results, header }) {
      this.showImport = true
      this.excelData = this.excelData.concat(results)
      this.total = this.excelData.length
      this.tableHeader = header
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
      background: #FFFFFF;
      margin-right: 25px;
      border-radius: 5px;
    }
  }
  .btn-contain{
    min-height: calc(100vh - 199px);
    background: #FFFFFF;
    margin-left: 25px;
  }
  .born-plan{
    display: inline-block;
    width: 100%;
    height: 32px;
    background: #66A3FF;
    border: 1px solid rgba(0, 0, 0, 0.15);
    font-size: 13px;
    font-weight: 400;
    color: #FFFFFF;
    line-height: 32px;
  }
}
::v-deep .el-table.tableList{
  min-height: calc(100vh - 199px);
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
