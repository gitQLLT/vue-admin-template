<template>
  <div>
    <Test1>{{ parent }}</Test1>
  </div>
</template>

<script>
import Test1 from './test1.vue'
import _ from 'lodash'
export default {
  name: 'Test',
  components: {
    Test1
  },
  data() {
    return {
      parent: '我是父组件'
    }
  },

  mounted() {
    var initialize = _.once(() => { console.log(11) })
    initialize()
    initialize()
  },

  methods: {
    showChange(event) {
      console.log(event.target.value) // 将打印所选选项的值
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
