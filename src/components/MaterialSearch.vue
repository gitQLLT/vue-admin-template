<template>
  <el-dialog title="物料搜索" :visible.sync="visible" @close="$emit('update:show',false)">
    <el-input v-model="searchQuery.keyword" placeholder="请输入内容" class="search-input bottom-12" style="width: 320px">
      <template slot="append">
        <el-button size="small" @click="handleSearchList">搜索</el-button>
      </template>
    </el-input>

    <!--  数据表格  -->
    <el-table
      ref="mainTable"
      v-loading="listLoading"
      :data="list"
      width="100%"
      cell-class-name="tableRowStyle"
      header-cell-class-name="tableHeaderStyle"
      @select="handleSelectionChange"
      @select-all="handleSelectionAll"
    >
      <el-table-column
        type="selection"
        width="50"
      />
      <el-table-column
        label="序号"
        type="index"
        width="50"
      />
      <el-table-column label="编码" width="120px">
        <template slot-scope="scope">{{ scope.row.code }}</template>
      </el-table-column>
      <el-table-column label="名称">
        <template slot-scope="scope">
          <div class="material-name">
            <span :title="scope.row.name">
              {{ scope.row.name }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="产品类型" width="100">
        <template slot-scope="scope">{{ scope.row.type }}</template>
      </el-table-column>
      <el-table-column label="标准" width="120">
        <template slot-scope="scope">{{ scope.row.standard }}</template>
      </el-table-column>
      <el-table-column label="螺纹规格" width="80">
        <template slot-scope="scope">{{ scope.row.syLwg }}</template>
      </el-table-column>
      <el-table-column label="机械性能" width="80">
        <template slot-scope="scope">{{ scope.row.performance }}</template>
      </el-table-column>
      <el-table-column label="表面处理" width="80">
        <template slot-scope="scope">{{ scope.row.surfaceTreatment }}</template>
      </el-table-column>
      <el-table-column label="牙型" width="80">
        <template slot-scope="scope">{{ scope.row.toothMould }}</template>
      </el-table-column>
      <el-table-column label="材质" width="80">
        <template slot-scope="scope">{{ scope.row.texture }}</template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="searchQuery.pageNum"
        :limit.sync="searchQuery.pageSize"
        @pagination="getList"
      />
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:show',false)">取 消</el-button>
      <el-button type="primary" @click="confirmMaterial">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { materialQuery } from '@/api/procurement/material'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'MaterailSearch',
  components: {
    Pagination
  },
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      listLoading: false,
      list: [],
      visible: this.show, // 初始化赋值
      searchQuery: {
        pageNum: 1,
        pageSize: 10,
        keyword: ''
      },
      total: 0
    }
  },

  watch: {
    show() {
      if (this.show) {
        this.getList()
      }
      this.visible = this.show
    }
  },

  created() {
  },

  methods: {
    handleSearchList() {
      this.searchQuery.pageNum = 1
      this.getList()
    },
    getList() {
      this.listLoading = true
      materialQuery(this.searchQuery, {}).then(response => {
        this.listLoading = false
        this.list = response.data.list
        this.total = response.data.total
      })
    },
    handleSelectionChange(selection, row) {

    },
    handleSelectionAll(selection) {

    },
    confirmMaterial() {
      this.$emit('update:show', false)
    }
  }
}
</script>

<style scoped>
::v-deep .search-input .el-input__inner{
  height: 32px;
  line-height: 32px;
}
.search-input .el-button{
  height: 32px;
}
.el-input-group__append .el-button{
  width: 88px;
  height: 32px;
  background: #1890FF;
  font-size: 14px;
  font-weight: 400;
  color: #FFFFFF;
}
.pagination-container{
  margin-top: 12px;
  text-align: right;
}
.el-pagination{
  padding: 0;
}
</style>
