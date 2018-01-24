
<style lang="less" scoped>
.slides-text {

}
</style>

<template>
<div class="layer slides-text" :style="parsedStyle">{{ text }}</div>
</template>

<script>
import LayerMixin from './Layer'

export default {
  name: 'slides-text',
  mixins: [
    LayerMixin
  ],
  props: {
    text: String
  },
  data () {
    return {

    }
  },
  computed: {

  },
  methods: {

  }
}
</script>
