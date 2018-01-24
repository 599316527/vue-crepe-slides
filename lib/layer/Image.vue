
<style lang="less" scoped>
.slides-image {

}
</style>

<template>
<img class="layer slides-image" :src="image" :style="parsedStyle" />
</template>

<script>
import LayerMixin from './Layer'

export default {
  name: 'slides-image',
  mixins: [
    LayerMixin
  ],
  props: {
    image: String
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
