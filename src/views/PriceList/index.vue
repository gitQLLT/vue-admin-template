<template>
  <div class="main-contain over-hidden">
    <div class="main-content">
      <div class="search-contain">
        <el-form :inline="true" :model="searchQuery" size="small">
          <el-form-item>
            <el-input v-model="searchQuery.value3" placeholder="请输入关键词" />
          </el-form-item>
          <span class="filter-btn text-center cursor" @click="handleFilter">搜索</span>
          <div class="option-btn">
            <el-upload
              class="import-excel"
              action=""
              :on-change="handleChange"
              :file-list="fileListUpload"
              :show-file-list="false"
              accept=".xls,.xlsx"
              :auto-upload="false"
            >
              <span class="text-center cursor">导入数据</span>
            </el-upload>
            <span class="save-order text-center cursor">保存提交</span>
          </div>
        </el-form>
      </div>
      <div class="table-container">
        <el-table v-loading="listLoading" :data="tableData" class="tableList" style="width: 100%">
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="物料名称" width="320" prop="val1" />
          <el-table-column label="材质" width="100" prop="val2" />
          <el-table-column label="单位" width="100" prop="val3" />
          <el-table-column label="原价" width="120" prop="val4" />
          <el-table-column label="最新价格" width="120" prop="val5">
            <template slot-scope="scope">
              <template v-if="scope.row.edit">
                <el-input v-model="scope.row.val5" class="edit-input" size="small" />
              </template>
              <span v-else>{{ scope.row.val5 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="更新日期" width="120" prop="val6" />
          <el-table-column label="状态" prop="val7" />
          <el-table-column label="操作" width="160">
            <template slot-scope="scope">
              <p>
                <el-link
                  v-if="scope.row.edit"
                  :underline="false"
                  style="margin-right:10px"
                  @click.stop="handleEdit(scope.$index, scope.row)"
                >保存
                </el-link>
                <el-link
                  v-else
                  :underline="false"
                  style="margin-right:10px"
                  @click.stop="scope.row.edit=!scope.row.edit"
                >编辑
                </el-link>
                <el-link
                  :underline="false"
                  @click.stop="viewLoop(scope.$index, scope.row)"
                >查看记录
                </el-link>
              </p>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <pagination v-show="total>0" :total="total" :page.sync="searchQuery.page" :limit.sync="searchQuery.limit" @pagination="getList" />
      </div>
      <!-- 查看记录弹出框 -->
      <el-dialog title="查看记录" :visible.sync="dialogVisible" width="320px">
        <div style="height:308px;">
          <el-scrollbar style="height:100%">
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in activities"
                :key="index"
                :icon="activity.icon"
                :type="activity.type"
                :color="activity.color"
                :size="activity.size"
                :timestamp="activity.timestamp | dateDesc"
              >
                单价：{{ activity.content }}<span class="slot-item">单位：个</span>
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'Price', /* 价格列表，需要与路由name一致 */
  components: {
    Pagination
  },

  filters: {
    dateDesc(data) {
      return '更改时间：' + data
    }
  },
  data() {
    return {
      listLoading: false,
      searchQuery: {
        page: 1,
        limit: 20,
        value3: undefined
      },
      total: 1,
      tableData: [],
      options: [
        {
          label: '全部',
          name: '全部'
        }
      ],
      activities: [{
        content: '235.90',
        timestamp: '2018-04-12 20:46',
        color: '#94d276'
      }, {
        content: '236.90',
        timestamp: '2018-04-03 20:46'
      }, {
        content: '36.90',
        timestamp: '2018-04-03 20:46'
      }, {
        content: '1136.90',
        timestamp: '2018-04-03 20:46'
      }, {
        content: '3226.90',
        timestamp: '2018-04-03 20:46'
      }, {
        content: '336.90',
        timestamp: '2018-04-03 20:46'
      }, {
        content: '306.90',
        timestamp: '2018-04-03 20:46'
      }],
      dialogVisible: false,
      list: [],
      fileListUpload: [],
      fileTemp: [],
      disbtn: false
    }
  },

  activated() {

  },

  mounted() {
    this.tableData.map(v => {
      this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
      v.originalTitle = v.val5 //  will be used when user click the cancel botton
      return v
    })
  },

  methods: {
    getList() {
      /* this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      }) */
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleEdit(index, row) {
      row.edit = false
      row.originalTitle = row.val5
      this.$message({
        message: '更新价格成功',
        type: 'success'
      })
    },
    viewLoop(index, row) {
      this.dialogVisible = true
    },
    // 上传附件
    handleChange(file, fileList) {
      this.fileTemp = file.raw
      this.doBegin()
    },
    doBegin() {
      if ((this.fileTemp.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
      (this.fileTemp.type === 'application/vnd.ms-excel')) {
        this.disbtn = true
        this.importfxx(this.fileTemp)
      } else {
        this.$message({
          type: 'warning',
          message: '附件格式错误，请删除后重新上传！'
        })
      }
    },
    // Excel 转化
    importfxx(obj) {
      const _this = this
      // 通过DOM取文件数据
      this.file = obj
      var rABS = false // 是否将文件读取为二进制字符串
      var f = this.file
      var reader = new FileReader()
      // if (!FileReader.prototype.readAsBinaryString) {
      FileReader.prototype.readAsBinaryString = function(f) {
        var binary = ''
        var rABS = false // 是否将文件读取为二进制字符串
        var pt = this
        var wb // 读取完成的数据
        var outdata
        var reader = new FileReader()
        reader.onload = function(e) {
          var bytes = new Uint8Array(reader.result)
          var length = bytes.byteLength
          for (var i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          var XLSX = require('xlsx')
          if (rABS) {
            /* wb = XLSX.read(btoa(fixdata(binary)), { // 手动转化
              type: 'base64'
            }) */
          } else {
            wb = XLSX.read(binary, {
              type: 'binary'
            })
          }
          outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])// outdata就是你想要的东西
          pt.da = [...outdata]
          const arr = []
          pt.da.map(v => {
            const obj = {}
            obj.val1 = v['物料名称']
            obj.val2 = v['材质']
            obj.val3 = v['单位']
            obj.val4 = v['原价']
            obj.val5 = v['最新价格']
            obj.val6 = v['更新日期']
            obj.val7 = v['状态']
            arr.push(obj)
          })
          _this.tableData = _this.tableData.concat(arr)
          _this.disbtn = false
        }
        reader.readAsArrayBuffer(f)
      }
      if (rABS) {
        reader.readAsArrayBuffer(f)
      } else {
        reader.readAsBinaryString(f)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.main-contain{
  margin-top: 1px;
  .main-content{
    margin-left: 208px;
    overflow: hidden;
    padding: 24px;
    transition: all 0.5s ease;
    .search-contain{
      margin-bottom: 16px;
      background: #FFFFFF;
      border: 1px solid #D7D8D9;
      ::v-deep .el-form{
        padding: 16px;
        .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
          margin-bottom: 0;
        }
      }
      .option-btn{
        float: right;
        .save-order{
          display: inline-block;
          width: 90px;
          height: 32px;
          background: #66A3FF;
          font-size: 13px;
          font-weight: 400;
          color: #FFFFFF;
          line-height: 32px;
        }
        .import-excel{
          display: inline-block;
          width: 88px;
          height: 32px;
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.15);
          margin-right: 12px;
          font-size: 13px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.5);
          line-height: 32px;
          ::v-deep .el-upload{
            width: 100%;
          }
        }
      }
    }
    .table-container{
      ::v-deep .edit-input{
        .el-input__inner{
          padding: 0 3px;
          height: 23px;
          line-height: 23px;
        }
      }
    }
  }
}
::v-deep .el-table.tableList{
  min-height: calc(100vh - 278px);
  .el-table__header{
    th.el-table__cell{
      background: #FBFBFB!important;
    }
  }
}
.pagination-container{
  padding: 16px;
  background: #FBFBFB;
  border: 1px solid #E8E8E8;
  text-align: right;
}
::v-deep .el-dialog{
  .el-dialog__header{
    padding: 16px 22px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  .el-dialog__body{
    padding-top: 6px;
    .el-timeline-item__content{
      font-size: 13px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.85);
      line-height: 18px;
      span{
        font-size: 12px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.5);
        line-height: 17px;
        margin-left: 8px;
      }
    }
  }
}
::v-deep .el-scrollbar__wrap{
  overflow-x: hidden;
  .el-timeline{
    padding-top: 10px;
    padding-left: 5px;
  }
}
</style>
