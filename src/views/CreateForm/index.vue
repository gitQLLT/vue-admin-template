<template>
  <div class="createform">
    <el-container class="fm2-container">
      <el-main class="fm2-main">
        <el-container>
          <el-aside width="250px">
            <div class="component-list">
              <div class="drag-title">基础字段</div>
              <draggable
                v-model="myArray"
                :options="{group:{name: 'itxst',pull:'clone',put:'false'},sort: false}"
                tag="ul"
                @start="onStart"
                @end="onEnd"
              >
                <li v-for="item in myArray" :key="item.id" class="item" @click="addField(item)">
                  {{ item.name }}
                </li>
              </draggable>
            </div>
          </el-aside>
          <el-container class="center-container">
            <el-header height="45px">
              <div class="option-btn">
                <i class="el-icon-back" />
                <i class="el-icon-right" />
              </div>
              <div class="option-teach" @click="teachDrag">操作演示</div>
              <div class="option-teach" @click="clearList">清空</div>
            </el-header>
            <el-main>
              <el-form ref="form" :model="form" label-width="80px">
                <draggable
                  v-model="youArray"
                  group="itxst"
                  ghost-class="ghost"
                  handle=".mover"
                  animation="300"
                >
                  <div
                    v-for="(item,index) in youArray"
                    :key="index"
                    class="item"
                    :class="{active: index===selectIndex}"
                    @click="editField(item,index)"
                  >
                    <span class="mover">
                      <i class="el-icon-rank" />
                    </span>
                    <span class="option">
                      <i title="复制" class="el-icon-copy-document" @click="copyItem(item,index)" />
                      <i title="删除" class="el-icon-delete" @click="deleteItem(item,index)" />
                    </span>
                    <el-form-item v-if="item.id===1" label="单行文本">
                      <el-input />
                    </el-form-item>
                    <el-form-item v-if="item.id===2" label="多行文本">
                      <el-input type="textarea" />
                    </el-form-item>
                    <el-form-item v-if="item.id===3" label="计数器">
                      <el-input-number />
                    </el-form-item>
                    <el-form-item v-if="item.id===4" label="单选框组">
                      <el-radio-group>
                        <el-radio :label="1">备选项</el-radio>
                        <el-radio :label="3">备选项</el-radio>
                        <el-radio :label="3">备选项</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </div>
                </draggable>
              </el-form>
            </el-main>
          </el-container>
          <el-aside class="arrt-content">
            <el-container>
              <el-header height="45px">
                <div class="attr-title">字段属性</div>
              </el-header>
              <el-main>
                <el-form label-position="top" label-width="80px" :model="formOption">
                  <el-form-item label="名称">
                    <el-input v-model="formOption.name" />
                  </el-form-item>
                </el-form>
              </el-main>
            </el-container>
          </el-aside>
        </el-container>
      </el-main>
      <el-footer>
        power by liangtao
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'
import guide from '@/utils/guide'
export default {
  name: 'CreateForm',
  components: {
    draggable
  },
  data() {
    return {
      myArray: [
        { id: 1, name: '单行文本' },
        { id: 2, name: '多行文本' },
        { id: 3, name: '计数器' },
        { id: 4, name: '单选框组' }
      ],
      selectIndex: 0,
      youArray: [],
      form: { },
      formOption: {
        name: ''
      }
    }
  },

  mounted() {
    this.$driver = new Driver({
      allowClose: false, // 禁止点击外部关闭
      doneBtnText: '完成', // 完成按钮标题
      closeBtnText: '关闭', // 关闭按钮标题
      stageBackground: '#fff', // 引导对话的背景色
      nextBtnText: '下一步', // 下一步按钮标题
      prevBtnText: '上一步' // 上一步按钮标题
    })
  },

  methods: {
    onStart() {

    },
    onEnd() {

    },
    addField(item) {
      if (this.youArray.length === 0) {
        this.youArray.splice(this.selectIndex, 0, item)
      } else {
        this.youArray.splice(this.selectIndex + 1, 0, item)
        this.selectIndex += 1
      }
      this.formOption.name = item.name
    },
    editField(item, index) {
      this.selectIndex = index
      this.formOption.name = item.name
    },
    copyItem(item, index) {
      this.youArray.splice(index, 0, item)
    },
    deleteItem(item, index) {
      this.youArray.splice(index, 1)
    },
    teachDrag() {
      this.$driver.defineSteps(guide)
      this.$driver.start()
    },
    clearList() {
      this.youArray = []
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
