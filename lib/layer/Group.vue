
<style lang="less" scoped>
.slides-group {

}
</style>

<template>
<div class="layer slides-group" :style="parsedStyle">
  <component v-for="(layer, index) in children" :key="index"
    :is="layer.type + '-layer'" v-bind="layer" :progress="progress"
    :width="width" :height="height"></component>
</div>
</template>

<script>
import LayerMixin from './Layer'
import ImageLayer from './Image'
import VideoLayer from './Video'
import TextLayer from './Text'
import GroupLayer from './Group'

export default {
  name: 'slides-group',
  components: {
    ImageLayer,
    VideoLayer,
    TextLayer,
    GroupLayer
  },
  mixins: [
    LayerMixin
  ],
  props: {
    children: Array
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
