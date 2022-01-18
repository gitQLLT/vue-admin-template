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
        </el-form>
      </div>
      <div class="table-container">
        <el-table
          ref="tableList"
          v-loading="listLoading"
          :data="tableData"
          class="tableList"
          style="width: 100%"
          cell-class-name="tableRowStyle"
          header-cell-class-name="tableHeaderStyle"
          @row-click="rowClick"
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
              >
                <el-table-column prop="seq" label="行号" width="120" align="center" />
                <el-table-column prop="purchaseNumber" label="采购单号" width="120" />
                <el-table-column prop="materialCode" label="物料编码" width="120" />
                <el-table-column prop="materialName" label="物料名称" width="300" />
                <el-table-column prop="brand" label="品牌" width="80" />
                <el-table-column prop="texture" label="材质" width="80" />
                <el-table-column prop="packs" label="包装量" width="80" />
                <el-table-column prop="unitName" label="单位" width="80" />
                <el-table-column prop="price" label="单价" width="80" />
                <el-table-column prop="totalPrice" label="金额" width="80" />
                <el-table-column prop="boxes" label="件数" width="80" />
                <el-table-column prop="purchaseQuantity" label="采购数量" width="80" />
                <el-table-column prop="deliveryQuantity" label="发货数量" width="80" />
                <el-table-column prop="receiveQuantity" label="收货数量" width="80" />
                <el-table-column prop="checkQuantity" label="合格数量" width="80" />
                <el-table-column prop="instockQuantity" label="入库数量" />
              </el-table>
            </template>
          </el-table-column>
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="联系方式" width="140" prop="receiverTel" />
          <el-table-column label="交货单号" width="160" prop="number" />
          <el-table-column label="送货物流" width="120" prop="logisticsName" />
          <el-table-column label="物流单号" width="160" prop="trackingNumber" />
          <el-table-column label="送货地址" width="140" prop="address" />
          <el-table-column label="发货日期" width="120">
            <template slot-scope="{row}">
              {{ row.date ? row.date.substring(0,10) : '' }}
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <p>{{ scope.row.status | status }}</p>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <p>
                <el-link
                  :underline="false"
                  @click.stop="deliveryDetail(scope.$index, scope.row)"
                >详情
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
import { deliveryOrder } from '@/api/procurement/delivery'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { getSelected } from '@/utils/select.js'
export default {
  name: 'Delivery', /* 交货列表，需要与路由name一致 */
  components: {
    Pagination
  },
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
          label: '已发货',
          value: '0'
        },
        {
          label: '已收货',
          value: '1'
        },
        {
          label: '待确认',
          value: '2'
        },
        {
          label: '已确认',
          value: '3'
        }
      ]
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
      deliveryOrder(this.searchQuery).then(res => {
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

    /* 跳转交货详情 */
    deliveryDetail(index, row) {
      this.$router.push({ path: '/pdetail/deliveryDetail', query: { id: row.id }})
    },

    /* 选中列表行数据 */
    rowClick(row) {
      if (getSelected()) return
      this.$refs.tableList.toggleRowExpansion(row)
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
        font-size: 13px;
        font-weight: 400;
        color: #44883B;
        line-height: 32px;
        margin-left: 6px;
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
